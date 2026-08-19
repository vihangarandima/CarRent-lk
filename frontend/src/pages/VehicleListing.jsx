import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import VehicleCard from "../components/VehicleCard";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
  CircleF,
} from "@react-google-maps/api";
import { Link, useSearchParams } from "react-router-dom";
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
  Trash2,
  LocateFixed,
} from "lucide-react";

// Image Imports
import bikeeImg from "../assets/images/bikee.jpg";
import threewheelerImg from "../assets/images/threewheeler.jpg";
import miniCarImg from "../assets/images/mini_car.png";
import carImg from "../assets/images/car.jpg";
import premiumCarImg from "../assets/images/premium_car.png";
import miniVanImg from "../assets/images/mini_van.png";
import vanImg from "../assets/images/van.jpg";
import othersCarImg from "../assets/images/others_car.png";

const listingMapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1.5rem",
};

const sriLankaCenter = { lat: 7.8731, lng: 80.7718 };

const BLUE_SEARCH_PIN_SVG = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="60" viewBox="0 0 48 60">
  <defs>
    <filter id="b-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <path d="M24 2C11.85 2 2 11.85 2 24c0 16.5 22 34 22 34s22-17.5 22-34C46 11.85 36.15 2 24 2z" fill="#2563eb" stroke="#ffffff" stroke-width="3" filter="url(#b-shadow)"/>
  <circle cx="24" cy="22" r="8" fill="#ffffff"/>
  <circle cx="24" cy="22" r="4" fill="#2563eb"/>
</svg>
`);

const ORANGE_CAR_PIN_SVG = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="42" height="52" viewBox="0 0 42 52">
  <defs>
    <filter id="c-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <path d="M21 2C10.5 2 2 10.5 2 21c0 14 19 29 19 29s19-15 19-29c0-10.5-8.5-19-19-19z" fill="#f97316" stroke="#ffffff" stroke-width="2.5" filter="url(#c-shadow)"/>
  <circle cx="21" cy="19" r="7" fill="#ffffff"/>
  <circle cx="21" cy="19" r="3.5" fill="#ea580c"/>
</svg>
`);

