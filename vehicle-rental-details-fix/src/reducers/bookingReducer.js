// bookingReducer.js
// -----------------------------------------------------------
// Step 24 + Step 25: useReducer
//
// Munnadi (Step 14 varaikkum) Booking.jsx la 8-9 useState
// variables (customerName, customerPhone, customerEmail,
// selectedVehicleId, pickupDate, returnDate, pickupLocation,
// returnLocation, selectedServiceIds) separate ah irundhuchu.
// Idhu ella oda ஒரு "single form" nu logically related, so
// idha ஒரு reducer kkulla combine pannirukom.
//
// Step 24: Idha down la irukura ACTIONS ah vachu update pannuvom:
//   SELECT_VEHICLE   -> vehicle dropdown select pannumbodhu
//   SET_CUSTOMER     -> customer name / phone / email type pannumbodhu
//   SET_PICKUP_DATE  -> pickup date maarumbodhu
//   SET_RETURN_DATE  -> return date maarumbodhu
//   SET_LOCATION     -> pickup / return location type pannumbodhu
//   ADD_SERVICE      -> ஒரு additional service checkbox check pannumbodhu
//   REMOVE_SERVICE   -> ஒரு additional service checkbox uncheck pannumbodhu
//   RESET_BOOKING    -> "Book Another Vehicle" click pannumbodhu, form
//                       ah muzhusa reset panna
// -----------------------------------------------------------

// Step 24: action type names ah ஒரு இடத்துல constant ah vachurukom -
// typo mistake panna koodathu nu (component la string directly
// type pannitta spelling mistake vandha bug varum, adha thavirka).
export const BOOKING_ACTIONS = {
  SELECT_VEHICLE: "SELECT_VEHICLE",
  SET_CUSTOMER: "SET_CUSTOMER",
  SET_PICKUP_DATE: "SET_PICKUP_DATE",
  SET_RETURN_DATE: "SET_RETURN_DATE",
  SET_LOCATION: "SET_LOCATION",
  ADD_SERVICE: "ADD_SERVICE",
  REMOVE_SERVICE: "REMOVE_SERVICE",
  RESET_BOOKING: "RESET_BOOKING",
};

// Step 25: initial state - vehicleId (route param la irundhu vara
// value, VehicleDetails.jsx la irundhu "Rent This Vehicle" click
// panni vandha) ah default selected vehicle ah vachikura function.
// useReducer oda 3rd argument ah idha kudutha, "lazy init" nu
// solluvanga - reducer create aaguravaga ஒரே தடவை run aagum.
export function getInitialBookingState(vehicleId) {
  return {
    selectedVehicleId: vehicleId || "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    pickupDate: "",
    returnDate: "",
    pickupLocation: "",
    returnLocation: "",
    selectedServiceIds: [],
  };
}

// ---------------------------------------------------------------
// Step 25: bookingReducer
// (state, action) => newState mathiri than irukanum.
// IMPORTANT: state ah direct ah edit panna koodathu (state.x = y
// mathiri panna koodathu) - eppovum "{ ...state, ... }" vachu
// puthu object return pannanum, appo dhan React change ah
// correct ah detect pannum.
// ---------------------------------------------------------------
export function bookingReducer(state, action) {
  switch (action.type) {
    case BOOKING_ACTIONS.SELECT_VEHICLE:
      // action.payload => select panna vehicle oda id
      return { ...state, selectedVehicleId: action.payload };

    case BOOKING_ACTIONS.SET_CUSTOMER:
      // action.payload => { field: "customerName" | "customerPhone" |
      // "customerEmail", value: "..." }. Computed property name
      // ([action.payload.field]) vachu, andha field mattum update
      // pannurom, remaining state adhே madhiri irukum.
      return { ...state, [action.payload.field]: action.payload.value };

    case BOOKING_ACTIONS.SET_PICKUP_DATE:
      return { ...state, pickupDate: action.payload };

    case BOOKING_ACTIONS.SET_RETURN_DATE:
      return { ...state, returnDate: action.payload };

    case BOOKING_ACTIONS.SET_LOCATION:
      // action.payload => { field: "pickupLocation" | "returnLocation",
      // value: "..." }
      return { ...state, [action.payload.field]: action.payload.value };

    case BOOKING_ACTIONS.ADD_SERVICE:
      // already select pannirundha (double add aagama) skip pannurom
      if (state.selectedServiceIds.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        selectedServiceIds: [...state.selectedServiceIds, action.payload],
      };

    case BOOKING_ACTIONS.REMOVE_SERVICE:
      return {
        ...state,
        selectedServiceIds: state.selectedServiceIds.filter(
          (id) => id !== action.payload
        ),
      };

    case BOOKING_ACTIONS.RESET_BOOKING:
      // action.payload => optional vehicleId (illana empty ah start pannum)
      return getInitialBookingState(action.payload);

    default:
      // theriyatha action type na, state ah adhே madhiri return pannurom
      return state;
  }
}
