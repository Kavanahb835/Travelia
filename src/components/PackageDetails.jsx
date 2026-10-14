
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_URL from "../api";

function PackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [packageData, setPackageData] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError("");
      setPackageData(null);
      setTrips([]);

      try {
        // Fetch all packages and find the selected package.
        // This also works if the backend has no single-package endpoint.
        const response = await fetch(`${API_URL}/packages/`);

        if (!response.ok) {
          throw new Error(
            `Unable to load packages: ${response.status}`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid packages response from server.");
        }

        const selectedPackage = data.find(
          (item) => String(item.package_id) === String(id)
        );

        if (!selectedPackage) {
          throw new Error("Package not found.");
        }

        if (cancelled) return;

        setPackageData(selectedPackage);

        // Trip dates are optional; package details should still display
        // if the trips endpoint is unavailable.
        try {
          const tripsResponse = await fetch(
            `${API_URL}/packages/${id}/trips/`
          );

          if (tripsResponse.ok) {
            const tripsData = await tripsResponse.json();

            if (!cancelled) {
              setTrips(Array.isArray(tripsData) ? tripsData : []);
            }
          }
        } catch (tripError) {
          console.warn("Could not load trip dates:", tripError);
        }
      } catch (err) {
        console.error("Error fetching package details:", err);

        if (!cancelled) {
          setError(err.message || "Unable to load package details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="package-not-found">
        <h2>Loading Package...</h2>
      </section>
    );
  }

  if (error || !packageData) {
    return (
      <section className="package-not-found">
        <h2>Package Not Found</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>
          ← Back to Home
        </button>
      </section>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTrips = trips.filter((trip) => {
    if (!trip.start_date) return false;

    const tripStartDate = new Date(trip.start_date);
    return !Number.isNaN(tripStartDate.getTime()) &&
      tripStartDate >= today;
  });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <section className="package-details-page">
      <div className="package-details-container">
        <button
          className="back-button"
          onClick={() => navigate("/?section=packages")}
        >
          ← Back to Packages
        </button>

        <div className="package-details-card">
          <div className="package-details-image">
            <img
              src={packageData.image_url || "/images/kashmir.jpg"}
              alt={packageData.package_name}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/images/kashmir.jpg";
              }}
            />
          </div>

          <div className="package-details-content">
            <p className="package-location">
              📍 {packageData.destination}
            </p>

            <h1>{packageData.package_name}</h1>

            <p className="package-details-description">
              {packageData.description}
            </p>

            <div className="package-details-info">
              <div>
                <span>🗓️</span>
                <strong>Duration</strong>
                <p>{packageData.duration}</p>
              </div>

              <div>
                <span>👥</span>
                <strong>Travelers</strong>
                <p>2 People</p>
              </div>
            </div>

            <div className="package-details-price">
              <small>Starting from</small>
              <strong>
                ₹
                {Number(packageData.price).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        </div>

        <div className="trip-section">
          <div className="trip-section-heading">
            <p className="small-title">PLAN YOUR JOURNEY</p>
            <h2>Available Trip Dates</h2>
            <p>Choose one of our planned departure dates.</p>
          </div>

          <div className="trip-list">
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map((trip) => {
                const isSoldOut =
                  Number(trip.available_seats) <= 0;

                return (
                  <div
                    key={trip.trip_date_id}
                    className={`trip-option ${
                      isSoldOut ? "sold-out" : ""
                    }`}
                  >
                    <div className="trip-date-info">
                      <span className="trip-label">DEPARTURE</span>

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
                          💺 {trip.available_seats} seats available
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isSoldOut}
                      className="trip-book-button"
                      onClick={() =>
                        navigate("/booking", {
                          state: { packageData, trip },
                        })
                      }
                    >
                      {isSoldOut ? "Sold Out" : "Book This Trip"}
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
