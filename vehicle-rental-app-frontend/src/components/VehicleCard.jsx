// VehicleCard.jsx
// -----------------------------------------------------------
// Idhu ஒரு reusable component. (Step 4)
// Idhukku "vehicle" nu ஒரு object props ah kudukurom,
// andha object la irundhu vara data va vachu card ah display pannurom.
// Idha Vehicles page la .map() panni palah times reuse pannuvom.
// -----------------------------------------------------------

import { Link } from "react-router-dom";

function VehicleCard({ vehicle }) {
  // vehicle object la irundhu namakku theva ana values ah destructure pannurom
  const {
    id,
    brand,
    model,
    category,
    pricePerDay,
    transmission,
    fuelType,
    image,
    isAvailable,
  } = vehicle;

  return (
    <div className="vehicle-card">
      {/* vehicle image */}
      <div className="vehicle-card-image-wrap">
        <img src={image} alt={`${brand} ${model}`} className="vehicle-card-image" />

        {/* isAvailable true na "Available" nu ilana "Booked" nu badge show pannurom */}
        <span className={`availability-badge ${isAvailable ? "available" : "unavailable"}`}>
          {isAvailable ? "Available" : "Booked"}
        </span>
      </div>

      <div className="vehicle-card-body">
        {/* brand + model sethu vehicle name */}
        <h3 className="vehicle-name">
          {brand} {model}
        </h3>

        {/* category eg: SUV, Sedan, Economy */}
        <p className="vehicle-category">{category}</p>

        {/* transmission and fuel type ah ஒரு row la kaamikurom */}
        <div className="vehicle-meta">
          <span>{transmission}</span>
          <span>{fuelType}</span>
        </div>

        {/* price per day */}
        <p className="vehicle-price">
          RS.{pricePerDay} <span>/ day</span>
        </p>

        {/* View Details button - dynamic route ku pogum (Step 11 la use aagum) */}
        <Link to={`/vehicles/${id}`} className="view-details-btn">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default VehicleCard;
