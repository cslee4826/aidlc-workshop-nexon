from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_admin, get_current_table
from app.schemas.auth import AdminInfo, TableSessionInfo
from app.schemas.common import SuccessResponse
from app.schemas.order import OrderCreateRequest, OrderResponse, StatusUpdateRequest
from app.services import order_service

router = APIRouter()


@router.post("", response_model=OrderResponse)
async def create_order(
    request: OrderCreateRequest,
    db: AsyncSession = Depends(get_db),
    table: TableSessionInfo = Depends(get_current_table),
):
    return await order_service.create_order(db, table.store_id, table.table_id, request)


@router.get("/my", response_model=List[OrderResponse])
async def get_my_orders(
    db: AsyncSession = Depends(get_db),
    table: TableSessionInfo = Depends(get_current_table),
):
    """고객용: 현재 테이블의 활성 세션 주문 조회"""
    from sqlalchemy import select
    from app.models.table import TableSession

    # Find active session for this table
    result = await db.execute(
        select(TableSession).where(
            TableSession.table_id == table.table_id, TableSession.is_active == True
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        return []

    return await order_service.get_orders(db, table.store_id, table.table_id, session.id)


@router.get("", response_model=List[OrderResponse])
async def get_orders(
    table_id: Optional[str] = None,
    session_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    return await order_service.get_orders(db, admin.store_id, table_id, session_id)


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    request: StatusUpdateRequest,
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    return await order_service.update_order_status(db, admin.store_id, order_id, request.status)


@router.delete("/{order_id}", response_model=SuccessResponse)
async def delete_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    await order_service.delete_order(db, admin.store_id, order_id)
    return SuccessResponse(message="주문이 삭제되었습니다")
