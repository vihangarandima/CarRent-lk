import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Car,
  PlusCircle,
  LayoutDashboard,
  Building2,
  HelpCircle,
  Info,
  LogIn,
  Sparkles,
  User,
  Heart,
} from "lucide-react";
import logo from "../assets/images/logo.png";

const Navbar = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [scrolled, setScrolled] = useState(false);
  const [sidebarMode, setSidebarMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setSidebarMode(y > 120);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("has-sidebar-nav", sidebarMode);
    return () => document.body.classList.remove("has-sidebar-nav");
  }, [sidebarMode]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* ==================== TOP HORIZONTAL NAVBAR ==================== */}
      <nav className={`top-navbar ${scrolled ? "scrolled" : ""} ${sidebarMode ? "hidden" : ""}`}>
        <div className="nav-inner">
          <Link to="/" className="logo">
            <img src={logo} alt="CarRents.lk Logo" className="logo-img" />
            <span className="logo-text">
              CarRents<span className="logo-domain">.lk</span>
            </span>
          </Link>

          <div className="nav-links">
            <Link to="/vehicles" className="nav-item">
              <Car size={20} className="nav-icon" />
              <span className="link-text">Rent</span>
            </Link>
            {user && user.role === "company" ? (
              <Link to="/company-dashboard" className="nav-item">
                <LayoutDashboard size={20} className="nav-icon" />
                <span className="link-text">Dashboard</span>
              </Link>
            ) : (
              <Link to="/list-my-car" className="nav-item">
                <PlusCircle size={20} className="nav-icon" />
                <span className="link-text">List Vehicle</span>
              </Link>
            )}
            <Link to="/companies" className="nav-item">
              <Building2 size={20} className="nav-icon" />
              <span className="link-text">Companies</span>
            </Link>
            <Link to="/#how-it-works" className="nav-item">
              <HelpCircle size={20} className="nav-icon" />
              <span className="link-text">How it works</span>
            </Link>
            <Link to="/why-us" className="nav-item">
              <Info size={20} className="nav-icon" />
              <span className="link-text">Why us</span>
            </Link>
          </div>

          <div className="nav-auth">
            <div className="nav-icon-placeholder" title="Favorites (Coming Soon)">
              <Heart size={20} />
            </div>
            {token ? (
              <Link to="/profile" className="nav-item profile-btn">
                <User size={20} className="nav-icon" />
                <span className="link-text">Profile</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="nav-item sign-in">
                  <LogIn size={20} className="nav-icon" />
                  <span className="link-text">Sign In</span>
                </Link>
                <Link to="/select-role" className="btn-getstarted">
                  <Sparkles size={18} className="nav-icon" />
                  <span className="link-text">Get Started</span>
                </Link>
              </>
            )}
          </div>

          <button
            className={`burger ${menuOpen ? "open" : ""}`}
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* ==================== SIDEBAR ==================== */}
      <nav className={`sidebar ${sidebarMode ? "active" : ""}`}>
        <div className="sidebar-inner">
          <Link to="/" className="logo">
            <img src={logo} alt="CarRents.lk Logo" className="logo-img" />
            <span className="logo-text">
              CarRents<span className="logo-domain">.lk</span>
            </span>
          </Link>

          <div className="sidebar-links">
            <Link to="/vehicles" className="nav-item">
              <Car size={20} className="nav-icon" />
              <span className="link-text">Rent</span>
            </Link>
            {user && user.role === "company" ? (
              <Link to="/company-dashboard" className="nav-item">
                <LayoutDashboard size={20} className="nav-icon" />
                <span className="link-text">Dashboard</span>
              </Link>
            ) : (
              <Link to="/list-my-car" className="nav-item">
                <PlusCircle size={20} className="nav-icon" />
                <span className="link-text">List Vehicle</span>
              </Link>
            )}
            <Link to="/companies" className="nav-item">
              <Building2 size={20} className="nav-icon" />
              <span className="link-text">Companies</span>
            </Link>
            <Link to="/#how-it-works" className="nav-item">
              <HelpCircle size={20} className="nav-icon" />
              <span className="link-text">How it works</span>
            </Link>
            <Link to="/why-us" className="nav-item">
              <Info size={20} className="nav-icon" />
              <span className="link-text">Why us</span>
            </Link>
          </div>

          <div className="sidebar-auth">
            <div className="nav-icon-placeholder" title="Favorites (Coming Soon)">
              <Heart size={20} />
            </div>
            {token ? (
              <Link to="/profile" className="nav-item profile-btn">
                <User size={20} className="nav-icon" />
                <span className="link-text">Profile</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="nav-item sign-in">
                  <LogIn size={20} className="nav-icon" />
                  <span className="link-text">Sign In</span>
                </Link>
                <Link to="/select-role" className="btn-getstarted">
                  <Sparkles size={18} className="nav-icon" />
                  <span className="link-text">Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ==================== MOBILE MENU ==================== */}
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
          <Link to="/vehicles" className="mobile-nav-item" onClick={closeMenu}>Rent</Link>
          {user && user.role === "company" ? (
            <Link to="/company-dashboard" className="mobile-nav-item" onClick={closeMenu}>Dashboard</Link>
          ) : (
            <Link to="/list-my-car" className="mobile-nav-item" onClick={closeMenu}>List Vehicle</Link>
          )}
          <Link to="/companies" className="mobile-nav-item" onClick={closeMenu}>Companies</Link>
          <Link to="/#how-it-works" className="mobile-nav-item" onClick={closeMenu}>How it works</Link>
          <Link to="/why-us" className="mobile-nav-item" onClick={closeMenu}>Why us</Link>
        </div>

        <div className="mobile-menu-actions">
          {token ? (
            <Link to="/profile" className="mobile-btn-outline" onClick={closeMenu}>Profile</Link>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-item mobile-sign-in" onClick={closeMenu}>Sign in</Link>
              <Link to="/select-role" className="mobile-btn-primary" onClick={closeMenu}>Get started</Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        /* =============== TOP NAVBAR =============== */
        .top-navbar {
          position: fixed;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
          width: min(1200px, calc(100% - 2rem));
          z-index: 1000;
          transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .top-navbar.scrolled {
          top: 0.5rem;
        }

        .top-navbar.hidden {
          opacity: 0;
          transform: translate(-50%, -40px);
          pointer-events: none;
        }

        .nav-inner {
          padding: 0.7rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          /* === TRANSPARENCY: adjust the two alpha values below (0 = fully see-through, 1 = solid) === */
          background: linear-gradient(180deg, rgba(28, 20, 14, 0.72), rgba(15, 11, 8, 0.78));
          border-radius: 16px;
          /* === ACCENT COLOR: this hairline border is your orange/gold brand accent === */
          border: 1px solid rgba(251, 191, 36, 0.22);
          border-bottom: 1px solid rgba(249, 115, 22, 0.4);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04);
          /* Blur controls how much of the page behind shows through the glass */
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: padding 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.4s ease;
        }

        /* =============== SIDEBAR =============== */
        .sidebar {
          position: fixed;
          top: 50%;
          left: -30px;
          transform: translateY(-50%);
          width: 84px;
          height: min(82vh, 640px);
          opacity: 0;
          visibility: hidden;
          z-index: 999;
          transition: all 0.5s cubic-bezier(0.32, 0.72, 0, 1);
        }

        .sidebar.active {
          opacity: 1;
          visibility: visible;
          left: 1rem;
        }

        .sidebar:hover {
          width: 250px;
        }

        .sidebar-inner {
          width: 100%;
          height: 100%;
          padding: 1.15rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: linear-gradient(180deg, rgba(16, 15, 15, 0.95), rgba(9, 8, 8, 0.97));
          border: 1px solid rgba(251, 191, 36, 0.16);
          border-radius: 20px;
          box-shadow: 0 26px 55px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(22px);
          overflow: hidden;
        }

        /* Text visibility - Only show on hover */
        .sidebar .link-text {
          opacity: 0;
          width: 0;
          overflow: hidden;
          white-space: nowrap;
          transition: all 0.3s ease;
        }

        .sidebar:hover .link-text {
          opacity: 1;
          width: auto;
          margin-left: 0.6rem;
        }

        /* Logo text behavior */
        .sidebar .logo-text {
          opacity: 0;
          width: 0;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .sidebar:hover .logo-text {
          opacity: 1;
          width: auto;
        }
          .sidebar .nav-item:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .nav-auth, .sidebar-auth {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sidebar-auth {
          flex-direction: column;
          align-items: stretch;
          gap: 0.35rem;
          margin-top: auto;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* =============== SHARED STYLES =============== */
        .logo {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          text-decoration: none;
          color: white;
          padding: 0.3rem 0.5rem;
        }

        .logo-img {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          object-fit: cover;
          background: rgba(255, 255, 255, 0.96);
          padding: 0.3rem;
          border: 1px solid rgba(251, 191, 36, 0.45);
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.08);
        }

        .logo-text {
          font-size: 0.92rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.92);
        }

        .logo-domain {
          color: #f9b23c;
          font-weight: 600;
        }

        .nav-links, .sidebar-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2.25rem;
          flex: 1;
        }

        .nav-links .nav-icon {
          display: none;
        }

        .nav-links .nav-item {
          position: relative;
          text-transform: uppercase;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          padding: 0.4rem 0;
        }

        .nav-links .nav-item::after {
          content: "";
          position: absolute;
          left: 0;
          right: 100%;
          bottom: -2px;
          height: 1px;
          background: linear-gradient(90deg, #f9b23c, #f97316);
          transition: right 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-links .nav-item:hover::after {
          right: 0;
        }

        .sidebar-links {
          flex-direction: column;
          align-items: stretch;
          gap: 0.35rem;
          padding: 0;
        }

        .nav-item {
          display: inline-flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.76);
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
          padding: 0.65rem 0;
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .sidebar .nav-item {
          width: 100%;
          padding: 0.7rem 0.75rem;
          justify-content: flex-start;
          border-radius: 16px;
        }

        .nav-icon {
          flex-shrink: 0;
          width: 20px;
          opacity: 1;
          margin-right: 0.6rem;
        }

        .nav-auth, .sidebar-auth {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sidebar-auth {
          flex-direction: column;
          align-items: stretch;
          gap: 0.35rem;
          margin-top: auto;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .nav-icon-placeholder {
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.65);
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 50%;
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease;
        }

        .nav-icon-placeholder:hover {
          color: #f9b23c;
          border-color: rgba(251, 191, 36, 0.4);
        }

        .btn-getstarted, .profile-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          padding: 0.65rem 1.25rem;
          min-height: 40px;
          text-decoration: none;
          transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
        }

        .btn-getstarted {
          color: #f9b23c;
          background: transparent;
          border: 1px solid rgba(251, 191, 36, 0.5);
        }

        .btn-getstarted:hover {
          color: #0b0a0a;
          background: linear-gradient(135deg, #f9b23c, #f97316);
          border-color: transparent;
        }

        .profile-btn {
          color: rgba(255, 255, 255, 0.85);
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .profile-btn:hover {
          border-color: rgba(251, 191, 36, 0.4);
          color: #f9b23c;
        }

        .nav-item.sign-in {
          text-transform: uppercase;
          font-size: 0.72rem;
          letter-spacing: 0.14em;
        }

        /* Hover states */
        .nav-item:hover { color: white; transform: translateY(-1px); }
        .sidebar .nav-item:hover {
          background: rgba(251, 191, 36, 0.08);
          transform: none;
        }

        .mobile-menu {
          display: none;
        }

        .mobile-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          border: none;
          z-index: 1000;
          cursor: pointer;
        }

        .burger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .burger span {
          width: 20px;
          height: 1px;
          background: rgba(255, 255, 255, 0.85);
          transition: transform 0.3s ease, opacity 0.3s ease, background 0.3s ease;
        }

        .burger.open span { background: #f9b23c; }
        .burger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
        .burger.open span:nth-child(2) { opacity: 0; }
        .burger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

        /* =============== MOBILE =============== */
        @media (max-width: 1024px) {
          .app-container {
            padding-top: 88px;
          }

          .nav-links, .nav-auth { display: none; }
          .burger { display: flex; }
          
          .mobile-menu {
            display: grid;
            align-content: start;
            gap: 0.5rem;
            position: fixed;
            top: 0;
            right: 0;
            width: min(340px, 100%);
            height: 100vh;
            padding: 6.5rem 1.5rem 2rem;
            background: linear-gradient(180deg, rgba(14, 13, 13, 0.98), rgba(8, 7, 7, 0.99));
            border-left: 1px solid rgba(251, 191, 36, 0.16);
            backdrop-filter: blur(24px);
            transform: translateX(100%);
            transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1001;
          }
          .mobile-menu.open { transform: translateX(0); }

          .mobile-nav-item {
            display: block;
            padding: 0.9rem 0.25rem;
            color: rgba(255, 255, 255, 0.82);
            text-decoration: none;
            text-transform: uppercase;
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 0.14em;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            transition: color 0.2s ease;
          }

          .mobile-nav-item:hover { color: #f9b23c; }

          .mobile-menu-actions {
            margin-top: 1.5rem;
            display: grid;
            gap: 0.75rem;
          }

          .mobile-btn-primary {
            text-align: center;
            padding: 0.85rem;
            border-radius: 4px;
            text-decoration: none;
            text-transform: uppercase;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.14em;
            color: #0b0a0a;
            background: linear-gradient(135deg, #f9b23c, #f97316);
          }

          .mobile-btn-outline {
            text-align: center;
            padding: 0.85rem;
            border-radius: 4px;
            text-decoration: none;
            text-transform: uppercase;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.14em;
            color: white;
            border: 1px solid rgba(251, 191, 36, 0.4);
          }

          .mobile-sign-in {
            border-bottom: none;
            color: rgba(255, 255, 255, 0.6);
          }
        }

        /* Keep your other existing media queries if needed */
        @media (min-width: 1025px) {
          /* Push page content down so it doesn't sit underneath the floating navbar */
          .app-container {
            padding-top: 96px;
            transition: padding-top 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Once scrolled and the sidebar takes over, the top bar hides itself,
             so swap the top clearance for left clearance instead */
          body.has-sidebar-nav .app-container {
            padding-top: 0;
            padding-left: 108px;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;