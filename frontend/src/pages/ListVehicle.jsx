import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { API_URL } from "../config";
import { GoogleMap, useJsApiLoader, MarkerF, CircleF } from "@react-google-maps/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CheckCircle2, ChevronRight, ChevronDown, MapPin, Sparkles, Info, Camera, Calendar, Map as MapIcon, Coins, Building2, ArrowLeft, ArrowRight, LocateFixed, Search, Navigation } from "lucide-react";

// Vehicle Type Images
import bikeeImg from "../assets/images/bikee.jpg";
import threewheelerImg from "../assets/images/threewheeler.jpg";
import miniCarImg from "../assets/images/mini_car.png";
import carImg from "../assets/images/car.jpg";
import premiumCarImg from "../assets/images/premium_car.png";
import miniVanImg from "../assets/images/mini_van.png";
import vanImg from "../assets/images/van.jpg";
import othersCarImg from "../assets/images/others_car.png";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem",
  border: "1px solid #e5e7eb",
};

const vehicleCategories = [
  {
    id: "bicycle", title: "Bicycle", img: bikeeImg,
    desc: "Perfect for short commutes and exploring the city.",
    examples: "Mountain bikes, city bikes, electric bikes."
  },
  {
    id: "threewheeler", title: "Three-wheeler", img: threewheelerImg,
    desc: "The classic Tuk-Tuk. Ideal for quick trips and traffic.",
    examples: "Bajaj RE, Piaggio Ape."
  },
  {
    id: "mini-car", title: "Mini Car", img: miniCarImg,
    desc: "Compact and fuel-efficient. Great for solo travelers.",
    examples: "Suzuki Alto, Maruti 800, Hyundai Eon."
  },
  {
    id: "car", title: "Car", img: carImg,
    desc: "Comfortable and spacious for families or business trips.",
    examples: "Toyota Prius, Honda Civic, Nissan Sunny."
  },
  {
    id: "premium-car", title: "Premium Car", img: premiumCarImg,
    desc: "Luxury and performance for special occasions.",
    examples: "Mercedes Benz E-Class, BMW 5 Series, Audi A6."
  },
  {
    id: "mini-van", title: "Mini Van", img: miniVanImg,
    desc: "Extra space for luggage or small groups.",
    examples: "Toyota Noah, Suzuki Every, Honda Stepwgn."
  },
  {
    id: "van", title: "Van", img: vanImg,
    desc: "Perfect for large groups, tours, or transporting goods.",
    examples: "Toyota Hiace, Nissan Caravan."
  },
  {
    id: "others", title: "Others", img: othersCarImg,
    desc: "Any other unique or specialized vehicles.",
    examples: "Trucks, Motorhomes, ATVs."
  },
];

const sriLankaDistricts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", 
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", 
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", 
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", 
  "Trincomalee", "Vavuniya"
];

const districtCenters = {
  Ampara: { lat: 7.2912, lng: 81.6724 },
  Anuradhapura: { lat: 8.3114, lng: 80.4037 },
  Badulla: { lat: 6.9934, lng: 81.055 },
  Batticaloa: { lat: 7.731, lng: 81.6747 },
  Colombo: { lat: 6.9271, lng: 79.8612 },
  Galle: { lat: 6.0535, lng: 80.221 },
  Gampaha: { lat: 7.0894, lng: 79.9925 },
  Hambantota: { lat: 6.1429, lng: 81.1212 },
  Jaffna: { lat: 9.6615, lng: 80.0255 },
  Kalutara: { lat: 6.5854, lng: 79.9607 },
  Kandy: { lat: 7.2906, lng: 80.6337 },
  Kegalle: { lat: 7.2513, lng: 80.3464 },
  Kilinochchi: { lat: 9.3803, lng: 80.377 },
  Kurunegala: { lat: 7.4863, lng: 80.3623 },
  Mannar: { lat: 8.981, lng: 79.9044 },
  Matale: { lat: 7.4675, lng: 80.6234 },
  Matara: { lat: 5.9549, lng: 80.555 },
  Monaragala: { lat: 6.8728, lng: 81.3507 },
  Mullaitivu: { lat: 9.2671, lng: 80.8142 },
  "Nuwara Eliya": { lat: 6.9497, lng: 80.7891 },
  Polonnaruwa: { lat: 7.9403, lng: 81.0188 },
  Puttalam: { lat: 8.0362, lng: 79.8283 },
  Ratnapura: { lat: 6.6828, lng: 80.4034 },
  Trincomalee: { lat: 8.5874, lng: 81.2152 },
  Vavuniya: { lat: 8.7514, lng: 80.4971 },
};

