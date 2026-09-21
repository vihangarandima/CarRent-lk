import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, X, ArrowRight } from "lucide-react";
import { useSiteConfig } from "../context/SiteConfigContext";

const AnnouncementBar = () => {
  const { config } = useSiteConfig();
  const [closed, setClosed] = useState(false);
  const ann = config?.global?.announcement;

  if (!ann || !ann.enabled || !ann.text || closed) return null;

  return (
    <div
      className="top-announcement-bar"
      style={{
        backgroundColor: ann.bgColor || "var(--primary)",
        color: ann.textColor || "#ffffff",
      }}
    >
      <div className="announcement-content">
        <Sparkles size={16} className="ann-icon" />
        <span className="ann-text">{ann.text}</span>
        {ann.link && (
          <Link to={ann.link} className="ann-link">
            Learn More <ArrowRight size={13} />
          </Link>
        )}
      </div>
      <button
        type="button"
        onClick={() => setClosed(true)}
        className="ann-close-btn"
        aria-label="Dismiss banner"
      >
        <X size={15} />
      </button>

      <style>{`
        .top-announcement-bar {
          position: relative;
          z-index: 1001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 16px;
          font-size: 0.85rem;
          font-weight: 600;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .announcement-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ann-icon {
          flex-shrink: 0;
          animation: spinSlow 8s linear infinite;
        }

        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .ann-text {
          letter-spacing: 0.01em;
        }

        .ann-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: inherit;
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 700;
          transition: opacity 0.2s;
        }

        .ann-link:hover {
          opacity: 0.85;
        }

        .ann-close-btn {
          position: absolute;
          right: 12px;
          background: rgba(0, 0, 0, 0.15);
          border: none;
          color: inherit;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .ann-close-btn:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 640px) {
          .top-announcement-bar {
            font-size: 0.78rem;
            padding: 7px 32px 7px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBar;
