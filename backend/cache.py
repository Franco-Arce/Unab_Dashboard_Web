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

            # ── Get All Data From Single Table ──
            agg_rows = await fetch_all("SELECT * FROM agg_dim_contactos_leads")
            
            merged_programs = []
            
            total_leads = 0
            total_en_gestion = 0
            total_op_venta = 0
            total_proceso_pago = 0
            total_no_util = 0

            total_sol = 0
            total_adm = 0
            total_pag = 0
            total_meta = 0
            total_sol_25 = 0
            total_adm_25 = 0
            total_pag_25 = 0
            
            latest_fecha = None
            latest_fecha_pos = None

            for r in agg_rows:
                prog = str(r.get("programa", "")).strip().upper()
                
                # Metric fields
                leads = _safe_int(r.get("leads"))
                leads_no_util = _safe_int(r.get("leads_no_util"))
                op_venta = _safe_int(r.get("leads_op_venta"))
                proceso_pago = _safe_int(r.get("leads_proc_pago"))
                en_gestion = _safe_int(r.get("leads_en_gestion"))
                toques_prom = 0.0
                
                # Dimension totals
                total_leads += leads
                total_en_gestion += en_gestion
                total_op_venta += op_venta
                total_proceso_pago += proceso_pago
                total_no_util += leads_no_util

                # Admission fields
                sol = _safe_int(r.get("solicitados"))
                adm_val = _safe_int(r.get("admitidos"))
                pag = _safe_int(r.get("pagados"))
                meta = _safe_int(r.get("metas"))
                
                sol_25 = _safe_int(r.get("solicitados_aa"))
                adm_25 = _safe_int(r.get("admitidos_aa"))
                pag_25 = _safe_int(r.get("pagados_aa"))

                total_sol += sol
                total_adm += adm_val
                total_pag += pag
                total_meta += meta
                
                total_sol_25 += sol_25
                total_adm_25 += adm_25
                total_pag_25 += pag_25
                
                # Fetch dates to find latest
                if r.get("fecha"):
                    if latest_fecha is None or r.get("fecha") > latest_fecha:
                        latest_fecha = r.get("fecha")
                if r.get("fecha_pos"):
                    if latest_fecha_pos is None or r.get("fecha_pos") > latest_fecha_pos:
                        latest_fecha_pos = r.get("fecha_pos")
                
                merged_programs.append({
                    "programa": prog,
                    "leads": leads,
                    "en_gestion": en_gestion,
                    "no_util": leads_no_util,
                    "op_venta": op_venta,
                    "proceso_pago": proceso_pago,
                    "toques_prom": toques_prom,
                    "solicitados": sol,
                    "admitidos": adm_val,
                    "pagados": pag,
                    "meta": meta,
                    "solicitados_25": sol_25,
                    "admitidos_25": adm_25,
                    "pagados_25": pag_25,
                    "solicitados_var": _safe_int(r.get("solicitados_var")),
                    "admitidos_var": _safe_int(r.get("admitidos_var")),
                    "pagados_var": _safe_int(r.get("pagados_var"))
                })
                
            data["merged_programs"] = merged_programs
            
            # KPI Totals
            data["total_leads"] = total_leads
            data["en_gestion"] = total_en_gestion
            data["op_venta"] = total_op_venta
            data["proceso_pago"] = total_proceso_pago
            data["no_util_total"] = total_no_util

            data["totals"] = {
                "solicitados": total_sol,
                "admitidos": total_adm,
                "pagados": total_pag,
                "metas": total_meta,
                "solicitados_25": total_sol_25,
                "admitidos_25": total_adm_25,
                "pagados_25": total_pag_25,
            }

            # ── Subcategorias No Util ──
            try:
                no_util_rows = await fetch_all("SELECT descripcion_sub, leads_no_utiles as cnt FROM no_utiles ORDER BY cnt DESC")
                data["no_util"] = [dict(r) for r in no_util_rows]
            except Exception as e:
                print(f"[Cache] Error fetching no_utiles: {e}")
                data["no_util"] = []
            
            # Funnel for the chart
            data["funnel"] = [
                {"stage": "Total Leads", "value": data["total_leads"], "color": "#f59e0b"},
                {"stage": "En Gestión", "value": data["en_gestion"], "color": "#d97706"},
                {"stage": "Oportunidad de Venta", "value": data["op_venta"], "color": "#ea580c"},
                {"stage": "Proceso Pago", "value": data["proceso_pago"], "color": "#dc2626"},
                {"stage": "Matriculados", "value": total_pag, "color": "#16a34a"}, 
            ]

            # ── Last update date ──
            if latest_fecha_pos:
                data["fecha_actualizacion"] = latest_fecha_pos.strftime("%d/%m/%Y %H:%M")
            elif latest_fecha:
                data["fecha_actualizacion"] = latest_fecha.strftime("%d/%m/%Y %H:%M")
            else:
                data["fecha_actualizacion"] = datetime.now().strftime("%d/%m/%Y %H:%M")

            self.data = data
            self.last_refresh = datetime.now(timezone.utc)
            print(f"[Cache] Refreshed at {self.last_refresh.isoformat()} — {data.get('total_leads', 0)} leads loaded")

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

def _safe_float(val) -> float:
    """Safely convert a value to float, returning 0.0 for None/empty/non-numeric."""
    if val is None or val == "" or val == "None":
        return 0.0
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0.0


# Global singleton
cache = DashboardCache(ttl_seconds=3600)
