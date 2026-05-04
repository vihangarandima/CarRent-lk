import React from 'react';
import { Link } from 'react-router-dom';

const VehicleCard = ({ vehicle }) => {
  // Use the first image in the array, or a cool default car silhouette if none exists
  const coverImage = vehicle.images && vehicle.images.length > 0 
    ? vehicle.images[0] 
    : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=300';

  return (
    <div className="vehicle-card glass-card">
      <div className="card-image" style={{ backgroundImage: `url(${coverImage})` }}>
        <div className="price-tag">LKR {vehicle.pricePerDay}/day</div>
      </div>
      <div className="card-body">
        <h3>{vehicle.brand} {vehicle.model}</h3>
        <p className="year">{vehicle.year} • {vehicle.location}</p>
        <Link to={`/vehicle/${vehicle._id}`} className="btn-secondary">View Details</Link>
      </div>
      <style>{`
        .vehicle-card {
          padding: 0;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(255, 255, 255, 0.03);
          border: 1.5px solid var(--border);
          border-radius: 1.5rem;
        }
        .vehicle-card:hover {
          transform: translateY(-8px);
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .card-image {
          height: 220px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .price-tag {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--grad-primary);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-weight: 800;
          font-size: 0.85rem;
          color: white;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
        .card-body {
          padding: 1.5rem;
        }
        .card-body h3 {
          margin-bottom: 0.5rem;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: white;
        }
        .year {
          color: var(--text-muted);
          margin-bottom: 1.75rem;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .btn-secondary {
          display: block;
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          border: 1.5px solid var(--border);
          padding: 0.75rem;
          border-radius: 3rem;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.3s;
        }
        .btn-secondary:hover {
          background: white;
          color: var(--bg-dark);
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default VehicleCard;
