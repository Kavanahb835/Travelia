import { useLocation, useNavigate } from "react-router-dom";

function BookingConfirmed() {

  const location = useLocation();
  const navigate = useNavigate();

  const {
    packageData,
    trip,
    booking,
    bookingData,
    paymentMethod
  } = location.state || {};


  // --------------------------------
  // Check booking information
  // --------------------------------

  if (!packageData || !trip || !booking) {

    return (
      <section className="booking-section">

        <div className="section-heading">

          <p className="small-title">
            BOOKING
          </p>

          <h2>
            Booking Information Missing
          </h2>

          <p>
            We couldn't find your booking details.
          </p>

          <button
            className="confirm-button"
            onClick={() => navigate("/")}
          >
            Back to Home →
          </button>

        </div>

      </section>
    );

  }


  // --------------------------------
  // Format date
  // --------------------------------

  const formatDate = (date) => {

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  };


  // --------------------------------
  // Total amount
  // --------------------------------

  const totalAmount =
    Number(booking.total_amount);


  return (

    <section className="booking-confirmed-section">

      <div className="booking-confirmed-container">


        {/* --------------------------------
            Success Header
        -------------------------------- */}

        <div className="booking-confirmed-header">

          <div className="booking-confirmed-icon">
            ✓
          </div>

          <p className="small-title">
            BOOKING CONFIRMED
          </p>

          <h1>
            Your Trip Is Confirmed! 🎉
          </h1>

          <p>
            Thank you for booking with Travelia.
            Your payment has been successfully completed.
          </p>

        </div>


        {/* --------------------------------
            Booking Card
        -------------------------------- */}

        <div className="booking-confirmed-card">


          {/* Booking ID */}

          <div className="confirmed-booking-id">

            <span>
              BOOKING ID
            </span>

            <strong>
              #{booking.booking_id}
            </strong>

          </div>


          {/* --------------------------------
              Trip Details
          -------------------------------- */}

          <div className="confirmed-section">

            <h3>
              ✈️ Trip Details
            </h3>


            <div className="confirmed-row">

              <span>
                Package
              </span>

              <strong>
                {packageData.package_name}
              </strong>

            </div>


            <div className="confirmed-row">

              <span>
                Destination
              </span>

              <strong>
                {packageData.destination}
              </strong>

            </div>


            <div className="confirmed-row">

              <span>
                Duration
              </span>

              <strong>
                {packageData.duration}
              </strong>

            </div>


            <div className="confirmed-row">

              <span>
                Departure
              </span>

              <strong>
                {formatDate(trip.start_date)}
              </strong>

            </div>


            <div className="confirmed-row">

              <span>
                Return
              </span>

              <strong>
                {formatDate(trip.end_date)}
              </strong>

            </div>


            <div className="confirmed-row">

              <span>
                Travelers
              </span>

              <strong>
                {booking.travelers}
              </strong>

            </div>

          </div>


          {/* --------------------------------
              Customer Details
          -------------------------------- */}

          <div className="confirmed-section">

            <h3>
              👤 Customer Details
            </h3>


            <div className="confirmed-row">

              <span>
                Name
              </span>

              <strong>
                {bookingData?.name || "N/A"}
              </strong>

            </div>


            <div className="confirmed-row">

              <span>
                Email
              </span>

              <strong>
                {bookingData?.email || "N/A"}
              </strong>

            </div>


            <div className="confirmed-row">

              <span>
                Phone
              </span>

              <strong>
                {bookingData?.phone || "N/A"}
              </strong>

            </div>

          </div>


          {/* --------------------------------
              Payment Details
          -------------------------------- */}

          <div className="confirmed-section">

            <h3>
              💳 Payment Details
            </h3>


            <div className="confirmed-row">

              <span>
                Payment Method
              </span>

              <strong>
                {paymentMethod === "upi"
                  ? "UPI"
                  : "Card"
                }
              </strong>

            </div>


            <div className="confirmed-row">

              <span>
                Payment Status
              </span>

              <strong className="payment-status">
                {booking.payment_status}
              </strong>

            </div>


            <div className="confirmed-total">

              <span>
                Amount Paid
              </span>

              <strong>
                ₹{totalAmount.toLocaleString("en-IN")}
              </strong>

            </div>

          </div>


          {/* --------------------------------
              Special Request
          -------------------------------- */}

          {bookingData?.message && (

            <div className="confirmed-section">

              <h3>
                📝 Special Request
              </h3>

              <p>
                {bookingData.message}
              </p>

            </div>

          )}


        </div>


        {/* --------------------------------
            Buttons
        -------------------------------- */}

        <div className="confirmed-actions">

          <button
            className="confirm-button"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>


          <button
            className="secondary-button"
            onClick={() =>
              navigate("/my-bookings")
            }
          >
            View My Bookings
          </button>

        </div>


        <p className="booking-confirmed-note">
          Please keep your booking ID
          <strong> #{booking.booking_id}</strong>
          {" "}for future reference.
        </p>


      </div>

    </section>

  );

}

export default BookingConfirmed;