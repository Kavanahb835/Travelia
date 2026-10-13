
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOTP = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password.length > 128) {
      setError("Password cannot exceed 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: cleanName,
          email: cleanEmail,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to register.");
      }

      setEmail(cleanEmail);
      setUserId(data.user_id);
      setOtpSent(true);
      setOtp("");
      setSuccess("OTP sent! Please check your email. It expires in 5 minutes.");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Please check that FastAPI is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          otp_code: otp
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "OTP verification failed.");
      }

      // Email is verified. Continue to the login page.
      // Registration verification alone does not issue a login token.
      setSuccess("Email verified successfully! Please log in.");

      navigate("/login", {
        replace: true,
        state: {
          email,
          from: location.state?.from,
          packageData: location.state?.packageData,
          trip: location.state?.trip,
          bookingData: location.state?.bookingData
        }
      });
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Please try again."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/resend-registration-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to resend OTP.");
      }

      setOtp("");
      setSuccess("A new OTP has been sent. Use the latest code.");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Please try again."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="section-heading">
          <p className="small-title">JOIN TRAVELIA</p>
          <h2>Create Your Account</h2>
          <p>
            Register with your email and password, then verify your email.
          </p>
        </div>

        {!otpSent ? (
          <form className="login-form" onSubmit={handleSendOTP}>
            <div className="form-group">
              <label htmlFor="register-name">Full Name</label>
              <input
                id="register-name"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={100}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email Address</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="confirm-button"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register & Send OTP →"}
            </button>

            <p className="register-login-text">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleVerifyOTP}>
            <div className="otp-message">
              <p>Verification code sent to:</p>
              <strong>{email}</strong>
              <p>Please use the newest OTP within 5 minutes.</p>
            </div>

            <div className="form-group">
              <label htmlFor="register-otp">Enter 6-digit OTP</label>
              <input
                id="register-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter OTP"
                required
              />
            </div>

            {error && <p className="form-error">{error}</p>}
            {success && <p className="form-success">{success}</p>}

            <button
              type="submit"
              className="confirm-button"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Email →"}
            </button>

            <button
              type="button"
              className="back-button"
              onClick={handleResendOTP}
              disabled={loading}
            >
              {loading ? "Please wait..." : "Resend OTP"}
            </button>

            <button
              type="button"
              className="back-button"
              disabled={loading}
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setError("");
                setSuccess("");
              }}
            >
              ← Change Details
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default Register;