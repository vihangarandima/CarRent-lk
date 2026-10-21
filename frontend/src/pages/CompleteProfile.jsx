import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, LogOut } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { API_URL } from "../config";
import { getStoredUser, homePathFor, logout, saveSession } from "../utils/session";
import { ACCOUNT_TYPES, profileError } from "../utils/profile";

// Only allow in-app redirects (no "//evil.com" or absolute URLs)
const safeRedirect = (value) =>
  value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/complete-profile")
    ? value
    : null;

// Shown once after sign-in to anyone missing a role or required details
// (typically Google sign-ups, and older accounts created before these were required).
const CompleteProfile = () => {
  const location = useLocation();
  const stored = getStoredUser() || {};
  const needsRole = Boolean(stored.needsRole);

  const [role, setRole] = useState(needsRole ? "" : stored.role);
  const [form, setForm] = useState({
    phone: stored.phone || "",
    address: stored.address || "",
    nic: stored.nic || "",
    companyName: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isLister = role === "owner" || role === "company";

  if (!localStorage.getItem("token")) return <Navigate to="/login" replace />;

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (needsRole && !role) {
      setError("Please choose how you'll use Yamu.");
      return;
    }
    if (needsRole && role === "company" && !form.companyName.trim()) {
      setError("Please enter your company name.");
      return;
    }
    const problem = profileError(form);
    if (problem) {
      setError(problem);
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/complete-profile`, {
        ...form,
        ...(needsRole ? { role } : {}),
      });
      const user = saveSession(res.data);
      const redirect = safeRedirect(new URLSearchParams(location.search).get("redirect"));
      window.location.href = redirect || homePathFor(user);
    } catch (err) {
      setError(err.response?.data?.msg || "Could not save your details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthLayout
      title={`Welcome${stored.name ? `, ${stored.name.split(" ")[0]}` : ""}!`}
      subtitle={
        needsRole
          ? "One last step: tell us how you'll use Yamu and add your contact details."
          : "Please add the details below to finish setting up your account."
      }
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {needsRole && (
          <fieldset className="cp-roles">
            <legend className="y-label">I want to…</legend>
            {ACCOUNT_TYPES.map(({ role: value, icon: Icon, title }) => (
              <label key={value} className={`cp-role ${role === value ? "on" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={role === value}
                  onChange={() => {
                    setError("");
                    setRole(value);
                  }}
                />
                <span className="cp-role-icon"><Icon size={18} /></span>
                <span className="cp-role-title">{title.replace(/^I want to |^I /, "")}</span>
                {role === value && <CheckCircle2 size={18} className="cp-role-check" />}
              </label>
            ))}
          </fieldset>
        )}

        {needsRole && role === "company" && (
          <div className="y-field">
            <label className="y-label" htmlFor="cp-company">Company name</label>
            <input id="cp-company" className="y-input" type="text" name="companyName" autoComplete="organization"
              value={form.companyName} onChange={handleChange} placeholder="e.g. Colombo Car Rentals" />
          </div>
        )}

        <div className="y-field">
          <label className="y-label" htmlFor="cp-phone">
            Mobile number{" "}
            {isLister && <span className="cp-hint">(customers will WhatsApp you on this)</span>}
          </label>
          <input id="cp-phone" className="y-input" type="tel" name="phone" autoComplete="tel" inputMode="tel"
            value={form.phone} onChange={handleChange} placeholder="077 123 4567" />
        </div>

        <div className="y-field">
          <label className="y-label" htmlFor="cp-address">Address</label>
          <input id="cp-address" className="y-input" type="text" name="address" autoComplete="street-address"
            value={form.address} onChange={handleChange} placeholder="No. 12, Galle Road, Colombo 03" />
        </div>

        <div className="y-field">
          <label className="y-label" htmlFor="cp-nic">
            NIC number <span className="cp-hint">(or passport number for visitors)</span>
          </label>
          <input id="cp-nic" className="y-input" type="text" name="nic" autoComplete="off"
            value={form.nic} onChange={handleChange} placeholder="199012345678 or 901234567V" />
        </div>

        {error && <div className="y-alert y-alert-error" role="alert">{error}</div>}

        <button className="y-btn y-btn-primary y-btn-block" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save and continue"}
        </button>
        <p className="cp-note">Only Yamu and the people you rent with see these details.</p>
      </form>

      <button type="button" className="cp-signout" onClick={logout}>
        <LogOut size={15} /> Not you? Sign out
      </button>

      <style>{`
        .cp-roles { border: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
        .cp-roles legend { margin-bottom: 0.5rem; }
        .cp-role {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0.9rem;
          border: 1.5px solid var(--border); border-radius: var(--radius-sm); background: #fff;
          cursor: pointer; transition: border-color 0.2s ease, background 0.2s ease;
        }
        .cp-role:hover { border-color: rgba(249, 115, 22, 0.5); }
        .cp-role.on { border-color: var(--primary); background: var(--primary-soft); }
        .cp-role input { position: absolute; opacity: 0; pointer-events: none; }
        .cp-role:focus-within { box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.18); }
        .cp-role-icon {
          width: 34px; height: 34px; flex-shrink: 0; border-radius: 10px;
          display: grid; place-items: center; background: var(--primary-soft); color: var(--primary-dark);
        }
        .cp-role.on .cp-role-icon { background: #fff; }
        .cp-role-title { flex: 1; font-weight: 700; font-size: 0.92rem; color: var(--text); }
        .cp-role-title::first-letter { text-transform: uppercase; }
        .cp-role-check { color: var(--primary); flex-shrink: 0; }
        .cp-hint { font-weight: 500; color: var(--text-muted); }
        .cp-note { font-size: 0.8rem; text-align: center; color: var(--text-muted); margin: 0; }
        .cp-signout {
          display: flex; align-items: center; justify-content: center; gap: 6px; margin: 1rem auto 0;
          background: none; border: none; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; cursor: pointer;
        }
        .cp-signout:hover { color: var(--primary); }
      `}</style>
    </AuthLayout>
  );
};

export default CompleteProfile;
