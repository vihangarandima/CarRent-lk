import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Search,
  Shield,
  Star,
  TrendingDown,
  ArrowRight,
} from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    navigate(`/vehicles${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <section className="hero mesh-bg">
      <div className="container hero-container">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero-badge">
            <span className="badge-dot" />
            <span>Sri Lanka's #1 car sharing marketplace</span>
          </div>

          <h1 className="hero-title">
            Find Your Perfect Car, <br />
            Drive Your <span className="orange-text">Dreams.</span>
          </h1>

          <p className="hero-subtitle">
            Rent verified vehicles from trusted hosts across the island — or
            list your own car and start earning in minutes.
          </p>

          <div className="hero-actions">
            <button className="btn-find" onClick={() => navigate("/vehicles")}>
              Browse Cars
              <ArrowRight size={18} />
            </button>
            <button
              className="btn-list"
              onClick={() => navigate("/list-my-car")}
            >
              List Your Vehicle
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <Shield size={18} />
              <div>
                <strong>10,000+</strong>
                <span>Cars Listed</span>
              </div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <Star size={18} />
              <div>
                <strong>4.9/5</strong>
                <span>Trusted Hosts</span>
              </div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <TrendingDown size={18} />
              <div>
                <strong>Best</strong>
                <span>Prices</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero-image-wrap">
            <div className="hero-spotlight" />
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200"
              alt="Premium cars available for rent"
              className="hero-car-img"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="hero-search-wrap container"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hero-search-card">
          <div className="search-tabs">
            <button className="search-tab active">Search Cars</button>
            <button className="search-tab" type="button">
              Body Type
            </button>
            <button className="search-tab" type="button">
              Price Range
            </button>
          </div>

          <div className="search-fields">
            <div className="search-field">
              <label>Location</label>
              <div className="search-input-wrap">
                <MapPin size={18} className="field-icon" />
                <input
                  type="text"
                  placeholder="Colombo, Kandy, Galle..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="search-field">
              <label>Pick-up Date</label>
              <div className="search-input-wrap">
                <Calendar size={18} className="field-icon" />
                <input
                  type="date"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                />
              </div>
            </div>

            <div className="search-field">
              <label>Return Date</label>
              <div className="search-input-wrap">
                <Calendar size={18} className="field-icon" />
                <input
                  type="date"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                />
              </div>
            </div>

            <button className="search-submit" onClick={handleSearch}>
              <Search size={20} />
              Search Cars
            </button>
          </div>
        </div>
      </motion.div>

      <style>{`
        .hero {
          padding: 3rem 0 0;
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #fff9f0 0%, #fff2e4 55%, #ffffff 100%);
        }

        .hero-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 3rem;
          padding-bottom: 2rem;
          position: relative;
          z-index: 2;
        }

        .hero-content {
          flex: 1;
          max-width: 580px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.45rem 1rem 0.45rem 0.75rem;
          background: var(--primary-soft);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: var(--radius-pill);
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--primary-dark);
          margin-bottom: 1.75rem;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          animation: pulse-glow 2s infinite;
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 5.5vw, 4rem);
          font-weight: 800;
          color: var(--text);
          line-height: 1.08;
          letter-spacing: -0.03em;
          margin-bottom: 1.25rem;
        }

        .orange-text {
          background: var(--grad-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: italic;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--text-muted);
          line-height: 1.75;
          margin-bottom: 2rem;
          max-width: 520px;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }

        .btn-find {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--grad-primary);
          color: white;
          padding: 0.95rem 2rem;
          border-radius: var(--radius-pill);
          font-weight: 700;
          font-size: 1rem;
          box-shadow: 0 8px 28px var(--primary-glow);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          cursor: pointer;
        }

        .btn-find:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 36px rgba(249, 115, 22, 0.45);
        }

        .btn-list {
          background: white;
          color: var(--text);
          padding: 0.95rem 2rem;
          border-radius: var(--radius-pill);
          font-weight: 700;
          font-size: 1rem;
          border: 2px solid var(--border);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .btn-list:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--primary-soft);
          transform: translateY(-2px);
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .stat-item svg {
          color: var(--primary);
          flex-shrink: 0;
        }

        .stat-item strong {
          display: block;
          font-size: 1rem;
          font-weight: 800;
          color: var(--text);
          line-height: 1.2;
        }

        .stat-item span {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .stat-divider {
          width: 1px;
          height: 36px;
          background: var(--border);
        }

        .hero-visual {
          flex: 1.2;
          position: relative;
        }

        .hero-image-wrap {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 420px;
        }

        .hero-spotlight {
          position: absolute;
          width: 90%;
          height: 90%;
          background: radial-gradient(
            ellipse at center,
            rgba(249, 115, 22, 0.15) 0%,
            rgba(249, 115, 22, 0.05) 40%,
            transparent 70%
          );
          border-radius: 50%;
          z-index: 0;
        }

        .hero-car-img {
          width: 110%;
          max-width: 640px;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 30px 60px rgba(15, 23, 42, 0.12));
          animation: float 6s ease-in-out infinite;
        }

        .hero-search-wrap {
          position: relative;
          z-index: 10;
          margin-top: 2.5rem;
          padding-bottom: 4rem;
        }

        .hero-search-card {
          background: white;
          border-radius: var(--radius-xl);
          padding: 2rem 2rem 2.25rem;
          box-shadow: 0 26px 70px rgba(15, 23, 42, 0.12);
          border: 1px solid var(--border);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hero-search-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.14);
        }

        .search-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .search-tabs::-webkit-scrollbar {
          display: none;
        }

        .search-tab {
          padding: 0.5rem 1rem;
          border-radius: var(--radius-pill);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
        }

        .search-tab.active {
          background: var(--primary-soft);
          color: var(--primary);
        }

        .search-tab:hover:not(.active) {
          color: var(--text);
          background: var(--surface-hover);
        }

        .search-fields {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr auto;
          gap: 1rem;
          align-items: end;
        }

        .search-field label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .search-input-wrap {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1rem;
          transition: all 0.2s ease;
        }

        .search-input-wrap:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
          background: white;
        }

        .field-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        .search-input-wrap input {
          border: none;
          background: transparent;
          outline: none;
          font-family: inherit;
          font-size: 0.95rem;
          color: var(--text);
          width: 100%;
        }

        .search-input-wrap input::placeholder {
          color: var(--text-hint);
        }

        .search-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: var(--grad-primary);
          color: white;
          padding: 0.95rem 1.75rem;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px var(--primary-glow);
          white-space: nowrap;
          height: 52px;
        }

        .search-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(249, 115, 22, 0.4);
        }

        @media (max-width: 1100px) {
          .search-fields {
            grid-template-columns: 1fr 1fr;
          }
          .search-submit {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 1024px) {
          .hero-container {
            flex-direction: column;
            text-align: center;
          }
          .hero-content {
            max-width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-subtitle {
            max-width: 90%;
          }
          .hero-actions {
            justify-content: center;
          }
          .hero-stats {
            justify-content: center;
          }
          .hero-visual {
            width: 100%;
            margin-top: 1rem;
          }
          .hero-car-img {
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .hero {
            padding-top: 2rem;
          }
          .search-fields {
            grid-template-columns: 1fr;
          }
          .hero-actions {
            flex-direction: column;
            width: 100%;
          }
          .btn-find,
          .btn-list {
            width: 100%;
            justify-content: center;
          }
          .hero-stats {
            flex-direction: column;
            gap: 1rem;
          }
          .stat-divider {
            display: none;
          }
          .hero-search-card {
            padding: 1.25rem;
          }
          .search-tabs {
            overflow-x: auto;
            flex-wrap: nowrap;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
