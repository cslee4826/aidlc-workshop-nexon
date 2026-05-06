from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import create_tables
from app.redis import close_redis, init_redis
from app.routers import auth, health, menus, orders, sse, table_auth, tables

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(
        structlog.get_config()["wrapper_class"]._level
        if hasattr(structlog.get_config().get("wrapper_class", object), "_level")
        else 0
    ),
)
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    await init_redis()
    await logger.ainfo("Application started", env=settings.app_env)
    yield
    await close_redis()
    await logger.ainfo("Application shutdown")


app = FastAPI(
    title="Table Order API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
app.state.limiter = None  # Will be configured per-router

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    await logger.aerror(
        "unhandled_exception",
        error_type=type(exc).__name__,
        error_message=str(exc),
        path=request.url.path,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "서버 내부 오류가 발생했습니다", "error_code": "INTERNAL_ERROR"},
    )


app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security headers middleware
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if settings.app_env == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response


# Register routers
app.include_router(health.router)
app.include_router(auth.router, prefix="/api/admin", tags=["Admin Auth"])
app.include_router(table_auth.router, prefix="/api/tables", tags=["Table Auth"])
app.include_router(menus.router, prefix="/api", tags=["Menus"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(tables.router, prefix="/api/tables", tags=["Tables"])
app.include_router(sse.router, prefix="/api/sse", tags=["SSE"])
