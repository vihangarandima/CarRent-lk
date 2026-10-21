import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { API_URL } from "../config";
import { saveSession, getStoredUser } from "../utils/session";
import { needsProfileCompletion, profileError } from "../utils/profile";
import {
  X,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Car,
  Mail,
  MessageSquare,
} from "lucide-react";
import GoogleButton from "./GoogleButton";

export default function BookingAuthModal({
  isOpen,
  initialMode = "login", // "login" | "phone"
  vehicle,
  dateStr,
  onClose,
  onSuccess,
}) {
  const [mode, setMode] = useState(initialMode); // "login" | "email_login" | "phone"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email login state
  const [emailForm, setEmailForm] = useState({ email: "", password: "" });

  // Required details (phone, address, NIC) for accounts that are missing them
  const [details, setDetails] = useState(() => {
    const u = getStoredUser() || {};
    return { phone: u.phone || "", address: u.address || "", nic: u.nic || "" };
  });

  // Sync mode if initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
    setError("");
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const currentUser = getStoredUser();

  // Book straight away, or first collect any details the account is missing
  const finishSignIn = (savedUser) => {
    if (needsProfileCompletion(savedUser)) {
      setDetails({
        phone: savedUser.phone || "",
        address: savedUser.address || "",
        nic: savedUser.nic || "",
      });
      setMode("phone");
      return;
    }
    onSuccess(savedUser);
    onClose();
  };

  // 1. Google 1-Tap Sign-In
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await axios.post(`${API_URL}/api/auth/firebase-login`, {
        idToken,
        name: user.displayName,
      });

      finishSignIn(saveSession(res.data));
    } catch (err) {
      console.error("Google sign in error:", err);
      setError(err.response?.data?.msg || "Google sign-in could not be completed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Email & Password Sign-In
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, emailForm);
      finishSignIn(saveSession(res.data));
    } catch (err) {
      console.error("Email sign in error:", err);
      setError(err.response?.data?.msg || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Required details submission
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const problem = profileError(details);
    if (problem) {
      setError(problem);
      return;
    }

    setLoading(true);
    try {
      // People booking a car from here are renters; accounts with a role keep theirs
      const res = await axios.post(`${API_URL}/api/auth/complete-profile`, {
        ...details,
        ...(getStoredUser()?.needsRole ? { role: "renter" } : {}),
      });
      const updatedUser = saveSession(res.data);
      onSuccess(updatedUser);
      onClose();
    } catch (err) {
      console.error("Profile details error:", err);
      setError(err.response?.data?.msg || "Could not save your details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button type="button" className="booking-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Vehicle Context Summary */}
        {vehicle && (
          <div className="booking-vehicle-pill">
            <Car size={15} className="text-primary" />
            <span className="font-semibold">{vehicle.brand} {vehicle.model} ({vehicle.year})</span>
            {dateStr && <span className="text-muted">• {dateStr}</span>}
          </div>
        )}

        {/* ================= MODE: LOGIN ================= */}
        {mode === "login" && (
          <div className="booking-modal-content">
            <div className="modal-icon-bubble">
              <ShieldCheck size={28} color="#f97316" />
            </div>

            <h3 className="modal-title">Sign in to Reserve</h3>
            <p className="modal-subtitle">
              Sign in with Google or your Yamu account so our concierge can verify your reservation and send booking updates.
            </p>

            {error && (
              <div className="modal-alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="modal-actions-list">
              <GoogleButton
                onClick={handleGoogleSignIn}
                disabled={loading}
                label={loading ? "Connecting to Google..." : "Continue with Google"}
              />

              <div className="modal-divider">
                <span>OR</span>
              </div>

              <button
                type="button"
                className="btn-outline-action"
                onClick={() => setMode("email_login")}
                disabled={loading}
              >
                <Mail size={16} />
                <span>Sign in with Email</span>
              </button>
            </div>

            <div className="modal-footer-note">
              Don't have an account yet?{" "}
              <Link
                to={`/register?redirect=${encodeURIComponent(window.location.pathname)}`}
                className="text-primary font-semibold hover:underline"
              >
                Create Account
              </Link>
            </div>

            <div style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9',
              fontSize: '0.76rem',
              color: '#94a3b8',
              textAlign: 'center',
              lineHeight: 1.45
            }}>
              By continuing, you agree to Yamu's{' '}
              <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'underline' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</Link>.
            </div>
          </div>
        )}

        {/* ================= MODE: EMAIL LOGIN ================= */}
        {mode === "email_login" && (
          <div className="booking-modal-content">
            <div className="modal-icon-bubble">
              <Mail size={28} color="#f97316" />
            </div>

            <h3 className="modal-title">Sign In with Email</h3>
            <p className="modal-subtitle">Enter your Yamu account details to continue booking.</p>

            {error && (
              <div className="modal-alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEmailSignIn} className="modal-form">
              <div className="form-field">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-field">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-primary-action" disabled={loading}>
                {loading ? "Signing in..." : "Sign In & Continue"}
              </button>

              <button
                type="button"
                className="btn-text-action"
                onClick={() => {
                  setError("");
                  setMode("login");
                }}
              >
                Back to Google Sign In
              </button>
            </form>

            <div style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9',
              fontSize: '0.76rem',
              color: '#94a3b8',
              textAlign: 'center',
              lineHeight: 1.45
            }}>
              By requesting this booking, you agree to Yamu's{' '}
              <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 600, textDecoration: 'underline' }}>Terms of Service</Link>
              {' '}& rental marketplace policies.
            </div>
          </div>
        )}

        {/* ================= MODE: PHONE NUMBER COLLECTION ================= */}
        {mode === "phone" && (
          <div className="booking-modal-content">
            <div className="modal-icon-bubble green">
              <Phone size={28} color="#25D366" />
            </div>

            <h3 className="modal-title">
              {currentUser?.name ? `Welcome, ${currentUser.name.split(" ")[0]}!` : "Almost Done!"}
            </h3>
            <p className="modal-subtitle">
              Add your contact details so Yamu Concierge and the car host can verify dates and arrange key handover.
            </p>

            {error && (
              <div className="modal-alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePhoneSubmit} className="modal-form">
              <div className="form-field">
                <label>WhatsApp / Mobile Number</label>
                <div className="phone-input-wrap">
                  <span className="phone-prefix">🇱🇰 +94</span>
                  <input
                    type="tel"
                    required
                    autoFocus
                    placeholder="77 123 4567"
                    value={details.phone}
                    onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <span className="field-hint">e.g. 077 123 4567 or 771234567</span>
              </div>

              <div className="form-field">
                <label>Address</label>
                <input
                  type="text"
                  required
                  autoComplete="street-address"
                  placeholder="No. 12, Galle Road, Colombo 03"
                  value={details.address}
                  onChange={(e) => setDetails({ ...details, address: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-field">
                <label>NIC number (or passport for visitors)</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="199012345678 or 901234567V"
                  value={details.nic}
                  onChange={(e) => setDetails({ ...details, nic: e.target.value })}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-wa-submit" disabled={loading}>
                <CheckCircle2 size={18} />
                <span>{loading ? "Saving..." : "Continue to WhatsApp Booking"}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        .booking-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1.25rem;
          animation: modalFadeIn 0.2s ease-out;
        }

        .booking-modal-card {
          background: #ffffff;
          border-radius: 1.25rem;
          max-width: 440px;
          width: 100%;
          padding: 2rem 1.75rem 1.75rem;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .booking-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #f1f5f9;
          border: none;
          color: #64748b;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .booking-modal-close:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .booking-vehicle-pill {
          background: #fff7ed;
          border: 1px solid #ffedd5;
          padding: 6px 12px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #c2410c;
          margin-bottom: 1rem;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .modal-icon-bubble {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: rgba(249, 115, 22, 0.1);
          display: grid;
          place-items: center;
          margin: 0 auto 1rem;
        }

        .modal-icon-bubble.green {
          background: rgba(37, 211, 102, 0.12);
        }

        .modal-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          text-align: center;
          margin-bottom: 0.35rem;
        }

        .modal-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          text-align: center;
          line-height: 1.45;
          margin-bottom: 1.5rem;
        }

        .modal-alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 0.82rem;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1.25rem;
        }

        .modal-actions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .modal-divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin: 6px 0;
        }

        .modal-divider::before,
        .modal-divider::after {
          content: "";
          flex: 1;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-divider span {
          padding: 0 10px;
        }

        .btn-outline-action {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-outline-action:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
        }

        .form-field label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
        }

        .form-field input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.92rem;
          outline: none;
          transition: border-color 0.15s;
        }

        .form-field input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
        }

        .phone-input-wrap {
          display: flex;
          align-items: center;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }

        .phone-input-wrap:focus-within {
          border-color: #25D366;
          box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.15);
        }

        .phone-prefix {
          padding: 10px 12px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          font-size: 0.88rem;
          font-weight: 600;
          color: #334155;
          white-space: nowrap;
        }

        .phone-input-wrap input {
          border: none;
          border-radius: 0;
          box-shadow: none !important;
        }

        .field-hint {
          font-size: 0.72rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        .btn-primary-action {
          width: 100%;
          padding: 11px;
          border-radius: 8px;
          border: none;
          background: #f97316;
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
          margin-top: 4px;
        }

        .btn-primary-action:hover {
          background: #ea580c;
        }

        .btn-wa-submit {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: none;
          background: #25D366;
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
          transition: background 0.15s;
          margin-top: 4px;
        }

        .btn-wa-submit:hover {
          background: #1eb954;
        }

        .btn-text-action {
          background: none;
          border: none;
          color: #64748b;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 4px;
        }

        .btn-text-action:hover {
          color: #0f172a;
        }

        .modal-footer-note {
          margin-top: 1.25rem;
          font-size: 0.82rem;
          color: #64748b;
          text-align: center;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