const normalizeSearchText = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Haversine formula to calculate distance between two coordinates in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const VehicleListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper to parse pinned coordinates from string or params
  const parseInitialPin = () => {
    const latP = searchParams.get("lat");
    const lngP = searchParams.get("lng");
    const locP = searchParams.get("location") || "";
    if (latP && lngP) {
      return {
        lat: parseFloat(latP),
        lng: parseFloat(lngP),
        address: locP || `Pinned Location (${parseFloat(latP).toFixed(4)}, ${parseFloat(lngP).toFixed(4)})`,
      };
    }
    const match = locP.match(/Pinned Location \(([0-9.-]+),\s*([0-9.-]+)\)/i);
    if (match) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2]),
        address: locP,
      };
    }
    return null;
  };

  const initialPin = parseInitialPin();

  // Read initial parameters directly from URL searchParams
  const [filter, setFilter] = useState({
    location: searchParams.get("location") || "",
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleType, setVehicleType] = useState(
    searchParams.get("type") || searchParams.get("vehicleType") || ""
  );
  const [viewMode, setViewMode] = useState(searchParams.get("view") || "grid"); // "grid" or "map"
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filterShow, setFilterShow] = useState("nearest");
  const [filterFuel, setFilterFuel] = useState(
    searchParams.get("fuel") || "any"
  );
  
  // GPS & Radius Search States
  const [userLocation, setUserLocation] = useState(null);
  const [pinnedLocation, setPinnedLocation] = useState(initialPin);
  const [radius, setRadius] = useState(
    parseInt(searchParams.get("radius")) || 20
  ); // default 20km radius
  const [mapCenter, setMapCenter] = useState(
    initialPin ? { lat: initialPin.lat, lng: initialPin.lng } : sriLankaCenter
  );
  const [mapZoom, setMapZoom] = useState(initialPin ? 11 : 8);
  const [isLocating, setIsLocating] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const vehicleTypeCards = [
    { id: "bicycle", title: "Bicycle", image: bikeeImg },
    { id: "threewheeler", title: "Three-wheeler", image: threewheelerImg },
    { id: "mini-car", title: "Mini Car", image: miniCarImg },
    { id: "car", title: "Car", image: carImg },
    { id: "premium-car", title: "Premium Car", image: premiumCarImg },
    { id: "mini-van", title: "Mini Van", image: miniVanImg },
    { id: "van", title: "Van", image: vanImg },
    { id: "others", title: "Others", image: othersCarImg },
  ];

  // Sync state changes to URL searchParams
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.location) params.set("location", filter.location);
    if (filter.brand) params.set("brand", filter.brand);
    if (filter.minPrice) params.set("minPrice", filter.minPrice);
    if (filter.maxPrice) params.set("maxPrice", filter.maxPrice);
    if (vehicleType) params.set("type", vehicleType);
    if (filterFuel && filterFuel !== "any") params.set("fuel", filterFuel);
    if (viewMode && viewMode !== "grid") params.set("view", viewMode);
    if (radius && radius !== 20) params.set("radius", radius);
    if (pinnedLocation) {
      params.set("lat", pinnedLocation.lat.toFixed(4));
      params.set("lng", pinnedLocation.lng.toFixed(4));
    }

    const paramStr = params.toString();
    if (paramStr !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [filter, vehicleType, filterFuel, viewMode, radius, pinnedLocation]);

  // Sync back when browser back/forward buttons are pressed
  useEffect(() => {
    const locParam = searchParams.get("location") || "";
    const brandParam = searchParams.get("brand") || "";
    const minPParam = searchParams.get("minPrice") || "";
    const maxPParam = searchParams.get("maxPrice") || "";
    const typeParam = searchParams.get("type") || searchParams.get("vehicleType") || "";
    const fuelParam = searchParams.get("fuel") || "any";
    const viewParam = searchParams.get("view") || "grid";
    const radiusParam = parseInt(searchParams.get("radius")) || 20;

    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    setFilter((prev) => {
      if (
        prev.location === locParam &&
        prev.brand === brandParam &&
        prev.minPrice === minPParam &&
        prev.maxPrice === maxPParam
      ) {
        return prev;
      }
      return { location: locParam, brand: brandParam, minPrice: minPParam, maxPrice: maxPParam };
    });
    setVehicleType((prev) => (prev === typeParam ? prev : typeParam));
    setFilterFuel((prev) => (prev === fuelParam ? prev : fuelParam));
    setViewMode((prev) => (prev === viewParam ? prev : viewParam));
    setRadius((prev) => (prev === radiusParam ? prev : radiusParam));

    if (latParam && lngParam) {
      const parsedLat = parseFloat(latParam);
      const parsedLng = parseFloat(lngParam);
      setPinnedLocation({
        lat: parsedLat,
        lng: parsedLng,
        address: locParam || `Pinned Location (${parsedLat.toFixed(4)}, ${parsedLng.toFixed(4)})`,
      });
      setMapCenter({ lat: parsedLat, lng: parsedLng });
      setMapZoom(11);
    } else {
      const match = locParam.match(/Pinned Location \(([0-9.-]+),\s*([0-9.-]+)\)/i);
      if (match) {
        const parsedLat = parseFloat(match[1]);
        const parsedLng = parseFloat(match[2]);
        setPinnedLocation({
          lat: parsedLat,
          lng: parsedLng,
          address: locParam,
        });
        setMapCenter({ lat: parsedLat, lng: parsedLng });
        setMapZoom(11);
      } else if (!locParam || locParam !== "My GPS Location") {
        setPinnedLocation(null);
      }
    }
  }, [searchParams]);

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

    // Auto-fetch user location just to show the blue pin on the map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
        },
        (error) => {
          console.warn("Auto-location failed:", error.message);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  const handleReset = () => {
    setFilter({
      location: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
    });
    setFilterShow("nearest");
    setFilterFuel("any");
    setVehicleType("");
    setUserLocation(null);
    setPinnedLocation(null);
    setSelectedVehicle(null);
    setRadius(20);
    setMapCenter(sriLankaCenter);
    setMapZoom(8);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleClearPinnedLocation = () => {
    setPinnedLocation(null);
    setSelectedVehicle(null);
    if (filter.location && (filter.location.startsWith("Pinned Location") || filter.location === "My GPS Location")) {
      setFilter((prev) => ({ ...prev, location: "" }));
    }
    setMapCenter(sriLankaCenter);
    setMapZoom(8);
  };

  const handleMapClick = async (e) => {
    if (!e || !e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setSelectedVehicle(null);

    const initialPoint = {
      lat,
      lng,
      address: `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    };
    setPinnedLocation(initialPoint);
    setRadius(20);
    setMapCenter({ lat, lng });
    setMapZoom(11);
    setFilter((prev) => ({ ...prev, location: initialPoint.address }));

    // Try reverse geocoding via Google Maps API
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const bestAddress = data.results[0].formatted_address;
          setPinnedLocation({ lat, lng, address: bestAddress });
          setFilter((prev) => ({ ...prev, location: bestAddress }));
          return;
        }
      }
    } catch (err) {
      console.warn("Reverse geocode error:", err);
    }
  };

  const handleLocateMe = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userPos);
        setPinnedLocation({
          lat: userPos.lat,
          lng: userPos.lng,
          address: "My GPS Location",
        });
        setRadius(20);
        setMapCenter(userPos);
        setMapZoom(11);
        setFilter({ ...filter, location: "My GPS Location" });
        setViewMode("map");
        setIsLocating(false);
      },
      (error) => {
        let errorMsg = `Unable to retrieve your location. (Error: ${error.message})`;
        if (error.code === error.PERMISSION_DENIED) {
           errorMsg = "Location permission denied. Please click the site settings icon near the URL bar to allow location access.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
           errorMsg = "Location information is unavailable. Please ensure your Windows Location Services are turned on in Settings -> Privacy & Security -> Location.";
        } else if (error.code === error.TIMEOUT) {
           errorMsg = "The request to get user location timed out. Please try again.";
        }
        alert(errorMsg);
        setIsLocating(false);
      },
      { timeout: 15000, maximumAge: 60000 }
    );
  };

  const activeCenter =
    pinnedLocation ||
    (userLocation && filter.location === "My GPS Location" ? userLocation : null);

  const filtered = vehicles
    .map((v) => {
      let distanceFromCenter = null;
      if (activeCenter && v.lat && v.lng) {
        distanceFromCenter = calculateDistance(
          activeCenter.lat,
          activeCenter.lng,
          v.lat,
          v.lng
        );
      }
      return { ...v, distanceFromCenter };
    })
    .filter((v) => {
      let matchLocation = true;
      if (activeCenter) {
        if (v.distanceFromCenter !== null) {
          matchLocation = v.distanceFromCenter <= radius;
        } else {
          matchLocation = false;
        }
      } else {
        const searchLocation = normalizeSearchText(filter.location);
        const vehicleLocation = normalizeSearchText(v.location);
        const companyLocation = normalizeSearchText(v.company?.address);
        const companyName = normalizeSearchText(v.company?.companyName);
        matchLocation =
          !searchLocation ||
          vehicleLocation.includes(searchLocation) ||
          companyLocation.includes(searchLocation) ||
          companyName.includes(searchLocation);
      }

      const matchBrand =
        !filter.brand ||
        v.brand?.toLowerCase().includes(filter.brand.toLowerCase());
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
    })
    .sort((a, b) => {
      if (activeCenter && a.distanceFromCenter !== null && b.distanceFromCenter !== null) {
        return a.distanceFromCenter - b.distanceFromCenter;
      }
      return 0;
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
          fuel - book in a tap.
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
              onClick={handleReset}
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
                title="Clear vehicle type filter"
                aria-label="Clear vehicle type filter"
              >
                <Trash2 size={16} />
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
            <div className="search-step" style={{ position: "relative" }}>
              <div className="step-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <span><span className="step-num active-num">1</span> Location</span>
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  title="Use my GPS Location"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#f97316",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <LocateFixed size={14} /> {isLocating ? "Locating..." : "Locate Me"}
                </button>
              </div>
              <div className="step-input-box">
                <MapPin size={18} className="icon-orange-txt" />
                <input
                  type="text"
                  placeholder="Type a location or click map..."
                  value={filter.location}
                  onChange={(e) => {
                    setFilter({ ...filter, location: e.target.value });
                    if (pinnedLocation) setPinnedLocation(null);
                    if (userLocation) setUserLocation(null);
                  }}
                />
                {pinnedLocation && (
                  <button
                    type="button"
                    onClick={handleClearPinnedLocation}
                    style={{
                      background: "#fee2e2",
                      color: "#dc2626",
                      border: "none",
                      borderRadius: "6px",
                      padding: "2px 8px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    title="Clear pinned location"
                  >
                    Clear
                  </button>
                )}
              </div>
              {activeCenter && (
                <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", background: "#eff6ff", padding: "6px 10px", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
                  <span style={{ fontSize: "0.72rem", color: "#1e40af", fontWeight: 700 }}>🎯 RADIUS:</span>
                  <select 
                    value={radius} 
                    onChange={(e) => setRadius(Number(e.target.value))}
                    style={{ fontSize: "0.8rem", padding: "4px 8px", borderRadius: "6px", border: "1px solid #93c5fd", flex: 1, color: "#1e3a8a", fontWeight: 700, background: "white" }}
                  >
                    <option value={5}>5 km radius</option>
                    <option value={10}>10 km radius</option>
                    <option value={20}>20 km radius</option>
                    <option value={50}>50 km radius</option>
                    <option value={100}>100 km radius</option>
                  </select>
                </div>
              )}
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
        ) : viewMode === "grid" ? (
          filtered.length === 0 ? (
            <div className="empty-state">
              <span>🔍</span>
              <h3>No vehicles found</h3>
              <p>Try changing your filters or expanding your search radius</p>
              {pinnedLocation && (
                <button
                  type="button"
                  className="sidebar-reset-action-btn"
                  style={{ marginTop: "1rem" }}
                  onClick={handleClearPinnedLocation}
                >
                  Clear Location Pin
                </button>
              )}
            </div>
          ) : (
            <div className="vehicle-grid animate-up">
              {filtered.map((v, i) => (
                <VehicleCard key={v._id} vehicle={v} index={i} />
              ))}
            </div>
          )
        ) : (
          <div className="listing-map-section">
            <div className="listing-map-container">
              {/* Interactive Banner over the map */}
              {pinnedLocation ? (
                <div className="map-pinned-banner animate-fade-in">
                  <div className="map-pinned-left">
                    <span className="pinned-pulse-dot" />
                    <div>
                      <span className="pinned-title">🎯 20km Radius Active</span>
                      <p className="pinned-addr" title={pinnedLocation.address}>
                        {pinnedLocation.address}
                      </p>
                    </div>
                  </div>
                  <div className="map-pinned-right">
                    <span className="pinned-count-pill">{filtered.length} vehicle{filtered.length === 1 ? "" : "s"} found</span>
                    <button
                      type="button"
                      className="pinned-clear-btn"
                      onClick={handleClearPinnedLocation}
                      title="Clear custom pin"
                    >
                      ✕ Clear Pin
                    </button>
                  </div>
                </div>
              ) : (
                <div className="map-hint-banner animate-fade-in">
                  <span className="map-hint-icon">📍</span>
                  <span><strong>Interactive Map:</strong> Click anywhere across Sri Lanka to drop a pin and find cars within a 20km radius!</span>
                </div>
              )}

              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={listingMapContainerStyle}
                  center={mapCenter}
                  zoom={mapZoom}
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
                  onClick={handleMapClick}
                >
                  {/* Pinned Location Marker & 20km Circle */}
                  {pinnedLocation && (
                    <>
                      <MarkerF
                        position={{ lat: Number(pinnedLocation.lat), lng: Number(pinnedLocation.lng) }}
                        title="Selected Location (20km Search Center)"
                        zIndex={1000}
                        icon={
                          window.google?.maps ? {
                            url: BLUE_SEARCH_PIN_SVG,
                            scaledSize: new window.google.maps.Size(46, 58),
                            anchor: new window.google.maps.Point(23, 56),
                          } : undefined
                        }
                      />
                      <CircleF
                        center={{ lat: Number(pinnedLocation.lat), lng: Number(pinnedLocation.lng) }}
                        radius={radius * 1000}
                        options={{
                          fillColor: "#3b82f6",
                          fillOpacity: 0.16,
                          strokeColor: "#2563eb",
                          strokeOpacity: 0.85,
                          strokeWeight: 2.5,
                          clickable: false,
                        }}
                      />
                    </>
                  )}

                  {/* GPS User Location (if active and not custom pinned) */}
                  {!pinnedLocation && userLocation && filter.location === "My GPS Location" && (
                    <>
                      <MarkerF
                        position={{ lat: Number(userLocation.lat), lng: Number(userLocation.lng) }}
                        icon={
                          window.google?.maps ? {
                            url: BLUE_SEARCH_PIN_SVG,
                            scaledSize: new window.google.maps.Size(40, 50),
                            anchor: new window.google.maps.Point(20, 48),
                          } : undefined
                        }
                        title="Your GPS Location"
                      />
                      <CircleF
                        center={{ lat: Number(userLocation.lat), lng: Number(userLocation.lng) }}
                        radius={radius * 1000}
                        options={{
                          fillColor: "#3b82f6",
                          fillOpacity: 0.12,
                          strokeColor: "#3b82f6",
                          strokeOpacity: 0.6,
                          strokeWeight: 2,
                          clickable: false,
                        }}
                      />
                    </>
                  )}

                  {/* Vehicle Markers */}
                  {filtered
                    .filter((v) => v.lat && v.lng)
                    .map((v) => (
                      <MarkerF
                        key={v._id}
                        position={{ lat: Number(v.lat), lng: Number(v.lng) }}
                        title={`${v.brand} ${v.model}`}
                        icon={
                          window.google?.maps ? {
                            url: ORANGE_CAR_PIN_SVG,
                            scaledSize: new window.google.maps.Size(38, 48),
                            anchor: new window.google.maps.Point(19, 46),
                          } : undefined
                        }
                        onClick={(e) => {
                          if (e && e.domEvent) e.domEvent.stopPropagation();
                          setSelectedVehicle(v);
                        }}
                      />
                    ))}

                  {/* Selected Vehicle InfoWindow */}
                  {selectedVehicle &&
                    selectedVehicle.lat &&
                    selectedVehicle.lng && (
                      <InfoWindowF
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
                            {selectedVehicle.distanceFromCenter !== null &&
                              selectedVehicle.distanceFromCenter !== undefined && (
                                <div className="map-info-dist-badge">
                                  📍 {selectedVehicle.distanceFromCenter.toFixed(1)} km from pin
                                </div>
                              )}
                            <p className="map-info-location">
                              <MapPin size={12} /> {selectedVehicle.location}
                            </p>
                            <div className="map-info-footer">
                              <span className="map-info-price">
                                LKR{" "}
                                {selectedVehicle.pricePerDay?.toLocaleString()}
                                /day
                                <small style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#ea580c" }}>
                                  +LKR {selectedVehicle.pricePerKmAfter100km || 0}/km after 100km
                                </small>
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
                      </InfoWindowF>
                    )}
                </GoogleMap>
              ) : (
                <div className="listing-map-loading">
                  <div className="spinner" />
                  <span>Loading Map...</span>
                </div>
              )}
            </div>

            {/* Sidebar List */}
            <div className="listing-map-sidebar">
              <div className="map-sidebar-header">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3>
                    {activeCenter
                      ? `${filtered.length} vehicles within ${radius}km`
                      : `${filtered.filter((v) => v.lat && v.lng).length} vehicles on map`}
                  </h3>
                  {pinnedLocation && (
                    <button
                      type="button"
                      onClick={handleClearPinnedLocation}
                      className="sidebar-clear-pin-btn"
                    >
                      Clear Pin
                    </button>
                  )}
                </div>
                <p>
                  {activeCenter
                    ? "Vehicles sorted by proximity to your selected point"
                    : "Click anywhere on the map to find cars within 20km"}
                </p>
              </div>

              <div className="map-sidebar-list">
                {filtered.length === 0 ? (
                  <div className="map-sidebar-empty">
                    <span className="empty-icon">🔍</span>
                    <strong>No vehicles found in this 20km radius</strong>
                    <p>Try clicking another town or district on the map, or clear the pin.</p>
                    {pinnedLocation && (
                      <button
                        type="button"
                        className="sidebar-reset-action-btn"
                        onClick={handleClearPinnedLocation}
                      >
                        View All Available Vehicles
                      </button>
                    )}
                  </div>
                ) : (
                  filtered.map((v) => (
                    <button
                      key={v._id}
                      className={`map-sidebar-item ${selectedVehicle?._id === v._id ? "map-sidebar-active" : ""}`}
                      onClick={() => {
                        setSelectedVehicle(v);
                        if (v.lat && v.lng) {
                          setMapCenter({ lat: v.lat, lng: v.lng });
                          setMapZoom(13);
                        }
                      }}
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
                        <div className="sidebar-info-top">
                          <strong>
                            {v.brand} {v.model}
                          </strong>
                          {v.distanceFromCenter !== null && v.distanceFromCenter !== undefined && (
                            <span className="sidebar-dist-pill">
                              {v.distanceFromCenter.toFixed(1)} km
                            </span>
                          )}
                        </div>
                        <span className="map-sidebar-loc">
                          <MapPin size={11} /> {v.location}
                        </span>
                        <span className="map-sidebar-price">
                          LKR {v.pricePerDay?.toLocaleString()}/day
                          <small style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#ea580c" }}>
                            +LKR {v.pricePerKmAfter100km || 0}/km after 100km
                          </small>
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Map View Styles */
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
        .view-toggle-btn:hover { color: #111827; }
        .view-toggle-btn.active-view {
          background: #f97316;
          color: white;
          box-shadow: 0 4px 12px rgba(249,115,22,0.3);
        }

        .listing-map-section {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 1.5rem;
          height: 670px;
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

        /* Map Banners */
        .map-pinned-banner {
          position: absolute;
          top: 14px;
          left: 14px;
          right: 14px;
          z-index: 10;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(37, 99, 235, 0.25);
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);
          border-radius: 14px;
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .map-pinned-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .pinned-pulse-dot {
          width: 10px;
          height: 10px;
          background: #2563eb;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
          animation: pulse 1.8s infinite;
          flex-shrink: 0;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5); }
          70% { box-shadow: 0 0 0 8px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        .pinned-title {
          font-size: 0.82rem;
          font-weight: 800;
          color: #1e40af;
          display: block;
        }
        .pinned-addr {
          margin: 0;
          font-size: 0.76rem;
          color: #4b5563;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 320px;
        }
        .map-pinned-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .pinned-count-pill {
          background: #dbeafe;
          color: #1e40af;
          font-weight: 700;
          font-size: 0.74rem;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .pinned-clear-btn {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          font-weight: 700;
          font-size: 0.76rem;
          padding: 5px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.2s;
        }
        .pinned-clear-btn:hover {
          background: #fecaca;
        }

        .map-hint-banner {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 10;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          border-radius: 100px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #374151;
          pointer-events: none;
        }
        .map-hint-icon {
          font-size: 1rem;
        }

        /* Info Window */
        .map-info-card {
          width: 240px;
          font-family: var(--font-body);
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
        .map-info-dist-badge {
          display: inline-block;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
          margin-bottom: 6px;
          border: 1px solid #bfdbfe;
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
        .map-info-book:hover { background: #ea580c; }

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
          padding: 1.15rem 1.4rem;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .map-sidebar-header h3 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 800;
          color: #111827;
        }
        .sidebar-clear-pin-btn {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .sidebar-clear-pin-btn:hover {
          background: #fecaca;
        }
        .map-sidebar-header p {
          margin: 4px 0 0;
          font-size: 0.78rem;
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
        .map-sidebar-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2.5rem 1rem;
          color: #6b7280;
        }
        .map-sidebar-empty .empty-icon {
          font-size: 2.2rem;
          margin-bottom: 0.75rem;
        }
        .map-sidebar-empty strong {
          color: #1f2937;
          font-size: 0.92rem;
          margin-bottom: 0.35rem;
        }
        .map-sidebar-empty p {
          font-size: 0.78rem;
          color: #9ca3af;
          margin-bottom: 1rem;
        }
        .sidebar-reset-action-btn {
          background: #f97316;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(249,115,22,0.25);
        }
        .sidebar-reset-action-btn:hover {
          background: #ea580c;
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
          flex: 1;
        }
        .sidebar-info-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
        }
        .sidebar-info-top strong {
          font-size: 0.9rem;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-dist-pill {
          background: #dbeafe;
          color: #1e40af;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          flex-shrink: 0;
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

        .listing-page {
          min-height: calc(100vh - 68px);
          padding-bottom: 80px;
          background: var(--bg, #f9fafb);
        }

        /* Modern Header */
        .modern-header-section {
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
          padding: 120px 1rem 3rem;
          text-align: center;
          border-bottom: 1px solid #fed7aa;
          position: relative;
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
          border: 1.5px solid #fecaca;
          background: #fef2f2;
          color: #ef4444;
          padding: 0.45rem 0.85rem;
          border-radius: 9999px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .clear-type-btn:hover {
          background: #ef4444;
          color: #ffffff;
          border-color: #ef4444;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
        }

        .vehicle-type-card-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        .vehicle-type-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1rem;
          border-radius: 20px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.25s ease;
          text-align: center;
          min-height: 180px;
        }

        .vehicle-type-card:hover {
          transform: translateY(-4px);
          border-color: #f97316;
          box-shadow: 0 12px 24px rgba(249, 115, 22, 0.15);
        }

        .vehicle-type-card.active-type-card {
          border-color: #f97316;
          background: #fff7ed;
          box-shadow: 0 12px 24px rgba(249, 115, 22, 0.18);
        }

        .vehicle-type-card-image {
          width: 100%;
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          background: transparent;
        }

        .vehicle-type-card-image img {
          width: 100%;
          height: 100%;
          max-width: 160px;
          object-fit: contain;
          filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.08));
        }

        .vehicle-type-card span {
          color: #111827;
          font-weight: 700;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .top-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #fff7ed;
          border: 1px solid rgba(249, 115, 22, 0.2);
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #c2410c;
          margin-bottom: 1.5rem;
        }

        .icon-orange-txt { color: #f97316; }
        .icon-blue-txt { color: #38bdf8; }
        .icon-gray-txt { color: #9ca3af; }

        .modern-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 800;
          color: #111827;
          line-height: 1.08;
          letter-spacing: -0.03em;
          margin: 0 0 1rem 0;
        }

        .text-orange {
          color: #f97316;
        }

        .modern-subtitle {
          font-size: 1.1rem;
          color: #6b7280;
          max-width: 600px;
          line-height: 1.6;
          margin: 0;
        }

        /* 3 Step Search Block */
        .search-card-block {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          margin-top: 2rem;
          margin-bottom: 3rem;
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
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .search-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .step-label {
          font-size: 0.88rem;
          font-weight: 700;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .step-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f3f4f6;
          color: #6b7280;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
        }

        .step-num.active-num {
          background: #f97316;
          color: white;
        }

        .step-input-box {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          padding: 0.75rem 1rem;
        }

        .step-input-box input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          font-size: 0.95rem;
          color: #111827;
        }

        .currency-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #9ca3af;
        }

        .big-search-btn {
          background: #f97316;
          color: white;
          border: none;
          border-radius: 1rem;
          padding: 0.85rem 1.75rem;
          font-weight: 700;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .big-search-btn:hover {
          background: #ea580c;
        }

        .filter-bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.25rem;
          border-top: 1px solid #f3f4f6;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.75rem;
          font-weight: 800;
          color: #9ca3af;
          letter-spacing: 0.05em;
          margin-right: 0.25rem;
        }

        .filter-pill {
          border: 1px solid #e5e7eb;
          background: white;
          padding: 0.4rem 0.85rem;
          border-radius: 100px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #4b5563;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .filter-pill.active-mode,
        .filter-pill.active-fuel {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        .match-count-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #374151;
        }

        .results-header-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .results-titles h2 {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0;
          color: #111827;
        }

        .results-titles p {
          margin: 0.25rem 0 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .vehicle-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 1.25rem;
        }

        .loading-state, .empty-state {
          text-align: center;
          padding: 4rem 1rem;
          color: #6b7280;
        }

        @media (max-width: 900px) {
          .search-steps-row {
            flex-direction: column;
            align-items: stretch;
          }
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

        @media (max-width: 768px) {
          .vehicle-type-card-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .hide-mobile {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default VehicleListing;