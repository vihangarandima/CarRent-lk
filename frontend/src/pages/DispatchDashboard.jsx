import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Car,
  MapPin,
  Users,
  Settings2,
  ShieldCheck,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Navigation,
  ArrowRight,
  Check,
} from "lucide-react";
import { API_URL } from "../config";
import { formatVehicleImageUrl, handleImageError } from "../utils/imageHelper";
import { useCurrency } from "../context/CurrencyContext";
import { useToast } from "../context/ToastContext";
import { getStoredUser, clearSession } from "../utils/session";

const toWhatsAppNumber = (phone) => {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "94" + digits.slice(1);
  if (!digits.startsWith("94") && digits.length === 9) digits = "94" + digits;
  return digits;
};

export default function DispatchDashboard() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const { formatPrice } = useCurrency();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = getStoredUser();
  const jwt = localStorage.getItem("token");
  const isAdmin = currentUser && currentUser.role === "admin";

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingAction, setSavingAction] = useState(false);

  // Notes state
  const [adminNotes, setAdminNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Alternatives state
  const [alternatives, setAlternatives] = useState(null);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [activeAltTab, setActiveAltTab] = useState("nearby"); // nearby | similar | host

  // Quick-Add Vehicle Modal
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    vehicleType: "car",
    pricePerDay: "",
    transmission: "Automatic",
    seats: 5,
    images: "",
    autoAssign: true,
  });
  const [savingQuickAdd, setSavingQuickAdd] = useState(false);

  // Fetch Booking Details
  const fetchBooking = useCallback(async () => {
    if (!id) return;
    try {
      const jwt = localStorage.getItem("token");
      const headers = jwt ? { "x-auth-token": jwt } : {};
      const res = await axios.get(`${API_URL}/api/bookings/dispatch/${id}?token=${token}`, {
        headers,
      });
      if (res.data?.booking) {
        setBooking(res.data.booking);
        setAdminNotes(res.data.booking.adminNotes || "");
      }
    } catch (err) {
      console.error("Error fetching dispatch booking:", err);
      setError(
        err.response?.status === 403
          ? "Access Restricted: You need an authorized concierge dispatch link or admin privileges to view this portal."
          : err.response?.data?.msg || "Unable to load booking details."
      );
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // Fetch Alternatives
  const fetchAlternatives = useCallback(async () => {
    if (!id) return;
    setLoadingAlternatives(true);
    try {
      const jwt = localStorage.getItem("token");
      const headers = jwt ? { "x-auth-token": jwt } : {};
      const res = await axios.get(
        `${API_URL}/api/bookings/dispatch/${id}/alternatives?token=${token}`,
        { headers }
      );
      if (res.data?.alternatives) {
        setAlternatives(res.data.alternatives);
      }
    } catch (err) {
      console.warn("Could not load alternatives:", err.message);
    } finally {
      setLoadingAlternatives(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (booking?.status === "finding_alternative") {
      fetchAlternatives();
    }
  }, [booking?.status, fetchAlternatives]);

  // Save admin notes
  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const jwt = localStorage.getItem("token");
      const headers = jwt ? { "x-auth-token": jwt } : {};
      await axios.patch(
        `${API_URL}/api/bookings/dispatch/${id}/status?token=${token}`,
        { adminNotes },
        { headers }
      );
      toast.success("Admin notes saved!");
    } catch (err) {
      toast.error("Failed to save notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Mark Host Contacted
  const handleToggleHostContacted = async (statusVal) => {
    try {
      const jwt = localStorage.getItem("token");
      const headers = jwt ? { "x-auth-token": jwt } : {};
      const res = await axios.patch(
        `${API_URL}/api/bookings/dispatch/${id}/status?token=${token}`,
        {
          hostContacted: true,
          hostAvailabilityStatus: statusVal,
        },
        { headers }
      );
      if (res.data?.booking) {
        setBooking(res.data.booking);
        toast.success("Host contact status updated!");
      }
    } catch (err) {
      toast.error("Could not update host contact status.");
    }
  };

  // Status Actions
  const handleUpdateStatus = async (newStatus, extraData = {}) => {
    setSavingAction(true);
    try {
      const jwt = localStorage.getItem("token");
      const headers = jwt ? { "x-auth-token": jwt } : {};
      const res = await axios.patch(
        `${API_URL}/api/bookings/dispatch/${id}/status?token=${token}`,
        { status: newStatus, ...extraData },
        { headers }
      );
      if (res.data?.booking) {
        setBooking(res.data.booking);
        if (newStatus === "confirmed") {
          toast.success("Booking confirmed! Dates are reserved.");
        } else if (newStatus === "finding_alternative") {
          toast.info("Original car marked unavailable. Alternative finder activated.");
          fetchAlternatives();
        } else if (newStatus === "cancelled") {
          toast.warning("Booking has been cancelled.");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update booking status.");
    } finally {
      setSavingAction(false);
    }
  };

  // Assign Alternative Vehicle & Confirm
  const handleAssignAlternative = async (altVehicle) => {
    if (!window.confirm(`Assign ${altVehicle.brand} ${altVehicle.model} and confirm booking?`)) {
      return;
    }
    setSavingAction(true);
    try {
      const jwt = localStorage.getItem("token");
      const headers = jwt ? { "x-auth-token": jwt } : {};
      const res = await axios.patch(
        `${API_URL}/api/bookings/dispatch/${id}/status?token=${token}`,
        {
          assignedVehicleId: altVehicle._id,
          status: "confirmed",
          note: `Assigned alternative vehicle: ${altVehicle.brand} ${altVehicle.model}`,
        },
        { headers }
      );
      if (res.data?.booking) {
        setBooking(res.data.booking);
        toast.success(`Swapped to ${altVehicle.brand} ${altVehicle.model} & confirmed!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to assign alternative vehicle.");
    } finally {
      setSavingAction(false);
    }
  };

  // Quick-Add Submit
  const handleQuickAddVehicle = async (e) => {
    e.preventDefault();
    if (!quickAddForm.brand || !quickAddForm.model || !quickAddForm.pricePerDay) {
      toast.warning("Brand, model, and price per day are required.");
      return;
    }
    setSavingQuickAdd(true);
    try {
      const jwt = localStorage.getItem("token");
      const headers = jwt ? { "x-auth-token": jwt } : {};
      const imagesArr = quickAddForm.images
        ? quickAddForm.images.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const res = await axios.post(
        `${API_URL}/api/bookings/dispatch/${id}/quick-add-vehicle?token=${token}`,
        {
          ...quickAddForm,
          images: imagesArr,
        },
        { headers }
      );
      if (res.data?.booking) {
        setBooking(res.data.booking);
        setShowQuickAddModal(false);
        toast.success("New vehicle listed and assigned to booking successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to quick-add vehicle.");
    } finally {
      setSavingQuickAdd(false);
    }
  };

  // Security Guard: Restrict access to logged-in Admins only
  if (!jwt || !isAdmin) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return (
      <div className="dispatch-error-wrap">
        <div className="dispatch-error-card" style={{ maxWidth: 440 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 1.25rem",
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
            Admin Access Required
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
            {currentUser
              ? `You are currently logged in as "${currentUser.name}" (${currentUser.role}). This concierge dispatch portal contains host contact details and reservation controls, accessible exclusively to Yamu Administrators.`
              : "This concierge dispatch portal contains vehicle owner contact details and reservation controls. Please log in with an administrator account to continue."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                if (currentUser && !isAdmin) {
                  clearSession();
                }
                navigate(`/login?redirect=${redirectUrl}`);
              }}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.92rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <ShieldCheck size={18} />
              <span>{currentUser ? "Switch to Admin Account" : "Sign In as Admin"}</span>
            </button>
            <Link
              to="/"
              style={{
                color: "#64748b",
                fontSize: "0.85rem",
                textDecoration: "none",
                fontWeight: 600,
                padding: "6px",
                textAlign: "center",
              }}
            >
              Return to Yamu Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dispatch-loading-wrap">
        <div className="spinner" />
        <p>Loading Yamu Concierge Booking Portal...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="dispatch-error-wrap">
        <div className="dispatch-error-card">
          <AlertTriangle size={48} color="#ef4444" />
          <h2>Access Restricted</h2>
          <p>{error || "Booking not found."}</p>
          <Link to="/" className="btn-primary">
            Return to Yamu Home
          </Link>
        </div>
      </div>
    );
  }

  const currentVehicle = booking.assignedVehicle || booking.vehicle;
  const originalVehicle = booking.originalVehicle || booking.vehicle;
  const isVehicleSwapped = booking.assignedVehicle && booking.originalVehicle && booking.assignedVehicle._id !== booking.originalVehicle._id;

  const hostPhone = booking.company?.phone || booking.host?.phone || "";
  const hostWaNumber = toWhatsAppNumber(hostPhone);
  const customerWaNumber = toWhatsAppNumber(booking.customerPhone);

  const pickupDateFormatted = new Date(booking.startDate).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const returnDateFormatted = new Date(booking.endDate).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const statusBadgeInfo = {
    pending: { label: "Pending Review", color: "#eab308", bg: "rgba(234, 179, 8, 0.12)" },
    reviewing: { label: "Under Review / Checking Host", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)" },
    finding_alternative: { label: "Matching Alternatives", color: "#f97316", bg: "rgba(249, 115, 22, 0.12)" },
    confirmed: { label: "Booking Confirmed", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" },
    cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)" },
  }[booking.status] || { label: booking.status, color: "#6b7280", bg: "#f3f4f6" };

  return (
    <div className="dispatch-page-container">
      {/* Top Concierge Header */}
      <header className="dispatch-top-bar">
        <div className="dispatch-brand">
          <span className="dispatch-badge">
            <ShieldCheck size={14} style={{ marginRight: 4 }} /> Concierge Dispatch
          </span>
        </div>

        <div className="dispatch-meta-right">
          <div className="dispatch-ref-pill">
            <span className="text-muted">Ref:</span>
            <strong>{booking.bookingNumber}</strong>
          </div>

          <div
            className="dispatch-status-pill"
            style={{ color: statusBadgeInfo.color, background: statusBadgeInfo.bg, borderColor: statusBadgeInfo.color }}
          >
            <span className="pulse-dot" style={{ background: statusBadgeInfo.color }} />
            {statusBadgeInfo.label}
          </div>

          <button type="button" onClick={fetchBooking} className="btn-refresh-dispatch" title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="dispatch-main-content">
        <div className="dispatch-grid">
          {/* COLUMN 1: Customer Details & Trip Information */}
          <section className="dispatch-card">
            <div className="dispatch-card-header">
              <h3>
                <Users size={18} className="text-primary" /> Customer & Booking Details
              </h3>
              <span className="text-xs text-muted">Direct Inquiry</span>
            </div>

            <div className="dispatch-card-body">
              <div className="customer-info-box">
                <div className="customer-avatar-circle">
                  {booking.customerName ? booking.customerName.charAt(0).toUpperCase() : "C"}
                </div>
                <div>
                  <h4 className="customer-name">{booking.customerName}</h4>
                  <p className="customer-phone">{booking.customerPhone || "No phone provided"}</p>
                  {booking.customerEmail && <p className="customer-email text-xs">{booking.customerEmail}</p>}
                </div>
              </div>

              {/* Customer WhatsApp / Call Triggers */}
              <div className="action-row mt-3">
                {customerWaNumber && (
                  <a
                    href={`https://wa.me/${customerWaNumber}?text=${encodeURIComponent(
                      `Hello ${booking.customerName}! Regarding your Yamu Car Rentals booking request #${booking.bookingNumber} for the ${currentVehicle?.brand} ${currentVehicle?.model}...\nWe are checking host availability for you!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-wa-action"
                  >
                    <MessageSquare size={16} /> <span>WhatsApp Customer</span>
                  </a>
                )}
                {booking.customerPhone && (
                  <a href={`tel:${booking.customerPhone}`} className="btn-call-action">
                    <Phone size={16} /> <span>Call Customer</span>
                  </a>
                )}
              </div>

              <hr className="dispatch-divider" />

              {/* Trip Parameters */}
              <div className="trip-specs-grid">
                <div className="trip-spec-item">
                  <span className="spec-label">
                    <Calendar size={13} /> Rental Dates
                  </span>
                  <span className="spec-value">{pickupDateFormatted} → {returnDateFormatted}</span>
                </div>

                <div className="trip-spec-item">
                  <span className="spec-label">
                    <Clock size={13} /> Duration
                  </span>
                  <span className="spec-value font-bold">{booking.totalDays} Day{booking.totalDays > 1 ? "s" : ""}</span>
                </div>

                <div className="trip-spec-item">
                  <span className="spec-label">
                    <Car size={13} /> Mode
                  </span>
                  <span className="spec-value capitalize">{booking.rentMode || "Self-drive"}</span>
                </div>

                <div className="trip-spec-item">
                  <span className="spec-label">Estimated Total</span>
                  <span className="spec-value text-primary font-bold text-lg">
                    {formatPrice(booking.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* COLUMN 2: Requested Vehicle & Host Verification (Confidential) */}
          <section className="dispatch-card">
            <div className="dispatch-card-header">
              <h3>
                <Car size={18} className="text-primary" /> Vehicle & Host Verification
              </h3>
              <span className="badge-confidential">Confidential Host Info</span>
            </div>

            <div className="dispatch-card-body">
              {/* Vehicle Thumbnail & Specs */}
              <div className="vehicle-dispatch-card">
                <img
                  src={formatVehicleImageUrl(currentVehicle?.images, currentVehicle?.vehicleType)}
                  alt={currentVehicle?.model || "Vehicle"}
                  className="vehicle-dispatch-img"
                  onError={handleImageError}
                />
                <div className="vehicle-dispatch-info">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold">
                      {currentVehicle?.brand} {currentVehicle?.model} ({currentVehicle?.year})
                    </h4>
                    {isVehicleSwapped && <span className="badge-swapped">Alternative Assigned</span>}
                  </div>
                  <p className="text-xs text-muted">
                    {currentVehicle?.vehicleType?.toUpperCase()} · {currentVehicle?.transmission} · {currentVehicle?.location || "Colombo"}
                  </p>
                  <p className="text-sm font-semibold text-primary mt-1">
                    Rate: {formatPrice(currentVehicle?.pricePerDay)} / day
                  </p>
                </div>
              </div>

              <hr className="dispatch-divider" />

              {/* Host Contact Box */}
              <div className="host-contact-panel">
                <div className="host-title-row">
                  <div>
                    <span className="text-xs text-muted">Vehicle Listed By</span>
                    <h4 className="font-bold text-gray-900">
                      {booking.company ? booking.company.companyName : (booking.host?.name || "Private Host")}
                    </h4>
                    <p className="text-xs text-muted">
                      Location: {currentVehicle?.location || "Colombo"} · Host Phone: {hostPhone || "Unavailable"}
                    </p>
                  </div>
                </div>

                {/* 1-Click Call & WhatsApp Host */}
                <div className="action-row mt-3">
                  {hostPhone && (
                    <a
                      href={`tel:${hostPhone}`}
                      onClick={() => handleToggleHostContacted("available")}
                      className="btn-call-host"
                    >
                      <Phone size={16} /> <span>Call Host Now</span>
                    </a>
                  )}

                  {hostWaNumber && (
                    <a
                      href={`https://wa.me/${hostWaNumber}?text=${encodeURIComponent(
                        `Hello ${booking.company?.companyName || booking.host?.name || "Host"}, this is Yamu Car Rentals Concierge regarding Booking #${booking.bookingNumber} for your ${currentVehicle?.brand} ${currentVehicle?.model} (${pickupDateFormatted} to ${returnDateFormatted}). Is this vehicle available for these dates?`
                      )}`}
                      onClick={() => handleToggleHostContacted("available")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-wa-host"
                    >
                      <MessageSquare size={16} /> <span>WhatsApp Host</span>
                    </a>
                  )}
                </div>

                {/* Host Availability Decision Buttons */}
                <div className="host-checklist-row mt-3">
                  <span className="text-xs font-semibold text-gray-700">Host Response:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`btn-chip ${booking.hostAvailabilityStatus === "available" ? "active-green" : ""}`}
                      onClick={() => handleToggleHostContacted("available")}
                    >
                      ✓ Car Available
                    </button>
                    <button
                      type="button"
                      className={`btn-chip ${booking.hostAvailabilityStatus === "unavailable" ? "active-red" : ""}`}
                      onClick={() => {
                        handleToggleHostContacted("unavailable");
                        handleUpdateStatus("finding_alternative", { hostAvailabilityStatus: "unavailable" });
                      }}
                    >
                      ✗ Car Unavailable
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Notes Box */}
              <div className="admin-notes-section mt-3">
                <label className="text-xs font-semibold text-gray-700">Admin Internal Notes & Follow-up</label>
                <div className="flex gap-2 mt-1">
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Host agreed on Rs. 14,000. Customer wants airport dropoff..."
                    className="notes-textarea"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="btn-save-notes"
                  >
                    {isSavingNotes ? "..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* PRIMARY ACTION COMMAND BAR */}
        <section className="dispatch-command-bar">
          <div className="command-bar-inner">
            <div>
              <h4 className="font-bold text-gray-900">Concierge Actions</h4>
              <p className="text-xs text-muted">
                Confirm reservation, search alternative vehicles, or release date holds.
              </p>
            </div>

            <div className="command-buttons-row">
              {booking.status !== "confirmed" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("confirmed")}
                  disabled={savingAction}
                  className="btn-confirm-booking"
                >
                  <CheckCircle2 size={18} />
                  <span>{savingAction ? "Saving..." : "✅ Confirm Booking"}</span>
                </button>
              )}

              {booking.status !== "finding_alternative" && booking.status !== "confirmed" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("finding_alternative")}
                  disabled={savingAction}
                  className="btn-unavailable-booking"
                >
                  <AlertTriangle size={18} />
                  <span>❌ Car Unavailable (Find Alternatives)</span>
                </button>
              )}

              {booking.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={() => {
                    const reason = window.prompt("Reason for cancellation (optional):");
                    if (reason !== null) {
                      handleUpdateStatus("cancelled", { cancellationReason: reason });
                    }
                  }}
                  disabled={savingAction}
                  className="btn-cancel-booking"
                >
                  <XCircle size={18} />
                  <span>Cancel Booking</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* CONFIRMED STATE CELEBRATION & NOTIFICATION */}
        {booking.status === "confirmed" && (
          <div className="confirmed-banner-card animate-in">
            <CheckCircle2 size={32} className="text-emerald-500" />
            <div>
              <h4 className="font-bold text-emerald-900">🎉 Booking Confirmed & Reserved!</h4>
              <p className="text-sm text-emerald-700">
                Vehicle dates are now officially locked in the system. Send the official booking voucher to the customer on WhatsApp:
              </p>
            </div>
            {customerWaNumber && (
              <a
                href={`https://wa.me/${customerWaNumber}?text=${encodeURIComponent(
                  `🎉 *Yamu Car Rentals - Booking Confirmed!*\n\nDear ${booking.customerName},\nYour vehicle booking #${booking.bookingNumber} has been verified and confirmed!\n\n• *Vehicle:* ${currentVehicle?.brand} ${currentVehicle?.model} (${currentVehicle?.year})\n• *Pickup Date:* ${pickupDateFormatted}\n• *Return Date:* ${returnDateFormatted}\n• *Total Duration:* ${booking.totalDays} Day(s)\n• *Total Rate:* ${formatPrice(booking.totalPrice)}\n\nOur host will contact you for pickup/delivery arrangements. Thank you for choosing Yamu!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa-confirm-send"
              >
                <MessageSquare size={16} /> Send Confirmation Voucher
              </a>
            )}
          </div>
        )}

        {/* ALTERNATIVE VEHICLES MATCHING SECTION */}
        {(booking.status === "finding_alternative" || booking.status === "reviewing") && (
          <section className="dispatch-alternatives-section">
            <div className="alternatives-header-bar">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" /> Intelligent Alternative Matching
                </h3>
                <p className="text-xs text-muted">
                  The original car is unavailable. Select an alternative car nearby or quick-add an unlisted car for this host.
                </p>
              </div>

              {/* Quick-Add Car for Same Host Button */}
              <button
                type="button"
                onClick={() => setShowQuickAddModal(true)}
                className="btn-quick-add-host-car"
              >
                <Plus size={16} /> Quick-Add Host's Other Car
              </button>
            </div>

            {/* Alternatives Tabs */}
            <div className="alt-tabs-nav">
              <button
                type="button"
                className={`alt-tab-btn ${activeAltTab === "nearby" ? "active" : ""}`}
                onClick={() => setActiveAltTab("nearby")}
              >
                <Navigation size={15} /> Exact Model Nearby (≤15 km)
                {alternatives?.sameModelNearby?.length > 0 && (
                  <span className="count-pill">{alternatives.sameModelNearby.length}</span>
                )}
              </button>

              <button
                type="button"
                className={`alt-tab-btn ${activeAltTab === "similar" ? "active" : ""}`}
                onClick={() => setActiveAltTab("similar")}
              >
                <Car size={15} /> Similar Cars (Same Seats, ±Rs. 1,000)
                {alternatives?.similarVehicles?.length > 0 && (
                  <span className="count-pill">{alternatives.similarVehicles.length}</span>
                )}
              </button>

              <button
                type="button"
                className={`alt-tab-btn ${activeAltTab === "host" ? "active" : ""}`}
                onClick={() => setActiveAltTab("host")}
              >
                <ShieldCheck size={15} /> Same Host Fleets
                {alternatives?.sameHostVehicles?.length > 0 && (
                  <span className="count-pill">{alternatives.sameHostVehicles.length}</span>
                )}
              </button>
            </div>

            {/* Alternatives Tab Body */}
            <div className="alt-tab-content">
              {loadingAlternatives ? (
                <div className="alt-loading-state">
                  <div className="spinner-sm" /> Searching matching vehicles across Sri Lanka...
                </div>
              ) : activeAltTab === "nearby" ? (
                <div className="alt-cards-grid">
                  {alternatives?.sameModelNearby?.length > 0 ? (
                    alternatives.sameModelNearby.map((veh) => (
                      <AlternativeVehicleCard
                        key={veh._id}
                        vehicle={veh}
                        booking={booking}
                        formatPrice={formatPrice}
                        customerWaNumber={customerWaNumber}
                        onAssign={handleAssignAlternative}
                      />
                    ))
                  ) : (
                    <div className="empty-alt-notice">
                      <Info size={18} /> No other {currentVehicle?.model} models found within 15 km. Try the Similar Cars tab or Quick-Add below.
                    </div>
                  )}
                </div>
              ) : activeAltTab === "similar" ? (
                <div className="alt-cards-grid">
                  {alternatives?.similarVehicles?.length > 0 ? (
                    alternatives.similarVehicles.map((veh) => (
                      <AlternativeVehicleCard
                        key={veh._id}
                        vehicle={veh}
                        booking={booking}
                        formatPrice={formatPrice}
                        customerWaNumber={customerWaNumber}
                        onAssign={handleAssignAlternative}
                      />
                    ))
                  ) : (
                    <div className="empty-alt-notice">
                      <Info size={18} /> No similar category vehicles with {currentVehicle?.seats} seats within ±Rs. 1,000 range.
                    </div>
                  )}
                </div>
              ) : (
                <div className="alt-cards-grid">
                  {alternatives?.sameHostVehicles?.length > 0 ? (
                    alternatives.sameHostVehicles.map((veh) => (
                      <AlternativeVehicleCard
                        key={veh._id}
                        vehicle={veh}
                        booking={booking}
                        formatPrice={formatPrice}
                        customerWaNumber={customerWaNumber}
                        onAssign={handleAssignAlternative}
                      />
                    ))
                  ) : (
                    <div className="empty-alt-notice">
                      <Info size={18} /> No other vehicles listed by this host yet. Click "Quick-Add Host's Other Car" to add one on the spot!
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* QUICK-ADD UNLISTED CAR MODAL */}
      {showQuickAddModal && (
        <div className="dispatch-modal-backdrop" onClick={() => setShowQuickAddModal(false)}>
          <div className="dispatch-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="dispatch-modal-header">
              <div>
                <h3 className="font-bold text-lg">➕ Quick-List Car for {booking.company?.companyName || booking.host?.name || "Host"}</h3>
                <p className="text-xs text-muted">
                  Host confirmed another car is available at their garage. Add details and assign it immediately.
                </p>
              </div>
              <button type="button" onClick={() => setShowQuickAddModal(false)} className="btn-close-modal">
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddVehicle} className="dispatch-modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Brand (e.g. Toyota, Honda)</label>
                  <input
                    type="text"
                    required
                    value={quickAddForm.brand}
                    onChange={(e) => setQuickAddForm({ ...quickAddForm, brand: e.target.value })}
                    placeholder="Toyota"
                  />
                </div>
                <div className="form-group">
                  <label>Model (e.g. Premio, Grace)</label>
                  <input
                    type="text"
                    required
                    value={quickAddForm.model}
                    onChange={(e) => setQuickAddForm({ ...quickAddForm, model: e.target.value })}
                    placeholder="Premio"
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    value={quickAddForm.year}
                    onChange={(e) => setQuickAddForm({ ...quickAddForm, year: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Daily Price (LKR / day)</label>
                  <input
                    type="number"
                    required
                    value={quickAddForm.pricePerDay}
                    onChange={(e) => setQuickAddForm({ ...quickAddForm, pricePerDay: e.target.value })}
                    placeholder="14000"
                  />
                </div>
                <div className="form-group">
                  <label>Transmission</label>
                  <select
                    value={quickAddForm.transmission}
                    onChange={(e) => setQuickAddForm({ ...quickAddForm, transmission: e.target.value })}
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Photo URLs (comma separated, or leave blank to use class default)</label>
                <input
                  type="text"
                  value={quickAddForm.images}
                  onChange={(e) => setQuickAddForm({ ...quickAddForm, images: e.target.value })}
                  placeholder="https://... image 1, https://... image 2"
                />
              </div>

              <div className="form-checkbox-row">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quickAddForm.autoAssign}
                    onChange={(e) => setQuickAddForm({ ...quickAddForm, autoAssign: e.target.checked })}
                  />
                  <span className="font-semibold text-sm">Assign directly to this booking upon saving</span>
                </label>
              </div>

              <div className="modal-actions-row">
                <button type="button" onClick={() => setShowQuickAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={savingQuickAdd} className="btn-primary">
                  {savingQuickAdd ? "Adding Vehicle..." : "Save & Assign to Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .dispatch-page-container {
          min-height: 100vh;
          background: #f8fafc;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding-bottom: 5rem;
        }

        .dispatch-top-bar {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 0.85rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 40;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .dispatch-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dispatch-logo {
          font-size: 1.25rem;
          font-weight: 900;
          text-decoration: none;
          color: #0f172a;
          letter-spacing: -0.5px;
        }

        .logo-accent {
          color: #f97316;
        }

        .dispatch-badge {
          background: #fff7ed;
          color: #ea580c;
          border: 1px solid #fed7aa;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dispatch-meta-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dispatch-ref-pill {
          background: #f1f5f9;
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 0.85rem;
          display: flex;
          gap: 6px;
        }

        .dispatch-status-pill {
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 7px;
          border: 1px solid transparent;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 1.8s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .btn-refresh-dispatch {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #64748b;
          border-radius: 6px;
          padding: 6px 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.15s ease;
        }

        .btn-refresh-dispatch:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .dispatch-main-content {
          max-width: 1180px;
          margin: 1.5rem auto;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dispatch-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 1.25rem;
        }

        @media (max-width: 860px) {
          .dispatch-grid {
            grid-template-columns: 1fr;
          }
        }

        .dispatch-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
          overflow: hidden;
        }

        .dispatch-card-header {
          padding: 0.9rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fafafa;
        }

        .dispatch-card-header h3 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1e293b;
        }

        .badge-confidential {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
        }

        .badge-swapped {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .dispatch-card-body {
          padding: 1.25rem;
        }

        .customer-info-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .customer-avatar-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #ea580c;
          color: #ffffff;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
        }

        .customer-name {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 700;
        }

        .customer-phone {
          margin: 2px 0 0;
          font-size: 0.88rem;
          color: #64748b;
          font-weight: 600;
        }

        .action-row {
          display: flex;
          gap: 8px;
        }

        .btn-wa-action, .btn-wa-host {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #10b981;
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 7px;
          font-weight: 600;
          font-size: 0.85rem;
          text-decoration: none;
          transition: background 0.15s;
        }

        .btn-wa-action:hover, .btn-wa-host:hover {
          background: #059669;
        }

        .btn-call-action, .btn-call-host {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #f1f5f9;
          color: #0f172a;
          border: 1px solid #cbd5e1;
          padding: 8px 12px;
          border-radius: 7px;
          font-weight: 600;
          font-size: 0.85rem;
          text-decoration: none;
          transition: all 0.15s;
        }

        .btn-call-action:hover, .btn-call-host:hover {
          background: #e2e8f0;
        }

        .dispatch-divider {
          border: 0;
          height: 1px;
          background: #e2e8f0;
          margin: 1.15rem 0;
        }

        .trip-specs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .trip-spec-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 9px 12px;
          border-radius: 8px;
        }

        .spec-label {
          font-size: 0.75rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 2px;
        }

        .spec-value {
          font-size: 0.92rem;
          font-weight: 600;
          color: #0f172a;
        }

        .vehicle-dispatch-card {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .vehicle-dispatch-img {
          width: 90px;
          height: 68px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .vehicle-dispatch-info h4 {
          margin: 0;
          font-size: 1rem;
        }

        .host-contact-panel {
          background: #fdfbf7;
          border: 1px solid #fef3c7;
          border-radius: 8px;
          padding: 12px;
        }

        .host-checklist-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px dashed #fde68a;
        }

        .btn-chip {
          border: 1px solid #cbd5e1;
          background: #ffffff;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          color: #475569;
        }

        .btn-chip.active-green {
          background: #ecfdf5;
          color: #059669;
          border-color: #a7f3d0;
        }

        .btn-chip.active-red {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fecaca;
        }

        .notes-textarea {
          flex: 1;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 0.85rem;
          resize: none;
        }

        .btn-save-notes {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 0 12px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.82rem;
          cursor: pointer;
        }

        .dispatch-command-bar {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.15rem 1.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }

        .command-bar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .command-buttons-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn-confirm-booking {
          background: #10b981;
          color: #ffffff;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
          transition: background 0.15s;
        }

        .btn-confirm-booking:hover {
          background: #059669;
        }

        .btn-unavailable-booking {
          background: #f97316;
          color: #ffffff;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
          transition: background 0.15s;
        }

        .btn-unavailable-booking:hover {
          background: #ea580c;
        }

        .btn-cancel-booking {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
          padding: 10px 14px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-cancel-booking:hover {
          background: #fecaca;
        }

        .confirmed-banner-card {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn-wa-confirm-send {
          margin-left: auto;
          background: #059669;
          color: #ffffff;
          text-decoration: none;
          padding: 9px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Alternatives Section */
        .dispatch-alternatives-section {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }

        .alternatives-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 1rem;
        }

        .btn-quick-add-host-car {
          background: #fff7ed;
          color: #ea580c;
          border: 1px solid #fed7aa;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }

        .btn-quick-add-host-car:hover {
          background: #ffedd5;
        }

        .alt-tabs-nav {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 6px;
          overflow-x: auto;
        }

        .alt-tab-btn {
          background: transparent;
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .alt-tab-btn.active {
          background: #f1f5f9;
          color: #0f172a;
          font-weight: 700;
        }

        .count-pill {
          background: #e2e8f0;
          padding: 1px 6px;
          border-radius: 999px;
          font-size: 0.72rem;
        }

        .alt-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 12px;
          margin-top: 1rem;
        }

        .empty-alt-notice {
          padding: 2.5rem 1rem;
          text-align: center;
          color: #64748b;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          grid-column: 1 / -1;
        }

        .alt-vehicle-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .alt-vehicle-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }

        .alt-veh-top {
          display: flex;
          gap: 10px;
          padding: 10px;
        }

        .alt-veh-img {
          width: 90px;
          height: 68px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #f1f5f9;
        }

        .alt-veh-specs {
          flex: 1;
        }

        .alt-veh-title {
          margin: 0;
          font-size: 0.92rem;
          font-weight: 700;
        }

        .alt-distance-tag {
          font-size: 0.72rem;
          background: #ecfdf5;
          color: #059669;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          display: inline-block;
          margin-top: 2px;
        }

        .alt-veh-actions {
          background: #fafafa;
          border-top: 1px solid #f1f5f9;
          padding: 8px 10px;
          display: flex;
          gap: 8px;
        }

        .btn-wa-alt-offer {
          flex: 1;
          background: #ffffff;
          color: #059669;
          border: 1px solid #a7f3d0;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .btn-assign-alt {
          flex: 1;
          background: #f97316;
          color: #ffffff;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        /* Modal */
        .dispatch-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 1rem;
        }

        .dispatch-modal-card {
          background: #ffffff;
          border-radius: 14px;
          max-width: 540px;
          width: 100%;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.18);
        }

        .dispatch-modal-header {
          padding: 1.15rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .btn-close-modal {
          background: transparent;
          border: none;
          font-size: 1.1rem;
          color: #94a3b8;
          cursor: pointer;
        }

        .dispatch-modal-form {
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

        .dispatch-modal-form label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 3px;
          display: block;
        }

        .dispatch-modal-form input, .dispatch-modal-form select {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.88rem;
        }

        .modal-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
        }

        .btn-secondary {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 8px 14px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
        }

        .btn-primary {
          background: #f97316;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
        }

        .dispatch-loading-wrap, .dispatch-error-wrap {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
        }

        .dispatch-error-card {
          background: #ffffff;
          padding: 2.5rem;
          border-radius: 12px;
          border: 1px solid #fee2e2;
          text-align: center;
          max-width: 440px;
        }
        @media (max-width: 640px) {
          .dispatch-top-bar {
            padding: 0.65rem 0.85rem;
            flex-wrap: wrap;
            gap: 8px;
          }
          .dispatch-brand {
            width: auto;
          }
          .dispatch-meta-right {
            width: 100%;
            justify-content: space-between;
            gap: 6px;
          }
          .dispatch-ref-pill {
            font-size: 0.78rem;
            padding: 4px 8px;
          }
          .dispatch-status-pill {
            font-size: 0.75rem;
            padding: 4px 8px;
          }
          .dispatch-main-content {
            padding: 0.85rem 0.75rem;
          }
          .dispatch-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .command-bar-inner {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .command-buttons-row {
            flex-direction: column;
            width: 100%;
            gap: 8px;
          }
          .btn-confirm-booking, .btn-unavailable-booking, .btn-cancel-booking {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

// Subcomponent for Alternative Vehicle Card
function AlternativeVehicleCard({ vehicle, booking, formatPrice, customerWaNumber, onAssign }) {
  const hostLabel = vehicle.company?.companyName || vehicle.owner?.name || "Verified Host";
  const pickupFormatted = new Date(booking.startDate).toLocaleDateString("en-GB");
  const returnFormatted = new Date(booking.endDate).toLocaleDateString("en-GB");

  const customerOfferMessage = `Hello ${booking.customerName}! Regarding your Yamu booking #${booking.bookingNumber}: The original car is booked, but we found an available alternative for your exact dates (${pickupFormatted} to ${returnFormatted}):\n\n🚗 ${vehicle.brand} ${vehicle.model} (${vehicle.year || ""})\n• Location: ${vehicle.location || "Colombo"}\n• Rate: ${formatPrice(vehicle.pricePerDay)} / day\n• Seats: ${vehicle.seats || 5} Seats (${vehicle.transmission || "Automatic"})\n\nWould you like us to confirm this vehicle for you?`;

  return (
    <div className="alt-vehicle-card">
      <div className="alt-veh-top">
        <img
          src={formatVehicleImageUrl(vehicle.images, vehicle.vehicleType)}
          alt={vehicle.model}
          className="alt-veh-img"
          onError={handleImageError}
        />
        <div className="alt-veh-specs">
          <h4 className="alt-veh-title">{vehicle.brand} {vehicle.model} ({vehicle.year})</h4>
          <p className="text-xs text-muted">
            {vehicle.location || "Colombo"} · Host: {hostLabel}
          </p>
          {vehicle.distanceKm !== null && vehicle.distanceKm !== undefined && (
            <span className="alt-distance-tag">
              <Navigation size={10} style={{ display: "inline", verticalAlign: "middle" }} /> {vehicle.distanceKm} km away
            </span>
          )}
          <p className="text-sm font-bold text-primary mt-1">
            {formatPrice(vehicle.pricePerDay)} / day
          </p>
        </div>
      </div>

      <div className="alt-veh-actions">
        {customerWaNumber && (
          <a
            href={`https://wa.me/${customerWaNumber}?text=${encodeURIComponent(customerOfferMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wa-alt-offer"
            title="Chat with Customer"
          >
            <MessageSquare size={13} /> Suggest on WhatsApp
          </a>
        )}

        <button
          type="button"
          onClick={() => onAssign(vehicle)}
          className="btn-assign-alt"
        >
          <Check size={14} /> Assign & Confirm
        </button>
      </div>
    </div>
  );
}
