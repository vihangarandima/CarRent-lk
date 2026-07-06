import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

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
          <a href="#how-it-works" className="nav-item">
            How it works
          </a>
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
        <button className="burger" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={menuOpen ? "open" : ""}></span>
          <span className={menuOpen ? "open" : ""}></span>
          <span className={menuOpen ? "open" : ""}></span>
        </button>
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
          width: 32px;
          height: 32px;
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
        }

        .burger span {
          width: 24px;
          height: 2px;
          background: #374151;
          transition: 0.3s;
        }

        @media (max-width: 1024px) {
          .nav-links {
            display: none;
          }
          .burger {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
