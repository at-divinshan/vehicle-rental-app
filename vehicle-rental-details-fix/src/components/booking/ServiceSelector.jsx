// ServiceSelector.jsx
// -----------------------------------------------------------
// Step 22: Pass Booking Data Through Props
//
// Idhu additional services (GPS, Child Seat, etc.) checkboxes ah
// kaatura component. Booking.jsx -> VehicleInfo.jsx -> idha
// (ServiceSelector) nu than data varum. Idhu direct ah
// "additionalServices" list, "selectedServiceIds" matum
// "onServiceToggle" callback ah mattum use pannum.
// -----------------------------------------------------------

function ServiceSelector({
  additionalServices,
  selectedServiceIds,
  onServiceToggle,
}) {
  return (
    <div className="form-section">
      <label className="form-label">Additional Services</label>
      <div className="services-list">
        {additionalServices.map((service) => (
          <label key={service.id} className="service-checkbox">
            <input
              type="checkbox"
              checked={selectedServiceIds.includes(service.id)}
              onChange={() => onServiceToggle(service.id)}
            />
            {service.name} (+RS.{service.price})
          </label>
        ))}
      </div>
    </div>
  );
}

export default ServiceSelector;
