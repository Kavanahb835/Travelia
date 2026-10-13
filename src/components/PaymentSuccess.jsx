import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();



  const downloadConfirmation = () => {
  const doc = new jsPDF();

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(`${value}`.slice(0, 10) + "T00:00:00");

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const amount = Number(booking.total_amount);

  doc.setFillColor(8, 127, 140);
  doc.rect(0, 0, 210, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(25);
  doc.setFont("helvetica", "bold");
  doc.text("TRAVELIA", 20, 17);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("TRAVEL BOOKING CONFIRMATION", 20, 28);

  doc.setTextColor(24, 59, 101);
  doc.setFontSize(19);
  doc.setFont("helvetica", "bold");
  doc.text("Booking Confirmed", 20, 55);

  doc.setTextColor(80, 95, 110);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Booking Reference: #${booking.booking_id}`, 20, 66);

  doc.setDrawColor(220, 230, 235);
  doc.line(20, 74, 190, 74);

  const details = [
    ["Package", packageData.package_name || "Not available"],
    ["Destination", packageData.destination || "Not available"],
    ["Departure", formatDate(trip.start_date)],
    ["Return", formatDate(trip.end_date)],
    ["Travelers", String(booking.travelers ?? "Not available")],
    ["Customer", bookingData?.name || "Not provided"],
    ["Email", bookingData?.email || "Not provided"],
    ["Booking Status", booking.booking_status || "Confirmed"],
    ["Payment Status", booking.payment_status || "Demo Paid"],
    ["Payment Type", "Demo payment - no real money charged"],
  ];

  let y = 88;

  details.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 95, 110);
    doc.text(`${label}:`, 20, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(35, 50, 70);

    const wrappedValue = doc.splitTextToSize(String(value), 105);
    doc.text(wrappedValue, 82, y);

    y += Math.max(9, wrappedValue.length * 6);
  });

  y += 5;

  doc.setFillColor(240, 250, 250);
  doc.roundedRect(20, y, 170, 23, 3, 3, "F");

  doc.setTextColor(8, 127, 140);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Total Amount: INR ${
      Number.isFinite(amount) ? amount.toLocaleString("en-IN") : "Unavailable"
    }`,
    27,
    y + 14
  );

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110, 120, 130);
  doc.text(
    "This document confirms a simulated payment for a portfolio project.",
    20,
    280
  );

  doc.save(`Travelia_Booking_${booking.booking_id}.pdf`);
};
  const {
    packageData,
    trip,
    booking,
    bookingData,
    paymentMethod,
    isDemoPayment,
  } = location.state || {};

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(`${value}`.slice(0, 10) + "T00:00:00");

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!booking || !packageData || !trip) {
    return (
      <section className="payment-success-section">
        <div className="payment-success-card">
          <h2>Booking Details Unavailable</h2>
          <p>Please open My Bookings to check your reservation.</p>
          <button
            className="success-primary-button"
            onClick={() => navigate("/my-bookings")}
          >
            View My Bookings
          </button>
        </div>
      </section>
    );
  }

  const amount = Number(booking.total_amount);
  const paymentStatus = booking.payment_status || "Demo Paid";

  return (
    <section className="payment-success-section">
      <div className="payment-success-card">
        <div className="success-icon" aria-label="Success">
          ✓
        </div>

        <p className="success-eyebrow">TRAVELIA BOOKING CONFIRMATION</p>
        <h1>You're Ready to Explore!</h1>
        <p className="success-intro">
          Your booking has been confirmed. Get ready for your next adventure!
        </p>

        <div className="demo-notice">
          <span>DEMO PAYMENT</span>
          <p>
            This was a simulated payment. No real money was charged.
          </p>
        </div>

        <div className="success-booking-header">
          <div>
            <span>BOOKING REFERENCE</span>
            <strong>#{booking.booking_id}</strong>
          </div>
          <span className="success-status">
            {booking.booking_status || "Confirmed"}
          </span>
        </div>

        <div className="success-trip">
          {packageData.image_url && (
            <img
              src={packageData.image_url}
              alt={packageData.package_name || "Travel destination"}
            />
          )}

          <div className="success-trip-info">
            <span className="success-label">YOUR TRIP</span>
            <h2>{packageData.package_name}</h2>
            <p>📍 {packageData.destination}</p>
            <p>
              📅 {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
            </p>
            <p>👥 {booking.travelers} traveler(s)</p>
          </div>
        </div>

        <div className="success-details">
          <div>
            <span>Payment method</span>
            <strong>
              {paymentMethod === "upi" ? "Demo UPI" : "Demo Card"}
            </strong>
          </div>

          <div>
            <span>Payment status</span>
            <strong className="success-paid-status">{paymentStatus}</strong>
          </div>

          <div>
            <span>Booking status</span>
            <strong>{booking.booking_status || "Confirmed"}</strong>
          </div>

          {bookingData?.name && (
            <div>
              <span>Booked by</span>
              <strong>{bookingData.name}</strong>
            </div>
          )}
        </div>

        <div className="success-total">
          <span>Total booking amount</span>
          <strong>
            {Number.isFinite(amount)
              ? `₹${amount.toLocaleString("en-IN")}`
              : "Amount unavailable"}
          </strong>
        </div>

        <div className="success-actions">
          <button
            className="success-primary-button"
            onClick={() => navigate("/my-bookings")}
          >
            View My Bookings →
          </button>
           <button
  className="success-primary-button"
  onClick={downloadConfirmation}
>
  ↓ Download Booking Confirmation (PDF)
</button>
          <button
            className="success-secondary-button"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>

        <p className="success-footer">
          Thank you for choosing Travelia. Your next adventure awaits!
        </p>
      </div>
    </section>
  );
}

export default PaymentSuccess;