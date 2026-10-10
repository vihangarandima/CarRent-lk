import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { useCurrency } from "../context/CurrencyContext";
import {
  DASHBOARD_PATH,
  isBrowsingAsCustomer,
  isLister,
  logout,
  setBrowsingAsCustomer,
} from "../utils/session";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currency, setCurrency, currencies } = useCurrency();
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleUserUpdate = () => {
      setToken(localStorage.getItem("token"));
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    };
    window.addEventListener("user-updated", handleUserUpdate);
    window.addEventListener("storage", handleUserUpdate);
    return () => {
      window.removeEventListener("user-updated", handleUserUpdate);
      window.removeEventListener("storage", handleUserUpdate);
    };
  }, []);

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

  const handleLogout = logout;

  // Pages that start with the orange header band get the transparent white navbar
  const onOrangeHeader =
    ["/", "/home", "/vehicles", "/companies", "/reviews", "/reviews-portal", "/why-us", "/earnings-calculator"].includes(location.pathname) ||
    location.pathname.startsWith("/companies/");

  const lister = Boolean(token) && isLister(user);
  // A lister who has not chosen to browse as a customer sees a hosting-only navbar
  const hostingNav = lister && !isBrowsingAsCustomer();

  const listTarget =
    user?.role === "company"
      ? "/fleet/quick-add"
      : user?.role === "owner"
      ? "/list-my-car"
      : "/choose-listing-type";

  const profileTarget =
    user?.role === "admin" ? "/admin" : lister ? DASHBOARD_PATH : "/profile";

  const profileLabel =
    user?.role === "admin" ? "Admin Portal" : lister ? "My Dashboard" : "My Profile";

  const goToDashboard = () => {
    closeMenu();
    setBrowsingAsCustomer(false);
    navigate(DASHBOARD_PATH);
  };

  const browseAsCustomer = () => {
    closeMenu();
    setBrowsingAsCustomer(true);
    navigate("/");
  };

  const listLabel = 
    user?.role === "renter" ? "List Your Car" : "List Car";

  return (
    <>
      <nav className={`hero-nav ${scrolled ? "scrolled" : ""} ${onOrangeHeader && !scrolled ? "on-dark" : ""}`}>
        <Link to="/" className="nav-logo">
          <img src={logo} alt="Yamu Car Rentals" className="nav-logo-img" />
          <span className="brand-yamu">Yamu</span>
          <span className="brand-orange">&nbsp;Car Rentals</span>
        </Link>

        {hostingNav ? (
          <div className="nav-links hidden-mobile">
            <Link to={DASHBOARD_PATH} className={location.pathname.startsWith(DASHBOARD_PATH) ? "active" : ""}>Dashboard</Link>
            <Link to={listTarget} className={location.pathname === listTarget ? "active" : ""}>Add Vehicle</Link>
            <button type="button" className="nav-link-btn" onClick={browseAsCustomer}>
              View site as customer
            </button>
          </div>
        ) : (
          <div className="nav-links hidden-mobile">
            <Link to="/vehicles" className={location.pathname.startsWith("/vehicles") ? "active" : ""}>Find Cars</Link>
            <Link to="/companies" className={location.pathname === "/companies" || location.pathname.startsWith("/companies/") ? "active" : ""}>Fleets</Link>
            <Link to="/reviews" className={location.pathname === "/reviews" || location.pathname === "/reviews-portal" ? "active" : ""}>Reviews</Link>
            <Link to="/#how-it-works">How it works</Link>
            <Link to="/why-us" className={location.pathname === "/why-us" ? "active" : ""}>Why us</Link>
          </div>
        )}

        <div className="nav-actions hidden-mobile">
          <div className="nav-currency-picker" title="Change currency">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="nav-currency-select"
              aria-label="Display currency"
            >
              {Object.values(currencies).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>

          {token ? (
            <>
              {lister ? (
                <button type="button" onClick={goToDashboard} className="nav-list-btn" title="Back to your dashboard">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9" />
                    <rect x="14" y="3" width="7" height="5" />
                    <rect x="14" y="12" width="7" height="9" />
                    <rect x="3" y="16" width="7" height="5" />
                  </svg>
                  <span>{hostingNav ? "My Dashboard" : "Back to Dashboard"}</span>
                </button>
              ) : user?.role !== "admin" && (
                <Link to={listTarget} className="nav-list-btn" title="List a Vehicle">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>{listLabel}</span>
                </Link>
              )}

              {!lister && (
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
              )}

              {/* Dedicated Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="nav-logout-btn"
                title="Log Out"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Logout</span>
              </button>
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
        {hostingNav ? (
        <div className="mobile-menu-links">
          <button type="button" className="mobile-nav-item mobile-nav-btn" onClick={goToDashboard}>
            My Dashboard
          </button>
          <Link to={listTarget} className="mobile-nav-item" onClick={closeMenu}>
            + Add Vehicle
          </Link>
          <button type="button" className="mobile-nav-item mobile-nav-btn" onClick={browseAsCustomer}>
            View site as customer
          </button>
        </div>
        ) : (
        <div className="mobile-menu-links">
          {lister && (
            <button type="button" className="mobile-nav-item mobile-nav-btn" style={{ color: "#ea580c", fontWeight: 700 }} onClick={goToDashboard}>
              ← Back to My Dashboard
            </button>
          )}
          <Link to="/vehicles" className={`mobile-nav-item ${location.pathname.startsWith("/vehicles") ? "active" : ""}`} onClick={closeMenu}>
            Find Cars
          </Link>
          <Link to="/companies" className={`mobile-nav-item ${location.pathname === "/companies" || location.pathname.startsWith("/companies/") ? "active" : ""}`} onClick={closeMenu}>
            Fleets
          </Link>
          <Link to="/reviews" className={`mobile-nav-item ${location.pathname === "/reviews" || location.pathname === "/reviews-portal" ? "active" : ""}`} onClick={closeMenu}>
            Reviews & Ratings
          </Link>
          <Link to="/#how-it-works" className="mobile-nav-item" onClick={closeMenu}>
            How it works
          </Link>
          <Link to="/why-us" className={`mobile-nav-item ${location.pathname === "/why-us" ? "active" : ""}`} onClick={closeMenu}>
            Why us
          </Link>
          {user?.role !== "admin" && !lister && (
            <Link to={listTarget} className="mobile-nav-item" style={{ color: "#ea580c", fontWeight: 700 }} onClick={closeMenu}>
              + {listLabel}
            </Link>
          )}
        </div>
        )}

        <div className="mobile-menu-actions">
          {token ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
              {!lister && (
                <Link to={profileTarget} className="mobile-btn-outline" onClick={closeMenu}>
                  {profileLabel}
                </Link>
              )}
              <button
                type="button"
                onClick={() => { closeMenu(); handleLogout(); }}
                className="mobile-btn-logout"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log Out
              </button>
            </div>
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

          <div className="mobile-currency-row">
            <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Display Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mobile-currency-select"
            >
              {Object.values(currencies).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
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
          gap: 2.2rem;
          align-items: center;
        }

        .nav-links a {
          text-decoration: none;
          color: #444444;
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.2s;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          position: relative;
          padding: 4px 0 6px;
        }

        .nav-links a:hover {
          color: #FF8A00;
        }

        .nav-links a.active {
          color: #ea580c !important;
          font-weight: 700 !important;
        }

        .nav-links a.active::after {
          content: '';
          position: absolute;
          bottom: 0px;
          left: 0;
          right: 0;
          height: 3px;
          background: #ea580c;
          border-radius: 999px;
        }

        .nav-link-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font: inherit;
          color: #444444;
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .nav-link-btn:hover {
          color: #FF8A00;
        }

        .mobile-nav-btn {
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font: inherit;
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
          padding: 0.5rem 0.75rem;
          transition: color 0.2s;
        }
        
        .nav-signin:hover {
          color: #FF8A00;
        }

        .nav-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #ffffff !important;
          padding: 0.55rem 1.4rem;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.92rem;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3);
          white-space: nowrap;
          border: none;
        }

        .nav-currency-picker {
          display: flex;
          align-items: center;
        }

        .nav-currency-select {
          background: rgba(255, 255, 255, 0.9);
          border: 1.5px solid rgba(226, 232, 240, 0.8);
          border-radius: 999px;
          padding: 0.35rem 0.65rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .hero-nav.on-dark:not(.scrolled) .nav-currency-select {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          color: #ffffff;
        }

        .hero-nav.on-dark:not(.scrolled) .nav-currency-select option {
          color: #0f172a;
          background: #ffffff;
        }

        .nav-currency-select:hover {
          border-color: #f97316;
        }

        .mobile-currency-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0 0.5rem;
          border-top: 1px solid #f1f5f9;
          margin-top: 0.5rem;
        }

        .mobile-currency-select {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.4rem 0.75rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
          outline: none;
          font-family: inherit;
        }

        .nav-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(249, 115, 22, 0.45);
          color: #ffffff !important;
          filter: brightness(1.05);
        }

        .hero-nav.on-dark .brand-yamu {
          color: #ffffff;
        }
        .hero-nav.on-dark .brand-orange {
          color: #ffffff;
          opacity: 0.95;
        }
        .hero-nav.on-dark .nav-links a {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 600;
        }
        .hero-nav.on-dark .nav-links a.active {
          color: #ffffff !important;
          font-weight: 700 !important;
          background: rgba(255, 255, 255, 0.22);
          padding: 6px 14px;
          border-radius: 999px;
          backdrop-filter: blur(8px);
        }
        .hero-nav.on-dark .nav-links a.active::after {
          display: none;
        }
        .hero-nav.on-dark .nav-link-btn {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 600;
        }
        .hero-nav.on-dark .nav-links a:hover {
          color: #ffffff;
          opacity: 1;
        }
        .mobile-nav-item.active {
          color: #ea580c !important;
          font-weight: 700 !important;
          background: #fff7ed;
          border-left: 3px solid #ea580c;
        }
        .hero-nav.on-dark .nav-signin {
          color: #ffffff;
          font-weight: 600;
        }
        .hero-nav.on-dark .nav-signin:hover {
          color: #ffedd5;
        }
        .hero-nav.on-dark .burger span {
          background: #ffffff;
        }
        .hero-nav.on-dark .nav-btn {
          background: #ffffff !important;
          color: #ea580c !important;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.2);
        }
        .hero-nav.on-dark .nav-btn:hover {
          background: #ffffff !important;
          color: #c2410c !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 26px rgba(0, 0, 0, 0.28);
        }
        .hero-nav.on-dark .nav-list-btn {
          background: rgba(255, 255, 255, 0.22);
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: #ffffff;
          backdrop-filter: blur(8px);
        }
        .hero-nav.on-dark .nav-list-btn:hover {
          background: rgba(255, 255, 255, 0.35);
          border-color: #ffffff;
        }
        .hero-nav.on-dark .nav-profile-pill {
          background: rgba(255, 255, 255, 0.95);
          border-color: transparent;
        }

        .nav-logout-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(239, 68, 68, 0.08);
          border: 1.5px solid rgba(239, 68, 68, 0.25);
          color: #ef4444;
          padding: 0.4rem 0.9rem;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .nav-logout-btn:hover {
          background: #ef4444;
          color: #ffffff;
          border-color: #ef4444;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
        }

        .hero-nav.on-dark .nav-logout-btn {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.35);
          color: #ffffff;
          backdrop-filter: blur(8px);
        }

        .hero-nav.on-dark .nav-logout-btn:hover {
          background: #ef4444;
          border-color: #ef4444;
          color: #ffffff;
        }

        /* List Vehicle Button — compact pill to the left of profile */
        .nav-list-btn {
          border: none;
          cursor: pointer;
          font-family: inherit;
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

        .mobile-btn-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 48px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1.5px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }

        .mobile-btn-logout:hover {
          background: #ef4444;
          color: #ffffff;
        }

        @media (max-width: 1100px) {
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