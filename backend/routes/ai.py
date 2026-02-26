import os
import json
import httpx
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from routes.auth import require_auth
from cache import cache

router = APIRouter(prefix="/api/ai", tags=["ai"])

MODEL = "gpt-4o-mini"
URL = "https://api.openai.com/v1/chat/completions"

LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ai_usage.log")

def log_ai(message: str):
    """Write log with timestamp to a file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {message}\n")

async def _openai_chat(messages: list, temperature: float = 0.3, max_tokens: int = 1200) -> str:
    """Call OpenAI API."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise Exception("OPENAI_API_KEY no configurada")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
            timeout=30.0,
        )
        if resp.status_code != 200:
            err_body = resp.text
            raise Exception(f"OpenAI API Error {resp.status_code}: {err_body}")

        data = resp.json()
        return data["choices"][0]["message"]["content"]


def _pct(num, den):
    """Safe percentage calculation."""
    if not den or den == 0:
        return 0.0
    return round(num / den * 100, 1)

def _diff(curr, prev):
    """Signed diff string."""
    d = (curr or 0) - (prev or 0)
    return f"{'+' if d >= 0 else ''}{d}"


def _build_no_util_context(data: dict, prev: dict) -> str:
    """Build No Util page-specific context for AI."""
    total_leads_curr = data.get("total_leads", 0)
    no_util_curr = data.get("no_util_total", 0)
    pct_no_util_curr = _pct(no_util_curr, total_leads_curr)

    total_leads_prev = (prev or {}).get("total_leads", 0)
    no_util_prev = (prev or {}).get("no_util_total", 0)
    pct_no_util_prev = _pct(no_util_prev, total_leads_prev)

    # Motivos current vs previous
    curr_motivos = {m["descripcion_sub"]: m["leads"] for m in data.get("no_util", [])}
    prev_motivos = {m.get("descripcion_sub", ""): m.get("leads", 0) for m in (prev or {}).get("no_util", [])}

    motivo_changes = []
    for motivo, val in curr_motivos.items():
        prev_val = prev_motivos.get(motivo, 0)
        if val != prev_val:
            motivo_changes.append(f"  - '{motivo}': {prev_val} → {val} ({_diff(val, prev_val)})")

    ctx = {
        "pagina": "NO ÚTIL",
        "total_leads": total_leads_curr,
        "leads_no_utiles_actual": no_util_curr,
        "pct_no_utiles_actual": f"{pct_no_util_curr}%",
        "leads_no_utiles_actualizacion_anterior": no_util_prev,
        "pct_no_utiles_actualizacion_anterior": f"{pct_no_util_prev}%",
        "variacion_pct_no_utiles": f"{_diff(round(pct_no_util_curr * 10), round(pct_no_util_prev * 10))} p.p.",
        "top_motivos_actuales": [
            {"motivo": m["descripcion_sub"], "leads": m["leads"]}
            for m in sorted(data.get("no_util", []), key=lambda x: -x.get("leads", 0))[:7]
        ],
        "cambios_en_motivos_vs_actualizacion_anterior": motivo_changes if motivo_changes else ["Sin cambios detectados"],
    }
    return json.dumps(ctx, default=str, ensure_ascii=False)


def _build_admisiones_context(data: dict, prev: dict) -> str:
    """Build Admisiones page-specific context with funnel and bottleneck analysis."""
    totals = data.get("totals", {})
    prev_totals = (prev or {}).get("totals", {})

    sol = totals.get("solicitados", 0)
    adm = totals.get("admitidos", 0)
    pag = totals.get("pagados", 0)
    meta = totals.get("metas", 0)

    prev_sol = prev_totals.get("solicitados", 0)
    prev_adm = prev_totals.get("admitidos", 0)
    prev_pag = prev_totals.get("pagados", 0)

    # Conversion ratios
    conv_sol_adm = _pct(adm, sol)
    conv_adm_pag = _pct(pag, adm)
    conv_sol_pag = _pct(pag, sol)

    prev_conv_sol_adm = _pct(prev_adm, prev_sol)
    prev_conv_adm_pag = _pct(prev_pag, prev_adm)

    # Bottleneck: which stage loses more %
    perdida_sol_adm = round(100 - conv_sol_adm, 1)
    perdida_adm_pag = round(100 - conv_adm_pag, 1)
    cuello = "Solicitados → Admitidos" if perdida_sol_adm >= perdida_adm_pag else "Admitidos → Pagados"

    ctx = {
        "pagina": "ADMISIONES",
        "meta_total": meta,
        "funnel_actual": {
            "solicitados": sol,
            "admitidos": adm,
            "pagados": pag,
        },
        "funnel_actualizacion_anterior": {
            "solicitados": prev_sol,
            "admitidos": prev_adm,
            "pagados": prev_pag,
        },
        "variaciones_vs_anterior": {
            "solicitados": _diff(sol, prev_sol),
            "admitidos": _diff(adm, prev_adm),
            "pagados": _diff(pag, prev_pag),
        },
        "tasas_conversion_actuales": {
            "solicitados_a_admitidos": f"{conv_sol_adm}%",
            "admitidos_a_pagados": f"{conv_adm_pag}%",
            "solicitados_a_pagados_total": f"{conv_sol_pag}%",
        },
        "tasas_conversion_actualizacion_anterior": {
            "solicitados_a_admitidos": f"{prev_conv_sol_adm}%",
            "admitidos_a_pagados": f"{prev_conv_adm_pag}%",
        },
        "perdida_en_etapas": {
            "perdida_solicitados_a_admitidos": f"{perdida_sol_adm}%",
            "perdida_admitidos_a_pagados": f"{perdida_adm_pag}%",
        },
        "cuello_de_botella_detectado": cuello,
        "avance_vs_meta": f"{_pct(pag, meta)}% de la meta cumplida ({pag}/{meta})",
    }
    return json.dumps(ctx, default=str, ensure_ascii=False)


