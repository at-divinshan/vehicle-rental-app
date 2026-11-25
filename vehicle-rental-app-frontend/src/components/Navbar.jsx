// Navbar.jsx
// -----------------------------------------------------------
// Idhu top navigation bar. React Router oda <Link> use pannitu
// page reload aagama, ella pages ku ellam pogalam. (Step 2)
// -----------------------------------------------------------

import { Link } from "react-router-dom";

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        🚗 Yaal Vazh
      </Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/vehicles">Vehicles</Link>
        <Link to="/booking">Booking</Link>
        <Link to="/my-bookings">My Bookings</Link>
        {user?.role === "admin" && <Link to="/dashboard">Dashboard</Link>}
        {user ? (
          <button type="button" className="nav-auth" onClick={onLogout}>Sign out</button>
        ) : (
          <Link to="/login" className="nav-auth">Sign in</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
