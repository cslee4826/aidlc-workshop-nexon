from __future__ import annotations

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, OrderHistory


async def generate_order_number(db: AsyncSession, store_id: str) -> str:
    today = date.today()
    date_prefix = today.strftime("%Y%m%d")
    pattern = f"{date_prefix}-%"

    # Count from active orders
    result1 = await db.execute(
        select(func.count())
        .select_from(Order)
        .where(Order.store_id == store_id, Order.order_number.like(pattern))
    )
    active_count = result1.scalar_one()

    # Count from order history
    result2 = await db.execute(
        select(func.count())
        .select_from(OrderHistory)
        .where(OrderHistory.store_id == store_id, OrderHistory.order_number.like(pattern))
    )
    history_count = result2.scalar_one()

    next_number = active_count + history_count + 1

    return f"{date_prefix}-{next_number:03d}"
