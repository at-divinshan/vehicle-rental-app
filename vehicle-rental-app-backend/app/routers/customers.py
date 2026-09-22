from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.dependencies import require_admin
from app.database import get_db
from app.models import User
from app.schemas.user import CustomerUpdate, UserResponse

router = APIRouter(prefix="/customers", tags=["customers"], dependencies=[Depends(require_admin)])


@router.get("", response_model=list[UserResponse])
def list_customers(db: Session = Depends(get_db)):
    return db.scalars(select(User).where(User.role == "user").order_by(User.full_name, User.id)).all()


@router.put("/{customer_id}", response_model=UserResponse)
def update_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db)):
    customer = db.get(User, customer_id)
    if not customer or customer.role != "user":
        raise HTTPException(status_code=404, detail="Customer not found")
    values = payload.model_dump()
    values["email"] = str(payload.email).lower()
    values["phone"] = payload.phone or None
    for field, value in values.items():
        setattr(customer, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists") from None
    db.refresh(customer)
    return customer
