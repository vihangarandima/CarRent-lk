import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  MapPin,
  Calendar,
  Search,
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

  // Scroll animations for dome (lightray)
  const { scrollY } = useScroll();
  const domeScale = useTransform(scrollY, [0, 600], [1, 2.5]);
  const domeOpacity = useTransform(scrollY, [0, 600], [1, 0.6]);

  // Car drives horizontally to the right when scrolling down
  const carDriveX = useTransform(scrollY, [0, 800], [-1000, 1500]);

  return (
    <section className="hero-wrapper">
      {/* Background Dome (Moon Lightray) */}
      <motion.div
        className="dome-bg"
        style={{
          scale: domeScale,
          opacity: domeOpacity,
          x: "-50%"
        }}
      />

      <div className="hero-main">
        {/* Text Overlay centered high up */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="hero-content"
        >
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Sri Lanka's #1 car sharing marketplace.
          </div>

          <h1 className="hero-title">
            Find Your Perfect Car, <br />
            Drive Your <span className="dreams-text">Dreams.</span>
          </h1>

          <p className="hero-subtitle">
            Rent verified vehicles from trusted hosts across the island — or
            list your own car and start earning in minutes.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate("/vehicles")}>
              Browse Cars <ArrowRight size={18} />
            </button>
            <button className="btn-secondary" onClick={() => navigate("/list-my-car")}>
              List Your Vehicle
            </button>
          </div>
        </motion.div>
      </div>

      {/* Search Card & Car standing on it */}
      <motion.div
        className="search-card-wrapper"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="car-on-card-wrap">
          <motion.div
            className="car-on-card"
            style={{ x: carDriveX }}
          >
            {/* Side view transparent Porsche */}

            <img
              src="/assets/images/car_1.png"
              alt="Side View Luxury Car"
              className="car-side-img"
            />
          </motion.div>
        </div>

        <div className="search-card">
          <div className="search-field">
            <label>Location</label>
            <div className="input-group">
              <MapPin size={20} className="input-icon" />
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
            <div className="input-group">
              <Calendar size={20} className="input-icon" />
              <input
                type="date"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>
          </div>

          <div className="search-field">
            <label>Return Date</label>
            <div className="input-group">
              <Calendar size={20} className="input-icon" />
              <input
                type="date"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
              />
            </div>
          </div>

          <button className="btn-search" onClick={handleSearch}>
            <Search size={20} />
            Search Cars
          </button>
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@1,600;1,700&display=swap');

        .hero-wrapper {
          background-color: #FDF8F2; /* Soft warm cream */
          height: 100vh;
          height: 130dvh;
          min-height: 750px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
          color: #111111;
          display: flex;
          flex-direction: column;
        }

        /* Background Dome/Halo (Moon Lightray) */
        .dome-bg {
          position: absolute;
          top: -20%;
          left: 50%;
          width: 90vw;
          height: 90vw;
          max-width: 1400px;
          max-height: 1400px;
          background: radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 248, 235, 0.95) 20%, rgba(255, 235, 190, 0.3) 50%, rgba(253, 248, 242, 0) 75%);
          border-radius: 50%;
          box-shadow: 0 0 160px 120px rgba(255, 255, 255, 0.9);
          z-index: 1;
          pointer-events: none;
          transform-origin: center center;
        }

        /* Main Content */
        .hero-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          position: relative;
          z-index: 30; /* Higher than car so text sits in front */
          padding-top: 8rem;
          padding-bottom: 2rem;
          text-align: center;
          pointer-events: none; /* Prevents container from blocking clicks to the card below */
        }

        /* Text Overlay */
        .hero-content {
          position: relative;
          z-index: 30;
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: auto; /* Re-enable clicks for text and buttons */
        }

        .hero-badge {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          color: #111111;
          padding: 0.4rem 1rem 0.4rem 0.5rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.05);
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: #FF8A00;
          border-radius: 50%;
          display: block;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1rem;
          max-width: 900px;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 40px rgba(253, 248, 242, 0.9), 0 0 20px rgba(253, 248, 242, 0.8), 0 0 10px rgba(255, 255, 255, 1);
        }

        .dreams-text {
          font-family: 'Playfair Display', serif;
          color: #FF8A00;
          font-style: italic;
          font-weight: 700;
        }

        .hero-subtitle {
          font-size: 1.05rem;
          color: #333333;
          font-weight: 500;
          max-width: 650px;
          margin: 0 auto 1.5rem;
          line-height: 1.6;
          text-shadow: 0 4px 20px rgba(253, 248, 242, 0.9), 0 0 10px rgba(255, 255, 255, 1);
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .btn-primary {
          background: #FF8A00;
          color: white;
          padding: 0.8rem 1.8rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(255, 138, 0, 0.3);
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .btn-primary:hover {
          background: #FF9100;
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(255, 138, 0, 0.4);
        }

        .btn-secondary {
          background: rgba(253, 248, 242, 0.8);
          backdrop-filter: blur(4px);
          color: #111111;
          padding: 0.8rem 1.8rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 1rem;
          border: 2px solid #111111;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #111111;
          color: white;
        }

        /* Floating Search Card & Car Wrapper */
        .search-card-wrapper {
          position: absolute;
          bottom: 5rem;
          left: 0;
          right: 0;
          z-index: 20;
          padding: 0 5%;
          display: flex;
          justify-content: center;
        }

        /* Car standing on top of the search card */
        .car-on-card-wrap {
          position: absolute;
          bottom: 100%;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          pointer-events: none;
          margin-bottom: -45px; /* Pull car down so tires rest beautifully on the card */
          z-index: 21;
        }

        .car-on-card {
          width: 850px; /* Big side view car */
          max-width: 120vw; /* Allow it to overflow the screen slightly on mobile */
          will-change: transform;
        }

        .car-side-img {
          position: relative;
          top: 270px;
          width: 100%;
          height: auto;
          filter: drop-shadow(-10px 30px 15px rgba(0,0,0,0.3)); /* Fake ground shadow */
          transform: scaleX(-1); /* Flips the left-facing car so it faces right and drives right */
        }

        .search-card {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 24px 50px rgba(0,0,0,0.06);
          width: 100%;
          max-width: 1100px;
          flex-wrap: wrap;
          border: 1px solid rgba(0,0,0,0.03);
          position: relative;
          z-index: 20;
        }

        .search-field {
          flex: 1;
          min-width: 180px;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding: 0.25rem 1rem;
          border-right: 1px solid #EEEEEE;
        }
        
        .search-field:nth-last-child(2) {
          border-right: none;
        }

        .search-field label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #888888;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
        }

        .input-group input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          font-size: 0.95rem;
          color: #111111;
          font-weight: 600;
          font-family: inherit;
        }
        
        .input-group input::placeholder {
          color: #AAAAAA;
          font-weight: 500;
        }

        .input-group input[type="date"] {
          color: #111111;
          text-transform: uppercase;
          font-size: 0.9rem;
        }
        
        .input-group input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .input-icon {
          color: #FF8A00;
          flex-shrink: 0;
        }

        .btn-search {
          background: #FF8A00;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 1rem 2rem;
          font-weight: 700;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(255, 138, 0, 0.3);
          transition: transform 0.2s, background 0.2s;
          height: 100%;
          min-height: 56px;
        }

        .btn-search:hover {
          background: #FF9100;
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-wrapper {
            height: auto;
            min-height: 100vh;
          }
          .hero-main {
            padding-bottom: 12rem;
          }
          .search-card {
            border-radius: 16px;
          }
          .car-on-card {
            width: 700px;
          }
        }

        @media (max-width: 900px) {
          .search-card {
            flex-direction: column;
            gap: 1rem;
          }
          .search-field {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #EEEEEE;
            padding: 0 0 0.75rem 0;
          }
          .search-field:nth-last-child(2) {
            border-bottom: none;
            padding-bottom: 0;
          }
          .btn-search {
            width: 100%;
            justify-content: center;
            min-height: 50px;
            margin-top: 0.5rem;
          }
          .car-on-card {
            width: 550px;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: clamp(2.2rem, 7vw, 3rem);
          }
          .hero-buttons {
            flex-direction: column;
            width: 100%;
            max-width: 300px;
          }
          .btn-primary, .btn-secondary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;

