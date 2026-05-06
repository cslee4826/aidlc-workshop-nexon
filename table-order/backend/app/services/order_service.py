from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import NotFoundError, ValidationError
from app.models.menu import MenuItem
from app.models.order import Order, OrderItem
from app.models.table import TableSession
from app.schemas.order import OrderCreateRequest, OrderResponse
from app.services.sse_service import sse_service
from app.utils.order_number import generate_order_number

logger = structlog.get_logger()

VALID_TRANSITIONS = {
    "pending": ["preparing"],
    "preparing": ["completed"],
    "completed": [],
}


async def create_order(
    db: AsyncSession, store_id: str, table_id: str, request: OrderCreateRequest
) -> OrderResponse:
    result = await db.execute(
        select(TableSession).where(
            TableSession.table_id == table_id, TableSession.is_active == True
        )
    )
    session = result.scalar_one_or_none()

    if not session:
        session = TableSession(
            table_id=table_id,
            started_at=datetime.now(timezone.utc),
            is_active=True,
        )
        db.add(session)
        await db.flush()

    order_items = []
    total_amount = 0

    for item in request.items:
        result = await db.execute(
            select(MenuItem).where(
                MenuItem.id == item.menu_item_id,
                MenuItem.store_id == store_id,
                MenuItem.is_available == True,
            )
        )
        menu_item = result.scalar_one_or_none()
        if not menu_item:
            raise ValidationError(f"유효하지 않은 메뉴입니다: {item.menu_item_id}")

        subtotal = menu_item.price * item.quantity
        total_amount += subtotal
        order_items.append(
            OrderItem(
                menu_item_id=menu_item.id,
                menu_name=menu_item.name,
                quantity=item.quantity,
                unit_price=menu_item.price,
                subtotal=subtotal,
            )
        )

    order_number = await generate_order_number(db, store_id)

    order = Order(
        store_id=store_id,
        table_id=table_id,
        session_id=session.id,
        order_number=order_number,
        status="pending",
        total_amount=total_amount,
    )
    order.items = order_items
    db.add(order)
    await db.flush()
    await db.refresh(order)

    await logger.ainfo(
        "order_created",
        store_id=store_id,
        order_number=order_number,
        total_amount=total_amount,
    )

    await sse_service.broadcast_event(
        store_id,
        "new_order",
        {
            "order_id": order.id,
            "table_id": table_id,
            "order_number": order_number,
            "total_amount": total_amount,
            "items": [{"menu_name": i.menu_name, "quantity": i.quantity} for i in order_items],
        },
    )

    return OrderResponse.model_validate(order)


async def update_order_status(
    db: AsyncSession, store_id: str, order_id: str, new_status: str
) -> OrderResponse:
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.store_id == store_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise NotFoundError("주문을 찾을 수 없습니다")

    if new_status not in VALID_TRANSITIONS.get(order.status, []):
        raise ValidationError(
            f"허용되지 않는 상태 전이입니다: {order.status} → {new_status}"
        )

    old_status = order.status
    order.status = new_status
    await db.flush()
    await db.refresh(order)

    await sse_service.broadcast_event(
        store_id,
        "status_change",
        {
            "order_id": order.id,
            "order_number": order.order_number,
            "old_status": old_status,
            "new_status": new_status,
        },
    )

    return OrderResponse.model_validate(order)


async def delete_order(db: AsyncSession, store_id: str, order_id: str) -> None:
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.store_id == store_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise NotFoundError("주문을 찾을 수 없습니다")

    order_number = order.order_number
    await db.delete(order)

    await sse_service.broadcast_event(
        store_id, "order_deleted", {"order_id": order_id, "order_number": order_number}
    )


async def get_orders(
    db: AsyncSession, store_id: str, table_id: Optional[str] = None,
    session_id: Optional[str] = None,
) -> List[OrderResponse]:
    query = select(Order).where(Order.store_id == store_id)
    if table_id:
        query = query.where(Order.table_id == table_id)
    if session_id:
        query = query.where(Order.session_id == session_id)
    query = query.order_by(Order.created_at.desc())

    result = await db.execute(query)
    orders = result.scalars().all()
    return [OrderResponse.model_validate(o) for o in orders]