def _build_estados_context(data: dict, prev: dict) -> str:
    """Build Estados page-specific context with full funnel drop-off analysis."""
    total_leads = data.get("total_leads", 0)
    en_gestion = data.get("en_gestion", 0)
    op_venta = data.get("op_venta", 0)
    proceso_pago = data.get("proceso_pago", 0)
    pagados = data.get("totals", {}).get("pagados", 0)

    prev_d = prev or {}
    prev_leads = prev_d.get("total_leads", 0)
    prev_gestion = prev_d.get("en_gestion", 0)
    prev_op = prev_d.get("op_venta", 0)
    prev_proc = prev_d.get("proceso_pago", 0)
    prev_pag = prev_d.get("totals", {}).get("pagados", 0)

    # Drop-off between each funnel stage
    drop_gestion = _pct(total_leads - en_gestion, total_leads)
    drop_op = _pct(en_gestion - op_venta, en_gestion)
    drop_proc = _pct(op_venta - proceso_pago, op_venta)
    drop_pag = _pct(proceso_pago - pagados, proceso_pago)

    # Find the biggest drop-off stage
    stages = [
        ("Total Leads → En Gestión", drop_gestion),
        ("En Gestión → Op. de Venta", drop_op),
        ("Op. de Venta → Proceso Pago", drop_proc),
        ("Proceso Pago → Pagados", drop_pag),
    ]
    mayor_perdida = max(stages, key=lambda x: x[1])

    ctx = {
        "pagina": "ESTADOS / EMBUDO",
        "embudo_actual": {
            "total_leads": total_leads,
            "en_gestion": en_gestion,
            "op_venta": op_venta,
            "proceso_pago": proceso_pago,
            "pagados": pagados,
        },
        "embudo_actualizacion_anterior": {
            "total_leads": prev_leads,
            "en_gestion": prev_gestion,
            "op_venta": prev_op,
            "proceso_pago": prev_proc,
            "pagados": prev_pag,
        },
        "variaciones_vs_anterior": {
            "total_leads": _diff(total_leads, prev_leads),
            "en_gestion": _diff(en_gestion, prev_gestion),
            "op_venta": _diff(op_venta, prev_op),
            "proceso_pago": _diff(proceso_pago, prev_proc),
            "pagados": _diff(pagados, prev_pag),
        },
        "tasas_conversion_por_etapa": {
            "total_a_gestion": f"{_pct(en_gestion, total_leads)}%",
            "gestion_a_op_venta": f"{_pct(op_venta, en_gestion)}%",
            "op_venta_a_proceso_pago": f"{_pct(proceso_pago, op_venta)}%",
            "proceso_pago_a_pagados": f"{_pct(pagados, proceso_pago)}%",
        },
        "perdida_por_etapa_pct": {
            "leads_que_no_pasan_a_gestion": f"{drop_gestion}%",
            "gestion_que_no_pasa_a_op_venta": f"{drop_op}%",
            "op_venta_que_no_pasa_a_proceso_pago": f"{drop_proc}%",
            "proceso_pago_que_no_se_pagan": f"{drop_pag}%",
        },
        "etapa_con_mayor_perdida": f"{mayor_perdida[0]} ({mayor_perdida[1]}% de pérdida)",
        "conversion_total_leads_a_pagados": f"{_pct(pagados, total_leads)}%",
    }
    return json.dumps(ctx, default=str, ensure_ascii=False)


