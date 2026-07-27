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
          padding: 0.85rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(249, 115, 22, 0.95));
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 26px 55px rgba(249, 115, 22, 0.24);
          backdrop-filter: blur(22px);
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
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(249, 115, 22, 0.95));
          border-radius: 28px;
          box-shadow: 0 26px 55px rgba(249, 115, 22, 0.24);
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
          gap: 0.75rem;
          text-decoration: none;
          color: white;
          padding: 0.5rem 0.85rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .logo-img {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          background: white;
          padding: 0.35rem;
        }

        .logo-text {
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: white;
        }

        .logo-domain { color: #f97316; }

        .nav-links, .sidebar-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          flex: 1;
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
          width: 44px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          cursor: pointer;
        }

        .btn-getstarted, .profile-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 0.75rem 1.35rem;
          min-height: 44px;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .btn-getstarted {
          color: white;
          background: linear-gradient(135deg, #f97316, #fbbf24);
          box-shadow: 0 18px 36px rgba(249, 115, 22, 0.24);
        }

        .profile-btn {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.16);
        }

        /* Hover states */
        .nav-item:hover { color: white; transform: translateY(-1px); }
        .sidebar .nav-item:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: none;
        }

        /* =============== MOBILE =============== */
        @media (max-width: 1024px) {
          .nav-links, .nav-auth { display: none; }
          .burger { display: flex; }
          
          .mobile-menu {
            display: grid;
            position: fixed;
            top: 84px;
            right: 0;
            width: min(360px, 100%);
            height: calc(100vh - 84px);
            padding: 1.25rem;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(24px);
            transform: translateX(100%);
            transition: transform 0.28s ease;
            z-index: 1001;
          }
          .mobile-menu.open { transform: translateX(0); }
        }

        /* Keep your other existing media queries if needed */
        @media (min-width: 1025px) {
          body.has-sidebar-nav .app-container {
            padding-left: 108px;
            transition: padding-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;