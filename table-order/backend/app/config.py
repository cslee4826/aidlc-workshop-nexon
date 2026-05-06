from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    app_port: int = 8000
    app_host: str = "0.0.0.0"

    database_url: str = "sqlite+aiosqlite:///./table_order.db"
    db_pool_size: int = 5
    db_max_overflow: int = 10

    redis_url: str = "redis://localhost:6379/0"
    redis_timeout: int = 500

    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = 16

    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_origin_list(self) -> list:
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
