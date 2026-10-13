
import random
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import User, OTPVerification
from app.email_service import send_otp_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

password_hash = PasswordHash.recommended()


# ---------- Database connection ----------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- Request models ----------

class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class EmailRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    user_id: int
    otp_code: str = Field(pattern=r"^\d{6}$")


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(pattern=r"^\d{6}$")
    new_password: str = Field(min_length=8, max_length=128)


# ---------- Helper: create and send OTP ----------

def create_and_send_otp(db: Session, user: User, purpose: str):
    # Invalidate previous unused OTPs for this purpose.
    db.query(OTPVerification).filter(
        OTPVerification.user_id == user.user_id,
        OTPVerification.purpose == purpose,
        OTPVerification.is_used.is_(False)
    ).update(
        {"is_used": True},
        synchronize_session=False
    )

    otp_code = str(random.randint(100000, 999999))
    now = datetime.now()

    otp = OTPVerification(
        user_id=user.user_id,
        otp_code=otp_code,
        purpose=purpose,
        expires_at=now + timedelta(minutes=5),
        is_used=False,
        created_at=now
    )

    db.add(otp)
    db.commit()

    try:
        send_otp_email(user.email, otp_code)
    except Exception:
        # Do not leave a failed-to-send OTP usable.
        otp.is_used = True
        db.commit()
        raise HTTPException(
            status_code=500,
            detail="Unable to send OTP email. Please try again."
        )

    return {"message": "OTP sent successfully. It expires in 5 minutes."}


# ---------- Registration ----------

@router.post("/register")
def register_user(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    email = str(request.email).strip().lower()
    full_name = request.full_name.strip()

    if not full_name:
        raise HTTPException(status_code=400, detail="Please enter your full name.")

    user = db.query(User).filter(User.email == email).first()

    if user and user.email_verified:
        raise HTTPException(
            status_code=400,
            detail="This email is already registered. Please log in."
        )

    hashed_password = password_hash.hash(request.password)

    if user:
        # Allow an unverified registration to be retried.
        user.full_name = full_name
        user.password_hash = hashed_password
    else:
        user = User(
            full_name=full_name,
            email=email,
            phone=None,
            password_hash=hashed_password,
            email_verified=False,
            phone_verified=False,
            role="customer",
            created_at=datetime.now()
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    result = create_and_send_otp(db, user, "registration")

    return {
        **result,
        "user_id": user.user_id,
        "email": user.email
    }


@router.post("/resend-registration-otp")
def resend_registration_otp(
    request: EmailRequest,
    db: Session = Depends(get_db)
):
    email = str(request.email).strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Account not found. Please register first."
        )

    if user.email_verified:
        raise HTTPException(
            status_code=400,
            detail="This email is already verified. Please log in."
        )

    return create_and_send_otp(db, user, "registration")


# ---------- Verify registration OTP ----------

@router.post("/verify-otp")
def verify_registration_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.user_id == request.user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")

    if user.email_verified:
        raise HTTPException(status_code=400, detail="Email is already verified.")

    now = datetime.now()

    otp = db.query(OTPVerification).filter(
        OTPVerification.user_id == user.user_id,
        OTPVerification.otp_code == request.otp_code,
        OTPVerification.purpose == "registration",
        OTPVerification.is_used.is_(False),
        OTPVerification.expires_at > now
    ).order_by(OTPVerification.created_at.desc()).first()

    if not otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP. Please request a new one."
        )

    otp.is_used = True
    user.email_verified = True
    db.commit()

    return {
        "message": "Email verified successfully.",
        "user_id": user.user_id,
        "role": user.role or "customer"
    }


# ---------- Login using email and password ----------

@router.post("/login")
def login_user(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    email = str(request.email).strip().lower()
    user = db.query(User).filter(User.email == email).first()

    # Use the same message for an unknown email and incorrect password.
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if not password_hash.verify(request.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if not user.email_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in."
        )

    return {
        "message": "Login successful.",
        "user_id": user.user_id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role or "customer"
    }


# ---------- Forgot password: send OTP ----------

@router.post("/forgot-password")
def forgot_password(
    request: EmailRequest,
    db: Session = Depends(get_db)
):
    email = str(request.email).strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if not user or not user.email_verified:
        raise HTTPException(
            status_code=404,
            detail="Verified account not found for this email."
        )

    return create_and_send_otp(db, user, "password_reset")


# ---------- Reset password after OTP verification ----------

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    email = str(request.email).strip().lower()
    user = db.query(User).filter(
        User.email == email,
        User.email_verified.is_(True)
    ).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Unable to reset password. Check your email and OTP."
        )

    now = datetime.now()

    otp = db.query(OTPVerification).filter(
        OTPVerification.user_id == user.user_id,
        OTPVerification.otp_code == request.otp_code,
        OTPVerification.purpose == "password_reset",
        OTPVerification.is_used.is_(False),
        OTPVerification.expires_at > now
    ).order_by(OTPVerification.created_at.desc()).first()

    if not otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP. Please request a new one."
        )

    user.password_hash = password_hash.hash(request.new_password)
    otp.is_used = True
    db.commit()

    return {
        "message": "Password reset successfully. Please log in with your new password."
    }