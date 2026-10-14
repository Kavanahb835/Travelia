
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";



const PACKAGE_CONFIG = {
  Goa: {
    "3 Days / 2 Nights": {
      price: 9999,
      package_name: "Goa Short Escape",
      description: "Enjoy Goa's beaches, local food, and sightseeing.",
      image_url: "",
    },
    "4 Days / 3 Nights": {
      price: 14999,
      package_name: "Goa Beach Escape",
      description: "Explore Goa beaches, sightseeing spots, and local cuisine.",
      image_url: "",
    },
    "5 Days / 4 Nights": {
      price: 18999,
      package_name: "Goa Extended Escape",
      description: "Enjoy an extended Goa holiday with beaches and sightseeing.",
      image_url: "",
    },
    "6 Days / 5 Nights": {
      price: 22999,
      package_name: "Goa Grand Holiday",
      description: "Experience Goa with extra time for beaches and exploration.",
      image_url: "",
    },
  },

  Kashmir: {
    "3 Days / 2 Nights": {
      price: 14999,
      package_name: "Kashmir Short Retreat",
      description: "Discover Kashmir's scenic landscapes and local attractions.",
      image_url: "",
    },
    "4 Days / 3 Nights": {
      price: 19999,
      package_name: "Kashmir Valley Escape",
      description: "Enjoy Kashmir's valleys, gardens, and mountain views.",
      image_url: "",
    },
    "5 Days / 4 Nights": {
      price: 22999,
      package_name: "Kashmir Scenic Holiday",
      description: "Explore Kashmir's beautiful valleys and popular destinations.",
      image_url: "",
    },
    "6 Days / 5 Nights": {
      price: 24999,
      package_name: "Kashmir Adventure",
      description: "Enjoy a longer Kashmir trip with scenic sightseeing.",
      image_url: "",
    },
  },

  Kerala: {
    "3 Days / 2 Nights": {
      price: 8999,
      package_name: "Kerala Quick Getaway",
      description: "Discover Kerala's greenery, local culture, and cuisine.",
      image_url: "",
    },
    "4 Days / 3 Nights": {
      price: 12999,
      package_name: "Kerala Nature Escape",
      description: "Explore Kerala's natural beauty and relaxing destinations.",
      image_url: "",
    },
    "5 Days / 4 Nights": {
      price: 18999,
      package_name: "Kerala Explorer",
      description: "Experience Kerala's landscapes, culture, and sightseeing.",
      image_url: "",
    },
    "6 Days / 5 Nights": {
      price: 21999,
      package_name: "Kerala Grand Tour",
      description: "Enjoy an extended Kerala holiday with more sightseeing.",
      image_url: "",
    },
  },

  Manali: {
    "3 Days / 2 Nights": {
      price: 10999,
      package_name: "Manali Mountain Escape",
      description: "Enjoy mountain views and local sightseeing in Manali.",
      image_url: "",
    },
    "4 Days / 3 Nights": {
      price: 14999,
      package_name: "Manali Valley Holiday",
      description: "Explore Manali's valleys, mountain scenery, and local attractions.",
      image_url: "",
    },
    "5 Days / 4 Nights": {
      price: 19999,
      package_name: "Manali Mountain Trip",
      description: "Experience Manali's mountain scenery and popular attractions.",
      image_url: "",
    },
    "6 Days / 5 Nights": {
      price: 23999,
      package_name: "Manali Adventure",
      description: "Enjoy a longer mountain holiday with extra sightseeing time.",
      image_url: "",
    },
  },
};

const DESTINATION_OPTIONS = Object.keys(PACKAGE_CONFIG);


