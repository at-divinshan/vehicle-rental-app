const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function request(path, options = {}) {
  const token = localStorage.getItem("vehicle_rental_token");
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  } catch {
    throw new Error("Unable to reach the server. Please try again shortly.");
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => `${item.loc?.slice(1).join(".") || "Input"}: ${item.msg}`).join("; ")
      : typeof detail === "string" ? detail : "Request failed";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return body;
}

export const api = {
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),
  bookings: () => request("/bookings"),
  createBooking: (payload) => request("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  cancelBooking: (bookingId) => request(`/bookings/${bookingId}/cancel`, { method: "PATCH" }),
  vehicles: () => request("/vehicles"),
  updateVehicle: (id, payload) => request(`/vehicles/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  customers: () => request("/customers"),
  updateCustomer: (id, payload) => request(`/customers/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  updateBookingStatus: (id, status) => request(`/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

export function normalizeBooking(booking) {
  return {
    ...booking,
    bookingId: booking.booking_id,
    vehicleId: booking.vehicle_id,
    customerName: booking.customer_name,
    customerPhone: booking.customer_phone,
    customerEmail: booking.customer_email,
    pickupDate: booking.pickup_date,
    returnDate: booking.return_date,
    pickupLocation: booking.pickup_location,
    returnLocation: booking.return_location,
    rentalDays: booking.rental_days,
    totalAmount: Number(booking.total_amount),
  };
}

export function normalizeVehicle(vehicle) {
  return {
    ...vehicle,
    regNumber: vehicle.reg_number,
    pricePerDay: Number(vehicle.price_per_day),
    fuelType: vehicle.fuel_type,
    seatingCapacity: vehicle.seating_capacity,
    isAvailable: vehicle.is_available,
  };
}
