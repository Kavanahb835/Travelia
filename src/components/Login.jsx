
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function Login() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
  packageData,
  trip,
  bookingData,
  bookingRequestKey,
  from,
} = location.state || {};

  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Login failed. Please check your details."
        );
      }

      // Save the logged-in user's basic session information.
      sessionStorage.setItem("userId", String(data.user_id));
      sessionStorage.setItem("role", data.role || "customer");
      window.dispatchEvent(new Event("authChanged"));

      // Admins go to the Admin Dashboard.
      if (data.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }

      // Continue the booking started before login.
      
if (packageData && trip && bookingData) {
  navigate("/booking-confirmation", {
    replace: true,
    state: {
      packageData,
      trip,
      bookingData,
      userId: data.user_id,
      bookingRequestKey,
    },
  });
  return;
}


      // Return to the page requested before login.
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Normal customer login.
      navigate("/", { replace: true });
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setError(
          "Cannot connect to the backend. Please check that FastAPI is running."
        );
      } else {
        setError(err.message || "Unable to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="section-heading">
          <p className="small-title">WELCOME BACK</p>
          <h2>Login to Travelia</h2>
          <p>Enter your registered email and password to continue.</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your registered email"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <p className="forgot-password-link">
            <Link to="/forgot-password" state={{ email: email.trim() }}>
              Forgot Password?
            </Link>
          </p>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="confirm-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login →"}
          </button>

          <p className="register-login-text">
            New to Travelia? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default Login;