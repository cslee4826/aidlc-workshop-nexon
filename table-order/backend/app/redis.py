from typing import Optional

import redis.asyncio as redis

from app.config import settings

redis_client: Optional[redis.Redis] = None


async def get_redis() -> Optional[redis.Redis]:
    return redis_client


async def init_redis() -> None:
    global redis_client
    try:
        redis_client = redis.from_url(
            settings.redis_url,
            socket_timeout=settings.redis_timeout / 1000,
            decode_responses=True,
        )
        await redis_client.ping()
    except Exception:
        redis_client = None


async def close_redis() -> None:
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None