function AdminDashboard() {
  const navigate = useNavigate();

  
const [tripDates, setTripDates] = useState([]);
const [tripDatesLoading, setTripDatesLoading] = useState(false);
const [tripDatesError, setTripDatesError] = useState("");
const [tripDateMessage, setTripDateMessage] = useState("");
const [selectedPackageId, setSelectedPackageId] = useState("");
const [tripDateFormOpen, setTripDateFormOpen] = useState(false);
const [editingTripDateId, setEditingTripDateId] = useState(null);
const [savingTripDate, setSavingTripDate] = useState(false);

const emptyTripDate = {
  start_date: "",
  end_date: "",
  available_seats: "20",
};

const [tripDateForm, setTripDateForm] = useState(emptyTripDate);

  
const [packages, setPackages] = useState([]);
const [packagesLoading, setPackagesLoading] = useState(false);
const [packagesError, setPackagesError] = useState("");
const [packageMessage, setPackageMessage] = useState("");
const [editingPackageId, setEditingPackageId] = useState(null);
const [packageFormOpen, setPackageFormOpen] = useState(false);
const [savingPackage, setSavingPackage] = useState(false);

const emptyPackage = {
  package_name: "",
  destination: "",
  duration: "",
  price: "",
  description: "",
  image_url: "",
};

const [packageForm, setPackageForm] = useState(emptyPackage);

  const [activeTab, setActiveTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingsError, setBookingsError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const logout = () => {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("role");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login", { replace: true });
  };

  const fetchStats = useCallback(async () => {
    const response = await fetch(`${API_URL}/bookings/admin/stats`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Unable to load dashboard statistics.");
    }

    setStats(data);
  }, []);

  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    setBookingsError("");

    try {
      // This endpoint must be added to the backend in the next step.
      const response = await fetch(`${API_URL}/bookings/admin/all`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load bookings.");
      }

      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch (err) {
      setBookingsError(err.message);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("role") !== "admin") {
      navigate("/login", { replace: true });
      return;
    }


    const loadDashboard = async () => {
      try {
        await fetchStats();
      } catch (err) {
        setError(err.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate, fetchStats]);

  useEffect(() => {
    if (activeTab === "Bookings" || activeTab === "Customers") {
      fetchBookings();
    }
  }, [activeTab, fetchBookings]);

  
useEffect(() => {
  if (activeTab !== "Trip Dates") return;

  const loadTripDatesTab = async () => {
    setTripDatesError("");
    setTripDateMessage("");

    try {
      const response = await fetch(`${API_URL}/packages/`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load packages.");
      }

      const packageList = Array.isArray(data) ? data : [];
      setPackages(packageList);

      if (packageList.length === 0) {
        setSelectedPackageId("");
        setTripDates([]);
        return;
      }

      const currentPackageExists = packageList.some(
        (pkg) => String(pkg.package_id) === String(selectedPackageId)
      );

      const packageId = currentPackageExists
        ? selectedPackageId
        : String(packageList[0].package_id);

      setSelectedPackageId(packageId);
      await fetchTripDates(packageId);
    } catch (err) {
      setTripDatesError(err.message || "Unable to load trip dates.");
    }
  };

  loadTripDatesTab();
}, [activeTab]);


  useEffect(() => {
  if (activeTab === "Packages") {
    fetchPackages();
  }
}, [activeTab]);

  const updateBookingStatus = async (bookingId, status) => {
    setBookingsError("");
    setUpdatingId(bookingId);

    try {
      // This endpoint must be added to the backend in the next step.
      const response = await fetch(
        `${API_URL}/bookings/admin/${bookingId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ booking_status: status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to update booking status.");
      }

      await fetchBookings();
      await fetchStats();
    } catch (err) {
      setBookingsError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <section className="admin-dashboard">
        <h2>Loading Admin Dashboard...</h2>
      </section>
    );
  }

  if (error) {
    return (
      <section className="admin-dashboard">
        <h2>Unable to Load Dashboard</h2>
        <p>{error}</p>
        <button className="confirm-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </section>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: "Total Users", value: stats.total_users ?? 0 },
    { label: "Total Bookings", value: stats.total_bookings ?? 0 },
    { label: "Confirmed Bookings", value: stats.confirmed_bookings ?? 0 },
    { label: "Pending Bookings", value: stats.pending_bookings ?? 0 },
    {
      label: "Paid Revenue",
      value: `₹${Number(stats.total_revenue ?? 0).toLocaleString("en-IN")}`,
    },
  ];

  const tabs = ["Overview", "Bookings", "Customers", "Packages", "Trip Dates"];


  
const fetchPackages = async () => {
  setPackagesLoading(true);
  setPackagesError("");
  setPackageMessage("");

  try {
    const response = await fetch(`${API_URL}/packages/`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Unable to load packages.");
    }

    setPackages(data);
  } catch (err) {
    setPackagesError(err.message || "Unable to load packages.");
  } finally {
    setPackagesLoading(false);
  }
};

const openAddPackageForm = () => {
  setEditingPackageId(null);
  setPackageForm({ ...emptyPackage });
  setPackagesError("");
  setPackageMessage("");
  setPackageFormOpen(true);
};

const openEditPackageForm = (pkg) => {
  setEditingPackageId(pkg.package_id);
  setPackageForm({
    package_name: pkg.package_name || "",
    destination: pkg.destination || "",
    duration: pkg.duration || "",
    price: String(pkg.price ?? ""),
    description: pkg.description || "",
    image_url: pkg.image_url || "",
  });
  setPackagesError("");
  setPackageMessage("");
  setPackageFormOpen(true);
};





const handlePackageFormChange = (event) => {
  const { name, value } = event.target;

  if (name === "destination") {
    setPackageForm((previous) => ({
      ...previous,
      destination: value,
      duration: "",
      price: "",
      package_name: "",
      description: "",
      image_url: "",
    }));
    return;
  }

  if (name === "duration") {
    const template = PACKAGE_CONFIG[packageForm.destination]?.[value];

    setPackageForm((previous) => ({
      ...previous,
      duration: value,
      package_name: template
        ? template.package_name
        : `${previous.destination} ${value}`,
      price: template ? String(template.price) : "",
      description: template?.description || "",
      image_url: template?.image_url || "",
    }));
    return;
  }

  if (name === "duration") {
    const template = PACKAGE_CONFIG[packageForm.destination]?.[value];

    setPackageForm((previous) => ({
      ...previous,
      duration: value,
      price: template ? String(template.price) : "",
      package_name: template?.package_name || previous.package_name,
      description: template?.description || previous.description,
      image_url: template?.image_url || "",
    }));
    return;
  }

  setPackageForm((previous) => ({
    ...previous,
    [name]: value,
  }));
};


const savePackage = async (event) => {
  event.preventDefault();
  setPackagesError("");
  setPackageMessage("");

  if (
    !packageForm.package_name.trim() ||
    !packageForm.destination.trim() ||
    !packageForm.duration.trim() ||
    !packageForm.price ||
    Number(packageForm.price) <= 0
  ) {
    setPackagesError("Enter the package name, destination, duration, and a valid price.");
    return;
  }

  setSavingPackage(true);

  try {
    const isEditing = editingPackageId !== null;
    const url = isEditing
      ? `${API_URL}/packages/${editingPackageId}`
      : `${API_URL}/packages/`;

    const response = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...packageForm,
        package_name: packageForm.package_name.trim(),
        destination: packageForm.destination.trim(),
        duration: packageForm.duration.trim(),
        price: Number(packageForm.price),
        description: packageForm.description.trim() || null,
        image_url: packageForm.image_url.trim() || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : "Unable to save package. Check the entered details."
      );
    }

    setPackageFormOpen(false);
    setEditingPackageId(null);
    setPackageForm({ ...emptyPackage });
    setPackageMessage(
      isEditing ? "Package updated successfully!" : "Package added successfully!"
    );

    await fetchPackages();
  } catch (err) {
    setPackagesError(err.message || "Unable to save package.");
  } finally {
    setSavingPackage(false);
  }
};

const deletePackage = async (pkg) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${pkg.package_name}"?`
  );

  if (!confirmed) return;

  setPackagesError("");
  setPackageMessage("");

  try {
    const response = await fetch(
      `${API_URL}/packages/${pkg.package_id}`,
      { method: "DELETE" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : "Unable to delete package."
      );
    }

    setPackageMessage(data.message || "Package deleted successfully.");
    await fetchPackages();
  } catch (err) {
    setPackagesError(err.message || "Unable to delete package.");
  }
};


const fetchTripDates = async (packageId) => {
  if (!packageId) {
    setTripDates([]);
    return;
  }

  setTripDatesLoading(true);
  setTripDatesError("");

  try {
    const response = await fetch(
      `${API_URL}/packages/${packageId}/trips`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Unable to load trip dates.");
    }

    setTripDates(Array.isArray(data) ? data : []);
  } catch (err) {
    setTripDatesError(err.message || "Unable to load trip dates.");
  } finally {
    setTripDatesLoading(false);
  }
};

const handleTripDateChange = (event) => {
  const { name, value } = event.target;

  setTripDateForm((previous) => ({
    ...previous,
    [name]: value,
  }));
};

const openAddTripDateForm = () => {
  setEditingTripDateId(null);
  setTripDateForm({ ...emptyTripDate });
  setTripDatesError("");
  setTripDateMessage("");
  setTripDateFormOpen(true);
};

const openEditTripDateForm = (trip) => {
  setEditingTripDateId(trip.trip_date_id);
  setTripDateForm({
    start_date: String(trip.start_date).slice(0, 10),
    end_date: String(trip.end_date).slice(0, 10),
    available_seats: String(trip.available_seats ?? 0),
  });
  setTripDatesError("");
  setTripDateMessage("");
  setTripDateFormOpen(true);
};

const saveTripDate = async (event) => {
  event.preventDefault();
  setTripDatesError("");
  setTripDateMessage("");

  if (!selectedPackageId) {
    setTripDatesError("Please select a package.");
    return;
  }

  if (
    !tripDateForm.start_date ||
    !tripDateForm.end_date ||
    tripDateForm.start_date >= tripDateForm.end_date
  ) {
    setTripDatesError("Please select valid start and end dates.");
    return;
  }

  const seats = Number(tripDateForm.available_seats);

  if (!Number.isInteger(seats) || seats < 0) {
    setTripDatesError("Available seats must be a whole number of 0 or more.");
    return;
  }

  setSavingTripDate(true);

  try {
    const isEditing = editingTripDateId !== null;

    const url = isEditing
      ? `${API_URL}/packages/trips/${editingTripDateId}`
      : `${API_URL}/packages/${selectedPackageId}/trips`;

    const response = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start_date: tripDateForm.start_date,
        end_date: tripDateForm.end_date,
        available_seats: seats,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : "Unable to save trip date."
      );
    }

    setTripDateFormOpen(false);
    setEditingTripDateId(null);
    setTripDateForm({ ...emptyTripDate });
    setTripDateMessage(
      isEditing
        ? "Trip date updated successfully!"
        : "Trip date added successfully!"
    );

    await fetchTripDates(selectedPackageId);
  } catch (err) {
    setTripDatesError(err.message || "Unable to save trip date.");
  } finally {
    setSavingTripDate(false);
  }
};

const deleteTripDate = async (trip) => {
  const confirmed = window.confirm(
    `Delete the trip from ${trip.start_date} to ${trip.end_date}?`
  );

  if (!confirmed) return;

  setTripDatesError("");
  setTripDateMessage("");

  try {
    const response = await fetch(
      `${API_URL}/packages/trips/${trip.trip_date_id}`,
      { method: "DELETE" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : "Unable to delete trip date."
      );
    }

    setTripDateMessage(data.message || "Trip date deleted successfully.");
    await fetchTripDates(selectedPackageId);
  } catch (err) {
    setTripDatesError(err.message || "Unable to delete trip date.");
  }
};


  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <p className="small-title">TRAVELIA MANAGEMENT</p>
          <h1>Admin Dashboard</h1>
          <p>Manage bookings, customers, and travel packages.</p>
        </div>

       
      </div>

      <nav className="admin-tabs" aria-label="Admin sections">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`admin-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === "Overview" && (
        <>
          <h2>Overview</h2>
          <div className="admin-stats-grid">
            {cards.map((card) => (
              <div className="admin-stat-card" key={card.label}>
                <p>{card.label}</p>
                <h2>{card.value}</h2>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "Bookings" && (
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2>Manage Bookings</h2>
            <button
              type="button"
              className="back-button"
              onClick={fetchBookings}
              disabled={bookingsLoading}
            >
              Refresh
            </button>
          </div>

          {bookingsLoading && <p>Loading bookings...</p>}
          {bookingsError && <p className="form-error">{bookingsError}</p>}

          {!bookingsLoading && !bookingsError && bookings.length === 0 && (
            <p>No bookings found.</p>
          )}

          {!bookingsLoading && bookings.length > 0 && (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Package</th>
                    <th>Travelers</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.booking_id}>
                      <td>{booking.booking_id}</td>
                      <td>
                        <strong>{booking.customer_name || booking.full_name || "—"}</strong>
                        <br />
                        {booking.email || ""}
                      </td>
                      <td>{booking.package_name || "—"}</td>
                      <td>{booking.travelers ?? "—"}</td>
                      <td>
                        ₹{Number(booking.total_amount ?? 0).toLocaleString("en-IN")}
                      </td>
                      <td>{booking.payment_status || "—"}</td>
                      <td>{booking.booking_status || "—"}</td>
                      <td>
                        <select
                          aria-label={`Status for booking ${booking.booking_id}`}
                          value={booking.booking_status || "Pending"}
                          disabled={updatingId === booking.booking_id}
                          onChange={(event) =>
                            updateBookingStatus(
                              booking.booking_id,
                              event.target.value
                            )
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "Customers" && (
        <div className="admin-panel">
          <h2>Customers</h2>
          {bookingsLoading && <p>Loading customer details...</p>}
          {bookingsError && <p className="form-error">{bookingsError}</p>}

          {!bookingsLoading && !bookingsError && (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Booking ID</th>
                    <th>Package</th>
                    <th>Travelers</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.booking_id}>
                      <td>{booking.customer_name || booking.full_name || "—"}</td>
                      <td>{booking.email || "—"}</td>
                      <td>{booking.booking_id}</td>
                      <td>{booking.package_name || "—"}</td>
                      <td>{booking.travelers ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && <p>No customer bookings found.</p>}
            </div>
          )}
        </div>
      )}

      
{activeTab === "Packages" && (
  <div className="admin-panel">
    <div className="admin-panel-header">
      <div>
        <h2>Manage Packages</h2>
        <p>Add and maintain your travel packages.</p>
      </div>

      <button
        type="button"
        className="confirm-button"
        onClick={openAddPackageForm}
      >
        + Add Package
      </button>
    </div>

    {packageMessage && (
      <p className="form-success">{packageMessage}</p>
    )}

    {packagesError && (
      <p className="form-error">{packagesError}</p>
    )}

    {packageFormOpen && (
      <form className="admin-package-form" onSubmit={savePackage}>
        <h3>{editingPackageId ? "Edit Package" : "Add New Package"}</h3>

        <div className="admin-package-form-grid">
          

          
<div className="form-group">
  <label htmlFor="package-destination">Destination</label>
  <select
    id="package-destination"
    name="destination"
    value={packageForm.destination}
    onChange={handlePackageFormChange}
    required
  >
    <option value="">Select destination</option>

    {DESTINATION_OPTIONS.map((destination) => (
      <option key={destination} value={destination}>
        {destination}
      </option>
    ))}

    {packageForm.destination &&
      !DESTINATION_OPTIONS.includes(packageForm.destination) && (
        <option value={packageForm.destination}>
          {packageForm.destination}
        </option>
      )}
  </select>
</div>


          
<div className="form-group">
  <label htmlFor="package-duration">Duration</label>
  <select
    id="package-duration"
    name="duration"
    value={packageForm.duration}
    onChange={handlePackageFormChange}
    disabled={!packageForm.destination}
    required
  >
    <option value="">Select duration</option>

    {Object.keys(PACKAGE_CONFIG[packageForm.destination] || {}).map(
      (duration) => (
        <option key={duration} value={duration}>
          {duration}
        </option>
      )
    )}
  </select>
</div>


          <div className="form-group">
            <label htmlFor="package-price">Price (₹)</label>
            <input
              id="package-price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              value={packageForm.price}
              onChange={handlePackageFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="package-image">Image URL (optional)</label>
            <input
              id="package-image"
              name="image_url"
              type="url"
              value={packageForm.image_url}
              onChange={handlePackageFormChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="package-description">Description</label>
          <textarea
            id="package-description"
            name="description"
            value={packageForm.description}
            onChange={handlePackageFormChange}
            rows={3}
          />
        </div>

        <div className="admin-package-actions">
          <button
            type="submit"
            className="confirm-button"
            disabled={savingPackage}
          >
            {savingPackage
              ? "Saving..."
              : editingPackageId
                ? "Save Changes"
                : "Add Package"}
          </button>

          <button
            type="button"
            className="back-button"
            disabled={savingPackage}
            onClick={() => {
              setPackageFormOpen(false);
              setEditingPackageId(null);
              setPackagesError("");
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    )}

    {packagesLoading && <p>Loading packages...</p>}

    {!packagesLoading && !packagesError && packages.length === 0 && (
      <p>No packages found. Click Add Package to create your first package.</p>
    )}

    {!packagesLoading && packages.length > 0 && (
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Package</th>
              <th>Destination</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.package_id}>
                <td>{pkg.package_id}</td>
                <td>{pkg.package_name}</td>
                <td>{pkg.destination}</td>
                <td>{pkg.duration}</td>
                <td>
                  ₹{Number(pkg.price).toLocaleString("en-IN")}
                </td>
                <td>
                  <div className="admin-package-actions">
                    <button
                      type="button"
                      className="back-button"
                      onClick={() => openEditPackageForm(pkg)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="back-button"
                      onClick={() => deletePackage(pkg)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

      
{activeTab === "Trip Dates" && (
  <div className="admin-panel">
    <div className="admin-panel-header">
      <div>
        <h2>Trip Date Management</h2>
        <p>Manage departure dates and available seats.</p>
      </div>

      <button
        type="button"
        className="confirm-button"
        disabled={!selectedPackageId}
        onClick={openAddTripDateForm}
      >
        + Add Trip Date
      </button>
    </div>

    {tripDateMessage && (
      <p className="form-success">{tripDateMessage}</p>
    )}

    {tripDatesError && (
      <p className="form-error">{tripDatesError}</p>
    )}

    <div className="form-group">
      <label htmlFor="trip-package-select">Select Package</label>

      <select
        id="trip-package-select"
        value={selectedPackageId}
        onChange={(event) => {
          const packageId = event.target.value;
          setSelectedPackageId(packageId);
          setTripDateFormOpen(false);
          setEditingTripDateId(null);
          setTripDateMessage("");
          fetchTripDates(packageId);
        }}
      >
        <option value="">Select a package</option>

        {packages.map((pkg) => (
          <option key={pkg.package_id} value={pkg.package_id}>
            {pkg.package_name} — {pkg.destination}
          </option>
        ))}
      </select>
    </div>

    {tripDateFormOpen && (
      <form
        className="admin-package-form"
        onSubmit={saveTripDate}
      >
        <h3>
          {editingTripDateId
            ? "Edit Trip Date"
            : "Add New Trip Date"}
        </h3>

        <div className="admin-package-form-grid">
          <div className="form-group">
            <label htmlFor="trip-start-date">Departure Date</label>
            <input
              id="trip-start-date"
              type="date"
              name="start_date"
              value={tripDateForm.start_date}
              onChange={handleTripDateChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="trip-end-date">Return Date</label>
            <input
              id="trip-end-date"
              type="date"
              name="end_date"
              value={tripDateForm.end_date}
              min={tripDateForm.start_date || undefined}
              onChange={handleTripDateChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="trip-available-seats">
              Available Seats
            </label>
            <input
              id="trip-available-seats"
              type="number"
              name="available_seats"
              min="0"
              step="1"
              value={tripDateForm.available_seats}
              onChange={handleTripDateChange}
              required
            />
          </div>
        </div>

        <div className="admin-package-actions">
          <button
            type="submit"
            className="confirm-button"
            disabled={savingTripDate}
          >
            {savingTripDate
              ? "Saving..."
              : editingTripDateId
                ? "Save Changes"
                : "Add Trip Date"}
          </button>

          <button
            type="button"
            className="back-button"
            disabled={savingTripDate}
            onClick={() => {
              setTripDateFormOpen(false);
              setEditingTripDateId(null);
              setTripDatesError("");
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    )}

    {tripDatesLoading && <p>Loading trip dates...</p>}

    {!tripDatesLoading &&
      !tripDatesError &&
      selectedPackageId &&
      tripDates.length === 0 && (
        <p>No trip dates found for this package. Add one to get started.</p>
      )}

    {!tripDatesLoading && tripDates.length > 0 && (
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Departure</th>
              <th>Return</th>
              <th>Available Seats</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tripDates.map((trip) => (
              <tr key={trip.trip_date_id}>
                <td>{trip.trip_date_id}</td>
                <td>{String(trip.start_date).slice(0, 10)}</td>
                <td>{String(trip.end_date).slice(0, 10)}</td>
                <td>{trip.available_seats}</td>
                <td>
                  <div className="admin-package-actions">
                    <button
                      type="button"
                      className="back-button"
                      onClick={() => openEditTripDateForm(trip)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="back-button"
                      onClick={() => deleteTripDate(trip)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

    </section>
  );
}

export default AdminDashboard;