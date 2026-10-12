import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import {
  ShieldCheck,
  Scale,
  Car,
  KeyRound,
  FileText,
  AlertTriangle,
  Fuel,
  Gauge,
  HelpCircle,
  CheckCircle2,
  Phone,
  Mail,
} from "lucide-react";

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-page">
      <PageHero
        badge="Legal & Compliance"
        title="Terms of"
        highlight="Service"
        subtitle="Last Updated: October 2026 • Platform Agreement & Marketplace Disclaimers"
        compact={true}
      />

      <div className="container terms-container">
        <div className="terms-grid">
          {/* Main Legal Content */}
          <main className="terms-content">
            {/* Summary Alert Box */}
            <div className="terms-summary-card">
              <div className="summary-icon">
                <Scale size={24} color="#f97316" />
              </div>
              <div>
                <h3 className="summary-title">Summary of Key Principles</h3>
                <p className="summary-text">
                  Yamu Car Rentals is an <strong>online technology & concierge marketplace</strong> connecting independent vehicle hosts with verified renters across Sri Lanka. Yamu is <strong>not</strong> a rental agency, insurer, or vehicle owner. Security deposits, physical license verification, vehicle condition inspections, and fuel balances are settled <strong>directly between the host and the customer</strong> at key handover.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <section id="section-1" className="terms-section">
              <div className="section-header">
                <span className="section-number">01</span>
                <h2>Platform Nature & Marketplace Role</h2>
              </div>
              <p>
                Yamu Car Rentals (<strong>"Yamu"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, or <strong>"the Platform"</strong>) operates as an intermediary peer-to-peer and fleet marketplace. Our technology allows vehicle owners and licensed car rental companies (<strong>"Hosts"</strong>) to list vehicles, and enables prospective drivers (<strong>"Renters"</strong> or <strong>"Customers"</strong>) to discover, reserve, and communicate regarding vehicle bookings.
              </p>
              <div className="notice-box">
                <AlertTriangle size={18} className="text-warning" />
                <span>
                  <strong>Important Notice:</strong> Yamu does not own, inspect, lease, repair, or maintain any vehicles listed on the platform. The contractual agreement for the temporary use and custody of any vehicle exists solely and exclusively between the Host and the Renter.
                </span>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="terms-section">
              <div className="section-header">
                <span className="section-number">02</span>
                <h2>Booking Workflow & Concierge Requests</h2>
              </div>
              <p>
                When a Renter submits a reservation through the Yamu website via WhatsApp or online booking:
              </p>
              <ul>
                <li>The inquiry initiates a reservation request through Yamu Concierge Dispatch.</li>
                <li>The vehicle's availability, dates, and pickup logistics must be confirmed with the Host before keys are released.</li>
                <li>Yamu acts to coordinate communication, match alternative nearby vehicles when a car is unavailable, and facilitate scheduling.</li>
                <li>Submitting a booking inquiry does not automatically guarantee vehicle reservation until the Host and Renter mutually finalize the handover.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="terms-section">
              <div className="section-header">
                <span className="section-number">03</span>
                <h2>Security Deposits (Host-Customer Settlement)</h2>
              </div>
              <p>
                In accordance with Sri Lankan vehicle hire conventions, Hosts typically require a refundable security deposit prior to releasing vehicle keys:
              </p>
              <div className="highlight-rule-box">
                <ShieldCheck size={20} color="#10b981" />
                <div>
                  <strong>Yamu Does Not Hold or Manage Deposits:</strong>
                  <p>
                    All security deposits (whether paid via cash, bank transfer, holding a utility bill, or passport copy) are determined, collected, held, and refunded <strong>strictly between the Host and the Renter</strong>. Yamu holds zero custody over deposit funds and accepts no liability regarding deposit deductions or disputes.
                  </p>
                </div>
              </div>
              <p>
                Hosts and Renters must agree on the deposit amount and refund terms prior to key handover. The deposit is returned to the Renter upon safe, timely vehicle return, subject to vehicle condition and fuel checks.
              </p>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="terms-section">
              <div className="section-header">
                <span className="section-number">04</span>
                <h2>Driver Eligibility & Physical Verification</h2>
              </div>
              <p>
                Before operating any vehicle rented through Yamu, Renters must fulfill the following mandatory requirements:
              </p>
              <ul>
                <li><strong>Sri Lankan Residents:</strong> Must present a valid, unexpired Sri Lankan Driving License (appropriate vehicle class) and original National Identity Card (NIC).</li>
                <li><strong>Foreign Tourists & Expats:</strong> Must hold a valid International Driving Permit (IDP) with endorsement by the Automobile Association of Ceylon (AAC), or a valid driving license recognized under Sri Lankan law, accompanied by a passport.</li>
                <li><strong>Physical Inspection at Handover:</strong> The Host has the right and legal duty to inspect the driver's original license and identity documents before releasing the vehicle. If the Renter cannot present valid credentials, the Host may cancel the handover immediately.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="terms-section">
              <div className="section-header">
                <span className="section-number">05</span>
                <h2>Fuel Policy & Handover Inspection</h2>
              </div>
              <div className="terms-icon-cards">
                <div className="terms-mini-card">
                  <Fuel size={22} color="#f97316" />
                  <h4>Same-to-Same Fuel Policy</h4>
                  <p>
                    Unless otherwise agreed in writing, vehicles must be returned with the exact same fuel level as recorded at pickup (e.g. Full-to-Full or Half-to-Half). Missing fuel is billed directly by the Host.
                  </p>
                </div>
                <div className="terms-mini-card">
                  <Gauge size={22} color="#f97316" />
                  <h4>Mileage Allowance</h4>
                  <p>
                    Vehicles include a specified daily free mileage allowance (typically 100 km/day). Any excess mileage driven is billed at the agreed extra per-KM rate and settled with the Host upon return.
                  </p>
                </div>
              </div>
              <p>
                <strong>Pre-Trip Condition Check:</strong> The Renter and Host are strongly advised to walk around the vehicle, take timestamped photos/videos of existing scratches, and note the odometer reading together before departure to avoid end-of-trip disputes.
              </p>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="terms-section">
              <div className="section-header">
                <span className="section-number">06</span>
                <h2>Limitation of Liability & Indemnity</h2>
              </div>
              <p>
                To the fullest extent permitted under applicable Sri Lankan law:
              </p>
              <ul>
                <li>Yamu Car Rentals shall not be liable for any indirect, incidental, punitive, or consequential damages arising from any rental transaction.</li>
                <li>Yamu is not liable for vehicle mechanical failures, flat tires, roadside delays, road accidents, personal injuries, theft of vehicle contents, or loss of life during any trip.</li>
                <li><strong>Traffic Infractions & Fines:</strong> The Renter is solely responsible for all traffic fines, speeding penalties, illegal parking tickets, highway toll fees, and court citations incurred during the rental window.</li>
                <li>Renters agree to defend, indemnify, and hold harmless Yamu Car Rentals and its affiliates against any third-party claims resulting from negligent or illegal vehicle operation.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="section-7" className="terms-section">
              <div className="section-header">
                <span className="section-number">07</span>
                <h2>Prohibited Activities</h2>
              </div>
              <p>Vehicles rented through the platform must NOT be used for:</p>
              <ul>
                <li>Sub-renting, loaning to unauthorized third-party drivers, or peer lending.</li>
                <li>Driving under the influence of alcohol, drugs, or intoxicating substances.</li>
                <li>Commercial carriage of contraband, illicit substances, or illegal cargo.</li>
                <li>Racing, off-road rallying, towing other vehicles, or overloading beyond maximum seating capacity.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="section-8" className="terms-section">
              <div className="section-header">
                <span className="section-number">08</span>
                <h2>Cancellations & Modifications</h2>
              </div>
              <p>
                If your travel plans change, please notify Yamu Concierge via WhatsApp (+94 70 243 4288) as early as possible so we can notify the Host and release the dates for other customers. Any advance booking fees or cancellation policies established directly with the Host are governed by that Host's specific policy.
              </p>
            </section>

            {/* Section 9 */}
            <section id="section-9" className="terms-section">
              <div className="section-header">
                <span className="section-number">09</span>
                <h2>Contact & Grievances</h2>
              </div>
              <p>
                For questions regarding these Terms of Service or assistance with an active booking, contact the Yamu Support Team:
              </p>
              <div className="contact-pill-row">
                <a href="tel:+94702434288" className="contact-pill">
                  <Phone size={14} /> +94 70 243 4288
                </a>
                <a href="mailto:yamucarrentals@gmail.com" className="contact-pill">
                  <Mail size={14} /> yamucarrentals@gmail.com
                </a>
              </div>
            </section>
          </main>

          {/* Quick Nav Sidebar */}
          <aside className="terms-sidebar">
            <div className="terms-nav-box">
              <h4 className="terms-nav-title">Sections</h4>
              <nav className="terms-nav-links">
                <a href="#section-1">1. Marketplace Platform</a>
                <a href="#section-2">2. Booking Workflow</a>
                <a href="#section-3">3. Security Deposits</a>
                <a href="#section-4">4. Driver Eligibility</a>
                <a href="#section-5">5. Fuel & Mileage</a>
                <a href="#section-6">6. Liability Disclaimer</a>
                <a href="#section-7">7. Prohibited Uses</a>
                <a href="#section-8">8. Cancellations</a>
                <a href="#section-9">9. Contact Us</a>
              </nav>

              <hr className="terms-nav-divider" />

              <div className="terms-doc-link">
                <FileText size={16} className="text-primary" />
                <Link to="/privacy">View Privacy Policy &rarr;</Link>
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

        .notice-box {
          background: #f8fafc;
          border-left: 4px solid #f97316;
          padding: 1rem 1.25rem;
          border-radius: 0 8px 8px 0;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          font-size: 0.9rem;
          color: #334155;
          line-height: 1.6;
          margin: 1.25rem 0;
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

        .terms-icon-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin: 1.25rem 0;
        }

        .terms-mini-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.25rem;
        }

        .terms-mini-card h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0.65rem 0 0.35rem;
        }

        .terms-mini-card p {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
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

        /* Sidebar Quick Nav */
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
          .terms-icon-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
