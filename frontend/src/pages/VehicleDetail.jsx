import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Check,
  CheckCircle2,
  MessageSquare,
  Navigation,
  Fuel,
  Users,
  Settings2,
  Phone,
  Gauge,
  Calendar,
  KeyRound,
  Building2,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "../config";
import { formatVehicleImageUrl, handleImageError } from "../utils/imageHelper";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useToast } from "../context/ToastContext";
import { useSiteConfig } from "../context/SiteConfigContext";
import { useCurrency } from "../context/CurrencyContext";
import { getStoredUser } from "../utils/session";
import ReviewSection from "../components/ReviewSection";
import VehicleCard, { kmAllowanceLabel } from "../components/VehicleCard";

const detailMapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem",
};

// Normalise a Sri Lankan phone number to the international digits wa.me expects
const toWhatsAppNumber = (phone) => {
  const digits = String(phone || "").replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return "94" + digits.slice(1);
  if (digits.length === 9) return "94" + digits;
  return digits;
};

const VehicleDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { config } = useSiteConfig();
  const { formatPrice, formatRawPrice, currency } = useCurrency();
  
  // Booking State
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  

  const [sent, setSent] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [bookedIntervals, setBookedIntervals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [similar, setSimilar] = useState([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const [vehicleRes, reviewsRes, rentalsRes] = await Promise.all([
          axios.get(`${API_URL}/api/vehicles/${id}`),
          axios.get(`${API_URL}/api/vehicles/${id}/reviews`),
          axios.get(`${API_URL}/api/rentals/vehicle/${id}`).catch(() => ({ data: [] })),
        ]);
        setVehicle(vehicleRes.data);
        setReviews(reviewsRes.data);
        setActiveImageIndex(0);
        // "You might also like": same type, live listings, excluding this one
        axios
          .get(`${API_URL}/api/vehicles`, { params: { vehicleType: vehicleRes.data.vehicleType } })
          .then((res) => {
            const others = (Array.isArray(res.data) ? res.data : []).filter((v) => v._id !== vehicleRes.data._id);
            setSimilar(others.slice(0, 4));
          })
          .catch(() => setSimilar([]));
        if (Array.isArray(rentalsRes.data)) {
          setBookedIntervals(
            rentalsRes.data.map((r) => ({
              start: new Date(r.pickupDate),
              end: new Date(r.returnDate),
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching vehicle data:", err);
        // A 404 means the listing is gone; anything else is a connection problem
        if (err.response?.status !== 404) setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicleData();
  }, [id]);

  const handleReviewAdded = (newReview) => {
    setReviews([newReview, ...reviews]);
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "New";
  const numReviews = reviews.length;

  const handleContact = async (e) => {
    e.preventDefault();
    if (bookingSubmitting) return;

    if (!startDate || !endDate) {
      toast.warning("Please select your required booking dates on the calendar first.", "Dates Required");
      return;
    }

    if (belowMinDays) {
      toast.warning(`This vehicle is rented for at least ${minDays} days. Please choose a longer period.`, "Minimum Rental");
      return;
    }

    // Company WhatsApp Concierge line (or host fallback)
    const companySupportPhone =
      config?.global?.whatsAppSupport?.phoneNumber ||
      "+94702434288";
    const targetWaNumber = toWhatsAppNumber(companySupportPhone) || waNumber;

    if (!targetWaNumber) {
      toast.error(
        "WhatsApp booking is currently unavailable. Please contact support.",
        "Contact Unavailable"
      );
      return;
    }

    setBookingSubmitting(true);
    const rentModeText = { "self-drive": "Self-drive", "with-driver": "With driver", both: "Self-drive or with driver" }[vehicle?.rentMode || "self-drive"];
    const dateStr = `${startDate.toLocaleDateString("en-GB")} to ${endDate.toLocaleDateString("en-GB")}`;
    let finalWaUrl = `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(
      `Hello! I would like to rent the ${vehicle.brand} ${vehicle.model} (${vehicle.year}) listed on Yamu Car Rentals (${rentModeText.toLowerCase()}) for ${dateStr}.\n${window.location.href}`
    )}`;

    const viewer = getStoredUser();
    const token = localStorage.getItem("token");

    // 1. Create official Booking record in backend with secure dispatch token
    try {
      const bookingRes = await axios.post(
        `${API_URL}/api/bookings`,
        {
          vehicleId: vehicle._id,
          startDate,
          endDate,
          customerName: viewer?.name || "Customer",
          customerPhone: viewer?.phone || "",
          rentMode: vehicle?.rentMode || "self-drive",
          clientBaseUrl: window.location.origin,
        },
        token ? { headers: { "x-auth-token": token } } : {}
      );

      if (bookingRes.data?.whatsappMessage) {
        finalWaUrl = `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(bookingRes.data.whatsappMessage)}`;
      }
    } catch (bookingErr) {
      console.warn("Could not record booking ahead of WhatsApp:", bookingErr?.response?.data || bookingErr.message);
    } finally {
      setBookingSubmitting(false);
    }

    // 2. Also log inquiry in bids for backward compatibility
    if (token) {
      axios
        .post(
          `${API_URL}/api/bids`,
          {
            vehicleId: vehicle._id,
            offerPrice: vehicle.pricePerDay,
            message: `Booking inquiry for ${dateStr}`,
          },
          { headers: { "x-auth-token": token } }
        )
        .catch((err) => console.warn("Inquiry logged:", err.message));
    }

    setSent(true);
    // Open WhatsApp in new tab, or fallback to window.location.href if popups blocked
    try {
      const waWin = window.open(finalWaUrl, "_blank", "noopener,noreferrer");
      if (!waWin || waWin.closed || typeof waWin.closed === "undefined") {
        window.location.href = finalWaUrl;
      }
    } catch {
      window.location.href = finalWaUrl;
    }
  };

  if (loading) {
    return (
      <div className="detail-wrap">
        <div className="container" style={{ textAlign: "center", padding: "8rem 0" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p style={{ color: "#6b7280" }}>Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="detail-wrap">
        <div className="container" style={{ textAlign: "center", padding: "8rem 0" }}>
          <h2 style={{ color: "#111827" }}>{loadFailed ? "Couldn't load this vehicle" : "Vehicle not found"}</h2>
          {loadFailed && (
            <p style={{ color: "#6b7280", marginBottom: 16 }}>
              Please check your internet connection.{" "}
              <button type="button" onClick={() => window.location.reload()} style={{ background: "none", border: "none", color: "#f97316", fontWeight: 700, cursor: "pointer", padding: 0 }}>
                Try again
              </button>
            </p>
          )}
          <Link to="/vehicles" style={{ color: "#f97316", fontWeight: 700 }}>← Back to Listings</Link>
        </div>
      </div>
    );
  }

  // Host's own number first (company, then personal owner), else the site's support line
  const hostPhone =
    vehicle.company?.phone ||
    vehicle.owner?.phone ||
    config?.global?.whatsAppSupport?.phoneNumber ||
    "+94702434288";
  const waNumber = toWhatsAppNumber(hostPhone);
  const directPhone = vehicle.company?.phone || vehicle.owner?.phone || "";
  const viewer = getStoredUser();
  const isOwnListing = Boolean(viewer && vehicle.owner?._id && (viewer.id || viewer._id) === vehicle.owner._id);
  const isUnavailable = ["hidden", "flagged", "rented", "pending", "rejected"].includes(vehicle.status);
  const rentModeLabel = { "self-drive": "Self-drive", "with-driver": "With driver", both: "Self-drive or with driver" }[vehicle.rentMode || "self-drive"];
  const kmPerDay = vehicle.kmPerDay === 0 ? 0 : vehicle.kmPerDay || 100;
  const minDays = vehicle.minRentalDays || 1;
  const hostSince = (vehicle.company?.createdAt || vehicle.owner?.createdAt)
    ? new Date(vehicle.company?.createdAt || vehicle.owner?.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : null;

  const rawImages = Array.isArray(vehicle.images) && vehicle.images.length > 0
    ? vehicle.images.filter(img => typeof img === "string" && img.trim() !== "")
    : [];

  const images = rawImages.length > 0
    ? rawImages.map(img => formatVehicleImageUrl(img, vehicle.vehicleType))
    : [formatVehicleImageUrl(null, vehicle.vehicleType)];

  const currentImage = images[activeImageIndex] || images[0];

  const diffTime = startDate && endDate ? Math.abs(new Date(endDate).setHours(0,0,0,0) - new Date(startDate).setHours(0,0,0,0)) : 0;
  const tripDays = startDate && endDate ? Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24))) : 0;
  const baseCost = tripDays * (vehicle.pricePerDay || 0);
  const freeKm = kmPerDay === 0 ? null : tripDays * kmPerDay;
  const belowMinDays = tripDays > 0 && tripDays < minDays;
  const extraKmRate = vehicle.pricePerKmAfter100km || 0;

  return (
    <div className="detail-wrap">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/vehicles">← Back to Listings</Link>
          {vehicle.company && (
            <span style={{ marginLeft: 8, color: "#94a3b8" }}>
              / <Link to={`/companies/${vehicle.company._id}`} style={{ color: "#ea580c" }}>{vehicle.company.companyName}</Link>
            </span>
          )}
        </div>

        <div className="detail-grid">
          {/* Left: Info */}
          <div className="detail-main">
            <div className="main-image-wrap">
              <img
                src={currentImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="main-image"
                onError={handleImageError}
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
              {images.length > 1 && (
                <>
                  <span className="photo-counter">{activeImageIndex + 1} of {images.length}</span>
                  <button type="button" className="photo-nav photo-prev" aria-label="Previous photo"
                    onClick={() => setActiveImageIndex((i) => (i - 1 + images.length) % images.length)}>‹</button>
                  <button type="button" className="photo-nav photo-next" aria-label="Next photo"
                    onClick={() => setActiveImageIndex((i) => (i + 1) % images.length)}>›</button>
                </>
              )}
            </div>

            {/* Multiple Photos Thumbnails Gallery */}
            {images.length > 1 && (
              <div className="thumbnails-gallery" style={{ display: "flex", gap: 10, marginBottom: "1.75rem", overflowX: "auto", paddingBottom: 4 }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: 72,
                      height: 52,
                      borderRadius: 10,
                      overflow: "hidden",
                      border: activeImageIndex === idx ? "2.5px solid #ea580c" : "1.5px solid #e2e8f0",
                      padding: 0,
                      cursor: "pointer",
                      flexShrink: 0,
                      background: "#fff",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="vehicle-header">
              <div>
                <span className="vehicle-year-chip">{vehicle.year}</span>
                <span className="vehicle-year-chip" style={{ marginLeft: 6, background: "rgba(249,115,22,0.12)", color: "#ea580c" }}>
                  {rentModeLabel}
                </span>
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
                  {avgRating}
                </span>
                <small>{numReviews} reviews</small>
              </div>
            </div>

            {/* Key specs */}
            <div className="specs-grid">
              {[
                { icon: KeyRound, label: "RENT MODE", value: rentModeLabel },
                { icon: Calendar, label: "YEAR", value: vehicle.year || "—" },
                { icon: Settings2, label: "GEARBOX", value: vehicle.transmission || "Ask owner" },
                { icon: Fuel, label: "FUEL", value: vehicle.fuelType || "Ask owner" },
                { icon: Users, label: "SEATS", value: vehicle.seats ? `${vehicle.seats} seats` : "Ask owner" },
                { icon: Gauge, label: "MILEAGE", value: kmAllowanceLabel(vehicle.kmPerDay) },
                {
                  icon: Gauge,
                  label: "EXTRA KM",
                  value: Number(vehicle.pricePerKmAfter100km) > 0 ? `${formatPrice(vehicle.pricePerKmAfter100km)}/km` : "No extra charge",
                },
                { icon: Calendar, label: "MINIMUM", value: `${minDays} day${minDays > 1 ? "s" : ""}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="spec-item">
                  <Icon size={18} color="#ea580c" />
                  <div>
                    <div className="spec-label">{label}</div>
                    <div className="spec-value">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="about-section">
              <h3>About This Vehicle</h3>
              <p>{vehicle.description || "The owner hasn't added a description yet. Message them on WhatsApp for more details."}</p>
            </div>

            {/* Location Map Section */}
            {vehicle.lat && vehicle.lng && (
              <div className="location-map-section">
                <h3>
                  <Navigation size={18} className="feature-check" />
                  Pickup & Return Location
                </h3>
                <p className="location-address">
                  <MapPin size={14} /> {vehicle.location}
                </p>
                <div className="detail-map-wrapper">
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={detailMapContainerStyle}
                      center={{ lat: Number(vehicle.lat), lng: Number(vehicle.lng) }}
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
                      <MarkerF
                        position={{ lat: Number(vehicle.lat), lng: Number(vehicle.lng) }}
                        title={`${vehicle.brand} ${vehicle.model} - Pickup Location`}
                      />
                    </GoogleMap>
                  ) : (
                    <div className="map-loading-placeholder">
                      <Navigation size={24} color="#9ca3af" />
                      <p>Loading Map...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <ReviewSection 
              vehicleId={vehicle._id} 
              reviews={reviews} 
              onReviewAdded={handleReviewAdded} 
            />
          </div>

          {/* Right: Booking Sidebar */}
          <aside className="bid-panel">
            <div className="bid-card">
              <div className="price-row">
                <span className="price">
                  {formatPrice(vehicle.pricePerDay || 0)}
                </span>
                <span className="per-day">/ day</span>
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#ea580c",
                  background: "#fff7ed",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  display: "inline-block",
                  marginTop: "6px",
                  marginBottom: "12px",
                  border: "1px solid #ffedd5",
                }}
              >
                {kmAllowanceLabel(vehicle.kmPerDay)}
                {Number(vehicle.pricePerKmAfter100km) > 0 && <> · +{formatPrice(vehicle.pricePerKmAfter100km)}/extra km</>}
                {minDays > 1 && <> · min. {minDays} days</>}
              </div>
              
              <div className="owner-row">
                <div className="owner-avatar">{vehicle.company?.companyName?.[0] || vehicle.owner?.name?.[0] || "Y"}</div>
                <div>
                  <strong>{vehicle.company?.companyName || vehicle.owner?.name || "Owner"}</strong>
                  <p>
                    {vehicle.company ? "Rent-a-car company" : "Individual owner"}
                    {hostSince && ` · on Yamu since ${hostSince}`}
                  </p>
                </div>
              </div>
              <hr className="divider" />

              {isUnavailable && !isOwnListing ? (
                <div className="sent-msg">
                  <h3>{vehicle.status === "rented" ? "Currently rented" : vehicle.status === "pending" ? "Waiting for approval" : "Currently unavailable"}</h3>
                  <p>
                    {vehicle.status === "rented"
                      ? "This vehicle is out on a rental right now. Browse similar vehicles instead."
                      : "This vehicle is not taking bookings right now. Browse similar vehicles instead."}
                  </p>
                  <Link to="/vehicles" className="btn-primary" style={{ marginTop: 12, padding: "8px 16px", fontSize: "0.88rem", display: "inline-block" }}>
                    Browse vehicles
                  </Link>
                </div>
              ) : sent ? (
                <div className="sent-msg">
                  <CheckCircle2 size={44} className="sent-check-icon" />
                  <h3>Booking Chat Launched!</h3>
                  <p>WhatsApp opened with your dates. The owner will reply there to confirm availability.</p>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ marginTop: 12, padding: "8px 16px", fontSize: "0.88rem" }}
                    onClick={() => setSent(false)}
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <div className="booking-form">
                  <h3>Check Availability</h3>
                  <p>Select your required dates, then message the host to confirm availability.</p>
                  
                  <div className="calendar-wrapper">
                    <DatePicker
                      selected={startDate}
                      onChange={(update) => setDateRange(update)}
                      startDate={startDate}
                      endDate={endDate}
                      selectsRange
                      inline
                      minDate={new Date()}
                      excludeDateIntervals={bookedIntervals}
                    />
                  </div>

                  {belowMinDays && (
                    <div className="min-days-warning">
                      This vehicle is rented for at least {minDays} days. Please pick a longer period.
                    </div>
                  )}

                  {tripDays > 0 && (
                    <div className="trip-pricing-card">
                      <div className="trip-pricing-header">
                        <span className="trip-duration-badge">
                          <Calendar size={13} /> {tripDays} Day{tripDays > 1 ? "s" : ""} Trip
                        </span>
                        <span className="trip-total-price">
                          {formatPrice(baseCost)}
                        </span>
                      </div>
                      <div className="trip-pricing-breakdown">
                        <div className="trip-pricing-row">
                          <span>Base rate ({tripDays} × {formatPrice(vehicle?.pricePerDay || 0)})</span>
                          <span>{formatPrice(baseCost)}</span>
                        </div>
                        <div className="trip-pricing-row">
                          <span>Included mileage</span>
                          <span className="trip-free-tag">{freeKm === null ? "Unlimited km" : `${freeKm.toLocaleString()} km included`}</span>
                        </div>
                        {extraKmRate > 0 && (
                          <div className="trip-pricing-row">
                            <span>Excess mileage rate</span>
                            <span>+{formatPrice(extraKmRate)}/km</span>
                          </div>
                        )}
                        <div className="trip-pricing-divider" />
                        <div className="trip-pricing-row trip-pricing-total">
                          <strong>Total Trip Estimate</strong>
                          <strong>{formatPrice(baseCost)}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleContact}
                    disabled={bookingSubmitting}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      marginTop: "1rem",
                      opacity: bookingSubmitting ? 0.7 : 1,
                      cursor: bookingSubmitting ? "wait" : "pointer"
                    }}
                  >
                    <MessageSquare size={18} />
                    <span>{bookingSubmitting ? "Connecting..." : "Contact via WhatsApp"}</span>
                  </button>

                  {directPhone && (
                    <a
                      href={`tel:+${toWhatsAppNumber(directPhone)}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        marginTop: 10,
                        color: "#64748b",
                        fontSize: "0.85rem",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      <Phone size={14} /> Call Host Directly: {directPhone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="similar-section">
            <div className="similar-head">
              <div>
                <span className="y-badge">More to explore</span>
                <h2>You might also like</h2>
              </div>
              <Link to={`/vehicles?type=${vehicle.vehicleType}`} className="y-btn y-btn-soft y-btn-sm">See all</Link>
            </div>
            <div className="similar-grid">
              {similar.map((v, i) => (
                <VehicleCard key={v._id} vehicle={v} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`
        .detail-wrap {
          padding: 120px 0 6rem;          
          background: #f8fafc;
          transition: background-color 0.3s ease;
        }
        .specs-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px;
          margin-bottom: 2rem; background: #fff; padding: 18px; border-radius: 14px; border: 1px solid #e2e8f0;
        }
        .spec-item { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .spec-label { font-size: 0.7rem; color: #94a3b8; font-weight: 800; letter-spacing: 0.04em; }
        .spec-value { font-size: 0.9rem; font-weight: 700; color: #0f172a; }
        .photo-counter {
          position: absolute; right: 1rem; bottom: 1rem; padding: 4px 10px; border-radius: 999px;
          background: rgba(0,0,0,0.65); color: #fff; font-size: 0.8rem; font-weight: 700;
        }
        .photo-nav {
          position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.9); color: #0f172a; font-size: 1.5rem; line-height: 1; display: grid; place-items: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer;
        }
        .photo-prev { left: 1rem; }
        .photo-next { right: 1rem; }
        .min-days-warning {
          margin-top: 0.75rem; padding: 0.6rem 0.8rem; border-radius: 10px;
          background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; font-size: 0.85rem; font-weight: 600;
        }
        .similar-section { margin-top: 4rem; }
        .similar-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; margin-bottom: 1.5rem; }
        .similar-head h2 { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; margin-top: 0.5rem; }
        .similar-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
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

        /* Dynamic Trip Pricing Card */
        .trip-pricing-card {
          margin-top: 1rem;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 0.85rem;
          padding: 1rem;
          animation: fadeIn 0.25s ease;
        }

        .trip-pricing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px dashed #fdba74;
        }

        .trip-duration-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #ea580c;
          color: #ffffff;
          padding: 0.25rem 0.65rem;
          border-radius: 100px;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .trip-total-price {
          font-size: 1.15rem;
          font-weight: 800;
          color: #c2410c;
        }

        .trip-pricing-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .trip-pricing-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.82rem;
          color: #475569;
        }

        .trip-free-tag {
          color: #15803d;
          font-weight: 700;
          background: #dcfce7;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.75rem;
        }

        .trip-pricing-divider {
          height: 1px;
          background: #fed7aa;
          margin: 0.35rem 0;
        }

        .trip-pricing-total {
          font-size: 0.92rem;
          color: #0f172a;
          padding-top: 0.2rem;
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
          .detail-grid { grid-template-columns: minmax(0, 1fr); }
          .detail-grid > * { min-width: 0; }
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
