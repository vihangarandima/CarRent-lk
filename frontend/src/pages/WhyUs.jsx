import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  HeartHandshake,
  Clock,
  ChevronRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "../context/SiteConfigContext";

const WhyUs = () => {
  const { config } = useSiteConfig();
  const whyUs = config?.whyUs;
  const [openFaq, setOpenFaq] = useState(0);

  const features = [
    {
      icon: <ShieldCheck size={28} className="icon-orange" />,
      title: "Verified Hosts & Vehicles",
      desc: "Every host and vehicle is manually verified by our team to guarantee safety, quality, and a premium experience.",
      iconBg: "bg-orange-light",
    },
    {
      icon: <Zap size={28} className="icon-blue" />,
      title: "Instant Booking & Price Offers",
      desc: "No waiting around. Browse, select, and book your dream vehicle instantly with our streamlined process.",
      iconBg: "bg-blue-light",
    },
    {
      icon: <HeartHandshake size={28} className="icon-orange" />,
      title: "Transparent Pricing",
      desc: "What you see is what you pay. We hate hidden fees as much as you do. Everything is crystal clear from the start.",
      iconBg: "bg-orange-light",
    },
    {
      icon: <Clock size={28} className="icon-green" />,
      title: "24/7 Dedicated Support",
      desc: "On the road or anywhere else, our support team is available round-the-clock to ensure your journey is seamless.",
      iconBg: "bg-green-light",
    },
  ];

  const faqs = whyUs?.faqs && whyUs.faqs.length > 0 ? whyUs.faqs : [];

  return (
    <div className="why-us-page page">
      <div className="container">
        <motion.div
          className="why-us-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="badge badge-primary mb-4">{whyUs?.badge || "Our Promise"}</div>
          <h1>
            {whyUs?.title || (
              <>
                Why Choose <span className="text-gradient">Yamu Car Rentals?</span>
              </>
            )}
          </h1>
          <p className="subtitle">
            {whyUs?.subtitle ||
              "We're redefining the vehicle rental experience in Sri Lanka through trust, transparency, and technology."}
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="feature-card glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className={`feature-icon-wrapper ${f.iconBg}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Interactive FAQ Section */}
        {faqs.length > 0 && (
          <motion.div
            className="faq-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="faq-header-center">
              <div className="badge badge-primary mb-2">
                <HelpCircle size={14} className="mr-1 inline" /> Got Questions?
              </div>
              <h2>Frequently Asked Questions</h2>
              <p>Everything you need to know about booking and renting vehicles with Yamu.</p>
            </div>

            <div className="faq-accordion-list">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className={`faq-item glass-card ${isOpen ? "open" : ""}`}
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  >
                    <div className="faq-question-row">
                      <span className="faq-q-text">{faq.q}</span>
                      <span className="faq-toggle-icon">
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </div>
                    {isOpen && <div className="faq-answer-text">{faq.a}</div>}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <motion.div
          className="cta-section glass-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="cta-content">
            <h2>Ready to hit the road?</h2>
            <p>
              Join thousands of satisfied travelers who have experienced the Yamu difference.
            </p>
          </div>
          <div className="cta-actions">
            <Link to="/vehicles" className="btn btn-primary">
              Browse Vehicles <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>

      <style>{`
        .why-us-page {
          padding-top: 120px;
          padding-bottom: 80px;
          background: #f8fafc;
          transition: background-color 0.3s ease;
        }

        .why-us-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 4rem auto;
        }
        
        .mb-4 { margin-bottom: 1rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        
        .text-gradient {
          background: var(--grad-primary);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .why-us-header h1 {
          font-size: clamp(2.2rem, 5vw, 3.2rem);
          margin-bottom: 1.25rem;
          color: var(--secondary);
          font-weight: 800;
        }

        .why-us-header .subtitle {
          font-size: 1.15rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 2rem;
          margin-bottom: 5rem;
        }

        .feature-card {
          padding: 2.5rem 2rem;
          text-align: left;
          border-radius: 1.25rem;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
          border-color: rgba(249, 115, 22, 0.3);
        }

        .feature-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .bg-orange-light { background: #fff7ed; color: #ea580c; }
        .bg-blue-light { background: #eff6ff; color: #2563eb; }
        .bg-green-light { background: #f0fdf4; color: #16a34a; }

        .feature-card h3 {
          font-size: 1.25rem;
          margin-bottom: 0.75rem;
          color: var(--secondary);
          font-weight: 700;
        }

        .feature-card p {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* FAQ Section */
        .faq-section {
          margin-bottom: 5rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .faq-header-center {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .faq-header-center h2 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--secondary);
          margin-bottom: 0.5rem;
        }

        .faq-header-center p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .faq-accordion-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-item {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.07);
          border-radius: 12px;
          padding: 18px 22px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .faq-item:hover {
          border-color: rgba(249, 115, 22, 0.4);
        }

        .faq-item.open {
          border-color: var(--primary);
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.08);
        }

        .faq-question-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 700;
          color: var(--secondary);
          font-size: 1.05rem;
        }

        .faq-toggle-icon {
          color: var(--primary);
          margin-left: 12px;
          flex-shrink: 0;
        }

        .faq-answer-text {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
          animation: fadeIn 0.2s ease;
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 1.5rem;
          padding: 3rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 2rem;
          box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.3);
        }

        .cta-content h2 {
          font-size: 1.75rem;
          color: #ffffff;
          margin-bottom: 0.5rem;
          font-weight: 800;
        }

        .cta-content p {
          color: #94a3b8;
          font-size: 1rem;
        }

        .cta-actions .btn-primary {
          background: var(--primary);
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 100px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4);
          transition: transform 0.2s;
        }

        .cta-actions .btn-primary:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default WhyUs;
