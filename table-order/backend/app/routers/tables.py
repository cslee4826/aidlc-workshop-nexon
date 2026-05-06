from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_admin
from app.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.order import Order, OrderHistory
from app.models.table import Table, TableSession
from app.schemas.auth import AdminInfo
from app.schemas.common import SuccessResponse
from app.schemas.order import OrderHistoryResponse
from app.schemas.table import TableCreateRequest, TableResponse
from app.services.sse_service import sse_service
from app.utils.security import hash_password

router = APIRouter()


@router.post("", response_model=TableResponse)
async def create_table(
    request: TableCreateRequest,
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    result = await db.execute(
        select(Table).where(
            Table.store_id == admin.store_id, Table.table_number == request.table_number
        )
    )
    if result.scalar_one_or_none():
        raise ConflictError("이미 존재하는 테이블 번호입니다")

    table = Table(
        store_id=admin.store_id,
        table_number=request.table_number,
        password_hash=hash_password(request.password),
    )
    db.add(table)
    await db.flush()
    await db.refresh(table)
    return TableResponse(id=table.id, table_number=table.table_number)


@router.get("", response_model=List[TableResponse])
async def get_tables(
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    result = await db.execute(
        select(Table).where(Table.store_id == admin.store_id).order_by(Table.table_number)
    )
    tables = result.scalars().all()

    responses = []
    for table in tables:
        session_result = await db.execute(
            select(TableSession).where(
                TableSession.table_id == table.id, TableSession.is_active == True
            )
        )
        active_session = session_result.scalar_one_or_none()

        total_amount = 0
        session_id = None
        if active_session:
            session_id = active_session.id
            order_result = await db.execute(
                select(Order).where(Order.session_id == active_session.id)
            )
            orders = order_result.scalars().all()
            total_amount = sum(o.total_amount for o in orders)

        responses.append(
            TableResponse(
                id=table.id,
                table_number=table.table_number,
                current_session_id=session_id,
                total_amount=total_amount,
            )
        )
    return responses


@router.post("/{table_id}/complete", response_model=SuccessResponse)
async def complete_table_session(
    table_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    result = await db.execute(
        select(Table).where(Table.id == table_id, Table.store_id == admin.store_id)
    )
    table = result.scalar_one_or_none()
    if not table:
        raise NotFoundError("테이블을 찾을 수 없습니다")

    result = await db.execute(
        select(TableSession).where(
            TableSession.table_id == table_id, TableSession.is_active == True
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise ValidationError("활성 세션이 없습니다")

    result = await db.execute(select(Order).where(Order.session_id == session.id))
    orders = result.scalars().all()

    now = datetime.now(timezone.utc)
    for order in orders:
        items_data = [
            {
                "menu_name": item.menu_name,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": item.subtotal,
            }
            for item in order.items
        ]
        history = OrderHistory(
            store_id=admin.store_id,
            table_id=table_id,
            session_id=session.id,
            order_number=order.order_number,
            order_items={"items": items_data},
            total_amount=order.total_amount,
            ordered_at=order.created_at,
            completed_at=now,
        )
        db.add(history)
        await db.delete(order)

    session.is_active = False
    session.completed_at = now

    await sse_service.broadcast_event(
        admin.store_id,
        "session_completed",
        {"table_id": str(table_id), "table_number": table.table_number},
    )

    return SuccessResponse(message="테이블 이용이 완료되었습니다")


@router.get("/{table_id}/history", response_model=List[OrderHistoryResponse])
async def get_table_history(
    table_id: str,
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    query = select(OrderHistory).where(
        OrderHistory.table_id == table_id, OrderHistory.store_id == admin.store_id
    )
    if date_from:
        query = query.where(OrderHistory.completed_at >= date_from)
    if date_to:
        query = query.where(OrderHistory.completed_at <= date_to)
    query = query.order_by(OrderHistory.completed_at.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/sales/daily")
async def get_daily_sales(
    year: int = Query(...),
    month: int = Query(...),
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    """월별 일일 매출 조회 (이용 완료된 주문 기준)"""
    from sqlalchemy import func, extract, cast, Date

    # 현재 활성 주문의 매출 (아직 이용 완료 안 된 것)
    active_result = await db.execute(
        select(
            func.date(Order.created_at).label("sale_date"),
            func.sum(Order.total_amount).label("total"),
            func.count(Order.id).label("order_count"),
        )
        .where(
            Order.store_id == admin.store_id,
            extract("year", Order.created_at) == year,
            extract("month", Order.created_at) == month,
        )
        .group_by(func.date(Order.created_at))
    )
    active_sales = {str(row.sale_date): {"total": row.total, "count": row.order_count} for row in active_result}

    # 과거 이력의 매출 (이용 완료된 것)
    history_result = await db.execute(
        select(
            func.date(OrderHistory.ordered_at).label("sale_date"),
            func.sum(OrderHistory.total_amount).label("total"),
            func.count(OrderHistory.id).label("order_count"),
        )
        .where(
            OrderHistory.store_id == admin.store_id,
            extract("year", OrderHistory.ordered_at) == year,
            extract("month", OrderHistory.ordered_at) == month,
        )
        .group_by(func.date(OrderHistory.ordered_at))
    )
    history_sales = {str(row.sale_date): {"total": row.total, "count": row.order_count} for row in history_result}

    # 합산
    all_dates = set(list(active_sales.keys()) + list(history_sales.keys()))
    daily_sales = []
    for date_str in sorted(all_dates):
        active = active_sales.get(date_str, {"total": 0, "count": 0})
        history = history_sales.get(date_str, {"total": 0, "count": 0})
        daily_sales.append({
            "date": date_str,
            "total_amount": (active["total"] or 0) + (history["total"] or 0),
            "order_count": (active["count"] or 0) + (history["count"] or 0),
        })

    return daily_sales
