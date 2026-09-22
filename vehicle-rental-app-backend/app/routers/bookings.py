from datetime import date
from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_user, require_admin
from app.database import get_db
from app.models import Booking, User, Vehicle
from app.schemas.booking import BookingCreate, BookingResponse, BookingStatusUpdate

router = APIRouter(prefix="/bookings", tags=["bookings"])
SERVICES = {"gps": 300, "childSeat": 250, "extraDriver": 500, "insurance": 800, "roadside": 400}


def booking_query():
    return select(Booking).options(joinedload(Booking.vehicle)).order_by(Booking.created_at.desc())


@router.get("", response_model=list[BookingResponse])
def list_bookings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = booking_query()
    if current_user.role != "admin":
        query = query.where(Booking.user_id == current_user.id)
    return db.scalars(query).unique().all()


@router.post("", response_model=BookingResponse, status_code=201)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vehicle = db.get(Vehicle, payload.vehicle_id)
    if not vehicle or not vehicle.is_available:
        raise HTTPException(status_code=400, detail="The selected vehicle is unavailable")
    if payload.return_date <= payload.pickup_date:
        raise HTTPException(status_code=400, detail="Return date must be after pickup date")
    rental_days = (payload.return_date - payload.pickup_date).days
    service_total = sum(SERVICES.get(service, 0) for service in payload.services)
    subtotal = Decimal(vehicle.price_per_day) * rental_days + Decimal(service_total)
    discount = Decimal(vehicle.price_per_day) * rental_days * Decimal("0.10") if rental_days >= 7 else Decimal(0)
    total = (subtotal * Decimal("1.08") - discount).quantize(Decimal("0.01"))
    booking = Booking(
        booking_id=f"BK-{uuid4().hex[:10].upper()}", user_id=current_user.id, vehicle_id=vehicle.id,
        customer_name=payload.customer_name, customer_phone=payload.customer_phone,
        customer_email=payload.customer_email, pickup_date=payload.pickup_date,
        return_date=payload.return_date, pickup_location=payload.pickup_location,
        return_location=payload.return_location, services=payload.services,
        rental_days=rental_days, total_amount=total,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.patch("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(booking_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.scalar(select(Booking).where(Booking.booking_id == booking_id))
    if not booking or (booking.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "Cancelled"
    db.commit()
    db.refresh(booking)
    return booking


@router.patch("/{booking_id}/status", response_model=BookingResponse)
def update_booking_status(booking_id: str, payload: BookingStatusUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    booking = db.scalar(select(Booking).where(Booking.booking_id == booking_id))
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = payload.status
    db.commit()
    db.refresh(booking)
    return booking
