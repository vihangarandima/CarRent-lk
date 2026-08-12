import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Star, Check, CheckCircle2, MessageSquare, Navigation } from "lucide-react";
import axios from "axios";
import { API_URL } from "../config";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, subDays } from "date-fns";

const detailMapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem",
};

const VehicleDetail = () => {
  const { id } = useParams();
  
  // Booking State
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  
  // Dummy booked dates (e.g. today + 2, today + 3) to show the feature
  const bookedDates = [
    addDays(new Date(), 2),
    addDays(new Date(), 3),
    addDays(new Date(), 7),
  ];

  const [sent, setSent] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/vehicles/${id}`);
        setVehicle(res.data);
      } catch (err) {
        console.error("Error fetching vehicle:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  const handleContact = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Please select your required booking dates on the calendar first.");
      return;
    }
    setSent(true);
  };

  if (loading) {
    return (
      <div className="detail-wrap">
        <div className="container" style={{ textAlign: "center", padding: "8rem 0" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p style={{ color: "#6b7280" }}>Loading vehicle...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="detail-wrap">
        <div className="container" style={{ textAlign: "center", padding: "8rem 0" }}>
          <h2 style={{ color: "#111827" }}>Vehicle not found</h2>
          <Link to="/vehicles" style={{ color: "#f97316", fontWeight: 700 }}>← Back to Listings</Link>
        </div>
      </div>
    );
  }

  const coverImage =
    vehicle.images && vehicle.images.length > 0 && vehicle.images[0]
      ? vehicle.images[0]
      : "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200";

  return (
    <div className="detail-wrap">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/vehicles">← Back to Listings</Link>
        </div>

        <div className="detail-grid">
          {/* Left: Info */}
          <div className="detail-main">
            <div className="main-image-wrap">
              <img
                src={coverImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="main-image"
              />
              <div className="image-badge">
                <MapPin
                  size={14}
                  style={{
                    marginRight: "4px",
                    verticalAlign: "middle",
                    display: "inline-block",
                  }}
                />
                <span>{vehicle.location}</span>
              </div>
            </div>

            <div className="vehicle-header">
              <div>
                <span className="vehicle-year-chip">{vehicle.year}</span>
                <h1>
                  {vehicle.brand} {vehicle.model}
                </h1>
              </div>
              <div className="vehicle-rating">
                <span>
                  <Star
                    size={16}
                    fill="#f59e0b"
                    color="#f59e0b"
                    style={{
                      marginRight: "6px",
                      verticalAlign: "middle",
                      display: "inline-block",
                    }}
                  />
                  {vehicle.rating || "5.0"}
                </span>
                <small>{vehicle.trips || "0"} trips</small>
              </div>
            </div>

            <div className="about-section">
              <h3>About This Car</h3>
              <p>{vehicle.description || "No description provided for this vehicle."}</p>
            </div>

            <div className="features-section">
              <h3>What's Included</h3>
              <div className="features-grid">
                {[
                  "Air Conditioning",
                  "Full Insurance",
                  "Music System",
                  "Free Delivery",
                ].map((f) => (
                  <div key={f} className="feature-tag">
                    <Check size={16} className="feature-check" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Map Section */}
            {vehicle.lat && vehicle.lng && (
              <div className="location-map-section">
                <h3>
                  <Navigation size={18} className="feature-check" />
                  Pickup Location
                </h3>
                <p className="location-address">
                  <MapPin size={14} /> {vehicle.location}
                </p>
                <div className="detail-map-wrapper">
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={detailMapContainerStyle}
                      center={{ lat: vehicle.lat, lng: vehicle.lng }}
                      zoom={15}
                      options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        zoomControl: true,
                        styles: [
                          { featureType: "poi", stylers: [{ visibility: "off" }] },
                          { featureType: "transit", stylers: [{ visibility: "off" }] },
                        ],
                      }}
                    >
                      <Marker
                        position={{ lat: vehicle.lat, lng: vehicle.lng }}
                        title={`${vehicle.brand} ${vehicle.model} - Pickup Location`}
                        icon={{
                          path: "M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z",
                          fillColor: "#f97316",
                          fillOpacity: 1,
                          strokeColor: "#ffffff",
                          strokeWeight: 2,
                          scale: 2,
                          anchor: { x: 12, y: 24 },
                        }}
                      />
                    </GoogleMap>
                  ) : (
                    <div className="detail-map-loading">
                      <div className="spinner" />
                      <span>Loading Map...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Sidebar */}
          <aside className="bid-panel">
            <div className="bid-card">
              <div className="price-row">
                <span className="price">
                  LKR {vehicle.pricePerDay?.toLocaleString()}
                </span>
                <span className="per-day">/ day</span>
              </div>
              
              <div className="owner-row">
                <div className="owner-avatar">{vehicle.owner?.name?.[0] || "U"}</div>
                <div>
                  <strong>{vehicle.owner?.name || "Vehicle Owner"}</strong>
                  <p>Verified Partner</p>
                </div>
              </div>
              <hr className="divider" />

              {sent ? (
                <div className="sent-msg">
                  <CheckCircle2 size={44} className="sent-check-icon" />
                  <h3>Request Sent!</h3>
                  <p>The owner has received your booking inquiry and will contact you soon.</p>
                </div>
              ) : (
                <div className="booking-form">
                  <h3>Check Availability</h3>
                  <p>Select your required dates below. Gray dates are already booked.</p>
                  
                  <div className="calendar-wrapper">
                    <DatePicker
                      selected={startDate}
                      onChange={(update) => setDateRange(update)}
                      startDate={startDate}
                      endDate={endDate}
                      selectsRange
                      inline
                      minDate={new Date()}
                      excludeDates={bookedDates}
                    />
                  </div>

                  <button
                    className="btn-primary"
                    onClick={handleContact}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      marginTop: "1rem"
                    }}
                  >
                    <MessageSquare size={18} />
                    <span>Contact Owner</span>
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .detail-wrap {
          padding: 2rem 0 6rem;          
          background: #f8fafc;
          transition: background-color 0.3s ease;
        }
        .breadcrumb {
          margin-bottom: 1.5rem;
        }
        .breadcrumb a {
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          transition: color 0.2s;
        }
        .breadcrumb a:hover { color: #0f172a; }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2.5rem;
          align-items: start;
        }
        .main-image-wrap {
          position: relative;
          margin-bottom: 2rem;
        }
        .main-image {
          width: 100%;
          height: 420px;
          object-fit: cover;
          border-radius: 1.25rem;
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
        .image-badge {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(10px);
          color: white;
          padding: 0.4rem 0.9rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .vehicle-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }
        .vehicle-year-chip {
          display: inline-block;
          background: rgba(124,58,237,0.15);
          color: var(--primary-light);
          padding: 0.25rem 0.75rem;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .vehicle-header h1 { font-size: 2rem; }
        .vehicle-rating {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          text-align: center;
          flex-shrink: 0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .vehicle-rating span { font-weight: 800; font-size: 1.1rem; }
        .vehicle-rating small { color: var(--text-muted); font-size: 0.8rem; }
        .about-section, .features-section {
          margin-bottom: 2rem;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .about-section h3, .features-section h3 {
          margin-bottom: 0.75rem;
          font-size: 1.1rem;
        }
        .about-section p { line-height: 1.75; color: var(--text-muted); }
        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
          margin-top: 0.75rem;
        }
        .feature-tag {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .feature-check {
          color: var(--accent);
          flex-shrink: 0;
        }
        .sent-check-icon {
          color: var(--accent);
          margin-bottom: 0.5rem;
        }
        
        /* Bid Panel */
        .bid-panel { position: sticky; top: 88px; }
        .bid-card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          padding: 1.75rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
        .price-row {
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
          margin-bottom: 1.25rem;
        }
        .price {
          font-size: 2rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -1px;
        }
        .per-day { color: var(--text-muted); font-weight: 500; }
        .owner-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }
        .owner-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--grad-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.1rem;
          color: white;
          flex-shrink: 0;
        }
        .owner-row strong { display: block; color: #0f172a; font-size: 0.95rem; }
        .owner-row p { color: var(--text-muted); font-size: 0.8rem; margin: 0; }
        .divider { margin: 1.5rem 0; border: none; border-top: 1px solid var(--border); }
        
        /* Booking Form */
        .booking-form h3 { margin-bottom: 0.3rem; font-size: 1.1rem; }
        .booking-form > p { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.25rem; line-height: 1.5; }
        .booking-form { display: flex; flex-direction: column; }
        
        /* Custom react-datepicker styling for premium look */
        .calendar-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .react-datepicker {
          border: 1px solid var(--border) !important;
          border-radius: 12px !important;
          font-family: inherit !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
          padding: 0.5rem !important;
          width: 100%;
        }
        .react-datepicker__month-container {
          width: 100%;
        }
        .react-datepicker__header {
          background-color: transparent !important;
          border-bottom: 1px solid var(--border) !important;
          padding-top: 0.5rem !important;
        }
        .react-datepicker__current-month {
          font-weight: 700 !important;
          font-size: 1rem !important;
          color: #0f172a !important;
          margin-bottom: 0.5rem !important;
        }
        .react-datepicker__day-name {
          color: var(--text-muted) !important;
          font-weight: 600 !important;
          width: 2rem !important;
          line-height: 2rem !important;
          margin: 0.2rem !important;
        }
        .react-datepicker__day {
          width: 2rem !important;
          line-height: 2rem !important;
          margin: 0.2rem !important;
          border-radius: 6px !important;
          color: #0f172a !important;
          font-weight: 500 !important;
          transition: all 0.2s;
        }
        .react-datepicker__day:hover {
          background-color: var(--primary-soft) !important;
          color: var(--primary) !important;
        }
        .react-datepicker__day--selected, 
        .react-datepicker__day--in-range, 
        .react-datepicker__day--in-selecting-range {
          background-color: var(--primary) !important;
          color: white !important;
          font-weight: 700 !important;
        }
        .react-datepicker__day--in-selecting-range:not(.react-datepicker__day--in-range) {
          background-color: rgba(249, 115, 22, 0.4) !important;
        }
        /* Excluded / Booked Dates */
        .react-datepicker__day--excluded {
          background-color: #f1f5f9 !important;
          color: #cbd5e1 !important;
          text-decoration: line-through !important;
          cursor: not-allowed !important;
        }
        .react-datepicker__day--excluded:hover {
          background-color: #f1f5f9 !important;
          color: #cbd5e1 !important;
        }
        .react-datepicker__navigation {
          top: 0.8rem !important;
        }

        .sent-msg {
          text-align: center;
          padding: 1.5rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .sent-msg span { font-size: 2.5rem; }
        .sent-msg h3 { color: var(--accent); }
        .sent-msg p { color: var(--text-muted); font-size: 0.9rem; }

        /* Location Map Section */
        .location-map-section {
          margin-bottom: 2rem;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          animation: fadeInMap 0.5s ease both 0.2s;
        }
        .location-map-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }
        .location-address {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        .detail-map-wrapper {
          width: 100%;
          height: 280px;
          border-radius: 1rem;
          overflow: hidden;
          border: 1px solid rgba(249, 115, 22, 0.1);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }
        .detail-map-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 0.75rem;
          color: #6b7280;
          background: #f9fafb;
          border-radius: 1rem;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.05);
          border-top-color: #f97316;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInMap {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .detail-grid { grid-template-columns: 1fr; }
          .bid-panel { position: relative; top: auto; }
          .main-image { height: 280px; }
          .features-grid { grid-template-columns: 1fr; }
          .detail-map-wrapper { height: 220px; }
        }
      `}</style>
    </div>
  );
};

export default VehicleDetail;
