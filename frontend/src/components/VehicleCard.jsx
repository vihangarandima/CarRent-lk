import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Users,
  Fuel,
  Settings2,
  Building2,
  ArrowRight,
} from "lucide-react";

const VehicleCard = ({ vehicle, index = 0 }) => {
  const coverImage =
    vehicle.images && vehicle.images.length > 0 && vehicle.images[0]
      ? vehicle.images[0]
      : "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600";

  const year = vehicle.year || "2024";
  const originalPrice = (vehicle.pricePerDay * 1.12).toLocaleString();

  return (
    <motion.div
      className="v-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -8 }}
    >
      <div className="v-card-image-area">
        <div className="v-spotlight" />
        <img src={coverImage} alt={`${vehicle.brand} ${vehicle.model}`} />
        <div className="v-card-badges">
          <span className="v-year-badge">{year}</span>
          <button className="v-heart-btn" type="button" aria-label="Save">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
        {vehicle.vehicleType && (
          <span className="v-type-badge">{vehicle.vehicleType}</span>
        )}
      </div>

      <div className="v-card-body">
        <div className="v-card-header">
          <h3>
            {vehicle.brand} {vehicle.model}
          </h3>
          {vehicle.company && (
            <Link
              to={`/companies/${vehicle.company._id}`}
              className="v-company-link"
            >
              <Building2 size={12} /> {vehicle.company.companyName}
            </Link>
          )}
        </div>

        <div className="v-specs">
          <span>
            <Users size={14} /> {vehicle.seats || 5} seats
          </span>
          <span>
            <Fuel size={14} /> {vehicle.fuelType || "Petrol"}
          </span>
          <span>
            <Settings2 size={14} /> {vehicle.transmission || "Auto"}
          </span>
        </div>

        <div className="v-card-footer">
          <div className="v-location">
            <MapPin size={13} />
            <span>{vehicle.location || "Sri Lanka"}</span>
          </div>
          <div className="v-pricing">
            <span className="v-price-old">LKR {originalPrice}</span>
            <div className="v-price-main">
              LKR {vehicle.pricePerDay?.toLocaleString()}
              <small>/day</small>
            </div>
          </div>
        </div>

        <Link to={`/vehicle/${vehicle._id}`} className="v-cta">
          View Details <ArrowRight size={16} />
        </Link>
      </div>

      <style>{`
        .v-card {
          background: white;
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-card);
          transition: box-shadow 0.35s ease, border-color 0.35s ease;
          display: flex;
          flex-direction: column;
        }

        .v-card:hover {
          box-shadow: var(--shadow-card-hover);
          border-color: rgba(249, 115, 22, 0.25);
        }

        .v-card-image-area {
          position: relative;
          height: 210px;
          background: linear-gradient(180deg, #1c1917 0%, #292524 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .v-spotlight {
          position: absolute;
          width: 70%;
          height: 70%;
          background: radial-gradient(
            ellipse at center,
            rgba(249, 115, 22, 0.2) 0%,
            rgba(249, 115, 22, 0.05) 50%,
            transparent 70%
          );
          border-radius: 50%;
          z-index: 1;
        }

        .v-card-image-area img {
          width: 85%;
          height: auto;
          object-fit: contain;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3));
          transition: transform 0.4s ease;
        }

        .v-card:hover .v-card-image-area img {
          transform: scale(1.05);
        }

        .v-card-badges {
          position: absolute;
          top: 1rem;
          left: 1rem;
          right: 1rem;
          display: flex;
          justify-content: space-between;
          z-index: 3;
        }

        .v-year-badge {
          background: rgba(255, 255, 255, 0.95);
          color: var(--text);
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .v-heart-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-hint);
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .v-heart-btn:hover {
          color: #ef4444;
          background: white;
          transform: scale(1.1);
        }

        .v-type-badge {
          position: absolute;
          bottom: 0.75rem;
          left: 1rem;
          background: var(--primary);
          color: white;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-pill);
          z-index: 3;
        }

        .v-card-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .v-card-header {
          margin-bottom: 0.85rem;
        }

        .v-card-header h3 {
          font-family: var(--font-body);
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text);
          margin: 0 0 0.35rem;
          line-height: 1.3;
        }

        .v-company-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
          font-size: 0.78rem;
          font-weight: 600;
          transition: color 0.2s;
        }

        .v-company-link:hover {
          color: var(--primary);
        }

        .v-specs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .v-specs span {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .v-specs span svg {
          color: var(--primary);
        }

        .v-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 1rem;
        }

        .v-location {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
          font-size: 0.78rem;
          font-weight: 500;
        }

        .v-location svg {
          color: var(--primary);
          flex-shrink: 0;
        }

        .v-pricing {
          text-align: right;
        }

        .v-price-old {
          display: block;
          font-size: 0.75rem;
          color: var(--text-hint);
          text-decoration: line-through;
          margin-bottom: 2px;
        }

        .v-price-main {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
        }

        .v-price-main small {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .v-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: var(--grad-primary);
          color: white;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px var(--primary-glow);
          margin-top: auto;
        }

        .v-cta:hover {
          box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4);
          gap: 0.65rem;
        }
      `}</style>
    </motion.div>
  );
};

export default VehicleCard;
