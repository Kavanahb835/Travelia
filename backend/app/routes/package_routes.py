
from decimal import Decimal
from typing import Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Package, TripDate, Booking
from app.schemas import PackageResponse, TripDateResponse


router = APIRouter(
    prefix="/packages",
    tags=["Packages"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Request model for creating a package
class PackageCreate(BaseModel):
    package_name: str = Field(min_length=2, max_length=150)
    destination: str = Field(min_length=2, max_length=100)
    duration: str = Field(min_length=2, max_length=50)
    price: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    description: Optional[str] = None
    image_url: Optional[str] = None


# Request model for editing a package
class PackageUpdate(BaseModel):
    package_name: str = Field(min_length=2, max_length=150)
    destination: str = Field(min_length=2, max_length=100)
    duration: str = Field(min_length=2, max_length=50)
    price: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    description: Optional[str] = None
    image_url: Optional[str] = None


# Request model for creating a trip date
class TripDateCreate(BaseModel):
    start_date: date
    end_date: date
    available_seats: int = Field(ge=0)

    @classmethod
    def validate_dates(cls, values):
        return values


# Request model for editing a trip date
class TripDateUpdate(BaseModel):
    start_date: date
    end_date: date
    available_seats: int = Field(ge=0)


# Get all packages
@router.get("/", response_model=list[PackageResponse])
def get_packages(db: Session = Depends(get_db)):
    return db.query(Package).order_by(Package.package_id).all()


# Add a trip date for a package
@router.post("/{package_id}/trips", response_model=TripDateResponse, status_code=201)
def create_trip_date(
    package_id: int,
    trip_data: TripDateCreate,
    db: Session = Depends(get_db)
):
    package = db.query(Package).filter(
        Package.package_id == package_id
    ).first()

    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    if trip_data.start_date >= trip_data.end_date:
        raise HTTPException(
            status_code=400,
            detail="End date must be after start date."
        )

    trip = TripDate(
        package_id=package_id,
        start_date=trip_data.start_date,
        end_date=trip_data.end_date,
        available_seats=trip_data.available_seats
    )

    try:
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to create trip date."
        )


# Get trips for a package
@router.get(
    "/{package_id}/trips",
    response_model=list[TripDateResponse]
)
def get_package_trips(
    package_id: int,
    db: Session = Depends(get_db)
):
    package = db.query(Package).filter(
        Package.package_id == package_id
    ).first()

    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    return (
        db.query(TripDate)
        .filter(TripDate.package_id == package_id)
        .order_by(TripDate.start_date)
        .all()
    )


# Update a trip date
@router.put("/trips/{trip_date_id}", response_model=TripDateResponse)
def update_trip_date(
    trip_date_id: int,
    trip_data: TripDateUpdate,
    db: Session = Depends(get_db)
):
    trip = db.query(TripDate).filter(
        TripDate.trip_date_id == trip_date_id
    ).first()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip date not found")

    if trip_data.start_date >= trip_data.end_date:
        raise HTTPException(
            status_code=400,
            detail="End date must be after start date."
        )

    # Do not change departure or return dates if booking history exists.
    existing_booking = db.query(Booking).filter(
        Booking.trip_date_id == trip_date_id
    ).first()

    if existing_booking and (
        trip.start_date != trip_data.start_date
        or trip.end_date != trip_data.end_date
    ):
        raise HTTPException(
            status_code=409,
            detail="Dates cannot be changed because this trip has booking history."
        )

    trip.start_date = trip_data.start_date
    trip.end_date = trip_data.end_date
    trip.available_seats = trip_data.available_seats

    try:
        db.commit()
        db.refresh(trip)
        return trip
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to update trip date."
        )



# Delete a trip date only if no booking history exists
@router.delete("/trips/{trip_date_id}")
def delete_trip_date(
    trip_date_id: int,
    db: Session = Depends(get_db)
):
    trip = db.query(TripDate).filter(
        TripDate.trip_date_id == trip_date_id
    ).first()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip date not found")

    existing_booking = db.query(Booking).filter(
        Booking.trip_date_id == trip_date_id
    ).first()

    if existing_booking:
        raise HTTPException(
            status_code=409,
            detail="This trip has booking history and cannot be deleted."
        )

    try:
        db.delete(trip)
        db.commit()
        return {"message": "Trip date deleted successfully"}
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to delete trip date."
        )

# Get one package by ID
@router.get("/{package_id}", response_model=PackageResponse)
def get_package(
    package_id: int,
    db: Session = Depends(get_db)
):
    package = db.query(Package).filter(
        Package.package_id == package_id
    ).first()

    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    return package


# Add a package
@router.post("/", response_model=PackageResponse, status_code=201)
def create_package(
    package_data: PackageCreate,
    db: Session = Depends(get_db)
):
    package = Package(
        package_name=package_data.package_name.strip(),
        destination=package_data.destination.strip(),
        duration=package_data.duration.strip(),
        price=package_data.price,
        description=package_data.description,
        image_url=package_data.image_url,
    )

    try:
        db.add(package)
        db.commit()
        db.refresh(package)
        return package
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to create package"
        )


# Edit a package
@router.put("/{package_id}", response_model=PackageResponse)
def update_package(
    package_id: int,
    package_data: PackageUpdate,
    db: Session = Depends(get_db)
):
    package = db.query(Package).filter(
        Package.package_id == package_id
    ).first()

    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    package.package_name = package_data.package_name.strip()
    package.destination = package_data.destination.strip()
    package.duration = package_data.duration.strip()
    package.price = package_data.price
    package.description = package_data.description
    package.image_url = package_data.image_url

    try:
        db.commit()
        db.refresh(package)
        return package
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to update package"
        )


# Delete a package only when it has no trips or booking history
@router.delete("/{package_id}")
def delete_package(
    package_id: int,
    db: Session = Depends(get_db)
):
    package = db.query(Package).filter(
        Package.package_id == package_id
    ).first()

    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    trips = db.query(TripDate).filter(
        TripDate.package_id == package_id
    ).all()

    if trips:
        trip_ids = [trip.trip_date_id for trip in trips]

        existing_booking = db.query(Booking).filter(
            Booking.trip_date_id.in_(trip_ids)
        ).first()

        if existing_booking:
            raise HTTPException(
                status_code=409,
                detail="This package has booking history and cannot be deleted."
            )

        raise HTTPException(
            status_code=409,
            detail="This package has trip dates. Remove its trip dates first."
        )

    try:
        db.delete(package)
        db.commit()
        return {"message": "Package deleted successfully"}
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to delete package"
        )