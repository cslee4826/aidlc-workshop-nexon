from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class TableCreateRequest(BaseModel):
    table_number: int = Field(..., ge=1, le=999)
    password: str = Field(..., min_length=4, max_length=50)


class TableResponse(BaseModel):
    id: str
    table_number: int
    current_session_id: Optional[str] = None
    total_amount: int = 0

    class Config:
        from_attributes = True


class TableDetailResponse(TableResponse):
    orders: List = []
