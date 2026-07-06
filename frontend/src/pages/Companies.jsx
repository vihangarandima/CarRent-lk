import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Building2, MapPin, Car, Search, ArrowRight } from "lucide-react";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const vehicleTypes = [
    {
      id: "bicycle",
      title: "Bicycle",
      image: "/assets/images/vehicle-bicycle.svg",
    },
    {
      id: "threewheel",
      title: "Three-wheeler",
      image: "/assets/images/vehicle-threewheel.svg",
    },
    {
      id: "car",
      title: "Car",
      image: "/assets/images/vehicle-car.svg",
    },
    {
      id: "van",
      title: "Van",
      image: "/assets/images/vehicle-van.svg",
    },
    {
      id: "suv",
      title: "SUV",
      image: "/assets/images/vehicle-suv.svg",
    },
  ];

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/companies${search ? `?search=${search}` : ""}`,
        );
        setCompanies(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [search]);

  return (
    <div className="companies-page">
      {/* Hero */}
      <div className="companies-hero">
        <div className="companies-hero-inner">
          <div className="companies-badge">
            <Building2 size={14} /> Verified Partners
          </div>
          <h1>
            Rent from Sri Lanka's
            <br />
            <span>Trusted Companies</span>
          </h1>
          <p>
            Browse our network of verified car rental companies offering premium
            fleets across the islandddd.
          </p>
          <div className="companies-search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search companies by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="vehicle-type-section">
            <div className="vehicle-type-header">
              <h2>Pick a vehicle type</h2>
              <p>
                Browse the fleet by category and choose the ride that fits your
                trip.
              </p>
            </div>
            <div className="vehicle-type-grid">
              {vehicleTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className="vehicle-type-card"
                  onClick={() => navigate(`/vehicles?type=${type.id}`)}
                >
                  <div className="vehicle-type-image">
                    <img src={type.image} alt={type.title} />
                  </div>
                  <span>{type.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="companies-grid-section">
        <div className="companies-grid-inner">
          {loading ? (
            <div className="loading-state">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="company-card-skeleton" />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="empty-state">
              <Building2 size={48} color="#DDD6FE" />
              <h3>No companies found</h3>
              <p>Be the first to register your company on CarRents.lk</p>
              <Link
                to="/register?role=company"
                className="btn-register-company"
              >
                Register Your Company →
              </Link>
            </div>
          ) : (
            <div className="company-cards-grid">
              {companies.map((company) => (
                <div
                  key={company._id}
                  className="company-card"
                  onClick={() => navigate(`/companies/${company._id}`)}
                >
                  <div className="company-card-top">
                    <div className="company-logo-wrap">
                      {company.logo ? (
                        <img src={company.logo} alt={company.companyName} />
                      ) : (
                        <div className="company-logo-placeholder">
                          <Building2 size={28} color="#f97316" />
                        </div>
                      )}
                    </div>
                    <div className="company-verified-badge">✓ Verified</div>
                  </div>
                  <div className="company-card-body">
                    <h3>{company.companyName}</h3>
                    {company.address && (
                      <p className="company-location">
                        <MapPin size={13} /> {company.address}
                      </p>
                    )}
                    <p className="company-desc">
                      {company.description
                        ? company.description.slice(0, 90) +
                          (company.description.length > 90 ? "..." : "")
                        : "A trusted car rental partner on CarRents.lk"}
                    </p>
                    <div className="company-fleet-count">
                      <Car size={14} /> {company.vehicleCount || 0} vehicles
                    </div>
                  </div>
                  <Link
                    to={`/companies/${company._id}`}
                    className="company-view-btn"
                  >
                    View Fleet <ArrowRight size={15} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .companies-page { 
          min-height: 100vh; 
          font-family: 'Inter', sans-serif; 
          background: linear-gradient(90deg, rgba(249, 115, 22, 0.03) 1px, transparent 1px),
                      linear-gradient(rgba(249, 115, 22, 0.03) 1px, transparent 1px);
          background-size: clamp(30px, 5vw, 60px) clamp(30px, 5vw, 60px);
          background-attachment: fixed;
          transition: background-color 0.3s ease;
        }
        .companies-page:hover {
          background: linear-gradient(90deg, rgba(249, 115, 22, 0.06) 1px, transparent 1px),
                      linear-gradient(rgba(249, 115, 22, 0.06) 1px, transparent 1px);
          background-size: clamp(30px, 5vw, 60px) clamp(30px, 5vw, 60px);
          background-attachment: fixed;
        }

        .companies-hero {
          position: relative;
          background: url('/assets/images/company.jpg') center/cover fixed;
          padding: 80px 2rem 60px;
          text-align: center;
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
          overflow: hidden;
        }
        .companies-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.55) 100%);
          z-index: 1;
        }
        .companies-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 700px;
          margin: 0 auto;
        }

        .companies-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #f97316; color: white;
          padding: 6px 16px; border-radius: 100px;
          font-size: 0.78rem; font-weight: 700; margin-bottom: 1.5rem;
        }

        .companies-hero h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 900; color: white; line-height: 1.1;
          margin-bottom: 1rem; letter-spacing: -1px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .companies-hero h1 span { color: #FBBF24; }
        .companies-hero p { 
          color: rgba(255, 255, 255, 0.95); 
          font-size: 1.05rem; 
          margin-bottom: 2rem;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }

        .companies-search-bar {
          position: relative; max-width: 480px; margin: 0 auto;
          display: flex; align-items: center;
        }
        .companies-search-bar .search-icon {
          position: absolute; left: 16px; color: #9CA3AF;
        }
        .companies-search-bar input {
          width: 100%; padding: 14px 16px 14px 46px;
          border: 2px solid #DDD6FE; border-radius: 100px;
          font-size: 0.95rem; background: white; outline: none;
          transition: border-color 0.2s;
        }
        .companies-search-bar input:focus { border-color: #f97316; }

        .companies-grid-section { padding: 3rem 2rem 5rem; }
        .companies-grid-inner { max-width: 1280px; margin: 0 auto; }

        .vehicle-type-section {
          margin: 2.5rem 0 0;
          padding: 1.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid #F8E7D7;
          border-radius: 28px;
          box-shadow: 0 16px 40px rgba(249, 115, 22, 0.08);
        }
        .vehicle-type-header {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .vehicle-type-header h2 {
          font-size: 1.45rem;
          font-weight: 800;
          color: #111827;
          margin: 0;
        }
        .vehicle-type-header p {
          color: #6B7280;
          margin: 0;
          font-size: 0.95rem;
        }
        .vehicle-type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
        }
        .vehicle-type-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: white;
          border: 1px solid #F1F5F9;
          border-radius: 24px;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          text-align: center;
        }
        .vehicle-type-card:hover {
          transform: translateY(-4px);
          border-color: #f97316;
          box-shadow: 0 18px 36px rgba(249, 115, 22, 0.12);
        }
        .vehicle-type-image {
          width: 100%;
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          background: #FAFAFA;
          border-radius: 20px;
        }
        .vehicle-type-image img {
          width: 80%;
          height: auto;
          display: block;
        }
        .vehicle-type-card span {
          color: #111827;
          font-weight: 700;
          font-size: 0.98rem;
        }

        .company-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .company-card {
          background: white; border-radius: 1.5rem;
          border: 1px solid #F1F5F9;
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
          overflow: hidden; display: flex; flex-direction: column;
          cursor: pointer; transition: transform 0.25s, box-shadow 0.25s;
        }
        .company-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(249,115,22,0.1); }

        .company-card-top {
          background: linear-gradient(135deg, #FEF3C7, #FCD34D);
          padding: 1.5rem;
          display: flex; justify-content: space-between; align-items: flex-start;
        }

        .company-logo-wrap { width: 60px; height: 60px; border-radius: 14px; overflow: hidden; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .company-logo-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .company-logo-placeholder { width: 60px; height: 60px; border-radius: 14px; background: #FEF3C7; display: flex; align-items: center; justify-content: center; }

        .company-verified-badge {
          background: #DCFCE7; color: #16A34A;
          font-size: 0.72rem; font-weight: 700;
          padding: 4px 10px; border-radius: 100px;
        }

        .company-card-body { padding: 1.25rem 1.5rem; flex: 1; }
        .company-card-body h3 { font-size: 1.15rem; font-weight: 800; color: #111827; margin-bottom: 0.35rem; }

        .company-location {
          display: inline-flex; align-items: center; gap: 4px;
          color: #6B7280; font-size: 0.82rem; margin-bottom: 0.6rem;
        }
        .company-desc { color: #6B7280; font-size: 0.85rem; line-height: 1.5; margin-bottom: 0.75rem; }
        .company-fleet-count {
          display: inline-flex; align-items: center; gap: 5px;
          background: #ffedd5; color: #ea580c;
          font-size: 0.78rem; font-weight: 700;
          padding: 4px 10px; border-radius: 100px;
        }

        .company-view-btn {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          background: #f97316; color: white;
          padding: 0.85rem; font-weight: 700; font-size: 0.9rem;
          text-decoration: none; transition: background 0.2s;
        }
        .company-view-btn:hover { background: #ea580c; }

        .company-card-skeleton {
          height: 280px; border-radius: 1.5rem;
          background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        .loading-state { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }

        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .empty-state {
          text-align: center; padding: 5rem 2rem;
          display: flex; flex-direction: column; align-items: center; gap: 1rem;
        }
        .empty-state h3 { font-size: 1.5rem; font-weight: 800; color: #1F2937; }
        .empty-state p { color: #6B7280; }

        .btn-register-company {
          background: #f97316; color: white;
          padding: 0.75rem 2rem; border-radius: 100px;
          font-weight: 700; text-decoration: none;
          transition: background 0.2s;
        }
        .btn-register-company:hover { background: #ea580c; }
      `}</style>
    </div>
  );
};

export default Companies;
