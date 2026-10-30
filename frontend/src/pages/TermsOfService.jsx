import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import {
  ShieldCheck,
  Scale,
  FileText,
  AlertTriangle,
  Fuel,
  Gauge,
  Phone,
  Mail,
  Handshake,
} from "lucide-react";

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-page">
      <PageHero
        badge="Legal & Compliance"
        title="Terms &"
        highlight="Conditions"
        subtitle="Last Updated: October 2026 • Terms for Vehicle Owners & Hirers"
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
                <h3 className="summary-title">Summary of Key Principles (Pure Intermediary Model)</h3>
                <p className="summary-text">
                  Yamu Car Rentals operates <strong>strictly as an online intermediary and listing platform</strong> connecting independent Vehicle Owners with Hirers across Sri Lanka. <strong>No financial transactions, rental payments, or security deposits pass through our platform.</strong> Furthermore, Yamu Car Rentals is not a party to any rental contract and <strong>assumes zero responsibility or liability for any damages, accidents, theft, or losses caused to any vehicle</strong>. All payments, deposits, inspections, and rental agreements are settled directly between the Vehicle Owner and the Hirer.
                </p>
              </div>
            </div>

            {/* Section 1: Definitions */}
            <section id="section-1" className="terms-section">
              <div className="section-header">
                <span className="section-number">01</span>
                <h2>Definitions</h2>
              </div>
              <p>In these Terms and Conditions, unless the context requires otherwise:</p>
              <ul>
                <li><strong>"Platform"</strong> refers to the website, mobile application, WhatsApp concierge channels, and customer helpline owned and operated by Yamu Car Rentals.</li>
                <li><strong>"Vehicle Owner"</strong> (or <strong>"Host"</strong>) means the legal owner or authorized rental company who lists their vehicle(s) for hire on the Platform.</li>
                <li><strong>"Hirers"</strong> (or <strong>"Renters"</strong> / <strong>"Customers"</strong>) means the users of the Platform who inquire about and hire vehicles from Vehicle Owners through connections made on the Platform.</li>
                <li><strong>"Vehicles"</strong> means the vehicles listed by Vehicle Owners on the Platform for hire by Hirers.</li>
                <li><strong>"We"</strong>, <strong>"Us"</strong>, or <strong>"Our"</strong> means Yamu Car Rentals.</li>
                <li><strong>"You"</strong> means the Vehicle Owner or Hirer, as relevant.</li>
              </ul>
            </section>

            {/* Section 2: Relationship & Intermediary Role */}
            <section id="section-2" className="terms-section">
              <div className="section-header">
                <span className="section-number">02</span>
                <h2>Relationship & Intermediary Role</h2>
              </div>
              <p>
                This Platform (Yamu Car Rentals) is strictly an intermediary technology service connecting Vehicle Owners and Hirers, and is <strong>not a party to any rental agreements</strong> made between Vehicle Owners and Hirers.
              </p>
              <ul>
                <li>We do not own, lease, manage, or control any Vehicles advertised on this Platform.</li>
                <li>We are not responsible for any disputes that may arise between Vehicle Owners and Hirers.</li>
                <li>We do not endorse any Vehicle Owners or Hirers on this Platform, nor do we guarantee the safety, roadworthiness, or reliability of any Vehicle advertised.</li>
                <li>It is solely your responsibility to determine the suitability of a Vehicle and the trustworthiness, identity, and driving capability of a Vehicle Owner or Hirer before entering into a direct rental agreement.</li>
                <li>We are not responsible for the actions, omissions, or conduct of any Vehicle Owners or Hirers on this Platform.</li>
              </ul>
              <div className="notice-box">
                <Handshake size={18} className="text-warning" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>
                  <strong>Direct Contractual Relationship:</strong> The rental contract for the hire and custody of any Vehicle exists exclusively between the Vehicle Owner and the Hirer. Yamu Car Rentals acts solely as the intermediary facilitating discovery and initial booking inquiries.
                </span>
              </div>
            </section>

            {/* Section 3: No Platform Transactions & Direct Settlement */}
            <section id="section-3" className="terms-section">
              <div className="section-header">
                <span className="section-number">03</span>
                <h2>No Platform Transactions & Direct Payments</h2>
              </div>
              <p>
                Unlike traditional agencies or payment-processing marketplaces, <strong>there are no financial transactions going through Yamu Car Rentals</strong>:
              </p>
              <div className="highlight-rule-box">
                <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>100% Direct Financial Settlement:</strong>
                  <p style={{ margin: "0.35rem 0 0", color: "#065f46" }}>
                    We do not collect, process, hold in escrow, or disburse rental fees, booking advances, or security deposits from Hirers. All rental charges, mileage fees, and refundable security deposits are negotiated, paid, held, and refunded <strong>directly between the Vehicle Owner and the Hirer</strong>.
                  </p>
                </div>
              </div>
              <ul>
                <li><strong>Listing Price:</strong> The listing price displayed for each Vehicle is set by the Vehicle Owner, along with any applicable daily mileage allowances, extra per-kilometer charges, or additional fees.</li>
                <li><strong>Security Deposits:</strong> Any refundable security deposit required prior to releasing a Vehicle is collected and held directly by the Vehicle Owner and returned directly to the Hirer upon safe completion of the trip. Yamu holds zero custody over deposit funds and accepts no liability regarding deposit deductions, non-payment, or payment disputes.</li>
              </ul>
            </section>

            {/* Section 4: Zero Liability for Vehicle Damages */}
            <section id="section-4" className="terms-section">
              <div className="section-header">
                <span className="section-number">04</span>
                <h2>No Responsibility for Vehicle Damages or Losses</h2>
              </div>
              <div className="damage-disclaimer-box">
                <AlertTriangle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Strict Damage & Accident Disclaimer:</strong>
                  <p>
                    Because Yamu Car Rentals acts solely as an intermediary with no transactions passing through us, <strong>we bear no responsibility or liability whatsoever for any damages, accidents, collisions, scratches, mechanical breakdowns, vandalism, theft, fire, or total loss caused to any Vehicle</strong> before, during, or after a rental period.
                  </p>
                </div>
              </div>
              <ul>
                <li><strong>Assumption of Risk:</strong> Vehicle Owners hand over custody of their Vehicles to Hirers entirely at their own risk.</li>
                <li><strong>Direct Damage Resolution:</strong> Any claims for physical damage to a Vehicle, repair expenses, insurance excess, loss of rental income, or unreturned Vehicles must be pursued and settled strictly between the Vehicle Owner, the Hirer, law enforcement, and the Vehicle Owner's insurance provider.</li>
                <li><strong>Third-Party & Personal Injury Claims:</strong> Yamu Car Rentals is not liable for roadside delays, road accidents, personal injuries, theft of personal belongings, or loss of life occurring during any trip.</li>
              </ul>
            </section>

            {/* Section 5: Eligibility, Registration & Listing Your Vehicle */}
            <section id="section-5" className="terms-section">
              <div className="section-header">
                <span className="section-number">05</span>
                <h2>Eligibility, Registration & Listing Your Vehicle</h2>
              </div>
              <ul>
                <li><strong>Eligibility:</strong> To use this Platform as a Vehicle Owner or Hirer, you must be at least 18 years old and legally able to enter into a binding contract. As a Vehicle Owner, you must legally own the Vehicle you are listing for rent on this Platform or have the explicit legal right and authority to rent it to others. We reserve the right to inspect the Vehicle and review documentation prior to or after listing, and may refuse or remove any listing at our sole discretion.</li>
                <li><strong>Registration:</strong> To advertise your Vehicle for rent or manage bookings on this Platform, you must register and create an account. You must provide accurate, complete, and current information about yourself and your Vehicle(s). You are responsible for maintaining the confidentiality of your account credentials and for any activity that occurs under your account.</li>
                <li><strong>Listing Your Vehicle:</strong> You may list your Vehicle for rent by providing accurate information about the make, model, year, and other relevant details. You must provide accurate pricing information and clearly specify any restrictions on the use of the Vehicle, such as daily mileage limits, per-kilometer charges beyond the specified daily mileage, maximum number of passengers, and any additional fees or charges that may apply.</li>
              </ul>
            </section>

            {/* Section 6: Maintenance, Condition & Insurance */}
            <section id="section-6" className="terms-section">
              <div className="section-header">
                <span className="section-number">06</span>
                <h2>Maintenance, Condition & Insurance Obligations</h2>
              </div>
              <ul>
                <li><strong>Maintenance and Safety:</strong> Vehicle Owners are solely responsible for ensuring that their Vehicle is in good working condition, roadworthy, and meets all applicable safety standards. You must also ensure that the Vehicle is clean and presentable for rental. If your Vehicle becomes unavailable for rental due to maintenance, accident, or repair issues, you must promptly remove it from the Platform or update its availability calendar.</li>
                <li><strong>Condition of the Vehicle:</strong> It shall be the Vehicle Owner's responsibility to ensure that the Vehicle conforms to the standards, specifications, and condition reflected in the listing and the pictures contained thereon. A Hirer is entitled to inspect and refuse to accept the Vehicle prior to the commencement of a trip if it is found, in the opinion of the Hirer, that the Vehicle does not conform to the standards, specifications, and condition shown in your listing and pictures. Such Hirer will be entitled to cancel the booking of your Vehicle entirely without any liability to you. We also reserve the right to remove your listing where it is found that the Vehicle does not conform to the standards, specifications, and condition as per your listing.</li>
                <li><strong>Revenue License, Emissions Test, and Insurance:</strong> Vehicle Owners are responsible for maintaining a valid Revenue License, Emissions Test certificate, and <strong>full comprehensive insurance coverage (including rental/hire insurance coverage)</strong> for their Vehicle at all times. You must provide proof of compliance upon request. You must ensure that your insurance coverage is sufficient to cover any vehicle damages, third-party liabilities, or losses that may occur during a rental period.</li>
              </ul>
            </section>

            {/* Section 7: Drivers, Hirer Verification & Handover Rules */}
            <section id="section-7" className="terms-section">
              <div className="section-header">
                <span className="section-number">07</span>
                <h2>Drivers, Verification, Fuel & Mileage</h2>
              </div>
              <ul>
                <li><strong>Chauffeur / With-Driver Listings:</strong> If a Vehicle Owner offers a driver's services along with the Vehicle listed for hire, you must provide the name and contact information of the driver to the Hirer. The driver must be at least 18 years of age and hold a valid driver's license. The vehicle rental quoted should cover the driver's wages, accommodation, and meals cost (unless clearly specified otherwise), and we bear no responsibility or liability regarding the driver's wages and allowances. There shall be no employer-employee relationship between us and the driver, and you shall indemnify and hold us harmless against any claims, losses, damages, and expenses in that regard.</li>
                <li><strong>Self-Drive Hirer Verification:</strong> Before handing over keys to any self-drive Hirer, the Vehicle Owner has the strict duty to physically inspect the Hirer's original, unexpired Sri Lankan Driving License and National Identity Card (NIC) (or for foreign tourists, a valid Passport and International Driving Permit / AAC endorsement).</li>
                <li><strong>Pre-Trip Inspection:</strong> Both the Vehicle Owner and Hirer are strongly advised to inspect the Vehicle together, take timestamped photos/videos of existing scratches or dents, and record the fuel level and odometer reading at handover.</li>
              </ul>
              <div className="terms-icon-cards">
                <div className="terms-mini-card">
                  <Fuel size={22} color="#f97316" />
                  <h4>Same-to-Same Fuel Policy</h4>
                  <p>
                    Unless agreed otherwise, Vehicles must be returned with the same fuel level as recorded at handover. Any fuel shortage is settled directly with the Vehicle Owner.
                  </p>
                </div>
                <div className="terms-mini-card">
                  <Gauge size={22} color="#f97316" />
                  <h4>Mileage & Traffic Fines</h4>
                  <p>
                    Excess mileage beyond the daily allowance is settled directly with the Vehicle Owner at return. Hirers are solely responsible for all traffic fines, tolls, and parking tickets during the hire period.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8: Cancellations & Prohibited Uses */}
            <section id="section-8" className="terms-section">
              <div className="section-header">
                <span className="section-number">08</span>
                <h2>Cancellation Policy & Prohibited Activities</h2>
              </div>
              <p>
                <strong>Cancellation Policy:</strong> Vehicle Owners and Hirers may cancel a rental booking at least twenty-four (24) hours before the scheduled start time by notifying Yamu Concierge and the counterparty. Any advance deposit or cancellation terms agreed directly between the Vehicle Owner and Hirer are governed by their direct agreement. We reserve the right to suspend or remove your listing or account if you repeatedly refuse to accept bookings or unreasonably cancel bookings after acceptance.
              </p>
              <p>
                <strong>Prohibited Vehicle Uses:</strong> Vehicles hired through connections on the Platform must never be used for sub-renting to unauthorized drivers, driving under the influence of alcohol or drugs, transporting illegal goods, racing, off-road rallying, or overloading beyond legal seating limits.
              </p>
            </section>

            {/* Section 9: Indemnification */}
            <section id="section-9" className="terms-section">
              <div className="section-header">
                <span className="section-number">09</span>
                <h2>Indemnification</h2>
              </div>
              <p>
                You agree to indemnify, defend, and hold harmless this Platform (Yamu Car Rentals), its owners, operators, and affiliates from and against any and all claims, liabilities, vehicle damages, losses, legal fees, or expenses arising from or related to:
              </p>
              <ul>
                <li>Your use of this Platform or your interactions with other users;</li>
                <li>The listing, rental, or operation of your Vehicle;</li>
                <li>Any claims related to the mechanical or physical condition of your Vehicle;</li>
                <li>The use or misuse of a Vehicle by Hirers or drivers; or</li>
                <li>Any accidents, collisions, property damage, personal injuries, thefts, or incidents that occur during a rental period.</li>
              </ul>
            </section>

            {/* Section 10: Intellectual Property, Termination & Disclaimer */}
            <section id="section-10" className="terms-section">
              <div className="section-header">
                <span className="section-number">10</span>
                <h2>Intellectual Property, Termination & General Disclaimer</h2>
              </div>
              <ul>
                <li>
                  <strong>Intellectual Property Rights:</strong> All content on this Platform, including text, graphics, logos, images, and software, is the property of Yamu Car Rentals or its licensors and is protected by copyright and other intellectual property laws. Any unauthorized use of the content on this Platform may violate copyright, trademark, and other intellectual property laws and could result in legal action. You may not, without our express written consent:
                  <ul style={{ marginTop: "0.4rem", marginBottom: "0.4rem" }}>
                    <li>use any content on this Platform for any commercial purpose;</li>
                    <li>modify, distribute, transmit, display, publish, sell, license, or create derivative works from any content on this Platform; or</li>
                    <li>use any trademark, service mark, or trade name of this Platform.</li>
                  </ul>
                </li>
                <li>
                  <strong>Termination:</strong> This Platform reserves the right to suspend or terminate your account or vehicle listings at any time and for any reason, without notice. This includes, but is not limited to, violations of these Terms and Conditions, fraudulent listings, or any inappropriate or illegal activity associated with your use of this Platform.
                </li>
                <li>
                  <strong>Disclaimer of Warranties:</strong> This Platform is provided on an "as is" and "as available" basis as a connecting service to Vehicle Owners and Hirers. While we strive to provide accurate and reliable information, we cannot guarantee the accuracy, completeness, or timeliness of the information on our Platform. You use this Platform at your own risk. We do not guarantee that the Platform will be available at all times or that it will be free from errors or interruptions. We are not responsible for any loss or damage that may result from your use of this Platform.
                </li>
                <li>
                  <strong>Changes to These Terms:</strong> These terms may be updated from time to time. It is your responsibility to review these terms regularly and to ensure that you are in compliance with them. Your continued use of this Platform after any changes have been made constitutes your acceptance of the revised terms.
                </li>
              </ul>
            </section>

            {/* Section 11: Contact */}
            <section id="section-11" className="terms-section">
              <div className="section-header">
                <span className="section-number">11</span>
                <h2>Contact & Support</h2>
              </div>
              <p>
                For questions regarding these Terms and Conditions or assistance with a listing or booking inquiry, contact the Yamu Support Team:
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
                <a href="#section-1">1. Definitions</a>
                <a href="#section-2">2. Intermediary Relationship</a>
                <a href="#section-3">3. No Platform Transactions</a>
                <a href="#section-4">4. Vehicle Damage Disclaimer</a>
                <a href="#section-5">5. Eligibility & Listings</a>
                <a href="#section-6">6. Condition & Insurance</a>
                <a href="#section-7">7. Drivers & Verification</a>
                <a href="#section-8">8. Cancellations & Rules</a>
                <a href="#section-9">9. Indemnification</a>
                <a href="#section-10">10. IP, Termination & Legal</a>
                <a href="#section-11">11. Contact Support</a>
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

        .damage-disclaimer-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: 1.25rem;
          border-radius: 10px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
          margin: 1rem 0;
          color: #991b1b;
          font-size: 0.92rem;
          line-height: 1.6;
        }

        .damage-disclaimer-box p {
          color: #7f1d1d;
          margin: 0.35rem 0 0;
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
