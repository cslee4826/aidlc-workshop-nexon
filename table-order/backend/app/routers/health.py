from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import text

from app.database import engine
from app.redis import get_redis

router = APIRouter()


@router.get("/health", tags=["Health"])
async def health_check():
    db_status = "connected"
    redis_status = "connected"

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    try:
        redis_client = await get_redis()
        if redis_client:
            await redis_client.ping()
        else:
            redis_status = "not_configured"
    except Exception:
        redis_status = "disconnected"

    status = "healthy" if db_status == "connected" else "degraded"

    return {"status": status, "db": db_status, "redis": redis_status}
