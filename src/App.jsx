import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import DestinationCard from "./components/DestinationCard";
import destinations from "./data/destinations";
import PackageCard from "./components/PackageCard";

import Booking from "./components/Booking";
import AboutSection from "./components/AboutSection";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Login from "./components/Login";
import BookingConfirmation from "./components/BookingConfirmation";
import Payment from "./components/Payment";
import PaymentSuccess from "./components/PaymentSuccess";
import BookingConfirmed from "./components/BookingConfirmed";
import MyBookings from "./components/MyBookings";
import AdminDashboard from "./components/AdminDashboard";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import DestinationDetails from "./components/DestinationDetails";

import {
  BrowserRouter,
  Routes,
  Route,
  useSearchParams
} from "react-router-dom";

import PackageDetails from "./components/PackageDetails";


function Home() {
     const [packages, setPackages] = useState([]);
     const [searchParams] = useSearchParams();

  const section = searchParams.get("section");

  useEffect(() => {

    if (section) {

      setTimeout(() => {

        const element = document.getElementById(section);

        if (element) {
          element.scrollIntoView({
            behavior: "smooth"
          });
        }

      }, 100);

    }

  }, [section]);

useEffect(() => {

  fetch("http://127.0.0.1:8000/packages/")
    .then((response) => response.json())
    .then((data) => {
      setPackages(data);
    })
    .catch((error) => {
      console.error("Error fetching packages:", error);
    });

}, []);


  return (
    <>

      {/* HERO SECTION */}

      <section id="home" className="hero">

        <div className="hero-content">

          <p className="small-title">
            EXPLORE THE WORLD
          </p>

          <h1>
            Discover Your
            <br />
            Next Adventure
          </h1>

          <p className="hero-text">
            Explore beautiful destinations, discover
            unforgettable experiences and create memories
            that last a lifetime.
          </p>

          <a
            href="#destinations"
            className="explore-button"
          >
            Explore Destinations →
          </a>

        </div>

      </section>


      {/* DESTINATIONS SECTION */}

      <section
        id="destinations"
        className="destinations-section"
      >

        <div className="section-heading">

          <p className="small-title">
            EXPLORE
          </p>

          <h2>
            Popular Destinations
          </h2>

          <p>
            Discover some of the most beautiful places
            for your next adventure.
          </p>

        </div>


        <div className="destination-grid">

          {destinations.map((destination) => (

            <DestinationCard
              key={destination.id}
              destination={destination}
            />

          ))}

        </div>

      </section>


      {/* PACKAGES SECTION */}

      <section
        id="packages"
        className="packages-section"
      >

        <div className="section-heading">

          <p className="small-title">
            TRAVEL PACKAGES
          </p>

          <h2>
            Choose Your Perfect Trip
          </h2>

          <p>
            Carefully planned packages for unforgettable
            travel experiences.
          </p>

        </div>


        <div className="package-grid">

          {packages.map((packageData) => (

            <PackageCard
              key={packageData.package_id}
              packageData={packageData}
            />

          ))}

        </div>

      </section>


      {/* BOOKING SECTION */}

      <Booking />


      {/* ABOUT */}

      <AboutSection />


      {/* CONTACT */}

      <Contact />


      {/* FOOTER */}

      <Footer />

    </>
  );
}


function App() {

  return (

    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* HOME PAGE */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* PACKAGE DETAILS PAGE */}

        <Route
          path="/packages/:id"
          element={<PackageDetails />}
        />


        {/* BOOKING PAGE */}

        <Route
          path="/booking"
          element={<Booking />}
        />

        <Route
           path="/login"
           element={<Login />}
        />
        
         <Route
  path="/register"
  element={<Register />}
/>
     
       
       <Route
         path="/booking-confirmation"
         element={<BookingConfirmation />}
        />

        <Route
  path="/payment-success"
  element={<PaymentSuccess />}
/>

        <Route
  path="/payment"
  element={<Payment />}
/>

<Route
  path="/booking-confirmed"
  element={<BookingConfirmed />}
/>
<Route
  path="/my-bookings"
  element={<MyBookings />}
/>
<Route
  path="/admin"
  element={<AdminDashboard />}
/>

<Route path="/forgot-password" element={<ForgotPassword />} />

<Route
  path="/destinations/:destination"
  element={<DestinationDetails />}
/>
</Routes>
</BrowserRouter>

  );
}


export default App;