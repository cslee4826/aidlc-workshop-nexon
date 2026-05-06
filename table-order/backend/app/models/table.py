from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Table(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "tables"
    __table_args__ = (
        UniqueConstraint("store_id", "table_number", name="uq_table_store_number"),
    )

    store_id: Mapped[str] = mapped_column(String(36), ForeignKey("stores.id"), nullable=False)
    table_number: Mapped[int] = mapped_column(Integer, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    store = relationship("Store", back_populates="tables")
    sessions = relationship("TableSession", back_populates="table", lazy="selectin")


class TableSession(Base, UUIDMixin):
    __tablename__ = "table_sessions"

    table_id: Mapped[str] = mapped_column(String(36), ForeignKey("tables.id"), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    table = relationship("Table", back_populates="sessions")
    orders = relationship("Order", back_populates="session", lazy="selectin")
