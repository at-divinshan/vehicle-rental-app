from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, JSON, Numeric, String
from sqlalchemy.dialects.mysql import DATETIME as MySQLDateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    booking_id: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    customer_name: Mapped[str] = mapped_column(String(120))
    customer_phone: Mapped[str] = mapped_column(String(30))
    customer_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    pickup_date: Mapped[date] = mapped_column(Date)
    return_date: Mapped[date] = mapped_column(Date)
    pickup_location: Mapped[str] = mapped_column(String(120))
    return_location: Mapped[str] = mapped_column(String(120))
    services: Mapped[list[str]] = mapped_column(JSON, default=list)
    rental_days: Mapped[int]
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    status: Mapped[str] = mapped_column(String(30), default="Confirmed")
    created_at: Mapped[datetime] = mapped_column(DateTime().with_variant(MySQLDateTime(fsp=6), "mysql"), default=datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    vehicle = relationship("Vehicle", back_populates="bookings")
    payments = relationship("Payment", back_populates="booking")