def _build_generic_context(data: dict, prev: dict) -> str:
    """Generic context for overview or unknown pages."""
    change_summary = cache.get_changes_summary()
    ctx = {
        "kpis": {
            "total_leads": data.get("total_leads"),
            "en_gestion": data.get("en_gestion"),
            "solicitados": data.get("totals", {}).get("solicitados"),
            "admitidos": data.get("totals", {}).get("admitidos"),
            "pagados": data.get("totals", {}).get("pagados"),
            "no_util_total": data.get("no_util_total"),
        },
        "resumen_cambios_ultima_hora": change_summary,
        "top_programas": data.get("admisiones", [])[:8],
        "fecha_actualizacion": data.get("fecha_actualizacion"),
    }
    return json.dumps(ctx, default=str, ensure_ascii=False)


# ── Page-specific system prompts ──────────────────────────────────────────────

_PROMPT_NO_UTIL = (
    "Eres un analista de datos de UNAB especializado en calidad de leads. "
    "Se te proporcionan datos de la página NO ÚTIL del dashboard. "
    "Genera exactamente 4 insights breves, accionables y específicos. OBLIGATORIO incluir:\n"
    "1. Comparación del % de leads no útiles ACTUAL vs la actualización ANTERIOR (¿subió o bajó?).\n"
    "2. Análisis de si hubo cambios en los motivos de no utilidad (¿apareció o creció algún motivo nuevo?).\n"
    "3. El motivo de descarte principal y qué acción concreta se puede tomar.\n"
    "4. Un cuarto insight relevante adicional.\n"
    "Formato JSON: [{\"icon\": \"trending_up|trending_down|alert|star\", \"title\": \"TÍTULO EN MAYÚSCULAS\", \"description\": \"...\"}]. "
    "Responde SOLO el JSON. En español."
)

_PROMPT_ADMISIONES = (
    "Eres un analista de admisiones universitarias de UNAB. "
    "Se te proporcionan métricas de conversión del pipeline de admisiones. "
    "Genera exactamente 4 insights breves, accionables y específicos. OBLIGATORIO incluir:\n"
    "1. Comparación de la tasa de conversión Admitidos/Pagados ACTUAL vs la actualización ANTERIOR.\n"
    "2. Identificación del cuello de botella principal (¿dónde se pierden más leads: de Solicitados a Admitidos, o de Admitidos a Pagados?).\n"
    "3. Avance respecto a la meta y proyección de cumplimiento.\n"
    "4. Un cuarto insight accionable adicional.\n"
    "Formato JSON: [{\"icon\": \"trending_up|trending_down|alert|star\", \"title\": \"TÍTULO EN MAYÚSCULAS\", \"description\": \"...\"}]. "
    "Responde SOLO el JSON. En español."
)

_PROMPT_ESTADOS = (
    "Eres un analista de ventas y gestión de leads de UNAB. "
    "Se te proporcionan datos del embudo de conversión completo: Leads → En Gestión → Op. Venta → Proceso Pago → Pagados. "
    "Genera exactamente 4 insights breves, accionables y específicos. OBLIGATORIO incluir:\n"
    "1. Identificación de la etapa del embudo donde se pierde el mayor % de leads.\n"
    "2. Comparación del embudo ACTUAL vs la actualización ANTERIOR (¿mejoró o empeoró alguna etapa?).\n"
    "3. Análisis de la etapa Proceso Pago → Pagados (¿cuántos quedan sin cerrar y qué se puede hacer?).\n"
    "4. Un cuarto insight accionable adicional sobre dónde enfocar esfuerzos.\n"
    "Formato JSON: [{\"icon\": \"trending_up|trending_down|alert|star\", \"title\": \"TÍTULO EN MAYÚSCULAS\", \"description\": \"...\"}]. "
    "Responde SOLO el JSON. En español."
)

_PROMPT_GENERIC = (
    "Eres un analista de datos de UNAB. Genera exactamente 4 insights breves y accionables. "
    "Incluye información sobre lo que cambió desde la última actualización si es relevante.\n"
    "Formato JSON: [{\"icon\": \"trending_up|trending_down|alert|star\", \"title\": \"TÍTULO EN MAYÚSCULAS\", \"description\": \"...\"}]. "
    "Responde SOLO el JSON. En español."
)


class ChatRequest(BaseModel):
    message: str
    history: Optional[list] = []
    context_data: Optional[dict] = {}


class ContextRequest(BaseModel):
    context_data: Optional[dict] = {}
    page: Optional[str] = None   # "no-util" | "admisiones" | "estados" | None


