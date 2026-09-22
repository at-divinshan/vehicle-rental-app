// CustomerForm.jsx
// -----------------------------------------------------------
// Step 22: Pass Booking Data Through Props
//
// Idhu customer name / phone / email fields ah kaatura
// component. Booking.jsx -> VehicleInfo.jsx -> idha (CustomerForm)
// nu than data varum (structure diagram paaru). Idhu direct ah
// "customerName", "customerPhone", "customerEmail" matum
// "onCustomerChange" callback ah mattum use pannum.
// -----------------------------------------------------------

function CustomerForm({
  customerName,
  customerPhone,
  customerEmail,
  onCustomerChange,
}) {
  return (
    <div className="form-section form-grid">
      <div>
        <label className="form-label" htmlFor="customerName">
          Customer Name
        </label>
        <input
          id="customerName"
          type="text"
          className="filter-input"
          value={customerName}
          onChange={(e) => onCustomerChange("customerName", e.target.value)}
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label className="form-label" htmlFor="customerPhone">
          Phone Number
        </label>
        <input
          id="customerPhone"
          type="tel"
          className="filter-input"
          value={customerPhone}
          onChange={(e) => onCustomerChange("customerPhone", e.target.value)}
          placeholder="07XXXXXXXX"
        />
      </div>

      <div>
        <label className="form-label" htmlFor="customerEmail">
          Email
        </label>
        <input
          id="customerEmail"
          type="email"
          className="filter-input"
          value={customerEmail}
          onChange={(e) => onCustomerChange("customerEmail", e.target.value)}
          placeholder="you@example.com"
        />
      </div>
    </div>
  );
}

export default CustomerForm;
