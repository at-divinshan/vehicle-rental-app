// Booking.jsx
// -----------------------------------------------------------
// Idhu booking form page. (Step 2 - just page create pannirundhom)
// Ippo Step 14 to Step 20 varaikkum ella functionality yum
// idha add pannirukom - form, rental days calculation,
// price calculation, additional services, useState la booking
// store pannurathu matum booking confirmation kaatrathu.
//
// Step 21-22: "bookings" state ippo indha page kkulla illa - App.jsx
// la "lift" pannirukom (My Bookings page kkும் idha vachu access
// pannanum, adhanaala rendu pages kkும் common ah irukura parent
// - App.jsx - la than andha state vachirukanum). Adhanaala Booking
// page ku "bookings" matum "addBooking" props ah App.jsx la
// irundhu varum.
//
// Step 22: Prop Drilling structure
//   Booking
//     └─ VehicleInfo
//          ├─ CustomerForm
//          ├─ RentalDates
//          ├─ ServiceSelector
//          └─ BookingSummary
// (VehicleInfo.jsx la Step 23 prop drilling explanation
// vachirukom - inge paaru)
//
// Step 24-26: useReducer
// Munnadi customerName, customerPhone, customerEmail,
// selectedVehicleId, pickupDate, returnDate, pickupLocation,
// returnLocation, selectedServiceIds nu 9 separate useState
// variables irundhuchu. Ippo ellame "bookingReducer" nu ஒரு
// reducer kkulla combine pannirukom (src/reducers/bookingReducer.js
// paaru), matum "dispatch()" vachu than update pannurom -
// individual setX() functions ah inimel call panna maattom.
// -----------------------------------------------------------

import { useReducer, useState } from "react";
import { useParams, Link } from "react-router-dom";
import VehicleInfo from "../components/booking/VehicleInfo";
import {
  bookingReducer,
  getInitialBookingState,
  BOOKING_ACTIONS,
} from "../reducers/bookingReducer";

// -----------------------------------------------------------
// Step 17: Additional services array - idha "local array" ah
// component kku veliya vachirukom (component render aagum
// bodhu ella time yum indha array recreate aaga koodathu).
// Ovvoru service kum id (checkbox value ku), name (UI la
// kaatrathukku) matum price (final calculation ku) irukku.
// -----------------------------------------------------------
const additionalServices = [
  { id: "gps", name: "GPS Navigation", price: 300 },
  { id: "childSeat", name: "Child Seat", price: 250 },
  { id: "extraDriver", name: "Additional Driver", price: 500 },
  { id: "insurance", name: "Insurance", price: 800 },
  { id: "roadside", name: "Roadside Assistance", price: 400 },
];

// -----------------------------------------------------------
// Business rule constants - idha oru single place la vachu
// vachirundha, naalaikku tax % maathanum na oru line matum
// maathina pothum.
// TAX_RATE -> 8% tax final amount kanakku pannumbodhu add pannuvom.
// LONG_RENTAL_DISCOUNT -> rental 7 days or adhukku mela na,
// customer ku 10% discount kudukurom (long-term rental offer).
// -----------------------------------------------------------
const TAX_RATE = 0.08;
const LONG_RENTAL_DISCOUNT_RATE = 0.1;
const LONG_RENTAL_DAYS_THRESHOLD = 7;

