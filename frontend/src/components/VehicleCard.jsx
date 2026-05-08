import React from 'react';
import { Link } from 'react-router-dom';

const VehicleCard = ({ vehicle }) => {
  const coverImage = vehicle.images && vehicle.images.length > 0 && vehicle.images[0]
    ? vehicle.images[0]
    : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600';

  return (
    <div className="v-card">
      <div className="v-card-image" style={{ backgroundImage: `url(${coverImage})` }}>
        <div className="v-price">LKR {vehicle.pricePerDay?.toLocaleString()}<span>/day</span></div>
        <div className="v-location">📍 {vehicle.location}</div>
      </div>
      <div className="v-card-body">
        <div className="v-meta">
          <span className="v-year">{vehicle.year}</span>
          <span className="v-dot">·</span>
          <span className="v-type">Car</span>
        </div>
        <h3 className="v-name">{vehicle.brand} {vehicle.model}</h3>
        <Link to={`/vehicle/${vehicle._id}`} className="v-btn">
          View Details →
        </Link>
      </div>

      <style>{`
        .v-card {
          background: white;
          border: 1px solid #f3f4f6;
          border-radius: 1.25rem;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .v-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .v-card-image {
          height: 220px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .v-price {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: #8B5CF6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);
        }
        .v-price span {
          font-weight: 500;
          font-size: 0.75rem;
          opacity: 0.9;
        }
        .v-location {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          color: #374151;
          padding: 0.4rem 0.8rem;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .v-card-body {
          padding: 1.5rem;
        }
        .v-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: #6B7280;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .v-dot { color: #D1D5DB; }
        .v-year { color: #8B5CF6; font-weight: 700; }
        .v-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 1.5rem;
          letter-spacing: -0.01em;
        }
        .v-btn {
          display: block;
          text-align: center;
          background: white;
          border: 1px solid #E5E7EB;
          padding: 0.8rem 1rem;
          border-radius: 0.75rem;
          color: #374151;
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.2s;
          text-decoration: none;
        }
        .v-btn:hover {
          background: #8B5CF6;
          color: white;
          border-color: #8B5CF6;
          box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);
        }
      `}</style>
    </div>
  );
};

export default VehicleCard;
