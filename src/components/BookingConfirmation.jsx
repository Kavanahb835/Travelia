
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_URL from "./api";


const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    packageData,
    trip,
    bookingData,
    userId,
    bookingRequestKey: passedRequestKey,
  } = location.state || {};

  // Reuse the same key for Strict Mode runs and page refreshes.
  // A new booking attempt should receive a new key from Booking.jsx.
  const [requestKey] = useState(() => {
    if (passedRequestKey) {
      sessionStorage.setItem(
        "travelia_booking_request_key",
        passedRequestKey
      );
      return passedRequestKey;
    }

    const savedKey = sessionStorage.getItem(
      "travelia_booking_request_key"
    );

    if (savedKey) return savedKey;

    const newKey = crypto.randomUUID();

    sessionStorage.setItem(
      "travelia_booking_request_key",
      newKey
    );

    return newKey;
  });

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function createBooking() {
      if (!packageData || !trip || !bookingData || !userId) {
        setError("Booking information is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/bookings/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: Number(userId),
            trip_date_id: Number(trip.trip_date_id),
            travelers: Number(bookingData.travelers),
            special_request: bookingData.message || null,
            request_key: requestKey,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
  const message = Array.isArray(data.detail)
    ? data.detail
        .map((item) => {
          const field = Array.isArray(item.loc)
            ? item.loc.join(" → ")
            : "Request";

          return `${field}: ${item.msg}`;
        })
        .join("\n")
    : typeof data.detail === "string"
      ? data.detail
      : JSON.stringify(data.detail || data);

  throw new Error(message || "Unable to create booking.");
}

        if (!cancelled) {
          setBooking(data);
        }
      } catch (err) {
        console.error("Booking creation error:", err);

        if (!cancelled) {
          setError(
            err.message || "Unable to create your booking."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    createBooking();

    return () => {
      cancelled = true;
    };
  }, [
    packageData,
    trip,
    bookingData,
    userId,
    requestKey,
  ]);

  const formatDate = (value) => {
    if (!value) return "Not available";

    const parsedDate = new Date(`${value}`.slice(0, 10) + "T00:00:00");

    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <section className="booking-confirmation">
        <div className="booking-confirmation-container">
          <h2>Creating Your Booking...</h2>
          <p>Please wait while we confirm your trip.</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="booking-confirmation">
        <div className="booking-confirmation-container">
          <h2>Booking Could Not Be Completed</h2>
          <p
  className="form-error"
  style={{ whiteSpace: "pre-line" }}
>
  {error}
</p>

          <button
            className="confirm-button"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </section>
    );
  }

  if (!booking) return null;

  return (
    <section className="booking-confirmation">
      <div className="booking-confirmation-container">
        <div className="section-heading">
          <p className="small-title">BOOKING SUMMARY</p>
          <h2>Review Your Trip</h2>
          <p>Your booking has been created successfully.</p>
        </div>

        <div className="booking-summary-card">
          <div className="booking-summary-header">
            <div>
              <span>Booking ID</span>
              <strong>#{booking.booking_id}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{booking.booking_status}</strong>
            </div>
          </div>

          <div className="booking-summary-section">
            <h3>Trip Details</h3>

            <div className="summary-row">
              <span>Package</span>
              <strong>{packageData.package_name}</strong>
            </div>

            <div className="summary-row">
              <span>Destination</span>
              <strong>{packageData.destination}</strong>
            </div>

            <div className="summary-row">
              <span>Duration</span>
              <strong>{packageData.duration}</strong>
            </div>

            <div className="summary-row">
              <span>Departure</span>
              <strong>{formatDate(trip.start_date)}</strong>
            </div>

            <div className="summary-row">
              <span>Return</span>
              <strong>{formatDate(trip.end_date)}</strong>
            </div>

            <div className="summary-row">
              <span>Travelers</span>
              <strong>{booking.travelers}</strong>
            </div>
          </div>

          <div className="booking-summary-section">
            <h3>Customer Details</h3>

            <div className="summary-row">
              <span>Name</span>
              <strong>{bookingData.name}</strong>
            </div>

            <div className="summary-row">
              <span>Email</span>
              <strong>{bookingData.email}</strong>
            </div>

            <div className="summary-row">
              <span>Phone</span>
              <strong>{bookingData.phone}</strong>
            </div>
          </div>

          <div className="booking-total">
            <span>Total Amount</span>
            <strong>
              ₹{Number(booking.total_amount).toLocaleString("en-IN")}
            </strong>
          </div>

          <button
            className="confirm-button"
            onClick={() =>
              navigate("/payment", {
                state: {
                  packageData,
                  trip,
                  booking,
                  bookingData,
                },
              })
            }
          >
            Proceed to Payment →
          </button>
        </div>
      </div>
    </section>
  );
}

export default BookingConfirmation;
