// Home.jsx
// -----------------------------------------------------------
// Idhu namma app oda landing page - konjam detail ah improve
// pannirukom (hero + featured vehicles + how it works + stats).
//
// Color/design ah namma already App.css la irukura navy (#1e293b)
// + blue (#2563eb) theme ah than use pannirukom, pudhusa onnum
// add pannala - same model.
// -----------------------------------------------------------

import { Link } from "react-router-dom";
import VehicleCard from "../components/VehicleCard";

function Home({ vehicles }) {
  // ----------------------------------------------------------------
  // "Featured Vehicles" nu 4 vehicles mattum kaatanum, so full
  // vehicles array (15 items) la irundhu .slice(0, 4) use panni
  // mudhal 4 vehicles ah eduthukurom. Idhu original array ah
  // mutate pannadhu, oru pudhu chinna array ah than return pannum.
  // ----------------------------------------------------------------
  const featuredVehicles = vehicles.slice(0, 4);

  // ----------------------------------------------------------------
  // Stats section ku vendiya numbers ah data la irundhe dynamic ah
  // calculate pannurom - idhunala vehicles.js file la data add
  // pannalum, ithu automatic ah update aagum (hardcode pannala).
  // ----------------------------------------------------------------
  const totalVehicles = vehicles.length;
  const availableCount = vehicles.filter((v) => v.isAvailable).length;
  // Set() use panni duplicate illama unique categories eduthukurom
  const categoryCount = new Set(vehicles.map((v) => v.category)).size;

  return (
    <div className="home-page">
      {/* ---------------- HERO SECTION ---------------- */}
      <section className="hero">
        <div className="hero-content">
          <h1>Rent the Right Vehicle, Right Now</h1>
          <p>
            Economy car mudhal luxury sedan varaikkum, SUV, van, electric
            ellam - ஒரே place la browse pannunga, book pannunga,
            drive pannunga.
          </p>

          <div className="hero-actions">
            <Link to="/vehicles" className="cta-btn">
              Browse Vehicles
            </Link>
            {/* Secondary button - different style but same color palette */}
            <Link to="/booking" className="cta-btn-outline">
              Quick Booking
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- STATS SECTION ---------------- */}
      {/* Idhu namma data.js file la irundhu dynamic ah calculate panna
          numbers - hardcoded values illa */}
      <section className="stats-row">
        <div className="stat-box">
          <span className="stat-number">{totalVehicles}+</span>
          <span className="stat-label">Vehicles Listed</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">{availableCount}</span>
          <span className="stat-label">Available Now</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">{categoryCount}</span>
          <span className="stat-label">Categories</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">24/7</span>
          <span className="stat-label">Support</span>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      {/* Idhu real ah sequence (1 -> 2 -> 3) nala, step number
          use pannalam - order pothum information tharudhu */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-row">
          <div className="step-box">
            <span className="step-number">01</span>
            <h3>Choose a Vehicle</h3>
            <p>Search, filter category, price range vachu unga vehicle ah kandupidichukonga.</p>
          </div>
          <div className="step-box">
            <span className="step-number">02</span>
            <h3>Book Your Dates</h3>
            <p>Pickup & return date, location select pannunga, cost automatic ah calculate aagum.</p>
          </div>
          <div className="step-box">
            <span className="step-number">03</span>
            <h3>Drive Away</h3>
            <p>Booking confirm aana odane, unga vehicle ready - pickup location la vandhu edunga.</p>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURED VEHICLES ---------------- */}
      {/* Namma already build panna VehicleCard component ah than
          idhulaiyum reuse pannirukom - same card, same design */}
      <section className="featured-section">
        <div className="featured-header">
          <h2>Featured Vehicles</h2>
          <Link to="/vehicles" className="view-all-link">
            View All →
          </Link>
        </div>

        <div className="vehicle-grid">
          {featuredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
