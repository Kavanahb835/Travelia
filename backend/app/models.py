from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, Date, ForeignKey, Boolean
from app.database import Base


class Package(Base):

    __tablename__ = "packages"

    package_id = Column(Integer, primary_key=True)
    package_name = Column(String(150), nullable=False)
    destination = Column(String(100), nullable=False)
    duration = Column(String(50), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    description = Column(Text)
    image_url = Column(Text)
    created_at = Column(DateTime)

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True)
    phone = Column(String(15), unique=True)
    email_verified = Column(Boolean, default=False)
    phone_verified = Column(Boolean, default=False)
    role = Column(String(20), default="customer")
    created_at = Column(DateTime)
    
    password_hash = Column(String(255), nullable=True)


class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    otp_id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )
    otp_code = Column(String(6), nullable=False)
    purpose = Column(String(30), default="registration")
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime)


class TripDate(Base):

    __tablename__ = "trip_dates"

    trip_date_id = Column(Integer, primary_key=True)

    package_id = Column(
        Integer,
        ForeignKey("packages.package_id"),
        nullable=False
    )

    start_date = Column(Date, nullable=False)

    end_date = Column(Date, nullable=False)

    available_seats = Column(
        Integer,
        nullable=False
    )


class Booking(Base):
    __tablename__ = "bookings"

    request_key = Column(
    String(36),
    unique=True,
    nullable=True
)
    

    booking_id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    trip_date_id = Column(
        Integer,
        ForeignKey("trip_dates.trip_date_id"),
        nullable=False
    )

    travelers = Column(
        Integer,
        nullable=False
    )

    special_request = Column(
        Text
    )

    total_amount = Column(
        Numeric(10, 2),
        nullable=False
    )

    booking_status = Column(
        String(30),
        default="Pending"
    )

    payment_status = Column(
        String(30),
        default="Pending"
    )

      

    created_at = Column(
        DateTime
    )

  