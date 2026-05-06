from __future__ import annotations

from fastapi import Header

from app.exceptions import UnauthorizedError
from app.schemas.auth import AdminInfo, TableSessionInfo
from app.utils.security import decode_access_token


async def get_current_admin(authorization: str = Header(...)) -> AdminInfo:
    if not authorization.startswith("Bearer "):
        raise UnauthorizedError("유효하지 않은 인증 토큰입니다")

    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)

    if payload is None:
        raise UnauthorizedError("토큰이 만료되었거나 유효하지 않습니다")

    return AdminInfo(
        id=payload["admin_id"],
        username=payload["username"],
        store_id=payload["store_id"],
    )


async def get_current_table(authorization: str = Header(...)) -> TableSessionInfo:
    if not authorization.startswith("Bearer "):
        raise UnauthorizedError("유효하지 않은 인증 토큰입니다")

    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)

    if payload is None:
        raise UnauthorizedError("토큰이 만료되었거나 유효하지 않습니다")

    return TableSessionInfo(
        table_id=payload["table_id"],
        table_number=payload["table_number"],
        store_id=payload["store_id"],
        session_id=payload.get("session_id"),
    )
