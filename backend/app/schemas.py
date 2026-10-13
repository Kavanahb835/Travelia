from pydantic import BaseModel
from datetime import date
from typing import Optional

class PackageResponse(BaseModel):

    package_id: int
    package_name: str
    destination: str
    duration: str
    price: float
    description: str | None = None
    image_url: str | None = None

    class Config:
        from_attributes = True

class TripDateResponse(BaseModel):

    trip_date_id: int
    package_id: int
    start_date: date
    end_date: date
    available_seats: int

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    user_id: int
    trip_date_id: int
    travelers: int
    special_request: Optional[str] = None
    request_key: str


class BookingResponse(BaseModel):

    booking_id: int
    user_id: int
    trip_date_id: int
    travelers: int
    special_request: str | None = None
    total_amount: float
    booking_status: str
    payment_status: str

    class Config:
        from_attributes = True