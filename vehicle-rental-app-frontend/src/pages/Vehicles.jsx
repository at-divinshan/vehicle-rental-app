// Vehicles.jsx
// -----------------------------------------------------------
// Idhu namma vehicle listing page. (Step 5)
// Local vehicles.js file la irundhu data import pannikittu,
// .map() use pannitu ella vehicle ah um VehicleCard component
// vachu display pannurom.
//
// Step 6-10: Search / Category Filter / Price Filter / Sort
// ella um inga add pannirukom. Ella state um (search, category,
// minPrice, maxPrice, sortOption) inga than vechirukom, so
// ella feature um sethu work aagum (Step 10 - Combine Filters).
// -----------------------------------------------------------

import { useState } from "react";
import VehicleCard from "../components/VehicleCard";

// Step 7: category dropdown la kaata options
const CATEGORY_OPTIONS = ["Economy", "Sedan", "SUV", "Luxury", "Van", "Electric"];

function Vehicles({ vehicles }) {
  // -----------------------------------------------------------
  // Step 6: Search state - brand, model, or reg number search pannum
  // -----------------------------------------------------------
  const [search, setSearch] = useState("");

  // -----------------------------------------------------------
  // Step 7: Category filter state - "All" na category filter
  // apply pannakoodathu, ella vehicles um kaatanum
  // -----------------------------------------------------------
  const [category, setCategory] = useState("All");

  // -----------------------------------------------------------
  // Step 8: Min / Max price filter state
  // -----------------------------------------------------------
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // -----------------------------------------------------------
  // Step 9: Sort option state
  // -----------------------------------------------------------
  const [sortOption, setSortOption] = useState("none");

  // -----------------------------------------------------------
  // Step 6: Search filter
  // brand, model, regNumber moonu layum check pannurom.
  // toLowerCase() use panni case-insensitive ah search pannurom.
  // -----------------------------------------------------------
  let filteredVehicles = vehicles.filter((vehicle) => {
    const searchValue = search.trim().toLowerCase();
    if (!searchValue) return true;

    return (
      vehicle.brand.toLowerCase().includes(searchValue) ||
      vehicle.model.toLowerCase().includes(searchValue) ||
      vehicle.regNumber.toLowerCase().includes(searchValue)
    );
  });

  // -----------------------------------------------------------
  // Step 7: Category filter
  // "All" nu iruntha ella category um kaatanum, illana
  // andha category ku match aagura vehicles mattum kaatanum
  // -----------------------------------------------------------
  if (category !== "All") {
    filteredVehicles = filteredVehicles.filter(
      (vehicle) => vehicle.category === category
    );
  }

  // -----------------------------------------------------------
  // Step 8: Price filter
  // minPrice / maxPrice empty ah irundha andha condition ah
  // skip pannurom (user set pannala na filter panna koodathu)
  // -----------------------------------------------------------
  if (minPrice !== "") {
    filteredVehicles = filteredVehicles.filter(
      (vehicle) => vehicle.pricePerDay >= Number(minPrice)
    );
  }

  if (maxPrice !== "") {
    filteredVehicles = filteredVehicles.filter(
      (vehicle) => vehicle.pricePerDay <= Number(maxPrice)
    );
  }

  // -----------------------------------------------------------
  // Step 9: Sorting
  // IMPORTANT: original "vehicles" array ah mutate panna koodathu.
  // adhanala filteredVehicles ah [...filteredVehicles] vachu
  // ஒரு puthu copy edukurom, appuram andha copy ah sort pannurom.
  // -----------------------------------------------------------
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    switch (sortOption) {
      case "price-low-high":
        return a.pricePerDay - b.pricePerDay;
      case "price-high-low":
        return b.pricePerDay - a.pricePerDay;
      case "newest":
        return b.year - a.year;
      case "oldest":
        return a.year - b.year;
      default:
        // "none" na order ah maathama vidurom
        return 0;
    }
  });

  return (
    <div className="page vehicles-page">
      <h1>Available Vehicles</h1>

      {/* -----------------------------------------------------
          Step 10: Search + Filter + Sort ella um ஒரே bar la.
          Ithula edhu maathinaalum, above la irukura filter
          logic automatic ah re-run aagi results update aagum.
         ----------------------------------------------------- */}
      <div className="filters-bar">
        {/* Step 6: Search input */}
        <input
          type="text"
          className="filter-input search-input"
          placeholder="Search by brand, model or reg number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Step 7: Category dropdown */}
        <select
          className="filter-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Step 8: Min / Max price inputs */}
        <input
          type="number"
          className="filter-input price-input"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          className="filter-input price-input"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        {/* Step 9: Sort dropdown */}
        <select
          className="filter-input"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="none">Sort By</option>
          <option value="price-low-high">Price: Low to High</option>
          <option value="price-high-low">Price: High to Low</option>
          <option value="newest">Newest Vehicle</option>
          <option value="oldest">Oldest Vehicle</option>
        </select>
      </div>

      <div className="vehicle-grid">
        {/* sortedVehicles la irukura ஒவ்வொரு vehicle ku ஒரு VehicleCard render pannurom */}
        {sortedVehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}

        {/* filter apply pannitu ஒரு vehicle கூட kedaikala na message kaatanum */}
        {sortedVehicles.length === 0 && (
          <p className="no-results">No vehicles match your search/filter.</p>
        )}
      </div>
    </div>
  );
}

export default Vehicles;
