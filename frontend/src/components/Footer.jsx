import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import logo from "../assets/images/logo.png";

const socialIcons = [
  {
    label: "Facebook",
    path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  },
  {
    label: "Twitter",
    path: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
  },
  {
    label: "Instagram",
    path: "M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5",
  },
  {
    label: "LinkedIn",
    path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6M2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  },
  {
    label: "YouTube",
    path: "M22.54 6.42a2.78 2.78 0 0 0-1.95-2C18.88 4 12 4 12 4s-6.88 0-8.59.42a2.78 2.78 0 0 0-1.95 2 29 29 0 0 0-.42 5.58 29 29 0 0 0 .42 5.58 2.78 2.78 0 0 0 1.95 2C5.12 20 12 20 12 20s6.88 0 8.59-.42a2.78 2.78 0 0 0 1.95-2 29 29 0 0 0 .42-5.58 29 29 0 0 0-.42-5.58",
  },
];

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-cta-banner">
        <div className="container footer-cta-inner">
          <div className="footer-cta-text">
            <h2>Ready to hit the road?</h2>
            <p>
              Browse hundreds of verified vehicles or list your own and start
              earning today.
            </p>
          </div>
          <div className="footer-cta-actions">
            <Link to="/vehicles" className="footer-cta-btn primary">
              Browse Vehicles <ArrowUpRight size={18} />
            </Link>
            <Link to="/list-my-car" className="footer-cta-btn outline">
              List Your Car
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src={logo} alt="CarRents.lk" className="footer-logo-img" />
              <span>
                CarRents<span className="dot-lk">.lk</span>
              </span>
            </Link>
            <p className="footer-tagline">
              Sri Lanka's most trusted car sharing marketplace. Rent verified
              vehicles or earn by listing yours.
            </p>
            <div className="footer-social">
              {socialIcons.map((icon) => (
                <a
                  key={icon.label}
                  href="#"
                  className="social-link"
                  aria-label={icon.label}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={icon.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>Rent</h4>
            <Link to="/vehicles">Browse Cars</Link>
            <Link to="/vehicles">SUVs & Vans</Link>
            <Link to="/companies">Rental Companies</Link>
            <Link to="/vehicles">Luxury Cars</Link>
          </div>

          <div className="footer-col">
            <h4>Host</h4>
            <Link to="/list-my-car">List Your Vehicle</Link>
            <Link to="/select-role">Become a Host</Link>
            <Link to="/company-dashboard">Company Dashboard</Link>
            <Link to="/why-us">Host Benefits</Link>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/why-us">Why CarRents.lk</Link>
            <Link to="/#how-it-works">How It Works</Link>
            <Link to="/companies">Partners</Link>
            <Link to="/login">Sign In</Link>
          </div>

          <div className="footer-col footer-contact">
            <h4>Contact</h4>
            <a href="tel:+94112345678">
              <Phone size={14} /> +94 11 234 5678
            </a>
            <a href="mailto:hello@carrents.lk">
              <Mail size={14} /> hello@carrents.lk
            </a>
            <span>
              <MapPin size={14} /> Colombo, Sri Lanka
            </span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            &copy; {new Date().getFullYear()} CarRents.lk. All rights reserved.
          </p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>

      <style>{`
        .site-footer {
          margin-top: auto;
        }

        .footer-cta-banner {
          background: var(--grad-orange-dark);
          padding: 4rem 0;
          position: relative;
          overflow: hidden;
        }

        .footer-cta-banner::before {
          content: "";
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.5;
        }

        .footer-cta-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          position: relative;
          z-index: 1;
        }

        .footer-cta-text h2 {
          font-family: var(--font-display);
          font-size: clamp(1.75rem, 3vw, 2.25rem);
          color: white;
          margin-bottom: 0.5rem;
        }

        .footer-cta-text p {
          color: rgba(255, 255, 255, 0.85);
          font-size: 1.05rem;
          max-width: 480px;
        }

        .footer-cta-actions {
          display: flex;
          gap: 1rem;
          flex-shrink: 0;
        }

        .footer-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 1.75rem;
          border-radius: var(--radius-pill);
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .footer-cta-btn.primary {
          background: white;
          color: var(--primary-dark);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .footer-cta-btn.primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
        }

        .footer-cta-btn.outline {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .footer-cta-btn.outline:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
        }

        .footer-main {
          background: #1c1917;
          padding: 4rem 0 3rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr repeat(4, 1fr);
          gap: 2.5rem;
        }

        @media (max-width: 900px) {
          .footer-cta-inner,
          .footer-bottom-inner {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }

          .footer-cta-actions {
            justify-content: center;
            width: 100%;
            flex-wrap: wrap;
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }

          .footer-brand {
            text-align: center;
          }

          .footer-contact {
            align-items: center;
          }
        }

        @media (max-width: 640px) {
          .footer-cta-banner {
            padding: 3rem 0;
          }

          .footer-cta-text h2 {
            font-size: 1.6rem;
          }

          .footer-cta-text p {
            max-width: 100%;
          }

          .footer-cta-actions {
            flex-direction: column;
          }

          .footer-cta-btn {
            width: 100%;
            justify-content: center;
          }

          .footer-grid {
            gap: 1.75rem;
          }
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1.25rem;
        }

        .footer-logo-img {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .footer-logo span {
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
        }

        .dot-lk {
          color: var(--primary-light) !important;
        }

        .footer-tagline {
          color: #c7c2bd;
          font-size: 0.95rem;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          max-width: 320px;
        }

        .footer-social {
          display: flex;
          gap: 0.75rem;
        }

        .social-link {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d6d3d1;
          transition: all 0.25s ease;
        }

        .social-link:hover {
          background: var(--primary);
          color: white;
          transform: translateY(-2px);
        }

        .footer-col h4 {
          color: white;
          margin-bottom: 1.1rem;
          font-size: 1rem;
        }

        .footer-col a {
          display: block;
          color: #d6d3d1;
          margin-bottom: 0.9rem;
          font-size: 0.95rem;
          transition: color 0.25s ease;
        }

        .footer-col a:hover {
          color: white;
        }

        .footer-contact span,
        .footer-contact a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #d6d3d1;
          margin-bottom: 0.9rem;
          font-size: 0.95rem;
        }

        .footer-contact a:hover {
          color: white;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          padding: 1.5rem 0;
          color: #c7c2bd;
        }

        .footer-bottom-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .footer-bottom p {
          color: #c7c2bd;
          font-size: 0.95rem;
        }

        .footer-legal {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .footer-legal a {
          color: #d6d3d1;
          font-size: 0.95rem;
          transition: color 0.25s ease;
        }

        .footer-legal a:hover {
          color: white;
        }

        .footer-col h4 {
          color: white;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 1.25rem;
        }

        .footer-col a,
        .footer-col span {
          display: block;
          color: #a8a29e;
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
          transition: color 0.2s;
        }

        .footer-col a:hover {
          color: var(--primary-light);
        }

        .footer-contact a,
        .footer-contact span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer-bottom {
          background: #0c0a09;
          padding: 1.25rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .footer-bottom-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .footer-bottom p {
          color: #78716c;
          font-size: 0.85rem;
        }

        .footer-legal {
          display: flex;
          gap: 1.5rem;
        }

        .footer-legal a {
          color: #78716c;
          font-size: 0.85rem;
          transition: color 0.2s;
        }

        .footer-legal a:hover {
          color: var(--primary-light);
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
          .footer-brand {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 768px) {
          .footer-cta-inner {
            flex-direction: column;
            text-align: center;
          }
          .footer-cta-text p {
            margin: 0 auto;
          }
          .footer-cta-actions {
            flex-direction: column;
            width: 100%;
          }
          .footer-cta-btn {
            justify-content: center;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .footer-bottom-inner {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
