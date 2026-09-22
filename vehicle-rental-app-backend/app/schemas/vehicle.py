from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    reg_number: str
    brand: str
    model: str
    category: str
    year: int
    price_per_day: Decimal
    transmission: str
    fuel_type: str
    seating_capacity: int
    image: str | None
    location: str
    is_available: bool


class VehicleUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    reg_number: str = Field(min_length=1, max_length=30)
    brand: str = Field(min_length=1, max_length=80)
    model: str = Field(min_length=1, max_length=80)
    category: str = Field(min_length=1, max_length=40)
    year: int = Field(ge=1900, le=2100)
    price_per_day: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    transmission: str = Field(min_length=1, max_length=30)
    fuel_type: str = Field(min_length=1, max_length=30)
    seating_capacity: int = Field(ge=1, le=100)
    image: str | None = Field(default=None, max_length=500)
    location: str = Field(min_length=1, max_length=120)
    is_available: bool

    @field_validator("image")
    @classmethod
    def validate_image(cls, value):
        if value and not value.startswith(("https://", "http://", "/")):
            raise ValueError("Use an HTTP(S) image URL or a path beginning with /")
        return value or None
