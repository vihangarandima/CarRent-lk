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
  KeyRound,
  Gauge,
} from "lucide-react";
import { formatVehicleImageUrl, handleImageError } from "../utils/imageHelper";
import { useCurrency } from "../context/CurrencyContext";

const TYPE_LABELS = {
  bicycle: "Bike",
  threewheeler: "Tuk-tuk",
  "mini-car": "Mini car",
  car: "Car",
  "premium-car": "Premium",
  "mini-van": "Mini van",
  van: "Van",
  others: "Other",
};

const RENT_MODE_LABELS = {
  "self-drive": "Self-drive",
  "with-driver": "With driver",
  both: "Self-drive or with driver",
};

// km included per day: undefined = platform default (100), 0 = unlimited
export const kmAllowanceLabel = (kmPerDay) => {
  if (kmPerDay === 0) return "Unlimited km";
  return `${kmPerDay || 100} km/day included`;
};

const isRecent = (createdAt) =>
  createdAt && Date.now() - new Date(createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;

const VehicleCard = ({ vehicle, index = 0 }) => {
  const { formatPrice, formatRawPrice, activeCurrency } = useCurrency();
  const coverImage = formatVehicleImageUrl(vehicle?.images, vehicle?.vehicleType);

  const year = vehicle.year;
  const typeLabel = TYPE_LABELS[vehicle.vehicleType] || vehicle.vehicleType;
  const modeLabel = RENT_MODE_LABELS[vehicle.rentMode || "self-drive"];

  return (
    <motion.div
      className="v-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index, 6) * 0.06, duration: 0.4 }}
      whileHover={{ y: -8 }}
    >
      <div className="v-card-image-area">
        <img
          src={coverImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          loading="lazy"
          decoding="async"
          onError={(e) => handleImageError(e, formatVehicleImageUrl(null, vehicle?.vehicleType))}
        />
        <div className="v-card-badges">
          {year && <span className="v-year-badge">{year}</span>}
          {isRecent(vehicle.createdAt) && <span className="v-new-badge">New</span>}
          {vehicle.distanceFromCenter !== null &&
            vehicle.distanceFromCenter !== undefined && (
              <span className="v-dist-badge">
                📍 {vehicle.distanceFromCenter.toFixed(1)} km
              </span>
            )}
        </div>
        {vehicle.vehicleType && (
          <span className="v-type-badge">{typeLabel}</span>
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

        {/* Only show specs the lister actually entered */}
        <div className="v-specs">
            <span className="v-mode-chip">
              <KeyRound size={13} /> {modeLabel}
            </span>
            {vehicle.seats && (
              <span>
                <Users size={14} /> {vehicle.seats} seats
              </span>
            )}
            {vehicle.fuelType && (
              <span>
                <Fuel size={14} /> {vehicle.fuelType}
              </span>
            )}
            {vehicle.transmission && (
              <span>
                <Settings2 size={14} /> {vehicle.transmission}
              </span>
            )}
        </div>
        <div className="v-km-line">
          <Gauge size={13} /> {kmAllowanceLabel(vehicle.kmPerDay)}
          {Number(vehicle.pricePerKmAfter100km) > 0 && (
            <> · +{formatPrice(vehicle.pricePerKmAfter100km)}/extra km</>
          )}
        </div>

        <div className="v-card-footer">
          <div className="v-location">
            <MapPin size={13} />
            <span>{vehicle.location || "Sri Lanka"}</span>
          </div>
          <div className="v-pricing">
            <div className="v-price-main">
              {formatPrice(vehicle.pricePerDay || 0)}
              <small>/day</small>
            </div>
            {vehicle.minRentalDays > 1 && (
              <div className="v-price-extra">Min. {vehicle.minRentalDays} days</div>
            )}
          </div>
        </div>

        <Link to={`/vehicle/${vehicle._id}`} className="v-cta">
          View Details <ArrowRight size={16} />
        </Link>
      </div>

      <style>{`
        .v-new-badge {
          background: #16a34a; color: #fff; font-size: 0.7rem; font-weight: 800;
          padding: 3px 9px; border-radius: 999px; letter-spacing: 0.03em;
        }
        .v-specs .v-mode-chip {
          padding: 3px 10px; border-radius: 999px; border: 1px solid rgba(249,115,22,0.25);
          background: #fff7ed; color: #c2410c; font-weight: 700;
        }
        .v-km-line {
          display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
          font-size: 0.78rem; color: #64748b; margin: 0 0 0.75rem;
        }
        .v-card {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 30px -8px rgba(15, 23, 42, 0.08);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }

        .v-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px -10px rgba(249, 115, 22, 0.16);
          border-color: rgba(249, 115, 22, 0.3);
        }

        .v-card-image-area {
          position: relative;
          height: 175px;
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
          overflow: hidden;
        }

        .v-card-image-area img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: relative;
          z-index: 2;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .v-card:hover .v-card-image-area img {
          transform: scale(1.06);
        }

        .v-card-badges {
          position: absolute;
          top: 0.85rem;
          left: 0.85rem;
          right: 0.85rem;
          display: flex;
          justify-content: space-between;
          z-index: 3;
        }

        .v-year-badge {
          background: rgba(255, 255, 255, 0.95);
          color: #0f172a;
          padding: 0.3rem 0.7rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .v-dist-badge {
          background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
          color: white;
          padding: 0.3rem 0.7rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          backdrop-filter: blur(8px);
          box-shadow: 0 3px 10px rgba(234, 88, 12, 0.3);
        }

        .v-heart-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .v-heart-btn:hover {
          color: #ef4444;
          background: #ffffff;
          transform: scale(1.15);
        }

        .v-type-badge {
          position: absolute;
          bottom: 0.75rem;
          left: 0.85rem;
          background: linear-gradient(135deg, #ff8800 0%, #f97316 100%);
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 0.25rem 0.7rem;
          border-radius: 999px;
          box-shadow: 0 3px 10px rgba(249, 115, 22, 0.35);
          z-index: 3;
        }

        .v-card-body {
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .v-card-header {
          margin-bottom: 0.85rem;
        }

        .v-card-header h3 {
          font-family: var(--font-body);
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.3rem;
          line-height: 1.3;
        }

        .v-company-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 600;
          transition: color 0.2s;
        }

        .v-company-link:hover {
          color: #f97316;
        }

        .v-specs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .v-specs span {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
        }

        .v-specs span svg {
          color: #f97316;
        }

        .v-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 0.75rem;
          margin-bottom: 1.1rem;
        }

        .v-location {
          display: flex;
          align-items: flex-start;
          gap: 5px;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 600;
          flex: 1;
          line-height: 1.35;
        }

        .v-location svg {
          color: #f97316;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .v-pricing {
          text-align: right;
          flex-shrink: 0;
        }

        .v-price-old {
          display: block;
          font-size: 0.75rem;
          color: #94a3b8;
          text-decoration: line-through;
          margin-bottom: 2px;
          font-weight: 600;
        }

        .v-price-main {
          font-size: 1.25rem;
          font-weight: 900;
          color: #ea580c;
          line-height: 1;
        }

        .v-price-main small {
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 600;
          margin-left: 2px;
        }

        .v-price-extra {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          color: #ea580c;
          background: #fff7ed;
          padding: 2px 7px;
          border-radius: 6px;
          border: 1px solid #ffedd5;
          margin-top: 4px;
          line-height: 1.2;
          white-space: nowrap;
        }

        /* VIEW DETAILS BUTTON — Radiant Sunset Orange matching user reference */
        .v-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #ff8800 0%, #f97316 45%, #ea580c 100%);
          color: #ffffff;
          padding: 0.85rem 1.25rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 24px -4px rgba(249, 115, 22, 0.45);
          margin-top: auto;
          text-decoration: none;
          letter-spacing: 0.01em;
        }

        .v-cta:hover {
          background: linear-gradient(135deg, #ff9500 0%, #ea580c 100%);
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -4px rgba(234, 88, 12, 0.58);
          gap: 0.75rem;
          color: #ffffff;
        }
      `}</style>
    </motion.div>
  );
};

export default VehicleCard;
