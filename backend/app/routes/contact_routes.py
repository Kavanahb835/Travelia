
import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

load_dotenv()

router = APIRouter(prefix="/contact", tags=["Contact"])


class ContactMessage(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=254)
    message: str = Field(min_length=5, max_length=5000)

    @field_validator("name", "email", "message")
    @classmethod
    def strip_whitespace(cls, value: str) -> str:
        return value.strip()


@router.post("/")
def send_contact_message(contact: ContactMessage):
    recipient = os.getenv("EMAIL_ADDRESS")
    app_password = os.getenv("EMAIL_APP_PASSWORD")

    if not recipient or not app_password:
        raise HTTPException(
            status_code=500,
            detail="Contact email service is not configured.",
        )

    email_message = EmailMessage()
    email_message["Subject"] = f"Travelia website message from {contact.name}"
    email_message["From"] = recipient
    email_message["To"] = recipient
    email_message["Reply-To"] = contact.email

    email_message.set_content(
        f"""New message received from the Travelia website.

Name: {contact.name}
Customer email: {contact.email}

Message:
{contact.message}
"""
    )

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=20) as server:
            server.login(recipient, app_password)
            server.send_message(email_message)

    except (smtplib.SMTPException, OSError):
        raise HTTPException(
            status_code=502,
            detail="We could not send your message right now. Please try again.",
        )

    return {
        "message": "Thank you! Your message has been sent to Travelia."
    }
