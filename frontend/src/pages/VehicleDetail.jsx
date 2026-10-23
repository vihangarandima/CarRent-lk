import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Star,
  CheckCircle2,
  MessageSquare,
  Fuel,
  Users,
  Settings2,
  Gauge,
  Calendar,
  AlertTriangle,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  X,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "../config";
import { formatVehicleImageUrl, handleImageError } from "../utils/imageHelper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useToast } from "../context/ToastContext";
import { useSiteConfig } from "../context/SiteConfigContext";
import { useCurrency } from "../context/CurrencyContext";
import { getStoredUser } from "../utils/session";
import VehicleCard, { kmAllowanceLabel } from "../components/VehicleCard";
import BookingAuthModal from "../components/BookingAuthModal";
import { needsProfileCompletion } from "../utils/profile";
import { formatFuel, formatGearbox } from "../utils/vehicleText";
import { formatPublicLocation } from "../utils/locationHelper";

// Normalise a Sri Lankan phone number to the international digits wa.me expects
const toWhatsAppNumber = (phone) => {
  const digits = String(phone || "").replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return "94" + digits.slice(1);
  if (digits.length === 9) return "94" + digits;
  return digits;
};

// Yamu's customer hotline, shown under the booking button and in the confirmation popup
const YAMU_HOTLINE_DISPLAY = "070 243 4288";
const YAMU_HOTLINE_TEL = "+94702434288";

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { config } = useSiteConfig();
  const { formatPrice } = useCurrency();
  
  // Booking State - initialized from URL parameters if redirected back from sign in
  const [dateRange, setDateRange] = useState(() => {
    try {
      const s = searchParams.get("startDate");
      const e = searchParams.get("endDate");
      const sDate = s ? new Date(s) : null;
      const eDate = e ? new Date(e) : null;
      return [
        sDate && !isNaN(sDate.getTime()) ? sDate : null,
        eDate && !isNaN(eDate.getTime()) ? eDate : null,
      ];
    } catch {
      return [null, null];
    }
  });
  const [startDate, endDate] = dateRange;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  

  const [sent, setSent] = useState(false);
  // "Booking request sent" popup: { ref, dates, waUrl, recorded }
  const [bookingConfirm, setBookingConfirm] = useState(null);
  const [customerMessage, setCustomerMessage] = useState(() => searchParams.get("message") || "");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showNote, setShowNote] = useState(() => Boolean(searchParams.get("message")));
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [bookedIntervals, setBookedIntervals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [similar, setSimilar] = useState([]);

  // Helper: check if a calendar day falls within any active booked interval
  const isDateBooked = (date) => {
    if (!date || !bookedIntervals || bookedIntervals.length === 0) return false;
    const d = new Date(date).setHours(0, 0, 0, 0);
    return bookedIntervals.some((interval) => {
      const s = new Date(interval.start).setHours(0, 0, 0, 0);
      const e = new Date(interval.end).setHours(0, 0, 0, 0);
      return d >= s && d <= e;
    });
  };

  // Helper: detect if currently selected dates collide with existing bookings (must be top-level hook)
  const bookingConflict = useMemo(() => {
    if (!startDate || !bookedIntervals || bookedIntervals.length === 0) return null;
    const s = new Date(startDate).setHours(0, 0, 0, 0);
    const e = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : s;

    for (const interval of bookedIntervals) {
      const iStart = new Date(interval.start).setHours(0, 0, 0, 0);
      const iEnd = new Date(interval.end).setHours(0, 0, 0, 0);
      if (s <= iEnd && e >= iStart) {
        return {
          start: new Date(interval.start),
          end: new Date(interval.end),
        };
      }
    }
    return null;
  }, [startDate, endDate, bookedIntervals]);

  const isBookedConflict = Boolean(bookingConflict);

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
              start: new Date(r.pickupDate || r.startDate),
              end: new Date(r.returnDate || r.endDate),
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

  // Sync URL search params with date selection & message if returning from sign in
  useEffect(() => {
    const s = searchParams.get("startDate");
    const e = searchParams.get("endDate");
    if (s || e) {
      const sDate = s ? new Date(s) : null;
      const eDate = e ? new Date(e) : null;
      if ((sDate && !isNaN(sDate.getTime())) || (eDate && !isNaN(eDate.getTime()))) {
        setDateRange([
          sDate && !isNaN(sDate.getTime()) ? sDate : null,
          eDate && !isNaN(eDate.getTime()) ? eDate : null,
        ]);
      }
    }
    const msg = searchParams.get("message");
    if (msg) {
      setCustomerMessage(msg);
    }
  }, [searchParams]);

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "New";
  const numReviews = reviews.length;

  const redirectToLogin = (warningMsg = "Please sign in to continue with your booking.") => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.set("startDate", startDate.toISOString());
    if (endDate) queryParams.set("endDate", endDate.toISOString());
    if (customerMessage.trim()) queryParams.set("message", customerMessage.trim());
    const searchStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const returnUrl = `/vehicle/${id}${searchStr}`;

    toast.info(warningMsg, "Sign In Required");
    navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
  };

  const handleContact = (e) => {
    if (e) e.preventDefault();
    if (bookingSubmitting) return;

    if (isBookedConflict) {
      toast.error(
        `This vehicle is already booked from ${bookingConflict.start.toLocaleDateString("en-GB")} to ${bookingConflict.end.toLocaleDateString("en-GB")}. Please select different dates.`,
        "Vehicle Unavailable"
      );
      return;
    }

    if (belowMinDays) {
      toast.warning(`This vehicle is rented for at least ${minDays} days. Please choose a longer period.`, "Minimum Rental");
      return;
    }

    if (!startDate) {
      toast.warning("Please pick your pickup and return dates first.", "Choose Dates");
      return;
    }

    if (!termsAccepted) {
      toast.warning("Please accept the rental terms to continue.", "Rental Terms");
      return;
    }

    const viewer = getStoredUser();
    const token = localStorage.getItem("token");

    // 1. If not logged in, redirect directly to the sign in page
    if (!token || !viewer) {
      redirectToLogin("Please sign in to chat via WhatsApp and book this vehicle.");
      return;
    }

    // 2. Collect any missing details first (phone, address, NIC — e.g. Google sign-ups)
    const phoneDigits = String(viewer.phone || "").replace(/\D/g, "");
    if (phoneDigits.length < 9 || needsProfileCompletion(viewer)) {
      setAuthModalMode("phone");
      setAuthModalOpen(true);
      return;
    }

    // 3. User is logged in and has verified phone: proceed with booking
    executeBooking(viewer.phone);
  };

  const executeBooking = async (customerPhone) => {
    const viewer = getStoredUser();
    const token = localStorage.getItem("token");

    // Strictly enforce authentication before proceeding with booking
    if (!token || !viewer) {
      redirectToLogin("Please sign in to chat via WhatsApp and book this vehicle.");
      return;
    }

    const phoneToUse = customerPhone || viewer.phone;
    if (!phoneToUse || String(phoneToUse).replace(/\D/g, "").length < 9) {
      setAuthModalMode("phone");
      setAuthModalOpen(true);
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

    const effectiveEnd = endDate || startDate;
    const rentModeText = { "self-drive": "Self-drive", "with-driver": "With driver", both: "Self-drive or with driver" }[vehicle?.rentMode || "self-drive"];
    const isSingleDay = startDate && (!endDate || startDate.getTime() === endDate.getTime());
    const dateStr = startDate
      ? isSingleDay
        ? `${startDate.toLocaleDateString("en-GB")} (1 Day)`
        : `${startDate.toLocaleDateString("en-GB")} to ${effectiveEnd.toLocaleDateString("en-GB")} (${tripDays} Days)`
      : "Flexible / To be confirmed";
    let finalWaUrl = `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(
      `Hello! I would like to rent the ${vehicle.brand} ${vehicle.model} (${vehicle.year}) listed on Yamu Car Rentals (${rentModeText.toLowerCase()}) for ${dateStr}.\n${window.location.href}`
    )}`;

    // 1. Create official Booking record in backend (this also emails the Yamu team)
    let bookingRef = "";
    let recorded = false;
    try {
      const bookingRes = await axios.post(
        `${API_URL}/api/bookings`,
        {
          vehicleId: vehicle._id,
          startDate: startDate ? startDate.toISOString() : null,
          endDate: effectiveEnd ? effectiveEnd.toISOString() : null,
          customerName: viewer.name || "Customer",
          customerPhone: phoneToUse,
          customerMessage: customerMessage.trim(),
          rentMode: vehicle?.rentMode || "self-drive",
          clientBaseUrl: window.location.origin,
        },
        {
          headers: {
            "x-auth-token": token,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (bookingRes.data?.whatsappMessage) {
        finalWaUrl = `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(bookingRes.data.whatsappMessage)}`;
      }
      bookingRef = bookingRes.data?.booking?.bookingNumber || "";
      recorded = Boolean(bookingRes.data?.success);
    } catch (bookingErr) {
      console.warn("Could not record booking ahead of WhatsApp:", bookingErr?.response?.data || bookingErr.message);
      if (bookingErr.response?.status === 401) {
        redirectToLogin("Please sign in to complete your booking reservation.");
        setBookingSubmitting(false);
        return;
      }
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
    setBookingConfirm({ ref: bookingRef, dates: dateStr, waUrl: finalWaUrl, recorded });
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

  // Renters always go through Yamu's WhatsApp line: listers' contact details stay private
  const waNumber = toWhatsAppNumber(config?.global?.whatsAppSupport?.phoneNumber || "+94702434288");
  const viewer = getStoredUser();
  const isOwnListing = Boolean(viewer && vehicle.owner?._id && (viewer.id || viewer._id) === vehicle.owner._id);
  const isUnavailable = ["hidden", "flagged", "pending", "rejected"].includes(vehicle.status);
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

  const effectiveEndDate = endDate || startDate;
  const startMidnight = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : 0;
  const endMidnight = effectiveEndDate ? new Date(effectiveEndDate).setHours(0, 0, 0, 0) : 0;
  const diffTime = startDate ? Math.abs(endMidnight - startMidnight) : 0;
  // Inclusive calendar days: same day = 1 day, next day = 2 days, 2 days later = 3 days
  const tripDays = startDate ? Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1 : 0;
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
                <span className="vehicle-year-chip" style={{ marginLeft: 6, background: "rgba(15,23,42,0.06)", color: "#475569" }}>
                  📍 {formatPublicLocation(vehicle.location)}
                </span>
                <h1>
                  {vehicle.brand} {vehicle.model}
                </h1>
              </div>
              {numReviews > 0 && (
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
              )}
            </div>

            {/* Key specs */}
            <div className="specs-grid">
              {[
                { icon: KeyRound, label: "RENT MODE", value: rentModeLabel },
                { icon: Calendar, label: "YEAR", value: vehicle.year || "—" },
                { icon: Settings2, label: "GEARBOX", value: formatGearbox(vehicle.transmission) || "Ask us" },
                { icon: Fuel, label: "FUEL", value: formatFuel(vehicle.fuelType) || "Ask us" },
                { icon: Users, label: "SEATS", value: vehicle.seats ? `${vehicle.seats} seats` : "Ask us" },
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
              <p>{vehicle.description || "No description yet. Ask us on WhatsApp and we'll get the details for you."}</p>
            </div>

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
                <div className="owner-avatar">Y</div>
                <div>
                  <strong>Verified Yamu Fleet Partner</strong>
                  <p>
                    Verified Fleet Partner
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
                  <h3>Booking request sent!</h3>
                  <p>The Yamu team has your request and will confirm availability with you on WhatsApp shortly.</p>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ marginTop: 12, padding: "8px 16px", fontSize: "0.88rem" }}
                    onClick={() => setSent(false)}
                  >
                    Book other dates
                  </button>
                  <a className="btn-call-us" href={`tel:${YAMU_HOTLINE_TEL}`}>
                    <Phone size={16} /> Call us on {YAMU_HOTLINE_DISPLAY}
                  </a>
                </div>
              ) : (
                <div className="booking-form">
                  <h3>Book this vehicle</h3>

                  {/* Step 1: dates */}
                  <div className="bk-step">
                    <div className="bk-step-head">
                      <span className={`bk-step-num ${startDate ? "done" : ""}`}>1</span> Pick your dates
                    </div>
                    <p className="bk-hint">
                      {!startDate
                        ? "Tap your pickup date."
                        : !endDate
                        ? "Now tap your return date (tap the same day again for 1 day)."
                        : "Great, your dates are set."}
                    </p>
                    <div className="calendar-wrapper">
                      <DatePicker
                        selected={startDate}
                        onChange={(update) => setDateRange(update)}
                        startDate={startDate}
                        endDate={endDate}
                        selectsRange
                        inline
                        minDate={new Date()}
                        filterDate={(date) => !isDateBooked(date)}
                        dayClassName={(date) => (isDateBooked(date) ? "booked-day-pill" : undefined)}
                        renderCustomHeader={({
                          date,
                          decreaseMonth,
                          increaseMonth,
                          prevMonthButtonDisabled,
                          nextMonthButtonDisabled,
                        }) => (
                          <div className="custom-calendar-header">
                            <button
                              type="button"
                              onClick={decreaseMonth}
                              disabled={prevMonthButtonDisabled}
                              className={`calendar-nav-btn ${prevMonthButtonDisabled ? "disabled" : ""}`}
                              aria-label="Previous Month"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <div className="calendar-header-title">
                              {date.toLocaleString("default", { month: "long", year: "numeric" })}
                            </div>
                            <button
                              type="button"
                              onClick={increaseMonth}
                              disabled={nextMonthButtonDisabled}
                              className={`calendar-nav-btn ${nextMonthButtonDisabled ? "disabled" : ""}`}
                              aria-label="Next Month"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        )}
                      />
                      <div className="calendar-legend">
                        <span className="legend-item">
                          <span className="legend-swatch swatch-booked" /> Booked
                        </span>
                        <span className="legend-item">
                          <span className="legend-swatch swatch-selected" /> Your dates
                        </span>
                      </div>
                    </div>

                    {startDate && (
                      <div className="bk-date-summary">
                        <div>
                          <span>Pickup</span>
                          <strong>{startDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</strong>
                        </div>
                        <div>
                          <span>Return</span>
                          <strong>
                            {(endDate || startDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                          </strong>
                        </div>
                        <button type="button" className="bk-clear" onClick={() => setDateRange([null, null])}>
                          Clear
                        </button>
                      </div>
                    )}

                    {belowMinDays && (
                      <div className="min-days-warning">
                        This vehicle is rented for at least {minDays} days. Please pick a longer period.
                      </div>
                    )}

                    {isBookedConflict && (
                      <div className="booked-conflict-box">
                        <AlertTriangle size={18} style={{ color: "#dc2626", flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <strong>Those dates include a booked day</strong>
                          <p>
                            It's booked{" "}
                            <b>{bookingConflict.start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</b> to{" "}
                            <b>{bookingConflict.end.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</b>. Please pick other dates.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: price */}
                  <div className="bk-step">
                    <div className="bk-step-head">
                      <span className={`bk-step-num ${tripDays > 0 && !isBookedConflict ? "done" : ""}`}>2</span> Your trip
                    </div>
                    {tripDays > 0 && !isBookedConflict ? (
                      <>
                        <div className="bk-trip-total">
                          <span>
                            {tripDays} day{tripDays > 1 ? "s" : ""} × {formatPrice(vehicle?.pricePerDay || 0)}
                          </span>
                          <strong>{formatPrice(baseCost)}</strong>
                        </div>
                        <p className="bk-trip-note">
                          {freeKm === null ? "Unlimited km" : `${freeKm.toLocaleString()} km included`}
                          {extraKmRate > 0 && ` · +${formatPrice(extraKmRate)} per extra km`}
                        </p>
                      </>
                    ) : (
                      <p className="bk-hint">Pick your dates to see the total.</p>
                    )}
                    {showNote ? (
                      <textarea
                        id="booking-customer-message"
                        className="bk-note-input"
                        rows={2}
                        value={customerMessage}
                        onChange={(e) => setCustomerMessage(e.target.value)}
                        placeholder="e.g. flight pickup time, baby seat..."
                        aria-label="Note for the Yamu team"
                      />
                    ) : (
                      <button type="button" className="bk-link" onClick={() => setShowNote(true)}>
                        + Add a note (optional)
                      </button>
                    )}
                  </div>

                  {/* Step 3: terms */}
                  <div className="bk-step">
                    <div className="bk-step-head">
                      <span className={`bk-step-num ${termsAccepted ? "done" : ""}`}>3</span> Accept the rental terms
                    </div>
                    <label className="bk-terms-check">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                      />
                      <span>
                        I agree to the rental terms below and Yamu's{" "}
                        <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</Link>.
                      </span>
                    </label>
                    <button type="button" className="bk-link" onClick={() => setShowTerms((v) => !v)} aria-expanded={showTerms}>
                      {showTerms ? "Hide rental terms" : "View rental terms"}
                    </button>
                    {showTerms && (
                      <ul className="bk-terms-list">
                        <li>🪪 Valid driving licence (international permit for visitors) and NIC or passport at pickup.</li>
                        <li>🛡️ A refundable security deposit is paid at pickup and returned after a safe return.</li>
                        <li>⛽ Return the vehicle with the same fuel level.</li>
                        <li>
                          🛣️ {kmAllowanceLabel(vehicle?.kmPerDay)}
                          {extraKmRate > 0 ? `; extra km at ${formatPrice(extraKmRate)}/km` : ""}.
                        </li>
                      </ul>
                    )}
                  </div>

                  {(() => {
                    const missing = !startDate
                      ? "Pick your dates to continue."
                      : isBookedConflict
                      ? "Choose dates that aren't booked."
                      : belowMinDays
                      ? `Pick at least ${minDays} days.`
                      : !termsAccepted
                      ? "Tick the box to accept the rental terms."
                      : "";
                    return (
                      <>
                        <button
                          type="button"
                          className="btn-primary bk-book-btn"
                          onClick={handleContact}
                          disabled={Boolean(missing) || bookingSubmitting}
                        >
                          <CheckCircle2 size={18} />
                          <span>{bookingSubmitting ? "Sending request..." : "Confirm & Book"}</span>
                        </button>
                        {missing ? (
                          <p className="bk-missing">{missing}</p>
                        ) : (
                          <p className="book-note">
                            <Mail size={14} />
                            <span>Your request goes to the Yamu team by email, then you confirm the details with us on WhatsApp.</span>
                          </p>
                        )}
                      </>
                    );
                  })()}

                  <a className="btn-call-us" href={`tel:${YAMU_HOTLINE_TEL}`}>
                    <Phone size={16} /> Questions? Call us on {YAMU_HOTLINE_DISPLAY}
                  </a>
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
        .about-section {
          margin-bottom: 2rem;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .about-section h3 {
          margin-bottom: 0.75rem;
          font-size: 1.1rem;
        }
        .about-section p { line-height: 1.75; color: var(--text-muted); }
        .sent-check-icon {
          color: var(--accent);
          margin-bottom: 0.5rem;
        }
        
        /* Bid Panel - Sticky sidebar that moves down with the user */
        .bid-panel {
          position: -webkit-sticky;
          position: sticky;
          top: 96px;
          align-self: start;
          height: fit-content;
          max-height: calc(100vh - 110px);
          overflow-y: auto;
          overflow-x: hidden;
          padding: 4px;
          margin: -4px;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
          z-index: 20;
        }
        .bid-panel::-webkit-scrollbar {
          width: 5px;
        }
        .bid-panel::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }
        .bid-panel::-webkit-scrollbar-track {
          background: transparent;
        }
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
        
        /* Custom react-datepicker styling for premium symmetrical alignment */
        .calendar-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }
        .react-datepicker {
          display: block !important;
          border: 1px solid var(--border) !important;
          border-radius: 16px !important;
          font-family: inherit !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06) !important;
          padding: 1rem 0.75rem 0.85rem !important;
          width: 100% !important;
          box-sizing: border-box !important;
          background: #ffffff !important;
          position: relative !important;
        }
        .react-datepicker__month-container {
          width: 100% !important;
          float: none !important;
        }
        .react-datepicker__header {
          background-color: transparent !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 2px 0 0.5rem !important;
          margin: 0 !important;
          position: relative !important;
        }
        .react-datepicker__current-month {
          display: none !important;
        }
        .react-datepicker__navigation {
          display: none !important;
        }
        .custom-calendar-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 4px 6px 10px !important;
          background: #ffffff !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .calendar-header-title {
          font-weight: 700 !important;
          font-size: 0.98rem !important;
          color: #0f172a !important;
          text-align: center !important;
          letter-spacing: -0.01em !important;
        }
        .calendar-nav-btn {
          width: 32px !important;
          height: 32px !important;
          border-radius: 8px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          color: #334155 !important;
          cursor: pointer !important;
          transition: all 0.15s ease !important;
          padding: 0 !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
        }
        .calendar-nav-btn:hover:not(:disabled):not(.disabled) {
          background: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
          color: #0f172a !important;
          transform: translateY(-1px);
        }
        .calendar-nav-btn:disabled,
        .calendar-nav-btn.disabled {
          opacity: 0.35 !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
          background: #f8fafc !important;
          border-color: #f1f5f9 !important;
          color: #94a3b8 !important;
        }
        .react-datepicker__month {
          margin: 0 !important;
          padding: 0.5rem 0 0.2rem !important;
          width: 100% !important;
        }
        .react-datepicker__day-names,
        .react-datepicker__week {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          justify-items: center !important;
          align-items: center !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }
        .react-datepicker__day-names {
          margin-bottom: 0 !important;
        }
        .react-datepicker__day-name {
          color: #64748b !important;
          font-weight: 700 !important;
          font-size: 0.74rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          width: 34px !important;
          height: 26px !important;
          line-height: 26px !important;
          margin: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-sizing: border-box !important;
        }
        .react-datepicker__day {
          width: 34px !important;
          height: 34px !important;
          line-height: 34px !important;
          margin: 2px 0 !important;
          border-radius: 8px !important;
          color: #0f172a !important;
          font-weight: 500 !important;
          font-size: 0.85rem !important;
          transition: all 0.15s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-sizing: border-box !important;
          border: 1px solid transparent !important;
        }
        .react-datepicker__day:hover {
          background-color: var(--primary-soft) !important;
          color: var(--primary) !important;
          border-color: rgba(249, 115, 22, 0.3) !important;
        }
        .react-datepicker__day--disabled {
          color: #cbd5e1 !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
          background: transparent !important;
        }
        .react-datepicker__day--outside-month {
          color: #e2e8f0 !important;
          pointer-events: none !important;
          opacity: 0.25 !important;
          background: transparent !important;
          border: none !important;
        }
        .react-datepicker__day--outside-month.booked-day-pill {
          background: transparent !important;
          border: none !important;
          color: #e2e8f0 !important;
          text-decoration: none !important;
          opacity: 0.15 !important;
        }
        .react-datepicker__day--selected, 
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end {
          background-color: var(--primary) !important;
          color: white !important;
          font-weight: 700 !important;
          border-color: var(--primary) !important;
        }
        .react-datepicker__day--range-start:not(.react-datepicker__day--range-end) {
          border-radius: 8px 0 0 8px !important;
        }
        .react-datepicker__day--range-end:not(.react-datepicker__day--range-start) {
          border-radius: 0 8px 8px 0 !important;
        }
        .react-datepicker__day--in-range:not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end) {
          background-color: #ffedd5 !important;
          color: #c2410c !important;
          font-weight: 600 !important;
          border-radius: 0 !important;
          border-color: #ffedd5 !important;
        }
        .react-datepicker__day--in-selecting-range:not(.react-datepicker__day--in-range) {
          background-color: #fff7ed !important;
          color: #ea580c !important;
        }
        .react-datepicker__day--today:not(.react-datepicker__day--selected):not(.react-datepicker__day--in-range):not(.booked-day-pill) {
          font-weight: 800 !important;
          color: var(--primary) !important;
          border-color: #fdba74 !important;
          background-color: #fff7ed !important;
        }
        /* Excluded / Booked Dates Highlight */
        .react-datepicker__day--excluded,
        .booked-day-pill {
          background-color: #fee2e2 !important;
          border: 1px solid #fca5a5 !important;
          color: #dc2626 !important;
          font-weight: 750 !important;
          text-decoration: line-through !important;
          cursor: pointer !important;
          box-sizing: border-box !important;
          border-radius: 8px !important;
          opacity: 0.95 !important;
        }
        .react-datepicker__day--excluded:hover,
        .booked-day-pill:hover {
          background-color: #fecaca !important;
          color: #b91c1c !important;
          border-color: #f87171 !important;
        }

        /* Calendar Legend */
        .calendar-legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 12px;
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.74rem;
          color: #475569;
          width: 100%;
          box-sizing: border-box;
          flex-wrap: wrap;
        }
        .legend-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-weight: 600;
        }
        .legend-swatch {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          display: inline-block;
          flex-shrink: 0;
        }
        .swatch-booked {
          background: #fee2e2;
          border: 1px solid #ef4444;
        }
        .swatch-selected {
          background: #f97316;
          border: 1px solid #ea580c;
        }

        /* Booking Conflict Warning Box */
        .booked-conflict-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-left: 4px solid #ef4444;
          border-radius: 8px;
          padding: 10px 12px;
          margin-bottom: 10px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          color: #991b1b;
          font-size: 0.82rem;
          line-height: 1.4;
          animation: fadeIn 0.2s ease;
        }
        .booked-conflict-box strong {
          display: block;
          font-size: 0.85rem;
          color: #7f1d1d;
          margin-bottom: 2px;
        }
        .booked-conflict-box p {
          margin: 0;
          color: #991b1b;
        }

        .bk-step {
          padding: 0.9rem 0;
          border-top: 1px solid #f1f5f9;
        }

        .bk-step:first-of-type {
          border-top: none;
          padding-top: 0.25rem;
        }

        .bk-step-head {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.92rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.35rem;
        }

        .bk-step-num {
          display: grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #475569;
          font-size: 0.75rem;
          font-weight: 800;
          flex-shrink: 0;
        }

        .bk-step-num.done {
          background: #16a34a;
          color: #ffffff;
        }

        .bk-hint {
          margin: 0 0 0.5rem;
          font-size: 0.82rem;
          color: #64748b;
        }

        .bk-date-summary {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          align-items: center;
          gap: 8px;
          margin-top: 0.6rem;
          padding: 0.6rem 0.75rem;
          border-radius: 12px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
        }

        .bk-date-summary span {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          color: #9a3412;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .bk-date-summary strong {
          font-size: 0.88rem;
          color: #0f172a;
        }

        .bk-clear {
          border: none;
          background: none;
          color: #c2410c;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          padding: 6px;
        }

        .bk-trip-total {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 10px;
          font-size: 0.88rem;
          color: #475569;
        }

        .bk-trip-total strong {
          font-size: 1.15rem;
          color: #ea580c;
        }

        .bk-trip-note {
          margin: 2px 0 0.5rem;
          font-size: 0.78rem;
          color: #64748b;
        }

        .bk-link {
          border: none;
          background: none;
          padding: 4px 0;
          color: #c2410c;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
        }

        .bk-note-input {
          width: 100%;
          padding: 8px 10px;
          font-size: 16px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          resize: vertical;
          box-sizing: border-box;
          font-family: inherit;
          line-height: 1.4;
        }

        .bk-terms-check {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 0.65rem 0.75rem;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 0.84rem;
          line-height: 1.45;
          color: #334155;
          cursor: pointer;
        }

        .bk-terms-check input {
          width: 20px;
          height: 20px;
          margin-top: 1px;
          accent-color: #16a34a;
          flex-shrink: 0;
          cursor: pointer;
        }

        .bk-terms-check a {
          color: #c2410c;
          font-weight: 700;
        }

        .bk-terms-list {
          margin: 0.25rem 0 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 6px;
          font-size: 0.8rem;
          line-height: 1.45;
          color: #475569;
        }

        .bk-book-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 0.5rem;
        }

        .bk-book-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .bk-missing {
          margin: 0.5rem 0 0;
          font-size: 0.8rem;
          font-weight: 600;
          text-align: center;
          color: #b45309;
        }

        .book-note {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          margin: 0.6rem 0 0;
          font-size: 0.78rem;
          line-height: 1.45;
          color: #64748b;
        }

        .book-note svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: #f97316;
        }

        .btn-call-us {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 44px;
          margin-top: 0.75rem;
          border: 1.5px solid #fed7aa;
          border-radius: 12px;
          background: #fff7ed;
          color: #c2410c;
          font-size: 0.9rem;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .btn-call-us:hover {
          background: #ffedd5;
          border-color: #fdba74;
          color: #9a3412;
        }

        .bk-confirm-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          animation: bkFade 0.2s ease;
        }

        .bk-confirm-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          max-height: calc(100dvh - 2rem);
          overflow-y: auto;
          padding: 1.75rem 1.5rem 1.25rem;
          border-radius: 20px;
          background: #ffffff;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
          animation: bkPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes bkFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bkPop { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }

        .bk-confirm-close {
          position: absolute;
          top: 12px;
          right: 12px;
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
          cursor: pointer;
        }

        .bk-confirm-icon {
          display: grid;
          place-items: center;
          width: 64px;
          height: 64px;
          margin: 0 auto 0.75rem;
          border-radius: 50%;
          background: #dcfce7;
          color: #16a34a;
        }

        .bk-confirm-card h3 {
          margin: 0 0 0.35rem;
          font-size: 1.3rem;
          color: #0f172a;
        }

        .bk-confirm-sub {
          margin: 0 auto 1rem;
          max-width: 32ch;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #64748b;
        }

        .bk-confirm-summary {
          display: grid;
          gap: 6px;
          padding: 0.75rem 0.9rem;
          margin-bottom: 1rem;
          border-radius: 12px;
          background: #f8fafc;
          text-align: left;
        }

        .bk-confirm-summary div {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 0.84rem;
        }

        .bk-confirm-summary span {
          color: #64748b;
        }

        .bk-confirm-summary strong {
          color: #0f172a;
          text-align: right;
        }

        .bk-confirm-steps {
          display: grid;
          gap: 8px;
          margin: 0 0 1.1rem;
          padding: 0;
          list-style: none;
          text-align: left;
        }

        .bk-confirm-steps li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          color: #475569;
        }

        .bk-confirm-steps li svg {
          flex-shrink: 0;
          color: #f97316;
        }

        .bk-confirm-steps li.done svg {
          color: #16a34a;
        }

        .bk-confirm-wa {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 50px;
          border-radius: 12px;
          background: #25d366;
          color: #ffffff;
          font-size: 1rem;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 8px 20px -6px rgba(37, 211, 102, 0.6);
        }

        .bk-confirm-wa:hover {
          background: #1ebe5a;
          color: #ffffff;
        }

        .bk-confirm-done {
          margin-top: 0.6rem;
          padding: 0.6rem 1rem;
          border: none;
          background: none;
          color: #64748b;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
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
          .detail-wrap {
            padding: 85px 1rem 4rem !important;
          }
          .detail-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 1.5rem !important;
          }
          .detail-grid > * { min-width: 0; }
          .bid-panel {
            position: relative !important;
            top: auto !important;
            max-height: none !important;
            overflow-y: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .main-image { height: 280px; }
        }

        @media (max-width: 768px) {
          .detail-wrap {
            padding: 75px 0.85rem 3rem !important;
          }
          .breadcrumb {
            margin-bottom: 0.85rem !important;
          }
          .breadcrumb a {
            font-size: 0.82rem !important;
          }
          .main-image-wrap {
            margin-bottom: 1.25rem !important;
          }
          .main-image {
            height: 250px !important;
            border-radius: 16px !important;
          }
          .photo-nav {
            width: 34px !important;
            height: 34px !important;
            font-size: 1.25rem !important;
          }
          .thumbnails-gallery {
            gap: 8px !important;
            margin-bottom: 1.25rem !important;
            -webkit-overflow-scrolling: touch;
          }
          .thumbnails-gallery button {
            width: 62px !important;
            height: 46px !important;
            border-radius: 8px !important;
          }
          .vehicle-header {
            flex-direction: column !important;
            gap: 0.75rem !important;
            align-items: flex-start !important;
            margin-bottom: 1.25rem !important;
          }
          .vehicle-header h1 {
            font-size: 1.5rem !important;
            line-height: 1.25 !important;
            letter-spacing: -0.01em !important;
          }
          .vehicle-rating {
            flex-direction: row !important;
            align-items: center !important;
            gap: 0.5rem !important;
            padding: 0.45rem 0.85rem !important;
            border-radius: 8px !important;
          }
          .vehicle-rating span {
            font-size: 0.95rem !important;
          }
          .vehicle-rating small {
            font-size: 0.78rem !important;
          }
          .specs-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
            padding: 12px 14px !important;
            margin-bottom: 1.25rem !important;
            border-radius: 12px !important;
          }
          .spec-item {
            gap: 8px !important;
          }
          .spec-label {
            font-size: 0.65rem !important;
          }
          .spec-value {
            font-size: 0.82rem !important;
          }
          .about-section {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.5rem !important;
          }
          .bid-card {
            padding: 1.25rem !important;
            border-radius: 16px !important;
          }
          .price {
            font-size: 1.65rem !important;
          }
          .react-datepicker {
            padding: 0.75rem 0.4rem !important;
            border-radius: 14px !important;
          }
          .calendar-header-title {
            font-size: 0.92rem !important;
          }
          .calendar-nav-btn {
            width: 30px !important;
            height: 30px !important;
          }
          .react-datepicker__day-name {
            width: 32px !important;
            height: 24px !important;
            line-height: 24px !important;
            font-size: 0.7rem !important;
          }
          .react-datepicker__day {
            width: 32px !important;
            height: 32px !important;
            line-height: 32px !important;
            font-size: 0.8rem !important;
          }
          .calendar-legend {
            gap: 8px !important;
            font-size: 0.7rem !important;
            padding: 6px 8px !important;
          }
          .btn-primary {
            min-height: 48px !important;
            font-size: 0.96rem !important;
            font-weight: 750 !important;
            border-radius: 12px !important;
          }
          .similar-section {
            margin-top: 2.5rem !important;
          }
          .similar-head {
            margin-bottom: 1rem !important;
          }
          .similar-head h2 {
            font-size: 1.35rem !important;
          }
          .similar-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.65rem !important;
          }
        }

        @media (max-width: 480px) {
          .detail-wrap {
            padding: 70px 0.75rem 2.5rem !important;
          }
          .main-image {
            height: 215px !important;
            border-radius: 14px !important;
          }
          .photo-counter {
            font-size: 0.72rem !important;
            padding: 3px 8px !important;
          }
          .specs-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            padding: 10px 12px !important;
          }
          .react-datepicker__day-name {
            width: 29px !important;
            font-size: 0.66rem !important;
          }
          .react-datepicker__day {
            width: 29px !important;
            height: 29px !important;
            line-height: 29px !important;
            font-size: 0.75rem !important;
            border-radius: 6px !important;
          }
          .similar-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>
      {/* Progressive Booking Auth & Phone Modal */}
      {bookingConfirm && (
        <div className="bk-confirm-overlay" onClick={() => setBookingConfirm(null)}>
          <div className="bk-confirm-card" role="dialog" aria-modal="true" aria-labelledby="bk-confirm-title" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="bk-confirm-close" onClick={() => setBookingConfirm(null)} aria-label="Close">
              <X size={18} />
            </button>
            <div className="bk-confirm-icon">
              <CheckCircle2 size={34} />
            </div>
            <h3 id="bk-confirm-title">
              {bookingConfirm.recorded ? "Booking request sent!" : "Almost there!"}
            </h3>
            <p className="bk-confirm-sub">
              {bookingConfirm.recorded
                ? "The Yamu team has been notified by email and will confirm availability with you shortly."
                : "We couldn't save your request just now. Send it to us on WhatsApp and we'll take it from there."}
            </p>

            <div className="bk-confirm-summary">
              {bookingConfirm.ref && (
                <div><span>Reference</span><strong>{bookingConfirm.ref}</strong></div>
              )}
              <div><span>Vehicle</span><strong>{vehicle.brand} {vehicle.model} ({vehicle.year})</strong></div>
              <div><span>Dates</span><strong>{bookingConfirm.dates}</strong></div>
            </div>

            <ol className="bk-confirm-steps">
              <li className="done"><Mail size={15} /> Request emailed to the Yamu team</li>
              <li><MessageSquare size={15} /> Tap below and press Send in WhatsApp</li>
              <li><Phone size={15} /> We confirm the car and pickup with you</li>
            </ol>

            <a
              className="bk-confirm-wa"
              href={bookingConfirm.waUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageSquare size={18} /> Send on WhatsApp
            </a>
            <a className="btn-call-us" href={`tel:${YAMU_HOTLINE_TEL}`}>
              <Phone size={16} /> Call us on {YAMU_HOTLINE_DISPLAY}
            </a>
            <button type="button" className="bk-confirm-done" onClick={() => setBookingConfirm(null)}>
              Done
            </button>
          </div>
        </div>
      )}

      <BookingAuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        vehicle={vehicle}
        dateStr={startDate && endDate ? `${startDate.toLocaleDateString("en-GB")} to ${endDate.toLocaleDateString("en-GB")}` : ""}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(updatedUser) => {
          executeBooking(updatedUser?.phone);
        }}
      />
    </div>
  );
};

export default VehicleDetail;
