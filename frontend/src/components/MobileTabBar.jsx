import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Plus, Star, UserRound } from "lucide-react";
import { DASHBOARD_PATH, getStoredUser, isLister } from "../utils/session";

// Browse pages get the app-style bottom bar on phones. Forms and detail pages
// keep the screen for their own sticky actions.
const TAB_BAR_PATHS = ["/", "/home", "/vehicles", "/companies", "/reviews", "/reviews-portal", "/why-us", "/profile", "/earnings-calculator"];

export const showsMobileTabBar = (pathname) =>
  TAB_BAR_PATHS.includes(pathname) || pathname.startsWith("/companies/");

const MobileTabBar = () => {
  const location = useLocation();
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    const sync = () => {
      setUser(getStoredUser());
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("user-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("user-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const lister = Boolean(token) && isLister(user);
  const listTarget =
    user?.role === "company"
      ? "/fleet/quick-add"
      : user?.role === "owner"
      ? "/list-my-car"
      : "/choose-listing-type";
  const accountTarget = !token
    ? "/login"
    : user?.role === "admin"
    ? "/admin"
    : lister
    ? DASHBOARD_PATH
    : "/profile";

  const path = location.pathname;
  const tabs = [
    { to: "/", label: "Home", icon: Home, active: path === "/" || path === "/home" },
    { to: "/vehicles", label: "Explore", icon: Search, active: path.startsWith("/vehicles") },
    { to: listTarget, label: "List car", icon: Plus, primary: true },
    { to: "/reviews", label: "Reviews", icon: Star, active: path === "/reviews" || path === "/reviews-portal" },
    { to: accountTarget, label: token ? "Account" : "Sign in", icon: UserRound, active: path === "/profile" },
  ];

  return (
    <nav className="mobile-tab-bar" aria-label="Primary">
      {tabs.map(({ to, label, icon: Icon, active, primary }) => (
        <Link
          key={label}
          to={to}
          className={`mtb-item ${active ? "active" : ""} ${primary ? "primary" : ""}`}
          aria-current={active ? "page" : undefined}
        >
          <span className="mtb-icon">
            <Icon size={primary ? 24 : 21} strokeWidth={primary ? 2.6 : active ? 2.4 : 2} />
          </span>
          <span className="mtb-label">{label}</span>
        </Link>
      ))}

      <style>{`
        .mobile-tab-bar {
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-tab-bar {
            position: fixed;
            left: 10px;
            right: 10px;
            bottom: calc(10px + env(safe-area-inset-bottom, 0px));
            /* Below the slide-out menu's backdrop (998) */
            z-index: 990;
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            align-items: end;
            height: 64px;
            padding: 0 4px;
            background: rgba(255, 255, 255, 0.86);
            backdrop-filter: saturate(180%) blur(18px);
            -webkit-backdrop-filter: saturate(180%) blur(18px);
            border: 1px solid rgba(15, 23, 42, 0.06);
            border-radius: 22px;
            box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.22), 0 2px 6px rgba(15, 23, 42, 0.06);
          }

          .mtb-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            height: 64px;
            color: #78716c;
            text-decoration: none;
            -webkit-tap-highlight-color: transparent;
            transition: color 0.2s ease, transform 0.15s ease;
          }

          .mtb-item:active {
            transform: scale(0.92);
          }

          .mtb-icon {
            display: grid;
            place-items: center;
            width: 44px;
            height: 28px;
            border-radius: 999px;
            transition: background 0.25s ease;
          }

          .mtb-label {
            font-size: 0.68rem;
            font-weight: 600;
            letter-spacing: 0.01em;
            line-height: 1;
          }

          .mtb-item.active {
            color: #ea580c;
          }

          .mtb-item.active .mtb-icon {
            background: rgba(249, 115, 22, 0.12);
          }

          .mtb-item.active .mtb-label {
            font-weight: 800;
          }

          /* Raised centre action */
          .mtb-item.primary {
            color: #ea580c;
            justify-content: flex-end;
            padding-bottom: 9px;
          }

          .mtb-item.primary .mtb-icon {
            width: 52px;
            height: 52px;
            margin-top: -26px;
            margin-bottom: 2px;
            color: #ffffff;
            background: linear-gradient(135deg, #ff8800 0%, #f97316 45%, #ea580c 100%);
            border: 4px solid #ffffff;
            box-shadow: 0 10px 22px -6px rgba(234, 88, 12, 0.6);
          }

          .mtb-item.primary .mtb-label {
            font-weight: 800;
          }
        }
      `}</style>
    </nav>
  );
};

export default MobileTabBar;
