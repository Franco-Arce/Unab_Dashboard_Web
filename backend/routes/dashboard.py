from fastapi import APIRouter, Depends, Query
from typing import Optional
from routes.auth import require_auth
from cache import cache

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/kpis")
async def get_kpis(nivel: Optional[str] = Query(None), _user: str = Depends(require_auth)):
    data = await cache.get_all()
    if not nivel or nivel.upper() == "TODOS":
        totals = data.get("totals", {})
        return {
            "total_leads": data.get("total_leads", 0),
            "en_gestion": data.get("en_gestion", 0),
            "op_venta": data.get("op_venta", 0),
            "solicitados": totals.get("solicitados", 0),
            "admitidos": totals.get("admitidos", 0),
            "pagados": totals.get("pagados", 0),
            "metas": totals.get("metas", 0),
            "matriculados": totals.get("pagados", 0),
            "proceso_pago": data.get("proceso_pago", 0),
            "no_util_total": data.get("no_util_total", 0),
            "fecha_actualizacion": data.get("fecha_actualizacion", ""),
            "trends": data.get("trends", {})
        }
    
    # Filter and re-aggregate
    nivel = nivel.upper()
    programs = [p for p in data.get("merged_programs", []) if p.get("nivel") == nivel]
    
    total_leads = sum(p.get("leads", 0) for p in programs)
    en_gestion = sum(p.get("en_gestion", 0) for p in programs)
    op_venta = sum(p.get("op_venta", 0) for p in programs)
    solicitados = sum(p.get("solicitados", 0) for p in programs)
    admitidos = sum(p.get("admitidos", 0) for p in programs)
    pagados = sum(p.get("pagados", 0) for p in programs)
    metas = sum(p.get("meta", 0) for p in programs)
    proceso_pago = sum(p.get("proceso_pago", 0) for p in programs)
    no_util_total = sum(p.get("no_util", 0) for p in programs)

    return {
        "total_leads": total_leads,
        "en_gestion": en_gestion,
        "op_venta": op_venta,
        "solicitados": solicitados,
        "admitidos": admitidos,
        "pagados": pagados,
        "metas": metas,
        "matriculados": pagados,
        "proceso_pago": proceso_pago,
        "no_util_total": no_util_total,
        "fecha_actualizacion": data.get("fecha_actualizacion", ""),
        "trends": {} # Trends are complex to re-calc on the fly, keeping empty for filtered view
    }


@router.get("/funnel")
async def get_funnel(nivel: Optional[str] = Query(None), _user: str = Depends(require_auth)):
    data = await cache.get_all()
    
    if not nivel or nivel.upper() == "TODOS":
        funnel_data = data.get("funnel", [])
        total_leads = data.get("total_leads", 0)
    else:
        nivel = nivel.upper()
        programs = [p for p in data.get("merged_programs", []) if p.get("nivel") == nivel]
        total_leads = sum(p.get("leads", 0) for p in programs)
        en_gestion = sum(p.get("en_gestion", 0) for p in programs)
        op_venta = sum(p.get("op_venta", 0) for p in programs)
        proceso_pago = sum(p.get("proceso_pago", 0) for p in programs)
        pagados = sum(p.get("pagados", 0) for p in programs)
        
        funnel_data = [
            {"stage": "Total Leads", "value": total_leads, "color": "#f59e0b"},
            {"stage": "En Gestión", "value": en_gestion, "color": "#d97706"},
            {"stage": "Oportunidad de Venta", "value": op_venta, "color": "#ea580c"},
            {"stage": "Proceso Pago", "value": proceso_pago, "color": "#dc2626"},
            {"stage": "Matriculados", "value": pagados, "color": "#16a34a"},
        ]
    
    # Calculate percentages for safety
    for f in funnel_data:
        f["percent"] = round(f["value"] / total_leads * 100, 2) if total_leads else 0
        
    return funnel_data


@router.get("/admisiones")
async def get_admisiones(nivel: Optional[str] = Query(None), _user: str = Depends(require_auth)):
    data = await cache.get_all()
    merged = data.get("merged_programs", [])
    
    if nivel and nivel.upper() != "TODOS":
        nivel = nivel.upper()
        merged = [p for p in merged if p.get("nivel") == nivel]
        
        totals = {
            "solicitados": sum(p.get("solicitados", 0) for p in merged),
            "admitidos": sum(p.get("admitidos", 0) for p in merged),
            "pagados": sum(p.get("pagados", 0) for p in merged),
            "metas": sum(p.get("meta", 0) for p in merged),
        }
        return {"programas": merged, "totals": totals, "trends": {}}

    return {
        "programas": merged,
        "totals": data.get("totals", {}),
        "trends": data.get("trends", {}),
    }

