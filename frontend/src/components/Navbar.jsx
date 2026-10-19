import React, { useEffect, useState, useRef } from "react";
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
import {
  Search,
  Car,
  Star,
  HelpCircle,
  ShieldCheck,
  Plus,
  LayoutDashboard,
  Eye,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currency, setCurrency, currencies } = useCurrency();
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [acctMenuOpen, setAcctMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const acctMenuRef = useRef(null);

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
    setAcctMenuOpen(false);
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (acctMenuRef.current && !acctMenuRef.current.contains(e.target)) {
        setAcctMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (menuOpen) setMenuOpen(false);
        if (acctMenuOpen) setAcctMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, acctMenuOpen]);

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
      <nav className={`hero-nav ${scrolled ? "scrolled" : ""} ${onOrangeHeader ? "on-orange" : ""}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo" aria-label="Yamu Car Rentals home">
            <img src={logo} alt="Yamu Car Rentals" className="nav-logo-img" />
            <span className="nav-logo-text">
              <span className="brand-yamu">Yamu</span>
              <span className="brand-orange">&nbsp;Car Rentals</span>
            </span>
          </Link>

          <nav className="nav-center hidden-mobile" aria-label="Main">
            {hostingNav ? (
              <ul className="nav-links-list">
                <li>
                  <Link
                    to={DASHBOARD_PATH}
                    className={location.pathname.startsWith(DASHBOARD_PATH) ? "active" : ""}
                    aria-current={location.pathname.startsWith(DASHBOARD_PATH) ? "page" : undefined}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to={listTarget}
                    className={location.pathname === listTarget ? "active" : ""}
                    aria-current={location.pathname === listTarget ? "page" : undefined}
                  >
                    Add Vehicle
                  </Link>
                </li>
                <li>
                  <button type="button" className="nav-link-btn" onClick={browseAsCustomer}>
                    View site as customer
                  </button>
                </li>
              </ul>
            ) : (
              <ul className="nav-links-list">
                <li>
                  <Link
                    to="/vehicles"
                    className={location.pathname.startsWith("/vehicles") ? "active" : ""}
                    aria-current={location.pathname.startsWith("/vehicles") ? "page" : undefined}
                  >
                    Find Cars
                  </Link>
                </li>
                <li>
                  <Link
                    to="/companies"
                    className={location.pathname === "/companies" || location.pathname.startsWith("/companies/") ? "active" : ""}
                    aria-current={location.pathname === "/companies" || location.pathname.startsWith("/companies/") ? "page" : undefined}
                  >
                    Fleets
                  </Link>
                </li>
                <li>
                  <Link
                    to="/reviews"
                    className={location.pathname === "/reviews" || location.pathname === "/reviews-portal" ? "active" : ""}
                    aria-current={location.pathname === "/reviews" || location.pathname === "/reviews-portal" ? "page" : undefined}
                  >
                    Reviews
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#how-it-works"
                    className={location.hash === "#how-it-works" ? "active" : ""}
                    aria-current={location.hash === "#how-it-works" ? "page" : undefined}
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link
                    to="/why-us"
                    className={location.pathname === "/why-us" ? "active" : ""}
                    aria-current={location.pathname === "/why-us" ? "page" : undefined}
                  >
                    Why us
                  </Link>
                </li>
              </ul>
            )}
          </nav>

          <div className="nav-actions hidden-mobile">
            <div className="nav-cur-pill" title="Change currency">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="nav-cur-select"
                aria-label="Display currency"
              >
                {Object.values(currencies).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>

            {lister ? (
              <button
                type="button"
                onClick={goToDashboard}
                className="nav-list-pill"
                title="Back to your dashboard"
              >
                <LayoutDashboard size={16} strokeWidth={2.4} />
                <span>{hostingNav ? "My Dashboard" : "Back to Dashboard"}</span>
              </button>
            ) : user?.role !== "admin" && !token ? (
              <Link
                to={listTarget}
                className="nav-list-pill"
                title="List a vehicle"
              >
                <Plus size={16} strokeWidth={2.4} />
                <span>{listLabel}</span>
              </Link>
            ) : null}

            {token ? (
              <div className="nav-acct" ref={acctMenuRef}>
                <button
                  type="button"
                  id="acctBtn"
                  className="nav-acct-btn"
                  onClick={() => setAcctMenuOpen(!acctMenuOpen)}
                  aria-haspopup="menu"
                  aria-expanded={acctMenuOpen}
                  aria-controls="acctMenu"
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name || "Profile"} className="nav-acct-av" />
                  ) : (
                    <span className="nav-acct-av">
                      {user?.name?.[0]?.toUpperCase() || "Y"}
                    </span>
                  )}
                  <span>{profileLabel}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{
                      marginLeft: 2,
                      transform: acctMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease"
                    }}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {acctMenuOpen && (
                  <div className="nav-acct-menu" id="acctMenu" role="menu">
                    {!lister ? (
                      <Link
                        to={profileTarget}
                        role="menuitem"
                        onClick={() => setAcctMenuOpen(false)}
                      >
                        {profileLabel}
                      </Link>
                    ) : (
                      <>
                        <Link
                          to={DASHBOARD_PATH}
                          role="menuitem"
                          onClick={() => setAcctMenuOpen(false)}
                        >
                          My Dashboard
                        </Link>
                        <Link
                          to={listTarget}
                          role="menuitem"
                          onClick={() => setAcctMenuOpen(false)}
                        >
                          Add Vehicle
                        </Link>
                      </>
                    )}
                    <hr />
                    <button
                      type="button"
                      className="nav-acct-logout"
                      role="menuitem"
                      onClick={() => {
                        setAcctMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="nav-guest-btns">
                <Link to="/login" className="nav-sign-in-btn">
                  Sign in
                </Link>
                <Link to="/register" className="nav-get-started-btn">
                  Get started
                </Link>
              </div>
            )}
          </div>

          <div className="mobile-menu-btn">
            <button
              type="button"
              className="mobile-icon-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h10" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Scrim Backdrop */}
      <div
        className={`mobile-scrim ${menuOpen ? "open" : ""}`}
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      />

      {/* Mobile Drawer */}
      <aside
        className={`mobile-drawer ${menuOpen ? "open" : ""}`}
        id="mobile-drawer"
        aria-label="Main menu"
        aria-hidden={!menuOpen}
      >
        <div className="mobile-dhead">
          <Link to="/" className="nav-logo mobile-drawer-logo" onClick={closeMenu}>
            <img src={logo} alt="Yamu Car Rentals" className="nav-logo-img" />
            <span className="brand-yamu">Yamu</span>
            <span className="brand-orange">&nbsp;Car Rentals</span>
          </Link>
          <button
            type="button"
            className="mobile-icon-btn"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <ul className="mobile-drawer-nav">
          {hostingNav ? (
            <>
              <li>
                <Link
                  to={DASHBOARD_PATH}
                  className={`mobile-nav-link ${location.pathname.startsWith(DASHBOARD_PATH) ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  <span className="mobile-nav-ic">
                    <LayoutDashboard size={20} strokeWidth={2.2} />
                  </span>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to={listTarget}
                  className={`mobile-nav-link ${location.pathname === listTarget ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  <span className="mobile-nav-ic">
                    <Plus size={20} strokeWidth={2.4} />
                  </span>
                  <span>Add Vehicle</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className="mobile-nav-link mobile-nav-link-btn"
                  onClick={browseAsCustomer}
                >
                  <span className="mobile-nav-ic">
                    <Eye size={20} strokeWidth={2.2} />
                  </span>
                  <span>View site as customer</span>
                </button>
              </li>
            </>
          ) : (
            <>
              {lister && (
                <li>
                  <button
                    type="button"
                    className="mobile-nav-link mobile-nav-link-btn mobile-lister-back"
                    onClick={goToDashboard}
                  >
                    <span className="mobile-nav-ic">
                      <LayoutDashboard size={20} strokeWidth={2.2} />
                    </span>
                    <span>Back to Dashboard</span>
                  </button>
                </li>
              )}
              <li>
                <Link
                  to="/vehicles"
                  className={`mobile-nav-link ${location.pathname.startsWith("/vehicles") ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  <span className="mobile-nav-ic">
                    <Search size={20} strokeWidth={2.2} />
                  </span>
                  <span>Find Cars</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/companies"
                  className={`mobile-nav-link ${location.pathname === "/companies" || location.pathname.startsWith("/companies/") ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  <span className="mobile-nav-ic">
                    <Car size={20} strokeWidth={2.2} />
                  </span>
                  <span>Fleets</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/reviews"
                  className={`mobile-nav-link ${location.pathname === "/reviews" || location.pathname === "/reviews-portal" ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  <span className="mobile-nav-ic">
                    <Star size={20} strokeWidth={2.2} />
                  </span>
                  <span>Reviews &amp; Ratings</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/#how-it-works"
                  className="mobile-nav-link"
                  onClick={closeMenu}
                >
                  <span className="mobile-nav-ic">
                    <HelpCircle size={20} strokeWidth={2.2} />
                  </span>
                  <span>How it works</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/why-us"
                  className={`mobile-nav-link ${location.pathname === "/why-us" ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  <span className="mobile-nav-ic">
                    <ShieldCheck size={20} strokeWidth={2.2} />
                  </span>
                  <span>Why us</span>
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Footer */}
        <div className="mobile-drawer-foot">
          <label className="mobile-drawer-cur">
            <span>Display currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Display currency"
              className="mobile-drawer-cur-select"
            >
              {Object.values(currencies).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label || c.code}
                </option>
              ))}
            </select>
          </label>

          <div className="mobile-drawer-btns">
            {token ? (
              <>
                {!lister ? (
                  <Link
                    to={profileTarget}
                    className="mobile-drawer-btn"
                    onClick={closeMenu}
                  >
                    {profileLabel}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="mobile-drawer-btn"
                    onClick={goToDashboard}
                  >
                    Dashboard
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  className="mobile-drawer-btn mobile-drawer-btn-logout"
                >
                  <LogOut size={16} strokeWidth={2.2} style={{ marginRight: 6 }} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="mobile-drawer-btn"
                  onClick={closeMenu}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="mobile-drawer-btn fill"
                  onClick={closeMenu}
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </aside>

      <style>{`
        .hero-nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          color: #ffffff;
          background: transparent;
          transition: background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, color 0.25s ease;
          font-family: var(--font-body, 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif);
        }

        .hero-nav:not(.on-orange):not(.scrolled) {
          background: #ea580c;
        }

        .hero-nav.scrolled {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border-bottom: 1px solid #ECE5DD;
          color: #1D140C;
        }

        .hero-nav.scrolled .nav-logo .brand-yamu {
          color: #1D140C;
        }

        .hero-nav.scrolled .nav-logo .brand-orange {
          color: #F26A0F;
        }

        .hero-nav.scrolled .nav-links-list a,
        .hero-nav.scrolled .nav-links-list .nav-link-btn {
          color: #374151;
        }

        .hero-nav.scrolled .nav-links-list a:hover,
        .hero-nav.scrolled .nav-links-list .nav-link-btn:hover {
          color: #F26A0F;
        }

        .hero-nav.scrolled .nav-links-list a.active,
        .hero-nav.scrolled .nav-links-list a[aria-current="page"] {
          color: #F26A0F;
        }

        .hero-nav.scrolled .nav-links-list a.active::after,
        .hero-nav.scrolled .nav-links-list a[aria-current="page"]::after {
          background: #F26A0F;
        }

        .hero-nav.scrolled .nav-cur-pill {
          background: #FFFFFF;
          border-color: #E5E7EB;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .hero-nav.scrolled .nav-cur-pill:hover {
          background: #F9FAFB;
          border-color: #D1D5DB;
        }

        .hero-nav.scrolled .nav-cur-select {
          color: #1D140C;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231D140C' stroke-width='2.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
        }

        .hero-nav.scrolled .nav-list-pill {
          background: #FFF0E3;
          border-color: #FDBA74;
          color: #C24A00;
        }

        .hero-nav.scrolled .nav-list-pill:hover {
          background: #FFE4CC;
          border-color: #F97316;
        }

        .hero-nav.scrolled .nav-acct-btn {
          background: #FFFFFF;
          border: 1.5px solid #E5E7EB;
          color: #1D140C;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .hero-nav.scrolled .nav-acct-btn:hover {
          border-color: #D1D5DB;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .hero-nav.scrolled .nav-acct-btn svg {
          stroke: #1D140C;
        }

        .hero-nav.scrolled .nav-sign-in-btn {
          color: #1D140C;
          border: 1.5px solid #E5E7EB;
        }

        .hero-nav.scrolled .nav-sign-in-btn:hover {
          background: #F3F4F6;
          border-color: #D1D5DB;
        }

        .hero-nav.scrolled .nav-get-started-btn {
          background: linear-gradient(135deg, #FF8A00, #F26A0F);
          color: #FFFFFF;
          box-shadow: 0 4px 14px rgba(242, 106, 15, 0.3);
        }

        .hero-nav.scrolled .nav-get-started-btn:hover {
          box-shadow: 0 6px 18px rgba(242, 106, 15, 0.4);
        }

        .hero-nav.scrolled .mobile-icon-btn {
          background: #F6F2ED;
          color: #1D140C;
        }

        .nav-inner {
          max-width: 1440px;
          margin: 0 auto;
          height: 72px;
          padding: 0 3.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          box-sizing: border-box;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ffffff;
          text-decoration: none;
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -0.02em;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .nav-logo-img {
          width: 34px;
          height: 34px;
          object-fit: contain;
          display: block;
        }

        .nav-logo-text {
          display: inline-flex;
          align-items: center;
        }

        .nav-logo .brand-yamu,
        .nav-logo .brand-orange {
          color: #ffffff;
          transition: color 0.2s ease;
        }

        .nav-center {
          margin: 0 auto;
        }

        .nav-links-list {
          display: flex;
          gap: 28px;
          margin: 0;
          padding: 0;
          list-style: none;
          align-items: center;
        }

        .nav-links-list a,
        .nav-links-list .nav-link-btn {
          position: relative;
          display: block;
          padding: 8px 6px;
          color: rgba(255, 255, 255, 0.95);
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
          white-space: nowrap;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: color 0.15s ease;
        }

        .nav-links-list a:hover,
        .nav-links-list .nav-link-btn:hover {
          color: #ffffff;
        }

        .nav-links-list a.active,
        .nav-links-list a[aria-current="page"] {
          color: #ffffff;
        }

        .nav-links-list a.active::after,
        .nav-links-list a[aria-current="page"]::after {
          content: "";
          position: absolute;
          left: 6px;
          right: 6px;
          bottom: -2px;
          height: 3px;
          border-radius: 2px;
          background: #ffffff;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Frosted Translucent Currency Pill matching user's reference */
        .nav-cur-pill {
          display: inline-flex;
          align-items: center;
          height: 38px;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 999px;
          padding: 0 12px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }

        .nav-cur-pill:hover {
          background: rgba(255, 255, 255, 0.28);
          border-color: rgba(255, 255, 255, 0.6);
        }

        .nav-cur-select {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          border: 0;
          color: #ffffff;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
          outline: none;
          font-family: inherit;
          padding-right: 16px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right center;
        }

        .nav-cur-select option {
          color: #1D140C;
          background: #ffffff;
        }

        .nav-list-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 38px;
          padding: 0 16px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.15);
          border-radius: 999px;
          color: #ffffff;
          text-decoration: none;
          font-weight: 700;
          font-size: 13.5px;
          white-space: nowrap;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }

        .nav-list-pill:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: #ffffff;
        }

        .nav-acct {
          position: relative;
        }

        .nav-acct-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          height: 42px;
          padding: 0 16px 0 5px;
          border: 0;
          border-radius: 999px;
          background: #ffffff;
          color: #1D140C;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .nav-acct-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
        }

        .nav-acct-av {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ea580c;
          color: #ffffff;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 14px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .nav-acct-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          min-width: 190px;
          padding: 6px;
          border-radius: 16px;
          background: #FFFFFF;
          color: #1D140C;
          box-shadow: 0 16px 40px rgba(60, 20, 0, 0.3);
          border: 1px solid #ECE5DD;
          z-index: 1010;
          display: flex;
          flex-direction: column;
          animation: navAcctMenuIn 0.18s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes navAcctMenuIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .nav-acct-menu a,
        .nav-acct-menu .nav-acct-logout {
          display: block;
          padding: 12px 14px;
          border-radius: 10px;
          color: #1D140C;
          text-decoration: none;
          font-weight: 700;
          font-size: 15px;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
          box-sizing: border-box;
          transition: background-color 0.15s ease;
        }

        .nav-acct-menu a:hover {
          background: #F6F2ED;
        }

        .nav-acct-menu hr {
          border: 0;
          border-top: 1px solid #ECE5DD;
          margin: 6px 8px;
        }

        .nav-acct-menu .nav-acct-logout {
          color: #EF4444;
        }

        .nav-acct-menu .nav-acct-logout:hover {
          background: rgba(239, 68, 68, 0.08);
        }

        .nav-logout-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: #ffffff;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.2s ease;
          font-family: inherit;
          white-space: nowrap;
        }

        .nav-logout-pill:hover {
          background: rgba(239, 68, 68, 0.85);
          border-color: transparent;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
        }

        .nav-guest-btns {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-sign-in-btn {
          display: inline-flex;
          align-items: center;
          height: 38px;
          padding: 0 16px;
          color: #ffffff;
          font-weight: 800;
          font-size: 14px;
          text-decoration: none;
          white-space: nowrap;
          border-radius: 999px;
          transition: background-color 0.15s ease;
        }

        .nav-sign-in-btn:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        .nav-get-started-btn {
          display: inline-flex;
          align-items: center;
          height: 38px;
          padding: 0 20px;
          background: #ffffff;
          color: #ea580c;
          font-weight: 800;
          font-size: 14px;
          border-radius: 999px;
          text-decoration: none;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .nav-get-started-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
        }

        /* Mobile Navigation Trigger */
        .mobile-menu-btn {
          display: none;
        }

        .mobile-icon-btn {
          width: 46px;
          height: 46px;
          border: 0;
          border-radius: 14px;
          background: #F6F2ED;
          display: grid;
          place-items: center;
          cursor: pointer;
          color: #1D140C;
          transition: background-color 0.15s ease, transform 0.15s ease;
          padding: 0;
          flex-shrink: 0;
        }

        .mobile-icon-btn:hover {
          background: #EFE8DE;
        }

        .mobile-icon-btn:active {
          transform: scale(0.95);
        }

        /* Mobile Drawer Scrim / Backdrop */
        .mobile-scrim {
          position: fixed;
          inset: 0;
          z-index: 1001;
          background: rgba(20, 10, 0, 0.5);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }

        .mobile-scrim.open {
          opacity: 1;
          pointer-events: auto;
        }

        /* Mobile Drawer Container */
        .mobile-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          z-index: 1002;
          width: min(88vw, 380px);
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          padding: 0 16px calc(16px + env(safe-area-inset-bottom, 0px));
          transform: translateX(100%);
          visibility: hidden;
          transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), visibility 0s 0.28s;
          box-shadow: -12px 0 40px rgba(0, 0, 0, 0.25);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          box-sizing: border-box;
        }

        .mobile-drawer.open {
          transform: translateX(0);
          visibility: visible;
          transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), visibility 0s;
        }

        /* Drawer Header */
        .mobile-dhead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          min-height: 64px;
          padding-top: env(safe-area-inset-top, 0px);
          flex: none;
          border-bottom: 1px solid #ECE5DD;
          margin: 0 -16px 8px;
          padding-left: 16px;
          padding-right: 16px;
        }

        .mobile-drawer-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .mobile-drawer-logo .brand-yamu {
          color: #1D140C;
        }

        .mobile-drawer-logo .brand-orange {
          color: #F26A0F;
        }

        /* Drawer Nav List */
        .mobile-drawer-nav {
          list-style: none;
          margin: 8px 0 0;
          padding: 0;
          display: grid;
          gap: 4px;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 14px;
          min-height: 56px;
          padding: 0 12px;
          border-radius: 16px;
          color: #1D140C;
          text-decoration: none;
          font-size: 17px;
          font-weight: 700;
          background: transparent;
          border: none;
          width: 100%;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          box-sizing: border-box;
          transition: background-color 0.15s ease, color 0.15s ease;
        }

        .mobile-nav-link:hover {
          background: #F8F5F1;
        }

        .mobile-nav-ic {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #F6F2ED;
          display: grid;
          place-items: center;
          color: #6F6359;
          flex: none;
          transition: background-color 0.15s ease, color 0.15s ease;
        }

        .mobile-nav-link.active {
          background: #FFF0E3;
          color: #C24A00;
        }

        .mobile-nav-link.active .mobile-nav-ic {
          background: #F26A0F;
          color: #FFFFFF;
        }

        .mobile-lister-back {
          color: #F26A0F;
        }

        .mobile-lister-back .mobile-nav-ic {
          background: #FFF0E3;
          color: #F26A0F;
        }

        /* Drawer Footer */
        .mobile-drawer-foot {
          margin-top: auto;
          padding-top: 24px;
          padding-bottom: 8px;
          display: grid;
          gap: 14px;
        }

        .mobile-drawer-cur {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 14px;
          font-weight: 700;
          color: #6F6359;
        }

        .mobile-drawer-cur-select {
          height: 44px;
          padding: 0 14px;
          border: 1.5px solid #ECE5DD;
          border-radius: 12px;
          background: #FFFFFF;
          font-weight: 800;
          font-size: 15px;
          color: #1D140C;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          box-sizing: border-box;
        }

        .mobile-drawer-cur-select:focus {
          border-color: #F26A0F;
        }

        .mobile-drawer-btns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .mobile-drawer-btn {
          height: 54px;
          border-radius: 16px;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          border: 2px solid #1D140C;
          background: transparent;
          color: #1D140C;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-family: inherit;
          box-sizing: border-box;
          transition: all 0.15s ease;
          padding: 0 8px;
          text-align: center;
        }

        .mobile-drawer-btn:active {
          transform: scale(0.98);
        }

        .mobile-drawer-btn.fill {
          border-color: transparent;
          background: linear-gradient(135deg, #FF8A00, #F26A0F);
          color: #FFFFFF;
          box-shadow: 0 8px 18px rgba(242, 106, 15, 0.35);
        }

        .mobile-drawer-btn-logout {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.08);
          color: #EF4444;
        }

        .mobile-drawer-btn-logout:hover {
          background: #EF4444;
          color: #FFFFFF;
        }

        @media (max-width: 1100px) {
          .hidden-mobile {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
          .nav-inner {
            justify-content: space-between !important;
            padding: 0 16px;
          }

          .hero-nav:not(.scrolled) .mobile-icon-btn {
            background: rgba(255, 255, 255, 0.18) !important;
            border: 1px solid rgba(255, 255, 255, 0.35) !important;
            color: #ffffff !important;
            backdrop-filter: blur(8px) !important;
            -webkit-backdrop-filter: blur(8px) !important;
          }

          .hero-nav.scrolled .mobile-icon-btn {
            background: #F6F2ED !important;
            border: none !important;
            color: #1D140C !important;
            backdrop-filter: none !important;
          }
        }

        @media (min-width: 1101px) {
          .mobile-menu-btn,
          .mobile-scrim,
          .mobile-drawer {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .hero-nav {
            height: 64px !important;
            padding: 0 16px !important;
            background: transparent !important;
            border-bottom: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            color: #ffffff !important;
            transition: background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          }

          .hero-nav:not(.on-orange):not(.scrolled) {
            background: #ea580c !important;
          }

          .hero-nav.scrolled {
            background: rgba(255, 255, 255, 0.98) !important;
            backdrop-filter: blur(14px) !important;
            -webkit-backdrop-filter: blur(14px) !important;
            border-bottom: 1px solid #ECE5DD !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
            padding: 0 16px !important;
            color: #1D140C !important;
          }

          .nav-inner {
            height: 64px !important;
            padding: 0 !important;
            gap: 0 !important;
            justify-content: space-between !important;
          }

          .nav-logo {
            font-size: 19px !important;
            gap: 8px !important;
          }

          .nav-logo-img {
            width: 32px !important;
            height: 32px !important;
            margin-right: 0 !important;
            object-fit: contain !important;
          }

          .hero-nav .nav-logo .brand-yamu,
          .hero-nav .nav-logo .brand-orange {
            color: #ffffff !important;
            transition: color 0.2s ease;
          }

          .hero-nav.scrolled .nav-logo .brand-yamu {
            color: #1D140C !important;
          }

          .hero-nav.scrolled .nav-logo .brand-orange {
            color: #F26A0F !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;