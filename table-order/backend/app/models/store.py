from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Store(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "stores"

    store_identifier: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    admins = relationship("Admin", back_populates="store", lazy="selectin")
    tables = relationship("Table", back_populates="store", lazy="selectin")
    categories = relationship("Category", back_populates="store", lazy="selectin")
    menu_items = relationship("MenuItem", back_populates="store", lazy="selectin")
