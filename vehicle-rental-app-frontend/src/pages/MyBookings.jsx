// MyBookings.jsx
// -----------------------------------------------------------
// Idhu customer oda ella bookings ah um kaatura page. (Step 2)
//
// Step 21: Create My Bookings
// - "bookings" ippo App.jsx la irundhu prop ah varum (Step 22 la
//   solra "prop drilling" paragraph paaru - idhu App -> MyBookings
//   ஒரே level dhan, so idhu "drilling" illa, direct pass than).
// - Filters: All / Upcoming / Active / Completed / Cancelled.
//   Bookings kkulla eppovume "status: 'Confirmed'" nu than
//   Booking.jsx la set pannirundhom (illana "Cancelled" - customer
//   cancel pannitha). Adhanala Upcoming/Active/Completed nu 3
//   category um, pickupDate/returnDate ah "today" oda compare
//   panni than kanakku pannurom (kீழe getBookingStatus() paaru).
// -----------------------------------------------------------

import { useState } from "react";
import { Link } from "react-router-dom";

// Step 21: filter tabs la kaata options
const FILTER_OPTIONS = ["All", "Upcoming", "Active", "Completed", "Cancelled"];

// ---------------------------------------------------------------
// Step 21: booking oru "status" (Upcoming / Active / Completed /
// Cancelled) ah kanakku pannura helper function.
// - Customer manual ah cancel pannirundha ("status" field la
//   "Cancelled" nu vachirundha), andha status ah than kaatuvom.
// - Illana, "today" date ah, pickupDate/returnDate oda compare
//   panni:
//     today < pickupDate            -> "Upcoming"
//     pickupDate <= today <= returnDate -> "Active"
//     today > returnDate            -> "Completed"
// ---------------------------------------------------------------
function getBookingStatus(booking) {
  if (["Cancelled", "Completed"].includes(booking.status)) return booking.status;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pickup = new Date(booking.pickupDate);
  const returnD = new Date(booking.returnDate);

  if (today < pickup) return "Upcoming";
  if (today > returnD) return "Completed";
  return "Active";
}

function MyBookings({ bookings, cancelBooking, vehicles }) {
  // Step 21: currently select panna filter tab - default "All"
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);
  const handleCancel = async (id) => {
    setError("");
    setCancelling(id);
    try { await cancelBooking(id); }
    catch (requestError) { setError(requestError.message); }
    finally { setCancelling(null); }
  };
  const [activeFilter, setActiveFilter] = useState("All");

  // Step 21: active filter ah base panni, bookings ah filter pannurom
  const filteredBookings =
    activeFilter === "All"
      ? bookings
      : bookings.filter((b) => getBookingStatus(b) === activeFilter);

  return (
    <div className="page">
      <h1>My Bookings</h1>
      {error && <p className="form-error" role="alert">{error}</p>}

      {/* Step 21: Filter tabs - All / Upcoming / Active / Completed / Cancelled */}
      <div className="filter-tabs">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`filter-tab ${
              activeFilter === option ? "active" : ""
            }`}
            onClick={() => setActiveFilter(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <p className="no-bookings">
          Neenga innum edhum vehicle book pannala.{" "}
          <Link to="/vehicles">Browse Vehicles</Link>
        </p>
      ) : filteredBookings.length === 0 ? (
        <p className="no-bookings">
          "{activeFilter}" nu matching bookings edhuvum illa.
        </p>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((booking) => {
            const vehicle = vehicles.find((v) => v.id === booking.vehicleId);
            const status = getBookingStatus(booking);
            // Cancel button, booking innum start aagatha/nadakura
            // status la (Upcoming/Active) irundha mattum kaatuvom
            const canCancel = status === "Upcoming" || status === "Active";

            return (
              <div key={booking.bookingId} className="booking-card">
                <div className="booking-card-header">
                  <h3>
                    {vehicle ? `${vehicle.brand} ${vehicle.model}` : "Vehicle"}
                  </h3>
                  <span
                    className={`status-badge status-${status.toLowerCase()}`}
                  >
                    {status}
                  </span>
                </div>

                <p className="booking-card-id">
                  Booking ID: <strong>{booking.bookingId}</strong>
                </p>

                <div className="booking-card-details">
                  <p>
                    <span className="spec-label">Customer:</span>{" "}
                    {booking.customerName}
                  </p>
                  <p>
                    <span className="spec-label">Rental Dates:</span>{" "}
                    {booking.pickupDate} to {booking.returnDate} (
                    {booking.rentalDays} days)
                  </p>
                  <p>
                    <span className="spec-label">Locations:</span>{" "}
                    {booking.pickupLocation} to {booking.returnLocation}
                  </p>
                </div>

                <div className="booking-card-footer">
                  <span className="booking-card-total">
                    Total: RS.{booking.totalAmount.toFixed(2)}
                  </span>

                  {canCancel && (
                    <button
                      type="button"
                      className="cancel-btn"
                      disabled={cancelling !== null}
                      onClick={() => handleCancel(booking.bookingId)}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
