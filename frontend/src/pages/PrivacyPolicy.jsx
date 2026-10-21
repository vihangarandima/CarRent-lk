import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import {
  Lock,
  FileText,
  Share2,
  Phone,
  Mail,
} from "lucide-react";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-page">
      <PageHero
        badge="Data Privacy & Trust"
        title="Privacy"
        highlight="Policy"
        subtitle="Last Updated: October 2026 • Transparent Data Handling & Protection"
        compact={true}
      />

      <div className="container terms-container">
        <div className="terms-grid">
          {/* Main Content */}
          <main className="terms-content">
            {/* Summary Alert */}
            <div className="terms-summary-card">
              <div className="summary-icon">
                <Lock size={24} color="#f97316" />
              </div>
              <div>
                <h3 className="summary-title">Our Privacy Commitment</h3>
                <p className="summary-text">
                  At Yamu Car Rentals, your privacy is fundamental. We collect only the essential information needed to authenticate your account, connect you with vehicle hosts, and coordinate vehicle handovers over WhatsApp. <strong>We will never sell or rent your personal information to third-party advertisers.</strong>
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <section id="section-1" className="terms-section">
              <div className="section-header">
                <span className="section-number">01</span>
                <h2>Information We Collect</h2>
              </div>
              <p>We collect personal information directly when you interact with our platform:</p>
              <ul>
                <li><strong>Account Registration & Authentication:</strong> When you register or sign in via Google OAuth or email, we collect your full name, email address, password hash, and Google account identifier.</li>
                <li><strong>Contact & WhatsApp Details:</strong> When you initiate a booking inquiry, we collect your verified mobile and WhatsApp phone number so our team and the car host can communicate with you.</li>
                <li><strong>Booking Parameters:</strong> Selected vehicle model, rental start and end dates, estimated rental cost, and optional messages submitted during inquiry.</li>
                <li><strong>Host Listing Details:</strong> For vehicle owners and rental companies, we collect vehicle details, pricing, location coordinates, company name, contact numbers, and vehicle photographs.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="terms-section">
              <div className="section-header">
                <span className="section-number">02</span>
                <h2>How We Use Your Information</h2>
              </div>
              <p>Your information is used strictly to fulfill the services provided by Yamu Car Rentals:</p>
              <ul>
                <li>To format and generate pre-filled WhatsApp booking links connecting you with Yamu Concierge and the vehicle owner.</li>
                <li>To create and maintain your personal booking history and rental records in your customer dashboard.</li>
                <li>To enable hosts to verify reservation dates and coordinate physical key handover.</li>
                <li>To provide customer support, resolve booking conflicts, and recommend alternative nearby vehicles if a selected car is unavailable.</li>
                <li>To prevent fraud, multiple bookings, and abuse of our marketplace services.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="terms-section">
              <div className="section-header">
                <span className="section-number">03</span>
                <h2>Sharing Information with Vehicle Hosts</h2>
              </div>
              <div className="highlight-rule-box">
                <Share2 size={20} color="#10b981" />
                <div>
                  <strong>Legitimate Operational Sharing:</strong>
                  <p>
                    When you initiate a booking for a specific vehicle, your name and mobile/WhatsApp number are shared with that vehicle's verified Host strictly for the purpose of communicating about availability, deposit arrangements, and key pickup logistics. Hosts are contractually obligated not to use your contact details for unrelated marketing.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="terms-section">
              <div className="section-header">
                <span className="section-number">04</span>
                <h2>No Sale of Personal Data</h2>
              </div>
              <p>
                Yamu Car Rentals operates an independent car marketplace. We do not monetize by selling your contact info. Under no circumstances do we sell, rent, lease, or trade your personal email, phone number, or booking history to third-party data brokers or commercial advertisers.
              </p>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="terms-section">
              <div className="section-header">
                <span className="section-number">05</span>
                <h2>Data Security & Authentication</h2>
              </div>
              <p>
                We employ standard enterprise security measures to protect your account:
              </p>
              <ul>
                <li><strong>Google Sign-In:</strong> Authentication is handled through secure Google Firebase OAuth tokens. Yamu never sees or stores your Google account password.</li>
                <li><strong>Encrypted Transport:</strong> All data transmitted between your browser and our servers is secured using SSL/TLS HTTPS encryption.</li>
                <li><strong>Password Protection:</strong> Standard accounts use industry-grade cryptographic salt and hashing (bcrypt).</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="terms-section">
              <div className="section-header">
                <span className="section-number">06</span>
                <h2>Cookies & Local Storage</h2>
              </div>
              <p>
                Yamu uses standard browser Local Storage and session cookies strictly for essential platform functionality:
              </p>
              <ul>
                <li>Maintaining your logged-in session across page visits.</li>
                <li>Remembering your selected currency (LKR, USD, EUR, GBP) and language preferences.</li>
                <li>Preserving temporary filter parameters while browsing fleets.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="section-7" className="terms-section">
              <div className="section-header">
                <span className="section-number">07</span>
                <h2>Your Rights & Data Deletion</h2>
              </div>
              <p>
                You maintain complete ownership of your personal data. At any time, you may:
              </p>
              <ul>
                <li>View or update your profile details (Name, Phone, Profile Image) in your Account Profile.</li>
                <li>Request a copy of your stored personal information.</li>
                <li>Request permanent account deletion and removal of your contact information from our databases by contacting our privacy team.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="section-8" className="terms-section">
              <div className="section-header">
                <span className="section-number">08</span>
                <h2>Contact Our Privacy Team</h2>
              </div>
              <p>
                If you have questions, feedback, or data privacy requests, please reach out to us:
              </p>
              <div className="contact-pill-row">
                <a href="mailto:yamucarrentals@gmail.com" className="contact-pill">
                  <Mail size={14} /> yamucarrentals@gmail.com
                </a>
                <a href="tel:+94702434288" className="contact-pill">
                  <Phone size={14} /> +94 70 243 4288
                </a>
              </div>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="terms-sidebar">
            <div className="terms-nav-box">
              <h4 className="terms-nav-title">Privacy Sections</h4>
              <nav className="terms-nav-links">
                <a href="#section-1">1. Information Collected</a>
                <a href="#section-2">2. How We Use Data</a>
                <a href="#section-3">3. Sharing with Hosts</a>
                <a href="#section-4">4. No Data Selling</a>
                <a href="#section-5">5. Data Security</a>
                <a href="#section-6">6. Cookies & Storage</a>
                <a href="#section-7">7. Your Rights & Deletion</a>
                <a href="#section-8">8. Contact Us</a>
              </nav>

              <hr className="terms-nav-divider" />

              <div className="terms-doc-link">
                <FileText size={16} className="text-primary" />
                <Link to="/terms">View Terms of Service &rarr;</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .terms-page {
          background: #fafaf9;
          min-height: 100vh;
          padding-bottom: 5rem;
        }

        .terms-container {
          max-width: 1140px;
          margin: 2.5rem auto 0;
          padding: 0 1.25rem;
        }

        .terms-grid {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 2.5rem;
          align-items: start;
        }

        .terms-content {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 1.25rem;
          padding: 2.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
        }

        .terms-summary-card {
          background: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
          margin-bottom: 2.5rem;
        }

        .summary-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(249, 115, 22, 0.15);
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .summary-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #c2410c;
          margin-bottom: 0.35rem;
        }

        .summary-text {
          font-size: 0.92rem;
          color: #431407;
          line-height: 1.6;
          margin: 0;
        }

        .terms-section {
          margin-bottom: 2.75rem;
          padding-bottom: 2.25rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .terms-section:last-of-type {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1rem;
        }

        .section-number {
          font-size: 0.85rem;
          font-weight: 800;
          color: #f97316;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .section-header h2 {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .terms-section p {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.7;
          margin-bottom: 1rem;
        }

        .terms-section ul {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.7;
          padding-left: 1.4rem;
          margin-bottom: 1rem;
        }

        .terms-section li {
          margin-bottom: 0.5rem;
        }

        .highlight-rule-box {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 1.25rem;
          border-radius: 10px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
          margin: 1rem 0;
          color: #065f46;
          font-size: 0.92rem;
          line-height: 1.6;
        }

        .contact-pill-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .contact-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s;
        }

        .contact-pill:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .terms-sidebar {
          position: sticky;
          top: 6rem;
        }

        .terms-nav-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
        }

        .terms-nav-title {
          font-size: 0.82rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
          margin-bottom: 0.85rem;
        }

        .terms-nav-links {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .terms-nav-links a {
          color: #475569;
          font-size: 0.88rem;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.15s;
        }

        .terms-nav-links a:hover {
          color: #f97316;
        }

        .terms-nav-divider {
          border: none;
          border-top: 1px solid #f1f5f9;
          margin: 1.25rem 0;
        }

        .terms-doc-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.88rem;
          font-weight: 700;
        }

        .terms-doc-link a {
          color: #f97316;
          text-decoration: none;
        }

        .terms-doc-link a:hover {
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .terms-grid {
            grid-template-columns: 1fr;
          }
          .terms-sidebar {
            display: none;
          }
          .terms-content {
            padding: 1.75rem 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
