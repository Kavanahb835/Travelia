import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_URL from "../api";
function MyBookings() {

  const location = useLocation();
  const navigate = useNavigate();

  const userId =
    location.state?.userId ||
    sessionStorage.getItem("userId");

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  useEffect(() => {

    const fetchBookings = async () => {

      if (!userId) {

        setError(
          "Please verify your email before viewing your bookings."
        );

        setLoading(false);

        return;
      }


      try {

        const response = await fetch(
          `${API_URL}/bookings/user/${userId}`
        );


        const data = await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Unable to load bookings."
          );

        }


        setBookings(data);

      } catch (error) {

        console.error(
          "My bookings error:",
          error
        );

        setError(
          error.message ||
          "Unable to load bookings."
        );

      } finally {

        setLoading(false);

      }

    };


    fetchBookings();

  }, [userId]);


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


  if (loading) {

    return (
      <section className="booking-section">

        <div className="section-heading">

          <p className="small-title">
            MY BOOKINGS
          </p>

          <h2>
            Loading Your Bookings...
          </h2>

        </div>

      </section>
    );

  }


  if (error) {

    return (
      <section className="booking-section">

        <div className="section-heading">

          <p className="small-title">
            MY BOOKINGS
          </p>

          <h2>
            Unable to Load Bookings
          </h2>

          <p className="form-error">
            {error}
          </p>

          <button
            className="confirm-button"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>

        </div>

      </section>
    );

  }


  return (

    <section className="my-bookings-section">

      <div className="my-bookings-container">

        <div className="section-heading">

          <p className="small-title">
            TRAVEL HISTORY
          </p>

          <h2>
            My Bookings
          </h2>

          <p>
            View your upcoming and previous trips.
          </p>

        </div>


        {bookings.length === 0 ? (

          <div className="no-bookings">

            <h3>
              No Bookings Yet
            </h3>

            <p>
              You haven't booked any trips yet.
            </p>

            <button
              className="confirm-button"
              onClick={() => navigate("/")}
            >
              Explore Packages →
            </button>

          </div>

        ) : (

          <div className="my-bookings-list">

            {bookings.map((booking) => (

              <div
                className="my-booking-card"
                key={booking.booking_id}
              >

                <div className="my-booking-image">

                  <img
                    src={booking.image_url}
                    alt={booking.package_name}
                  />

                </div>


                <div className="my-booking-content">

                  <div className="my-booking-header">

                    <div>

                      <small>
                        BOOKING #{booking.booking_id}
                      </small>

                      <h3>
                        {booking.package_name}
                      </h3>

                    </div>

                    <span
                      className="booking-status"
                    >
                      {booking.booking_status}
                    </span>

                  </div>


                  <p>
                    📍 {booking.destination}
                  </p>


                  <div className="my-booking-details">

                    <div>

                      <small>
                        TRAVEL DATE
                      </small>

                      <strong>
                        {formatDate(
                          booking.start_date
                        )}

                        {" → "}

                        {formatDate(
                          booking.end_date
                        )}
                      </strong>

                    </div>


                    <div>

                      <small>
                        TRAVELERS
                      </small>

                      <strong>
                        {booking.travelers}
                      </strong>

                    </div>


                    <div>

                      <small>
                        PAYMENT
                      </small>

                      <strong>
                        {booking.payment_status}
                      </strong>

                    </div>

                  </div>


                  <div className="my-booking-footer">

                    <strong>
                      ₹
                      {Number(
                        booking.total_amount
                      ).toLocaleString("en-IN")}
                    </strong>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}


        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

      </div>

    </section>

  );

}

export default MyBookings;