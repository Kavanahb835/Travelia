
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const [showLogout, setShowLogout] = useState(false);

  const [userId, setUserId] = useState(
    sessionStorage.getItem("userId")
  );

  const [role, setRole] = useState(
    sessionStorage.getItem("role")
  );

  const handleSectionClick = (section) => {
    navigate(`/?section=${section}`);
  };

  useEffect(() => {
    const updateAuth = () => {
      setUserId(sessionStorage.getItem("userId"));
      setRole(sessionStorage.getItem("role"));
    };

    window.addEventListener("authChanged", updateAuth);

    return () => {
      window.removeEventListener("authChanged", updateAuth);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("role");

    window.dispatchEvent(new Event("authChanged"));

    setUserId(null);
    setRole(null);
    setShowLogout(false);

    navigate("/");
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="logo">
          ✈️ Travelia
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>

          <button onClick={() => handleSectionClick("destinations")}>
            Destinations
          </button>

          <button onClick={() => handleSectionClick("packages")}>
            Packages
          </button>

          <button onClick={() => handleSectionClick("about")}>
            About
          </button>

          <button onClick={() => handleSectionClick("contact")}>
            Contact
          </button>
        </div>

        <div className="auth-nav-links">
          {!userId ? (
            <>
              <Link to="/login" className="login-link">
                Login
              </Link>

              <Link to="/register" className="register-link">
                Register
              </Link>
            </>
          ) : (
            <>
              {role === "admin" ? (
                <Link to="/admin">Admin Dashboard</Link>
              ) : (
                
<Link to="/my-bookings" className="my-bookings-nav-btn">
  <span className="my-bookings-icon">✈</span>
  My Bookings
  <span className="my-bookings-arrow">↗</span>
</Link>

              )}

              <button
                type="button"
                className="logout-btn"
                onClick={() => setShowLogout(true)}
              >
                <span className="logout-icon">↪</span>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {showLogout && (
        <div
          className="logout-overlay"
          onClick={() => setShowLogout(false)}
        >
          <div
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="logout-modal-icon">
              <span>↪</span>
            </div>

            <h2 id="logout-title">Ready to leave?</h2>

            <p>
              Are you sure you want to log out of your
              Travelia account?
            </p>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-cancel-btn"
                onClick={() => setShowLogout(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="logout-confirm-btn"
                onClick={handleLogout}
              >
                <span>↪</span> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
