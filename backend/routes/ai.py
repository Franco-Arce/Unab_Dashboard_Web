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

MODEL = "llama-3.3-70b-versatile"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
OPENAI_MODEL = "gpt-4o-mini"
OPENAI_URL = "https://api.openai.com/v1/chat/completions"

LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ai_usage.log")

def log_ai(message: str):
    """Write log with timestamp to a file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {message}\n")

async def _openai_chat(messages: list, temperature: float = 0.3, max_tokens: int = 1000) -> str:
    """Fallback: Call OpenAI API directly."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("[AI] Warning: OPENAI_API_KEY is missing")
        raise Exception("OPENAI_API_KEY no configurada")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            OPENAI_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": OPENAI_MODEL,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
            timeout=30.0,
        )
        if resp.status_code != 200:
            err_body = resp.text
            print(f"[AI] OpenAI Error {resp.status_code}: {err_body}")
            raise Exception(f"OpenAI API Error {resp.status_code}: {err_body}")

        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def _groq_chat(messages: list, temperature: float = 0.3, max_tokens: int = 1000) -> str:
    """Call Groq API directly."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("[AI] Warning: GROQ_API_KEY is missing")
        raise Exception("GROQ_API_KEY no configurada")

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
        if resp.status_code != 200:
            err_body = resp.text
            print(f"[AI] Groq Error {resp.status_code}: {err_body}")
            raise Exception(f"Groq API Error {resp.status_code}: {err_body}")
            
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
    context_data: Optional[dict] = {}


class ContextRequest(BaseModel):
    context_data: Optional[dict] = {}


@router.post("/chat")
async def ai_chat(body: ChatRequest, _user: str = Depends(require_auth)):
    try:
        data = await cache.get_all()
        change_summary = cache.get_changes_summary()
        
        # Merge local context from frontend with backend change summary
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
                    "Eres consiso, profesional y directo. Responde en español.\n\n"
                    "Cuentas con la capacidad de ver qué cambió desde la última actualización horaria.\n\n"
                    f"DATOS ACTUALES Y CAMBIOS:\n{context}"
                ),
            }
        ]

        g_key = os.getenv("GROQ_API_KEY")
        o_key = os.getenv("OPENAI_API_KEY")
        
        if not g_key and not o_key:
            return {"response": "Configuración de IA incompleta (faltan API Keys)."}

        for h in (body.history or [])[-6:]:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})

        messages.append({"role": "user", "content": body.message})

        try:
            log_ai("Attempting Groq chat...")
            content = await _groq_chat(messages)
            log_ai("Groq chat successful")
        except Exception as e:
            log_ai(f"Groq failed, switching to OpenAI fallback: {e}")
            if not o_key:
                log_ai("OpenAI fallback failed (API Key missing)")
                return {"response": "Groq ocupado y OpenAI no está configurado como respaldo."}
                
            try:
                content = await _openai_chat(messages)
                log_ai("OpenAI fallback successful")
            except Exception as oe:
                log_ai(f"OpenAI fallback also failed: {oe}")
                return {"response": "Todos los servicios de IA están ocupados en este momento. Por favor, intenta de nuevo en unos minutos."}
            
        return {"response": content}
    except Exception as e:
        print(f"[AI Chat Overall Error] {e}")
        return {"response": "Hubo un error inesperado al procesar tu solicitud de IA."}


@router.post("/insights")
async def ai_insights(body: Optional[ContextRequest] = None, _user: str = Depends(require_auth)):
    try:
        data = await cache.get_all()
        change_summary = cache.get_changes_summary()
        
        local_context = body.context_data if body else {}
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
                    "Eres un analista de datos de UNAB. Genera exactamente 4 insights breves y accionables. "
                    "Incluye información sobre lo que cambió desde la última actualización si es relevante.\n"
                    "Formato JSON: [{\"icon\": \"trending_up|trending_down|alert|star\", \"title\": \"...\", \"description\": \"...\"}]. "
                    "Responde SOLO el JSON. En español."
                ),
            },
            {"role": "user", "content": f"Datos y cambios:\n{context_str}"},
        ]

        try:
            log_ai("Attempting Groq insights...")
            raw = (await _groq_chat(messages, temperature=0.5)).strip()
            log_ai("Groq insights successful")
        except Exception as e:
            log_ai(f"Groq insights failed, switching to OpenAI: {e}")
            try:
                raw = (await _openai_chat(messages, temperature=0.5)).strip()
                log_ai("OpenAI insights successful")
            except Exception as oe:
                log_ai(f"OpenAI insights also failed: {oe}")
                raise oe
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
        title = "IA Ocupada" if "429" in error_msg else "Error de IA"
        # Be more specific if it's the fallback that failed
        desc = "Límite de peticiones alcanzado en ambos servicios (Groq y OpenAI)." if "429" in error_msg else error_msg[:100]
        
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
            log_ai("Attempting Groq predictions...")
            raw = (await _groq_chat(messages)).strip()
            log_ai("Groq predictions successful")
        except Exception as e:
            log_ai(f"Groq predictions failed, switching to OpenAI: {e}")
            try:
                raw = (await _openai_chat(messages)).strip()
                log_ai("OpenAI predictions successful")
            except Exception as oe:
                log_ai(f"OpenAI predictions also failed: {oe}")
                raise oe
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
