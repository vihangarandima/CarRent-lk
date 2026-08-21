import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import fleetCutoutImg from "../assets/images/yamu_fleet_cutout.png";

const POPULAR_BRANDS = [
  "All Brands",
  "Toyota",
  "Honda",
  "Nissan",
  "Suzuki",
  "Mercedes-Benz",
  "BMW",
  "Mitsubishi",
  "Hyundai",
  "Kia",
  "Mazda",
];

const POPULAR_MODELS = {
  Toyota: ["All Models", "Prius", "Axio", "Premio", "Corolla", "CHR", "HiAce KDH", "Land Cruiser", "Vitz", "Raize"],
  Honda: ["All Models", "Civic", "Vezel", "Fit", "Grace", "CR-V"],
  Nissan: ["All Models", "X-Trail", "Leaf", "Sunny", "Caravan", "March"],
  Suzuki: ["All Models", "Alto", "Wagon R", "Spacia", "Swift", "Hustler", "Every"],
  "Mercedes-Benz": ["All Models", "C-Class", "E-Class", "S-Class", "GLA", "CLA"],
  BMW: ["All Models", "3 Series", "5 Series", "7 Series", "X1", "X3", "X5"],
};

const Hero = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("rent"); // "rent" | "buy"
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  const availableModels = brand && POPULAR_MODELS[brand] ? POPULAR_MODELS[brand] : ["All Models"];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (brand && brand !== "All Brands") params.set("brand", brand);
    if (model && model !== "All Models") params.set("model", model);
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
          {/* Massive Tall Watermark Text: YAMU */}
          <motion.div
            className="watermark-yamu-text"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            YAMU
          </motion.div>

          {/* Large Foreground Fleet Cutout overlapping the lower half */}
          <motion.div
            className="fleet-image-wrap"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src={fleetCutoutImg}
              alt="Yamu Sri Lanka Vehicle Fleet"
              className="fleet-cutout-img"
            />
            {/* Realistic Ground Shadows under vehicle tires */}
            <div className="fleet-ground-shadow-contact" />
            <div className="fleet-ground-shadow-diffuse" />
          </motion.div>
        </div>

        {/* Subtitles below the fleet */}
        <motion.div
          className="hero-taglines"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
        >
          <p className="hero-sub-top">Make The Right Choice</p>
          <h2 className="hero-sub-bottom">
            Find Your Dream Car, Which will Give You Wings
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
              navigate("/choose-listing-type");
            }}
          >
            I Want to List a Car
          </button>
        </div>

        {/* Pure White Search Card Bar */}
        <div className="hero-search-bar" onKeyDown={handleKeyDown}>
          <span className="search-lead-label">I'm Looking for</span>

          {/* Brand Select */}
          <div className="search-field-pill">
            <select
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setModel("");
              }}
              className="search-select"
            >
              <option value="">Select Brand</option>
              {POPULAR_BRANDS.map((b) => (
                <option key={b} value={b === "All Brands" ? "" : b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>

          {/* Model Select */}
          <div className="search-field-pill">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="search-select"
            >
              <option value="">Select Model</option>
              {availableModels.map((m) => (
                <option key={m} value={m === "All Models" ? "" : m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>

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
        /* EXACT YAMU HERO STYLES */
        .yamu-exact-hero {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 85px 1.5rem 2.5rem;
          box-sizing: border-box;
          overflow: hidden;
          background-color: #ea580c;
        }

        /* Luminous Radiant Orange Gradient matching the Blue Reference */
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
          margin-top: auto;
          margin-bottom: 1rem;
          text-align: center;
        }

        /* Unified stage — text behind, cars in front, centered */
        .heroic-fleet-stage {
          position: relative;
          width: 100%;
          max-width: 850px;
          margin: 0 auto;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: visible;
        }

        /* YAMU text — centered in stage container, towers above cars with rich dimensional shadow */
        .watermark-yamu-text {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 45%;
          font-family: 'Bebas Neue', 'Oswald', 'Anton', sans-serif;
          font-size: clamp(10rem, 16vw, 16rem);
          font-weight: 400;
          letter-spacing: 0.02em;
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

        /* Fleet image — sits at the bottom, covering the lower portion of YAMU */
        .fleet-image-wrap {
          position: relative;
          z-index: 2;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }

        /* Clean cutout image with no unnecessary all-around halo shadow */
        .fleet-cutout-img {
          width: 100%;
          height: auto;
          max-height: 400px;
          object-fit: contain;
          filter: none;
          user-select: none;
          pointer-events: none;
          position: relative;
          z-index: 2;
        }

        /* Tight dark contact shadow directly where the tires meet the road */
        .fleet-ground-shadow-contact {
          position: absolute;
          bottom: 2px;
          left: 6%;
          right: 6%;
          height: 14px;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 0, 0, 0.72) 0%,
            rgba(0, 0, 0, 0.35) 50%,
            transparent 75%
          );
          filter: blur(4px);
          z-index: 1;
          pointer-events: none;
        }

        /* Softer ambient ground shadow spreading underneath the entire chassis */
        .fleet-ground-shadow-diffuse {
          position: absolute;
          bottom: -10px;
          left: 2%;
          right: 2%;
          height: 32px;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 0, 0, 0.45) 0%,
            rgba(0, 0, 0, 0.18) 55%,
            transparent 80%
          );
          filter: blur(12px);
          z-index: 1;
          pointer-events: none;
        }

        /* Taglines Below Vehicles */
        .hero-taglines {
          margin-top: 1rem;
          z-index: 15;
        }

        .hero-sub-top {
          font-size: 0.92rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.92);
          margin: 0 0 4px 0;
          letter-spacing: 0.03em;
        }

        .hero-sub-bottom {
          font-size: clamp(1.05rem, 2vw, 1.35rem);
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        }

        /* Search Card with Attached Tabs */
        .hero-search-card-container {
          position: relative;
          z-index: 25;
          width: 100%;
          max-width: 980px;
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
          background: transparent;
          color: rgba(255, 255, 255, 0.9);
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
          color: #0284c7;
          font-weight: 700;
          box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.06);
        }

        .hero-tab-btn:not(.active):hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }

        /* Pure White Search Card Bar */
        .hero-search-bar {
          background: #ffffff;
          border-radius: 0 16px 16px 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08);
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
          color: #4b5563;
          white-space: nowrap;
          padding-right: 4px;
        }

        /* Dropdown Pills */
        .search-field-pill {
          position: relative;
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          padding: 0 10px;
          height: 42px;
          flex: 1.2;
          min-width: 120px;
          transition: border-color 0.2s;
        }

        .search-field-pill:focus-within {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
        }

        .search-select {
          width: 100%;
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          padding-right: 18px;
        }

        .select-chevron {
          position: absolute;
          right: 10px;
          color: #f97316;
          pointer-events: none;
        }

        /* Price Input Groups */
        .search-price-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 130px;
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
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          padding: 0 8px;
          height: 42px;
          width: 100%;
          transition: all 0.2s;
        }

        .search-input-pill:focus-within {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
        }

        .currency-symbol {
          font-size: 0.72rem;
          font-weight: 700;
          color: #ea580c;
          margin-right: 4px;
        }

        .price-input {
          width: 100%;
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.85rem;
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
          padding: 0 26px;
          height: 42px;
          font-size: 0.92rem;
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

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .hero-search-bar {
            flex-wrap: wrap;
            gap: 10px;
          }
          .search-lead-label {
            width: 100%;
            margin-bottom: 2px;
          }
          .hero-carousel-dots {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .yamu-exact-hero {
            padding: 75px 1rem 1.5rem;
            min-height: auto;
          }
          .watermark-yamu-text {
            font-size: 4.8rem;
            letter-spacing: 0.08em;
          }
          .fleet-cutout-img {
            max-height: 220px;
          }
          .hero-search-bar {
            flex-direction: column;
            align-items: stretch;
            border-radius: 0 0 16px 16px;
            padding: 14px;
          }
          .search-price-group {
            width: 100%;
          }
          .hero-search-submit-btn {
            width: 100%;
            justify-content: center;
            margin-top: 4px;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