// Predefined Brands and Models for Dropdowns
const vehicleDatabase = {
  bicycle: {
    "Hero": ["Sprint", "Street", "Racer"],
    "Lumala": ["City", "Mountain", "Kids"],
    "Kent": ["Ranger", "Explorer"],
    "Other": []
  },
  threewheeler: {
    "Bajaj": ["RE 205", "RE 4S", "Maxima", "Compact"],
    "Piaggio": ["Ape City", "Ape Auto DX", "Ape Xtra"],
    "TVS": ["King", "King Deluxe"],
    "Other": []
  },
  "mini-car": {
    "Suzuki": ["Alto", "Wagon R", "Spacia", "Hustler"],
    "Maruti": ["800", "Zen"],
    "Hyundai": ["Eon", "Grand i10", "Santro"],
    "Kia": ["Picanto"],
    "Other": []
  },
  car: {
    "Toyota": ["Prius", "Corolla", "Axio", "Premio", "Allion", "Yaris", "Aqua"],
    "Honda": ["Civic", "Fit", "Grace", "Vezel", "Accord"],
    "Nissan": ["Sunny", "Leaf", "Sylphy"],
    "Mazda": ["Axela", "Demio", "Mazda3", "Mazda6"],
    "Other": []
  },
  "premium-car": {
    "Mercedes Benz": ["C-Class", "E-Class", "S-Class", "CLA"],
    "BMW": ["3 Series", "5 Series", "7 Series", "X3", "X5"],
    "Audi": ["A3", "A4", "A6", "Q3", "Q5", "Q7"],
    "Other": []
  },
  "mini-van": {
    "Toyota": ["Noah", "Voxy", "Sienta", "Roomy"],
    "Suzuki": ["Every", "Carry"],
    "Honda": ["Stepwgn", "Freed"],
    "Nissan": ["Serena"],
    "Other": []
  },
  van: {
    "Toyota": ["Hiace", "TownAce", "LiteAce"],
    "Nissan": ["Caravan", "NV350", "NV200"],
    "Mitsubishi": ["L300", "Delica"],
    "Other": []
  },
};

// Clean, high-contrast SVG icons without filter elements (prevents canvas rendering failures)
const USER_LOC_SVG = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
  <circle cx="18" cy="18" r="16" fill="#3b82f6" fill-opacity="0.35" stroke="#2563eb" stroke-width="2"/>
  <circle cx="18" cy="18" r="8" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
  <circle cx="18" cy="18" r="4.5" fill="#2563eb"/>
</svg>
`);

const PIN_SVG = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="60" viewBox="0 0 48 60">
  <path d="M24 2C12.5 2 3 11.5 3 23c0 16 21 35 21 35s21-19 21-35C45 11.5 35.5 2 24 2z" fill="#ea580c" stroke="#ffffff" stroke-width="3"/>
  <circle cx="24" cy="22" r="8.5" fill="#ffffff"/>
  <circle cx="24" cy="22" r="4.5" fill="#ea580c"/>
</svg>
`);

const detectDistrict = (address) => {
  if (!address) return null;
  const lowerAddr = address.toLowerCase();
  for (const district of sriLankaDistricts) {
    if (lowerAddr.includes(district.toLowerCase())) {
      return district;
    }
  }
  return null;
};


