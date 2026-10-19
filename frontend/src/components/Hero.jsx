import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ChevronDown, MapPin, Car, PlusCircle, Check } from "lucide-react";
import fleetCutoutImg from "../assets/images/yamu_fleet_cutout.png";
import { useSiteConfig } from "../context/SiteConfigContext";
import { FestivalHeroDecorations } from "./festivals/FestivalAccessoriesManager";

const VEHICLE_TYPES = [
  { id: "", label: "Any vehicle" },
  { id: "car", label: "Car" },
  { id: "premium-car", label: "Premium Car" },
  { id: "mini-car", label: "Mini Car" },
  { id: "van", label: "Van" },
  { id: "mini-van", label: "Mini Van" },
  { id: "threewheeler", label: "Three-wheeler" },
  { id: "bicycle", label: "Bicycle" },
  { id: "others", label: "Others" },
];

const POPULAR_LOCATIONS = [
  "Colombo",
  "Kandy",
  "Galle",
  "Negombo",
  "Gampaha",
  "Matara",
  "Jaffna",
  "Nuwara Eliya",
  "Ella",
  "Bentota",
  "Kurunegala",
  "Anuradhapura",
];

const Hero = () => {
  const navigate = useNavigate();
  const { config } = useSiteConfig();
  const hero = config?.hero;

  const PRICE_MIN = 0;
  const PRICE_MAX = 100000;
  const PRICE_STEP = 1000;

  const [activeTab, setActiveTab] = useState("rent"); // "rent" | "buy"
  const [vehicleType, setVehicleType] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState(5000);
  const [maxPrice, setMaxPrice] = useState(80000);
  const [rentMode, setRentMode] = useState(""); // "" = any, "self-drive", "with-driver"
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const vehicleDropdownRef = useRef(null);
  const dropdownMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(event.target)) {
        setVehicleDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setVehicleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMinChange = (e) => {
    const val = Number(e.target.value);
    if (val > maxPrice - PRICE_STEP) {
      setMinPrice(maxPrice - PRICE_STEP);
    } else {
      setMinPrice(val);
    }
  };

  const handleMaxChange = (e) => {
    const val = Number(e.target.value);
    if (val < minPrice + PRICE_STEP) {
      setMaxPrice(minPrice + PRICE_STEP);
    } else {
      setMaxPrice(val);
    }
  };

  const minPercent = Math.min(100, Math.max(0, (minPrice / PRICE_MAX) * 100));
  const maxPercent = Math.min(100, Math.max(0, (maxPrice / PRICE_MAX) * 100));

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (vehicleType) params.set("type", vehicleType);
    if (location && location.trim()) params.set("location", location.trim());
    if (minPrice > 0) params.set("minPrice", minPrice);
    if (maxPrice < PRICE_MAX) params.set("maxPrice", maxPrice);
    if (rentMode) params.set("mode", rentMode);
    navigate(`/vehicles${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const el = dropdownMenuRef.current;
    if (!el || !vehicleDropdownOpen) return;

    const onWheel = (e) => {
      // If the dropdown fits completely without internal scrolling, let the browser scroll natively at 100% speed!
      const isScrollable = el.scrollHeight > el.clientHeight + 4;
      if (!isScrollable) {
        return;
      }

      const isAtTop = el.scrollTop <= 0;
      const isAtBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;

      if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
        e.preventDefault();
        let delta = e.deltaY;
        if (e.deltaMode === 1) {
          // DOM_DELTA_LINE: Standard Windows mouse wheel notch is 3 lines (~38px per line)
          delta *= 38;
        } else if (e.deltaMode === 2) {
          // DOM_DELTA_PAGE
          delta *= window.innerHeight;
        }
        window.scrollBy({ top: delta, behavior: "auto" });
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [vehicleDropdownOpen]);

  return (
    <section className="yamu-exact-hero">
      <FestivalHeroDecorations />
      {/* Radiant Orange Gradient Background with Atmospheric Light Source */}
      <div className="hero-gradient-overlay" />
      <div className="hero-light-glow" />



      <div className="hero-center-stage">
        {/* Unified Heroic Stage: Tall YAMU backdrop with foreground Fleet */}
        <div className="heroic-fleet-stage">
          {/* Massive Tall Watermark Text: YAMU as primary semantic h1 */}
          <motion.h1
            className="watermark-yamu-text"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {hero?.watermarkText || "YAMU"}
            <span className="sr-only"> Car Rentals - Premium Vehicle Rentals in Sri Lanka</span>
          </motion.h1>

          {/* Large Foreground Fleet Cutout overlapping the lower half */}
          <motion.div
            className="fleet-image-wrap"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src={hero?.fleetCutoutUrl || fleetCutoutImg}
              alt="Yamu Sri Lanka Vehicle Fleet"
              className="fleet-cutout-img"
            />
          </motion.div>
        </div>

        {/* Subtitles below the fleet */}
        <motion.div
          className="hero-taglines"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
        >
          {/* Prominent Action Buttons above the sentence */}
          <div className="hero-buttons-container">
            <button
              type="button"
              className={`hero-action-btn rent-btn ${activeTab === "rent" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("rent");
                navigate("/vehicles");
              }}
            >
              <Car size={18} strokeWidth={2.4} className="hero-btn-icon" />
              <span>I Want to Rent a Car</span>
            </button>
            <button
              type="button"
              className={`hero-action-btn list-btn ${activeTab === "buy" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("buy");
                const token = localStorage.getItem("token");
                const user = JSON.parse(localStorage.getItem("user") || "null");
                if (token && user?.role === "company") {
                  navigate("/fleet/quick-add");
                } else if (token && (user?.role === "owner" || user?.role === "admin" || user?.role === "renter")) {
                  navigate("/list-my-car");
                } else {
                  navigate("/choose-listing-type");
                }
              }}
            >
              <PlusCircle size={18} strokeWidth={2.4} className="hero-btn-icon" />
              <span>I Want to List a Car</span>
            </button>
          </div>

          <p className="hero-sub-top">
            <span className="tag-sparkle">✦</span> {hero?.taglineTop || "Make The Right Choice"} <span className="tag-sparkle">✦</span>
          </p>
          <h2 className="hero-sub-bottom">
            {hero?.taglineBottom || "Find Your Dream Car, Which will Give You Wings"}
          </h2>

          {/* Mobile Scroll Indicator to Search Filter */}
          <button
            type="button"
            className="hero-scroll-hint-pill"
            onClick={() => {
              const el = document.getElementById("hero-search-filter-card");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            aria-label="Scroll down to vehicle search filter"
          >
            <span>Search & Filter</span>
            <ChevronDown size={14} className="hero-scroll-chevron" />
          </button>
        </motion.div>
      </div>

      {/* Standalone Search Card Bar */}
      <motion.div
        id="hero-search-filter-card"
        className="hero-search-card-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Pure White Search Card Bar */}
        <div className="hero-search-bar" onKeyDown={handleKeyDown}>
          {/* Self-drive / with driver — the first thing most Sri Lankan renters decide */}
          <div className="search-mode" role="radiogroup" aria-label="Rental type">
            {[
              { id: "self-drive", label: "Self-drive" },
              { id: "", label: "Any" },
              { id: "with-driver", label: "With driver" },
            ].map((m) => (
              <button
                key={m.label}
                type="button"
                role="radio"
                aria-checked={rentMode === m.id}
                className={`search-mode-btn ${rentMode === m.id ? "active" : ""}`}
                onClick={() => setRentMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Vehicle Type Custom Dropdown */}
          <div
            className={`search-field-pill search-vehicle-pill ${vehicleDropdownOpen ? "dropdown-open" : ""}`}
            ref={vehicleDropdownRef}
          >
            <button
              type="button"
              className="vehicle-dropdown-trigger"
              onClick={() => setVehicleDropdownOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={vehicleDropdownOpen}
              aria-label="Filter by vehicle type"
            >
              <Car size={16} className="vehicle-type-field-icon" />
              <span className="selected-vehicle-text">
                {VEHICLE_TYPES.find((t) => t.id === vehicleType)?.label || "Any vehicle"}
              </span>
              <ChevronDown
                size={16}
                className={`select-chevron ${vehicleDropdownOpen ? "chevron-rotated" : ""}`}
              />
            </button>

            {vehicleDropdownOpen && (
              <div
                ref={dropdownMenuRef}
                className="custom-vehicle-dropdown-menu"
                role="listbox"
              >
                {VEHICLE_TYPES.map((t) => {
                  const isSelected = vehicleType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`vehicle-dropdown-item ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        setVehicleType(t.id);
                        setVehicleDropdownOpen(false);
                      }}
                    >
                      <span className="item-label">{t.label}</span>
                      {isSelected && <Check size={16} className="item-check" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Location Input */}
          <div className="search-field-pill search-location-pill">
            <MapPin size={18} className="location-field-icon" />
            <input
              type="text"
              list="popular-locations-list"
              placeholder="Location (e.g. Colombo)"
              aria-label="Location"
              enterKeyHint="search"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="location-input"
            />
            <datalist id="popular-locations-list">
              {POPULAR_LOCATIONS.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          {/* Price Range Dual-Slider Mechanism */}
          <div className="search-price-range-pill" aria-label="Price range filter">
            <div className="price-row">
              <span className="price-label">Price / day</span>
              <output className="price-output">
                LKR {minPrice.toLocaleString("en-US")} – {maxPrice.toLocaleString("en-US")}{maxPrice >= PRICE_MAX ? "+" : ""}
              </output>
            </div>
            <div className="range-slider-wrap">
              <div className="range-track" />
              <div
                className="range-fill"
                style={{
                  left: `${minPercent}%`,
                  right: `${100 - maxPercent}%`,
                }}
              />
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={minPrice}
                onChange={handleMinChange}
                aria-label="Minimum price per day in LKR"
                className="range-input range-input-min"
              />
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={maxPrice}
                onChange={handleMaxChange}
                aria-label="Maximum price per day in LKR"
                className="range-input range-input-max"
              />
            </div>
          </div>

          {/* Search CTA Button */}
          <button
            type="button"
            className="hero-search-submit-btn"
            onClick={handleSearch}
          >
            <Search size={16} strokeWidth={2.5} />
            <span>Search</span>
          </button>
        </div>
      </motion.div>

      <style>{`
        /* =========================================================
           1. DESKTOP MODE (Default / min-width: 1025px)
           ========================================================= */
        .yamu-exact-hero {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 85px 2rem 2.25rem;
          box-sizing: border-box;
          overflow: visible;
          overflow-x: clip;
          overflow-y: visible;
          background-color: #ea580c;
        }

        /* Luminous Radiant Orange Gradient */
        .hero-gradient-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 50% 34%,
            #ff8800 0%,
            #f97316 26%,
            #ea580c 58%,
            #c2410c 88%,
            #9a3412 100%
          );
          z-index: 0;
          pointer-events: none;
        }

        /* Center Bright Aura Glow */
        .hero-light-glow {
          position: absolute;
          top: 15%;
          left: 50%;
          transform: translate(-50%, -20%);
          width: 900px;
          height: 600px;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 255, 255, 0.28) 0%,
            rgba(255, 210, 150, 0.18) 35%,
            rgba(249, 115, 22, 0.05) 70%,
            transparent 100%
          );
          filter: blur(60px);
          pointer-events: none;
          z-index: 1;
        }



        /* Center Stage: YAMU Watermark + Fleet + Text */
        .hero-center-stage {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 1200px;
          margin: auto 0;
          padding-top: 0.5rem;
          text-align: center;
        }

        /* Unified stage — text towers high behind, cars sit neatly in front */
        .heroic-fleet-stage {
          position: relative;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-top: 5rem;
          overflow: visible;
        }

        /* YAMU text — bold, towering high above cars with clear visibility */
        .watermark-yamu-text {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          font-family: 'Changa One', 'Anton', 'Oswald', cursive, sans-serif;
          font-size: clamp(9.5rem, 17vw, 15.5rem);
          font-weight: 400;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #ffffff;
          line-height: 0.82;
          margin: 0;
          padding: 0;
          user-select: none;
          pointer-events: none;
          text-shadow: 0 16px 36px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.2);
          opacity: 1;
          z-index: 1;
          text-align: center;
        }

        /* Fleet image — sits at the bottom, overlapping only lower portion of YAMU */
        .fleet-image-wrap {
          position: relative;
          z-index: 2;
          width: 100%;
          margin-top: -4.5rem;
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }

        /* Clean cutout image with no shadow */
        .fleet-cutout-img {
          width: 100%;
          height: auto;
          max-height: 380px;
          object-fit: contain;
          filter: none;
          box-shadow: none;
          user-select: none;
          pointer-events: none;
          position: relative;
          z-index: 2;
        }

        /* Taglines Below Vehicles */
        .hero-taglines {
          margin-top: 0.6rem;
          margin-bottom: 1.75rem;
          z-index: 15;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Highly Recognizable Action Buttons Above the Sentence */
        .hero-buttons-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          margin-bottom: 1.5rem;
          z-index: 20;
        }

        .hero-action-btn {
          border: none;
          outline: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 12px 28px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          border-radius: 999px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: inherit;
          user-select: none;
          text-decoration: none;
          white-space: nowrap;
          position: relative;
        }

        .hero-action-btn .hero-btn-icon {
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        /* Active Tab: Solid White Pill with Vibrant Orange Text & Elevation */
        .hero-action-btn.active {
          background: #ffffff !important;
          color: #ea580c !important;
          font-weight: 800;
          border: 2px solid #ffffff;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
        }

        .hero-action-btn.active .hero-btn-icon {
          color: #ea580c !important;
        }

        .hero-action-btn.active:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
          background: #fffaf5 !important;
        }

        /* Inactive Tab - Distinct Frosted Glass Pill */
        .hero-action-btn:not(.active) {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #ffffff !important;
          border: 1.5px solid rgba(255, 255, 255, 0.6);
          font-weight: 600;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        }

        .hero-action-btn:not(.active) .hero-btn-icon {
          color: #ffffff !important;
        }

        .hero-action-btn:not(.active):hover {
          background: rgba(255, 255, 255, 0.32);
          border-color: #ffffff;
          color: #ffffff !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
        }

        .hero-action-btn:hover .hero-btn-icon {
          transform: scale(1.15);
        }

        .hero-sub-top {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.88rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
          margin: 0 0 6px 0;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 4px 16px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .tag-sparkle {
          color: #fde047;
          font-size: 0.78rem;
        }

        .hero-sub-bottom {
          font-size: clamp(1.1rem, 2vw, 1.4rem);
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .hero-scroll-hint-pill {
          display: none;
        }

        /* Search Card Container */
        .hero-search-card-container {
          position: relative;
          z-index: 25;
          width: 100%;
          max-width: 1140px;
          margin-top: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: visible;
        }

        /* Pure White Search Card Bar */
        .search-mode {
          display: inline-flex;
          flex-shrink: 0;
          padding: 4px;
          gap: 2px;
          background: #fff7ed;
          border: 1px solid rgba(249, 115, 22, 0.22);
          border-radius: 999px;
          box-sizing: border-box;
        }
        .search-mode-btn {
          padding: 0.45rem 0.75rem;
          border-radius: 999px;
          background: transparent;
          font-size: 0.82rem;
          font-weight: 700;
          color: #9a3412;
          white-space: nowrap;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
          border: none;
        }
        .search-mode-btn.active {
          background: linear-gradient(135deg, #ff8800 0%, #ea580c 100%);
          color: #fff;
          box-shadow: 0 4px 12px -4px rgba(249, 115, 22, 0.6);
        }

        .hero-search-bar {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.08);
          padding: 12px 16px;
          width: 100%;
          max-width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          box-sizing: border-box;
          flex-wrap: nowrap;
          overflow: visible;
        }

        .search-lead-label {
          font-size: 0.88rem;
          font-weight: 700;
          color: #374151;
          white-space: nowrap;
          padding-right: 4px;
        }

        /* Dropdown Pills */
        .search-field-pill {
          position: relative;
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 0 14px;
          height: 48px;
          flex: 1.1;
          min-width: 125px;
          box-sizing: border-box;
          transition: all 0.2s;
        }

        .search-field-pill:hover {
          border-color: #cbd5e1;
          background: #ffffff;
        }

        .search-field-pill:focus-within {
          border-color: #ea580c;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15);
        }

        .search-vehicle-pill {
          flex: 1.1;
          min-width: 125px;
          position: relative !important;
          cursor: pointer;
        }

        .search-vehicle-pill.dropdown-open {
          border-color: #ea580c !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15) !important;
        }

        .vehicle-dropdown-trigger {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
          border: none;
          outline: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
        }

        .selected-vehicle-text {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .select-chevron {
          position: static;
          color: #ea580c;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          margin-left: 6px;
        }

        .select-chevron.chevron-rotated {
          transform: rotate(180deg);
        }

        .custom-vehicle-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          min-width: 220px;
          width: 100%;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 16px 40px -8px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(0, 0, 0, 0.06);
          padding: 6px;
          z-index: 100;
          max-height: min(420px, 75vh);
          overflow-y: auto;
          overscroll-behavior: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
          animation: dropdownMenuIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes dropdownMenuIn {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .custom-vehicle-dropdown-menu::-webkit-scrollbar {
          width: 5px;
        }
        .custom-vehicle-dropdown-menu::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }

        .vehicle-dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border: none;
          background: transparent;
          border-radius: 10px;
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 550;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .vehicle-dropdown-item:hover {
          background: #fff7ed;
          color: #ea580c;
          font-weight: 650;
        }

        .vehicle-dropdown-item.selected {
          background: #ffedd5;
          color: #c2410c;
          font-weight: 750;
        }

        .item-check {
          color: #ea580c;
          flex-shrink: 0;
          margin-left: 8px;
        }

        .vehicle-type-field-icon {
          display: none;
        }

        /* Location Field on Desktop: Substantially bigger and more spacious */
        .search-location-pill {
          flex: 2;
          min-width: 190px;
          padding: 0 14px;
        }

        .location-field-icon {
          color: #ea580c;
          margin-right: 10px;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .location-input {
          width: 100%;
          min-width: 0;
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
        }

        .location-input::placeholder {
          color: #94a3b8;
          font-weight: 500;
        }

        /* Price Range Mechanism on Desktop: Balanced, never wraps, clean containment */
        .search-price-range-pill {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 7px 14px 6px;
          height: 48px;
          flex: 2.2;
          min-width: 240px;
          box-sizing: border-box;
          transition: all 0.2s;
        }

        .search-price-range-pill:hover {
          border-color: #cbd5e1;
          background: #ffffff;
        }

        .search-price-range-pill:focus-within {
          border-color: #ea580c;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15);
        }

        .search-price-range-pill .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          line-height: 1;
          white-space: nowrap;
        }

        .search-price-range-pill .price-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
          user-select: none;
        }

        .search-price-range-pill .price-output {
          font-size: 0.82rem;
          font-weight: 800;
          color: #0f172a;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }

        .search-price-range-pill .range-slider-wrap {
          position: relative;
          width: 100%;
          height: 14px;
          margin: 0;
          display: flex;
          align-items: center;
        }

        .search-price-range-pill .range-track,
        .search-price-range-pill .range-fill {
          position: absolute;
          top: 50%;
          height: 4px;
          border-radius: 2px;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .search-price-range-pill .range-track {
          left: 0;
          right: 0;
          background: #e2e8f0;
        }

        .search-price-range-pill .range-fill {
          background: #ea580c;
        }

        .search-price-range-pill .range-input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          padding: 0;
          border: 0;
          border-radius: 0;
          background: transparent;
          margin: 0;
          -webkit-appearance: none;
          appearance: none;
          pointer-events: none;
        }

        .search-price-range-pill .range-input::-webkit-slider-runnable-track {
          background: transparent;
          border: none;
          height: 100%;
        }

        .search-price-range-pill .range-input::-moz-range-track {
          background: transparent;
          border: none;
          height: 100%;
        }

        .search-price-range-pill .range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid #ea580c;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
          cursor: grab;
          transition: transform 0.1s ease;
        }

        .search-price-range-pill .range-input::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .search-price-range-pill .range-input::-moz-range-thumb {
          pointer-events: auto;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid #ea580c;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
          cursor: grab;
          transition: transform 0.1s ease;
        }

        .search-price-range-pill .range-input::-moz-range-thumb:hover {
          transform: scale(1.2);
        }

        .search-price-range-pill .range-input:focus {
          outline: none;
        }

        .search-price-range-pill .range-input:active {
          z-index: 10;
        }

        /* Search CTA Button — Radiant Sunset Orange Theme */
        .hero-search-submit-btn {
          background: linear-gradient(135deg, #ff8800 0%, #f97316 45%, #ea580c 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 0 24px;
          height: 48px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 6px 20px -2px rgba(249, 115, 22, 0.45);
          white-space: nowrap;
          font-family: inherit;
          flex-shrink: 0;
        }

        .hero-search-submit-btn:hover {
          background: linear-gradient(135deg, #ff9500 0%, #ea580c 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 26px -2px rgba(234, 88, 12, 0.55);
        }

        @media (max-width: 1240px) {
          .yamu-exact-hero {
            padding-left: 1.25rem;
            padding-right: 1.25rem;
          }
        }

        /* =========================================================
           2. TABLET & COMPRESSED LAPTOP MODE (769px <= width <= 1180px)
           ========================================================= */
        @media (min-width: 769px) and (max-width: 1180px) {
          .yamu-exact-hero {
            padding: 85px 1.25rem 2rem;
            min-height: 100vh;
            min-height: 100dvh;
            overflow: visible !important;
            overflow-x: clip !important;
            overflow-y: visible !important;
          }

          .heroic-fleet-stage {
            max-width: 740px;
            padding-top: 3.5rem;
          }

          .watermark-yamu-text {
            font-size: clamp(6.8rem, 14vw, 10rem);
            letter-spacing: -0.02em;
            line-height: 0.84;
          }

          .fleet-image-wrap {
            margin-top: -3.2rem;
          }

          .fleet-cutout-img {
            max-height: 280px;
          }

          .hero-sub-bottom {
            font-size: 1.2rem;
          }

          .hero-search-card-container {
            max-width: 1000px;
            width: 100%;
          }

          .hero-search-bar {
            display: grid;
            grid-template-columns: auto minmax(110px, 1fr) minmax(150px, 1.6fr) 140px;
            grid-template-rows: auto auto;
            gap: 10px;
            padding: 12px 14px;
            width: 100%;
            box-sizing: border-box;
          }

          .search-mode {
            grid-column: 1;
            grid-row: 1;
            align-self: center;
            width: auto;
          }

          .search-mode-btn {
            padding: 0.45rem 0.65rem;
            font-size: 0.8rem;
          }

          .search-vehicle-pill {
            grid-column: 2;
            grid-row: 1;
            width: 100%;
            min-width: 0;
            padding: 0 10px;
          }

          .search-location-pill {
            grid-column: 3 / 5;
            grid-row: 1;
            width: 100%;
            min-width: 0;
            padding: 0 12px;
          }

          .search-price-range-pill {
            grid-column: 1 / 4;
            grid-row: 2;
            width: 100%;
            min-width: 0;
          }

          .hero-search-submit-btn {
            grid-column: 4;
            grid-row: 2;
            width: 100%;
            height: 48px;
            justify-content: center;
            padding: 0 12px;
          }
        }

        /* =========================================================
           3. MOBILE MODE (width <= 768px)
           ========================================================= */
        @media (max-width: 768px) {
          .yamu-exact-hero {
            padding: 76px 1rem 2.5rem;
            min-height: auto;
            overflow: visible !important;
            overflow-x: clip !important;
            overflow-y: visible !important;
            justify-content: flex-start;
            gap: 1;
          }

          .hero-center-stage {
            min-height: calc(100dvh - 84px);
            min-height: calc(100vh - 84px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin: 0;
            padding-top: 1.5rem;
            padding-bottom: 5.5rem;
            width: 100%;
            box-sizing: border-box;
          }

          .heroic-fleet-stage {
            max-width: 100%;
            width: 100%;
            padding-top: 5.6rem;
          }

          .watermark-yamu-text {
            font-size: clamp(5.5rem, 20vw, 8rem) !important;
            letter-spacing: -0.02em !important;
            line-height: 0.8 !important;
            text-shadow: 0 12px 28px rgba(0, 0, 0, 0.35), 0 3px 10px rgba(0, 0, 0, 0.2) !important;
          }

          .fleet-image-wrap {
            margin-top: -3.2rem;
          }

          .fleet-cutout-img {
            max-height: 205px;
            width: 100%;
          }

          .hero-taglines {
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
            padding: 0 0.5rem;
          }

          .hero-sub-top {
            font-size: 0.74rem;
            padding: 4px 14px;
            margin-bottom: 20px;
          }

          .hero-sub-bottom {
            font-size: 1.02rem;
            line-height: 1.4;
          }

          /* Scroll Hint Pill on Mobile - with more breathing room */
          .hero-scroll-hint-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 1.85rem;
            padding: 7px 18px;
            background: rgba(255, 255, 255, 0.18);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 999px;
            color: #ffffff;
            font-size: 0.8rem;
            font-weight: 700;
            letter-spacing: 0.03em;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
            transition: all 0.2s ease;
            animation: heroHintBounce 2.4s ease-in-out infinite;
          }

          .hero-scroll-hint-pill:active {
            transform: scale(0.96);
            background: rgba(255, 255, 255, 0.28);
          }

          .hero-scroll-chevron {
            transition: transform 0.2s ease;
          }

          @keyframes heroHintBounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(5px);
            }
          }

          /* Vehicle filter card stays at the bottom, visible only when scrolling down */
          .hero-search-card-container {
            width: 100%;
            max-width: 440px;
            margin-top: 2rem;
            margin-bottom: 2.5rem;
            padding: 0 8px;
            box-sizing: border-box;
            z-index: 25;
            scroll-margin-top: 76px;
            overflow: visible !important;
          }

          .hero-buttons-container {
            width: 100%;
            max-width: 440px;
            display: flex;
            gap: 12px;
            margin-bottom: 2.85rem;
            padding: 0 0.5rem;
            box-sizing: border-box;
          }

          .hero-action-btn {
            flex: 1;
            justify-content: center;
            text-align: center;
            padding: 10px 12px;
            font-size: 0.82rem;
            gap: 6px;
            border-radius: 999px;
            white-space: nowrap;
          }

          .hero-action-btn .hero-btn-icon {
            width: 16px;
            height: 16px;
          }

          /* Search Bar on Mobile - Clean White Card with 24px radius & 16px padding */
          .hero-search-bar {
            flex-direction: column;
            align-items: stretch;
            border-radius: 24px;
            padding: 16px;
            gap: 12px;
            box-sizing: border-box;
            background: #ffffff !important;
            box-shadow: 0 18px 40px rgba(60, 20, 0, 0.28), 0 4px 12px rgba(0, 0, 0, 0.08);
            overflow: visible !important;
          }

<<<<<<< HEAD
          /* Column layout: flex-basis 0 would collapse the pills, so size them explicitly */
          .search-field-pill {
            flex: none;
            width: 100%;
            min-width: 0;
            height: 48px;
            border-radius: 12px;
          }

          /* 16px stops iOS Safari zooming the page when a field is focused */
          .search-select,
          .location-input,
          .price-input {
            font-size: 16px;
          }

          .search-mode-btn {
            min-height: 40px;
            font-size: 0.85rem;
          }

          .search-price-row {
            flex: none;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
=======
          /* Dropdown Pills Reset on Mobile */
          .search-field-pill {
            flex: none !important;
            width: 100% !important;
            min-width: 0 !important;
          }

          /* Mode buttons on mobile: 3-way segmented control (Order 1) */
          .search-mode {
            order: 1 !important;
            width: 100% !important;
            height: 54px !important;
            min-height: 54px !important;
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            padding: 4px !important;
            gap: 4px !important;
            box-sizing: border-box !important;
            background: #F6F4F1 !important;
            border: 1.5px solid #E7E1DA !important;
            border-radius: 14px !important;
            flex: none !important;
          }

          .search-mode-btn {
            height: 100% !important;
            min-height: 44px !important;
            border: 0 !important;
            border-radius: 10px !important;
            background: transparent !important;
            color: #6F6359 !important;
            font-size: 14.5px !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.15s ease !important;
          }

          .search-mode-btn.active {
            background: #E8590C !important;
            color: #ffffff !important;
            box-shadow: 0 2px 8px rgba(232, 89, 12, 0.35) !important;
          }

          /* Location Field on Mobile (Order 2) — Big, Spacious, matching target screenshot */
          .search-location-pill {
            order: 2 !important;
            width: 100% !important;
            height: 56px !important;
            min-height: 56px !important;
            max-height: 56px !important;
            padding: 0 18px !important;
            border-radius: 14px !important;
            background: #F6F4F1 !important;
            border: 1.5px solid #E7E1DA !important;
            display: flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            transition: all 0.2s ease !important;
            flex: none !important;
          }

          .search-location-pill:focus-within {
            background: #ffffff !important;
            border-color: #E8590C !important;
            box-shadow: 0 0 0 3px rgba(232, 89, 12, 0.18) !important;
          }

          .location-field-icon {
            display: none !important;
          }

          .location-input {
            width: 100% !important;
            height: 100% !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            color: #1D140C !important;
            border: none !important;
            background: transparent !important;
            outline: none !important;
            padding: 0 !important;
            margin: 0 !important;
            line-height: normal !important;
          }

          .location-input::placeholder {
            color: #7A6F66 !important;
            font-weight: 500 !important;
            font-size: 16px !important;
          }

          /* Vehicle Type Field on Mobile (Order 3) */
          .search-vehicle-pill {
            order: 3 !important;
            width: 100% !important;
            height: 56px !important;
            min-height: 56px !important;
            max-height: 56px !important;
            padding: 0 18px !important;
            border-radius: 14px !important;
            background: #F6F4F1 !important;
            border: 1.5px solid #E7E1DA !important;
            display: flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            position: relative !important;
            transition: all 0.2s ease !important;
            flex: none !important;
          }

          .search-vehicle-pill:focus-within,
          .search-vehicle-pill.dropdown-open {
            background: #ffffff !important;
            border-color: #E8590C !important;
            box-shadow: 0 0 0 3px rgba(232, 89, 12, 0.18) !important;
            z-index: 50 !important;
          }

          .selected-vehicle-text {
            font-size: 16px !important;
            font-weight: 600 !important;
            color: #1D140C !important;
          }

          .select-chevron {
            color: #6F6359 !important;
            width: 18px !important;
            height: 18px !important;
          }

          .custom-vehicle-dropdown-menu {
            max-height: min(380px, 60vh) !important;
            overscroll-behavior: auto !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.16) !important;
            z-index: 250 !important;
          }

          .vehicle-dropdown-item {
            padding: 12px 14px !important;
            font-size: 15px !important;
          }

          /* Price Range Field on Mobile (Order 4) */
          .search-price-range-pill {
            order: 4;
            width: 100%;
            height: auto;
            padding: 12px 16px 8px;
            border: 1.5px solid #E7E1DA;
            border-radius: 14px;
            background: #F6F4F1;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .search-price-range-pill:focus-within {
            border-color: #E8590C;
            outline: 3px solid #E8590C;
            outline-offset: 1px;
          }

          .search-price-range-pill .price-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: 14px;
            font-weight: 600;
            color: #6F6359;
          }

          .search-price-range-pill .price-label {
            text-transform: none;
            letter-spacing: normal;
            font-size: 14px;
            font-weight: 600;
            color: #6F6359;
          }

          .search-price-range-pill .price-output {
            color: #1D140C;
            font-weight: 800;
            font-size: 15px;
          }

          .search-price-range-pill .range-slider-wrap {
            position: relative;
            height: 36px;
            margin: 4px 10px 0;
            display: flex;
            align-items: center;
          }

          .search-price-range-pill .range-track,
          .search-price-range-pill .range-fill {
            position: absolute;
            top: 50%;
            height: 6px;
            border-radius: 3px;
            transform: translateY(-50%);
          }

          .search-price-range-pill .range-track {
            left: 0;
            right: 0;
            background: #E7E1DA;
          }

          .search-price-range-pill .range-fill {
            background: #E8590C;
          }

          .search-price-range-pill .range-input {
            position: absolute;
            inset: 0;
>>>>>>> afd3b61174c807f983c62e48cd59c8beb9d31a77
            width: 100%;
            height: 36px;
            padding: 0;
            border: 0;
            border-radius: 0;
            background: none;
            margin: 0;
            -webkit-appearance: none;
            appearance: none;
            pointer-events: none;
          }

          .search-price-range-pill .range-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            pointer-events: auto;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #ffffff;
            border: 3px solid #E8590C;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
            cursor: grab;
          }

          .search-price-range-pill .range-input::-moz-range-thumb {
            pointer-events: auto;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #ffffff;
            border: 3px solid #E8590C;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
            cursor: grab;
          }

<<<<<<< HEAD
          .search-input-pill {
            height: 48px;
            border-radius: 12px;
=======
          .search-price-range-pill .range-input:focus-visible::-webkit-slider-thumb {
            outline: 3px solid #1D140C;
            outline-offset: 2px;
>>>>>>> afd3b61174c807f983c62e48cd59c8beb9d31a77
          }

          /* Submit Button on Mobile (Order 5) */
          .hero-search-submit-btn {
            order: 5;
            width: 100%;
<<<<<<< HEAD
            height: 52px;
            justify-content: center;
            margin-top: 2px;
            border-radius: 14px;
            font-size: 1rem;
          }

          /* Touch feedback instead of hover lifts */
          .hero-search-submit-btn:active,
          .hero-action-btn:active {
            transform: scale(0.97);
=======
            height: 56px;
            border: 0;
            border-radius: 14px;
            background: #E8590C;
            color: #ffffff;
            font-size: 17px;
            font-weight: 800;
            justify-content: center;
            gap: 8px;
            margin-top: 4px;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(232, 89, 12, 0.35);
          }

          .hero-search-submit-btn:focus-visible {
            outline: 3px solid #1D140C;
            outline-offset: 2px;
          }

          .hero-search-submit-btn:active {
            transform: scale(0.98);
>>>>>>> afd3b61174c807f983c62e48cd59c8beb9d31a77
          }
        }

        /* =========================================================
           4. EXTRA SMALL PHONES (width <= 420px)
           ========================================================= */
        @media (max-width: 420px) {
          .yamu-exact-hero {
            padding: 70px 0.75rem 2rem;
            overflow: visible !important;
            overflow-x: clip !important;
            overflow-y: visible !important;
          }

          .hero-center-stage {
            min-height: calc(100dvh - 78px);
            min-height: calc(100vh - 78px);
            padding-top: 1rem;
            padding-bottom: 4.2rem;
            justify-content: center;
          }

          .heroic-fleet-stage {
            padding-top: 5.2rem;
          }

          .watermark-yamu-text {
            font-size: clamp(6.8rem, 20vw, 11.2rem) !important;
            line-height: 1.2 !important;
          }

          .fleet-image-wrap {
            margin-top: -2.8rem;
          }

          .fleet-cutout-img {
            max-height: 185px;
          }

          .hero-sub-bottom {
            font-size: 0.94rem;
            line-height: 1.3;
          }

          .hero-buttons-container {
            margin-bottom: 1.45rem;
            padding: 0 0.25rem;
          }

          .hero-action-btn {
            font-size: 0.74rem;
            padding: 9px 6px;
            gap: 5px;
          }

          .hero-action-btn .hero-btn-icon {
            width: 14px;
            height: 14px;
          }

          .hero-scroll-hint-pill {
            margin-top: 1.45rem;
            font-size: 0.76rem;
            padding: 6px 14px;
          }

          .hero-search-bar {
            padding: 14px 12px;
            gap: 10px;
          }

          .search-price-range-pill {
            padding: 10px 12px 6px;
          }

          .search-mode-btn {
            font-size: 0.8rem;
            padding: 8px 2px;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
