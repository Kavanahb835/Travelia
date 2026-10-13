import { useNavigate } from "react-router-dom";

function PackageCard({ packageData }) {

  const navigate = useNavigate();

  return (
    <div className="package-card">

      {/* PACKAGE IMAGE */}
      <img
  src={packageData.image_url}
  alt={packageData.package_name}
  onError={(event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/images/kashmir.jpg";
    event.currentTarget.src = "/images/kashmir12.jpg";
  }}
/>

      <div className="package-info">

        {/* LOCATION */}
        <div className="package-location">
          📍 {packageData.destination}
        </div>

        {/* PACKAGE NAME */}
        <h3>
          {packageData.package_name}
        </h3>

        {/* DESCRIPTION */}
        <p>
          {packageData.description}
        </p>

        {/* PACKAGE DETAILS */}
        <div className="package-details">

          <span>
            🗓️ {packageData.duration}
          </span>

          <span>
            👥 2 People
          </span>

        </div>

        {/* PRICE + BUTTON */}
        <div className="package-bottom">

          <div>

            <small>
              Starting from
            </small>

            <strong>
              ₹{Number(packageData.price).toLocaleString("en-IN")}
            </strong>

          </div>

          <button
            onClick={() =>
              navigate(`/packages/${packageData.package_id}`)
            }
          >
            View Details
          </button>

        </div>

      </div>

    </div>
  );
}

export default PackageCard;