from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.auth.jwt import hash_password
from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import User, Vehicle
from app.routers import bookings, customers, payments, users, vehicles

SEED_VEHICLES = [
    ("JJ0001", "Toyota", "Innova Crysta", "SUV", 2022, 3500, "Automatic", "Diesel", 7, "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600", True),
    ("JJ0002", "Maruti Suzuki", "Swift", "Economy", 2021, 1500, "Manual", "Petrol", 5, "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600", True),
    ("JJ0003", "Honda", "City", "Sedan", 2023, 2200, "Automatic", "Petrol", 5, "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600", True),
    ("JJ0004", "Mahindra", "XUV700", "SUV", 2023, 4000, "Automatic", "Diesel", 7, "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600", False),
    ("JJ0005", "BMW", "5 Series", "Luxury", 2022, 8500, "Automatic", "Petrol", 5, "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600", True),
    ("JJ0006", "Toyota", "Fortuner", "SUV", 2021, 4500, "Automatic", "Diesel", 7, "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600", True),
    ("JJ0007", "Hyundai", "i20", "Economy", 2022, 1600, "Manual", "Petrol", 5, "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600", True),
    ("JJ0008", "Tesla", "Model 3", "Electric", 2023, 6000, "Automatic", "Electric", 5, "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600", True),
    ("JJ0009", "Toyota", "Innova Hycross", "Van", 2023, 3800, "Automatic", "Hybrid", 8, "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600", True),
    ("JJ0010", "Mercedes-Benz", "E-Class", "Luxury", 2021, 9000, "Automatic", "Petrol", 5, "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600", False),
    ("JJ0011", "Kia", "Seltos", "SUV", 2022, 3200, "Manual", "Petrol", 5, "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600", True),
    ("JJ0012", "Maruti Suzuki", "Ertiga", "Van", 2020, 2400, "Manual", "Petrol", 7, "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=600", True),
    ("JJ0013", "Skoda", "Slavia", "Sedan", 2023, 2500, "Automatic", "Petrol", 5, "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600", True),
    ("JJ0014", "Renault", "Kwid", "Economy", 2020, 1200, "Manual", "Petrol", 5, "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600", True),
    ("JJ0015", "MG", "ZS EV", "Electric", 2022, 5000, "Automatic", "Electric", 5, "https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=600", True),
]


def seed_database() -> None:
    with SessionLocal() as db:
        if not db.scalar(select(Vehicle.id).limit(1)):
            db.add_all([
                Vehicle(reg_number=reg, brand=brand, model=model, category=category, year=year,
                        price_per_day=price, transmission=transmission, fuel_type=fuel, seating_capacity=seats,
                        image=image, location="Mathagal", is_available=available)
                for reg, brand, model, category, year, price, transmission, fuel, seats, image, available in SEED_VEHICLES
            ])
        if not db.scalar(select(User.id).where(User.email == settings.admin_email.lower())):
            db.add(User(full_name="System Administrator", email=settings.admin_email.lower(),
                        password_hash=hash_password(settings.admin_password), role="admin"))
        db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list, allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])
app.include_router(users.router)
app.include_router(customers.router)
app.include_router(vehicles.router)
app.include_router(bookings.router)
app.include_router(payments.router)


@app.get("/health")
def health():
    return {"status": "ok"}
