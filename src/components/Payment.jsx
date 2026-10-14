
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    packageData,
    trip,
    booking,
    bookingData,
  } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Keep hooks above this conditional return.
  if (!packageData || !trip || !booking) {
    return (
      <section className="booking-section">
        <div className="section-heading">
          <p className="small-title">PAYMENT</p>
          <h2>Payment Information Missing</h2>
          <p>Please start the booking process again.</p>
          <button
            className="confirm-button"
            onClick={() => navigate("/")}
          >
            Back to Home →
          </button>
        </div>
      </section>
    );
  }

  const totalAmount = Number(booking.total_amount);

  const handlePayment = async (event) => {
    event.preventDefault();
    if (loading) return;

    setError("");

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      setError("The booking amount is invalid.");
      return;
    }

    if (paymentMethod === "card") {
      const digits = cardNumber.replace(/\D/g, "");

      if (digits.length !== 16) {
        setError("Please enter a valid 16-digit test card number.");
        return;
      }

      if (!cardName.trim()) {
        setError("Please enter the name on the card.");
        return;
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        setError("Enter expiry in MM/YY format.");
        return;
      }

      if (!/^\d{3}$/.test(cvv)) {
        setError("Please enter a 3-digit test CVV.");
        return;
      }
    }

    if (paymentMethod === "upi") {
      if (!/^[\w.-]+@[\w.-]+$/.test(upiId.trim())) {
        setError("Please enter a valid-looking demo UPI ID.");
        return;
      }
    }

    setLoading(true);

    try {
      // Simulate processing. This is NOT a real payment.
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const response = await fetch(
        `${API_URL}/bookings/${booking.booking_id}/demo-payment`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to complete demo payment."
        );
      }

      if (
        data.booking_id !== booking.booking_id ||
        data.booking_status !== "Confirmed" ||
        !["Demo Paid", "Paid"].includes(data.payment_status)
      ) {
        throw new Error("The server did not confirm this booking.");
      }

      // Navigate only after the backend confirms the update.
      navigate("/payment-success", {
        replace: true,
        state: {
          packageData,
          trip,
          booking: {
            ...booking,
            ...data,
          },
          bookingData,
          paymentMethod,
          isDemoPayment: data.payment_status === "Demo Paid",
        },
      });
    } catch (err) {
      console.error("Demo payment error:", err);
      setError(
        err.message ||
        "Unable to complete payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="payment-section">
      <div className="payment-container">
        <div className="section-heading">
          <p className="small-title">DEMO CHECKOUT</p>
          <h2>Complete Your Payment</h2>
          <p>
            Choose a payment method to simulate your travel booking payment.
          </p>
        </div>

        <div className="payment-summary">
          <div>
            <span>Package</span>
            <strong>{packageData.package_name}</strong>
          </div>

          <div>
            <span>Destination</span>
            <strong>{packageData.destination}</strong>
          </div>

          <div>
            <span>Travelers</span>
            <strong>{booking.travelers}</strong>
          </div>

          <div className="payment-total">
            <span>Total Amount</span>
            <strong>
              ₹{totalAmount.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <form className="payment-form" onSubmit={handlePayment}>
          <div className="payment-methods">
            <button
              type="button"
              className={
                paymentMethod === "card"
                  ? "payment-method active"
                  : "payment-method"
              }
              onClick={() => {
                setPaymentMethod("card");
                setError("");
              }}
              disabled={loading}
            >
              💳 Card
            </button>

            <button
              type="button"
              className={
                paymentMethod === "upi"
                  ? "payment-method active"
                  : "payment-method"
              }
              onClick={() => {
                setPaymentMethod("upi");
                setError("");
              }}
              disabled={loading}
            >
              📱 UPI
            </button>
          </div>

          {paymentMethod === "card" && (
            <>
              <div className="form-group">
                <label htmlFor="demo-card-number">Test Card Number</label>
                <input
                  id="demo-card-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={16}
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 16)
                    )
                  }
                  placeholder="Enter any 16 digits"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="demo-card-name">Name on Card</label>
                <input
                  id="demo-card-name"
                  type="text"
                  autoComplete="off"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Test cardholder name"
                  disabled={loading}
                  required
                />
              </div>

              <div className="payment-row">
                <div className="form-group">
                  <label htmlFor="demo-expiry">Expiry Date</label>
                  <input
                    id="demo-expiry"
                    type="text"
                    autoComplete="off"
                    value={expiry}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);

                      setExpiry(
                        value.length > 2
                          ? `${value.slice(0, 2)}/${value.slice(2)}`
                          : value
                      );
                    }}
                    placeholder="MM/YY"
                    maxLength={5}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="demo-cvv">Test CVV</label>
                  <input
                    id="demo-cvv"
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                    placeholder="3 digits"
                    maxLength={3}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {paymentMethod === "upi" && (
            <div className="form-group">
              <label htmlFor="demo-upi">Demo UPI ID</label>
              <input
                id="demo-upi"
                type="text"
                autoComplete="off"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@upi"
                disabled={loading}
                required
              />
            </div>
          )}

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="confirm-button"
            disabled={loading}
          >
            {loading
              ? "Processing Demo Payment..."
              : `Pay ₹${totalAmount.toLocaleString("en-IN")}`}
          </button>

          <p className="payment-note">
            🔒 Demo only. No real payment is made. Use fictional test details.
          </p>
        </form>
      </div>
    </section>
  );
}

export default Payment;
