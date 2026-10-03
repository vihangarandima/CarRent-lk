import React, { useState } from "react";
import {
  MessageCircle,
  BadgePercent,
  MapPinned,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "../context/SiteConfigContext";
import PageHero from "../components/PageHero";

// What the platform actually does today — keep these claims accurate
const features = [
  {
    icon: MessageCircle,
    title: "Talk to the owner directly",
    desc: "Message the vehicle owner or rental company on WhatsApp, agree on dates and pick up. No call centres.",
  },
  {
    icon: BadgePercent,
    title: "No middleman fees",
    desc: "You pay the owner's listed daily price. Yamu does not add booking fees on top.",
  },
  {
    icon: MapPinned,
    title: "Vehicles across Sri Lanka",
    desc: "Bikes, tuk-tuks, cars, vans and premium vehicles, searchable by type, location and price.",
  },
  {
    icon: ShieldCheck,
    title: "Real reviews",
    desc: "Read what other renters say about a vehicle or company before you contact them.",
  },
];

const WhyUs = () => {
  const { config } = useSiteConfig();
  const whyUs = config?.whyUs;
  const [openFaq, setOpenFaq] = useState(0);
  const faqs = whyUs?.faqs?.length ? whyUs.faqs : [];

  return (
    <div className="why-page">
      <PageHero
        badge={whyUs?.badge || "Why Yamu"}
        title={whyUs?.title || "Why rent with"}
        highlight={whyUs?.title ? undefined : "Yamu Car Rentals?"}
        subtitle={
          whyUs?.subtitle ||
          "A simple way to find a vehicle in Sri Lanka and deal directly with the people who own it."
        }
      />

      <div className="container">
        <div className="why-features y-overlap">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="y-card why-feature">
              <span className="why-feature-icon">
                <Icon size={24} />
              </span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>

        {faqs.length > 0 && (
          <section className="why-faq">
            <div className="why-section-head">
              <span className="y-badge">Questions</span>
              <h2>Frequently asked questions</h2>
            </div>
            <div className="why-faq-list">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={faq.q} className={`why-faq-item ${isOpen ? "open" : ""}`}>
                    <button
                      type="button"
                      className="why-faq-q"
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={18} className="why-faq-chevron" />
                    </button>
                    {isOpen && <p className="why-faq-a">{faq.a}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="why-cta">
          <div>
            <h2>Ready to hit the road?</h2>
            <p>Find a vehicle near you, or list your own and start earning.</p>
          </div>
          <div className="why-cta-actions">
            <Link to="/vehicles" className="y-btn y-btn-white">
              Find a vehicle <ArrowRight size={18} />
            </Link>
            <Link to="/choose-listing-type" className="y-btn y-btn-ghost-light">
              List your vehicle
            </Link>
          </div>
        </section>
      </div>

      <style>{`
        .why-page { background: var(--bg); padding-bottom: 5rem; }
        .why-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }
        .why-feature { display: flex; flex-direction: column; gap: 0.6rem; }
        .why-feature h3 { font-size: 1.1rem; }
        .why-feature p { font-size: 0.95rem; line-height: 1.65; }
        .why-feature-icon {
          width: 48px; height: 48px; border-radius: 14px;
          display: grid; place-items: center;
          background: var(--primary-soft); color: var(--primary-dark);
        }
        .why-section-head { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; margin-bottom: 2rem; }
        .why-section-head h2 { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; }
        .why-faq { margin-top: 5rem; }
        .why-faq-list { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.75rem; }
        .why-faq-item {
          background: #fff; border: 1px solid var(--border); border-radius: var(--radius);
          overflow: hidden; transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .why-faq-item.open { border-color: rgba(249, 115, 22, 0.35); box-shadow: var(--shadow-card); }
        .why-faq-q {
          width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 1rem;
          padding: 1.1rem 1.25rem; background: none; text-align: left;
          font-weight: 700; font-size: 1rem; color: var(--text);
        }
        .why-faq-chevron { flex-shrink: 0; color: var(--primary); transition: transform 0.2s ease; }
        .why-faq-item.open .why-faq-chevron { transform: rotate(180deg); }
        .why-faq-a { padding: 0 1.25rem 1.2rem; line-height: 1.7; }
        .why-cta {
          margin-top: 5rem;
          display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;
          padding: 2.5rem; border-radius: var(--radius-xl);
          background: var(--grad-hero); color: #fff;
          box-shadow: var(--shadow-glow);
        }
        .why-cta h2 { color: #fff; font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; }
        .why-cta p { color: rgba(255, 255, 255, 0.9); margin-top: 0.4rem; }
        .why-cta-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        @media (max-width: 640px) {
          .why-cta { padding: 1.75rem; }
          .why-cta-actions { width: 100%; }
          .why-cta-actions .y-btn { flex: 1 1 auto; }
        }
      `}</style>
    </div>
  );
};

export default WhyUs;
