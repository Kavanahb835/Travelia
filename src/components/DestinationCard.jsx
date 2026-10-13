
import { useNavigate } from "react-router-dom";

function DestinationCard({ destination }) {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate(
      `/destinations/${encodeURIComponent(
        destination.name.toLowerCase().trim().replace(/\s+/g, "-")
      )}`
    );
  };

  return (
    <div className="destination-card">
      <img
        src={destination.image}
        alt={destination.name}
      />

      <div className="destination-info">
        <h3>{destination.name}</h3>
        <p>{destination.description}</p>

        <button onClick={handleExplore}>
          Explore →
        </button>
      </div>
    </div>
  );
}

export default DestinationCard;
