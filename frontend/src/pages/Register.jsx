import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { Car, KeyRound, Building2, Eye, EyeOff, ArrowLeft, ChevronRight, MailCheck } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import GoogleButton from "../components/GoogleButton";

const ACCOUNT_TYPES = [
  {
    role: "renter",
    icon: Car,
    title: "I want to rent a vehicle",
    desc: "Find bikes, tuk-tuks, cars and vans and contact owners directly.",
  },
  {
    role: "owner",
    icon: KeyRound,
    title: "I want to list my own vehicle",
    desc: "For individuals renting out one or two personal vehicles.",
  },
  {
    role: "company",
    icon: Building2,
    title: "I run a rent-a-car company",
    desc: "Manage your whole fleet and rentals from one dashboard.",
  },
];
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { API_URL } from "../config";
import { getStoredUser, homePathFor, saveSession } from "../utils/session";

// Only allow in-app redirects (no "//evil.com" or absolute URLs)
const safeRedirect = (value) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : null;

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(homePathFor(getStoredUser()), { replace: true });
    }
  }, [navigate]);

  // Parsing the search query parameter
  const queryParams = new URLSearchParams(location.search);
  const urlRole = queryParams.get("role");

  // Step state:
  // Step 1: Primary goal (Rent vs List)
  // Step 2: Lister type (Personal Host vs Rent-A-Car Service) [Only for Lister path]
  // Step 3: Registration Form Input
  const [step, setStep] = useState(() => (urlRole ? 3 : 1));
  const [primaryGoal, setPrimaryGoal] = useState(() =>
    urlRole === "company" || urlRole === "owner" ? "list" : "rent"
  );
  const [listerType, setListerType] = useState(() =>
    urlRole === "company" ? "company" : "owner"
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "renter",
    companyName: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Countdown before the "Resend code" button unlocks
  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // Accepts typing or pasting; spreads digits across the 6 boxes
  const fillOtpFrom = (startIdx, rawValue) => {
    const digits = String(rawValue).replace(/\D/g, "");
    const newOtp = [...otpCode];
    if (!digits) {
      newOtp[startIdx] = "";
      setOtpCode(newOtp);
      return;
    }
    let idx = startIdx;
    for (const d of digits) {
      if (idx > 5) break;
      newOtp[idx] = d;
      idx += 1;
    }
    setOtpCode(newOtp);
    document.getElementById(`otp-${Math.min(idx, 5)}`)?.focus();
  };

  const sendOtp = async () => {
    setSendingOtp(true);
    setError("");
    try {
      await axios.post(`${API_URL}/api/auth/send-otp`, {
        email: formData.email,
      });
      setOtpCode(["", "", "", "", "", ""]);
      setShowOtpModal(true);
      setResendIn(30);
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to send OTP code. Please check your connection and try again.");
      return false;
    } finally {
      setSendingOtp(false);
    }
  };

  // Sync role with primaryGoal and listerType
  useEffect(() => {
    let resolvedRole = "renter";
    if (primaryGoal === "list") {
      resolvedRole = listerType === "company" ? "company" : "owner";
    }
    setFormData((prev) => ({ ...prev, role: resolvedRole }));
  }, [primaryGoal, listerType]);

  useEffect(() => {
    if (urlRole && ["renter", "owner", "company"].includes(urlRole)) {
      if (urlRole === "company") {
        setPrimaryGoal("list");
        setListerType("company");
      } else if (urlRole === "owner") {
        setPrimaryGoal("list");
        setListerType("owner");
      } else {
        setPrimaryGoal("rent");
      }
      setStep(3);
    }
  }, [urlRole]);

  // Step 1 picks the account type, step 3 is the form
  const chooseRole = (role) => {
    setError("");
    setPrimaryGoal(role === "renter" ? "rent" : "list");
    if (role !== "renter") setListerType(role);
    setStep(3);
  };

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otpCode.join("");
    if (enteredOtp.length < 6) {
      setError("Please enter all 6 digits of the OTP code.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        ...formData,
        otp: enteredOtp,
      });
      finishSignUp(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || "OTP validation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Listers go straight to their dashboard, renters to the marketplace
  const finishSignUp = (data) => {
    const user = saveSession(data);
    window.location.href = safeRedirect(queryParams.get("redirect")) || homePathFor(user);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone.trim()) {
      setError("Mobile phone number is required to create an account.");
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length < 9 || phoneDigits.length > 12) {
      setError("Please enter a valid mobile number, e.g. 077 123 4567.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match. Please check and try again.");
      return;
    }

    if (formData.role === "company" && !formData.companyName.trim()) {
      setError("Please enter your company name.");
      return;
    }

    // Trigger Send OTP (guard against double taps, which would invalidate the first code)
    if (sendingOtp) return;
    await sendOtp();
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const idToken = await user.getIdToken();
      const res = await axios.post(`${API_URL}/api/auth/firebase-login`, {
        idToken,
        name: user.displayName,
        role: formData.role,
        companyName: formData.companyName,
        phone: formData.phone,
        address: formData.address,
      });

      finishSignUp(res.data);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        setError(err.response?.data?.msg || "Google sign-up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedType = ACCOUNT_TYPES.find((t) => t.role === formData.role) || ACCOUNT_TYPES[0];
  const SelectedIcon = selectedType.icon;

  // ── Verify email code ──
  if (showOtpModal) {
    return (
      <AuthLayout title="Check your email" subtitle={`We sent a 6-digit code to ${formData.email}.`}>
        <form onSubmit={handleVerifyOtp} className="auth-form">
          <div
            className="reg-otp"
            onPaste={(e) => {
              e.preventDefault();
              fillOtpFrom(0, e.clipboardData.getData("text"));
            }}
          >
            {otpCode.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                className="reg-otp-box"
                type="text"
                inputMode="numeric"
                autoComplete={idx === 0 ? "one-time-code" : "off"}
                autoFocus={idx === 0}
                maxLength={idx === 0 ? 6 : 1}
                value={digit}
                aria-label={`Digit ${idx + 1}`}
                onChange={(e) => {
                  const val = e.target.value;
                  fillOtpFrom(idx, val.length > 1 && digit ? val.replace(digit, "") : val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otpCode[idx] && idx > 0) {
                    document.getElementById(`otp-${idx - 1}`)?.focus();
                  }
                }}
              />
            ))}
          </div>

          {error && <div className="y-alert y-alert-error" role="alert">{error}</div>}

          <button type="submit" className="y-btn y-btn-primary y-btn-block" disabled={loading}>
            <MailCheck size={18} /> {loading ? "Verifying..." : "Verify & create account"}
          </button>

          <p className="auth-footer-text" style={{ marginTop: 0 }}>
            Didn't get it? Check your Spam folder, or{" "}
            <button
              type="button"
              className="auth-link"
              onClick={sendOtp}
              disabled={resendIn > 0 || sendingOtp}
              style={{ fontSize: "inherit", opacity: resendIn > 0 ? 0.6 : 1 }}
            >
              {sendingOtp ? "sending..." : resendIn > 0 ? `resend in ${resendIn}s` : "resend the code"}
            </button>
          </p>
          <button
            type="button"
            className="y-btn y-btn-outline y-btn-block"
            onClick={() => {
              setShowOtpModal(false);
              setError("");
            }}
          >
            <ArrowLeft size={16} /> Change details
          </button>
        </form>
        <style>{registerCSS}</style>
      </AuthLayout>
    );
  }

  // ── Step 1: choose account type ──
  if (step < 3) {
    return (
      <AuthLayout title="Create your account" subtitle="First, tell us what you'd like to do." wide>
        <div className="reg-types">
          {ACCOUNT_TYPES.map(({ role, icon: Icon, title, desc }) => (
            <button key={role} type="button" className="reg-type" onClick={() => chooseRole(role)}>
              <span className="reg-type-icon"><Icon size={22} /></span>
              <span className="reg-type-text">
                <strong>{title}</strong>
                <span>{desc}</span>
              </span>
              <ChevronRight size={20} className="reg-type-arrow" />
            </button>
          ))}
        </div>
        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        <style>{registerCSS}</style>
      </AuthLayout>
    );
  }

  // ── Step 2: details form ──
  const isLister = formData.role !== "renter";
  return (
    <AuthLayout
      title={isLister ? "Create your lister account" : "Create your account"}
      subtitle={isLister ? "You'll go straight to your dashboard after signing up." : "It takes less than a minute."}
    >
      <button
        type="button"
        className="reg-chosen"
        onClick={() => {
          setStep(1);
          setError("");
        }}
      >
        <span className="reg-type-icon reg-type-icon-sm"><SelectedIcon size={18} /></span>
        <span className="reg-chosen-text">{selectedType.title}</span>
        <span className="auth-link">Change</span>
      </button>

      <GoogleButton onClick={handleGoogleSignIn} disabled={loading || sendingOtp} label="Sign up with Google" />
      <div className="auth-divider">OR WITH EMAIL</div>

      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="y-alert y-alert-error" role="alert">{error}</div>}

        <div className="y-field">
          <label className="y-label" htmlFor="reg-name">Full name</label>
          <input id="reg-name" className="y-input" type="text" name="name" autoComplete="name"
            value={formData.name} onChange={handleChange} placeholder="Saman Kumara" required />
        </div>

        {formData.role === "company" && (
          <>
            <div className="y-field">
              <label className="y-label" htmlFor="reg-company">Company name</label>
              <input id="reg-company" className="y-input" type="text" name="companyName" autoComplete="organization"
                value={formData.companyName} onChange={handleChange} placeholder="e.g. Colombo Car Rentals" required />
            </div>
            <div className="y-field">
              <label className="y-label" htmlFor="reg-address">City</label>
              <input id="reg-address" className="y-input" type="text" name="address" autoComplete="address-level2"
                value={formData.address} onChange={handleChange} placeholder="e.g. Colombo 03" />
            </div>
          </>
        )}

        <div className="y-field">
          <label className="y-label" htmlFor="reg-email">Email address</label>
          <input id="reg-email" className="y-input" type="email" name="email" autoComplete="email"
            value={formData.email} onChange={handleChange} placeholder="name@example.com" required />
        </div>

        <div className="y-field">
          <label className="y-label" htmlFor="reg-phone">
            Mobile number{" "}
            {isLister && <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>(customers will WhatsApp you on this)</span>}
          </label>
          <input id="reg-phone" className="y-input" type="tel" name="phone" autoComplete="tel"
            value={formData.phone} onChange={handleChange} placeholder="077 123 4567" required />
        </div>

        <div className="y-field">
          <label className="y-label" htmlFor="reg-password">Password</label>
          <div className="auth-password">
            <input id="reg-password" className="y-input" type={showPassword ? "text" : "password"} name="password"
              autoComplete="new-password" value={formData.password} onChange={handleChange}
              placeholder="At least 6 characters" required />
            <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="y-field">
          <label className="y-label" htmlFor="reg-confirm">Confirm password</label>
          <div className="auth-password">
            <input id="reg-confirm" className="y-input" type={showConfirmPassword ? "text" : "password"} name="confirmPassword"
              autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange}
              placeholder="Type it again" required />
            <button type="button" className="auth-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button className="y-btn y-btn-primary y-btn-block" type="submit" disabled={loading || sendingOtp}>
          {sendingOtp ? "Sending code..." : "Continue"}
        </button>
        <p style={{ fontSize: "0.8rem", textAlign: "center" }}>We'll email you a 6-digit code to confirm it's you.</p>
      </form>

      <p className="auth-footer-text">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
      <style>{registerCSS}</style>
    </AuthLayout>
  );
};

