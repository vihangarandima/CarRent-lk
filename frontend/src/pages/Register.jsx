import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Car,
  Coins,
  Building2,
  Eye,
  EyeOff,
  Mail,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { API_URL } from "../config";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
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

  const handleStep1Continue = () => {
    setError("");
    if (primaryGoal === "rent") {
      // Renters go directly to form (Step 3)
      setStep(3);
    } else {
      // Listers go to Lister Category Selection (Step 2)
      setStep(2);
    }
  };

  const handleStep2Continue = () => {
    setError("");
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
      if (res.data.company) {
        res.data.user.companyId = res.data.company.id;
        localStorage.setItem("company", JSON.stringify(res.data.company));
      }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const redirectParam = queryParams.get("redirect");
      const targetPath = redirectParam || "/home";
      navigate(targetPath);
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.msg || "OTP validation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone.trim()) {
      setError("Mobile phone number is required to create an account.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match! Please check and try again.");
      return;
    }

    if (formData.role === "company" && !formData.companyName.trim()) {
      setError("Please enter your official Rent-A-Car Company Name.");
      return;
    }

    // Trigger Send OTP
    setSendingOtp(true);
    setError("");
    try {
      await axios.post(`${API_URL}/api/auth/send-otp`, {
        email: formData.email,
      });
      setShowOtpModal(true);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to send OTP code.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const res = await axios.post(`${API_URL}/api/auth/firebase-login`, {
        name: user.displayName,
        email: user.email,
        firebaseId: user.uid,
        role: formData.role,
        companyName: formData.companyName,
        phone: formData.phone,
        address: formData.address,
      });

      if (res.data.company) {
        res.data.user.companyId = res.data.company.id;
        localStorage.setItem("company", JSON.stringify(res.data.company));
      }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const redirectParam = queryParams.get("redirect");
      const targetPath = redirectParam || "/home";
      navigate(targetPath);
      window.location.reload();
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google sign-up failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-card fade-in ${step < 3 ? "auth-card-wide" : ""}`}>
        {/* Brand Header */}
        <div className="auth-header">
          <Link to="/" className="brand-logo">
            <div className="logo-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <polyline points="17 11 19 13 23 9"></polyline>
              </svg>
            </div>
            <span className="logo-text">
              Yamu<span> Car Rentals</span>
            </span>
          </Link>

          {step === 1 && (
            <div>
              <span className="step-indicator-pill">Step 1 of 2</span>
              <h1>What do you want to do today?</h1>
              <p>Tick the card below to get started on Yamu Car Rentals</p>
            </div>
          )}

          {step === 2 && (
            <div>
              <span className="step-indicator-pill">Step 2 of 3</span>
              <h1>What type of lister are you?</h1>
              <p>Tick your category so we can set up your correct listing dashboard</p>
            </div>
          )}

          {step === 3 && (
            <div>
              <span className="step-indicator-pill">Final Step</span>
              <h1>Create Your Account</h1>
              <p>Enter your details below to finish creating your account</p>
            </div>
          )}
        </div>

        {error && (
          <div className="form-error-alert animate-in">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* STEP 1: ONLY 2 OPTIONS — RENT vs LIST */}
        {step === 1 && (
          <div className="step-flow-wrapper">
            <div className="two-cards-grid">
              
              {/* Option 1: Rent a Car */}
              <div
                className={`step-tick-card ${
                  primaryGoal === "rent" ? "ticked-orange" : ""
                }`}
                onClick={() => setPrimaryGoal("rent")}
              >
                <div className="card-top-row">
                  <div className="icon-box box-orange">
                    <Car size={32} />
                  </div>
                  {primaryGoal === "rent" ? (
                    <span className="ticked-badge badge-orange">
                      <CheckCircle2 size={14} /> Ticked
                    </span>
                  ) : (
                    <span className="unticked-circle" />
                  )}
                </div>

                <h3>Rent a Car</h3>
                <span className="role-sub-tag">CUSTOMER</span>
                <p>
                  I want to browse, search, and rent verified cars, SUVs, or vans across Sri Lanka.
                </p>
              </div>

              {/* Option 2: List Vehicle(s) */}
              <div
                className={`step-tick-card ${
                  primaryGoal === "list" ? "ticked-green" : ""
                }`}
                onClick={() => setPrimaryGoal("list")}
              >
                <div className="card-top-row">
                  <div className="icon-box box-green">
                    <Coins size={32} />
                  </div>
                  {primaryGoal === "list" ? (
                    <span className="ticked-badge badge-green">
                      <CheckCircle2 size={14} /> Ticked
                    </span>
                  ) : (
                    <span className="unticked-circle" />
                  )}
                </div>

                <h3>List Vehicle(s)</h3>
                <span className="role-sub-tag">CAR LISTER</span>
                <p>
                  I own personal car(s) or operate a rent-a-car business and want to earn by listing vehicles.
                </p>
              </div>

            </div>

            <div className="step-footer-action">
              <button
                type="button"
                className="btn-continue-step"
                onClick={handleStep1Continue}
              >
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LISTER TYPE SELECTION (Only reached if List Vehicle(s) is ticked) */}
        {step === 2 && (
          <div className="step-flow-wrapper">
            <div className="two-cards-grid">
              
              {/* Lister Option 1: Personal Car Owner */}
              <div
                className={`step-tick-card ${
                  listerType === "owner" ? "ticked-green" : ""
                }`}
                onClick={() => setListerType("owner")}
              >
                <div className="card-top-row">
                  <div className="icon-box box-green">
                    <Coins size={32} />
                  </div>
                  {listerType === "owner" ? (
                    <span className="ticked-badge badge-green">
                      <CheckCircle2 size={14} /> Ticked
                    </span>
                  ) : (
                    <span className="unticked-circle" />
                  )}
                </div>

                <h3>Personal Car Owner</h3>
                <span className="role-sub-tag">1-2 PERSONAL CARS</span>
                <p>
                  I am a private individual renting out my personal 1-2 cars to earn extra passive income.
                </p>
              </div>

              {/* Lister Option 2: Rent-A-Car Service Owner */}
              <div
                className={`step-tick-card ${
                  listerType === "company" ? "ticked-blue" : ""
                }`}
                onClick={() => setListerType("company")}
              >
                <div className="card-top-row">
                  <div className="icon-box box-blue">
                    <Building2 size={32} />
                  </div>
                  {listerType === "company" ? (
                    <span className="ticked-badge badge-blue">
                      <CheckCircle2 size={14} /> Ticked
                    </span>
                  ) : (
                    <span className="unticked-circle" />
                  )}
                </div>

                <h3>Rent-A-Car Service Owner</h3>
                <span className="role-sub-tag">COMMERCIAL FLEET</span>
                <p>
                  I run a commercial car rental business and require a dedicated fleet dashboard & bulk tool.
                </p>
              </div>

            </div>

            <div className="step-footer-action-dual">
              <button
                type="button"
                className="btn-back-step"
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                className="btn-continue-step"
                onClick={handleStep2Continue}
              >
                <span>Continue to Enter Details</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REGISTRATION FORM */}
        {step === 3 && (
          <div className="step3-form-wrapper">

            {/* Path indicator bar */}
            <div className="ticked-role-bar">
              <div className="ticked-role-meta">
                <span className="ticked-lbl">SIGNING UP AS:</span>
                {formData.role === "renter" && (
                  <span className="ticked-pill p-orange">
                    <Car size={13} /> Renter / Customer
                  </span>
                )}
                {formData.role === "owner" && (
                  <span className="ticked-pill p-green">
                    <Coins size={13} /> Personal Car Owner
                  </span>
                )}
                {formData.role === "company" && (
                  <span className="ticked-pill p-blue">
                    <Building2 size={13} /> Rent-A-Car Service Partner
                  </span>
                )}
              </div>

              <button
                type="button"
                className="btn-change-role-step"
                onClick={() => setStep(primaryGoal === "list" ? 2 : 1)}
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            </div>

            {/* Google Authentication Button */}
            <div className="google-btn-wrap">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="btn-google-auth"
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.56 2.69-3.86 2.69-6.6z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.95v2.3A9 9 0 0 0 9 18z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.96 10.69A5.4 5.4 0 0 1 3.6 9c0-.59.1-1.17.29-1.69V5.01H.95A8.99 8.99 0 0 0 0 9c0 1.45.35 2.82.95 4.02l3.01-2.33z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.22A8.99 8.99 0 0 0 9 0 9 9 0 0 0 .95 5.01l3.01 2.33C4.67 5.16 6.66 3.58 9 3.58z"
                  />
                </svg>
                <span style={{ marginLeft: "10px" }}>Continue with Google</span>
              </button>
            </div>

            <div className="auth-divider">
              <span>OR ENTER DETAILS BELOW</span>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label>FULL NAME *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Saman Kumara"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>EMAIL ADDRESS *</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>MOBILE PHONE NUMBER *</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+94 77 123 4567"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>PASSWORD *</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>CONFIRM PASSWORD *</label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Extra business fields required ONLY for Rent-A-Car Service Owner */}
              {formData.role === "company" && (
                <div className="company-extra-fields">
                  <div className="company-section-title">
                    <Building2 size={16} color="#ea580c" />
                    <span>RENT-A-CAR BUSINESS DETAILS</span>
                  </div>

                  <div className="input-group">
                    <label>RENT-A-CAR COMPANY NAME *</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="e.g. Colombo Car Rentals (Pvt) Ltd"
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>BUSINESS PHONE NUMBER</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+94 77 XXX XXXX"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>OPERATING ADDRESS / CITY</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Colombo 03, Western Province"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button className="btn-register" type="submit" disabled={loading}>
                {loading
                  ? "Processing..."
                  : sendingOtp
                  ? "Sending Code..."
                  : "Verify & Create Account"}
                {!loading && <span className="arrow">→</span>}
              </button>
            </form>
          </div>
        )}

        {/* OTP VERIFICATION OVERLAY MODAL */}
        {showOtpModal && (
          <div className="otp-overlay">
            <div className="otp-modal animate-in">
              <div className="otp-header">
                <div className="mail-icon-badge">
                  <Mail size={28} color="#f97316" />
                </div>
                <h3>Verify Your Email</h3>
                <p>
                  We've sent a 6-digit verification code to{" "}
                  <strong>{formData.email}</strong>
                </p>
              </div>
              <form onSubmit={handleVerifyOtp}>
                <div className="otp-inputs">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (isNaN(val)) return;
                        const newOtp = [...otpCode];
                        newOtp[idx] = val.substring(val.length - 1);
                        setOtpCode(newOtp);
                        if (val && idx < 5) {
                          document.getElementById(`otp-${idx + 1}`).focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otpCode[idx] && idx > 0) {
                          document.getElementById(`otp-${idx - 1}`).focus();
                        }
                      }}
                    />
                  ))}
                </div>
                {error && <p className="otp-error-msg">⚠️ {error}</p>}
                <div className="otp-actions">
                  <button
                    type="submit"
                    className="btn-verify"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify & Complete Signup"}
                  </button>
                  <button
                    type="button"
                    className="btn-otp-cancel"
                    onClick={() => setShowOtpModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          padding: 100px 20px 40px;
          font-family: var(--font-body, 'Plus Jakarta Sans', 'Poppins', sans-serif);
        }

        .auth-card {
          width: 100%;
          max-width: 500px;
          background: #FFFFFF;
          border-radius: 2rem;
          padding: 2.75rem 2.5rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
          border: 1px solid #F1F5F9;
          transition: max-width 0.3s ease;
        }

        .auth-card-wide {
          max-width: 720px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .brand-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 1.25rem;
        }

        .logo-icon {
          background: #f97316;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text { font-size: 1.4rem; font-weight: 800; color: #111827; letter-spacing: -0.5px; }
        .logo-text span { color: #f97316; }

        .step-indicator-pill {
          background: #fff7ed;
          color: #ea580c;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 100px;
          display: inline-block;
          margin-bottom: 0.5rem;
          border: 1px solid rgba(249, 115, 22, 0.2);
          letter-spacing: 0.04em;
        }

        .auth-header h1 { font-size: 1.85rem; font-weight: 900; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.02em; }
        .auth-header p { color: #64748b; font-size: 0.95rem; margin: 0; }

        /* TWO CARDS GRID FOR STEP 1 & STEP 2 */
        .two-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .step-tick-card {
          background: #f8fafc;
          border: 2.5px solid #e2e8f0;
          border-radius: 24px;
          padding: 1.85rem 1.5rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .step-tick-card:hover {
          transform: translateY(-4px);
          background: #ffffff;
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.07);
        }

        .card-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .icon-box {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .box-orange { background: #fff7ed; color: #ea580c; border: 1.5px solid rgba(249, 115, 22, 0.25); }
        .box-green { background: #f0fdf4; color: #16a34a; border: 1.5px solid rgba(22, 163, 74, 0.25); }
        .box-blue { background: #eff6ff; color: #2563eb; border: 1.5px solid rgba(37, 99, 235, 0.25); }

        .unticked-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
        }

        .ticked-badge {
          font-size: 0.75rem;
          font-weight: 800;
          padding: 5px 12px;
          border-radius: 100px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .badge-orange { background: #ea580c; color: white; }
        .badge-green { background: #16a34a; color: white; }
        .badge-blue { background: #2563eb; color: white; }

        .ticked-orange {
          background: #ffffff;
          border-color: #ea580c;
          box-shadow: 0 14px 35px rgba(234, 88, 12, 0.18);
        }

        .ticked-green {
          background: #ffffff;
          border-color: #16a34a;
          box-shadow: 0 14px 35px rgba(22, 163, 74, 0.18);
        }

        .ticked-blue {
          background: #ffffff;
          border-color: #2563eb;
          box-shadow: 0 14px 35px rgba(37, 99, 235, 0.18);
        }

        .step-tick-card h3 {
          font-size: 1.35rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .role-sub-tag {
          font-size: 0.72rem;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.05em;
          margin-bottom: 0.85rem;
          display: block;
        }

        .step-tick-card p {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        .step-footer-action {
          display: flex;
          justify-content: center;
        }

        .step-footer-action-dual {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .btn-back-step {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 0.85rem 1.6rem;
          border-radius: 100px;
          font-weight: 800;
          font-size: 0.92rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .btn-back-step:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .btn-continue-step {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          padding: 1rem 2.6rem;
          border-radius: 100px;
          font-weight: 800;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3);
          transition: all 0.25s ease;
          font-family: inherit;
        }

        .btn-continue-step:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(249, 115, 22, 0.4);
        }

        /* STEP 3 FORM STYLING */
        .ticked-role-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          padding: 10px 16px;
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }

        .ticked-role-meta {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ticked-lbl {
          font-size: 0.7rem;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.04em;
        }

        .ticked-pill {
          font-size: 0.8rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 100px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .p-orange { background: #fff7ed; color: #ea580c; border: 1px solid rgba(249, 115, 22, 0.2); }
        .p-green { background: #f0fdf4; color: #16a34a; border: 1px solid rgba(22, 163, 74, 0.2); }
        .p-blue { background: #eff6ff; color: #2563eb; border: 1px solid rgba(37, 99, 235, 0.2); }

        .btn-change-role-step {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 100px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .btn-change-role-step:hover { background: #f1f5f9; color: #0f172a; }

        .google-btn-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .btn-google-auth {
          width: 100%;
          background: #FFFFFF;
          border: 1.5px solid #E5E7EB;
          color: #374151;
          padding: 12px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn-google-auth:hover { background: #F9FAFB; border-color: #fed7aa; }

        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.25rem 0;
          color: #9CA3AF;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .auth-divider::before, .auth-divider::after { content: ''; flex: 1; border-bottom: 1px solid #F1F5F9; }
        .auth-divider:not(:empty)::before { margin-right: .75em; }
        .auth-divider:not(:empty)::after { margin-left: .75em; }

        .auth-form { display: flex; flex-direction: column; gap: 1.15rem; }

        .input-group label { display: block; font-size: 11px; font-weight: 800; color: #9CA3AF; margin-bottom: 6px; letter-spacing: 0.05em; }

        .input-wrapper { position: relative; }

        .input-wrapper input {
          width: 100%;
          padding: 12px 18px;
          border-radius: 14px;
          border: 1.5px solid #E2E8F0;
          background: #F8FAFC;
          font-size: 0.95rem;
          box-sizing: border-box;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: #f97316;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
        }

        .password-toggle-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: #9CA3AF; cursor: pointer;
        }

        .company-extra-fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.25rem;
          background: #fff7ed;
          border-radius: 1.25rem;
          border: 1.5px dashed #fed7aa;
          margin-top: 0.5rem;
        }

        .company-section-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 800;
          color: #ea580c;
        }

        .btn-register {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          padding: 15px;
          border-radius: 100px;
          font-weight: 800;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 8px;
          box-shadow: 0 10px 20px rgba(249, 115, 22, 0.25);
          font-family: inherit;
        }

        .btn-register:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(249, 115, 22, 0.35); }

        .form-error-alert {
          background: #FEF2F2;
          border: 1.5px solid #FCA5A5;
          border-radius: 14px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.25rem;
          color: #991B1B;
          font-size: 0.88rem;
          font-weight: 600;
        }

        .form-error-alert p { margin: 0; }

        .auth-footer { margin-top: 2rem; text-align: center; border-top: 1px solid #F1F5F9; padding-top: 1.5rem; }
        .auth-footer p { color: #64748B; font-size: 0.9rem; }
        .auth-footer a { color: #f97316; font-weight: 700; text-decoration: none; margin-left: 4px; }

        /* OTP Modal */
        .otp-overlay {
          position: fixed; inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
        }
        .otp-modal {
          background: white; border-radius: 24px; padding: 40px;
          max-width: 440px; width: 90%; text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .mail-icon-badge { font-size: 32px; background: #fff7ed; width: 64px; height: 64px; border-radius: 50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; }
        .otp-inputs { display:flex; gap:12px; justify-content:center; margin-bottom:24px; }
        .otp-inputs input { width:48px; height:56px; border-radius:12px; border:2px solid #E2E8F0; font-size:24px; font-weight:800; text-align:center; outline:none; }
        .otp-inputs input:focus { border-color:#f97316; background:white; }
        .btn-verify { width:100%; background:#f97316; color:white; font-weight:700; padding:14px; border-radius:100px; border:none; font-size:15px; cursor:pointer; }
        .btn-otp-cancel { background:none; border:none; color:#64748B; font-weight:700; font-size:14px; cursor:pointer; margin-top: 10px; }

        @media (max-width: 768px) {
          .two-cards-grid { grid-template-columns: 1fr; }
          .auth-card-wide { max-width: 500px; }
        }
      `}</style>
    </div>
  );
};

export default Register;
