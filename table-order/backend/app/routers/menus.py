from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_admin, get_current_table
from app.exceptions import NotFoundError
from app.models.menu import Category, MenuItem
from app.schemas.auth import AdminInfo, TableSessionInfo
from app.schemas.common import SuccessResponse
from app.schemas.menu import (
    CategoryCreateRequest,
    CategoryResponse,
    CategoryUpdateRequest,
    MenuCreateRequest,
    MenuItemResponse,
    MenuSortRequest,
    MenuUpdateRequest,
)

router = APIRouter()


@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(
    db: AsyncSession = Depends(get_db),
    table: TableSessionInfo = Depends(get_current_table),
):
    result = await db.execute(
        select(Category)
        .where(Category.store_id == table.store_id)
        .order_by(Category.sort_order)
    )
    return result.scalars().all()


@router.get("/admin/categories", response_model=List[CategoryResponse])
async def get_categories_admin(
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    result = await db.execute(
        select(Category)
        .where(Category.store_id == admin.store_id)
        .order_by(Category.sort_order)
    )
    return result.scalars().all()


@router.get("/menus", response_model=List[MenuItemResponse])
async def get_menus(
    category_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    table: TableSessionInfo = Depends(get_current_table),
):
    query = select(MenuItem).where(
        MenuItem.store_id == table.store_id, MenuItem.is_available == True
    )
    if category_id:
        query = query.where(MenuItem.category_id == category_id)
    query = query.order_by(MenuItem.sort_order)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/admin/menus", response_model=List[MenuItemResponse])
async def get_menus_admin(
    category_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    query = select(MenuItem).where(MenuItem.store_id == admin.store_id)
    if category_id:
        query = query.where(MenuItem.category_id == category_id)
    query = query.order_by(MenuItem.sort_order)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/menus", response_model=MenuItemResponse)
async def create_menu(
    request: MenuCreateRequest,
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    menu_item = MenuItem(
        store_id=admin.store_id,
        category_id=request.category_id,
        name=request.name,
        price=request.price,
        description=request.description,
        image_url=request.image_url,
        sort_order=request.sort_order,
    )
    db.add(menu_item)
    await db.flush()
    await db.refresh(menu_item)
    return menu_item


@router.put("/menus/{menu_id}", response_model=MenuItemResponse)
async def update_menu(
    menu_id: str,
    request: MenuUpdateRequest,
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    result = await db.execute(
        select(MenuItem).where(MenuItem.id == menu_id, MenuItem.store_id == admin.store_id)
    )
    menu_item = result.scalar_one_or_none()
    if not menu_item:
        raise NotFoundError("메뉴를 찾을 수 없습니다")

    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(menu_item, key, value)

    await db.flush()
    await db.refresh(menu_item)
    return menu_item


@router.delete("/menus/{menu_id}", response_model=SuccessResponse)
async def delete_menu(
    menu_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    result = await db.execute(
        select(MenuItem).where(MenuItem.id == menu_id, MenuItem.store_id == admin.store_id)
    )
    menu_item = result.scalar_one_or_none()
    if not menu_item:
        raise NotFoundError("메뉴를 찾을 수 없습니다")

    await db.delete(menu_item)
    return SuccessResponse(message="메뉴가 삭제되었습니다")


@router.patch("/menus/sort", response_model=SuccessResponse)
async def update_menu_sort(
    request: MenuSortRequest,
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    for item in request.items:
        result = await db.execute(
            select(MenuItem).where(MenuItem.id == item.id, MenuItem.store_id == admin.store_id)
        )
        menu_item = result.scalar_one_or_none()
        if menu_item:
            menu_item.sort_order = item.sort_order
    return SuccessResponse(message="순서가 변경되었습니다")


@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    request: CategoryCreateRequest,
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    category = Category(store_id=admin.store_id, name=request.name, sort_order=request.sort_order)
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    request: CategoryUpdateRequest,
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    result = await db.execute(
        select(Category).where(Category.id == category_id, Category.store_id == admin.store_id)
    )
    category = result.scalar_one_or_none()
    if not category:
        raise NotFoundError("카테고리를 찾을 수 없습니다")

    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)

    await db.flush()
    await db.refresh(category)
    return category


@router.delete("/categories/{category_id}", response_model=SuccessResponse)
async def delete_category(
    category_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminInfo = Depends(get_current_admin),
):
    result = await db.execute(
        select(Category).where(Category.id == category_id, Category.store_id == admin.store_id)
    )
    category = result.scalar_one_or_none()
    if not category:
        raise NotFoundError("카테고리를 찾을 수 없습니다")

    await db.delete(category)
    return SuccessResponse(message="카테고리가 삭제되었습니다")
