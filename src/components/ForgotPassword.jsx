
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";


const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOTP = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to send password reset OTP."
        );
      }

      setEmail(cleanEmail);
      setOtpSent(true);
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

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
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
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp_code: otp,
          new_password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to reset your password."
        );
      }

      navigate("/login", {
        replace: true,
        state: { email: email.trim().toLowerCase() },
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
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to resend OTP."
        );
      }

      setOtp("");
      setSuccess("A new OTP has been sent. Please use the latest code.");
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
          <p className="small-title">ACCOUNT RECOVERY</p>
          <h2>Forgot Password?</h2>
          <p>
            {otpSent
              ? "Enter the OTP sent to your email and choose a new password."
              : "Enter your registered email to receive a password reset OTP."}
          </p>
        </div>

        {!otpSent ? (
          <form className="login-form" onSubmit={handleSendOTP}>
            <div className="form-group">
              <label htmlFor="reset-email">Email Address</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your registered email"
                autoComplete="email"
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
              {loading ? "Sending OTP..." : "Send Reset OTP →"}
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleResetPassword}>
            <div className="otp-message">
              <p>Reset code sent to:</p>
              <strong>{email}</strong>
              <p>Use the latest OTP before it expires.</p>
            </div>

            <div className="form-group">
              <label htmlFor="reset-otp">6-digit OTP</label>
              <input
                id="reset-otp"
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

            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
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
              <label htmlFor="confirm-new-password">Confirm New Password</label>
              <input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
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
              {loading ? "Resetting Password..." : "Reset Password →"}
            </button>

            <button
              type="button"
              className="back-button"
              onClick={handleResendOTP}
              disabled={loading}
            >
              Resend OTP
            </button>

            <button
              type="button"
              className="back-button"
              disabled={loading}
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setPassword("");
                setConfirmPassword("");
                setError("");
                setSuccess("");
              }}
            >
              ← Change Email
            </button>
          </form>
        )}

        <p className="register-login-text">
          Remembered your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </section>
  );
}

export default ForgotPassword;