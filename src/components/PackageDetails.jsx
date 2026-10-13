import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function PackageDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  // Package information
  const [packageData, setPackageData] = useState(null);

  // Trip information
  const [trips, setTrips] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Error state
  const [error, setError] = useState("");


  // Fetch package and trip information
  useEffect(() => {

    const fetchData = async () => {

      try {

        // Get package details
        const packageResponse = await fetch(
          `http://127.0.0.1:8000/packages/${id}`
        );

        if (!packageResponse.ok) {
          throw new Error("Package not found");
        }

        const packageData = await packageResponse.json();


        // Get trip dates
        const tripsResponse = await fetch(
          `http://127.0.0.1:8000/packages/${id}/trips`
        );

        if (!tripsResponse.ok) {
          throw new Error("Unable to load trip dates");
        }

        const tripsData = await tripsResponse.json();


        // Save data in React state
        setPackageData(packageData);
        setTrips(tripsData);

        setLoading(false);

      } catch (error) {

        console.error("Error fetching package details:", error);

        setError(error.message);
        setLoading(false);

      }

    };

    fetchData();

  }, [id]);


  // Show loading message
  if (loading) {

    return (
      <section className="package-not-found">

        <h2>
          Loading Package...
        </h2>

      </section>
    );

  }


  // Show error message
  if (error || !packageData) {

    return (
      <section className="package-not-found">

        <h2>
          Package Not Found
        </h2>

        <button onClick={() => navigate("/")}>
          ← Back to Home
        </button>

      </section>
    );

  }


  // Get today's date
  const today = new Date();

  today.setHours(0, 0, 0, 0);


  // Show only future trips
  const upcomingTrips = trips.filter((trip) => {

    const tripStartDate = new Date(trip.start_date);

    return tripStartDate >= today;

  });


  // Format date for display
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


  return (

    <section className="package-details-page">

      <div className="package-details-container">


        {/* BACK BUTTON */}

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back to Packages
        </button>


        {/* PACKAGE DETAILS */}

        <div className="package-details-card">


          {/* IMAGE */}

          <div className="package-details-image">

            <img
              src={packageData.image_url}
              alt={packageData.package_name}
            />

          </div>


          {/* PACKAGE INFORMATION */}

          <div className="package-details-content">

            <p className="package-location">
              📍 {packageData.destination}
            </p>


            <h1>
              {packageData.package_name}
            </h1>


            <p className="package-details-description">
              {packageData.description}
            </p>


            <div className="package-details-info">

              <div>

                <span>🗓️</span>

                <strong>
                  Duration
                </strong>

                <p>
                  {packageData.duration}
                </p>

              </div>


              <div>

                <span>👥</span>

                <strong>
                  Travelers
                </strong>

                <p>
                  2 People
                </p>

              </div>

            </div>


            {/* PRICE */}

            <div className="package-details-price">

              <small>
                Starting from
              </small>

              <strong>
                ₹{Number(packageData.price).toLocaleString("en-IN")}
              </strong>

            </div>

          </div>

        </div>


        {/* TRIP DATES */}

        <div className="trip-section">

          <div className="trip-section-heading">

            <p className="small-title">
              PLAN YOUR JOURNEY
            </p>

            <h2>
              Available Trip Dates
            </h2>

            <p>
              Choose one of our planned departure dates.
            </p>

          </div>


          <div className="trip-list">

            {upcomingTrips.length > 0 ? (

              upcomingTrips.map((trip) => {

                const isSoldOut =
                  trip.available_seats === 0;


                return (

                  <div
                    key={trip.trip_date_id}
                    className={`trip-option ${
                      isSoldOut ? "sold-out" : ""
                    }`}
                  >


                    {/* DATE AND SEATS */}

                    <div className="trip-date-info">

                      <span className="trip-label">
                        DEPARTURE
                      </span>


                      <h3>

                        {formatDate(trip.start_date)}

                        {" → "}

                        {formatDate(trip.end_date)}

                      </h3>


                      {isSoldOut ? (

                        <span className="sold-out-label">
                          🔴 SOLD OUT
                        </span>

                      ) : (

                        <span className="available-seats">

                          💺 {trip.available_seats}
                          {" "}
                          seats available

                        </span>

                      )}

                    </div>


                    {/* BOOK BUTTON */}

                    <button
                      type="button"
                      disabled={isSoldOut}
                      className="trip-book-button"
                      onClick={() => {

                        navigate("/booking", {

                          state: {
                            packageData,
                            trip
                          }

                        });

                      }}
                    >

                      {isSoldOut
                        ? "Sold Out"
                        : "Book This Trip"}

                    </button>

                  </div>

                );

              })

            ) : (

              <div className="no-trips">

                <p>
                  No upcoming trips are currently available.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </section>

  );

}

export default PackageDetails;