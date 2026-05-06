from __future__ import annotations

from datetime import datetime, timedelta, timezone

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.exceptions import AccountLockedError, UnauthorizedError
from app.models.admin import Admin
from app.models.store import Store
from app.schemas.auth import AdminLoginRequest, TokenResponse
from app.utils.security import create_access_token, verify_password

logger = structlog.get_logger()

MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


async def authenticate_admin(db: AsyncSession, request: AdminLoginRequest) -> TokenResponse:
    result = await db.execute(
        select(Store).where(Store.store_identifier == request.store_identifier)
    )
    store = result.scalar_one_or_none()
    if not store:
        raise UnauthorizedError("아이디 또는 비밀번호가 올바르지 않습니다")

    result = await db.execute(
        select(Admin).where(Admin.store_id == store.id, Admin.username == request.username)
    )
    admin = result.scalar_one_or_none()
    if not admin:
        raise UnauthorizedError("아이디 또는 비밀번호가 올바르지 않습니다")

    if admin.locked_until and admin.locked_until > datetime.now(timezone.utc):
        remaining = (admin.locked_until - datetime.now(timezone.utc)).seconds // 60
        raise AccountLockedError(f"계정이 잠겨있습니다. {remaining + 1}분 후 다시 시도해주세요")

    if not verify_password(request.password, admin.password_hash):
        admin.failed_login_attempts += 1
        if admin.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:
            admin.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)
        await db.commit()
        raise UnauthorizedError("아이디 또는 비밀번호가 올바르지 않습니다")

    admin.failed_login_attempts = 0
    admin.locked_until = None
    await db.commit()

    token = create_access_token(
        data={
            "admin_id": str(admin.id),
            "store_id": str(store.id),
            "username": admin.username,
        }
    )

    return TokenResponse(
        access_token=token,
        expires_in=settings.jwt_expire_hours * 3600,
    )
