import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ChevronDown, MapPin } from "lucide-react";
import fleetCutoutImg from "../assets/images/yamu_fleet_cutout.png";
import { useSiteConfig } from "../context/SiteConfigContext";

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
  const [activeSlide, setActiveSlide] = useState(0);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (vehicleType) params.set("type", vehicleType);
    if (location && location.trim()) params.set("location", location.trim());
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    navigate(`/vehicles${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="yamu-exact-hero">
      {/* Radiant Orange Gradient Background with Atmospheric Light Source */}
      <div className="hero-gradient-overlay" />
      <div className="hero-light-glow" />

      {/* Side Pagination Dots */}
      <div className="hero-carousel-dots">
        <button
          type="button"
          aria-label="Slide 1"
          className={`carousel-dot ${activeSlide === 0 ? "active" : ""}`}
          onClick={() => setActiveSlide(0)}
        >
          <span className="dot-inner" />
        </button>
        <button
          type="button"
          aria-label="Slide 2"
          className={`carousel-dot ${activeSlide === 1 ? "active" : ""}`}
          onClick={() => setActiveSlide(1)}
        >
          <span className="dot-inner" />
        </button>
        <button
          type="button"
          aria-label="Slide 3"
          className={`carousel-dot ${activeSlide === 2 ? "active" : ""}`}
          onClick={() => setActiveSlide(2)}
        >
          <span className="dot-inner" />
        </button>
      </div>

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
          <p className="hero-sub-top">
            <span className="tag-sparkle">✦</span> {hero?.taglineTop || "Make The Right Choice"} <span className="tag-sparkle">✦</span>
          </p>
          <h2 className="hero-sub-bottom">
            {hero?.taglineBottom || "Find Your Dream Car, Which will Give You Wings"}
          </h2>
        </motion.div>
      </div>

      {/* Search Card with Attached Tabs */}
      <motion.div
        className="hero-search-card-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top Attached Tabs */}
        <div className="hero-tabs-header">
          <button
            type="button"
            className={`hero-tab-btn ${activeTab === "rent" ? "active" : ""}`}
            onClick={() => setActiveTab("rent")}
          >
            I Want to Rent a Car
          </button>
          <button
            type="button"
            className={`hero-tab-btn ${activeTab === "buy" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("buy");
              const token = localStorage.getItem("token");
              const user = JSON.parse(localStorage.getItem("user") || "null");
              if (token && user?.role === "company") {
                navigate("/company-list-vehicle");
              } else if (token && (user?.role === "owner" || user?.role === "admin" || user?.role === "renter")) {
                navigate("/list-my-car");
              } else {
                navigate("/choose-listing-type");
              }
            }}
          >
            I Want to List a Car
          </button>
        </div>

        {/* Pure White Search Card Bar */}
        <div className="hero-search-bar" onKeyDown={handleKeyDown}>
          <span className="search-lead-label">I'm Looking for</span>

          {/* Vehicle Type Select */}
          <div className="search-field-pill">
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="search-select"
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

        /* Side Carousel Dots */
        .hero-carousel-dots {
          position: absolute;
          right: 2.5rem;
          top: 48%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 20;
        }

        .carousel-dot {
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .carousel-dot .dot-inner {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.45);
          transition: all 0.25s ease;
          display: block;
        }

        .carousel-dot.active {
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          border-radius: 50%;
        }

        .carousel-dot.active .dot-inner {
          background: #ffffff;
          width: 5px;
          height: 5px;
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
          margin-top: 0.75rem;
          z-index: 15;
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

        /* Search Card with Attached Tabs */
        .hero-search-card-container {
          position: relative;
          z-index: 25;
          width: 100%;
          max-width: 1020px;
          margin-top: auto;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        /* Top Attached Tabs */
        .hero-tabs-header {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          padding-left: 2px;
        }

        .hero-tab-btn {
          border: none;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #ffffff;
          padding: 10px 22px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          border-radius: 12px 12px 0 0;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .hero-tab-btn.active {
          background: #ffffff;
          color: #ea580c;
          font-weight: 700;
          box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.08);
        }

        .hero-tab-btn:not(.active):hover {
          background: rgba(255, 255, 255, 0.3);
          color: #ffffff;
        }

        /* Pure White Search Card Bar */
        .hero-search-bar {
          background: #ffffff;
          border-radius: 0 16px 16px 16px;
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

          .hero-carousel-dots {
            display: none;
          }

          .heroic-fleet-stage {
            max-width: 700px;
            padding-top: 3.8rem;
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

        /* =========================================================
           3. MOBILE MODE (width <= 768px)
           ========================================================= */
        @media (max-width: 768px) {
          .yamu-exact-hero {
            padding: 72px 1rem 1.5rem;
            min-height: auto;
            min-height: 100dvh;
            justify-content: flex-start;
            gap: 0.75rem;
          }

          .hero-carousel-dots {
            display: none;
          }

          .hero-center-stage {
            margin: auto 0 0.5rem;
            padding-top: 0.25rem;
            width: 100%;
          }

          .heroic-fleet-stage {
            max-width: 100%;
            width: 100%;
            padding-top: 2.8rem;
          }

          .watermark-yamu-text {
            font-size: clamp(4.6rem, 19vw, 6.8rem);
            letter-spacing: -0.02em;
            line-height: 0.85;
            text-shadow: 0 10px 24px rgba(0, 0, 0, 0.32), 0 2px 8px rgba(0, 0, 0, 0.18);
          }

          .fleet-image-wrap {
            margin-top: -2.2rem;
          }

          .fleet-cutout-img {
            max-height: 200px;
            width: 100%;
          }

          .hero-taglines {
            margin-top: 0.5rem;
            padding: 0 0.5rem;
          }

          .hero-sub-top {
            font-size: 0.76rem;
            padding: 3px 12px;
            margin-bottom: 4px;
          }

          .hero-sub-bottom {
            font-size: 1.05rem;
            line-height: 1.35;
          }

          /* Attached Tabs on Mobile */
          .hero-search-card-container {
            width: 100%;
            max-width: 100%;
            margin-top: auto;
          }

          .hero-tabs-header {
            width: 100%;
            display: flex;
            gap: 3px;
          }

          .hero-tab-btn {
            flex: 1;
            text-align: center;
            padding: 9px 8px;
            font-size: 0.78rem;
            border-radius: 10px 10px 0 0;
            white-space: nowrap;
          }

          /* Search Bar on Mobile */
          .hero-search-bar {
            flex-direction: column;
            align-items: stretch;
            border-radius: 0 0 16px 16px;
            padding: 14px;
            gap: 10px;
          }

          .search-lead-label {
            font-size: 0.82rem;
            margin-bottom: -2px;
          }

          .search-field-pill {
            width: 100%;
            min-width: 0;
            height: 44px;
          }

          .search-price-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            width: 100%;
          }

          .search-price-group {
            width: 100%;
            min-width: 0;
          }

          .price-label {
            font-size: 0.75rem;
          }

          .search-input-pill {
            height: 42px;
          }

          .hero-search-submit-btn {
            width: 100%;
            height: 46px;
            justify-content: center;
            margin-top: 2px;
          }
        }

        /* =========================================================
           4. EXTRA SMALL PHONES (width <= 420px)
           ========================================================= */
        @media (max-width: 420px) {
          .yamu-exact-hero {
            padding: 68px 0.75rem 1.25rem;
          }

          .heroic-fleet-stage {
            padding-top: 2.4rem;
          }

          .watermark-yamu-text {
            font-size: clamp(3.8rem, 18vw, 5.2rem);
          }

          .fleet-image-wrap {
            margin-top: -1.8rem;
          }

          .fleet-cutout-img {
            max-height: 165px;
          }

          .hero-sub-bottom {
            font-size: 0.95rem;
          }

          .hero-tab-btn {
            font-size: 0.72rem;
            padding: 8px 4px;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
