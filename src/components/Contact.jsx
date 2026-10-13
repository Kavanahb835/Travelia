
import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/contact/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to send your message."
        );
      }

      setStatus(
        "success:" +
          (data.message || "Your message has been sent successfully!")
      );

      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      setStatus(
        "error:" +
          (error.message ||
            "Unable to send your message. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="section-heading">
        <p className="small-title">CONTACT US</p>

        <h2>Let's Plan Your Journey</h2>

        <p>
          Have questions about a destination or package?
          We'd love to hear from you.
        </p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <div className="contact-item">
            <div className="contact-icon">📧</div>
            <div>
              <h3>Email</h3>
              <p>Travelia Support</p>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon">📞</div>
            <div>
              <h3>Phone</h3>
              <p>+91 98765 43210</p>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon">📍</div>
            <div>
              <h3>Location</h3>
              <p>Bangalore, India</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              minLength={2}
              maxLength={100}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              maxLength={254}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              rows="5"
              placeholder="Your message..."
              value={formData.message}
              onChange={handleChange}
              minLength={5}
              maxLength={5000}
              required
            />
          </div>

          {status && (
            <p
              className={
                status.startsWith("success:")
                  ? "contact-status contact-status-success"
                  : "contact-status contact-status-error"
              }
              role="status"
            >
              {status.slice(status.indexOf(":") + 1)}
            </p>
          )}

          <button
            type="submit"
            className="confirm-button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Message →"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contact;
