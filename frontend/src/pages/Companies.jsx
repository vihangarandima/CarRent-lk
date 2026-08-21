import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import {
  Building2,
  MapPin,
  Car,
  Search,
  ArrowRight,
  CheckCircle,
  Star,
  ShieldCheck,
  Zap,
  Phone,
  SlidersHorizontal,
  Sparkles,
  Users,
  Award,
  ChevronRight,
  Layers,
  X,
  Compass,
} from "lucide-react";

// Image Imports for vehicle categories & hero background
import fleetsHeroBg from "../assets/images/fleets_hero_bg.jpg";
import bikeeImg from "../assets/images/bikee.jpg";
import threewheelerImg from "../assets/images/threewheeler.jpg";
import carImg from "../assets/images/car.jpg";
import vanImg from "../assets/images/van.jpg";
import premiumCarImg from "../assets/images/premium_car.png";
import miniVanImg from "../assets/images/mini_van.png";

const POPULAR_CITIES = [
  "All Cities",
  "Colombo",
  "Kandy",
  "Galle",
  "Negombo",
  "Bambalapitiya",
  "Polonnaruwa",
  "Gampaha",
];

const vehicleCategoryCards = [
  {
    id: "all",
    title: "All Fleets",
    subtitle: "All vehicle types",
    icon: <Building2 size={24} />,
    image: null,
  },
  {
    id: "car",
    title: "Cars & Sedans",
    subtitle: "Economical & Comfort",
    image: carImg,
  },
  {
    id: "suv",
    title: "SUVs & Luxury",
    subtitle: "Premium 4x4 & Offroad",
    image: premiumCarImg,
  },
  {
    id: "van",
    title: "Vans & Mini Vans",
    subtitle: "Group & Family Tours",
    image: vanImg,
  },
  {
    id: "threewheel",
    title: "Three-Wheelers",
    subtitle: "Quick City Rides",
    image: threewheelerImg,
  },
  {
    id: "bicycle",
    title: "Bicycles & Bikes",
    subtitle: "Eco & Scenic Travel",
    image: bikeeImg,
  },
];

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("vehicles"); // "vehicles", "rating", "newest", "name"
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/companies${search ? `?search=${encodeURIComponent(search)}` : ""}`
        );
        setCompanies(res.data);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [search]);

  // Overall platform statistics
  const totalCompanies = companies.length;
  const totalVehicles = companies.reduce(
    (acc, c) => acc + (c.vehicleCount || 0),
    0
  );
  const ratedCompanies = companies.filter((c) => c.rating && c.rating > 0);
  const averageRating =
    ratedCompanies.length > 0
      ? (
          ratedCompanies.reduce((acc, c) => acc + c.rating, 0) /
          ratedCompanies.length
        ).toFixed(1)
      : "5.0";

  // Filter & Sort companies
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((company) => {
        const matchSearch =
          !search ||
          company.companyName?.toLowerCase().includes(search.toLowerCase()) ||
          company.address?.toLowerCase().includes(search.toLowerCase()) ||
          company.description?.toLowerCase().includes(search.toLowerCase());

        const matchCity =
          selectedCity === "All Cities" ||
          company.address?.toLowerCase().includes(selectedCity.toLowerCase()) ||
          company.companyName?.toLowerCase().includes(selectedCity.toLowerCase());

        return matchSearch && matchCity;
      })
      .sort((a, b) => {
        if (sortBy === "vehicles") {
          return (b.vehicleCount || 0) - (a.vehicleCount || 0);
        }
        if (sortBy === "rating") {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === "name") {
          return (a.companyName || "").localeCompare(b.companyName || "");
        }
        return 0;
      });
  }, [companies, search, selectedCity, sortBy]);

  return (
    <div className="companies-page">
      {/* Radiant Modern Hero Section with Background Fleet Image */}
      <section className="companies-hero">
        <div
          className="hero-bg-image-layer"
          style={{ backgroundImage: `url(${fleetsHeroBg})` }}
        />
        <div className="hero-atmosphere-gradient" />
        <div className="hero-atmosphere-glow" />
        <div className="hero-grid-pattern" />

        <div className="companies-hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <ShieldCheck size={15} className="hero-badge-icon" />
              <span>VERIFIED RENTAL FLEETS • 100% INSURED</span>
            </div>

            <h1 className="hero-title">
              Rent from Sri Lanka's
              <span className="hero-highlight">trusted rental companies</span>
            </h1>

            <p className="hero-description">
              Every partner on Yamu is verified, background-checked, and insured.
              Browse their live fleets, compare vehicles, and book directly with
              zero middleman fees.
            </p>

            {/* Modern Search Bar */}
            <div className="companies-search-wrap">
              <div className="companies-search-bar">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by company name, city, or district..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => setSearch("")}
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => {}}
                >
                  <span>Search Fleets</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Live Stats */}
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-icon-wrap">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3>{totalCompanies}</h3>
                  <p>VERIFIED PARTNERS</p>
                </div>
              </div>

              <div className="stat-divider" />

              <div className="stat-item">
                <div className="stat-icon-wrap">
                  <Car size={20} />
                </div>
                <div>
                  <h3>{totalVehicles}</h3>
                  <p>VEHICLES ON ROAD</p>
                </div>
              </div>

              <div className="stat-divider" />

              <div className="stat-item">
                <div className="stat-icon-wrap gold">
                  <Star size={20} />
                </div>
                <div>
                  <h3>{averageRating}</h3>
                  <p>AVERAGE RATING</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right: Vehicle Type Quick Switcher */}
          <div className="hero-filters-panel">
            <div className="vehicle-type-section">
              <div className="vehicle-type-header">
                <div className="panel-title-wrap">
                  <Layers size={18} className="panel-icon" />
                  <div>
                    <h2>Pick a vehicle category</h2>
                    <p>Filter fleets by what they have on the road</p>
                  </div>
                </div>
              </div>

              <div className="vehicle-type-grid">
                {vehicleCategoryCards.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className={`vehicle-type-card ${
                      selectedType === type.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedType(type.id);
                      if (type.id !== "all") {
                        navigate(`/vehicles?type=${type.id}`);
                      }
                    }}
                  >
                    <div className="vehicle-type-img-wrap">
                      {type.image ? (
                        <img
                          src={type.image}
                          alt={type.title}
                          className="vehicle-type-thumb"
                        />
                      ) : (
                        <div className="vehicle-type-placeholder">
                          {type.icon}
                        </div>
                      )}
                    </div>
                    <div className="vehicle-type-info">
                      <span className="type-title">{type.title}</span>
                      <span className="type-sub">{type.subtitle}</span>
                    </div>
                    <ChevronRight size={14} className="type-arrow" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Companies Listing Section */}
      <section className="companies-grid-section">
        <div className="companies-grid-inner">
          {/* Filter & Sorting Controls Header */}
          <div className="listing-controls-header">
            <div className="controls-left">
              <h2>Verified Rental Companies</h2>
              <p>
                Showing <strong>{filteredCompanies.length}</strong> rental{" "}
                {filteredCompanies.length === 1 ? "fleet" : "fleets"} across Sri Lanka
              </p>
            </div>

            <div className="controls-right">
              {/* Sort by Dropdown */}
              <div className="sort-dropdown-wrap">
                <SlidersHorizontal size={15} />
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="vehicles">Most Vehicles First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest Partners</option>
                  <option value="name">Alphabetical (A - Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick City Filter Chips */}
          <div className="city-filter-chips">
            <span className="city-filter-label">
              <Compass size={14} /> Popular Destinations:
            </span>
            <div className="chips-list">
              {POPULAR_CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  className={`city-chip ${
                    selectedCity === city ? "active" : ""
                  }`}
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Company Cards Grid */}
          {loading ? (
            <div className="loading-state">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="company-card-skeleton" />
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <Building2 size={42} />
              </div>
              <h3>No rental companies found</h3>
              <p>
                {search || selectedCity !== "All Cities"
                  ? "Try resetting your search filters or selecting a different city."
                  : "Be the first to register your rental company on Yamu Car Rentals."}
              </p>
              <div className="empty-actions">
                {(search || selectedCity !== "All Cities") && (
                  <button
                    type="button"
                    className="btn-clear-filters"
                    onClick={() => {
                      setSearch("");
                      setSelectedCity("All Cities");
                    }}
                  >
                    Reset All Filters
                  </button>
                )}
                <Link
                  to="/register?role=company"
                  className="btn-register-company"
                >
                  <Building2 size={16} />
                  <span>Register Your Company →</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="company-cards-grid">
              {filteredCompanies.map((company) => (
                <div
                  key={company._id}
                  className="company-card"
                  onClick={() => navigate(`/companies/${company._id}`)}
                >
                  {/* Card Cover Banner */}
                  <div className="company-card-cover">
                    <div className="cover-gradient" />
                    <div className="cover-badge-row">
                      <div className="company-verified-pill">
                        <CheckCircle size={13} className="check-icon" />
                        <span>Verified Partner</span>
                      </div>
                      <div className="company-rating-pill">
                        <Star size={13} className="star-icon" />
                        <span>
                          {company.rating && company.rating > 0
                            ? company.rating.toFixed(1)
                            : "5.0"}
                        </span>
                        {company.reviewCount ? (
                          <small>({company.reviewCount})</small>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Card Main Body */}
                  <div className="company-card-body">
                    {/* Floating Logo */}
                    <div className="company-logo-wrap">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.companyName}
                          className="company-logo-img"
                        />
                      ) : (
                        <div className="company-logo-placeholder">
                          <Building2 size={24} />
                        </div>
                      )}
                    </div>

                    <div className="company-title-block">
                      <h3 className="company-name">{company.companyName}</h3>
                      {company.address ? (
                        <span className="company-location">
                          <MapPin size={13} />
                          <span>{company.address}</span>
                        </span>
                      ) : (
                        <span className="company-location">
                          <MapPin size={13} />
                          <span>Sri Lanka</span>
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="company-desc">
                      {company.description
                        ? company.description.slice(0, 110) +
                          (company.description.length > 110 ? "..." : "")
                        : "A verified car rental partner offering reliable, well-maintained fleets for self-drive and tours across Sri Lanka."}
                    </p>

                    {/* Highlights & Fleet Badges */}
                    <div className="company-perks-row">
                      <div className="perk-pill fleet-pill">
                        <Car size={13} />
                        <span>
                          <strong>{company.vehicleCount || 0}</strong>{" "}
                          {company.vehicleCount === 1 ? "Vehicle" : "Vehicles"}
                        </span>
                      </div>

                      <div className="perk-pill">
                        <ShieldCheck size={13} />
                        <span>Insured Fleet</span>
                      </div>

                      <div className="perk-pill">
                        <Zap size={13} />
                        <span>Instant Booking</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer CTA */}
                  <div className="company-card-footer">
                    <div className="footer-btn">
                      <span>View Live Fleet ({company.vehicleCount || 0} cars)</span>
                      <ArrowRight size={16} className="arrow-icon" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="companies-trust-section">
        <div className="trust-inner">
          <div className="trust-header">
            <span className="trust-badge">WHY RENT FROM REGISTERED FLEETS?</span>
            <h2>Book with 100% confidence & peace of mind</h2>
            <p>
              We inspect fleet conditions, insurance papers, and partner ratings so
              your road trip across Sri Lanka goes seamlessly.
            </p>
          </div>

          <div className="trust-grid">
            <div className="trust-card">
              <div className="trust-icon-box orange">
                <ShieldCheck size={28} />
              </div>
              <h3>100% Verified Partners</h3>
              <p>
                Every rental company undergoes strict verification of their
                business registration, insurance policies, and service history.
              </p>
            </div>

            <div className="trust-card">
              <div className="trust-icon-box blue">
                <Award size={28} />
              </div>
              <h3>Zero Hidden Middleman Fees</h3>
              <p>
                Get direct rental rates straight from the company. Transparent
                daily packages with zero surprise markups.
              </p>
            </div>

            <div className="trust-card">
              <div className="trust-icon-box green">
                <Phone size={28} />
              </div>
              <h3>Direct Host & Roadside Support</h3>
              <p>
                Enjoy direct 24/7 communication with your rental company manager
                for prompt roadside support anywhere on the island.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Host / Company Registration CTA Banner */}
      <section className="company-register-cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <div className="cta-badge">
              <Sparkles size={14} />
              <span>GROW YOUR RENTAL BUSINESS</span>
            </div>
            <h2>Are you a Car Rental Company in Sri Lanka?</h2>
            <p>
              List your fleet on Yamu Car Rentals. Reach thousands of local and
              international tourists, manage live bookings, and scale your
              business with our automated platform.
            </p>
            <div className="cta-btn-row">
              <Link
                to="/register?role=company"
                className="cta-primary-btn"
              >
                <Building2 size={18} />
                <span>Register Your Fleet for Free</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/why-us" className="cta-secondary-btn">
                <span>Learn How Yamu Works</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* Master Companies Page Styling */
        .companies-page {
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #fcfbf9;
          color: #0f172a;
          overflow-x: hidden;
        }

        /* Hero Section */
        .companies-hero {
          position: relative;
          background: #090d16;
          padding: 135px 5% 90px;
          color: #ffffff;
          overflow: hidden;
          min-height: 590px;
          display: flex;
          align-items: center;
        }

        .hero-bg-image-layer {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center 30%;
          background-repeat: no-repeat;
          z-index: 0;
          transform: scale(1.02);
        }

        .hero-atmosphere-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(9, 13, 22, 0.88) 0%,
            rgba(18, 12, 6, 0.76) 35%,
            rgba(234, 88, 12, 0.58) 70%,
            rgba(9, 13, 22, 0.90) 100%
          );
          z-index: 1;
        }

        .hero-atmosphere-glow {
          position: absolute;
          top: -60px;
          left: 25%;
          width: 800px;
          height: 650px;
          background: radial-gradient(
            circle,
            rgba(255, 136, 0, 0.32) 0%,
            rgba(249, 115, 22, 0.15) 45%,
            transparent 75%
          );
          filter: blur(80px);
          pointer-events: none;
          z-index: 2;
        }

        .hero-grid-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
          opacity: 0.5;
          z-index: 2;
        }

        .companies-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 3.5rem;
        }

        .hero-content {
          flex: 1.15;
          max-width: 650px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(249, 115, 22, 0.12);
          border: 1px solid rgba(249, 115, 22, 0.35);
          color: #ff9d54;
          padding: 7px 16px;
          border-radius: 100px;
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 16px rgba(249, 115, 22, 0.12);
        }

        .hero-badge-icon {
          color: #f97316;
        }

        .hero-title {
          font-size: clamp(2.4rem, 4.5vw, 3.6rem);
          font-weight: 900;
          line-height: 1.12;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin: 0 0 1.25rem;
        }

        .hero-highlight {
          display: block;
          background: linear-gradient(135deg, #ff9e42 0%, #f97316 50%, #ea580c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-description {
          font-size: 1.05rem;
          line-height: 1.65;
          color: #94a3b8;
          margin: 0 0 2.25rem;
          max-width: 560px;
        }

        /* Search Bar */
        .companies-search-wrap {
          margin-bottom: 2.5rem;
          max-width: 580px;
        }

        .companies-search-bar {
          position: relative;
          display: flex;
          align-items: center;
          background: #ffffff;
          border-radius: 100px;
          padding: 6px 8px 6px 20px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .companies-search-bar .search-icon {
          color: #94a3b8;
          flex-shrink: 0;
          margin-right: 12px;
        }

        .companies-search-bar input {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 0.95rem;
          font-weight: 500;
          color: #0f172a;
          outline: none;
          font-family: inherit;
        }

        .companies-search-bar input::placeholder {
          color: #94a3b8;
        }

        .search-clear-btn {
          border: none;
          background: #f1f5f9;
          color: #64748b;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-right: 8px;
          transition: all 0.2s;
        }
        .search-clear-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .search-btn {
          background: linear-gradient(135deg, #ff8800 0%, #f97316 50%, #ea580c 100%);
          color: #ffffff;
          border: none;
          border-radius: 100px;
          padding: 12px 24px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          transition: all 0.25s ease;
          box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
          font-family: inherit;
        }

        .search-btn:hover {
          background: linear-gradient(135deg, #ff9500 0%, #ea580c 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.55);
        }

        /* Stats Row */
        .hero-stats {
          display: flex;
          align-items: center;
          gap: 1.75rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(10, 15, 29, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(249, 115, 22, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f97316;
        }

        .stat-icon-wrap.gold {
          color: #fbbf24;
          background: rgba(251, 191, 36, 0.15);
          border-color: rgba(251, 191, 36, 0.4);
        }

        .stat-item h3 {
          font-size: 1.45rem;
          font-weight: 900;
          color: #ffffff;
          margin: 0;
          line-height: 1.1;
        }

        .stat-item p {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #cbd5e1;
          margin: 3px 0 0;
        }

        .stat-divider {
          width: 1px;
          height: 36px;
          background: rgba(255, 255, 255, 0.18);
        }

        /* Hero Right Panel */
        .hero-filters-panel {
          flex: 0.95;
          max-width: 480px;
        }

        .vehicle-type-section {
          background: rgba(10, 15, 29, 0.72);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 28px;
          padding: 1.75rem;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(249, 115, 22, 0.2);
        }

        .panel-title-wrap {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 1.25rem;
        }

        .panel-icon {
          color: #f97316;
          margin-top: 3px;
        }

        .panel-title-wrap h2 {
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 2px;
        }

        .panel-title-wrap p {
          font-size: 0.82rem;
          color: #94a3b8;
          margin: 0;
        }

        .vehicle-type-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vehicle-type-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
          font-family: inherit;
        }

        .vehicle-type-card:hover,
        .vehicle-type-card.active {
          background: rgba(249, 115, 22, 0.2);
          border-color: rgba(249, 115, 22, 0.6);
          transform: translateX(4px);
        }

        .vehicle-type-img-wrap {
          width: 48px;
          height: 38px;
          border-radius: 10px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .vehicle-type-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vehicle-type-placeholder {
          color: #f97316;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vehicle-type-info {
          flex: 1;
          min-width: 0;
        }

        .type-title {
          display: block;
          font-size: 0.88rem;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .type-sub {
          display: block;
          font-size: 0.74rem;
          color: #94a3b8;
        }

        .type-arrow {
          color: rgba(255, 255, 255, 0.4);
          transition: transform 0.2s;
        }

        .vehicle-type-card:hover .type-arrow {
          color: #f97316;
          transform: translateX(3px);
        }

        /* Main Listing Section */
        .companies-grid-section {
          padding: 4.5rem 5% 5.5rem;
          background: #fcfbf9;
        }

        .companies-grid-inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        .listing-controls-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 1.5rem;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .controls-left h2 {
          font-size: 1.85rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }

        .controls-left p {
          font-size: 0.95rem;
          color: #64748b;
          margin: 0;
        }

        .sort-dropdown-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 100px;
          padding: 8px 16px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .sort-select {
          border: none;
          background: transparent;
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          font-family: inherit;
        }

        /* City Filter Chips */
        .city-filter-chips {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 2.5rem;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: thin;
        }

        .city-filter-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #64748b;
          white-space: nowrap;
        }

        .chips-list {
          display: flex;
          gap: 8px;
          flex-wrap: nowrap;
        }

        .city-chip {
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          padding: 7px 16px;
          border-radius: 100px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .city-chip:hover {
          border-color: #cbd5e1;
          color: #0f172a;
          background: #f8fafc;
        }

        .city-chip.active {
          background: #0f172a;
          border-color: #0f172a;
          color: #ffffff;
          font-weight: 700;
        }

        /* Company Cards Grid */
        .company-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 2rem;
        }

        .company-card {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .company-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 0 0 1.5px rgba(249, 115, 22, 0.3);
        }

        /* Card Cover Banner */
        .company-card-cover {
          position: relative;
          height: 100px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          padding: 14px 18px;
        }

        .cover-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.25) 0%, transparent 60%);
          pointer-events: none;
        }

        .cover-badge-row {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .company-verified-pill {
          background: rgba(16, 185, 129, 0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .company-rating-pill {
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          font-size: 0.74rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .company-rating-pill .star-icon {
          color: #fbbf24;
          fill: #fbbf24;
        }

        .company-rating-pill small {
          color: #94a3b8;
          font-weight: 500;
        }

        /* Card Body */
        .company-card-body {
          padding: 0 1.5rem 1.25rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .company-logo-wrap {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: #ffffff;
          border: 3.5px solid #ffffff;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: -34px;
          margin-bottom: 0.85rem;
          position: relative;
          z-index: 3;
        }

        .company-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .company-logo-placeholder {
          width: 100%;
          height: 100%;
          background: #fff7ed;
          color: #ea580c;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .company-title-block {
          margin-bottom: 0.85rem;
        }

        .company-name {
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.01em;
        }

        .company-location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .company-desc {
          font-size: 0.86rem;
          line-height: 1.55;
          color: #475569;
          margin: 0 0 1.25rem;
          flex: 1;
        }

        /* Perks row */
        .company-perks-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: auto;
        }

        .perk-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          background: #f1f5f9;
          color: #475569;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 8px;
        }

        .perk-pill.fleet-pill {
          background: #fff7ed;
          color: #ea580c;
          border: 1px solid #ffedd5;
          font-weight: 700;
        }

        /* Card Footer */
        .company-card-footer {
          padding: 0 1.5rem 1.5rem;
        }

        .footer-btn {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 11px 16px;
          font-size: 0.86rem;
          font-weight: 700;
          color: #0f172a;
          transition: all 0.2s ease;
        }

        .company-card:hover .footer-btn {
          background: linear-gradient(135deg, #ff8800 0%, #f97316 50%, #ea580c 100%);
          color: #ffffff;
          border-color: #f97316;
          box-shadow: 0 6px 16px rgba(249, 115, 22, 0.35);
        }

        .company-card:hover .arrow-icon {
          transform: translateX(4px);
        }

        .arrow-icon {
          transition: transform 0.2s;
        }

        /* Skeletons */
        .loading-state {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 2rem;
        }

        .company-card-skeleton {
          height: 360px;
          border-radius: 24px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Empty state */
        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
          background: #ffffff;
          border-radius: 28px;
          border: 1px solid #e2e8f0;
          max-width: 650px;
          margin: 2rem auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empty-icon-wrap {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #fff7ed;
          color: #f97316;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .empty-state h3 {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px;
        }

        .empty-state p {
          color: #64748b;
          font-size: 0.92rem;
          max-width: 420px;
          margin: 0 0 1.75rem;
          line-height: 1.5;
        }

        .empty-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-clear-filters {
          background: #f1f5f9;
          color: #334155;
          border: none;
          padding: 10px 20px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.86rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-clear-filters:hover { background: #e2e8f0; }

        .btn-register-company {
          background: #f97316;
          color: #ffffff;
          padding: 10px 22px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.86rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
        }
        .btn-register-company:hover { background: #ea580c; }

        /* Trust Section */
        .companies-trust-section {
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          padding: 5rem 5%;
        }

        .trust-inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        .trust-header {
          text-align: center;
          max-width: 650px;
          margin: 0 auto 3.5rem;
        }

        .trust-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #ea580c;
          background: #fff7ed;
          padding: 4px 12px;
          border-radius: 100px;
          margin-bottom: 0.75rem;
        }

        .trust-header h2 {
          font-size: 2rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 0.75rem;
          letter-spacing: -0.02em;
        }

        .trust-header p {
          font-size: 0.95rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        .trust-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .trust-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 2rem;
          transition: all 0.2s;
        }

        .trust-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.05);
          background: #ffffff;
        }

        .trust-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .trust-icon-box.orange { background: #fff7ed; color: #ea580c; }
        .trust-icon-box.blue { background: #eff6ff; color: #2563eb; }
        .trust-icon-box.green { background: #f0fdf4; color: #16a34a; }

        .trust-card h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.5rem;
        }

        .trust-card p {
          font-size: 0.88rem;
          line-height: 1.6;
          color: #64748b;
          margin: 0;
        }

        /* Host CTA Section */
        .company-register-cta-section {
          padding: 5rem 5%;
          background: #fcfbf9;
        }

        .cta-container {
          max-width: 1280px;
          margin: 0 auto;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 32px;
          padding: 4rem 3.5rem;
          color: #ffffff;
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25);
        }

        .cta-container::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
        }

        .cta-content {
          position: relative;
          z-index: 2;
          max-width: 680px;
        }

        .cta-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(249, 115, 22, 0.15);
          border: 1px solid rgba(249, 115, 22, 0.4);
          color: #ff9d54;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          margin-bottom: 1.25rem;
        }

        .cta-content h2 {
          font-size: clamp(2rem, 3.5vw, 2.75rem);
          font-weight: 900;
          line-height: 1.15;
          margin: 0 0 1rem;
          letter-spacing: -0.02em;
          color: #ffffff !important;
        }

        .cta-content p {
          font-size: 1rem;
          line-height: 1.65;
          color: #94a3b8;
          margin: 0 0 2rem;
        }

        .cta-btn-row {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .cta-primary-btn {
          background: linear-gradient(135deg, #ff8800 0%, #f97316 50%, #ea580c 100%);
          color: #ffffff;
          padding: 14px 28px;
          border-radius: 100px;
          font-size: 0.95rem;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.25s ease;
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
        }

        .cta-primary-btn:hover {
          background: linear-gradient(135deg, #ff9500 0%, #ea580c 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(249, 115, 22, 0.55);
        }

        .cta-secondary-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 14px 26px;
          border-radius: 100px;
          font-size: 0.95rem;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: all 0.2s;
        }

        .cta-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1080px) {
          .companies-hero-inner {
            flex-direction: column;
            gap: 3rem;
          }
          .hero-content {
            max-width: 100%;
          }
          .hero-filters-panel {
            max-width: 100%;
            width: 100%;
          }
          .trust-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .companies-hero {
            padding: 100px 5% 60px;
          }
          .companies-search-bar {
            flex-direction: column;
            border-radius: 20px;
            padding: 12px;
            gap: 8px;
          }
          .companies-search-bar input {
            padding: 6px;
          }
          .search-btn {
            width: 100%;
            justify-content: center;
          }
          .hero-stats {
            flex-wrap: wrap;
            gap: 1.25rem;
          }
          .stat-divider {
            display: none;
          }
          .company-cards-grid {
            grid-template-columns: 1fr;
          }
          .cta-container {
            padding: 2.5rem 1.5rem;
          }
          .cta-btn-row {
            flex-direction: column;
          }
          .cta-primary-btn, .cta-secondary-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Companies;
