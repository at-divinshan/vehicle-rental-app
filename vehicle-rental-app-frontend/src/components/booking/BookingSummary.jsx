// BookingSummary.jsx
// -----------------------------------------------------------
// Step 22: Pass Booking Data Through Props
//
// Idhu live booking summary box (rental days, base cost, services
// cost, tax, discount, final amount). Booking.jsx -> VehicleInfo.jsx
// -> idha (BookingSummary) nu than data varum. Idhu direct ah
// already-calculated numbers ah mattum use pannum (idhu ஒரு
// calculation um pannathu - andha kelasam Booking.jsx la than
// nadakum, idhu just kaataravadhu than vela).
// -----------------------------------------------------------

function BookingSummary({
  selectedVehicle,
  rentalDays,
  baseRentalCost,
  servicesCost,
  taxAmount,
  taxRate,
  discountAmount,
  finalAmount,
}) {
  return (
    <div className="booking-summary">
      <h3>Booking Summary</h3>
      <div className="summary-row">
        <span>Rental Days</span>
        <span>{rentalDays}</span>
      </div>
      <div className="summary-row">
        <span>
          Vehicle Rental{" "}
          {selectedVehicle
            ? `(RS.${selectedVehicle.pricePerDay} x ${rentalDays})`
            : ""}
        </span>
        <span>RS.{baseRentalCost.toFixed(2)}</span>
      </div>
      <div className="summary-row">
        <span>Additional Services</span>
        <span>RS.{servicesCost.toFixed(2)}</span>
      </div>
      <div className="summary-row">
        <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
        <span>RS.{taxAmount.toFixed(2)}</span>
      </div>
      <div className="summary-row">
        <span>Discount</span>
        <span>- RS.{discountAmount.toFixed(2)}</span>
      </div>
      <div className="summary-row summary-total">
        <span>Final Amount</span>
        <span>RS.{finalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default BookingSummary;
