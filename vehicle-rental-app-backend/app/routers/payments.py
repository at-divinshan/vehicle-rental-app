from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models import Booking, Payment, User
from app.schemas.payment import PaymentCreate, PaymentResponse

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("", response_model=PaymentResponse, status_code=201)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.get(Booking, payload.booking_id)
    if not booking or (booking.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Booking not found")
    payment = Payment(**payload.model_dump(), status="Paid")
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.get("/{booking_id}", response_model=list[PaymentResponse])
def list_payments(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.get(Booking, booking_id)
    if not booking or (booking.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Booking not found")
    return db.scalars(select(Payment).where(Payment.booking_id == booking_id)).all()
