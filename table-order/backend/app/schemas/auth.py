from __future__ import annotations

import uuid
from typing import Optional

from pydantic import BaseModel, Field


class AdminLoginRequest(BaseModel):
    store_identifier: str = Field(..., min_length=1, max_length=50)
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=8, max_length=100)


class TableLoginRequest(BaseModel):
    store_identifier: str = Field(..., min_length=1, max_length=50)
    table_number: int = Field(..., ge=1)
    password: str = Field(..., min_length=4, max_length=50)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TableTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    table_id: str
    table_number: int
    session_id: Optional[str] = None


class AdminInfo(BaseModel):
    id: str
    username: str
    store_id: str


class TableSessionInfo(BaseModel):
    table_id: str
    table_number: int
    store_id: str
    session_id: Optional[str] = None
    session_start: Optional[str] = None
