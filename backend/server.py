import os
from dotenv import load_dotenv

load_dotenv()

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import close_pool
from cache import cache
from routes.auth import router as auth_router
from routes.dashboard import router as dashboard_router
from routes.ai import router as ai_router


async def periodic_refresh():
    """Background task: refresh cache every hour."""
    while True:
        try:
            await cache.refresh()
        except Exception as e:
            print(f"[Periodic Refresh Error] {e}")
        await asyncio.sleep(3600)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initial cache load + start background refresh
    print("[Startup] Loading initial cache...")
    try:
        await cache.refresh()
        print("[Startup] Cache loaded successfully")
    except Exception as e:
        print(f"[Startup] Cache load failed: {e}")

    refresh_task = asyncio.create_task(periodic_refresh())

    yield

    # Shutdown
    refresh_task.cancel()
    await close_pool()
    print("[Shutdown] Database pool closed")


app = FastAPI(
    title="UNAB Dashboard API",
    description="Dashboard API for Universidad UNAB — Grupo Nods",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(ai_router)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "app": "UNAB Dashboard API",
        "mode": "postgresql",
        "last_refresh": cache.last_refresh.isoformat() if cache.last_refresh else None,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
