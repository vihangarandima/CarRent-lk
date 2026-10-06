import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { API_URL } from "../config";
import { useToast } from "../context/ToastContext";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import GoogleButton from "../components/GoogleButton";
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
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    navigate(redirectTo || homePathFor(user), { replace: true });
  };

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
      setError(
        err.response?.data?.msg === "Invalid Credentials"
          ? "Wrong email or password. Please try again."
          : err.response?.data?.msg || "Couldn't sign in. Please check your connection and try again."
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
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        setError(err.response?.data?.msg || "Google sign-in failed. Please try again.");
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
    <AuthLayout title="Welcome back" subtitle="Sign in to your Yamu Car Rentals account.">
      {sessionExpired && (
        <div className="y-alert y-alert-info" style={{ marginBottom: "1rem" }}>
          Your session has expired. Please sign in again.
        </div>
      )}

      {resetOpen ? (
        <form onSubmit={handleResetPassword} className="auth-form">
          <div className="y-alert y-alert-info">
            {forgotMsg || `We sent a 6-digit code to ${formData.email}.`}
          </div>
          <div className="y-field">
            <label className="y-label" htmlFor="reset-code">Reset code</label>
            <input
              id="reset-code"
              className="y-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit code"
              required
            />
          </div>
          <div className="y-field">
            <label className="y-label" htmlFor="reset-password">New password</label>
            <input
              id="reset-password"
              className="y-input"
              type="password"
              autoComplete="new-password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </div>
          <button className="y-btn y-btn-primary y-btn-block" type="submit" disabled={resetLoading}>
            {resetLoading ? "Saving..." : "Set new password"}
          </button>
          <button
            type="button"
            className="y-btn y-btn-outline y-btn-block"
            onClick={() => { setResetOpen(false); setForgotMsg(""); }}
          >
            Back to sign in
          </button>
        </form>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="y-alert y-alert-error" role="alert">{error}</div>}
            {forgotMsg && <div className="y-alert y-alert-info">{forgotMsg}</div>}

            <div className="y-field">
              <label className="y-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                className="y-input"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="y-field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="y-label" htmlFor="login-password">Password</label>
                <button type="button" className="auth-link" onClick={handleForgotPassword} disabled={resetLoading}>
                  {resetLoading ? "Sending code..." : "Forgot password?"}
                </button>
              </div>
              <div className="auth-password">
                <input
                  id="login-password"
                  className="y-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="y-btn y-btn-primary y-btn-block" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="auth-divider">OR</div>
          <GoogleButton onClick={handleGoogleSignIn} disabled={loading} />

          <p className="auth-footer-text">
            New to Yamu Car Rentals?{" "}
            <Link to={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"}>
              Create an account
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
};

export default Login;
