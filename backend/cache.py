"""
In-memory cache with 1-hour TTL and change tracking for AI awareness.
Stores pre-computed dashboard data to avoid hitting PostgreSQL on every request.
"""
import asyncio
import json
import copy
from datetime import datetime, timezone
from database import fetch_all, fetch_one


class DashboardCache:
    def __init__(self, ttl_seconds: int = 3600):
        self.ttl = ttl_seconds
        self.data = {}
        self.last_refresh: datetime | None = None
        self.previous_snapshot: dict | None = None
        self._lock = asyncio.Lock()

    @property
    def is_stale(self) -> bool:
        if self.last_refresh is None:
            return True
        elapsed = (datetime.now(timezone.utc) - self.last_refresh).total_seconds()
        return elapsed >= self.ttl

    async def refresh(self):
        """Pull fresh data from PostgreSQL and store in memory."""
        async with self._lock:
            # Save previous snapshot for change detection
            if self.data:
                self.previous_snapshot = copy.deepcopy(self.data)

            data = {}

            # ── KPIs from dim_contactos ──
            kpi_row = await fetch_one("""
                SELECT
                    COUNT(*) AS total_leads,
                    COUNT(*) FILTER (WHERE ultima_mejor_subcat_string IS NOT NULL
                                     AND ultima_mejor_subcat_string != '') AS en_gestion
                FROM dim_contactos
            """)
            data["total_leads"] = kpi_row["total_leads"]
            data["en_gestion"] = kpi_row["en_gestion"]

            # ── Admisiones from fact_unab_sheet2 (consolidated view) ──
            admisiones = await fetch_all("""
                SELECT programa, metas, solicitados, admitidos, pagados,
                       solicitados_aa, admitidos_aa, pagados_aa,
                       solicitados_var, admitidos_var, pagados_var,
                       fecha, fecha_pos, anio
                FROM fact_unab_sheet2
                WHERE anio = '2026'
                ORDER BY programa
            """)
            data["admisiones"] = [_serialize_row(r) for r in admisiones]

            # ── Totals from admisiones ──
            total_sol = sum(_safe_int(r.get("solicitados")) for r in admisiones)
            total_adm = sum(_safe_int(r.get("admitidos")) for r in admisiones)
            total_pag = sum(_safe_int(r.get("pagados")) for r in admisiones)
            total_meta = sum(_safe_int(r.get("metas")) for r in admisiones)
            data["totals"] = {
                "solicitados": total_sol,
                "admitidos": total_adm,
                "pagados": total_pag,
                "metas": total_meta,
            }

            # ── Admitidos status from fact_unab_sheet_admitidos ──
            admitidos_status = await fetch_one("""
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN matricula = '1' THEN 1 ELSE 0 END) AS matriculados,
                    SUM(CASE WHEN proceso_de_pago = '1' THEN 1 ELSE 0 END) AS proceso_pago,
                    SUM(CASE WHEN pendiente_firmas = '1' THEN 1 ELSE 0 END) AS pendiente_firmas,
                    SUM(CASE WHEN declinado = '1' THEN 1 ELSE 0 END) AS declinados,
                    SUM(CASE WHEN no_contesta = '1' THEN 1 ELSE 0 END) AS no_contesta
                FROM fact_unab_sheet_admitidos
            """)
            data["admitidos_status"] = _serialize_row(admitidos_status)

            # ── Admitidos by programa ──
            admitidos_by_prog = await fetch_all("""
                SELECT programa,
                    COUNT(*) AS total,
                    SUM(CASE WHEN matricula = '1' THEN 1 ELSE 0 END) AS matriculados,
                    SUM(CASE WHEN proceso_de_pago = '1' THEN 1 ELSE 0 END) AS proceso_pago,
                    SUM(CASE WHEN declinado = '1' THEN 1 ELSE 0 END) AS declinados,
                    SUM(CASE WHEN no_contesta = '1' THEN 1 ELSE 0 END) AS no_contesta
                FROM fact_unab_sheet_admitidos
                GROUP BY programa
                ORDER BY total DESC
            """)
            data["admitidos_by_programa"] = [_serialize_row(r) for r in admitidos_by_prog]

            # ── Admitidos motivo (no útil reasons) ──
            admitidos_motivo = await fetch_all("""
                SELECT motivo, COUNT(*) AS cnt
                FROM fact_unab_sheet_admitidos
                WHERE motivo IS NOT NULL AND motivo != ''
                      AND motivo NOT LIKE '%%REF%%'
                GROUP BY motivo
                ORDER BY cnt DESC
            """)
            data["admitidos_motivo"] = [_serialize_row(r) for r in admitidos_motivo]

            # ── Estados de gestión from dim_subcategorias + fact_contactos_subcategorias ──
            estados_gestion = await fetch_all("""
                SELECT
                    ds.gestion,
                    ds.proceso,
                    COUNT(*) AS total
                FROM fact_contactos_subcategorias fcs
                JOIN dim_subcategorias ds ON fcs.subcategoria::int = ds.subcategoria
                WHERE ds.gestion IS NOT NULL
                GROUP BY ds.gestion, ds.proceso
                ORDER BY total DESC
            """)
            data["estados_gestion"] = [_serialize_row(r) for r in estados_gestion]

            # ── No útil subcategories ──
            no_util = await fetch_all("""
                SELECT
                    ds.descripcion_sub,
                    COUNT(*) AS cnt
                FROM fact_contactos_subcategorias fcs
                JOIN dim_subcategorias ds ON fcs.subcategoria::int = ds.subcategoria
                WHERE ds.estado = 'No Útil'
                GROUP BY ds.descripcion_sub
                ORDER BY cnt DESC
            """)
            data["no_util"] = [_serialize_row(r) for r in no_util]

            # ── Total no util count ──
            no_util_total = await fetch_one("""
                SELECT COUNT(*) AS total
                FROM fact_contactos_subcategorias fcs
                JOIN dim_subcategorias ds ON fcs.subcategoria::int = ds.subcategoria
                WHERE ds.estado = 'No Útil'
            """)
            data["no_util_total"] = no_util_total["total"] if no_util_total else 0

            # ── Funnel: Leads → En Gestión → Op. Venta → Proceso Pago ──
            funnel_data = await fetch_all("""
                SELECT
                    ds.proceso,
                    COUNT(DISTINCT fcs.idinterno) AS total
                FROM fact_contactos_subcategorias fcs
                JOIN dim_subcategorias ds ON fcs.subcategoria::int = ds.subcategoria
                WHERE ds.proceso IS NOT NULL
                GROUP BY ds.proceso, ds.proceso_number
                ORDER BY ds.proceso_number
            """)
            data["funnel"] = [_serialize_row(r) for r in funnel_data]

            # ── Estados breakdown by programa (for Estados page) ──
            estados_by_programa = await fetch_all("""
                SELECT
                    fcs.txtprogramainteres AS programa,
                    COUNT(*) AS leads,
                    COUNT(*) FILTER (WHERE ds.gestion IS NOT NULL) AS en_gestion,
                    COUNT(*) FILTER (WHERE ds.estado = 'No Útil') AS no_util,
                    COUNT(*) FILTER (WHERE ds.proceso = 'Oportunidad de Venta') AS op_venta,
                    COUNT(*) FILTER (WHERE ds.proceso = 'Proceso Pago') AS proceso_pago
                FROM fact_contactos_subcategorias fcs
                JOIN dim_subcategorias ds ON fcs.subcategoria::int = ds.subcategoria
                WHERE fcs.txtprogramainteres IS NOT NULL AND fcs.txtprogramainteres != ''
                GROUP BY fcs.txtprogramainteres
                ORDER BY leads DESC
            """)
            data["estados_by_programa"] = [_serialize_row(r) for r in estados_by_programa]

            # ── Leads count for pagination info ──
            leads_count = await fetch_one("SELECT COUNT(*) AS total FROM dim_contactos")
            data["leads_total"] = leads_count["total"] if leads_count else 0

            # ── Last update date from fact_unab_sheet2 ──
            fecha_row = await fetch_one("""
                SELECT MAX(fecha_pos) AS fecha_pos, MAX(fecha) AS fecha
                FROM fact_unab_sheet2
            """)
            if fecha_row and fecha_row.get("fecha_pos"):
                data["fecha_actualizacion"] = fecha_row["fecha_pos"].strftime("%d/%m/%Y")
            elif fecha_row and fecha_row.get("fecha"):
                data["fecha_actualizacion"] = fecha_row["fecha"].strftime("%d/%m/%Y")
            else:
                data["fecha_actualizacion"] = datetime.now().strftime("%d/%m/%Y")

            self.data = data
            self.last_refresh = datetime.now(timezone.utc)
            print(f"[Cache] Refreshed at {self.last_refresh.isoformat()} — {data['total_leads']} leads loaded")

    async def get(self, key: str, default=None):
        if self.is_stale:
            await self.refresh()
        return self.data.get(key, default)

    async def get_all(self) -> dict:
        if self.is_stale:
            await self.refresh()
        return self.data

    def get_changes_summary(self) -> str:
        """Compare current vs previous snapshot for AI context."""
        if not self.previous_snapshot or not self.data:
            return "No hay datos de comparación disponibles (primera carga)."

        changes = []
        prev = self.previous_snapshot
        curr = self.data

        # Compare totals
        prev_totals = prev.get("totals", {})
        curr_totals = curr.get("totals", {})
        for key in ["solicitados", "admitidos", "pagados"]:
            prev_val = prev_totals.get(key, 0)
            curr_val = curr_totals.get(key, 0)
            diff = curr_val - prev_val
            if diff != 0:
                direction = "aumentaron" if diff > 0 else "disminuyeron"
                changes.append(f"- {key.capitalize()} {direction} de {prev_val} a {curr_val} ({'+' if diff > 0 else ''}{diff})")

        # Compare total leads
        prev_leads = prev.get("total_leads", 0)
        curr_leads = curr.get("total_leads", 0)
        diff_leads = curr_leads - prev_leads
        if diff_leads != 0:
            changes.append(f"- Total de leads: {prev_leads} → {curr_leads} ({'+' if diff_leads > 0 else ''}{diff_leads})")

        # Compare matriculados
        prev_mat = prev.get("admitidos_status", {}).get("matriculados", 0)
        curr_mat = curr.get("admitidos_status", {}).get("matriculados", 0)
        diff_mat = _safe_int(curr_mat) - _safe_int(prev_mat)
        if diff_mat != 0:
            changes.append(f"- Matriculados: {prev_mat} → {curr_mat} ({'+' if diff_mat > 0 else ''}{diff_mat})")

        if not changes:
            return "Sin cambios significativos desde la última actualización."

        return "Cambios desde la última actualización:\n" + "\n".join(changes)


def _safe_int(val) -> int:
    """Safely convert a value to int, returning 0 for None/empty/non-numeric."""
    if val is None or val == "" or val == "None":
        return 0
    try:
        return int(val)
    except (ValueError, TypeError):
        return 0


def _serialize_row(row: dict) -> dict:
    """Convert a row dict so all values are JSON-serializable."""
    result = {}
    for k, v in row.items():
        if isinstance(v, datetime):
            result[k] = v.isoformat()
        else:
            result[k] = v
    return result


# Global singleton
cache = DashboardCache(ttl_seconds=3600)