const registerCSS = `
  .reg-types { display: flex; flex-direction: column; gap: 0.75rem; }
  .reg-type {
    display: flex; align-items: center; gap: 1rem; width: 100%; text-align: left;
    padding: 1.1rem 1.25rem; background: #fff; border: 1.5px solid var(--border);
    border-radius: var(--radius); transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  }
  .reg-type:hover { border-color: var(--primary); box-shadow: var(--shadow-card-hover); transform: translateY(-2px); }
  .reg-type-icon {
    width: 48px; height: 48px; flex-shrink: 0; border-radius: 14px;
    display: grid; place-items: center; background: var(--primary-soft); color: var(--primary-dark);
  }
  .reg-type-icon-sm { width: 36px; height: 36px; border-radius: 10px; }
  .reg-type-text { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
  .reg-type-text strong { font-size: 1rem; color: var(--text); }
  .reg-type-text span { font-size: 0.88rem; color: var(--text-muted); line-height: 1.45; }
  .reg-type-arrow { color: var(--text-hint); flex-shrink: 0; }
  .reg-type:hover .reg-type-arrow { color: var(--primary); }
  .reg-chosen {
    display: flex; align-items: center; gap: 0.75rem; width: 100%; text-align: left;
    padding: 0.6rem 0.9rem; margin-bottom: 1.25rem;
    background: var(--primary-soft); border: 1px solid rgba(249, 115, 22, 0.25); border-radius: var(--radius-sm);
  }
  .reg-chosen-text { flex: 1; font-weight: 700; font-size: 0.92rem; color: var(--text); }
  .reg-otp { display: flex; gap: 0.5rem; justify-content: space-between; }
  .reg-otp-box {
    width: 100%; max-width: 56px; aspect-ratio: 1 / 1.15; text-align: center; padding: 0;
    font-size: 1.5rem; font-weight: 800; font-family: var(--font-display);
    border: 1.5px solid var(--border); border-radius: var(--radius-sm); background: #fff; color: var(--text);
    outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .reg-otp-box:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.12); }
`;

export default Register;
