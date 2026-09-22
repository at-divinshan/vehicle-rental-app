import { useEffect, useState } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Vehicles from "./pages/Vehicles";
import VehicleDetails from "./pages/VehicleDetails";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { api, normalizeBooking, normalizeVehicle } from "./api/client";
import "./App.css";

function App() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(() => Boolean(localStorage.getItem("vehicle_rental_token")));
  const [sessionError, setSessionError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [retry, setRetry] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("vehicle_rental_token");
    localStorage.removeItem("vehicle_rental_user");
    setUser(null);
    setBookings([]);
    setVehicles([]);
  };

  useEffect(() => {
    let active = true;
    if (!localStorage.getItem("vehicle_rental_token")) return;
    api.me().then((currentUser) => {
      if (active) { setLoading(true); setUser(currentUser); }
    }).catch((error) => {
      if (!active) return;
      if (error.status === 401) handleLogout();
      else setSessionError(error.message);
    }).finally(() => { if (active) setCheckingSession(false); });
    return () => { active = false; };
  }, [retry]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([api.vehicles(), api.bookings()]).then(([fleet, reservations]) => {
      if (!active) return;
      setVehicles(fleet.map(normalizeVehicle));
      setBookings(reservations.map(normalizeBooking));
    }).catch((error) => {
      if (!active) return;
      if (error.status === 401) handleLogout();
      else setDataError(error.message);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user, retry]);

  const addBooking = async (payload) => {
    const saved = normalizeBooking(await api.createBooking(payload));
    setBookings((items) => [saved, ...items]);
    return saved;
  };
  const cancelBooking = async (id) => {
    const saved = normalizeBooking(await api.cancelBooking(id));
    setBookings((items) => items.map((item) => item.bookingId === id ? saved : item));
  };
  const updateVehicle = async (id, payload) => {
    const saved = normalizeVehicle(await api.updateVehicle(id, payload));
    setVehicles((items) => items.map((item) => item.id === id ? saved : item));
  };
  const updateBookingStatus = async (id, status) => {
    const saved = normalizeBooking(await api.updateBookingStatus(id, status));
    setBookings((items) => items.map((item) => item.bookingId === id ? saved : item));
  };
  const handleLogin = (currentUser) => {
    setLoading(true);
    setDataError("");
    setUser(currentUser);
  };
  const retryRequests = () => {
    setSessionError("");
    setDataError("");
    setLoading(true);
    setCheckingSession(Boolean(localStorage.getItem("vehicle_rental_token")));
    setRetry((value) => value + 1);
  };
  const destination = user?.role === "admin" ? "/dashboard" : "/vehicles";
  const protectedRoute = (element) => {
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    if (loading) return <main className="page" role="status">Loading your rental data...</main>;
    if (dataError) return <main className="page"><p role="alert">{dataError}</p><button onClick={retryRequests}>Try again</button></main>;
    return element;
  };

  if (checkingSession) return <main className="page" role="status">Checking your session...</main>;
  if (sessionError) return <main className="page"><p role="alert">Unable to restore your session: {sessionError}</p><button onClick={retryRequests}>Try again</button></main>;

  return <>
    {user && <Navbar user={user} onLogout={handleLogout} />}
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
      <Route path="/login" element={user ? <Navigate to={destination} replace /> : <Login onLogin={handleLogin} />} />
      <Route path="/home" element={protectedRoute(<Home vehicles={vehicles} />)} />
      <Route path="/vehicles" element={protectedRoute(<Vehicles vehicles={vehicles} />)} />
      <Route path="/vehicles/:id" element={protectedRoute(<VehicleDetails vehicles={vehicles} />)} />
      <Route path="/booking/:vehicleId?" element={protectedRoute(<Booking key={location.pathname} vehicles={vehicles} addBooking={addBooking} />)} />
      <Route path="/my-bookings" element={protectedRoute(<MyBookings vehicles={vehicles} bookings={bookings} cancelBooking={cancelBooking} />)} />
      <Route path="/dashboard" element={protectedRoute(user?.role === "admin" ? <Dashboard user={user} vehicles={vehicles} bookings={bookings} updateVehicle={updateVehicle} updateBookingStatus={updateBookingStatus} /> : <Navigate to="/vehicles" replace />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>;
}
export default App;
