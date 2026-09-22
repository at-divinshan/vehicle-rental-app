from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PaymentCreate(BaseModel):
    booking_id: int
    amount: Decimal = Field(gt=0)
    method: str = Field(min_length=2, max_length=30)
    transaction_reference: str | None = None


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    amount: Decimal
    method: str
    status: str
    transaction_reference: str | None
    created_at: datetime
