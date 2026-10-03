import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { API_URL } from "../config";
import { useToast } from "../context/ToastContext";
import logo from "../assets/images/logo.png";
import { getStoredUser, homePathFor, saveSession } from "../utils/session";

// Only allow in-app redirects (no "//evil.com" or absolute URLs)
const safeRedirect = (value) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : null;

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const params = new URLSearchParams(location.search);
  const redirectTo = safeRedirect(params.get("redirect"));
  const sessionExpired = params.get("expired") === "1";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(redirectTo || homePathFor(getStoredUser()), { replace: true });
    }
  }, [navigate, redirectTo]);

  const finishSignIn = (data) => {
    const user = saveSession(data);
    // Full reload so the navbar and every page pick up the new session
    window.location.href = redirectTo || homePathFor(user);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setForgotMsg("");
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        formData,
      );
      toast.success("Welcome back!", "Signed In");
      finishSignIn(res.data);
    } catch (err) {
      toast.error(
        err.response?.data?.msg ||
          "Login failed. Please check your email and password.",
        "Sign In Error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setForgotMsg("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Send the verified Firebase ID token to the backend
      const idToken = await user.getIdToken();
      const res = await axios.post(`${API_URL}/api/auth/firebase-login`, {
        idToken,
        name: user.displayName,
      });

      toast.success(`Welcome, ${user.displayName || "there"}!`, "Google Sign In");
      finishSignIn(res.data);
    } catch (err) {
      console.error("Google login error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        toast.error(
          err.response?.data?.msg || "Google login failed: " + err.message,
          "Sign In Error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setForgotMsg("Please enter your email address above first, then click Forgot.");
      return;
    }
    setResetLoading(true);
    setForgotMsg("");
    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email: formData.email,
      });
      setResetOpen(true);
      setForgotMsg(res.data?.msg || "A reset code has been sent to your email.");
    } catch (err) {
      setForgotMsg(err.response?.data?.msg || "Could not send a reset code. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetPassword.length < 6) {
      setForgotMsg("New password must be at least 6 characters.");
      return;
    }
    setResetLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password`, {
        email: formData.email,
        otp: resetCode,
        password: resetPassword,
      });
      toast.success(res.data?.msg || "Password updated.", "Password Reset");
      setResetOpen(false);
      setResetCode("");
      setResetPassword("");
      setForgotMsg("");
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setForgotMsg(err.response?.data?.msg || "Could not reset password. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        {/* Logo matching the homepage header */}
        <div className="auth-header">
          <Link to="/" className="brand-logo">
            <img src={logo} alt="Yamu Car Rentals" style={{ width: 44, height: 44, objectFit: 'contain' }} />
            <span className="logo-text">
              Yamu<span> Car Rentals</span>
            </span>
          </Link>

          <div className="hero-badge-mini">
            <span className="sparkle">✦</span>
            <span>Welcome back to Yamu Car Rentals</span>
          </div>

          <h1>Sign in</h1>
          <p>Enter your details to access your dashboard</p>
        </div>

        {sessionExpired && (
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c", padding: "10px 14px", borderRadius: 10, fontSize: "0.85rem", marginBottom: "1rem", lineHeight: 1.4 }}>
            Your session has expired. Please sign in again.
          </div>
        )}

        {forgotMsg && (
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c", padding: "10px 14px", borderRadius: 10, fontSize: "0.85rem", marginBottom: "1rem", lineHeight: 1.4 }}>
            {forgotMsg}
          </div>
        )}

        {resetOpen && (
          <form onSubmit={handleResetPassword} className="auth-form" style={{ marginBottom: "1.5rem", padding: "16px", border: "1px solid #fed7aa", borderRadius: 16, background: "#fffaf5" }}>
            <div className="input-group">
              <label>RESET CODE (SENT TO {formData.email.toUpperCase()})</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit code"
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label>NEW PASSWORD</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>
            </div>
            <button className="btn-login" type="submit" disabled={resetLoading}>
              {resetLoading ? "Saving..." : "Set New Password"}
            </button>
            <button
              type="button"
              onClick={() => { setResetOpen(false); setForgotMsg(""); }}
              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", marginTop: 8, fontWeight: 600 }}
            >
              Cancel
            </button>
          </form>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>EMAIL ADDRESS</label>
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
            <div className="label-flex">
              <label>PASSWORD</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                id="forgot-link"
                disabled={resetLoading}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {resetLoading && !resetOpen ? "Sending..." : "Forgot?"}
              </button>
            </div>
            <div className="input-wrapper">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
            {!loading && <span className="arrow">→</span>}
          </button>
        </form>

        <div style={{ margin: "20px 0", textAlign: "center" }}>
          <p style={{ color: "#9CA3AF", fontSize: "14px" }}>OR</p>
          <div
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
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
        </div>

        <div className="auth-footer">
          <p>
            New to Yamu Car Rentals? <Link to="/register">Create an account</Link>
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
          padding: 20px;
          font-family: var(--font-body, 'Plus Jakarta Sans', 'Poppins', sans-serif);
          transition: background-color 0.3s ease;
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          background: #FFFFFF;
          border-radius: 2rem;
          padding: 3rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
          border: 1px solid #F1F5F9;
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
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.01);
          margin-bottom: 0.5rem;
        }

        .btn-google-auth:hover:not(:disabled) {
          background: #F9FAFB;
          border-color: #fed7aa;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.05);
          transform: translateY(-1px);
        }

        .btn-google-auth:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Logo and Header Styling */
        .auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .brand-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 2rem;
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

        .logo-text {
          font-size: 1.4rem;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.5px;
        }

        .logo-text span {
          color: #f97316;
        }

        .hero-badge-mini {
          background: #fff7ed;
          color: #f97316;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 1.5rem;
        }

        .auth-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
        }

        .auth-header p {
          color: #6B7280;
          font-size: 0.95rem;
        }

        /* Form Styling */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group label {
          display: block;
          font-size: 11px;
          font-weight: 800;
          color: #9CA3AF;
          margin-bottom: 8px;
          letter-spacing: 0.05em;
        }

        .label-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        #forgot-link {
          font-size: 11px;
          color: #f97316;
          font-weight: 700;
          text-decoration: none;
        }

        .input-wrapper input {
          width: 100%;
          padding: 14px 20px;
          border-radius: 14px;
          border: 1px solid #E5E7EB;
          background: #F9FAFB;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: #f97316;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
        }

        /* Button Styling */
        .btn-login {
          background: linear-gradient(135deg, #ff8800 0%, #f97316 45%, #ea580c 100%);
          color: white;
          padding: 16px;
          border-radius: 12px;
          font-weight: 750;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 24px -4px rgba(249, 115, 22, 0.45);
          width: 100%;
        }

        .btn-login:hover:not(:disabled) {
          background: linear-gradient(135deg, #ff9500 0%, #ea580c 100%);
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -4px rgba(234, 88, 12, 0.58);
        }

        .btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .arrow {
          font-size: 1.2rem;
          transition: transform 0.2s ease;
        }

        .btn-login:hover .arrow {
          transform: translateX(4px);
        }

        /* Footer Styling */
        .auth-footer {
          margin-top: 2rem;
          text-align: center;
          border-top: 1px solid #F1F5F9;
          padding-top: 1.5rem;
        }

        .auth-footer p {
          color: #6B7280;
          font-size: 0.9rem;
        }

        .auth-footer a {
          color: #f97316;
          font-weight: 700;
          text-decoration: none;
          margin-left: 4px;
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default Login;
