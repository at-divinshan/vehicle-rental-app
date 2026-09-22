from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class BookingCreate(BaseModel):
    vehicle_id: int
    customer_name: str = Field(min_length=2, max_length=120)
    customer_phone: str = Field(min_length=3, max_length=30)
    customer_email: str | None = None
    pickup_date: date
    return_date: date
    pickup_location: str = Field(min_length=2, max_length=120)
    return_location: str = Field(min_length=2, max_length=120)
    services: list[str] = []


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: str
    vehicle_id: int
    customer_name: str
    customer_phone: str
    customer_email: str | None
    pickup_date: date
    return_date: date
    pickup_location: str
    return_location: str
    services: list[str]
    rental_days: int
    total_amount: Decimal
    status: str
    created_at: datetime


class BookingStatusUpdate(BaseModel):
    status: str = Field(pattern="^(Confirmed|Cancelled|Completed)$")
