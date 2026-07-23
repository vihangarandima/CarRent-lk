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

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <Link to="/" className="logo">
          <img src={logo} alt="CarRents.lk Logo" className="logo-img" />
          <span className="logo-text">
            CarRents<span className="logo-domain">.lk</span>
          </span>
        </Link>

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

        <div className="nav-auth">
          <div className="nav-icon-placeholder" title="Favorites (Coming Soon)">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          {token ? (
            <Link to="/profile" className="nav-item profile-btn">
              Profile
            </Link>
          ) : (
            <>
              <Link to="/login" className="nav-item sign-in">
                Sign In
              </Link>
              <Link to="/select-role" className="btn-getstarted">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className={`burger ${menuOpen ? "open" : ""}`}
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen ? (
        <button
          className="mobile-backdrop"
          type="button"
          aria-label="Close menu backdrop"
          onClick={closeMenu}
        />
      ) : null}

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
            <Link
              to="/list-my-car"
              className="mobile-nav-item"
              onClick={closeMenu}
            >
              List Vehicle
            </Link>
          )}
          <Link to="/companies" className="mobile-nav-item" onClick={closeMenu}>
            Companies
          </Link>
          <Link
            to="/#how-it-works"
            className="mobile-nav-item"
            onClick={closeMenu}
          >
            How it works
          </Link>
          <Link to="/why-us" className="mobile-nav-item" onClick={closeMenu}>
            Why us
          </Link>
        </div>

        <div className="mobile-menu-actions">
          {token ? (
            <Link
              to="/profile"
              className="mobile-btn-outline"
              onClick={closeMenu}
            >
              Profile
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="mobile-nav-item mobile-sign-in"
                onClick={closeMenu}
              >
                Sign in
              </Link>
              <Link
                to="/select-role"
                className="mobile-btn-primary"
                onClick={closeMenu}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          position: sticky;
          top: 1rem;
          z-index: 1000;
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 0 1rem;
          background: transparent;
        }

        .navbar.scrolled {
          top: 0.5rem;
        }

        .nav-inner {
          width: min(1200px, 100%);
          margin: 0 auto;
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
          -webkit-backdrop-filter: blur(22px);
          pointer-events: auto;
        }

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

        .logo-domain {
          color: #f97316;
        }

        .nav-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          flex: 1;
          min-width: 0;
          padding: 0 1rem;
        }

        .nav-item {
          color: rgba(255, 255, 255, 0.76);
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
          position: relative;
          transition: color 0.2s ease, transform 0.2s ease;
          padding: 0.65rem 0;
        }

        .nav-item:hover {
          color: white;
          transform: translateY(-1px);
        }

        .nav-item::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: #f97316;
          border-radius: 999px;
          transition: width 0.22s ease;
        }

        .nav-item:hover::after {
          width: 100%;
        }

        .nav-auth {
          display: flex;
          align-items: center;
          gap: 0.75rem;
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
          transition: background 0.2s ease, color 0.2s ease;
          cursor: pointer;
        }

        .nav-icon-placeholder:hover {
          color: white;
          background: rgba(255, 255, 255, 0.14);
        }

        .sign-in {
          color: white;
          font-weight: 700;
        }

        .btn-getstarted,
        .profile-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          padding: 0.75rem 1.35rem;
          min-height: 44px;
          white-space: nowrap;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .btn-getstarted {
          color: white;
          background: linear-gradient(135deg, #f97316, #fbbf24);
          box-shadow: 0 18px 36px rgba(249, 115, 22, 0.24);
          border: 1px solid transparent;
        }

        .btn-getstarted:hover {
          transform: translateY(-1px);
          box-shadow: 0 22px 42px rgba(249, 115, 22, 0.28);
        }

        .profile-btn {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.16);
        }

        .profile-btn:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.18);
        }

        .burger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          cursor: pointer;
          padding: 0.75rem;
          border-radius: 16px;
          transition: transform 0.2s ease, background 0.2s ease;
          z-index: 2;
        }

        .burger:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.14);
        }

        .burger span {
          width: 22px;
          height: 2px;
          background: white;
          transition: 0.3s;
          border-radius: 999px;
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
          gap: 0.75rem;
        }

        .mobile-nav-item,
        .mobile-btn-outline,
        .mobile-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 52px;
          border-radius: 18px;
          font-weight: 700;
          text-align: center;
        }

        .mobile-nav-item {
          color: var(--text);
          background: var(--bg);
          border: 1px solid var(--border);
          padding: 1rem;
        }

        .mobile-nav-item:hover {
          background: var(--primary-soft);
          color: var(--primary);
          border-color: rgba(249, 115, 22, 0.2);
        }

        .mobile-btn-outline {
          border: 2px solid var(--primary);
          color: var(--primary);
          background: white;
          padding: 1rem;
        }

        .mobile-btn-primary {
          background: var(--grad-primary);
          color: white;
          box-shadow: 0 8px 24px rgba(249, 115, 22, 0.18);
          padding: 1rem;
        }

        @media (max-width: 1024px) {
          .nav-links,
          .nav-auth {
            display: none;
          }

          .burger {
            display: flex;
            width: 50px;
            height: 50px;
            align-items: center;
            justify-content: center;
          }

          .mobile-menu {
            display: grid;
            gap: 1rem;
            position: fixed;
            top: 84px;
            right: 0;
            width: min(360px, 100%);
            height: calc(100vh - 84px);
            padding: 1.25rem;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(24px);
            border-left: 1px solid rgba(229, 231, 235, 0.8);
            box-shadow: -12px 0 36px rgba(15, 23, 42, 0.12);
            transform: translateX(100%);
            transition: transform 0.28s ease;
            overflow-y: auto;
            z-index: 1001;
          }

          .mobile-menu.open {
            transform: translateX(0);
          }

          .mobile-menu:not(.open) {
            pointer-events: none;
          }

          .mobile-backdrop {
            display: block;
            position: fixed;
            inset: 84px 0 0;
            width: 100%;
            background: rgba(15, 23, 42, 0.32);
            border: none;
            padding: 0;
            z-index: 1000;
          }
        }

        @media (max-width: 768px) {
          .nav-inner {
            padding: 0.75rem 0.85rem;
          }

          .logo-text {
            font-size: 0.98rem;
          }

          .logo-img {
            width: 40px;
            height: 40px;
          }

          .nav-auth {
            gap: 0.65rem;
          }
        }

        @media (max-width: 640px) {
          .nav-inner {
            gap: 0.75rem;
          }

          .nav-links {
            display: none;
          }

          .logo {
            padding: 0.55rem 0.75rem;
          }

          .logo-img {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
