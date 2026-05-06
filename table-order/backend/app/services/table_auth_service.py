from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import UnauthorizedError
from app.models.store import Store
from app.models.table import Table
from app.schemas.auth import TableLoginRequest, TableTokenResponse
from app.utils.security import create_access_token, verify_password


async def authenticate_table(db: AsyncSession, request: TableLoginRequest) -> TableTokenResponse:
    result = await db.execute(
        select(Store).where(Store.store_identifier == request.store_identifier)
    )
    store = result.scalar_one_or_none()
    if not store:
        raise UnauthorizedError("매장 정보가 올바르지 않습니다")

    result = await db.execute(
        select(Table).where(
            Table.store_id == store.id, Table.table_number == request.table_number
        )
    )
    table = result.scalar_one_or_none()
    if not table:
        raise UnauthorizedError("테이블 정보가 올바르지 않습니다")

    if not verify_password(request.password, table.password_hash):
        raise UnauthorizedError("비밀번호가 올바르지 않습니다")

    token = create_access_token(
        data={
            "table_id": str(table.id),
            "store_id": str(store.id),
            "table_number": table.table_number,
        }
    )

    return TableTokenResponse(
        access_token=token,
        table_id=table.id,
        table_number=table.table_number,
    )
