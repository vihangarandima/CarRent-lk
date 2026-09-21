import React from "react";
import { MessageCircle } from "lucide-react";
import { useSiteConfig } from "../context/SiteConfigContext";

const WhatsAppFloat = () => {
  const { config } = useSiteConfig();
  const wa = config?.global?.whatsAppSupport;

  if (!wa || !wa.enabled || !wa.phoneNumber) return null;

  const cleanNumber = wa.phoneNumber.replace(/[^0-9]/g, "");
  const encodedMsg = encodeURIComponent(
    wa.greetingMessage || "Hello Yamu Team! I need assistance with vehicle rental."
  );
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-float-btn"
      aria-label="Chat with us on WhatsApp"
      title="Quick WhatsApp Support"
    >
      <div className="wa-pulse" />
      <MessageCircle size={28} className="wa-icon" />
      <span className="wa-tooltip">Chat with Yamu</span>

      <style>{`
        .wa-float-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #25d366;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(37, 211, 102, 0.45);
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s ease;
          text-decoration: none;
        }

        .wa-float-btn:hover {
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 12px 30px rgba(37, 211, 102, 0.6);
        }

        .wa-pulse {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid #25d366;
          opacity: 0.8;
          animation: waPulse 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
        }

        @keyframes waPulse {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          70% {
            transform: scale(1.35);
            opacity: 0;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        .wa-tooltip {
          position: absolute;
          right: 70px;
          white-space: nowrap;
          background: #0f172a;
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          opacity: 0;
          transform: translateX(10px);
          pointer-events: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .wa-float-btn:hover .wa-tooltip {
          opacity: 1;
          transform: translateX(0);
        }

        @media (max-width: 640px) {
          .wa-float-btn {
            bottom: 20px;
            right: 20px;
            width: 52px;
            height: 52px;
          }
          .wa-tooltip {
            display: none;
          }
        }
      `}</style>
    </a>
  );
};

export default WhatsAppFloat;