@router.get("/estados")
async def get_estados(nivel: Optional[str] = Query(None), _user: str = Depends(require_auth)):
    data = await cache.get_all()
    merged = data.get("merged_programs", [])
    
    if nivel and nivel.upper() != "TODOS":
        nivel = nivel.upper()
        merged = [p for p in merged if p.get("nivel") == nivel]
        
        totals = {
            "solicitados": sum(p.get("solicitados", 0) for p in merged),
            "admitidos": sum(p.get("admitidos", 0) for p in merged),
            "pagados": sum(p.get("pagados", 0) for p in merged),
            "metas": sum(p.get("meta", 0) for p in merged),
        }
        return {"estados_by_programa": merged, "totals": totals, "trends": {}, "admitidos_status": {}, "estados_gestion": []}

    return {
        "estados_by_programa": merged,
        "totals": data.get("totals", {}),
        "trends": data.get("trends", {}),
        "admitidos_status": {},
        "estados_gestion": []
    }


@router.get("/no-util")
async def get_no_util(_user: str = Depends(require_auth)):
    data = await cache.get_all()
    no_util = data.get("no_util", [])
    total = data.get("no_util_total", 0)

    result = []
    for item in no_util:
        leads = item.get("leads", 0)
        result.append({
            "subcategoria": item.get("descripcion_sub", ""),
            "leads": leads,
            "leads_7d": item.get("leads_7d", 0),
            "leads_14d": item.get("leads_14d", 0),
            "porcentaje": round(leads / total * 100, 2) if total else 0,
        })

    return {"no_util": result, "no_util_total": total, "trends": data.get("trends", {})}


@router.get("/admitidos")
async def get_admitidos(_user: str = Depends(require_auth)):
    # Returns empty logic since fact_unab_sheet_admitidos is dropped
    return {
        "status": {},
        "by_programa": [],
        "motivos": [],
    }


@router.get("/leads")
async def get_leads(
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None),
    base: Optional[str] = Query(None),
    programa: Optional[str] = Query(None),
    nivel: Optional[str] = Query(None),
    _user: str = Depends(require_auth),
):
    from database import fetch_all, fetch_one
    from mapping import mapping
    
    where_clauses = ["1=1"]
    args = []
    
    if search:
        where_clauses.append(f"(txtnombreapellido ILIKE ${len(args)+1} OR emlmail ILIKE ${len(args)+1} OR teltelefono ILIKE ${len(args)+1})")
        args.append(f"%{search}%")
        
    if base:
        where_clauses.append(f"base = ${len(args)+1}")
        args.append(base)
        
    if programa:
        where_clauses.append(f"txtprogramainteres ILIKE ${len(args)+1}")
        args.append(f"%{programa}%")
        
    if nivel and nivel.upper() != "TODOS":
        target_nivel = nivel.upper()
        # Find all programs that belong to this level
        programs_of_level = [p for p, l in mapping.mapping.items() if l == target_nivel]
        if programs_of_level:
            placeholders = ",".join(f"${len(args)+i+1}" for i in range(len(programs_of_level)))
            where_clauses.append(f"txtprogramainteres IN ({placeholders})")
            args.extend(programs_of_level)
        
    where_sql = " AND ".join(where_clauses)
    
    count_query = f"SELECT COUNT(*) as total FROM dim_contactos WHERE {where_sql}"
    total_row = await fetch_one(count_query, *args)
    total = total_row["total"] if total_row else 0
    
    offset = (page - 1) * per_page
    data_query = f"""
        SELECT 
            idinterno, txtnombreapellido, emlmail, teltelefono, 
            feccreacionoportunidad, txtprogramainteres, base,
            descrip_subcat, ultima_mejor_subcat_string, cant_toques_call_crm, fecha_a_utilizar
        FROM dim_contactos
        WHERE {where_sql}
        ORDER BY fecha_a_utilizar DESC NULLS LAST
        LIMIT {per_page} OFFSET {offset}
    """
    
    rows = await fetch_all(data_query, *args)
    
    return {
        "data": rows,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/bases")
async def get_bases(_user: str = Depends(require_auth)):
    from database import fetch_all
    query = "SELECT DISTINCT base FROM dim_contactos WHERE base IS NOT NULL ORDER BY base"
    rows = await fetch_all(query)
    return [r["base"] for r in rows]
@router.get("/meta")
async def get_meta(_user: str = Depends(require_auth)):
    data = await cache.get_all()
    return {
        "fecha_actualizacion": data.get("fecha_actualizacion", ""),
        "last_refresh": cache.last_refresh.isoformat() if cache.last_refresh else None,
        "total_leads": data.get("total_leads", 0),
    }

@router.post("/refresh")
async def manual_refresh(_user: str = Depends(require_auth)):
    await cache.refresh()
    return {"status": "success", "last_refresh": cache.last_refresh.isoformat()}
