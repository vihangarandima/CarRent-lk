import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Building2, MapPin, Phone, Mail, Car, ArrowLeft, Star, MessageCircle } from "lucide-react";
import VehicleCard from "../components/VehicleCard";
import { API_URL } from "../config";

// Normalise a Sri Lankan phone number to the international digits wa.me / tel: expect
const toIntlNumber = (phone) => {
  const digits = String(phone || "").replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return "94" + digits.slice(1);
  if (digits.length === 9) return "94" + digits;
  return digits;
};

const CompanyDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/companies/${id}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.status === 404 ? "This company could not be found." : "Couldn't load this company. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  if (loading || error || !data) {
    return (
      <div className="cdp-page">
        <section className="y-hero y-hero-compact">
          <div className="container y-hero-inner">
            {loading ? <div className="cdp-spinner" /> : <h1 className="y-hero-title" style={{ fontSize: "1.75rem" }}>{error || "Something went wrong."}</h1>}
            {!loading && (
              <Link to="/companies" className="y-btn y-btn-white">
                <ArrowLeft size={16} /> All companies
              </Link>
            )}
          </div>
        </section>
        <style>{styles}</style>
      </div>
    );
  }

  const { vehicles = [], ...company } = data;
  const phone = toIntlNumber(company.phone);
  const waText = encodeURIComponent(`Hello ${company.companyName}! I found you on Yamu Car Rentals and would like to rent a vehicle.`);

  return (
    <div className="cdp-page">
      <section className="y-hero cdp-hero">
        <div className="container cdp-hero-inner">
          <Link to="/companies" className="cdp-back">
            <ArrowLeft size={16} /> All companies
          </Link>

          <div className="cdp-head">
            <div className="cdp-logo">
              {company.logo ? (
                <img src={company.logo} alt={company.companyName} />
              ) : (
                <Building2 size={40} color="#f97316" />
              )}
            </div>
            <div className="cdp-info">
              <span className="y-badge y-badge-light">Rent-a-car company</span>
              <h1>{company.companyName}</h1>
              <div className="cdp-meta">
                <span>
                  <Star size={15} fill="#fde68a" color="#fde68a" />
                  {company.rating > 0 ? `${company.rating.toFixed(1)} (${company.reviewCount} reviews)` : "No reviews yet"}
                </span>
                {company.address && <span><MapPin size={15} /> {company.address}</span>}
                {company.contactEmail && <span><Mail size={15} /> {company.contactEmail}</span>}
              </div>
              {company.description && <p className="cdp-desc">{company.description}</p>}
              {phone && (
                <div className="cdp-actions">
                  <a className="y-btn y-btn-white" href={`https://wa.me/${phone}?text=${waText}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                  <a className="y-btn y-btn-ghost-light" href={`tel:+${phone}`}>
                    <Phone size={18} /> {company.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container cdp-fleet">
        <div className="cdp-fleet-head">
          <h2><Car size={22} /> Fleet</h2>
          <span>{vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"}</span>
        </div>
        {vehicles.length === 0 ? (
          <div className="y-card cdp-empty">
            <Car size={36} color="#f97316" />
            <p>This company hasn't listed any vehicles yet.</p>
            <Link to="/vehicles" className="y-btn y-btn-soft">Browse all vehicles</Link>
          </div>
        ) : (
          <div className="cdp-grid">
            {vehicles.map((v, i) => (
              <VehicleCard key={v._id} vehicle={v} index={i} />
            ))}
          </div>
        )}
      </section>

      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .cdp-page { min-height: 100vh; background: var(--bg); }
  .cdp-hero { text-align: left; padding-bottom: 3rem; }
  .cdp-hero-inner { position: relative; z-index: 1; }
  .cdp-back {
    display: inline-flex; align-items: center; gap: 6px; margin-bottom: 1.5rem;
    color: rgba(255,255,255,0.9); font-weight: 600; font-size: 0.9rem;
  }
  .cdp-back:hover { color: #fff; }
  .cdp-head { display: flex; gap: 1.75rem; align-items: flex-start; flex-wrap: wrap; }
  .cdp-logo {
    width: 104px; height: 104px; border-radius: 24px; flex-shrink: 0; overflow: hidden;
    background: #fff; display: grid; place-items: center; box-shadow: 0 12px 30px -8px rgba(124,45,18,0.45);
  }
  .cdp-logo img { width: 100%; height: 100%; object-fit: cover; }
  .cdp-info { flex: 1; min-width: 240px; display: flex; flex-direction: column; align-items: flex-start; gap: 0.6rem; }
  .cdp-info h1 { color: #fff; font-size: clamp(1.75rem, 4vw, 2.6rem); font-weight: 800; }
  .cdp-meta { display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; }
  .cdp-meta span { display: inline-flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.92); font-size: 0.9rem; }
  .cdp-desc { color: rgba(255,255,255,0.92); max-width: 640px; line-height: 1.65; }
  .cdp-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.5rem; }
  .cdp-fleet { padding-top: 3rem; padding-bottom: 5rem; }
  .cdp-fleet-head { display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 1.5rem; }
  .cdp-fleet-head h2 { display: flex; align-items: center; gap: 0.6rem; font-size: 1.6rem; font-weight: 800; }
  .cdp-fleet-head span { color: var(--text-muted); font-weight: 600; }
  .cdp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
  .cdp-empty { display: flex; flex-direction: column; align-items: center; gap: 1rem; text-align: center; padding: 3.5rem 1.5rem; }
  .cdp-spinner {
    width: 44px; height: 44px; border-radius: 50%;
    border: 3px solid rgba(255,255,255,0.35); border-top-color: #fff; animation: cdp-spin 0.8s linear infinite;
  }
  @keyframes cdp-spin { to { transform: rotate(360deg); } }
  @media (max-width: 640px) {
    .cdp-logo { width: 80px; height: 80px; border-radius: 18px; }
    .cdp-actions { width: 100%; }
    .cdp-actions .y-btn { flex: 1 1 auto; }
  }
`;

export default CompanyDetail;
