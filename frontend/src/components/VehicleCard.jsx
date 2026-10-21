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
  const { formatPrice } = useCurrency();
  const coverImage = formatVehicleImageUrl(vehicle?.images, vehicle?.vehicleType);

  const year = vehicle.year;
  const typeLabel = TYPE_LABELS[vehicle.vehicleType] || vehicle.vehicleType;
  const modeLabel = RENT_MODE_LABELS[vehicle.rentMode || "self-drive"];
  const companyObj =
    typeof vehicle?.company === "object" && vehicle?.company !== null
      ? vehicle.company
      : null;
  const companyId =
    companyObj?._id ||
    (typeof vehicle?.company === "string" ? vehicle.company : null);
  const companyName = companyObj?.companyName;
  const isPersonalHost = Boolean(companyObj?.isPersonal);

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
          {(vehicle.hasBookings || vehicle.status === "rented") && (
            <span className="v-booked-dates-badge">
              <span className="badge-text-desktop">📅 Booked for Some Dates</span>
              <span className="badge-text-mobile">📅 Booked</span>
            </span>
          )}
          {isRecent(vehicle.createdAt) && !vehicle.hasBookings && vehicle.status !== "rented" && <span className="v-new-badge">New</span>}
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
          {companyId && companyName && !isPersonalHost && (
            <Link
              to={`/companies/${companyId}`}
              className="v-company-link"
              onClick={(e) => e.stopPropagation()}
            >
              <Building2 size={12} /> {companyName}
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

        {(vehicle.hasBookings || vehicle.status === "rented") && (
          <div className="v-booked-notice-line">
            <span className="dot-booked-indicator" />
            <span>
              {vehicle.bookedIntervals?.[0] ? (
                <>
                  Reserved {new Date(vehicle.bookedIntervals[0].pickupDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – {new Date(vehicle.bookedIntervals[0].returnDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · Other dates open
                </>
              ) : (
                <>Reserved on certain dates · Check calendar</>
              )}
            </span>
          </div>
        )}

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

        <Link to={`/vehicle/${vehicle._id}`} className={`v-cta ${vehicle.hasBookings || vehicle.status === "rented" ? "v-cta-check-dates" : ""}`}>
          <span className="v-cta-text-desktop">
            {vehicle.hasBookings || vehicle.status === "rented" ? "Check Available Dates" : "View Details"}
          </span>
          <span className="v-cta-text-mobile">
            {vehicle.hasBookings || vehicle.status === "rented" ? "Check Dates" : "Details"}
          </span>
          <ArrowRight size={14} className="v-cta-arrow" />
        </Link>
      </div>

      <style>{`
        .v-new-badge {
          background: #16a34a; color: #fff; font-size: 0.7rem; font-weight: 800;
          padding: 3px 9px; border-radius: 999px; letter-spacing: 0.03em;
        }
        .v-booked-dates-badge {
          background: #ea580c; color: #fff; font-size: 0.7rem; font-weight: 750;
          padding: 3px 9px; border-radius: 999px; letter-spacing: 0.02em;
          box-shadow: 0 2px 6px rgba(234, 88, 12, 0.35);
        }
        .v-booked-notice-line {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fff7ed;
          border: 1px solid #ffedd5;
          border-radius: 6px;
          padding: 5px 8px;
          font-size: 0.74rem;
          font-weight: 650;
          color: #c2410c;
          margin: 0 0 0.75rem;
        }
        .dot-booked-indicator {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #ea580c;
          display: inline-block;
          flex-shrink: 0;
        }
        .v-cta.v-cta-check-dates {
          background: #0f172a;
          color: #ffffff;
        }
        .v-cta.v-cta-check-dates:hover {
          background: #ea580c;
          color: #ffffff;
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

        .badge-text-desktop { display: inline; }
        .badge-text-mobile { display: none; }
        .v-cta-text-desktop { display: inline; }
        .v-cta-text-mobile { display: none; }

        @media (max-width: 640px) {
          .badge-text-desktop { display: none; }
          .badge-text-mobile { display: inline; }
          .v-cta-text-desktop { display: none; }
          .v-cta-text-mobile { display: inline; }

          .v-card {
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          }
          .v-card-image-area {
            height: 125px;
          }
          .v-card-badges {
            top: 0.4rem;
            left: 0.4rem;
            right: 0.4rem;
            gap: 4px;
          }
          .v-year-badge {
            padding: 0.15rem 0.45rem;
            font-size: 0.62rem;
            border-radius: 5px;
          }
          .v-booked-dates-badge {
            padding: 0.15rem 0.45rem;
            font-size: 0.62rem;
          }
          .v-new-badge {
            padding: 0.15rem 0.45rem;
            font-size: 0.62rem;
          }
          .v-dist-badge {
            padding: 0.15rem 0.45rem;
            font-size: 0.62rem;
            border-radius: 5px;
          }
          .v-type-badge {
            bottom: 0.4rem;
            left: 0.4rem;
            padding: 0.15rem 0.45rem;
            font-size: 0.6rem;
            letter-spacing: 0.03em;
          }
          .v-card-body {
            padding: 0.65rem 0.6rem 0.7rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .v-card-header {
            margin-bottom: 0.35rem;
          }
          .v-card-header h3 {
            font-size: 0.88rem;
            font-weight: 750;
            margin: 0 0 2px;
            line-height: 1.25;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .v-company-link {
            font-size: 0.66rem;
            gap: 3px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }
          .v-specs {
            gap: 0.25rem;
            margin-bottom: 0.35rem;
            padding-bottom: 0.35rem;
          }
          .v-specs span {
            font-size: 0.62rem;
            gap: 3px;
            padding: 1px 4px;
            background: #f8fafc;
            border-radius: 4px;
            white-space: nowrap;
          }
          .v-specs span svg {
            width: 10px;
            height: 10px;
          }
          .v-specs .v-mode-chip {
            padding: 2px 5px;
            font-size: 0.62rem;
          }
          .v-km-line {
            font-size: 0.62rem;
            margin-bottom: 0.35rem;
            gap: 3px;
            line-height: 1.2;
          }
          .v-km-line svg {
            width: 10px;
            height: 10px;
          }
          .v-booked-notice-line {
            font-size: 0.6rem;
            padding: 3px 5px;
            margin-bottom: 0.35rem;
            border-radius: 5px;
            line-height: 1.2;
          }
          .v-card-footer {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.2rem;
            margin-bottom: 0.45rem;
          }
          .v-location {
            font-size: 0.66rem;
            gap: 3px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }
          .v-location svg {
            width: 10px;
            height: 10px;
          }
          .v-pricing {
            text-align: left;
            display: flex;
            align-items: baseline;
            gap: 3px;
            flex-wrap: wrap;
          }
          .v-price-main {
            font-size: 0.98rem;
            font-weight: 850;
          }
          .v-price-main small {
            font-size: 0.65rem;
          }
          .v-price-extra {
            font-size: 0.58rem;
            padding: 1px 4px;
            margin-top: 0;
          }
          .v-cta {
            padding: 0.5rem 0.6rem;
            min-height: 38px;
            font-size: 0.78rem;
            font-weight: 750;
            border-radius: 9px;
            gap: 0.25rem;
            box-shadow: 0 4px 12px -2px rgba(249, 115, 22, 0.35);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default VehicleCard;
