import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_URL from "../api";
function Booking() {

  const location = useLocation();
  const navigate = useNavigate();

  const selectedPackage = location.state?.packageData;
const selectedTrip = location.state?.trip;

const passedBookingRequestKey =
  location.state?.bookingRequestKey;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    travelers: "",
    message: ""
  });

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [apiError, setApiError] = useState("");


  useEffect(() => {

    if (selectedPackage && selectedTrip) {

      setFormData((previousData) => ({
        ...previousData,
        name: "",
        email: "",
        phone: "",
        travelers: "",
        message: ""
      }));

    }

  }, [selectedPackage, selectedTrip]);


  // --------------------------------
  // No package/trip selected
  // --------------------------------

  if (!selectedPackage || !selectedTrip) {

    return (
      <section className="booking-section">

        <div className="section-heading">

          <p className="small-title">
            PLAN YOUR TRIP
          </p>

          <h2>
            Select a Package First
          </h2>

          <p>
            Please select a travel package and trip date
            before starting your booking.
          </p>

          <button
            className="confirm-button"
            onClick={() => navigate("/")}
          >
            Explore Packages →
          </button>

        </div>

      </section>
    );

  }


  // --------------------------------
  // Format date
  // --------------------------------

  const formatDate = (date) => {

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  };


  // --------------------------------
  // Handle input changes
  // --------------------------------

  const handleChange = (event) => {

    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: ""
    }));

    setApiError("");

  };


  // --------------------------------
  // Validate form
  // --------------------------------

  const validateForm = () => {

    const newErrors = {};


    // Name validation

    if (formData.name.trim() === "") {

      newErrors.name =
        "Please enter your name";

    }


    // Email validation

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (formData.email.trim() === "") {

      newErrors.email =
        "Please enter your email";

    } else if (!emailPattern.test(formData.email)) {

      newErrors.email =
        "Please enter a valid email address";

    }


    // Phone validation

    const phonePattern =
      /^[6-9]\d{9}$/;


    if (formData.phone.trim() === "") {

      newErrors.phone =
        "Please enter your phone number";

    } else if (!phonePattern.test(formData.phone)) {

      newErrors.phone =
        "Please enter a valid 10-digit Indian phone number";

    }


    // Travelers validation

    if (
      formData.travelers === "" ||
      Number(formData.travelers) < 1
    ) {

      newErrors.travelers =
        "Please enter at least 1 traveler";

    } else if (
      Number(formData.travelers) >
      selectedTrip.available_seats
    ) {

      newErrors.travelers =
        `Only ${selectedTrip.available_seats} seats are available`;

    }


    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };


  // --------------------------------
  // Continue Booking
  // --------------------------------

  const handleSubmit = async (event) => {

    event.preventDefault();

    setApiError("");


    // Validate booking form

    const isValid = validateForm();

    if (!isValid) {
      return;
    }


    setIsSubmitting(true);
    const bookingRequestKey =
  passedBookingRequestKey || crypto.randomUUID();


    
try {
  const userId = sessionStorage.getItem("userId");

  if (userId) {
    navigate("/booking-confirmation", {
      state: {
        packageData: selectedPackage,
        trip: selectedTrip,
        bookingData: formData,
        userId: Number(userId),
        bookingRequestKey,
      },
    });
  } else {
    navigate("/login", {
      state: {
        packageData: selectedPackage,
        trip: selectedTrip,
        bookingData: formData,
        bookingRequestKey,
      },
    });
  }
} catch (error) {
  console.error("Booking navigation error:", error);

  setApiError(
    error.message || "Something went wrong"
  );
} finally {
  setIsSubmitting(false);
}

  };


  return (

    <section
      id="booking"
      className="booking-section"
    >


      {/* --------------------------------
          Heading
      -------------------------------- */}

      <div className="section-heading">

        <p className="small-title">
          PLAN YOUR TRIP
        </p>

        <h2>
          Book Your Adventure
        </h2>

        <p>
          Complete your booking details
          for your selected trip.
        </p>

      </div>


      {/* --------------------------------
          Selected Package and Trip
      -------------------------------- */}

      <div className="selected-trip">


        {/* Selected Package */}

        <div>

          <small>
            SELECTED PACKAGE
          </small>

          <h3>
            {selectedPackage.package_name}
          </h3>

          <p>
            📍 {selectedPackage.destination}
          </p>

        </div>


        {/* Selected Trip */}

        <div>

          <small>
            SELECTED TRIP
          </small>

          <h3>
            {formatDate(selectedTrip.start_date)}
            {" → "}
            {formatDate(selectedTrip.end_date)}
          </h3>

          <p>
            💺 {selectedTrip.available_seats}
            {" "}seats available
          </p>

        </div>


      </div>


      {/* --------------------------------
          API Error
      -------------------------------- */}

      {apiError && (

        <p className="form-error">
          {apiError}
        </p>

      )}


      {/* --------------------------------
          Booking Form
      -------------------------------- */}

      <form
        className="booking-form"
        onSubmit={handleSubmit}
      >


        {/* --------------------------------
            Full Name
        -------------------------------- */}

        <div className="form-group">

          <label>
            Full Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />

          {errors.name && (

            <span className="form-error">
              {errors.name}
            </span>

          )}

        </div>


        {/* --------------------------------
            Email
        -------------------------------- */}

        <div className="form-group">

          <label>
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />

          {errors.email && (

            <span className="form-error">
              {errors.email}
            </span>

          )}

        </div>


        {/* --------------------------------
            Phone
        -------------------------------- */}

        <div className="form-group">

          <label>
            Phone Number
          </label>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />

          {errors.phone && (

            <span className="form-error">
              {errors.phone}
            </span>

          )}

        </div>


        {/* --------------------------------
            Destination
        -------------------------------- */}

        <div className="form-group">

          <label>
            Destination
          </label>

          <input
            type="text"
            value={selectedPackage.destination}
            readOnly
            className="readonly-input"
          />

        </div>


        {/* --------------------------------
            Travel Date
        -------------------------------- */}

        <div className="form-group">

          <label>
            Selected Travel Date
          </label>

          <input
            type="text"
            value={
              `${formatDate(selectedTrip.start_date)}
              → ${formatDate(selectedTrip.end_date)}`
            }
            readOnly
            className="readonly-input"
          />

        </div>


        {/* --------------------------------
            Number of Travelers
        -------------------------------- */}

        <div className="form-group">

          <label>
            Number of Travelers
          </label>

          <input
            type="number"
            name="travelers"
            min="1"
            max={selectedTrip.available_seats}
            value={formData.travelers}
            onChange={handleChange}
            placeholder="Enter number of travelers"
          />

          {errors.travelers && (

            <span className="form-error">
              {errors.travelers}
            </span>

          )}

        </div>


        {/* --------------------------------
            Special Request
        -------------------------------- */}

        <div className="form-group">

          <label>
            Special Request
          </label>

          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Any special requirements?"
            rows="4"
          />

        </div>


        {/* --------------------------------
            Continue Button
        -------------------------------- */}

        <button
          type="submit"
          className="confirm-button"
          disabled={isSubmitting}
        >

          {isSubmitting
            ? "Continuing..."
            : "Continue Booking →"
          }

        </button>


      </form>

    </section>

  );

}

export default Booking;