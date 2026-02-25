"""
In-memory cache with 1-hour TTL and change tracking for AI awareness.
Stores pre-computed dashboard data to avoid hitting PostgreSQL on every request.
"""
import asyncio
import json
import copy
import os
from datetime import datetime, timezone
from database import fetch_all, fetch_one
from mapping import mapping


class DashboardCache:
    def __init__(self, ttl_seconds: int = 3600):
        self.ttl = ttl_seconds
        self.data = {}
        self.last_refresh: datetime | None = None
        self.previous_snapshot: dict | None = None
        # Try to load persistent snapshot on boot
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        self.snapshot_file = os.path.join(backend_dir, "last_snapshot.json")
        
        if os.path.exists(self.snapshot_file):
            try:
                with open(self.snapshot_file, "r") as f:
                    self.previous_snapshot = json.load(f)
            except Exception as e:
                print(f"[Cache] Failed to load snapshot: {e}")
                
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
            # Save previous snapshot for change detection and persistent trends
            if self.data:
                self.previous_snapshot = copy.deepcopy(self.data)
                try:
                    # Filter out non-serializable elements (sometimes dates aren't enough)
                    # We save the baseline data to last_snapshot.json
                    snap_to_save = {
                        "total_leads": self.data.get("total_leads"),
                        "en_gestion": self.data.get("en_gestion"),
                        "op_venta": self.data.get("op_venta"),
                        "proceso_pago": self.data.get("proceso_pago"),
                        "no_util_total": self.data.get("no_util_total"),
                        "totals": self.data.get("totals"),
                    }
                    with open(self.snapshot_file, "w") as f:
                        json.dump(snap_to_save, f)
                except Exception as e:
                    print(f"[Cache] Could not save snapshot to file: {e}")

            data = {}

            # ── Get All Data in Parallel ──
            try:
                agg_task = fetch_all("SELECT * FROM agg_dim_contactos_leads")
                no_util_query = """
                    SELECT 
                        descrip_subcat AS descripcion_sub,
                        COUNT(*) AS leads,
                        SUM(CASE WHEN fecha_a_utilizar::timestamp >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) AS leads_7d,
                        SUM(CASE WHEN fecha_a_utilizar::timestamp >= NOW() - INTERVAL '14 days' THEN 1 ELSE 0 END) AS leads_14d
                    FROM dim_contactos
                    WHERE descrip_cat ILIKE '%no util%' OR descrip_cat ILIKE '%descarte%'
                    GROUP BY descrip_subcat
                    ORDER BY leads DESC
                """
                no_util_task = fetch_all(no_util_query)
                
                results = await asyncio.gather(agg_task, no_util_task)
                agg_rows = results[0]
                no_util_rows = results[1]
                data["no_util"] = [dict(r) for r in no_util_rows]
            except Exception as e:
                print(f"[Cache] Error during parallel fetch: {e}")
                # Try fallback or empty defaults if needed, but gather should fail together
                return 

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
            total_sol_var = 0
            total_adm_var = 0
            total_pag_var = 0
            
            latest_fecha = None
            latest_fecha_pos = None

            for r in agg_rows:
                # Use standard normalization: UPPER + TRIM
                prog = str(r.get("programa", "")).strip().upper()
                nivel = mapping.get_level(prog)
                area = mapping.get_area(prog)
                
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
                total_sol_var += _safe_int(r.get("solicitados_var"))
                total_adm_var += _safe_int(r.get("admitidos_var"))
                total_pag_var += _safe_int(r.get("pagados_var"))
                
                # Fetch dates to find latest
                if r.get("fecha"):
                    if latest_fecha is None or r.get("fecha") > latest_fecha:
                        latest_fecha = r.get("fecha")
                if r.get("fecha_pos"):
                    if latest_fecha_pos is None or r.get("fecha_pos") > latest_fecha_pos:
                        latest_fecha_pos = r.get("fecha_pos")
                
                merged_programs.append({
                    "programa": prog,
                    "nivel": nivel,
                    "area": area,
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
                "solicitados_var": total_sol_var,
                "admitidos_var": total_adm_var,
                "pagados_var": total_pag_var,
            }

            
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

            # Calculate actual update trends
            trends = {
                "total_leads": 0, "matriculados": 0, "en_gestion": 0, "pagados": 0,
                "op_venta": 0, "proceso_pago": 0, "no_util": 0
            }
            
            def calc_trend(prev_v, curr_v):
                if not prev_v or prev_v == 0: return 0.0
                return round(((curr_v - prev_v) / prev_v) * 100, 1)

            if self.previous_snapshot:
                prev = self.previous_snapshot
                trends["total_leads"] = calc_trend(prev.get("total_leads", 0), data["total_leads"])
                trends["en_gestion"] = calc_trend(prev.get("en_gestion", 0), data["en_gestion"])
                trends["op_venta"] = calc_trend(prev.get("op_venta", 0), data["op_venta"])
                trends["proceso_pago"] = calc_trend(prev.get("proceso_pago", 0), data["proceso_pago"])
                trends["no_util"] = calc_trend(prev.get("no_util_total", 0), data["no_util_total"])
                
                prev_totals = prev.get("totals", {})
                trends["matriculados"] = calc_trend(prev_totals.get("pagados", 0), data["totals"]["pagados"])
                trends["pagados"] = calc_trend(prev_totals.get("pagados", 0), data["totals"]["pagados"])
            elif data.get("totals"):
                # Fallback to DB variance columns if no snapshot exists
                t = data["totals"]
                # For Pagados/Matriculados we have _var
                trends["matriculados"] = calc_trend(t.get("pagados", 0) - t.get("pagados_var", 0), t.get("pagados", 0))
                trends["pagados"] = trends["matriculados"]
                # Others don't have _var, they stay at 0 until next refresh
            
            data["trends"] = trends
            
            self.data = data
            self.last_refresh = datetime.now(timezone.utc)
            print(f"[Cache] Refreshed at {self.last_refresh.isoformat()} — {data.get('total_leads', 0)} leads loaded")
            
            # Diagnostic logging for refresh
            if data:
                merged = data.get("merged_programs", [])
                levels = {}
                for p in merged:
                    lvl = p.get("nivel", "MISSING")
                    levels[lvl] = levels.get(lvl, 0) + 1
                print(f"[Cache] refresh: {len(merged)} programs, levels: {levels}")


    async def get(self, key: str, default=None):
        if self.is_stale:
            await self.refresh()
        return self.data.get(key, default)

    async def get_all(self) -> dict:
        if self.is_stale:
            await self.refresh()
        
        # Diagnostic logging
        if self.data:
            merged = self.data.get("merged_programs", [])
            levels = {}
            for p in merged:
                lvl = p.get("nivel", "MISSING")
                levels[lvl] = levels.get(lvl, 0) + 1
            print(f"[Cache] get_all: {len(merged)} programs, levels: {levels}")
            
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
