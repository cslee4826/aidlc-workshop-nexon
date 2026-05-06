from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class CategoryCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    sort_order: int = Field(default=0, ge=0)


class CategoryUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    sort_order: Optional[int] = Field(None, ge=0)


class CategoryResponse(BaseModel):
    id: str
    name: str
    sort_order: int

    class Config:
        from_attributes = True


class MenuCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: int = Field(..., ge=1000, le=500000)
    description: Optional[str] = Field(None, max_length=500)
    category_id: str
    image_url: Optional[str] = Field(None, max_length=500)
    sort_order: int = Field(default=0, ge=0)


class MenuUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[int] = Field(None, ge=1000, le=500000)
    description: Optional[str] = Field(None, max_length=500)
    category_id: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    sort_order: Optional[int] = Field(None, ge=0)


class MenuItemResponse(BaseModel):
    id: str
    name: str
    price: int
    description: Optional[str]
    image_url: Optional[str]
    category_id: str
    sort_order: int
    is_available: bool

    class Config:
        from_attributes = True


class MenuSortItem(BaseModel):
    id: str
    sort_order: int = Field(..., ge=0)


class MenuSortRequest(BaseModel):
    items: list = Field(..., min_length=1)