const ListVehicle = () => {
  const [step, setStep] = useState(1);
  const [listerType, setListerType] = useState('personal');
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    pricePerDay: "",
    pricePerKmAfter100km: "",
    fuelType: "",
    transmission: "",
    vehicleType: "",
    district: "",
    location: "",
    description: "",
    images: ["", "", "", "", ""],
    lat: 6.9271,
    lng: 79.8612,
  });

  const [mapCenter, setMapCenter] = useState({ lat: 6.9271, lng: 79.8612 });
  const [mapZoom, setMapZoom] = useState(13);

  // Custom inputs for "Other" selections
  const [customBrand, setCustomBrand] = useState("");
  const [customModel, setCustomModel] = useState("");

  const [dateRange, setDateRange] = useState([new Date(), new Date(new Date().setFullYear(new Date().getFullYear() + 1))]);
  const [startDate, endDate] = dateRange;

  const [isLocating, setIsLocating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash !== '#map' && isMapFullscreen) {
        setIsMapFullscreen(false);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isMapFullscreen]);

  useEffect(() => {
    if (isMapFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMapFullscreen]);

  const expandMap = () => {
    if (!isMapFullscreen) {
      setIsMapFullscreen(true);
      window.location.hash = 'map';
    }
  };

  const closeMap = () => {
    if (isMapFullscreen) {
      window.history.back();
    }
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Auto-detect host location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const userPos = { lat, lng };
          setCurrentLocation(userPos);
          setMapCenter(userPos);
          setMapZoom(14);
          reverseGeocode(lat, lng);
        },
        (err) => {
          console.warn("Auto-geolocation error:", err.message);
        },
        { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
      );
    }
  }, []);

  const nextStep = (e) => {
    e.preventDefault();
    setStep(step + 1);
  };

  const prevStep = (e) => {
    e.preventDefault();
    setStep(step - 1);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    const coords = districtCenters[selectedDistrict];
    if (coords) {
      setMapCenter(coords);
      setMapZoom(13);
      setFormData((prev) => ({
        ...prev,
        district: selectedDistrict,
        lat: coords.lat,
        lng: coords.lng,
        location: prev.location || `${selectedDistrict}, Sri Lanka`,
      }));
      reverseGeocode(coords.lat, coords.lng);
    } else {
      setFormData((prev) => ({ ...prev, district: selectedDistrict }));
    }
  };

  const handleVehicleTypeSelect = (catId) => {
    setFormData({
      ...formData,
      vehicleType: catId,
      brand: "", // Reset brand and model when category changes
      model: ""
    });
    setCustomBrand("");
    setCustomModel("");
  };

  const handlePhotoUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      const res = await axios.post(`${API_URL}/api/upload`, uploadData);
      const newImages = [...formData.images];
      newImages[index] = res.data.url;
      setFormData({ ...formData, images: newImages });
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to upload image.");
    }
  };

  const fetchNominatimReverse = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        const shortAddr = parts.slice(0, 4).join(',').trim();
        const detectedDistrict = detectDistrict(data.display_name);
        setFormData((prev) => ({
          ...prev,
          lat,
          lng,
          location: shortAddr,
          ...(detectedDistrict && { district: detectedDistrict }),
        }));
      }
    } catch (e) {
      console.warn("Nominatim reverse geocode error:", e);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    const fallbackText = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    setFormData((prev) => ({
      ...prev,
      lat,
      lng,
      location: prev.location && !prev.location.startsWith("Location (") ? prev.location : fallbackText,
    }));

    if (window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const address = results[0].formatted_address;
          const detectedDistrict = detectDistrict(address);
          setFormData((prev) => ({
            ...prev,
            lat,
            lng,
            location: address,
            ...(detectedDistrict && { district: detectedDistrict }),
          }));
        } else {
          fetchNominatimReverse(lat, lng);
        }
      });
    } else {
      fetchNominatimReverse(lat, lng);
    }
  };

  const onMarkerDragEnd = (e) => {
    if (!e || !e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setFormData((prev) => ({ ...prev, lat, lng }));
    reverseGeocode(lat, lng);
  };

  const onMapClick = (e) => {
    if (!isMapFullscreen) {
      expandMap();
    }
    if (!e || !e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setFormData((prev) => ({ ...prev, lat, lng }));
    setMapCenter({ lat, lng });
    reverseGeocode(lat, lng);
  };

  const fetchNominatimSearch = async (query) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setMapCenter({ lat, lng });
        setMapZoom(15);
        const parts = data[0].display_name.split(',');
        const shortAddr = parts.slice(0, 4).join(',').trim();
        const detectedDistrict = detectDistrict(data[0].display_name);
        setFormData((prev) => ({
          ...prev,
          lat,
          lng,
          location: shortAddr,
          ...(detectedDistrict && { district: detectedDistrict }),
        }));
      }
    } catch (e) {
      console.warn("Nominatim search error:", e);
    }
  };

  const handleSearchAddress = async (queryToSearch) => {
    const query = queryToSearch || formData.location;
    if (!query || query.trim().length < 2) return;
    setIsSearching(true);
    const fullQuery = query.toLowerCase().includes("sri lanka") ? query : `${query}, Sri Lanka`;

    if (window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: fullQuery }, (results, status) => {
        setIsSearching(false);
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          const lat = loc.lat();
          const lng = loc.lng();
          const address = results[0].formatted_address;
          const detectedDistrict = detectDistrict(address);
          setMapCenter({ lat, lng });
          setMapZoom(15);
          setFormData((prev) => ({
            ...prev,
            lat,
            lng,
            location: address,
            ...(detectedDistrict && { district: detectedDistrict }),
          }));
        } else {
          fetchNominatimSearch(fullQuery);
        }
      });
    } else {
      await fetchNominatimSearch(fullQuery);
      setIsSearching(false);
    }
  };

  const handleLocateMe = () => {
    // If we already detected the user's location, reuse it immediately
    if (currentLocation) {
      setMapCenter(currentLocation);
      setMapZoom(15);
      setFormData((prev) => ({ ...prev, lat: currentLocation.lat, lng: currentLocation.lng }));
      reverseGeocode(currentLocation.lat, currentLocation.lng);
      return;
    }

    setIsLocating(true);
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const userPos = { lat, lng };
        setCurrentLocation(userPos);
        setMapCenter(userPos);
        setMapZoom(15);
        setFormData((prev) => ({ ...prev, lat, lng }));
        reverseGeocode(lat, lng);
        setIsLocating(false);
      },
      (error) => {
        console.warn("Geolocation notice:", error.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please login first.");

      if (!startDate || !endDate) return alert("Please select availability dates.");

      // Use custom brand/model if "Other" is selected
      const finalBrand = formData.brand === "Other" ? customBrand : formData.brand;
      const finalModel = formData.model === "Other" ? customModel : formData.model;

      if (!finalBrand || !finalModel) return alert("Please specify the brand and model.");

      const payload = {
        ...formData,
        brand: finalBrand,
        model: finalModel,
        availableFrom: startDate.toISOString(),
        availableTo: endDate.toISOString(),
      };

      await axios.post(`${API_URL}/api/vehicles`, payload, {
        headers: { "Content-Type": "application/json", "x-auth-token": token },
      });
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      alert("Vehicle listed successfully!");
      if (currentUser?.role === "company") {
        window.location.href = "/company-dashboard";
      } else {
        window.location.href = "/profile";
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.msg || err.message));
    }
  };

  const selectedCategory = vehicleCategories.find(c => c.id === formData.vehicleType);
  const availableBrands = formData.vehicleType && vehicleDatabase[formData.vehicleType]
    ? Object.keys(vehicleDatabase[formData.vehicleType])
    : [];
  const availableModels = formData.brand && formData.vehicleType && vehicleDatabase[formData.vehicleType]?.[formData.brand]
    ? vehicleDatabase[formData.vehicleType][formData.brand]
    : [];

  return (
    <>
      <div className="lv-page" style={{ display: isMapFullscreen ? "none" : "block" }}>
        <div className="lv-hero">
        <div className="lv-badge">
          <Sparkles size={14} className="text-orange" />
          <span>Next-Level Hosting</span>
        </div>
        <h1>
          List your vehicle & <span className="text-orange">earn more.</span>
        </h1>
        <p>Follow the simple steps below to join the premier marketplace.</p>
      </div>

      <div className="lv-container">

        {/* Left Column: Form */}
        <div className="lv-left-col">
          <div className="stepper">
            {["Details", "Pricing & Dates", "Photos", "Location"].map((label, idx) => (
              <div key={idx} className={`step ${step === idx + 1 ? "active" : step > idx + 1 ? "completed" : ""}`}>
                <div className="step-circle">{step > idx + 1 ? <CheckCircle2 size={16} /> : idx + 1}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="form-card">
            {/* STEP 1: Details */}
            {step === 1 && (
              <form onSubmit={nextStep} className="form-step slide-in">
                <h2>Vehicle Information</h2>
                <p className="step-desc">Select the type of vehicle and provide basic details.</p>

                <div className="form-group mb-4">
                  <label>Vehicle Type *</label>
                  <div className="vehicle-type-grid">
                    {vehicleCategories.map(cat => (
                      <div
                        key={cat.id}
                        className={`type-card ${formData.vehicleType === cat.id ? "selected" : ""}`}
                        onClick={() => handleVehicleTypeSelect(cat.id)}
                      >
                        <img src={cat.img} alt={cat.title} />
                        <span>{cat.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Brand *</label>
                    {availableBrands.length > 0 ? (
                      <select name="brand" value={formData.brand} onChange={handleChange} required>
                        <option value="">Select Brand...</option>
                        {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    ) : (
                      <input type="text" name="brand" value={formData.brand} onChange={handleChange} required placeholder="e.g. Toyota" disabled={!formData.vehicleType} />
                    )}
                    {formData.brand === "Other" && (
                      <input type="text" className="mt-2" value={customBrand} onChange={(e) => setCustomBrand(e.target.value)} required placeholder="Type your brand..." />
                    )}
                  </div>

                  <div className="form-group">
                    <label>Model *</label>
                    {availableBrands.length > 0 && formData.brand && formData.brand !== "Other" && availableModels.length > 0 ? (
                      <select name="model" value={formData.model} onChange={handleChange} required>
                        <option value="">Select Model...</option>
                        {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <input type="text" name="model" value={formData.model} onChange={handleChange} required placeholder="e.g. Prius" disabled={!formData.brand} />
                    )}
                    {formData.model === "Other" && (
                      <input type="text" className="mt-2" value={customModel} onChange={(e) => setCustomModel(e.target.value)} required placeholder="Type your model..." />
                    )}
                  </div>

                  <div className="form-group">
                    <label>Year *</label>
                    <input type="number" name="year" value={formData.year} onChange={handleChange} required placeholder="2020" min="1950" max="2026" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fuel Type</label>
                    <select name="fuelType" value={formData.fuelType} onChange={handleChange}>
                      <option value="">Select...</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                      <option value="None">None (Bicycle)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Transmission</label>
                    <select name="transmission" value={formData.transmission} onChange={handleChange}>
                      <option value="">Select...</option>
                      <option value="Auto">Auto</option>
                      <option value="Manual">Manual</option>
                      <option value="None">None (Bicycle)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Tell renters about your vehicle's features..."></textarea>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-next" disabled={!formData.vehicleType || !formData.brand || !formData.model}>
                    Continue <ChevronRight size={18} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Pricing & Dates */}
            {step === 2 && (
              <form onSubmit={nextStep} className="form-step slide-in">
                <h2>Pricing & Availability</h2>
                <p className="step-desc">Set your rates and when the vehicle is available.</p>

                <div className="form-row mb-4">
                  <div className="form-group flex-1">
                    <label>Price Per Day (LKR) *</label>
                    <div className="input-with-prefix">
                      <span className="prefix">LKR</span>
                      <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} required placeholder="8000" />
                    </div>
                  </div>
                  <div className="form-group flex-1">
                    <label>Price Per Km After 100km (LKR) *</label>
                    <div className="input-with-prefix">
                      <span className="prefix">LKR</span>
                      <input type="number" name="pricePerKmAfter100km" value={formData.pricePerKmAfter100km} onChange={handleChange} required placeholder="50" />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Availability Calendar *</label>
                  <div className="calendar-wrap">
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => setDateRange(update)}
                      monthsShown={2}
                      minDate={new Date()}
                      inline
                      className="premium-calendar"
                    />
                  </div>
                </div>

                <div className="form-actions space-between">
                  <button type="button" className="btn-back" onClick={prevStep}>Back</button>
                  <button type="submit" className="btn-next">Continue <ChevronRight size={18} /></button>
                </div>
              </form>
            )}

            {/* STEP 3: Photos */}
            {step === 3 && (
              <form onSubmit={nextStep} className="form-step slide-in">
                <h2>Vehicle Photos</h2>
                <p className="step-desc">Upload 1 to 5 high-quality photos of your vehicle (at least 1 is required).</p>

                <div className="photo-grid">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="photo-upload-box">
                      {formData.images[i] ? (
                        <img src={formData.images[i]} alt={`Upload ${i}`} className="uploaded-img" />
                      ) : (
                        <div className="upload-placeholder">
                          <div className="upload-icon">+</div>
                          <span>Photo {i + 1}</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, i)} />
                    </div>
                  ))}
                </div>

                <div className="form-actions space-between">
                  <button type="button" className="btn-back" onClick={prevStep}>Back</button>
                  <button type="submit" className="btn-next" disabled={!formData.images.some(img => typeof img === "string" && img.trim() !== "")}>
                    Continue <ChevronRight size={18} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: Location */}
            {step === 4 && (
              <form onSubmit={handleSubmit} className="form-step slide-in">
                <h2>Pickup Location</h2>
                <p className="step-desc">Pinpoint where the vehicle is located.</p>

                <div className="form-group">
                  <label>PICK-UP CITY / DISTRICT</label>
                  <div className="district-select-wrapper">
                    <select 
                      name="district" 
                      value={formData.district} 
                      onChange={handleDistrictChange} 
                      required 
                      className="district-select"
                    >
                      <option value="" disabled>Select City / District</option>
                      {sriLankaDistricts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <div className="district-select-icon">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ margin: 0 }}>Search Address or Click on Map</label>
                    <button
                      type="button"
                      onClick={handleLocateMe}
                      disabled={isLocating}
                      title="Use my GPS Location"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f97316",
                        fontSize: "0.78rem",
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
                  <div style={{ display: "flex", gap: "8px" }}>
                    <div className="input-with-prefix" style={{ flex: 1, margin: 0 }}>
                      <span className="prefix"><MapPin size={18} /></span>
                      <input 
                        type="text" 
                        name="location" 
                        value={formData.location} 
                        onChange={handleChange} 
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearchAddress(formData.location);
                          }
                        }}
                        required 
                        placeholder="Type address/city & press Enter or Search..." 
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSearchAddress(formData.location)}
                      disabled={isSearching}
                      style={{
                        padding: "0 16px",
                        backgroundColor: "#f97316",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "0.6rem",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        flexShrink: 0
                      }}
                    >
                      <Search size={15} /> {isSearching ? "..." : "Search"}
                    </button>
                  </div>
                </div>

                <div className="map-wrapper" style={{ position: "relative", height: "350px", overflow: "hidden", borderRadius: "10px" }}>
                  {formData.location && (
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      right: "10px",
                      zIndex: 10,
                      background: "rgba(255, 255, 255, 0.96)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(249, 115, 22, 0.3)",
                      borderRadius: "10px",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                      fontSize: "0.78rem",
                      color: "#1f2937",
                      fontWeight: 600
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                        <MapPin size={16} style={{ color: "#ea580c", flexShrink: 0 }} />
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          <strong>Pickup Spot:</strong> {formData.location}
                        </span>
                      </div>
                      {currentLocation && (
                        <button
                          type="button"
                          onClick={() => {
                            setMapCenter(currentLocation);
                            setMapZoom(15);
                            setFormData((prev) => ({ ...prev, lat: currentLocation.lat, lng: currentLocation.lng }));
                            reverseGeocode(currentLocation.lat, currentLocation.lng);
                          }}
                          style={{
                            background: "rgba(249, 115, 22, 0.12)",
                            color: "#ea580c",
                            border: "1px solid rgba(249, 115, 22, 0.4)",
                            borderRadius: "6px",
                            padding: "4px 10px",
                            fontSize: "0.72rem",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                          title="Move vehicle pickup pin to your current GPS position"
                        >
                          <LocateFixed size={12} /> Snap to My Location
                        </button>
                      )}
                    </div>
                  )}

                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={mapCenter}
                      zoom={mapZoom}
                      onClick={onMapClick}
                      options={{
                        clickableIcons: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: true,
                        zoomControl: true,
                      }}
                    >
                      {/* User's Current GPS Location Marker & Halo (Blue) */}
                      {currentLocation && (
                        <>
                          <MarkerF 
                            position={currentLocation}
                            title="Your Current GPS Location"
                            zIndex={50}
                            icon={
                              window.google?.maps ? {
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: 9,
                                fillColor: "#2563eb",
                                fillOpacity: 1,
                                strokeColor: "#ffffff",
                                strokeWeight: 3,
                              } : undefined
                            }
                          />
                          <CircleF
                            center={currentLocation}
                            radius={200}
                            options={{
                              fillColor: "#3b82f6",
                              fillOpacity: 0.18,
                              strokeColor: "#2563eb",
                              strokeOpacity: 0.7,
                              strokeWeight: 1.5,
                              clickable: false,
                            }}
                          />
                        </>
                      )}

                      {/* Pickup Location Marker (Orange Pin, Fully Draggable) */}
                      <MarkerF 
                        position={{
                          lat: Number(formData.lat) || 6.9271,
                          lng: Number(formData.lng) || 79.8612
                        }} 
                        draggable={true}
                        onDragEnd={onMarkerDragEnd}
                        title="Vehicle Pickup Location (Drag to adjust)"
                        zIndex={100}
                        icon={
                          window.google?.maps ? {
                            path: "M 12,2 C 8.13,2 5,5.13 5,9 C 5,14.25 12,22 12,22 C 12,22 19,14.25 19,9 C 19,5.13 15.87,2 12,2 Z",
                            fillColor: "#ea580c",
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                            scale: 2.2,
                            anchor: new window.google.maps.Point(12, 22),
                          } : undefined
                        }
                      />
                    </GoogleMap>
                  ) : (
                    <div className="loading-map">Loading map...</div>
                  )}
                </div>

                <div className="form-actions space-between mt-4">
                  <button type="button" className="btn-back" onClick={prevStep}>Back</button>
                  <button type="submit" className="btn-submit">List Vehicle</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Info Panel */}
        <div className="lv-right-col">
          <div className="info-panel slide-in-right">

            {step === 1 && (
              <>
                {selectedCategory ? (
                  <div className="category-info">
                    <div className="info-img-wrapper">
                      <img src={selectedCategory.img} alt={selectedCategory.title} />
                      <div className="img-glow"></div>
                    </div>
                    <h3>{selectedCategory.title}</h3>
                    <p className="cat-desc">{selectedCategory.desc}</p>
                    <div className="cat-examples">
                      <Info size={16} className="text-orange flex-shrink-0" />
                      <span><strong>Examples:</strong> {selectedCategory.examples}</span>
                    </div>
                  </div>
                ) : (
                  <div className="category-info empty">
                    <div className="empty-icon"><Info size={48} /></div>
                    <h3>Select a Category</h3>
                    <p>Choose a vehicle type from the left to view specific tips and recommendations.</p>
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <div className="category-info">
                <div className="empty-icon orange"><Coins size={48} /></div>
                <h3>Pricing & Availability</h3>
                <p className="cat-desc">Set competitive rates to attract more renters in your district.</p>
                <div className="cat-examples">
                  <Info size={16} className="text-orange flex-shrink-0" />
                  <span>Extra KM charges apply automatically if a renter exceeds standard daily limits.</span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="category-info">
                <div className="empty-icon orange"><Camera size={48} /></div>
                <h3>Photo Guidelines</h3>
                <p className="cat-desc">Listings with bright, clear photos get 3x more bookings.</p>
                <div className="cat-examples">
                  <Info size={16} className="text-orange flex-shrink-0" />
                  <span>Include: Front diagonal, Side profile, Rear diagonal, Dashboard, and Interior seats.</span>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="category-info">
                <div className="empty-icon orange"><MapIcon size={48} /></div>
                <h3>Precise Pickup Spot</h3>
                <p className="cat-desc">Accurate pickup locations make handover fast and seamless for both parties.</p>
                <div className="cat-examples" style={{ flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#3b82f6", display: "inline-block", flexShrink: 0 }}></span>
                    <span><strong>Blue Dot:</strong> Your current GPS location</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ea580c", display: "inline-block", flexShrink: 0 }}></span>
                    <span><strong>Orange Pin:</strong> Vehicle location (Drag to reposition)</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                    <Info size={16} className="text-orange flex-shrink-0" />
                    <span>Click anywhere on the map to relocate the pin immediately.</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      <style>{`
        /* Centered Lister Type Modal */
        .lt-wrapper {
          min-height: calc(100vh - 80px); /* Adjust for navbar */
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #fafafa;
          padding: 2rem;
          font-family: var(--font-body), sans-serif;
        }
        
        .lt-card-container {
          background: #ffffff;
          border-radius: 1.5rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          padding: 3rem;
          max-width: 650px;
          width: 100%;
          text-align: center;
          position: relative;
        }

        .lt-badge-step {
          display: inline-block;
          color: #ea580c;
          background: #fff7ed;
          padding: 0.35rem 1rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .lt-card-container h1 {
          font-size: 2rem;
          font-weight: 800;
          margin: 0 0 0.5rem;
          color: #0f172a;
        }

        .lt-subtitle {
          color: #64748b;
          font-size: 1rem;
          margin: 0 0 2.5rem;
        }

        .lt-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .lt-card {
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 1.25rem;
          padding: 1.5rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lt-card:hover {
          border-color: #cbd5e1;
        }

        .lt-card.active {
          border-color: #10b981;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
        }

        .lt-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .lt-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lt-icon-wrap.green {
          background: #ecfdf5;
          color: #10b981;
        }

        .lt-icon-wrap.blue {
          background: #eff6ff;
          color: #3b82f6;
        }

        .lt-status.active {
          background: #10b981;
          color: white;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.6rem;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .lt-status.inactive {
          width: 20px;
          height: 20px;
          border: 2px solid #cbd5e1;
          border-radius: 50%;
        }

        .lt-card h3 {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0 0 0.25rem;
          color: #0f172a;
        }

        .lt-card h4 {
          font-size: 0.7rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 0.75rem;
        }

        .lt-card p {
          color: #64748b;
          font-size: 0.85rem;
          line-height: 1.4;
          margin: 0;
        }

        .lt-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid #f1f5f9;
        }

        .lt-btn-back {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lt-btn-back:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .lt-btn-next {
          background: #ea580c;
          color: white;
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lt-btn-next:hover {
          background: #c2410c;
        }

        .lt-footer-link {
          margin-top: 2rem;
          font-size: 0.9rem;
          color: #64748b;
        }

        .lt-footer-link a {
          color: #ea580c;
          font-weight: 700;
          text-decoration: none;
        }

        .lv-page {
          background: #f1f5f9;
          min-height: 100vh;
          font-family: var(--font-body);
          color: #0f172a;
          padding-bottom: 4rem;
        }
        
        .lv-hero {
          background: #ffffff;
          padding: 120px 2rem 4rem;
          text-align: center;
          border-bottom: 1px solid #e2e8f0;
        }
        .lv-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #fff7ed;
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.85rem;
          color: #ea580c;
          margin-bottom: 1rem;
        }
        .lv-hero h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 1rem;
          letter-spacing: -0.02em;
        }
        .lv-hero p {
          color: #64748b;
          font-size: 1.1rem;
          margin: 0;
        }
        
        .text-orange { color: #f97316; }
        .flex-shrink-0 { flex-shrink: 0; }
        .mt-2 { margin-top: 0.5rem; }

        /* District Dropdown Styles */
        .district-select-wrapper {
          position: relative;
          width: 100%;
        }

        .district-select {
          width: 100%;
          padding: 0.85rem 1.2rem;
          border: 1px solid #e2e8f0;
          border-radius: 100px;
          font-family: inherit;
          font-size: 1rem;
          color: #0f172a;
          background: #f4fbfa;
          appearance: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .district-select:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .district-select-icon {
          position: absolute;
          right: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #0f172a;
        }

        .lv-container {
          max-width: 1200px;
          margin: -2rem auto 0;
          padding: 0 1.5rem;
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 2rem;
        }

        .lv-left-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .lv-right-col {
          position: relative;
          height: 100%;
        }

        .stepper {
          display: flex;
          justify-content: space-between;
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
        }
        .step {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .step-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .step.active { color: #f97316; }
        .step.active .step-circle { background: #f97316; color: white; }
        .step.completed { color: #10b981; }
        .step.completed .step-circle { background: #10b981; color: white; }

        .form-card {
          background: #ffffff;
          padding: 2.5rem;
          border-radius: 1.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          border: 1px solid #e2e8f0;
        }

        .form-step h2 {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0 0 0.5rem;
        }
        .step-desc {
          color: #64748b;
          margin: 0 0 2rem;
        }

        .form-row {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .form-group.mb-4 { margin-bottom: 2rem; }
        .flex-1 { flex: 1; }

        label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Improved Input Contrast */
        input, select, textarea {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 0.75rem;
          font-family: inherit;
          font-size: 1rem;
          color: #0f172a;
          background: #ffffff;
          transition: all 0.2s;
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #f97316;
          background: #fffaf5;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.1);
        }
        input:disabled, select:disabled {
          background: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
          border-color: #e2e8f0;
        }

        .input-with-prefix {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-with-prefix .prefix {
          position: absolute;
          left: 1rem;
          color: #64748b;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .input-with-prefix input {
          padding-left: 3.5rem;
        }

        /* Vehicle Type Grid */
        .vehicle-type-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .type-card {
          border: 2px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          background: #ffffff;
        }
        .type-card:hover {
          border-color: #fdba74;
          background: #fff7ed;
        }
        .type-card.selected {
          border-color: #f97316;
          background: #fff7ed;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15);
        }
        .type-card img {
          width: 60px;
          height: 40px;
          object-fit: contain;
        }
        .type-card span {
          font-size: 0.85rem;
          font-weight: 700;
          color: #334155;
          text-align: center;
        }

        /* Photo Grid */
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .photo-upload-box {
          position: relative;
          height: 140px;
          border: 2px dashed #cbd5e1;
          border-radius: 1rem;
          background: #f8fafc;
          overflow: hidden;
          transition: all 0.2s;
        }
        .photo-upload-box:hover {
          border-color: #f97316;
          background: #fff7ed;
        }
        .photo-upload-box input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          z-index: 10;
        }
        .upload-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
          gap: 0.5rem;
        }
        .upload-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: #475569;
        }
        .uploaded-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Map */
        .map-wrapper {
          height: 350px;
          border-radius: 1rem;
          overflow: hidden;
          margin-top: 1rem;
          background: #f1f5f9;
        }
        .loading-map {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        /* Calendar */
        .calendar-wrap {
          display: flex;
          justify-content: center;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
        }

        /* Info Panel (Right Col) */
        .info-panel {
          background: linear-gradient(145deg, #ffffff, #fff7ed);
          border-radius: 1.5rem;
          padding: 2.5rem;
          box-shadow: 0 10px 25px -5px rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.2);
          position: sticky;
          top: 6rem;
        }
        .category-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .category-info.empty {
          opacity: 0.6;
        }
        .info-img-wrapper {
          position: relative;
          width: 100%;
          height: 180px;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .info-img-wrapper img {
          max-width: 90%;
          max-height: 100%;
          object-fit: contain;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));
        }
        .img-glow {
          position: absolute;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0) 70%);
          z-index: 1;
        }
        .empty-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .empty-icon.orange {
          background: #fff7ed;
          color: #f97316;
        }
        .category-info h3 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 1rem;
        }
        .cat-desc {
          color: #475569;
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0 0 1.5rem;
        }
        .cat-examples {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          background: #ffffff;
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid #fed7aa;
          text-align: left;
          font-size: 0.95rem;
          color: #334155;
          box-shadow: 0 2px 4px rgba(249, 115, 22, 0.05);
        }

        /* Actions */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }
        .form-actions.space-between {
          justify-content: space-between;
        }
        .btn-next, .btn-submit {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          border: none;
          padding: 0.85rem 2rem;
          border-radius: 100px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }
        .btn-next:hover:not(:disabled), .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
        }
        .btn-next:disabled {
          background: #cbd5e1;
          box-shadow: none;
          cursor: not-allowed;
        }
        .btn-back {
          background: transparent;
          color: #64748b;
          border: none;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          padding: 0.85rem 1rem;
        }
        .btn-back:hover { color: #0f172a; }

        /* Animations */
        .slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
        .slide-in-right {
          animation: slideInRight 0.4s ease-out forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @media (max-width: 1024px) {
          .lv-container {
            grid-template-columns: 1fr;
          }
          .lv-right-col {
            display: none;
          }
          .lt-cards {
            grid-template-columns: 1fr;
          }
          .lt-card-container {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
        </div>

      {isMapFullscreen && createPortal(
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 2147483647,
          backgroundColor: "#ffffff",
          overflow: "hidden"
        }}>
          {/* Google Maps Style Floating Search Bar */}
          <div style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px)",
            maxWidth: "520px",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            backgroundColor: "#ffffff",
            borderRadius: "32px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            padding: "6px 12px",
            border: "1px solid rgba(0,0,0,0.08)"
          }}>
            <button 
              type="button" 
              onClick={closeMap}
              title="Back to Form"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#374151",
                borderRadius: "50%"
              }}
            >
              <ArrowLeft size={22} />
            </button>
            
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchAddress(formData.location);
                }
              }}
              placeholder="Search location..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "1rem",
                padding: "8px 12px",
                color: "#111827",
                backgroundColor: "transparent"
              }}
            />

            <button
              type="button"
              onClick={() => handleSearchAddress(formData.location)}
              disabled={isSearching}
              title="Search"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ea580c"
              }}
            >
              <Search size={22} />
            </button>

            {currentLocation && (
              <>
                <div style={{ width: "1px", height: "24px", backgroundColor: "#e5e7eb", margin: "0 4px" }}></div>
                <button
                  type="button"
                  onClick={() => { setMapCenter(currentLocation); setMapZoom(15); setFormData(prev => ({...prev, lat: currentLocation.lat, lng: currentLocation.lng})); reverseGeocode(currentLocation.lat, currentLocation.lng); }}
                  title="Snap to my location"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563eb"
                  }}
                >
                  <LocateFixed size={20} />
                </button>
              </>
            )}
          </div>

          {/* Full-screen Map */}
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: "100vw", height: "100vh" }}
              center={mapCenter}
              zoom={mapZoom}
              onClick={onMapClick}
              options={{
                clickableIcons: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                zoomControl: true,
              }}
            >
              {currentLocation && (
                <>
                  <MarkerF
                    position={currentLocation}
                    zIndex={50}
                    icon={window.google?.maps ? { path: window.google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: "#2563eb", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 3 } : undefined}
                  />
                  <CircleF
                    center={currentLocation}
                    radius={200}
                    options={{ fillColor: "#3b82f6", fillOpacity: 0.18, strokeColor: "#2563eb", strokeOpacity: 0.7, strokeWeight: 1.5, clickable: false }}
                  />
                </>
              )}
              <MarkerF
                position={{ lat: Number(formData.lat) || 6.9271, lng: Number(formData.lng) || 79.8612 }}
                draggable={true}
                onDragEnd={onMarkerDragEnd}
                zIndex={100}
                icon={window.google?.maps ? { path: "M 12,2 C 8.13,2 5,5.13 5,9 C 5,14.25 12,22 12,22 C 12,22 19,14.25 19,9 C 19,5.13 15.87,2 12,2 Z", fillColor: "#ea580c", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2, scale: 2.2, anchor: new window.google.maps.Point(12, 22) } : undefined}
              />
            </GoogleMap>
          ) : (
            <div style={{ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading map...</div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default ListVehicle;
