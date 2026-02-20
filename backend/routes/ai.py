import os
import json
import httpx
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from routes.auth import require_auth
from cache import cache

router = APIRouter(prefix="/api/ai", tags=["ai"])

MODEL = "llama-3.3-70b-versatile"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


async def _groq_chat(messages: list, temperature: float = 0.3, max_tokens: int = 1000) -> str:
    """Call Groq API directly."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise Exception("GROQ_API_KEY no configurada en el servidor")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            GROQ_URL,
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
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def _get_ai_context() -> str:
    """Build a comprehensive summary of current data for AI context."""
    data = await cache.get_all()
    change_summary = cache.get_changes_summary()
    
    # Prune some data to avoid token limits but keep the essence
    context = {
        "kpis": {
            "total_leads": data.get("total_leads"),
            "en_gestion": data.get("en_gestion"),
            "solicitados": data.get("totals", {}).get("solicitados"),
            "admitidos": data.get("totals", {}).get("admitidos"),
            "pagados": data.get("totals", {}).get("pagados"),
            "matriculados": data.get("admitidos_status", {}).get("matriculados"),
            "no_util_total": data.get("no_util_total"),
        },
        "resumen_cambios_ultima_hora": change_summary,
        "top_programas_admisiones": data.get("admisiones", [])[:10],
        "fuentes_no_util": data.get("no_util", [])[:5],
        "fecha_actualizacion": data.get("fecha_actualizacion"),
    }
    return json.dumps(context, default=str, ensure_ascii=False)


class ChatRequest(BaseModel):
    message: str
    history: Optional[list] = []


@router.post("/chat")
async def ai_chat(body: ChatRequest, _user: str = Depends(require_auth)):
    try:
        context = await _get_ai_context()

        messages = [
            {
                "role": "system",
                "content": (
                    "Eres el Analista Experto de la Universidad UNAB (Grupo Nods). "
                    "Tu objetivo es dar insights accionables basados en los datos del dashboard. "
                    "Eres consiso, profesional y directo. Responde en español.\n\n"
                    "Cuentas con la capacidad de ver qué cambió desde la última actualización horaria.\n\n"
                    f"DATOS ACTUALES Y CAMBIOS:\n{context}"
                ),
            }
        ]

        for h in (body.history or [])[-6:]:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})

        messages.append({"role": "user", "content": body.message})

        content = await _groq_chat(messages)
        return {"response": content}
    except Exception as e:
        print(f"[AI Chat Error] {e}")
        return {"response": f"Error: {str(e)[:200]}"}


@router.get("/insights")
async def ai_insights(_user: str = Depends(require_auth)):
    try:
        context = await _get_ai_context()

        messages = [
            {
                "role": "system",
                "content": (
                    "Eres un analista de datos de UNAB. Genera exactamente 4 insights breves y accionables. "
                    "Incluye información sobre lo que cambió desde la última actualización si es relevante.\n"
                    "Formato JSON: [{\"icon\": \"trending_up|trending_down|alert|star\", \"title\": \"...\", \"description\": \"...\"}]. "
                    "Responde SOLO el JSON. En español."
                ),
            },
            {"role": "user", "content": f"Datos y cambios:\n{context}"},
        ]

        raw = (await _groq_chat(messages, temperature=0.5)).strip()
        try:
            if "```" in raw:
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            insights = json.loads(raw)
            return {"insights": insights}
        except:
            return {"insights": [{"icon": "alert", "title": "Dashboard", "description": "Datos actualizados, pero no se pudieron procesar los insights."}]}
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg:
            return {"insights": [{"icon": "alert", "title": "IA Ocupada", "description": "Límite de peticiones alcanzado. Por favor, intenta de nuevo en unos minutos."}]}
        return {"insights": [{"icon": "alert", "title": "Error", "description": error_msg[:100]}]}


@router.get("/predictions")
async def ai_predictions(_user: str = Depends(require_auth)):
    try:
        context = await _get_ai_context()

        messages = [
            {
                "role": "system",
                "content": (
                    "Eres un analista predictivo de UNAB. Proyecta el cumplimiento de metas basado en los datos actuales. "
                    "Formato JSON: [{\"period\": \"Semana X\", \"predicted_leads\": N, \"predicted_matriculados\": N, \"confidence\": 0.0-1.0}]. "
                    "Responde SOLO el JSON."
                ),
            },
            {"role": "user", "content": f"Contexto histórico y actual:\n{context}"},
        ]

        raw = (await _groq_chat(messages)).strip()
        try:
            if "```" in raw:
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            predictions = json.loads(raw)
        except:
            predictions = []

        return {"predictions": predictions}
    except Exception as e:
        return {"predictions": []}
