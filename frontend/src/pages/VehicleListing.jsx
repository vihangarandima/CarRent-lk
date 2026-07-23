import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../config";
import VehicleCard from "../components/VehicleCard";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Link } from "react-router-dom";
import {
  MapPin,
  Car,
  Sliders,
  Sparkles,
  Navigation,
  Search,
  Star,
  Map,
  LayoutGrid,
} from "lucide-react";

// 1. Import your images using relative paths from this component's location
import bikeeImg from "../assets/images/bikee.jpg";
import threewheelerImg from "../assets/images/threewheeler.jpg";
import carImg from "../assets/images/car.jpg";
import vanImg from "../assets/images/van.jpg";
import companyImg from "../assets/images/company.jpg";

const listingMapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1.5rem",
};

const sriLankaCenter = { lat: 7.8731, lng: 80.7718 };

const normalizeSearchText = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const VehicleListing = () => {
  const [filter, setFilter] = useState({
    location: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleType, setVehicleType] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "map"
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // 2. Map the imported variables to your image properties
  const vehicleTypeCards = [
    {
      id: "bicycle",
      title: "Bicycle",
      image: bikeeImg,
    },
    {
      id: "threewheeler",
      title: "Three-wheeler",
      image: threewheelerImg,
    },
    {
      id: "car",
      title: "Car",
      image: carImg,
    },
    {
      id: "van",
      title: "Van",
      image: vanImg,
    },
    {
      id: "others",
      title: "Others",
      image: companyImg,
    },
  ];

  const [filterShow, setFilterShow] = useState("nearest");
  const [filterFuel, setFilterFuel] = useState("any");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/vehicles`);
        setVehicles(res.data);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const filtered = vehicles.filter((v) => {
    const searchLocation = normalizeSearchText(filter.location);
    const vehicleLocation = normalizeSearchText(v.location);
    const companyLocation = normalizeSearchText(v.company?.address);
    const companyName = normalizeSearchText(v.company?.companyName);

    const matchBrand =
      !filter.brand ||
      v.brand?.toLowerCase().includes(filter.brand.toLowerCase());
    const matchLocation =
      !searchLocation ||
      vehicleLocation.includes(searchLocation) ||
      companyLocation.includes(searchLocation) ||
      companyName.includes(searchLocation);
    const matchMinPrice =
      !filter.minPrice || v.pricePerDay >= parseInt(filter.minPrice);
    const matchMaxPrice =
      !filter.maxPrice || v.pricePerDay <= parseInt(filter.maxPrice);
    const matchFuel =
      filterFuel === "any" || v.fuelType?.toLowerCase() === filterFuel;
    const matchType =
      !vehicleType ||
      v.vehicleType?.toLowerCase() === vehicleType.toLowerCase();
    return (
      matchBrand &&
      matchLocation &&
      matchMinPrice &&
      matchMaxPrice &&
      matchFuel &&
      matchType
    );
  });

  return (
    <div className="listing-page">
      <div className="modern-header-section">
        <div className="top-badge">
          <Sparkles size={14} className="icon-orange-txt" />
          <span>Sri Lanka's modern car marketplace</span>
        </div>
        <h1 className="modern-title">
          Find the <span className="text-orange">nearest ride</span>
          <br /> in seconds.
        </h1>
        <p className="modern-subtitle">
          Search verified vehicles around you. Filter by brand, price range and
          fuel — book in a tap.
        </p>
      </div>

      <div className="container">
        <div className="search-card-block">
          <div className="search-card-header">
            <h2>
              Search in <span className="text-orange">3 quick steps</span>
            </h2>
            <button
              className="reset-btn"
              onClick={() => {
                setFilter({
                  location: "",
                  brand: "",
                  minPrice: "",
                  maxPrice: "",
                });
                setFilterShow("nearest");
                setFilterFuel("any");
              }}
            >
              Reset
            </button>
          </div>

          <div className="vehicle-type-card-section first-filter-card">
            <div className="vehicle-type-title-row">
              <div>
                <h3>Vehicle type</h3>
                <p>Filter by type before searching for rides.</p>
              </div>
              <button
                className="clear-type-btn"
                type="button"
                onClick={() => setVehicleType("")}
              >
                Clear
              </button>
            </div>
            <div className="vehicle-type-card-grid">
              {vehicleTypeCards.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={`vehicle-type-card ${
                    vehicleType === type.id ? "active-type-card" : ""
                  }`}
                  onClick={() =>
                    setVehicleType(vehicleType === type.id ? "" : type.id)
                  }
                >
                  <div className="vehicle-type-card-image">
                    <img src={type.image} alt={type.title} />
                  </div>
                  <span>{type.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="search-steps-row">
            <div className="search-step">
              <div className="step-label">
                <span className="step-num active-num">1</span> Location
              </div>
              <div className="step-input-box">
                <MapPin size={18} className="icon-orange-txt" />
                <input
                  type="text"
                  placeholder="Type a location..."
                  value={filter.location}
                  onChange={(e) =>
                    setFilter({ ...filter, location: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="search-step">
              <div className="step-label">
                <span className="step-num active-num">2</span> Brand
              </div>
              <div className="step-input-box">
                <Car size={18} className="icon-blue-txt" />
                <input
                  type="text"
                  placeholder="Any brand"
                  value={filter.brand}
                  onChange={(e) =>
                    setFilter({ ...filter, brand: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="search-step" style={{ flex: 1.5 }}>
              <div className="step-label">
                <span className="step-num active-num">3</span> Price / day
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div className="step-input-box" style={{ flex: 1 }}>
                  <span className="currency-label">LKR</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filter.minPrice}
                    onChange={(e) =>
                      setFilter({ ...filter, minPrice: e.target.value })
                    }
                  />
                </div>
                <span style={{ color: "#9ca3af", fontWeight: 600 }}>to</span>
                <div className="step-input-box" style={{ flex: 1 }}>
                  <span className="currency-label">LKR</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filter.maxPrice}
                    onChange={(e) =>
                      setFilter({ ...filter, maxPrice: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="search-action">
              <button className="big-search-btn">
                <Search size={20} /> Search
              </button>
            </div>
          </div>

          <div className="filter-bottom-row">
            <div className="filter-group">
              <span className="filter-label">SHOW ME</span>
              <button
                className={`filter-pill mode-pill ${
                  filterShow === "nearest" ? "active-mode" : ""
                }`}
                onClick={() => setFilterShow("nearest")}
              >
                <Navigation
                  size={14}
                  className={filterShow === "nearest" ? "" : "icon-gray-txt"}
                />{" "}
                Nearest
              </button>
              <button
                className={`filter-pill mode-pill ${
                  filterShow === "top-rated" ? "active-mode" : ""
                }`}
                onClick={() => setFilterShow("top-rated")}
              >
                <Star
                  size={14}
                  className={filterShow === "top-rated" ? "" : "icon-gray-txt"}
                />{" "}
                Top rated
              </button>
            </div>

            <div className="filter-group hide-mobile">
              <span className="filter-label">FUEL</span>
              {["any", "petrol", "diesel", "hybrid", "electric"].map((f) => (
                <button
                  key={f}
                  className={`filter-pill fuel-pill ${
                    filterFuel === f ? "active-fuel" : ""
                  }`}
                  onClick={() => setFilterFuel(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="match-count-pill">
              <Sliders size={14} className="icon-orange-txt" />{" "}
              {filtered.length} cars match
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="results-header-modern">
          <div className="results-titles">
            <h2>Nearest cars to you</h2>
            <p>{filtered.length} verified vehicles · live availability</p>
          </div>
          <div className="results-header-actions">
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === "grid" ? "active-view" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <LayoutGrid size={18} />
                <span>Grid</span>
              </button>
              <button
                className={`view-toggle-btn ${viewMode === "map" ? "active-view" : ""}`}
                onClick={() => setViewMode("map")}
                title="Map View"
              >
                <Map size={18} />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading vehicles...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span>🔍</span>
            <h3>No vehicles found</h3>
            <p>Try changing your filters</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="vehicle-grid animate-up">
            {filtered.map((v, i) => (
              <VehicleCard key={v._id} vehicle={v} index={i} />
            ))}
          </div>
        ) : (
          <div className="listing-map-section">
            <div className="listing-map-container">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={listingMapContainerStyle}
                  center={
                    filtered.find((v) => v.lat && v.lng)
                      ? {
                          lat: filtered.find((v) => v.lat && v.lng).lat,
                          lng: filtered.find((v) => v.lat && v.lng).lng,
                        }
                      : sriLankaCenter
                  }
                  zoom={8}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    styles: [
                      { featureType: "poi", stylers: [{ visibility: "off" }] },
                      {
                        featureType: "transit",
                        stylers: [{ visibility: "off" }],
                      },
                    ],
                  }}
                  onClick={() => setSelectedVehicle(null)}
                >
                  {filtered
                    .filter((v) => v.lat && v.lng)
                    .map((v) => (
                      <Marker
                        key={v._id}
                        position={{ lat: v.lat, lng: v.lng }}
                        title={`${v.brand} ${v.model}`}
                        icon={{
                          path: "M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z",
                          fillColor: "#f97316",
                          fillOpacity: 1,
                          strokeColor: "#ffffff",
                          strokeWeight: 2,
                          scale: 1.8,
                          anchor: { x: 12, y: 24 },
                        }}
                        onClick={() => setSelectedVehicle(v)}
                      />
                    ))}

                  {selectedVehicle &&
                    selectedVehicle.lat &&
                    selectedVehicle.lng && (
                      <InfoWindow
                        position={{
                          lat: selectedVehicle.lat,
                          lng: selectedVehicle.lng,
                        }}
                        onCloseClick={() => setSelectedVehicle(null)}
                      >
                        <div className="map-info-card">
                          {selectedVehicle.images &&
                            selectedVehicle.images[0] && (
                              <img
                                src={selectedVehicle.images[0]}
                                alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                                className="map-info-img"
                              />
                            )}
                          <div className="map-info-body">
                            <h4>
                              {selectedVehicle.brand} {selectedVehicle.model}
                            </h4>
                            <p className="map-info-location">
                              <MapPin size={12} /> {selectedVehicle.location}
                            </p>
                            <div className="map-info-footer">
                              <span className="map-info-price">
                                LKR{" "}
                                {selectedVehicle.pricePerDay?.toLocaleString()}
                                /day
                              </span>
                              <Link
                                to={`/vehicle/${selectedVehicle._id}`}
                                className="map-info-book"
                              >
                                Book →
                              </Link>
                            </div>
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                </GoogleMap>
              ) : (
                <div className="listing-map-loading">
                  <div className="spinner" />
                  <span>Loading Map...</span>
                </div>
              )}
            </div>
            {/* Side list for map view */}
            <div className="listing-map-sidebar">
              <div className="map-sidebar-header">
                <h3>
                  {filtered.filter((v) => v.lat && v.lng).length} pinned
                  vehicles
                </h3>
                <p>Click a pin to see details</p>
              </div>
              <div className="map-sidebar-list">
                {filtered.map((v) => (
                  <button
                    key={v._id}
                    className={`map-sidebar-item ${selectedVehicle?._id === v._id ? "map-sidebar-active" : ""}`}
                    onClick={() => setSelectedVehicle(v)}
                  >
                    <div className="map-sidebar-img-wrap">
                      {v.images && v.images[0] ? (
                        <img src={v.images[0]} alt={v.brand} />
                      ) : (
                        <div className="map-sidebar-placeholder">
                          <Car size={20} />
                        </div>
                      )}
                    </div>
                    <div className="map-sidebar-info">
                      <strong>
                        {v.brand} {v.model}
                      </strong>
                      <span className="map-sidebar-loc">
                        <MapPin size={11} /> {v.location}
                      </span>
                      <span className="map-sidebar-price">
                        LKR {v.pricePerDay?.toLocaleString()}/day
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* ========== MAP VIEW STYLES ========== */
        .results-header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .view-toggle {
          display: flex;
          background: #f3f4f6;
          border-radius: 100px;
          padding: 4px;
          gap: 2px;
        }
        .view-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 1.1rem;
          border-radius: 100px;
          border: none;
          background: transparent;
          font-size: 0.85rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: inherit;
        }
        .view-toggle-btn:hover {
          color: #111827;
        }
        .view-toggle-btn.active-view {
          background: #f97316;
          color: white;
          box-shadow: 0 4px 12px rgba(249,115,22,0.3);
        }

        .listing-map-section {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 1.5rem;
          height: 650px;
          animation: fadeInUp 0.4s ease both;
        }
        .listing-map-container {
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.06);
          position: relative;
        }
        .listing-map-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 1rem;
          color: #6b7280;
        }

        /* Info Window */
        .map-info-card {
          width: 240px;
          font-family: 'Inter', sans-serif;
        }
        .map-info-img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 10px;
          margin-bottom: 8px;
        }
        .map-info-body h4 {
          margin: 0 0 4px;
          font-size: 1rem;
          font-weight: 800;
          color: #111827;
        }
        .map-info-location {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #6b7280;
          font-size: 0.8rem;
          margin: 0 0 8px;
        }
        .map-info-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .map-info-price {
          font-weight: 800;
          font-size: 0.9rem;
          color: #f97316;
        }
        .map-info-book {
          background: #f97316;
          color: white;
          padding: 5px 14px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.78rem;
          text-decoration: none;
          transition: 0.2s;
          box-shadow: 0 3px 8px rgba(249,115,22,0.3);
        }
        .map-info-book:hover {
          background: #ea580c;
        }

        /* Map Sidebar */
        .listing-map-sidebar {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 1.5rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
        }
        .map-sidebar-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .map-sidebar-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 800;
          color: #111827;
        }
        .map-sidebar-header p {
          margin: 4px 0 0;
          font-size: 0.82rem;
          color: #9ca3af;
        }
        .map-sidebar-list {
          overflow-y: auto;
          flex: 1;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .map-sidebar-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem;
          border-radius: 1rem;
          border: 1.5px solid transparent;
          background: #fafafa;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          font-family: inherit;
        }
        .map-sidebar-item:hover {
          border-color: rgba(249,115,22,0.15);
          background: #fff7ed;
        }
        .map-sidebar-item.map-sidebar-active {
          border-color: #f97316;
          background: #fff7ed;
          box-shadow: 0 4px 12px rgba(249,115,22,0.1);
        }
        .map-sidebar-img-wrap {
          width: 56px;
          height: 56px;
          border-radius: 0.75rem;
          overflow: hidden;
          flex-shrink: 0;
        }
        .map-sidebar-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .map-sidebar-placeholder {
          width: 100%;
          height: 100%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
        }
        .map-sidebar-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .map-sidebar-info strong {
          font-size: 0.9rem;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .map-sidebar-loc {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.75rem;
          color: #9ca3af;
        }
        .map-sidebar-price {
          font-size: 0.82rem;
          font-weight: 800;
          color: #f97316;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .listing-map-section {
            grid-template-columns: 1fr;
            height: auto;
          }
          .listing-map-container {
            height: 400px;
          }
          .listing-map-sidebar {
            max-height: 300px;
          }
        }

        .listing-page {
          min-height: calc(100vh - 68px);
          padding-bottom: 80px;
          background: var(--bg);
        }

        /* Modern Header */
        .modern-header-section {
          padding: 4rem 1rem 3rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: linear-gradient(180deg, var(--primary-soft) 0%, var(--bg) 100%);
          position: relative;
          overflow: hidden;
        }

        .modern-header-section::before {
          content: "";
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%);
          top: -200px;
          right: -100px;
          pointer-events: none;
        }

        .vehicle-type-card-section {
          margin: 1.75rem 0 0;
          padding: 1.5rem 1.4rem;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(249, 115, 22, 0.14);
          border-radius: 26px;
          box-shadow: 0 14px 32px rgba(249, 115, 22, 0.07);
        }

        .vehicle-type-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .vehicle-type-title-row h2,
        .vehicle-type-title-row h3 {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 800;
          color: #111827;
        }

        .vehicle-type-title-row p {
          margin: 0.25rem 0 0;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .clear-type-btn {
          border: 1px solid #e5e7eb;
          background: white;
          color: #374151;
          padding: 0.85rem 1.25rem;
          border-radius: 9999px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }

        .clear-type-btn:hover {
          background: #f8fafc;
          border-color: #d1d5db;
        }

        .vehicle-type-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
        }

        .vehicle-type-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          border-radius: 24px;
          background: #ffffff;
          border: 1px solid #f1f5f9;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          text-align: center;
        }

        .vehicle-type-card:hover {
          transform: translateY(-4px);
          border-color: #f97316;
          box-shadow: 0 18px 36px rgba(249, 115, 22, 0.12);
        }

        .vehicle-type-card.active-type-card {
          border-color: #f97316;
          box-shadow: 0 20px 36px rgba(249, 115, 22, 0.18);
        }

        .vehicle-type-card-image {
          width: 100%;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 20px;
        }

        .vehicle-type-card-image img {
          width: 100%;
          max-width: 120px;
          height: auto;
          display: block;
          object-fit: contain;
        }

        .vehicle-type-card span {
          color: #111827;
          font-weight: 700;
          font-size: 0.98rem;
        }

        .top-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--primary-soft);
          border: 1px solid rgba(249, 115, 22, 0.2);
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--primary-dark);
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 1;
        }

        .icon-orange-txt { color: #f97316; }
        .icon-blue-txt { color: #38bdf8; }
        .icon-gray-txt { color: #9ca3af; }

        .modern-title {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 800;
          color: var(--text);
          line-height: 1.08;
          letter-spacing: -0.03em;
          margin: 0 0 1rem 0;
          position: relative;
          z-index: 1;
        }

        .text-orange {
          background: var(--grad-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .modern-subtitle {
          font-size: 1.1rem;
          color: var(--text-muted);
          max-width: 600px;
          line-height: 1.6;
          margin: 0;
          position: relative;
          z-index: 1;
        }

        /* Massive 3 Step Search Block */
        .search-card-block {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 2rem;
          box-shadow: var(--shadow-card);
          margin-bottom: 4rem;
        }

        .search-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .search-card-header h2 {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
          color: #111827;
          letter-spacing: -0.5px;
        }

        .reset-btn {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.08);
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #4b5563;
          cursor: pointer;
          transition: 0.2s;
        }
        .reset-btn:hover { background: #f3f4f6; color: #111827; }

        .search-steps-row {
          display: flex;
          gap: 1.5rem;
          align-items: flex-end;
          margin-bottom: 1.5rem;
        }

        .search-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .step-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 1rem;
          color: #111827;
        }

        .step-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          font-size: 0.8rem;
          background: #f97316;
          color: white;
          font-weight: 800;
        }

        .step-input-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #f8fafc;
          border: 1px solid transparent;
          border-radius: 1.25rem;
          padding: 1rem 1.25rem;
          transition: 0.2s;
        }
        .step-input-box:focus-within {
          border-color: #f97316;
          background: #ffffff;
          box-shadow: 0 4px 15px rgba(249,115,22,0.1);
        }

        .step-input-box input {
          border: none;
          background: none;
          font-size: 1rem;
          font-family: inherit;
          color: #111827;
          font-weight: 500;
          outline: none;
          width: 100%;
        }
        .step-input-box input::placeholder { color: #9ca3af; font-weight: 400; }

        .currency-label {
          font-weight: 800;
          color: #10b981;
          font-size: 0.9rem;
        }

        .search-action {
          flex-shrink: 0;
        }

        .big-search-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f97316;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 1.25rem;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 8px 20px rgba(249,115,22,0.3);
        }
        .big-search-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(249,115,22,0.4);
        }

        .filter-bottom-row {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(0,0,0,0.05);
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .filter-label {
          font-size: 0.75rem;
          font-weight: 800;
          color: #6b7280;
          letter-spacing: 0.5px;
          margin-right: 0.5rem;
        }

        .filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.06);
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #4b5563;
          cursor: pointer;
          transition: 0.2s;
          font-family: inherit;
        }

        .filter-pill:hover { background: #f9fafb; color: #111827; }

        .active-mode {
          background: #f97316;
          color: white;
          border-color: #f97316;
        }
        .active-mode:hover { background: #ea580c; color: white; }

        .active-fuel {
          background: #fff7ed;
          color: #f97316;
          border-color: rgba(249,115,22,0.2);
        }

        .match-count-pill {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #fff7ed;
          color: #111827;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 0.5rem 1rem;
          border-radius: 100px;
        }

        /* Results Display */
        .results-header-modern {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2rem;
        }

        .results-titles h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #111827;
          margin: 0 0 0.25rem 0;
          letter-spacing: -0.5px;
        }
        .results-titles p {
          color: #6b7280;
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
        }

        .view-all-btn {
          background: none;
          border: none;
          color: #f97316;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: 0.2s;
        }
        .view-all-btn:hover { color: #ea580c; transform: translateX(2px); }

        .vehicle-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 8rem 0;
          color: #6b7280;
        }
        .empty-state span { font-size: 4rem; }
        .empty-state h3 { color: #111827; margin: 0; font-weight: 800; font-size: 1.75rem; }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.05);
          border-top-color: #f97316;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .search-steps-row { flex-direction: column; align-items: stretch; }
          .search-step { width: 100%; }
          .filter-bottom-row { gap: 1rem; }
          .hide-mobile { display: none; }
          .match-count-pill { margin-left: 0; width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default VehicleListing;
