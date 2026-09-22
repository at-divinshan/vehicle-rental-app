from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Numeric, String
from sqlalchemy.dialects.mysql import DATETIME as MySQLDateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True)
    reg_number: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    brand: Mapped[str] = mapped_column(String(80))
    model: Mapped[str] = mapped_column(String(80))
    category: Mapped[str] = mapped_column(String(40))
    year: Mapped[int]
    price_per_day: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    transmission: Mapped[str] = mapped_column(String(30))
    fuel_type: Mapped[str] = mapped_column(String(30))
    seating_capacity: Mapped[int]
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    location: Mapped[str] = mapped_column(String(120))
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime().with_variant(MySQLDateTime(fsp=6), "mysql"), default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="vehicle")
