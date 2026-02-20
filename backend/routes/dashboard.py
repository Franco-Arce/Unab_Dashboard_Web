from fastapi import APIRouter, Depends, Query
from typing import Optional
from routes.auth import require_auth
from cache import cache
from database import fetch_all

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/kpis")
async def get_kpis(_user: str = Depends(require_auth)):
    data = await cache.get_all()
    totals = data.get("totals", {})
    admitidos = data.get("admitidos_status", {})

    total_leads = data.get("total_leads", 0)
    matriculados = int(admitidos.get("matriculados", 0) or 0)

    return {
        "total_leads": total_leads,
        "en_gestion": data.get("en_gestion", 0),
        "solicitados": totals.get("solicitados", 0),
        "admitidos": totals.get("admitidos", 0),
        "pagados": totals.get("pagados", 0),
        "metas": totals.get("metas", 0),
        "matriculados": matriculados,
        "proceso_pago": int(admitidos.get("proceso_pago", 0) or 0),
        "no_util_total": data.get("no_util_total", 0),
        "fecha_actualizacion": data.get("fecha_actualizacion", ""),
    }


@router.get("/funnel")
async def get_funnel(_user: str = Depends(require_auth)):
    data = await cache.get_all()
    total_leads = data.get("total_leads", 0)
    funnel_raw = data.get("funnel", [])
    admitidos = data.get("admitidos_status", {})

    # Build funnel stages
    en_gestion = data.get("en_gestion", 0)
    op_venta = 0
    proceso_pago = 0
    for item in funnel_raw:
        proc = item.get("proceso", "")
        if proc == "Oportunidad de Venta":
            op_venta = item.get("total", 0)
        elif proc == "Proceso Pago":
            proceso_pago = item.get("total", 0)

    matriculados = int(admitidos.get("matriculados", 0) or 0)

    return [
        {"stage": "Total Leads", "value": total_leads, "color": "#f59e0b"},
        {"stage": "En Gestión", "value": en_gestion, "color": "#d97706",
         "percent": round(en_gestion / total_leads * 100, 2) if total_leads else 0},
        {"stage": "Oportunidad de Venta", "value": op_venta, "color": "#ea580c",
         "percent": round(op_venta / total_leads * 100, 2) if total_leads else 0},
        {"stage": "Proceso Pago", "value": proceso_pago, "color": "#dc2626",
         "percent": round(proceso_pago / total_leads * 100, 2) if total_leads else 0},
        {"stage": "Matriculados", "value": matriculados, "color": "#16a34a",
         "percent": round(matriculados / total_leads * 100, 2) if total_leads else 0},
    ]


@router.get("/admisiones")
async def get_admisiones(_user: str = Depends(require_auth)):
    data = await cache.get_all()
    admisiones = data.get("admisiones", [])
    totals = data.get("totals", {})
    return {
        "programas": admisiones,
        "totals": totals,
    }


@router.get("/estados")
async def get_estados(_user: str = Depends(require_auth)):
    data = await cache.get_all()
    return {
        "estados_gestion": data.get("estados_gestion", []),
        "estados_by_programa": data.get("estados_by_programa", []),
        "admitidos_status": data.get("admitidos_status", {}),
        "totals": data.get("totals", {}),
    }


@router.get("/no-util")
async def get_no_util(_user: str = Depends(require_auth)):
    data = await cache.get_all()
    no_util = data.get("no_util", [])
    total = data.get("no_util_total", 0)

    result = []
    for item in no_util:
        cnt = item.get("cnt", 0)
        result.append({
            "subcategoria": item.get("descripcion_sub", ""),
            "leads": cnt,
            "porcentaje": round(cnt / total * 100, 2) if total else 0,
        })

    return {"subcategorias": result, "total": total}


@router.get("/admitidos")
async def get_admitidos(_user: str = Depends(require_auth)):
    data = await cache.get_all()
    return {
        "status": data.get("admitidos_status", {}),
        "by_programa": data.get("admitidos_by_programa", []),
        "motivos": data.get("admitidos_motivo", []),
    }


@router.get("/leads")
async def get_leads(
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None),
    base: Optional[str] = Query(None),
    programa: Optional[str] = Query(None),
    _user: str = Depends(require_auth),
):
    # Build query with filters - direct from DB for pagination
    conditions = []
    params = []
    idx = 1

    if search:
        conditions.append(f"""(
            LOWER(txtnombreapellido) LIKE LOWER(${idx})
            OR LOWER(emlmail) LIKE LOWER(${idx})
            OR teltelefono LIKE ${idx}
        )""")
        params.append(f"%{search}%")
        idx += 1

    if base:
        conditions.append(f"base = ${idx}")
        params.append(base)
        idx += 1

    if programa:
        conditions.append(f"txtprogramainteres = ${idx}")
        params.append(programa)
        idx += 1

    where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""

    # Count
    count_query = f"SELECT COUNT(*) AS total FROM dim_contactos {where_clause}"
    from database import fetch_one
    count_row = await fetch_one(count_query, *params)
    total = count_row["total"] if count_row else 0

    # Fetch page
    offset = (page - 1) * per_page
    data_query = f"""
        SELECT idinterno, txtnombreapellido, emlmail, teltelefono,
               txtprogramainteres, base, txtutmmedium,
               fecha_a_utilizar, cant_toques_call_crm,
               ultima_mejor_subcat_string, descrip_subcat
        FROM dim_contactos
        {where_clause}
        ORDER BY fecha_a_utilizar DESC NULLS LAST
        LIMIT ${idx} OFFSET ${idx + 1}
    """
    params.extend([per_page, offset])
    rows = await fetch_all(data_query, *params)

    return {
        "data": rows,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/meta")
async def get_meta(_user: str = Depends(require_auth)):
    data = await cache.get_all()
    return {
        "fecha_actualizacion": data.get("fecha_actualizacion", ""),
        "last_refresh": cache.last_refresh.isoformat() if cache.last_refresh else None,
        "total_leads": data.get("total_leads", 0),
    }
