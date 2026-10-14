
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

const destinationInfo = {
  goa: {
    name: "Goa",
    tagline: "Sunshine, beaches and unforgettable memories.",
    description:
      "Discover golden beaches, beautiful sunsets, Portuguese heritage and exciting water activities.",
    places: ["Baga Beach", "Calangute Beach", "Fort Aguada"],
    activities: ["Water sports", "Beach sunsets", "Local sightseeing"],
    bestTime: "November to February",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85",
  },
  kerala: {
    name: "Kerala",
    tagline: "Find your peace in God's Own Country.",
    description:
      "Experience peaceful backwaters, lush tea gardens, waterfalls and Kerala's beautiful landscapes.",
    places: ["Alleppey Backwaters", "Munnar", "Athirappilly Falls"],
    activities: ["Houseboat rides", "Tea garden visits", "Nature walks"],
    bestTime: "October to March",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=85",
  },
  kashmir: {
    name: "Kashmir",
    tagline: "Discover a paradise among the mountains.",
    description:
      "Enjoy mountain views, peaceful lakes, scenic valleys and memorable Himalayan adventures.",
    places: ["Dal Lake", "Gulmarg", "Pahalgam"],
    activities: ["Shikara rides", "Mountain sightseeing", "Valley tours"],
    bestTime: "March to October",
    image:
      "https://images.unsplash.com/photo-1566837497312-7be2d9b3b6f1?auto=format&fit=crop&w=1600&q=85",
  },
  manali: {
    name: "Manali",
    tagline: "Your mountain adventure starts here.",
    description:
      "Explore snow-covered peaks, pine forests, mountain roads and beautiful Himalayan scenery.",
    places: ["Solang Valley", "Hadimba Temple", "Old Manali"],
    activities: ["Mountain sightseeing", "Nature walks", "Adventure activities"],
    bestTime: "March to June or December to February",
    image:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=85",
  },
  rajasthan: {
    name: "Rajasthan",
    tagline: "Experience royal heritage and desert charm.",
    description:
      "Explore grand forts, royal palaces, colourful markets and the unique beauty of the desert.",
    places: ["Jaipur", "Udaipur", "Jaisalmer"],
    activities: ["Fort visits", "Heritage walks", "Desert experiences"],
    bestTime: "October to March",
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=85",
  },
  maldives: {
    name: "Maldives",
    tagline: "Escape to turquoise waters and tropical islands.",
    description:
      "Relax beside clear blue waters, explore coral reefs and enjoy a peaceful island getaway.",
    places: ["Malé", "Maafushi", "Ari Atoll"],
    activities: ["Snorkelling", "Island hopping", "Beach relaxation"],
    bestTime: "November to April",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1600&q=85",
  },
};

function normalize(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function DestinationDetails() {
  const { destination } = useParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const info = destinationInfo[destination?.toLowerCase()];

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    fetch('${API_URL}/packages/')
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load travel packages.");
        }
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setPackages(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Packages could not be loaded. Please try again later.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const matchingPackages = useMemo(() => {
    if (!info) return [];

    return packages.filter((item) => {
      const packageDestination = normalize(item.destination);
      const packageName = normalize(item.package_name);
      const selected = normalize(info.name);

      return (
        packageDestination.includes(selected) ||
        packageName.includes(selected)
      );
    });
  }, [packages, info]);

  if (!info) {
    return (
      <main className="destination-not-found">
        <h2>Destination not found</h2>
        <p>Please choose a destination from our home page.</p>
        <Link to="/">Back to Home</Link>
      </main>
    );
  }

  return (
    <main className="destination-details-page">
      <section
        className="destination-hero"
        style={{ backgroundImage: `url("${info.image}")` }}
      >
        <div className="destination-hero-overlay">
          <p className="destination-eyebrow">DISCOVER TRAVELIA</p>
          <h1>Explore {info.name}</h1>
          <p>{info.tagline}</p>
          <a href="#destination-packages" className="destination-cta">
            Explore Packages ↓
          </a>
        </div>
      </section>

      <section className="destination-overview">
        <p className="destination-eyebrow">YOUR NEXT ADVENTURE</p>
        <h2>Welcome to {info.name}</h2>
        <p className="destination-description">{info.description}</p>

        <div className="destination-highlights">
          <article className="destination-highlight">
            <span>📍</span>
            <h3>Places to Visit</h3>
            <ul>
              {info.places.map((place) => (
                <li key={place}>{place}</li>
              ))}
            </ul>
          </article>

          <article className="destination-highlight">
            <span>✨</span>
            <h3>Things to Do</h3>
            <ul>
              {info.activities.map((activity) => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
          </article>

          <article className="destination-highlight">
            <span>📅</span>
            <h3>Best Time to Visit</h3>
            <p>{info.bestTime}</p>
          </article>
        </div>
      </section>

      <section
        id="destination-packages"
        className="destination-packages-section"
      >
        <p className="destination-eyebrow">PLAN YOUR JOURNEY</p>
        <h2>{info.name} Travel Packages</h2>
        <p>Find a trip that suits your travel plans.</p>

        {loading && <p>Loading available packages...</p>}

        {!loading && error && (
          <p role="alert">{error}</p>
        )}

        {!loading && !error && matchingPackages.length === 0 && (
          <div className="destination-empty">
            <h3>No packages available yet</h3>
            <p>
              We don't currently have a package listed for {info.name}.
              Please explore our other travel packages.
            </p>
            <Link to="/#packages" className="destination-cta">
              View All Packages
            </Link>
          </div>
        )}

        {!loading && !error && matchingPackages.length > 0 && (
          <div className="destination-package-grid">
            {matchingPackages.map((item) => (
              <article
                className="destination-package-card"
                key={item.package_id}
              >
                <img
                  src={item.image_url || info.image}
                  alt={item.package_name}
                  loading="lazy"
                />

                <div className="destination-package-content">
                  <h3>{item.package_name}</h3>
                  <p>{item.description}</p>
                  <p className="destination-package-duration">
                    🗓️ {item.duration}
                  </p>
                  <p className="destination-package-price">
                    ₹{Number(item.price).toLocaleString("en-IN")}
                  </p>
                  <Link
                    to={`/packages/${item.package_id}`}
                    className="destination-package-button"
                  >
                    View Package Details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="destination-back-link">
        <Link to="/">← Back to Home</Link>
      </div>
    </main>
  );
}

export default DestinationDetails;
