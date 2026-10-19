import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import { Search, ChevronDown, MapPin, Car, PlusCircle, ArrowRight } from "lucide-react";
import fleetCutoutImg from "../assets/images/yamu_fleet_cutout_tight.png";
import { useSiteConfig } from "../context/SiteConfigContext";
import { FestivalHeroDecorations } from "./festivals/FestivalAccessoriesManager";

const VEHICLE_TYPES = [
  { id: "", label: "All Vehicle Types" },
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

  const [activeTab, setActiveTab] = useState("rent"); // "rent" | "buy"
  const [vehicleType, setVehicleType] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rentMode, setRentMode] = useState(""); // "" = any, "self-drive", "with-driver"

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (vehicleType) params.set("type", vehicleType);
    if (location && location.trim()) params.set("location", location.trim());
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (rentMode) params.set("mode", rentMode);
    navigate(`/vehicles${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <MotionConfig reducedMotion="user">
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
              <span className="hero-btn-badge">
                <Car size={18} strokeWidth={2.4} className="hero-btn-icon" />
              </span>
              <span><span className="hero-btn-long">I Want to </span>Rent a Car</span>
              <ArrowRight size={16} strokeWidth={2.6} className="hero-btn-arrow" />
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
              <span className="hero-btn-badge">
                <PlusCircle size={18} strokeWidth={2.4} className="hero-btn-icon" />
              </span>
              <span><span className="hero-btn-long">I Want to </span>List a Car</span>
              <ArrowRight size={16} strokeWidth={2.6} className="hero-btn-arrow" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Standalone Search Card Bar */}
      <motion.div
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

          {/* Vehicle Type Select */}
          <div className="search-field-pill">
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="search-select"
              aria-label="Vehicle type"
            >
              <option value="">Vehicle Type</option>
              {VEHICLE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>

          {/* Location Input */}
          <div className="search-field-pill search-location-pill">
            <MapPin size={15} className="location-field-icon" />
            <input
              type="text"
              list="popular-locations-list"
              placeholder="Find location (e.g. Colombo)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="location-input"
              aria-label="Pickup location"
              enterKeyHint="search"
              autoComplete="off"
            />
            <datalist id="popular-locations-list">
              {POPULAR_LOCATIONS.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          {/* Price Range Row (From & To) */}
          <div className="search-price-row">
            {/* Price Range: From */}
            <div className="search-price-group">
              <span className="price-label">From</span>
              <div className="search-input-pill">
                <span className="currency-symbol">LKR</span>
                <input
                  type="number"
                  placeholder="5,000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="price-input"
                  inputMode="numeric"
                  aria-label="Minimum price per day in LKR"
                />
              </div>
            </div>

            {/* Price Range: To */}
            <div className="search-price-group">
              <span className="price-label">To</span>
              <div className="search-input-pill">
                <span className="currency-symbol">LKR</span>
                <input
                  type="number"
                  placeholder="80,000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="price-input"
                  inputMode="numeric"
                  aria-label="Maximum price per day in LKR"
                />
              </div>
            </div>
          </div>

          {/* Search CTA Button */}
          <button
            type="button"
            className="hero-search-submit-btn"
            onClick={handleSearch}
          >
            <Search size={16} strokeWidth={2.5} aria-hidden="true" />
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
          overflow: hidden;
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

        /* Unified stage — fixed proportions so YAMU + fleet scale together.
           All sizes are in cqw (percent of the stage width). */
        .heroic-fleet-stage {
          position: relative;
          width: 100%;
          max-width: 920px;
          margin: 0 auto;
          aspect-ratio: 918 / 425;
          container-type: inline-size;
          overflow: visible;
        }

        /* YAMU — huge white wordmark behind the vehicles */
        .watermark-yamu-text {
          position: absolute;
          top: 3cqw;
          left: 0;
          right: 0;
          font-family: 'Archivo Black', 'Poppins', 'Arial Black', sans-serif;
          font-size: 27cqw;
          font-weight: 400;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          color: #ffffff;
          line-height: 1;
          margin: 0;
          padding: 0;
          user-select: none;
          pointer-events: none;
          text-shadow: 0 1.2cqw 3cqw rgba(124, 45, 18, 0.18);
          z-index: 1;
          text-align: center;
        }

        /* Fleet — covers the lower part of the wordmark */
        .fleet-image-wrap {
          position: absolute;
          left: 8%;
          width: 86%;
          bottom: 2.5cqw;
          z-index: 2;
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }

        .fleet-cutout-img {
          width: 100%;
          height: auto;
          object-fit: contain;
          user-select: none;
          pointer-events: none;
          filter: drop-shadow(0 2.2cqw 2cqw rgba(124, 45, 18, 0.35));
        }

        /* Action buttons below the fleet */
        .hero-taglines {
          margin-top: 1rem;
          margin-bottom: 2rem;
          z-index: 15;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-buttons-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 10px 34px rgba(124, 45, 18, 0.22);
          z-index: 20;
        }

        .hero-action-btn {
          border: none;
          outline: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 8px 22px 8px 8px;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.005em;
          cursor: pointer;
          border-radius: 999px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: inherit;
          user-select: none;
          text-decoration: none;
          white-space: nowrap;
          position: relative;
        }

        .hero-action-btn:focus-visible {
          outline: 3px solid rgba(255, 255, 255, 0.85);
          outline-offset: 3px;
        }

        .hero-btn-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: background 0.25s ease, transform 0.25s ease;
        }

        .hero-action-btn .hero-btn-icon {
          flex-shrink: 0;
        }

        .hero-btn-arrow {
          flex-shrink: 0;
          margin-left: -4px;
          opacity: 0.55;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
        }

        .hero-action-btn:hover .hero-btn-arrow {
          opacity: 1;
          transform: translateX(4px);
        }

        .hero-action-btn:hover .hero-btn-badge {
          transform: rotate(-8deg) scale(1.06);
        }

        /* Active: solid white pill, orange badge */
        .hero-action-btn.active {
          background: #ffffff;
          color: #c2410c;
          box-shadow: 0 8px 22px rgba(124, 45, 18, 0.25);
        }

        .hero-action-btn.active .hero-btn-badge {
          background: linear-gradient(135deg, #ff8800 0%, #ea580c 100%);
          color: #ffffff;
          box-shadow: 0 4px 10px -2px rgba(234, 88, 12, 0.55);
        }

        .hero-action-btn.active:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(124, 45, 18, 0.3);
        }

        /* Inactive: transparent inside the glass track */
        .hero-action-btn:not(.active) {
          background: transparent;
          color: #ffffff;
        }

        .hero-action-btn:not(.active) .hero-btn-badge {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .hero-action-btn:not(.active):hover {
          background: rgba(255, 255, 255, 0.14);
        }

        /* Search Card Container */
        .hero-search-card-container {
          position: relative;
          z-index: 25;
          width: 100%;
          max-width: 1020px;
          margin-top: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Pure White Search Card Bar */
        .search-mode {
          display: inline-flex; flex-shrink: 0; padding: 4px; gap: 2px;
          background: #fff7ed; border: 1px solid rgba(249, 115, 22, 0.22); border-radius: 999px;
        }
        .search-mode-btn {
          padding: 0.45rem 0.8rem; border-radius: 999px; background: transparent;
          font-size: 0.8rem; font-weight: 700; color: #9a3412; white-space: nowrap; cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .search-mode-btn.active {
          background: linear-gradient(135deg, #ff8800 0%, #ea580c 100%); color: #fff;
          box-shadow: 0 4px 12px -4px rgba(249, 115, 22, 0.6);
        }
        @media (max-width: 900px) {
          .search-mode { width: 100%; }
          .search-mode-btn { flex: 1; padding: 0.55rem 0.4rem; }
        }

        .hero-search-bar {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.08);
          padding: 14px 20px;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          box-sizing: border-box;
          flex-wrap: nowrap;
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
          border-radius: 10px;
          padding: 0 12px;
          height: 44px;
          flex: 1.2;
          min-width: 120px;
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

        .search-select {
          width: 100%;
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.88rem;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          padding-right: 18px;
        }

        .select-chevron {
          position: absolute;
          right: 12px;
          color: #ea580c;
          pointer-events: none;
        }

        .location-field-icon {
          color: #ea580c;
          margin-right: 8px;
          flex-shrink: 0;
        }

        .location-input {
          width: 100%;
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.88rem;
          font-weight: 600;
          color: #1e293b;
        }

        .location-input::placeholder {
          color: #94a3b8;
          font-weight: 500;
        }

        /* Price Range Row */
        .search-price-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1.5;
        }

        /* Price Input Groups */
        .search-price-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 120px;
        }

        .price-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: #64748b;
          white-space: nowrap;
        }

        .search-input-pill {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0 10px;
          height: 44px;
          width: 100%;
          transition: all 0.2s;
        }

        .search-input-pill:hover {
          border-color: #cbd5e1;
          background: #ffffff;
        }

        .search-input-pill:focus-within {
          border-color: #ea580c;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15);
        }

        .currency-symbol {
          font-size: 0.72rem;
          font-weight: 800;
          color: #ea580c;
          margin-right: 4px;
        }

        .price-input {
          width: 100%;
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.88rem;
          font-weight: 600;
          color: #0f172a;
        }

        .price-input::placeholder {
          color: #94a3b8;
          font-weight: 500;
        }

        /* Search CTA Button — Radiant Sunset Orange Theme */
        .hero-search-submit-btn {
          background: linear-gradient(135deg, #ff8800 0%, #f97316 45%, #ea580c 100%);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 0 28px;
          height: 44px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 6px 20px -2px rgba(249, 115, 22, 0.45);
          white-space: nowrap;
          font-family: inherit;
        }

        .hero-search-submit-btn:hover {
          background: linear-gradient(135deg, #ff9500 0%, #ea580c 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 26px -2px rgba(234, 88, 12, 0.55);
        }

        /* =========================================================
           2. TABLET MODE (768px <= width <= 1024px)
           ========================================================= */
        @media (min-width: 769px) and (max-width: 1024px) {
          .yamu-exact-hero {
            padding: 85px 1.5rem 2rem;
            min-height: 100vh;
            min-height: 100dvh;
          }







          .hero-search-card-container {
            max-width: 760px;
          }

          .hero-search-bar {
            flex-wrap: wrap;
            gap: 12px;
            padding: 16px 18px;
          }

          .search-lead-label {
            width: 100%;
            margin-bottom: -2px;
          }

          .search-field-pill {
            flex: 1 1 45%;
            min-width: 180px;
          }

          .search-price-row {
            flex: 1 1 60%;
            min-width: 240px;
          }

          .hero-search-submit-btn {
            flex: 1 1 30%;
            justify-content: center;
            height: 44px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-action-btn, .hero-btn-badge, .hero-btn-arrow,
          .hero-search-submit-btn, .search-mode-btn { transition: none !important; }
          .hero-action-btn:hover, .hero-search-submit-btn:hover { transform: none !important; }
        }

        /* =========================================================
           3. MOBILE MODE (width <= 768px) — priorities: search visible
           above the fold, 44pt+ touch targets, 16px inputs (no iOS zoom)
           ========================================================= */
        @media (max-width: 768px) {
          .yamu-exact-hero {
            min-height: 0;
            justify-content: flex-start;
            padding: calc(80px + env(safe-area-inset-top, 0px)) 16px
                     calc(20px + env(safe-area-inset-bottom, 0px));
            gap: 0;
          }

          .hero-center-stage {
            margin: 0;
            padding-top: 4px;
            width: 100%;
          }

          /* Let the wordmark + fleet use nearly the full phone width */
          .heroic-fleet-stage {
            width: calc(100% + 16px);
            max-width: none;
            margin: 0 -8px;
          }

          .hero-taglines {
            width: 100%;
            margin: 14px 0 12px;
            padding: 0;
          }

          /* Rent / List: full-width segmented control */
          .hero-buttons-container {
            width: 100%;
            max-width: 480px;
            gap: 4px;
            padding: 4px;
            box-sizing: border-box;
          }

          .hero-action-btn {
            flex: 1 1 0;
            min-width: 0;
            min-height: 48px;
            padding: 4px 12px 4px 5px;
            font-size: 0.94rem;
            gap: 8px;
            justify-content: flex-start;
          }

          /* Phones read "Rent a Car" / "List a Car" */
          .hero-btn-long { display: none; }

          .hero-btn-badge { width: 38px; height: 38px; }
          .hero-action-btn .hero-btn-icon { width: 18px; height: 18px; }
          .hero-btn-arrow { display: none; }

          /* Search card sits right under the CTAs, no dead gap */
          .hero-search-card-container {
            width: 100%;
            max-width: 480px;
            margin-top: 0;
          }

          .hero-search-bar {
            flex-direction: column;
            align-items: stretch;
            border-radius: 22px;
            padding: 12px;
            gap: 10px;
            box-shadow: 0 18px 40px -12px rgba(124, 45, 18, 0.45), 0 2px 6px rgba(0, 0, 0, 0.06);
          }

          .search-mode { width: 100%; box-sizing: border-box; }
          .search-mode-btn {
            flex: 1;
            min-height: 44px;
            font-size: 0.875rem;
            padding: 0 6px;
          }

          /* flex-basis 0 collapsed these to 18px in the column layout */
          .search-field-pill,
          .search-price-row,
          .search-price-group {
            flex: none;
          }

          .search-field-pill {
            width: 100%;
            min-width: 0;
            height: 50px;
            border-radius: 14px;
            padding: 0 14px;
            box-sizing: border-box;
          }

          .search-price-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            width: 100%;
          }

          .search-price-group {
            width: 100%;
            min-width: 0;
            flex-direction: column;
            align-items: stretch;
            gap: 0;
            position: relative;
          }

          /* Label sits inside the field, like an iOS inset field */
          .price-label {
            position: absolute;
            top: 7px;
            left: 14px;
            font-size: 0.6875rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            color: #64748b;
            pointer-events: none;
            z-index: 1;
          }

          .search-input-pill {
            height: 54px;
            border-radius: 14px;
            padding: 16px 14px 0;
            box-sizing: border-box;
          }

          .currency-symbol { font-size: 0.75rem; }

          .search-select,
          .location-input,
          .price-input {
            font-size: 16px;
            min-width: 0;
            height: 100%;
            align-self: stretch;
          }

          .hero-search-submit-btn {
            width: 100%;
            height: 52px;
            border-radius: 14px;
            justify-content: center;
            font-size: 1rem;
            margin-top: 2px;
          }

          .hero-search-submit-btn:hover { transform: none; }
          .hero-search-submit-btn:active { transform: scale(0.98); }
          .hero-action-btn:active { transform: scale(0.97); }
        }

        /* =========================================================
           4. SMALL PHONES (width <= 360px)
           ========================================================= */
        @media (max-width: 360px) {
          .yamu-exact-hero { padding-left: 12px; padding-right: 12px; }
          .hero-action-btn { font-size: 0.875rem; gap: 6px; padding-right: 8px; }
          .hero-btn-badge { width: 34px; height: 34px; }
          .search-mode-btn { font-size: 0.8125rem; }
        }
      `}</style>
    </section>
    </MotionConfig>
  );
};

export default Hero;
