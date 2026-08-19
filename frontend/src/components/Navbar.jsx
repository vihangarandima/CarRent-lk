import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
    return undefined;
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const listTarget =
    user?.role === "company"
      ? "/company-list-vehicle"
      : user?.role === "owner"
      ? "/list-my-car"
      : "/choose-listing-type";

  const mode = localStorage.getItem('appMode') || 'hosting';
  const isTraveling = mode === 'traveling';

  const profileTarget =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "company" && !isTraveling
      ? "/company-dashboard"
      : "/profile";

  const profileLabel =
    user?.role === "admin"
      ? "Admin Portal"
      : user?.role === "company" && !isTraveling
      ? "Company Dashboard"
      : "My Profile";

  const listLabel = 
    user?.role === "renter" ? "List Your Car" : "List Car";

  return (
    <>
      <nav className={`hero-nav ${scrolled ? "scrolled" : ""} ${location.pathname === '/' && !scrolled ? "on-dark" : ""}`}>
        <Link to="/" className="nav-logo">
          <img src={logo} alt="Yamu Car Rentals" className="nav-logo-img" />
          <span className="brand-yamu">Yamu</span>
          <span className="brand-orange">&nbsp;Car Rentals</span>
        </Link>

        <div className="nav-links hidden-mobile">
          <Link to="/vehicles">Find Cars</Link>
          <Link to="/companies">Rent-A-Car Fleets</Link>
          <Link to="/#how-it-works">How it works</Link>
          <Link to="/why-us">Why us</Link>
        </div>

        <div className="nav-actions hidden-mobile">
          {token ? (
            <>
              {/* List Vehicle Button */}
              {user?.role !== "admin" && (
                <Link to={listTarget} className="nav-list-btn" title="List a Vehicle">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>{listLabel}</span>
                </Link>
              )}

              <Link
                to={profileTarget}
                className="nav-profile-pill"
              >
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name || "Profile"} className="nav-avatar-img" />
                ) : (
                  <div className="nav-avatar-circle">{user?.name?.[0]?.toUpperCase() || "P"}</div>
                )}
                <span>{profileLabel}</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-signin">Sign In</Link>
              <Link to="/register" className="nav-btn">Get Started</Link>
            </>
          )}
        </div>

        <div className="mobile-menu-btn">
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle Menu">
            <div className={`burger ${menuOpen ? "open" : ""}`}>
              <span />
              <span />
              <span />
            </div>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <button
          className="mobile-backdrop"
          type="button"
          aria-label="Close menu backdrop"
          onClick={closeMenu}
        />
      )}

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`} id="mobile-menu">
        <div className="mobile-menu-links">
          <Link to="/companies" className="mobile-nav-item" onClick={closeMenu}>
            Rent-A-Car Fleets
          </Link>
          <Link to="/#how-it-works" className="mobile-nav-item" onClick={closeMenu}>
            How it works
          </Link>
          <Link to="/why-us" className="mobile-nav-item" onClick={closeMenu}>
            Why us
          </Link>
        </div>

        <div className="mobile-menu-actions">
          {token ? (
            <Link to={profileTarget} className="mobile-btn-outline" onClick={closeMenu}>
              {profileLabel}
            </Link>
          ) : (
            <>
              <Link to="/login" className="mobile-btn-outline" onClick={closeMenu}>
                Sign in
              </Link>
              <Link to="/register" className="mobile-btn-primary" onClick={closeMenu}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        .hero-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 5%;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          transition: background-color 0.3s, padding 0.3s, box-shadow 0.3s;
          font-family: var(--font-body, 'Plus Jakarta Sans', 'Poppins', system-ui, sans-serif);
        }

        .hero-nav.scrolled {
          background-color: rgba(253, 248, 242, 0.95);
          backdrop-filter: blur(10px);
          padding: 1rem 5%;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .nav-logo {
          font-size: 1.5rem;
          font-weight: 800;
          text-decoration: none;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
        }

        .nav-logo .brand-yamu {
          color: #111827;
        }

        .nav-logo .brand-orange {
          color: #f97316;
        }

        .nav-logo-img {
          width: 44px;
          height: 44px;
          object-fit: contain;
          margin-right: 10px;
          display: block;
          transition: transform 0.2s ease;
        }

        .nav-logo:hover .nav-logo-img {
          transform: scale(1.05);
        }

        .nav-links {
          display: flex;
          gap: 2.5rem;
        }

        .nav-links a {
          text-decoration: none;
          color: #444444;
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .nav-links a:hover {
          color: #FF8A00;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-signin {
          text-decoration: none;
          color: #111111;
          font-weight: 600;
          font-size: 0.95rem;
          transition: color 0.2s;
        }
        
        .nav-signin:hover {
          color: #FF8A00;
        }

        .hero-nav.on-dark .brand-yamu {
          color: #ffffff;
        }
        .hero-nav.on-dark .nav-links a {
          color: rgba(255, 255, 255, 0.9);
        }
        .hero-nav.on-dark .nav-links a:hover {
          color: #FF8A00;
        }
        .hero-nav.on-dark .nav-signin {
          color: #ffffff;
        }
        .hero-nav.on-dark .burger span {
          background: #ffffff;
        }

        .nav-btn {
          background: #FF8A00;
          color: #fff;
          padding: 0.7rem 1.5rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.95rem;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          border: none;
          cursor: pointer;
          text-decoration: none;
        }

        .nav-btn:hover {
          background: #FF9100;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 138, 0, 0.3);
        }

        /* List Vehicle Button — compact pill to the left of profile */
        .nav-list-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          padding: 0.4rem 1rem 0.4rem 0.75rem;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.85rem;
          text-decoration: none;
          transition: all 0.25s ease;
          box-shadow: 0 3px 10px rgba(249, 115, 22, 0.25);
          white-space: nowrap;
        }

        .nav-list-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(249, 115, 22, 0.35);
        }

        .nav-list-btn svg {
          flex-shrink: 0;
        }

        .nav-profile-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.9);
          border: 1.5px solid #cbd5e1;
          padding: 0.35rem 1.1rem 0.35rem 0.4rem;
          border-radius: 999px;
          color: #0f172a;
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .nav-profile-pill:hover {
          border-color: #f97316;
          color: #ea580c;
          box-shadow: 0 4px 14px rgba(249, 115, 22, 0.18);
        }

        .nav-avatar-img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .nav-avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.88rem;
          font-weight: 800;
        }

        /* Mobile Burger */
        .mobile-menu-btn {
          display: none;
        }
        .mobile-menu-btn button {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
        }

        .burger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 24px;
        }

        .burger span {
          width: 100%;
          height: 2px;
          background: #111;
          transition: 0.3s;
          border-radius: 2px;
        }

        .burger.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .burger.open span:nth-child(2) {
          opacity: 0;
        }

        .burger.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* Mobile Menu */
        .mobile-menu {
          display: grid;
          gap: 1rem;
          position: fixed;
          top: 0;
          right: 0;
          width: min(320px, 100%);
          height: 100vh;
          padding: 6rem 1.5rem 2rem;
          background: rgba(253, 248, 242, 0.98);
          backdrop-filter: blur(24px);
          border-left: 1px solid rgba(0,0,0,0.05);
          box-shadow: -10px 0 30px rgba(0,0,0,0.05);
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
          z-index: 999;
        }

        .mobile-menu.open {
          transform: translateX(0);
        }

        .mobile-backdrop {
          display: block;
          position: fixed;
          inset: 0;
          background: rgba(17, 17, 17, 0.4);
          backdrop-filter: blur(4px);
          border: none;
          padding: 0;
          z-index: 998;
        }

        .mobile-menu-links,
        .mobile-menu-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-nav-item,
        .mobile-btn-outline,
        .mobile-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 52px;
          border-radius: 12px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          font-size: 1.05rem;
        }

        .mobile-nav-item {
          color: #111111;
          background: transparent;
          border: 1px solid transparent;
        }

        .mobile-nav-item:hover {
          background: rgba(255, 138, 0, 0.1);
          color: #FF8A00;
        }

        .mobile-btn-outline {
          border: 2px solid #111111;
          color: #111111;
          background: transparent;
          margin-top: 1rem;
        }

        .mobile-btn-primary {
          background: #FF8A00;
          color: white;
          box-shadow: 0 8px 20px rgba(255, 138, 0, 0.2);
          margin-top: 0.5rem;
        }

        @media (max-width: 900px) {
          .nav-links, .nav-actions {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;