// VehicleInfo.jsx
// -----------------------------------------------------------
// Step 22: Pass Booking Data Through Props
//
// Structure (namma decide pannina thara):
//   Booking
//     └─ VehicleInfo
//          ├─ CustomerForm
//          ├─ RentalDates
//          ├─ ServiceSelector
//          └─ BookingSummary
//
// Idhu vehicle dropdown ah kaatura component - "selectedVehicleId"
// matum "onSelectVehicle" mattum than idhukku direct ah theva.
// Aana CustomerForm / RentalDates / ServiceSelector /
// BookingSummary ellame idhoda CHILDREN ah irukanum nu namma
// structure sonna, so andha 4 components ku theva ana props
// ellam (customer fields, dates, locations, services, summary
// numbers) Booking.jsx la irundhu, INDHA component vazhi than
// kீழe pogum.
//
// -----------------------------------------------------------
// Step 23: Identify Prop Drilling
//
// கீழே "PROP DRILLING" nu comment pottu irukura props ah paaru -
// andha props edhuvume VehicleInfo NERAAA use pannala. Idhu
// ellam CustomerForm / RentalDates / ServiceSelector /
// BookingSummary kku mattum than theva. Aana React la, parent
// (Booking) -> child (VehicleInfo) -> grandchild (CustomerForm
// etc.) nu data pass panna na, IN-BETWEEN irukura VehicleInfo
// kkoodi andha props ah "accept" pannitu, "forward" pannanum -
// idha than "PROP DRILLING" nu solluvom.
//
// Idhu app periasa aagumbodhu problem aagurathu enna:
//   1. VehicleInfo oda purpose "vehicle select pannurathu" than,
//      aana ippo 15+ props idhoda signature la irukku - code
//      padikura oruthanukku confusing ah irukum ("idhu ellam
//      yaen VehicleInfo kku theva?" nu).
//   2. BookingSummary kku ஒரு புது prop (eg: "currency") add
//      pannanumna, Booking.jsx la matum illama, INDHA
//      VehicleInfo.jsx la kூடa andha prop ah add pannanum
//      (idhu use pannaadhalum) - ஒரு field maatha rendு files
//      touch pannanum.
//   3. Data eங்கிருந்து vandhுchu nu trace pannurathu kastama
//      irukum - BookingSummary la ஒரு wrong number varum bug
//      irundha, athu Booking.jsx la irundha VehicleInfo vazhi
//      தான் BookingSummary kku வந்துச்சு nu ஒவ்வொரு layer ஆ
//      pogi pogi paakanum.
//   4. VehicleInfo ah "reuse" pannanumna (eg: வேறு page la
//      vehicle select mattum kaatanumna), andha props ellam
//      kூட kொண்டு vara வேண்டியிருக்கும் - இல்லனா andha
//      children components error tharும்.
//
// (Idha than Step 24-26 la "useReducer" vachu, matum future la
// Context API / state management library vachu solve pannuvanga
// - namma indha exercise la "problem" ah mattum identify pannitu
// vachirukom.)
// -----------------------------------------------------------

import CustomerForm from "./CustomerForm";
import RentalDates from "./RentalDates";
import ServiceSelector from "./ServiceSelector";
import BookingSummary from "./BookingSummary";

function VehicleInfo({
  // ---- VehicleInfo NERAAA use pannura props ----
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  selectedVehicle,

  // ---- PROP DRILLING: idhu ellam CustomerForm kku than theva,
  // VehicleInfo idha touch kூடa pannala ----
  customerName,
  customerPhone,
  customerEmail,
  onCustomerChange,

  // ---- PROP DRILLING: idhu ellam RentalDates kku than theva ----
  pickupDate,
  returnDate,
  pickupLocation,
  returnLocation,
  onPickupDateChange,
  onReturnDateChange,
  onLocationChange,

  // ---- PROP DRILLING: idhu ellam ServiceSelector kku than theva ----
  additionalServices,
  selectedServiceIds,
  onServiceToggle,

  // ---- PROP DRILLING: idhu ellam BookingSummary kku than theva ----
  rentalDays,
  baseRentalCost,
  servicesCost,
  taxAmount,
  taxRate,
  discountAmount,
  finalAmount,
}) {
  return (
    <>
      {/* ---------- Vehicle selection (idha mattum than VehicleInfo NERAAA use pannurathu) ---------- */}
      <div className="form-section">
        <label className="form-label" htmlFor="vehicle">
          Selected Vehicle
        </label>
        <select
          id="vehicle"
          className="filter-input"
          value={selectedVehicleId}
          onChange={(e) => onSelectVehicle(e.target.value)}
        >
          <option value="">-- Select a vehicle --</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id} disabled={!v.isAvailable}>
              {v.brand} {v.model} - RS.{v.pricePerDay}/day
              {!v.isAvailable ? " (Booked)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* கீழே இருக்கிற 4 components kkum, மேலே "PROP DRILLING" nu
          comment pottu irukura props ah than forward pannurom -
          idha VehicleInfo use pannala, andha child kku matum
          kொடுக்கிறோம். */}
      <CustomerForm
        customerName={customerName}
        customerPhone={customerPhone}
        customerEmail={customerEmail}
        onCustomerChange={onCustomerChange}
      />

      <RentalDates
        pickupDate={pickupDate}
        returnDate={returnDate}
        pickupLocation={pickupLocation}
        returnLocation={returnLocation}
        onPickupDateChange={onPickupDateChange}
        onReturnDateChange={onReturnDateChange}
        onLocationChange={onLocationChange}
      />

      <ServiceSelector
        additionalServices={additionalServices}
        selectedServiceIds={selectedServiceIds}
        onServiceToggle={onServiceToggle}
      />

      <BookingSummary
        selectedVehicle={selectedVehicle}
        rentalDays={rentalDays}
        baseRentalCost={baseRentalCost}
        servicesCost={servicesCost}
        taxAmount={taxAmount}
        taxRate={taxRate}
        discountAmount={discountAmount}
        finalAmount={finalAmount}
      />
    </>
  );
}

export default VehicleInfo;
