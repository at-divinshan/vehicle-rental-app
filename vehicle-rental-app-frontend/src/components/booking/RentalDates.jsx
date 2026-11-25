// RentalDates.jsx
// -----------------------------------------------------------
// Step 22: Pass Booking Data Through Props
//
// Idhu pickup/return date matum pickup/return location fields ah
// kaatura component. Booking.jsx -> VehicleInfo.jsx -> idha
// (RentalDates) nu than data varum. Idhu direct ah dates/locations
// matum avaga oda callbacks ah mattum use pannum.
// -----------------------------------------------------------

function RentalDates({
  pickupDate,
  returnDate,
  pickupLocation,
  returnLocation,
  onPickupDateChange,
  onReturnDateChange,
  onLocationChange,
}) {
  return (
    <>
      {/* ---------- Dates ---------- */}
      <div className="form-section form-grid">
        <div>
          <label className="form-label" htmlFor="pickupDate">
            Pickup Date
          </label>
          <input
            id="pickupDate"
            type="date"
            className="filter-input"
            value={pickupDate}
            onChange={(e) => onPickupDateChange(e.target.value)}
          />
        </div>

        <div>
          <label className="form-label" htmlFor="returnDate">
            Return Date
          </label>
          <input
            id="returnDate"
            type="date"
            className="filter-input"
            value={returnDate}
            onChange={(e) => onReturnDateChange(e.target.value)}
          />
        </div>
      </div>

      {/* ---------- Locations ---------- */}
      <div className="form-section form-grid">
        <div>
          <label className="form-label" htmlFor="pickupLocation">
            Pickup Location
          </label>
          <input
            id="pickupLocation"
            type="text"
            className="filter-input"
            value={pickupLocation}
            onChange={(e) =>
              onLocationChange("pickupLocation", e.target.value)
            }
            placeholder="eg: Mathagal"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="returnLocation">
            Return Location
          </label>
          <input
            id="returnLocation"
            type="text"
            className="filter-input"
            value={returnLocation}
            onChange={(e) =>
              onLocationChange("returnLocation", e.target.value)
            }
            placeholder="eg: Mathagal"
          />
        </div>
      </div>
    </>
  );
}

export default RentalDates;
