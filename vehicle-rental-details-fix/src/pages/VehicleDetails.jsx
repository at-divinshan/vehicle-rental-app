// VehicleDetails.jsx
// -----------------------------------------------------------
// Idhu vehicle details page - FULL ah build pannirukom. (Step 11 + 12)
//
// Flow:
// 1. VehicleCard la "View Details" click pannitanga -> URL
//    "/vehicles/3" mathiri maarum (App.jsx la namma
//    "/vehicles/:id" nu route define pannirukom).
// 2. Andha URL la irukura ":id" value ah "useParams()" hook
//    vachu edukurom.
// 3. Andha id ah vachu, vehicles.js data la irundhu andha
//    specific vehicle ah "find()" pannurom.
// 4. Vehicle kedaicha => details kaatanum.
//    Vehicle kedaikala (wrong id) => "Vehicle Not Found" kaatanum.
// -----------------------------------------------------------

import { useParams, useNavigate, Link } from "react-router-dom";

function VehicleDetails({ vehicles }) {
  // useParams() namma App.jsx la potta "/vehicles/:id" route la
  // irukura ":id" part ah kudukum. Idhu enna vandhalum "string"
  // ah than varum (eg: "3"), so vehicle.id (number) oda compare
  // panna Number() use pannanum.
  const { id } = useParams();

  // ---------------------------------------------------------------
  // Step 13: "Rent This Vehicle" button click pannumbodhu, code
  // vachu Booking page ku pogum. Adhukku useNavigate() hook use
  // pannurom - idhu ஒரு function ah return pannum, athai call
  // pannina namma virumbra route ku app "navigate" aagum.
  // ---------------------------------------------------------------
  const navigate = useNavigate();

  // Button click aana odane run aagura function. Idhu current
  // vehicle oda "id" ah "/booking/:vehicleId" route oda URL la
  // vachu pass pannum (eg: id = 3 na -> "/booking/3").
  // Booking.jsx page andha "vehicleId" ah useParams() vachu edukum.
  const handleRentClick = () => {
    navigate(`/booking/${id}`);
  };

  // vehicles array la irundhu, id match aagura vehicle ah
  // thedurom. Match aagala na "find()" undefined return pannum.
  const vehicle = vehicles.find((v) => v.id === Number(id));

  // -----------------------------------------------------------
  // Step 12: Invalid vehicle handle pannurom.
  // vehicle kedaikala na (undefined), proper message kaatanum -
  // empty page or broken UI kaatakoodathu.
  // -----------------------------------------------------------
  if (!vehicle) {
    return (
      <div className="page not-found-page">
        <h1>Vehicle Not Found</h1>
        <p>Sorry, neenga thedura vehicle ID ("{id}") namma system la illa.</p>
        <Link to="/vehicles" className="cta-btn">
          Back to Vehicles
        </Link>
      </div>
    );
  }

  // vehicle kedaicha, andha object la irundhu ella fields um
  // destructure pannitu kீழе display pannurom
  const {
    regNumber,
    brand,
    model,
    category,
    year,
    pricePerDay,
    transmission,
    fuelType,
    seatingCapacity,
    image,
    location,
    isAvailable,
  } = vehicle;

  return (
    <div className="page vehicle-details-page">
      {/* Vehicles page ku thirumba pogura link */}
      <Link to="/vehicles" className="back-link">
        ← Back to Vehicles
      </Link>

      <div className="details-card">
        {/* left side - image */}
        <div className="details-image-wrap">
          <img src={image} alt={`${brand} ${model}`} className="details-image" />
          <span className={`availability-badge ${isAvailable ? "available" : "unavailable"}`}>
            {isAvailable ? "Available" : "Booked"}
          </span>
        </div>

        {/* right side - full info */}
        <div className="details-info">
          <h1>
            {brand} {model}
          </h1>
          <p className="details-category">{category} • {year}</p>

          <p className="details-price">
            RS.{pricePerDay} <span>/ day</span>
          </p>

          {/* ella specification um oru grid la kaatunga */}
          <div className="details-specs-grid">
            <div className="spec-item">
              <span className="spec-label">Registration No.</span>
              <span className="spec-value">{regNumber}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Transmission</span>
              <span className="spec-value">{transmission}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Fuel Type</span>
              <span className="spec-value">{fuelType}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Seating Capacity</span>
              <span className="spec-value">{seatingCapacity} Seats</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Location</span>
              <span className="spec-value">{location}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Status</span>
              <span className="spec-value">{isAvailable ? "Available" : "Booked"}</span>
            </div>
          </div>

          {/* -----------------------------------------------------
              "Rent This Vehicle" button - Step 13
              Idha click panna, "Link" use pannama "button" +
              onClick={handleRentClick} vachirukom, enna na namakku
              click aana pinnadi ORU function run pannanum (vehicle
              id ah URL la sethu Booking page ku navigate pannurathukku).
              vehicle kedaikama irundha ("!isAvailable") button ah
              disable pannirukom, adhu already so amaidhi.
             ----------------------------------------------------- */}
          {isAvailable ? (
            <button className="cta-btn rent-btn" onClick={handleRentClick}>
              Rent This Vehicle
            </button>
          ) : (
            <button className="cta-btn rent-btn disabled" disabled>
              Currently Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VehicleDetails;
