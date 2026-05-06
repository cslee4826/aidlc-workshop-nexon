from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class OrderItemRequest(BaseModel):
    menu_item_id: str
    quantity: int = Field(..., ge=1, le=99)


class OrderCreateRequest(BaseModel):
    items: List[OrderItemRequest] = Field(..., min_length=1, max_length=50)


class OrderItemResponse(BaseModel):
    id: str
    menu_item_id: str
    menu_name: str
    quantity: int
    unit_price: int
    subtotal: int

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: str
    order_number: str
    status: str
    total_amount: int
    created_at: datetime
    items: List[OrderItemResponse] = []
    table_number: Optional[int] = None

    class Config:
        from_attributes = True


class StatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(pending|preparing|completed)$")


class OrderHistoryResponse(BaseModel):
    id: str
    order_number: str
    order_items: dict
    total_amount: int
    ordered_at: datetime
    completed_at: datetime

    class Config:
        from_attributes = True
