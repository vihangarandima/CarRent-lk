import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import logo from "../assets/images/logo.png";
import fleetImage from "../assets/images/yamu_fleet_cutout.png";

const DEFAULT_POINTS = [
  "Bikes, tuk-tuks, cars and vans across Sri Lanka",
  "Contact owners directly on WhatsApp",
  "No middleman fees",
];

// Shared shell for sign in, sign up and onboarding pages.
// Desktop: orange brand panel on the left, form on the right. Phones: slim orange header, form below.
const AuthLayout = ({ title, subtitle, children, wide = false, panelTitle, panelPoints = DEFAULT_POINTS }) => (
  <div className="auth-shell">
    <aside className="auth-panel">
      <Link to="/" className="auth-brand">
        <img src={logo} alt="" className="auth-brand-logo" />
        <span>Yamu Car Rentals</span>
      </Link>
      <div className="auth-panel-copy">
        <h2>{panelTitle || "Find your ride. List your vehicle."}</h2>
        <ul>
          {panelPoints.map((point) => (
            <li key={point}>
              <CheckCircle2 size={18} /> {point}
            </li>
          ))}
        </ul>
      </div>
      <img src={fleetImage} alt="Yamu vehicles: motorbike, tuk-tuk, car and van" className="auth-panel-fleet" />
    </aside>

    <main className="auth-main">
      <div className={`auth-form-wrap ${wide ? "auth-form-wide" : ""}`}>
        <Link to="/" className="auth-brand auth-brand-mobile">
          <img src={logo} alt="" className="auth-brand-logo" />
          <span>Yamu Car Rentals</span>
        </Link>
        <div className="auth-card">
          {title && <h1 className="auth-title">{title}</h1>}
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>
    </main>

    <style>{`
      .auth-shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: minmax(360px, 44%) 1fr;
        background: var(--bg);
      }
      .auth-panel {
        position: sticky; top: 0; height: 100vh;
        display: flex; flex-direction: column; justify-content: space-between;
        padding: 2.5rem 3rem 0;
        background: var(--grad-hero);
        color: #fff;
        overflow: hidden;
      }
      .auth-brand {
        display: inline-flex; align-items: center; gap: 0.6rem;
        font-family: var(--font-display); font-weight: 800; font-size: 1.35rem;
        color: #fff; text-decoration: none;
      }
      .auth-brand-logo { width: 40px; height: 40px; object-fit: contain; }
      .auth-panel-copy h2 {
        color: #fff; font-size: clamp(1.8rem, 2.6vw, 2.5rem); font-weight: 800; line-height: 1.15;
        text-shadow: 0 4px 24px rgba(124, 45, 18, 0.25);
      }
      .auth-panel-copy ul { list-style: none; margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
      .auth-panel-copy li { display: flex; align-items: center; gap: 0.6rem; color: rgba(255, 255, 255, 0.95); font-weight: 600; }
      .auth-panel-fleet { width: 112%; max-width: none; margin-left: -6%; align-self: center; filter: drop-shadow(0 20px 30px rgba(0,0,0,0.25)); }

      .auth-main { display: flex; align-items: center; justify-content: center; padding: 3rem 1.5rem; }
      .auth-form-wrap { width: 100%; max-width: 420px; }
      .auth-form-wide { max-width: 620px; }
      .auth-brand-mobile { display: none; }
      .auth-title { font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; }
      .auth-subtitle { margin-top: 0.4rem; margin-bottom: 1.75rem; font-size: 0.98rem; }

      /* Shared bits used by the auth forms */
      .auth-form { display: flex; flex-direction: column; gap: 1rem; }
      .auth-divider {
        display: flex; align-items: center; gap: 0.75rem; margin: 1.25rem 0;
        color: var(--text-hint); font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em;
      }
      .auth-divider::before, .auth-divider::after { content: ""; flex: 1; height: 1px; background: var(--border); }
      .auth-footer-text { text-align: center; margin-top: 1.5rem; font-size: 0.92rem; }
      .auth-footer-text a, .auth-link { color: var(--primary-dark); font-weight: 700; }
      .auth-link { background: none; border: none; padding: 0; cursor: pointer; font-size: 0.85rem; }
      .auth-password { position: relative; }
      .auth-password .y-input { padding-right: 3rem; }
      .auth-password-toggle {
        position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%);
        width: 36px; height: 36px; display: grid; place-items: center;
        background: none; color: var(--text-hint); border-radius: 50%;
      }
      .auth-password-toggle:hover { color: var(--primary); }
      .auth-google-icon { width: 18px; height: 18px; }

      @media (max-width: 960px) {
        .auth-shell { grid-template-columns: minmax(0, 1fr); }
        .auth-main { min-width: 0; }
        .auth-panel { display: none; }
        .auth-main { align-items: flex-start; padding: 0 0 3rem; }
        .auth-form-wrap { max-width: none; }
        .auth-brand-mobile {
          display: flex; justify-content: center; padding: 1.25rem 1rem 3.25rem; margin-bottom: -2rem;
          background: var(--grad-hero);
        }
        .auth-card {
          margin: 0 1rem; padding: 1.5rem 1.25rem;
          background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-card);
          position: relative;
        }
      }
    `}</style>
  </div>
);

export default AuthLayout;
