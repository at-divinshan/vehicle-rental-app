import { useEffect, useState } from "react";
import { api } from "../api/client";

const vehicleFields = [
  ["reg_number", "Registration number", "text", 30], ["brand", "Brand", "text", 80],
  ["model", "Model", "text", 80], ["category", "Category", "text", 40],
  ["year", "Year", "number"], ["price_per_day", "Price per day (Rs.)", "number"],
  ["transmission", "Transmission", "text", 30], ["fuel_type", "Fuel type", "text", 30],
  ["seating_capacity", "Seats", "number"], ["location", "Location", "text", 120],
  ["image", "Image URL or path", "text", 500],
];
const customerFields = [["full_name", "Full name", "text", 120], ["email", "Email address", "email", 255], ["phone", "Phone number", "tel", 30]];

function Dashboard({ user, vehicles, bookings, updateVehicle, updateBookingStatus }) {
  const [section, setSection] = useState("Vehicles");
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState("");
  const [reload, setReload] = useState(0);
  const [editor, setEditor] = useState(null);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    api.customers().then((items) => { if (active) setCustomers(items); })
      .catch((failure) => { if (active) setCustomersError(failure.message); })
      .finally(() => { if (active) setCustomersLoading(false); });
    return () => { active = false; };
  }, [reload]);

  const openEditor = (item) => {
    setError("");
    setNotice("");
    setEditor({ id: section === "Bookings" ? item.bookingId : item.id, section });
    if (section === "Vehicles") {
      setDraft(Object.fromEntries([...vehicleFields.map(([key]) => [key, item[key] ?? ""]), ["is_available", item.isAvailable]]));
    } else if (section === "Customers") {
      setDraft({ full_name: item.full_name, email: item.email, phone: item.phone || "" });
    } else setDraft({ status: item.status });
  };
  const save = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      if (editor.section === "Vehicles") {
        await updateVehicle(editor.id, { ...draft, year: Number(draft.year), seating_capacity: Number(draft.seating_capacity), image: draft.image || null });
      } else if (editor.section === "Customers") {
        const saved = await api.updateCustomer(editor.id, { ...draft, phone: draft.phone || null });
        setCustomers((items) => items.map((item) => item.id === saved.id ? saved : item));
      } else await updateBookingStatus(editor.id, draft.status);
      setNotice(editor.section === "Bookings" ? "Booking status saved." : `${editor.section === "Vehicles" ? "Vehicle" : "Customer"} details saved.`);
      setEditor(null);
    } catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  };
  const changeSection = (value) => {
    setSection(value); setSearch(""); setEditor(null); setError(""); setNotice("");
  };
  const term = search.trim().toLowerCase();
  const matches = (...values) => values.join(" ").toLowerCase().includes(term);
  const fleet = vehicles.filter((item) => matches(item.brand, item.model, item.regNumber));
  const people = customers.filter((item) => matches(item.full_name, item.email, item.phone));
  const reservations = bookings.filter((item) => matches(item.bookingId, item.customerName, item.customerEmail, item.status));
  const confirmed = bookings.filter((booking) => booking.status !== "Cancelled");

  return <main className="page admin-page">
    <h1>Admin Dashboard</h1>
    <p>Welcome, {user.full_name}. Manage vehicles, customers, and bookings.</p>
    <div className="details-specs-grid">
      <div className="spec-item"><span className="spec-label">Total vehicles</span><strong>{vehicles.length}</strong></div>
      <div className="spec-item"><span className="spec-label">Available vehicles</span><strong>{vehicles.filter((vehicle) => vehicle.isAvailable).length}</strong></div>
      <div className="spec-item"><span className="spec-label">Total bookings</span><strong>{bookings.length}</strong></div>
      <div className="spec-item"><span className="spec-label">Booking value (excluding cancellations)</span><strong>RS.{confirmed.reduce((total, booking) => total + booking.totalAmount, 0).toFixed(2)}</strong></div>
    </div>
    <div className="filter-tabs" aria-label="Admin sections">
      {["Vehicles", "Customers", "Bookings"].map((value) => <button type="button" key={value} disabled={saving || Boolean(editor)} aria-pressed={section === value} className={`filter-tab ${section === value ? "active" : ""}`} onClick={() => changeSection(value)}>{value}</button>)}
    </div>
    {notice && <p className="admin-success" role="status">{notice}</p>}
    {editor ? <form className="admin-editor" onSubmit={save}>
      <h2>{section === "Bookings" ? `Update booking ${editor.id}` : `Edit ${section === "Vehicles" ? "vehicle" : "customer"}`}</h2>
      {section === "Customers" && <p>Changing the email changes the customer's sign-in email. Existing booking contact details remain unchanged.</p>}
      {section === "Vehicles" && <p>Price changes apply to new bookings. Existing booking totals remain unchanged.</p>}
      <fieldset disabled={saving}>
        <div className="admin-form-grid">
          {(section === "Vehicles" ? vehicleFields : section === "Customers" ? customerFields : []).map(([key, label, type, maxLength]) => <label key={key} htmlFor={`admin-${key}`}>{label}
            <input id={`admin-${key}`} name={key} type={type} maxLength={maxLength} required={!["image", "phone"].includes(key)}
              min={key === "year" ? 1900 : key === "price_per_day" ? 0.01 : type === "number" ? 1 : undefined}
              max={key === "year" ? 2100 : key === "seating_capacity" ? 100 : key === "price_per_day" ? 99999999.99 : undefined}
              minLength={key === "full_name" ? 2 : undefined} step={key === "price_per_day" ? "0.01" : type === "number" ? "1" : undefined}
              value={draft[key]} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} />
          </label>)}
          {section === "Vehicles" && <label className="admin-checkbox"><input type="checkbox" checked={draft.is_available} onChange={(event) => setDraft((current) => ({ ...current, is_available: event.target.checked }))} />Available for booking</label>}
          {section === "Bookings" && <label htmlFor="admin-status">Booking status<select id="admin-status" value={draft.status} onChange={(event) => setDraft({ status: event.target.value })}>{["Confirmed", "Completed", "Cancelled"].map((value) => <option key={value}>{value}</option>)}</select></label>}
        </div>
      </fieldset>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="admin-actions"><button type="submit" className="cta-btn" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button><button type="button" className="cta-btn-outline" disabled={saving} onClick={() => { setEditor(null); setError(""); }}>Cancel editing</button></div>
    </form> : <section aria-label={`${section} management`}>
      <h2>{section}</h2>
      <label htmlFor="admin-search">Search {section.toLowerCase()}</label>
      <input id="admin-search" className="filter-input admin-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${section.toLowerCase()}...`} />
      {section === "Customers" && customersLoading ? <p role="status">Loading customers...</p> : section === "Customers" && customersError ? <div><p role="alert" className="form-error">{customersError}</p><button onClick={() => { setCustomersError(""); setCustomersLoading(true); setReload((value) => value + 1); }}>Try again</button></div> : <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr>{(section === "Vehicles" ? ["Vehicle", "Registration", "Daily price", "Availability", "Action"] : section === "Customers" ? ["Name", "Email", "Phone", "Action"] : ["Booking", "Customer", "Vehicle", "Dates", "Total", "Status", "Action"]).map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>
          {section === "Vehicles" && fleet.map((item) => <tr key={item.id}><td>{item.brand} {item.model}</td><td>{item.regNumber}</td><td>RS.{item.pricePerDay.toFixed(2)}</td><td>{item.isAvailable ? "Available" : "Unavailable"}</td><td><button className="admin-edit" aria-label={`Edit ${item.brand} ${item.model}`} onClick={() => openEditor(item)}>Edit</button></td></tr>)}
          {section === "Customers" && people.map((item) => <tr key={item.id}><td>{item.full_name}</td><td>{item.email}</td><td>{item.phone || "—"}</td><td><button className="admin-edit" aria-label={`Edit ${item.full_name}`} onClick={() => openEditor(item)}>Edit</button></td></tr>)}
          {section === "Bookings" && reservations.map((item) => { const vehicle = vehicles.find((entry) => entry.id === item.vehicleId); return <tr key={item.bookingId}><td>{item.bookingId}</td><td>{item.customerName}</td><td>{vehicle ? `${vehicle.brand} ${vehicle.model}` : `Vehicle ${item.vehicleId}`}</td><td>{item.pickupDate} to {item.returnDate}</td><td>RS.{item.totalAmount.toFixed(2)}</td><td>{item.status}</td><td><button className="admin-edit" aria-label={`Update ${item.bookingId}`} onClick={() => openEditor(item)}>Update status</button></td></tr>; })}
        </tbody>
      </table>{(section === "Vehicles" ? fleet : section === "Customers" ? people : reservations).length === 0 && <p className="no-results">{term ? "No results match your search." : `No ${section.toLowerCase()} yet.`}</p>}</div>}
    </section>}
  </main>;
}
export default Dashboard;