function Booking({ addBooking, vehicles }) {
  // ---------------------------------------------------------------
  // Step 13 la VehicleDetails.jsx irundhu "/booking/:vehicleId" nu
  // navigate pannirundhanga. Andha ":vehicleId" ah inga useParams()
  // vachu edukurom - idhu vehicle dropdown ku "default selected"
  // value ah set panna use aagum. Direct ah "/booking" ku vandha
  // (Navbar vazhi), vehicleId undefined ah irukum - adhukkum
  // handle pannirukom (bookingReducer.js la "vehicleId || ''" paaru).
  // ---------------------------------------------------------------
  const { vehicleId } = useParams();

  // ---------------------------------------------------------------
  // Step 25-26: Booking form fields (customer name, phone, email,
  // selected vehicle, pickup/return date, pickup/return location,
  // selected services) ippo ஒரே "state" object kkulla, "dispatch"
  // vachu than update pannurom. getInitialBookingState(vehicleId)
  // ah useReducer oda 3rd argument ah kudutha, "lazy init" nu
  // solluvanga - ஒரே தடவை மட்டும் run aagும்.
  // ---------------------------------------------------------------
  const [bookingState, dispatch] = useReducer(
    bookingReducer,
    vehicleId,
    getInitialBookingState
  );

  // Step 20: submit pannina odane, andha booking ah "confirmedBooking"
  // la vachu, form ku pathila confirmation screen ah kaatuvom.
  // (Idhu useReducer part illa - idhu "form fields" illa, "UI mode"
  // switch pannura state, adhanala thani useState ah vachirukom.)
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Simple validation error message (form empty ah submit
  // pannaama irukka).
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // vehicles.js data la irundhu, dropdown la select panna vehicle
  // object ah edukurom - idha vachu than price, brand, model etc.
  // kீழe calculations ku use pannuvom.
  const selectedVehicle = vehicles.find(
    (v) => v.id === Number(bookingState.selectedVehicleId)
  );

  // ---------------------------------------------------------------
  // Step 15: Rental days calculate pannura function.
  // pickupDate matum returnDate (both "YYYY-MM-DD" string, <input
  // type="date"> kudukura format) ah vachu, eththana days nu
  // kanakku pannurom.
  //
  // Example: Pickup 20 August, Return 24 August => 4 days
  // (24 - 20 = 4). Return date pickup date kku munnadi/same ah
  // irundha (invalid range), 0 nu return pannuvom.
  //
  // Idha oru "normal function" ah than vachirukom (useEffect
  // venaam) - enna na pickupDate/returnDate state maarumbodhu,
  // React automatic ah component ah re-render pannum, so idhu
  // ovvoru render layum fresh ah recalculate aagidum ->
  // "calculation should update automatically when dates change"
  // nu step sonna requirement idhu vachu automatic ah nadakum.
  // ---------------------------------------------------------------
  const calculateRentalDays = (pickup, returnD) => {
    if (!pickup || !returnD) return 0;

    const pickupTime = new Date(pickup).getTime();
    const returnTime = new Date(returnD).getTime();

    if (isNaN(pickupTime) || isNaN(returnTime) || returnTime <= pickupTime) {
      return 0;
    }

    const oneDayMs = 1000 * 60 * 60 * 24;
    return Math.round((returnTime - pickupTime) / oneDayMs);
  };

  const rentalDays = calculateRentalDays(
    bookingState.pickupDate,
    bookingState.returnDate
  );

  // ---------------------------------------------------------------
  // Step 16: Base rental cost = Daily Price x Rental Days.
  // selectedVehicle illa na (customer innum vehicle select
  // pannalanu), 0 ah vachirukom, so summary la NaN varathu.
  // ---------------------------------------------------------------
  const baseRentalCost = selectedVehicle
    ? selectedVehicle.pricePerDay * rentalDays
    : 0;

  // ---------------------------------------------------------------
  // Step 17 (continued): customer select panna services oda total
  // cost kanakku pannurom - selectedServiceIds array la irukura
  // ovvoru id kum, additionalServices la irundhu andha service oda
  // price ah edutu sethu kudukurom.
  // ---------------------------------------------------------------
  const servicesCost = bookingState.selectedServiceIds.reduce(
    (total, serviceId) => {
      const service = additionalServices.find((s) => s.id === serviceId);
      return service ? total + service.price : total;
    },
    0
  );

  // ---------------------------------------------------------------
  // Step 18: Final price calculation
  //   Vehicle Rental (baseRentalCost)
  // + Additional Services (servicesCost)
  // + Tax (subtotal oda TAX_RATE %)
  // - Discount (7+ days rental na LONG_RENTAL_DISCOUNT_RATE %)
  // = Final Amount
  //
  // "subtotal" nu oru variable la vachu vachirukom, tax um
  // discount um rendume base + services mela than calculate
  // pannurom (real world booking systems idha mathiri than
  // pannuvanga).
  // ---------------------------------------------------------------
  const subtotal = baseRentalCost + servicesCost;
  const taxAmount = subtotal * TAX_RATE;
  const discountAmount =
    rentalDays >= LONG_RENTAL_DAYS_THRESHOLD
      ? baseRentalCost * LONG_RENTAL_DISCOUNT_RATE
      : 0;
  const finalAmount = subtotal + taxAmount - discountAmount;

  // Step 24: vehicle dropdown select aagumbodhu run aagum.
  const handleSelectVehicle = (newVehicleId) => {
    dispatch({ type: BOOKING_ACTIONS.SELECT_VEHICLE, payload: newVehicleId });
  };

  // Step 24: customer name/phone/email fields type pannumbodhu run
  // aagum - "field" nu paramater vachu, mூnu inputum ஒரே handler
  // ah share pannikittu irukum.
  const handleCustomerChange = (field, value) => {
    dispatch({
      type: BOOKING_ACTIONS.SET_CUSTOMER,
      payload: { field, value },
    });
  };

  const handlePickupDateChange = (value) => {
    dispatch({ type: BOOKING_ACTIONS.SET_PICKUP_DATE, payload: value });
  };

  const handleReturnDateChange = (value) => {
    dispatch({ type: BOOKING_ACTIONS.SET_RETURN_DATE, payload: value });
  };

  // Step 24: pickup/return location fields type pannumbodhu run aagum.
  const handleLocationChange = (field, value) => {
    dispatch({
      type: BOOKING_ACTIONS.SET_LOCATION,
      payload: { field, value },
    });
  };

  // Step 24: Checkbox click pannumbodhu run aagum - already select
  // pannirundha REMOVE_SERVICE, illana ADD_SERVICE dispatch pannurom
  // (toggle behaviour).
  const handleServiceToggle = (serviceId) => {
    if (bookingState.selectedServiceIds.includes(serviceId)) {
      dispatch({ type: BOOKING_ACTIONS.REMOVE_SERVICE, payload: serviceId });
    } else {
      dispatch({ type: BOOKING_ACTIONS.ADD_SERVICE, payload: serviceId });
    }
  };

  // ---------------------------------------------------------------
  // Step 19 + Step 20: Form submit pannumbodhu run aagum.
  // 1. Basic validation - required fields ella irukka nu paakurom.
  // 2. Ella booking details ah um vachu oru "newBooking" object
  //    create pannurom (Booking ID, Vehicle ID, Customer Name,
  //    Customer Phone, Pickup Date, Return Date, Pickup Location,
  //    Return Location, Services, Rental Days, Total Amount, Status).
  // 3. Andha object ah App.jsx la irundhu vara "addBooking" prop
  //    vachu, App.jsx la irukura "bookings" state kkulla add
  //    pannurom (Step 21/22 - idhu ippo App.jsx la than irukku).
  // 4. "confirmedBooking" ah set pannurom - idhu vachu than kீழe
  //    confirmation screen kaatuvom.
  // ---------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const {
      customerName,
      customerPhone,
      customerEmail,
      pickupDate,
      returnDate,
      pickupLocation,
      returnLocation,
      selectedServiceIds,
    } = bookingState;

    if (
      !customerName ||
      !customerPhone ||
      !selectedVehicle ||
      !selectedVehicle.isAvailable ||
      !pickupDate ||
      !returnDate ||
      !pickupLocation ||
      !returnLocation ||
      rentalDays <= 0
    ) {
      setFormError(
        "Please fill all required fields and choose a valid pickup/return date."
      );
      return;
    }

    setFormError("");

    setSubmitting(true);
    try {
      const savedBooking = await addBooking({
        vehicle_id: selectedVehicle.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        pickup_date: pickupDate,
        return_date: returnDate,
        pickup_location: pickupLocation,
        return_location: returnLocation,
        services: selectedServiceIds,
      });
      setConfirmedBooking(savedBooking);
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  // customer "Book Another Vehicle" click pannina, form ah
  // reset pannitu, veendum booking form ku thirumba pogum.
  const handleBookAnother = () => {
    setConfirmedBooking(null);
    // Step 24: RESET_BOOKING dispatch pannina, reducer andha
    // "getInitialBookingState('')" ah return pannum - ella
    // fields um empty ah maarum.
    dispatch({ type: BOOKING_ACTIONS.RESET_BOOKING, payload: "" });
  };

  // ---------------------------------------------------------------
  // Step 20: Booking confirmation UI.
  // confirmedBooking irundha (submit pannirundha), form ku pathila
  // idha kaatuvom - booking id, vehicle info, rental dates,
  // services matum total price.
  // ---------------------------------------------------------------
  if (confirmedBooking) {
    const confirmedVehicle = vehicles.find(
      (v) => v.id === confirmedBooking.vehicleId
    );

    return (
      <div className="page booking-page">
        <div className="booking-confirmation">
          <h1>Booking Confirmed</h1>
          <p className="confirmation-id">
            Booking ID: <strong>{confirmedBooking.bookingId}</strong>
          </p>

          {confirmedVehicle && (
            <div className="confirmation-section">
              <h3>Vehicle</h3>
              <p>
                {confirmedVehicle.brand} {confirmedVehicle.model} (
                {confirmedVehicle.regNumber})
              </p>
            </div>
          )}

          <div className="confirmation-section">
            <h3>Customer</h3>
            <p>{confirmedBooking.customerName}</p>
            <p>{confirmedBooking.customerPhone}</p>
          </div>

          <div className="confirmation-section">
            <h3>Rental Dates</h3>
            <p>
              {confirmedBooking.pickupDate} to {confirmedBooking.returnDate} (
              {confirmedBooking.rentalDays} days)
            </p>
            <p>
              {confirmedBooking.pickupLocation} to{" "}
              {confirmedBooking.returnLocation}
            </p>
          </div>

          {confirmedBooking.services.length > 0 && (
            <div className="confirmation-section">
              <h3>Additional Services</h3>
              <ul>
                {confirmedBooking.services.map((serviceId) => {
                  const service = additionalServices.find(
                    (s) => s.id === serviceId
                  );
                  return service ? (
                    <li key={serviceId}>
                      {service.name} - RS.{service.price}
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}

          <div className="confirmation-total">
            Total Amount: RS.{confirmedBooking.totalAmount.toFixed(2)}
          </div>

          <div className="confirmation-actions">
            <button className="cta-btn" onClick={handleBookAnother}>
              Book Another Vehicle
            </button>
            <Link to="/vehicles" className="cta-btn-outline confirmation-link">
              Back to Vehicles
            </Link>
            <Link to="/my-bookings" className="cta-btn-outline confirmation-link">
              View My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------
  // Step 14-18 / Step 22: Booking form UI (confirmedBooking illama
  // irukumbodhu idha than kaatuvom). Ella fields um ippo VehicleInfo
  // (matum adhoda children CustomerForm / RentalDates /
  // ServiceSelector / BookingSummary) via props render aagurathu -
  // idhu than Step 22 la sonna "prop drilling" structure.
  // ---------------------------------------------------------------
  return (
    <div className="page booking-page">
      <h1>Book a Vehicle</h1>

      <form className="booking-form" onSubmit={handleSubmit}>
        <VehicleInfo
          vehicles={vehicles}
          selectedVehicleId={bookingState.selectedVehicleId}
          onSelectVehicle={handleSelectVehicle}
          selectedVehicle={selectedVehicle}
          customerName={bookingState.customerName}
          customerPhone={bookingState.customerPhone}
          customerEmail={bookingState.customerEmail}
          onCustomerChange={handleCustomerChange}
          pickupDate={bookingState.pickupDate}
          returnDate={bookingState.returnDate}
          pickupLocation={bookingState.pickupLocation}
          returnLocation={bookingState.returnLocation}
          onPickupDateChange={handlePickupDateChange}
          onReturnDateChange={handleReturnDateChange}
          onLocationChange={handleLocationChange}
          additionalServices={additionalServices}
          selectedServiceIds={bookingState.selectedServiceIds}
          onServiceToggle={handleServiceToggle}
          rentalDays={rentalDays}
          baseRentalCost={baseRentalCost}
          servicesCost={servicesCost}
          taxAmount={taxAmount}
          taxRate={TAX_RATE}
          discountAmount={discountAmount}
          finalAmount={finalAmount}
        />

        {formError && <p className="form-error">{formError}</p>}

        <button type="submit" className="cta-btn rent-btn" disabled={submitting}>
          {submitting ? "Saving booking..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}

export default Booking;