@router.post("/chat")
async def ai_chat(body: ChatRequest, _user: str = Depends(require_auth)):
    try:
        data = await cache.get_all()
        change_summary = cache.get_changes_summary()

        local_context = body.context_data or {}
        context = {
            **local_context,
            "resumen_cambios_ultima_hora": change_summary,
            "fecha_servidor": data.get("fecha_actualizacion"),
        }

        context_str = json.dumps(context, default=str, ensure_ascii=False)

        messages = [
            {
                "role": "system",
                "content": (
                    "Eres el Analista Experto de la Universidad UNAB (Grupo Nods). "
                    "Tu objetivo es dar insights accionables basados en los datos del dashboard. "
                    "Eres conciso, profesional y directo. Responde en español.\n\n"
                    "Cuentas con la capacidad de ver qué cambió desde la última actualización horaria.\n\n"
                    f"DATOS ACTUALES Y CAMBIOS:\n{context}"
                ),
            }
        ]

        for h in (body.history or [])[-6:]:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})

        messages.append({"role": "user", "content": body.message})

        try:
            log_ai("Requesting OpenAI chat...")
            content = await _openai_chat(messages)
            log_ai("OpenAI chat successful")
            return {"response": content}
        except Exception as e:
            log_ai(f"OpenAI service error: {e}")
            if "429" in str(e):
                return {"response": "El servicio de IA de OpenAI está saturado. Por favor, intentá de nuevo en un momento."}
            return {"response": f"Error en el servicio de IA: {str(e)[:100]}"}
    except Exception as e:
        log_ai(f"Unexpected error in ai_chat: {e}")
        return {"response": "Error inesperado en el analista de IA."}


@router.post("/insights")
async def ai_insights(body: Optional[ContextRequest] = None, _user: str = Depends(require_auth)):
    try:
        data = await cache.get_all()
        prev = cache.previous_snapshot  # Raw previous snapshot dict

        page = (body.page or "").lower() if body else ""

        # Build page-specific context string and system prompt
        if "no-util" in page or "no_util" in page:
            context_str = _build_no_util_context(data, prev)
            system_prompt = _PROMPT_NO_UTIL
        elif "admision" in page:
            context_str = _build_admisiones_context(data, prev)
            system_prompt = _PROMPT_ADMISIONES
        elif "estado" in page:
            context_str = _build_estados_context(data, prev)
            system_prompt = _PROMPT_ESTADOS
        else:
            context_str = _build_generic_context(data, prev)
            system_prompt = _PROMPT_GENERIC

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Datos:\n{context_str}"},
        ]

        try:
            log_ai(f"Requesting OpenAI insights for page='{page}'...")
            raw = (await _openai_chat(messages, temperature=0.4)).strip()
            log_ai("OpenAI insights successful")
        except Exception as e:
            log_ai(f"OpenAI insights failed: {e}")
            raise e

        try:
            if "```" in raw:
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            insights = json.loads(raw)
            return {"insights": insights}
        except Exception:
            return {"insights": [{"icon": "alert", "title": "Dashboard", "description": "Datos actualizados, pero no se pudieron procesar los insights."}]}
    except Exception as e:
        error_msg = str(e)
        title = "IA Ocupada" if "429" in error_msg else "Error de IA"
        desc = "Servicio de OpenAI saturado." if "429" in error_msg else error_msg[:100]
        return {"insights": [{"icon": "alert", "title": title, "description": desc}]}


@router.post("/predictions")
async def ai_predictions(body: Optional[ContextRequest] = None, _user: str = Depends(require_auth)):
    try:
        data = await cache.get_all()

        local_context = body.context_data if body else {}
        context = {
            **local_context,
            "fecha_servidor": data.get("fecha_actualizacion"),
        }

        context_str = json.dumps(context, default=str, ensure_ascii=False)

        messages = [
            {
                "role": "system",
                "content": (
                    "Eres un analista predictivo de UNAB. Proyecta el cumplimiento de metas basado en los datos actuales. "
                    "Formato JSON: [{\"period\": \"Semana X\", \"predicted_leads\": N, \"predicted_matriculados\": N, \"confidence\": 0.0-1.0}]. "
                    "Responde SOLO el JSON."
                ),
            },
            {"role": "user", "content": f"Contexto histórico y actual:\n{context_str}"},
        ]

        try:
            log_ai("Requesting OpenAI predictions...")
            raw = (await _openai_chat(messages)).strip()
            log_ai("OpenAI predictions successful")
        except Exception as e:
            log_ai(f"OpenAI predictions failed: {e}")
            raise e
        try:
            if "```" in raw:
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            predictions = json.loads(raw)
        except Exception:
            predictions = []

        return {"predictions": predictions}
    except Exception as e:
        return {"predictions": []}
