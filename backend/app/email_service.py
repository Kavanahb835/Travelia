import os
import smtplib

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from dotenv import load_dotenv


load_dotenv()


EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_APP_PASSWORD = os.getenv("EMAIL_APP_PASSWORD")


def send_otp_email(
    recipient_email: str,
    otp_code: str
):

    subject = "Travelia - Your OTP"

    body = f"""
Hello,

Your Travelia verification OTP is:

{otp_code}

This OTP is valid for 5 minutes.

Please do not share this OTP with anyone.

Thank you,
Travelia
"""


    message = MIMEMultipart()

    message["From"] = EMAIL_ADDRESS
    message["To"] = recipient_email
    message["Subject"] = subject

    message.attach(
        MIMEText(body, "plain")
    )


    with smtplib.SMTP(
        "smtp.gmail.com",
        587
    ) as server:

        server.starttls()

        server.login(
            EMAIL_ADDRESS,
            EMAIL_APP_PASSWORD
        )

        server.sendmail(
            EMAIL_ADDRESS,
            recipient_email,
            message.as_string()
        )


if __name__ == "__main__":
    send_otp_email(
        "kavanahb482@gmail.com",
        "123456"
    )
    print("Test email sent successfully")