import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png.jpeg";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

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

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon">
            {/* Logo imported from src/assets */}
            <img src={logo} alt="CarRents.lk Logo" className="logo-img" />
          </div>
          <span className="logo-text">
            CarRents<span className="logo-domain">.lk</span>
          </span>
        </Link>

        {/* Nav Links - Centered */}
        <div className="nav-links">
          <Link to="/vehicles" className="nav-item">
            Rent
          </Link>
          {user && user.role === "company" ? (
            <Link to="/company-dashboard" className="nav-item">
              Dashboard
            </Link>
          ) : (
            <Link to="/list-my-car" className="nav-item">
              List Vehicle
            </Link>
          )}
          <Link to="/companies" className="nav-item">
            Companies
          </Link>
          <Link to="/#how-it-works" className="nav-item">
            How it works
          </Link>
          <Link to="/why-us" className="nav-item">
            Why us
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="nav-auth">
          {token ? (
            <Link
              to="/profile"
              className="nav-item btn-primary"
              style={{
                padding: "0.65rem 1.5rem",
                background: "transparent",
                border: "2px solid #f97316",
                color: "#f97316",
              }}
            >
              Profile
            </Link>
          ) : (
            <>
              <Link to="/login" className="nav-item sign-in">
                Sign in
              </Link>
              <Link to="/select-role" className="btn-getstarted">
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`burger ${menuOpen ? "open" : ""}`}
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {menuOpen ? <button className="mobile-backdrop" type="button" aria-label="Close menu backdrop" onClick={closeMenu} /> : null}

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`} id="mobile-menu">
        <div className="mobile-menu-links">
          <Link to="/vehicles" className="mobile-nav-item" onClick={closeMenu}>
            Rent
          </Link>
          {user && user.role === "company" ? (
            <Link
              to="/company-dashboard"
              className="mobile-nav-item"
              onClick={closeMenu}
            >
              Dashboard
            </Link>
          ) : (
            <Link to="/list-my-car" className="mobile-nav-item" onClick={closeMenu}>
              List Vehicle
            </Link>
          )}
          <Link to="/companies" className="mobile-nav-item" onClick={closeMenu}>
            Companies
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
            <Link to="/profile" className="mobile-btn-outline" onClick={closeMenu}>
              Profile
            </Link>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-item mobile-sign-in" onClick={closeMenu}>
                Sign in
              </Link>
              <Link to="/select-role" className="mobile-btn-primary" onClick={closeMenu}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          height: 80px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-inner {
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        /* Formats your custom .png logo */
        .logo-img {
          width: 70px;
          height: 70px;
          object-fit: contain; /* Keeps image proportions intact without stretching */
          display: block;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
        }

        .logo-domain {
          color: #f97316;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .nav-links .nav-item {
          white-space: nowrap;
        }

        .nav-item {
          color: #6b7280;
          font-weight: 500;
          font-size: 0.95rem;
          text-decoration: none;
          transition: color 0.2s;
        }

        .nav-item:hover {
          color: #111827;
        }

        .nav-auth {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .sign-in {
          color: #111827;
          font-weight: 600;
        }

        .btn-getstarted {
          background: #f97316;
          color: white;
          padding: 0.65rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
          border: none;
          box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);
        }

        .btn-getstarted:hover {
          background: #ea580c;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
        }

        .burger {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.75rem;
          transition: background 0.2s ease;
        }

        .burger:hover {
          background: rgba(249, 115, 22, 0.08);
        }

        .burger span {
          width: 24px;
          height: 2px;
          background: #374151;
          transition: 0.3s;
        }

        .burger.open span:nth-child(1) {
          transform: translateY(6px) rotate(45deg);
        }

        .burger.open span:nth-child(2) {
          opacity: 0;
        }

        .burger.open span:nth-child(3) {
          transform: translateY(-6px) rotate(-45deg);
        }

        .mobile-menu {
          display: none;
        }

        .mobile-backdrop {
          display: none;
        }

        .mobile-menu-links,
        .mobile-menu-actions {
          display: flex;
          flex-direction: column;
        }

        .mobile-nav-item,
        .mobile-btn-outline,
        .mobile-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 48px;
          border-radius: 0.9rem;
          font-weight: 600;
          text-align: center;
        }

        .mobile-nav-item {
          color: #111827;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(17, 24, 39, 0.08);
        }

        .mobile-nav-item:hover {
          background: rgba(249, 115, 22, 0.08);
          color: #f97316;
        }

        .mobile-sign-in {
          color: #111827;
        }

        .mobile-btn-outline {
          border: 2px solid #f97316;
          color: #f97316;
          background: rgba(255, 255, 255, 0.75);
        }

        .mobile-btn-primary {
          background: #f97316;
          color: white;
          box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);
        }

        @media (max-width: 1024px) {
          .nav-links {
            display: none;
          }

          .nav-auth {
            display: none;
          }

          .burger {
            display: flex;
          }

          .burger {
            width: 44px;
            height: 44px;
            align-items: center;
            justify-content: center;
          }

          .mobile-menu {
            display: grid;
            gap: 0.75rem;
            position: fixed;
            top: 80px;
            left: 0;
            right: 0;
            padding: 1rem 1.25rem 1.25rem;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 18px 35px rgba(17, 24, 39, 0.12);
            max-height: calc(100vh - 80px);
            overflow-y: auto;
            z-index: 1001;
          }

          .mobile-menu:not(.open) {
            display: none;
          }

          .mobile-backdrop {
            display: block;
            position: fixed;
            inset: 80px 0 0;
            width: 100%;
            background: rgba(17, 24, 39, 0.28);
            border: none;
            padding: 0;
            z-index: 1000;
          }

          .mobile-menu-actions {
            gap: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .nav-inner {
            padding: 0 1rem;
          }

          .logo-text {
            font-size: 1.05rem;
          }

          .logo-img {
            width: 28px;
            height: 28px;
          }

          .burger {
            width: 40px;
            height: 40px;
            padding: 0.4rem;
          }

          .mobile-menu {
            padding: 0.9rem 1rem 1rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
