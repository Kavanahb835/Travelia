from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import SessionLocal
from app.models import Booking, TripDate, Package, User
from app.schemas import BookingCreate, BookingResponse

from sqlalchemy import func
from typing import Literal
from pydantic import BaseModel

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)


class BookingStatusUpdate(BaseModel):
    booking_status: Literal["Pending", "Confirmed", "Cancelled"]

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()



@router.post("/", response_model=BookingResponse)

@router.post("/", response_model=BookingResponse)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db)
):
    try:
        # 1. Check that the user exists
        user = db.query(User).filter(
            User.user_id == booking_data.user_id
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        # 2. Check whether this request was already processed
        existing_booking = db.query(Booking).filter(
            Booking.request_key == booking_data.request_key
        ).first()

        if existing_booking:
            # A key must not be reused for another booking payload.
            same_request = (
                existing_booking.user_id == booking_data.user_id
                and existing_booking.trip_date_id == booking_data.trip_date_id
                and existing_booking.travelers == booking_data.travelers
                and existing_booking.special_request == booking_data.special_request
            )

            if not same_request:
                raise HTTPException(
                    status_code=409,
                    detail="This booking request key was already used for another request."
                )

            return existing_booking

        # 3. Validate traveler count
        if booking_data.travelers < 1:
            raise HTTPException(
                status_code=400,
                detail="Travelers must be at least 1"
            )

        # 4. Lock the selected trip row to protect seat counts
        trip = db.query(TripDate).filter(
            TripDate.trip_date_id == booking_data.trip_date_id
        ).with_for_update().first()

        if not trip:
            raise HTTPException(
                status_code=404,
                detail="Trip date not found"
            )

        # 5. Reject past trips
        if trip.start_date < date.today():
            raise HTTPException(
                status_code=400,
                detail="This trip date has already passed"
            )

        # 6. Check available seats
        if trip.available_seats < booking_data.travelers:
            raise HTTPException(
                status_code=400,
                detail=f"Only {trip.available_seats} seats are available"
            )

        # 7. Find package
        package = db.query(Package).filter(
            Package.package_id == trip.package_id
        ).first()

        if not package:
            raise HTTPException(
                status_code=404,
                detail="Package not found"
            )

        # 8. Calculate total on the backend
        total_amount = package.price * booking_data.travelers

        # 9. Create booking with unique request key
        booking = Booking(
            user_id=booking_data.user_id,
            trip_date_id=booking_data.trip_date_id,
            travelers=booking_data.travelers,
            special_request=booking_data.special_request,
            total_amount=total_amount,
            booking_status="Pending",
            payment_status="Pending",
            request_key=booking_data.request_key
        )

        # 10. Reserve seats and create booking in one transaction
        trip.available_seats -= booking_data.travelers
        db.add(booking)
        db.commit()
        db.refresh(booking)

        return booking

    except IntegrityError:
        # The insert may have lost a race to another identical request.
        # Roll back first, so the failed transaction releases its changes.
        db.rollback()

        existing_booking = db.query(Booking).filter(
            Booking.request_key == booking_data.request_key
        ).first()

        if existing_booking:
            same_request = (
                existing_booking.user_id == booking_data.user_id
                and existing_booking.trip_date_id == booking_data.trip_date_id
                and existing_booking.travelers == booking_data.travelers
                and existing_booking.special_request == booking_data.special_request
            )

            if same_request:
                return existing_booking

            raise HTTPException(
                status_code=409,
                detail="This booking request key was already used for another request."
            )

        # This was a different database constraint failure.
        raise HTTPException(
            status_code=409,
            detail="Unable to save this booking due to a database conflict."
        )

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise



@router.put("/{booking_id}/demo-payment")
def complete_demo_payment(
    booking_id: int,
    db: Session = Depends(get_db)
):
    try:
        booking = (
            db.query(Booking)
            .filter(Booking.booking_id == booking_id)
            .with_for_update()
            .first()
        )

        if not booking:
            raise HTTPException(
                status_code=404,
                detail="Booking not found"
            )

        if booking.booking_status == "Cancelled":
            raise HTTPException(
                status_code=400,
                detail="Cancelled bookings cannot be paid."
            )

        # Make repeated requests safe.
        if booking.payment_status == "Demo Paid":
            return {
                "booking_id": booking.booking_id,
                "booking_status": booking.booking_status,
                "payment_status": booking.payment_status,
                "total_amount": float(booking.total_amount),
                "travelers": booking.travelers,
            }

        # Never turn an existing real payment into a demo payment.
        if booking.payment_status == "Paid":
            return {
                "booking_id": booking.booking_id,
                "booking_status": booking.booking_status,
                "payment_status": booking.payment_status,
                "total_amount": float(booking.total_amount),
                "travelers": booking.travelers,
            }

        booking.payment_status = "Demo Paid"
        booking.booking_status = "Confirmed"

        db.commit()
        db.refresh(booking)

        return {
            "booking_id": booking.booking_id,
            "booking_status": booking.booking_status,
            "payment_status": booking.payment_status,
            "total_amount": float(booking.total_amount),
            "travelers": booking.travelers,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to complete demo payment."
        )

@router.get("/user/{user_id}")
def get_user_bookings(
    user_id: int,
    db: Session = Depends(get_db)
):

    bookings = (
        db.query(
            Booking,
            TripDate,
            Package
        )
        .join(
            TripDate,
            Booking.trip_date_id == TripDate.trip_date_id
        )
        .join(
            Package,
            TripDate.package_id == Package.package_id
        )
        .filter(
            Booking.user_id == user_id
        )
        .order_by(
            Booking.created_at.desc()
        )
        .all()
    )

    result = []

    for booking, trip, package in bookings:

        result.append({
            "booking_id": booking.booking_id,
            "package_name": package.package_name,
            "destination": package.destination,
            "duration": package.duration,
            "image_url": package.image_url,
            "start_date": trip.start_date,
            "end_date": trip.end_date,
            "travelers": booking.travelers,
            "total_amount": booking.total_amount,
            "booking_status": booking.booking_status,
            "payment_status": booking.payment_status,
            "special_request": booking.special_request,
            "created_at": booking.created_at
        })

    return result



@router.get("/admin/stats")
def get_admin_stats(
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()

    total_bookings = db.query(Booking).count()

    confirmed_bookings = db.query(Booking).filter(
        Booking.booking_status == "Confirmed"
    ).count()

    pending_bookings = db.query(Booking).filter(
        Booking.booking_status == "Pending"
    ).count()

    total_revenue = db.query(
        func.coalesce(
            func.sum(Booking.total_amount),
            0
        )
    ).filter(
        Booking.payment_status == "Paid"
    ).scalar()

    return {
        "total_users": total_users,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "pending_bookings": pending_bookings,
        "total_revenue": float(total_revenue)
    }



@router.get("/admin/all")
def get_all_bookings(
    db: Session = Depends(get_db)
):
    """Return bookings with their customer, package, and trip details."""

    rows = (
        db.query(Booking, User, TripDate, Package)
        .join(User, Booking.user_id == User.user_id)
        .join(TripDate, Booking.trip_date_id == TripDate.trip_date_id)
        .join(Package, TripDate.package_id == Package.package_id)
        .order_by(Booking.created_at.desc(), Booking.booking_id.desc())
        .all()
    )

    return [
        {
            "booking_id": booking.booking_id,
            "user_id": user.user_id,
            "customer_name": user.full_name,
            "email": user.email,
            "package_name": package.package_name,
            "destination": package.destination,
            "start_date": trip.start_date,
            "end_date": trip.end_date,
            "travelers": booking.travelers,
            "total_amount": float(booking.total_amount),
            "booking_status": booking.booking_status,
            "payment_status": booking.payment_status,
            "special_request": booking.special_request,
            "created_at": booking.created_at,
        }
        for booking, user, trip, package in rows
    ]


@router.patch("/admin/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    status_data: BookingStatusUpdate,
    db: Session = Depends(get_db),
):
    """Update booking status and restore/reserve seats when necessary."""

    try:
        booking = (
            db.query(Booking)
            .filter(Booking.booking_id == booking_id)
            .with_for_update()
            .first()
        )

        if not booking:
            raise HTTPException(
                status_code=404,
                detail="Booking not found",
            )

        new_status = status_data.booking_status
        old_status = booking.booking_status

        if old_status == new_status:
            return {
                "message": "Booking status is already set",
                "booking_id": booking.booking_id,
                "booking_status": booking.booking_status,
            }

        trip = (
            db.query(TripDate)
            .filter(TripDate.trip_date_id == booking.trip_date_id)
            .with_for_update()
            .first()
        )

        if not trip:
            raise HTTPException(
                status_code=404,
                detail="Trip date not found",
            )

        # Cancelling a booking returns its seats.
        if old_status != "Cancelled" and new_status == "Cancelled":
            trip.available_seats += booking.travelers

        # Reopening a cancelled booking reserves seats again.
        elif old_status == "Cancelled" and new_status != "Cancelled":
            if trip.available_seats < booking.travelers:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Only {trip.available_seats} seats are available. "
                        "Cannot restore this booking."
                    ),
                )

            trip.available_seats -= booking.travelers

        booking.booking_status = new_status

        db.commit()
        db.refresh(booking)

        return {
            "message": "Booking status updated successfully",
            "booking_id": booking.booking_id,
            "booking_status": booking.booking_status,
            "payment_status": booking.payment_status,
            "available_seats": trip.available_seats,
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to update booking status",
        )