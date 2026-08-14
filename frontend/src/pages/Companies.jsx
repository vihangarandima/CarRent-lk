import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Building2, MapPin, Car, Search, ArrowRight, CheckCircle, Star } from "lucide-react";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const vehicleTypes = [
    {
      id: "all",
      title: "All",
      icon: <Building2 size={24} />,
    },
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

  const [selectedType, setSelectedType] = useState("all");

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

  const totalCompanies = companies.length;
  const totalVehicles = companies.reduce((acc, c) => acc + (c.vehicleCount || 0), 0);
  
  const ratedCompanies = companies.filter(c => c.rating && c.rating > 0);
  const averageRating = ratedCompanies.length > 0 
    ? (ratedCompanies.reduce((acc, c) => acc + c.rating, 0) / ratedCompanies.length).toFixed(1)
    : "0.0";

  return (
    <div className="companies-page">
      {/* Hero */}
      <div className="companies-hero">
        <div className="companies-hero-inner">
          <div className="hero-content">
            <div className="companies-badge">
              <CheckCircle size={14} /> VERIFIED PARTNERS
            </div>
            <h1>
              Rent from Sri Lanka's
              <br />
              <span>trusted rental companies</span>
            </h1>
            <p>
              Every partner on Yamu is verified, insured and reviewed. Browse their
              fleets, compare vehicles and book straight with the company.
            </p>
            <div className="companies-search-bar">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by company or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="search-btn">Search</button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <h3>{totalCompanies}</h3>
                <p>VERIFIED COMPANIES</p>
              </div>
              <div className="stat-item">
                <h3>{totalVehicles}</h3>
                <p>VEHICLES LISTED</p>
              </div>
              <div className="stat-item">
                <h3>{averageRating}</h3>
                <p>AVERAGE RATING</p>
              </div>
            </div>
          </div>

          <div className="hero-filters">
            <div className="vehicle-type-section">
              <div className="vehicle-type-header">
                <h2>Pick a vehicle type</h2>
                <p>
                  Filter partners by what they have on the road.
                </p>
              </div>
              <div className="vehicle-type-grid">
                {vehicleTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className={`vehicle-type-card ${selectedType === type.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedType(type.id);
                      if (type.id !== 'all') {
                         navigate(`/vehicles?type=${type.id}`);
                      }
                    }}
                  >
                    <div className="vehicle-type-icon">
                      {type.icon ? type.icon : <img src={type.image} alt={type.title} />}
                    </div>
                    <span>{type.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="companies-grid-section">
        <div className="companies-grid-inner">
          <div className="section-header">
            <h2>Rental companies</h2>
            <p>{companies.length} partners match your filters.</p>
          </div>

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
                    <div className="top-row">
                      <div className="company-logo-wrap">
                        {company.logo ? (
                          <img src={company.logo} alt={company.companyName} />
                        ) : (
                          <div className="company-logo-placeholder">
                            <Building2 size={24} color="#f97316" />
                          </div>
                        )}
                      </div>
                      <div className="company-verified-badge"><CheckCircle size={12}/> Verified</div>
                    </div>
                    <div className="company-rating-row">
                       <span className="rating"><Star size={12} fill="#111" stroke="none"/> {company.rating ? company.rating.toFixed(1) : "New"}</span>
                       <span className="dot">•</span>
                       <span className="partner-since">partner since {company.createdAt ? new Date(company.createdAt).getFullYear() : '2019'}</span>
                    </div>
                  </div>
                  <div className="company-card-body">
                    <h3>{company.companyName}</h3>
                    {company.address && (
                      <p className="company-location">
                        <MapPin size={14} /> {company.address}
                      </p>
                    )}
                    <p className="company-desc">
                      {company.description
                        ? company.description.slice(0, 90) +
                          (company.description.length > 90 ? "..." : "")
                        : "A trusted car rental partner offering great services."}
                    </p>
                    <div className="company-badges">
                      <div className="badge-vehicles">{company.vehicleCount || 12} vehicles</div>
                      <div className="badge-type">Car</div>
                      <div className="badge-type">SUV</div>
                    </div>
                  </div>
                  <div className="company-card-footer">
                    <span>View fleet</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .companies-page { 
          min-height: 100vh; 
          font-family: var(--font-body, 'Inter', 'Plus Jakarta Sans', sans-serif); 
          background: #FAFAFA;
        }

        .companies-hero {
          background: linear-gradient(135deg, #2A1F1A 0%, #1A120E 50%, #2A1F1A 100%);
          padding: 140px 5% 80px;
          color: white;
        }
        
        .companies-hero-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .hero-content {
          max-width: 600px;
        }

        .companies-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: transparent;
          border: 1px solid rgba(251, 191, 36, 0.3);
          color: #FBBF24;
          padding: 6px 14px; border-radius: 100px;
          font-size: 0.75rem; font-weight: 700; margin-bottom: 1.5rem;
          letter-spacing: 0.05em;
        }
        .companies-badge svg { color: #f97316; }

        .companies-hero h1 {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 800; color: white; line-height: 1.1;
          margin-bottom: 1.25rem; letter-spacing: -1px;
        }
        .companies-hero h1 span { color: #FBBF24; display: block; }

        .companies-hero p { 
          color: #D1D5DB; 
          font-size: 1.1rem; 
          margin-bottom: 2.5rem;
          line-height: 1.6;
          max-width: 500px;
        }

        .companies-search-bar {
          position: relative; max-width: 500px; 
          display: flex; align-items: center;
          background: white;
          border-radius: 100px;
          padding: 6px;
          margin-bottom: 3rem;
        }
        .companies-search-bar .search-icon {
          position: absolute; left: 20px; color: #9CA3AF;
        }
        .companies-search-bar input {
          width: 100%; padding: 14px 16px 14px 46px;
          border: none; border-radius: 100px;
          font-size: 1rem; background: transparent; outline: none;
          color: #111;
        }
        .search-btn {
          background: #f97316;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 100px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .search-btn:hover { background: #ea580c; }

        .hero-stats {
          display: flex;
          gap: 3rem;
        }
        .stat-item h3 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 4px;
          color: white;
        }
        .stat-item p {
          font-size: 0.75rem;
          color: #9CA3AF;
          margin: 0;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .hero-filters {
          flex: 1;
          max-width: 450px;
        }

        .vehicle-type-section {
          background: #231B16;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 1.75rem;
        }
        .vehicle-type-header {
          margin-bottom: 1.25rem;
        }
        .vehicle-type-header h2 {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
        }
        .vehicle-type-header p {
          color: #9CA3AF;
          margin: 0;
          font-size: 0.85rem;
        }
        .vehicle-type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .vehicle-type-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 1.25rem 0.5rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #9CA3AF;
        }
        .vehicle-type-card.active, .vehicle-type-card:hover {
          background: white;
          color: #111;
        }
        .vehicle-type-icon {
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vehicle-type-icon svg {
          stroke: #f97316;
          color: #f97316;
        }
        .vehicle-type-icon img {
          height: 24px;
          width: auto;
          filter: brightness(0) saturate(100%) invert(64%) sepia(35%) saturate(3994%) hue-rotate(345deg) brightness(98%) contrast(98%);
        }
        .vehicle-type-card.active .vehicle-type-icon img, .vehicle-type-card:hover .vehicle-type-icon img {
          filter: none;
        }
        .vehicle-type-card span {
          font-weight: 600;
          font-size: 0.8rem;
        }

        .companies-grid-section { padding: 4rem 5% 5rem; }
        .companies-grid-inner { max-width: 1280px; margin: 0 auto; }
        
        .section-header {
          margin-bottom: 2rem;
        }
        .section-header h2 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #111;
          margin-bottom: 4px;
        }
        .section-header p {
          color: #6B7280;
          font-size: 0.95rem;
        }

        .company-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .company-card {
          background: white; border-radius: 1.25rem;
          border: 1px solid #E5E7EB;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          overflow: hidden; display: flex; flex-direction: column;
          cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
        }
        .company-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.06); }

        .company-card-top {
          background: #FFAD5C; 
          padding: 1.25rem;
          display: flex; flex-direction: column; gap: 1rem;
        }

        .top-row {
          display: flex; justify-content: space-between; align-items: flex-start;
        }

        .company-logo-wrap { width: 44px; height: 44px; border-radius: 50%; overflow: hidden; background: white; display: flex; align-items: center; justify-content: center; }
        .company-logo-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .company-logo-placeholder { color: #f97316; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }

        .company-verified-badge {
          background: white; color: #10B981;
          font-size: 0.75rem; font-weight: 700;
          padding: 6px 12px; border-radius: 100px;
          display: flex; align-items: center; gap: 4px;
        }
        
        .company-rating-row {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.75rem; font-weight: 600; color: #432C0B;
        }
        .company-rating-row .rating { display: flex; align-items: center; gap: 3px; }
        .company-rating-row .dot { opacity: 0.5; }

        .company-card-body { padding: 1.25rem; flex: 1; }
        .company-card-body h3 { font-size: 1.15rem; font-weight: 800; color: #111; margin-bottom: 0.35rem; }

        .company-location {
          display: inline-flex; align-items: center; gap: 4px;
          color: #6B7280; font-size: 0.8rem; margin-bottom: 1rem;
        }
        .company-desc { color: #6B7280; font-size: 0.85rem; line-height: 1.5; margin-bottom: 1.25rem; }
        
        .company-badges {
          display: flex; flex-wrap: wrap; gap: 6px;
        }
        .badge-vehicles {
          background: #FFF7ED; color: #EA580C;
          font-size: 0.7rem; font-weight: 600;
          padding: 4px 10px; border-radius: 100px;
        }
        .badge-type {
          background: #F3F4F6; color: #4B5563;
          font-size: 0.7rem; font-weight: 600;
          padding: 4px 10px; border-radius: 100px;
        }

        .company-card-footer {
          padding: 0 1.25rem 1.25rem;
        }
        
        .company-card-footer span {
          display: flex; justify-content: space-between; align-items: center;
          background: #F9FAFB;
          border: 1px solid #F3F4F6;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #111;
        }
        
        .company-card-skeleton {
          height: 320px; border-radius: 1.25rem;
          background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        .loading-state { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
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
        
        @media (max-width: 900px) {
           .companies-hero-inner {
              flex-direction: column;
           }
           .hero-filters {
              max-width: 100%;
              width: 100%;
           }
        }
      `}</style>
    </div>
  );
};

export default Companies;
