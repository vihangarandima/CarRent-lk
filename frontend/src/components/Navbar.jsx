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
    <>
      <nav className={`hero-nav ${scrolled ? "scrolled" : ""}`}>
        <Link to="/" className="nav-logo">
          CarRents.lk
        </Link>
        
        <div className="nav-links hidden-mobile">
          <Link to="/vehicles">Rent</Link>
          {user && user.role === "company" ? (
            <Link to="/company-dashboard">Dashboard</Link>
          ) : (
            <Link to="/list-my-car">List Vehicle</Link>
          )}
          <Link to="/companies">Companies</Link>
          <Link to="/#how-it-works">How it works</Link>
          <Link to="/why-us">Why us</Link>
        </div>
        
        <div className="nav-actions hidden-mobile">
          {token ? (
            <Link to="/profile" className="nav-btn-outline">Profile</Link>
          ) : (
            <>
              <Link to="/login" className="nav-signin">Sign In</Link>
              <Link to="/select-role" className="nav-btn">Get Started</Link>
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
          <Link to="/vehicles" className="mobile-nav-item" onClick={closeMenu}>
            Rent
          </Link>
          {user && user.role === "company" ? (
            <Link to="/company-dashboard" className="mobile-nav-item" onClick={closeMenu}>
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
              <Link to="/login" className="mobile-btn-outline" onClick={closeMenu}>
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
          font-family: 'Inter', system-ui, sans-serif;
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
          color: #111111;
          text-decoration: none;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
          gap: 1.5rem;
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

        .nav-btn-outline {
          background: transparent;
          color: #111111;
          border: 2px solid #111111;
          padding: 0.6rem 1.4rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
          transition: all 0.2s;
        }

        .nav-btn-outline:hover {
          background: #111111;
          color: white;
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