"""Seed script to create initial test data for local development."""
import asyncio

from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory, create_tables
from app.models.admin import Admin
from app.models.menu import Category, MenuItem
from app.models.store import Store
from app.models.table import Table
from app.utils.security import hash_password


async def seed():
    await create_tables()

    async with async_session_factory() as db:
        # Create store
        store = Store(store_identifier="mystore", name="우리매장")
        db.add(store)
        await db.flush()

        # Create admin
        admin = Admin(
            store_id=store.id,
            username="admin",
            password_hash=hash_password("admin1234"),
        )
        db.add(admin)

        # Create tables
        for i in range(1, 6):
            table = Table(
                store_id=store.id,
                table_number=i,
                password_hash=hash_password("1234"),
            )
            db.add(table)

        # Create categories
        cat1 = Category(store_id=store.id, name="메인메뉴", sort_order=1)
        cat2 = Category(store_id=store.id, name="사이드", sort_order=2)
        cat3 = Category(store_id=store.id, name="음료", sort_order=3)
        db.add_all([cat1, cat2, cat3])
        await db.flush()

        # Create menu items
        menus = [
            MenuItem(store_id=store.id, category_id=cat1.id, name="김치찌개", price=9000, description="매콤한 김치찌개", sort_order=1),
            MenuItem(store_id=store.id, category_id=cat1.id, name="된장찌개", price=8000, description="구수한 된장찌개", sort_order=2),
            MenuItem(store_id=store.id, category_id=cat1.id, name="불고기", price=12000, description="달콤한 불고기", sort_order=3),
            MenuItem(store_id=store.id, category_id=cat1.id, name="비빔밥", price=10000, description="건강한 비빔밥", sort_order=4),
            MenuItem(store_id=store.id, category_id=cat2.id, name="계란말이", price=5000, description="부드러운 계란말이", sort_order=1),
            MenuItem(store_id=store.id, category_id=cat2.id, name="김치전", price=7000, description="바삭한 김치전", sort_order=2),
            MenuItem(store_id=store.id, category_id=cat3.id, name="콜라", price=2000, description="시원한 콜라", sort_order=1),
            MenuItem(store_id=store.id, category_id=cat3.id, name="사이다", price=2000, description="청량한 사이다", sort_order=2),
            MenuItem(store_id=store.id, category_id=cat3.id, name="맥주", price=5000, description="시원한 생맥주", sort_order=3),
        ]
        db.add_all(menus)

        await db.commit()
        print("Seed data created successfully!")
        print(f"  Store: mystore ({store.id})")
        print(f"  Admin: admin / admin1234")
        print(f"  Tables: 1~5 (password: 1234)")
        print(f"  Categories: 메인메뉴, 사이드, 음료")
        print(f"  Menus: 9 items")


if __name__ == "__main__":
    asyncio.run(seed())
