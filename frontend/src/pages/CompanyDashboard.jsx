import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { useToast } from "../context/ToastContext";
import { formatVehicleImageUrl, handleImageError } from "../utils/imageHelper";
import {
  DASHBOARD_PATH,
  getStoredUser,
  logout,
  setBrowsingAsCustomer,
  updateStoredUser,
} from "../utils/session";
import {
  Building2,
  Car,
  CarFront,
  CheckCircle,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Pause,
  Phone,
  Play,
  Plus,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

const statusInfo = (status) => {
  if (status === "hidden") return { label: "Paused", className: "cd-status-paused" };
  if (status === "flagged") return { label: "Under review", className: "cd-status-flagged" };
  return { label: "Live", className: "cd-status-live" };
};

const errMsg = (err, fallback) => err.response?.data?.msg || fallback;

// Dashboard for listers: personal car owners ("owner") and rent-a-car companies ("company")
export default function CompanyDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(getStoredUser);

  const wantsCompanySetup = new URLSearchParams(location.search).get("setup") === "company";
  const isCompany = user?.role === "company";

  const [company, setCompany] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsCompanySetup, setNeedsCompanySetup] = useState(false);

  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({});
  const [busyVehicleId, setBusyVehicleId] = useState(null);

  const [setupForm, setSetupForm] = useState({
    companyName: user?.name ? `${user.name} Rentals` : "",
    phone: user?.phone || "",
    address: "",
  });

  const addVehiclePath = isCompany ? "/company-list-vehicle" : "/list-my-car";

  useEffect(() => {
    if (!token || !user) {
      navigate(`/login?redirect=${encodeURIComponent(DASHBOARD_PATH)}`, { replace: true });
      return;
    }
    if (user.role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }
    // Being here means the user is working as a lister, not browsing
    setBrowsingAsCustomer(false);

    if (user.role === "renter" && !wantsCompanySetup) {
      navigate("/choose-listing-type", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        const vehiclesReq = axios.get(`${API_URL}/api/vehicles/my`);
        if (user.role === "company") {
          const companyReq = axios.get(`${API_URL}/api/companies/me`).catch((err) => {
            if (err.response?.status === 404) return { data: null };
            throw err;
          });
          const [companyRes, vehiclesRes] = await Promise.all([companyReq, vehiclesReq]);
          setVehicles(vehiclesRes.data || []);
          if (companyRes.data) {
            setCompany(companyRes.data);
          } else {
            setNeedsCompanySetup(true);
          }
        } else {
          const vehiclesRes = await vehiclesReq;
          setVehicles(vehiclesRes.data || []);
          if (user.role === "renter") setNeedsCompanySetup(true);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        toast.error(errMsg(err, "Could not load your dashboard. Please refresh."));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const browseAsCustomer = () => {
    setBrowsingAsCustomer(true);
    navigate("/");
  };

  /* ── Company setup (renter or company without a profile) ── */
  const handleCompanySetup = async (e) => {
    e.preventDefault();
    if (!setupForm.companyName.trim()) {
      toast.warning("Please enter your company name.");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.put(`${API_URL}/api/companies/me`, {
        ...setupForm,
        contactEmail: user?.email || "",
      });
      setCompany(res.data);
      setNeedsCompanySetup(false);
      setUser(updateStoredUser({ role: "company", companyId: res.data._id }));
      localStorage.setItem(
        "company",
        JSON.stringify({ id: res.data._id, companyName: res.data.companyName, logo: res.data.logo })
      );
      navigate(DASHBOARD_PATH, { replace: true });
      toast.success("Company profile created. Welcome to your dashboard!");
    } catch (err) {
      toast.error(errMsg(err, "Failed to create company profile. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  /* ── Profile editing ── */
  const startEditProfile = () => {
    setProfileData(
      isCompany
        ? { ...company }
        : { name: user?.name || "", phone: user?.phone || "" }
    );
    setEditProfile(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (isCompany) {
        const { companyName, phone, contactEmail, address, logo, description } = profileData;
        const res = await axios.put(`${API_URL}/api/companies/me`, {
          companyName, phone, contactEmail, address, logo, description,
        });
        setCompany(res.data);
      } else {
        if (!profileData.name?.trim()) {
          toast.warning("Name cannot be empty.");
          setSaving(false);
          return;
        }
        const res = await axios.post(`${API_URL}/api/auth/update-profile`, {
          name: profileData.name,
          phone: profileData.phone,
        });
        setUser(updateStoredUser({ name: res.data.user.name, phone: res.data.user.phone }));
      }
      setEditProfile(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(errMsg(err, "Failed to save profile. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  /* ── Vehicle actions ── */
  const replaceVehicle = (updated) =>
    setVehicles((prev) => prev.map((v) => (v._id === updated._id ? { ...v, ...updated } : v)));

  const handleDelete = async (vehicleId) => {
    try {
      await axios.delete(`${API_URL}/api/vehicles/${vehicleId}`);
      setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
      setDeleteConfirm(null);
      toast.success("Vehicle removed.");
    } catch (err) {
      toast.error("Failed to delete vehicle: " + errMsg(err, err.message));
    }
  };

  const toggleListing = async (vehicle) => {
    const nextStatus = vehicle.status === "hidden" ? "active" : "hidden";
    setBusyVehicleId(vehicle._id);
    try {
      const res = await axios.put(`${API_URL}/api/vehicles/${vehicle._id}`, { status: nextStatus });
      replaceVehicle(res.data);
      toast.success(
        nextStatus === "hidden"
          ? `${vehicle.brand} ${vehicle.model} is paused and hidden from customers.`
          : `${vehicle.brand} ${vehicle.model} is live again.`
      );
    } catch (err) {
      toast.error(errMsg(err, "Could not update listing."));
    } finally {
      setBusyVehicleId(null);
    }
  };

  const openVehicleEditor = (v) => {
    setEditingVehicle(v);
    setVehicleForm({
      pricePerDay: v.pricePerDay ?? "",
      pricePerKmAfter100km: v.pricePerKmAfter100km ?? "",
      location: v.location || "",
      description: v.description || "",
      availableFrom: toDateInput(v.availableFrom),
      availableTo: toDateInput(v.availableTo),
    });
  };

  const saveVehicle = async (e) => {
    e.preventDefault();
    if (!(Number(vehicleForm.pricePerDay) > 0)) {
      toast.warning("Please enter a valid daily price.");
      return;
    }
    if (vehicleForm.availableFrom && vehicleForm.availableTo && vehicleForm.availableTo < vehicleForm.availableFrom) {
      toast.warning("'Available until' must be after 'Available from'.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        pricePerDay: Number(vehicleForm.pricePerDay),
        pricePerKmAfter100km: Number(vehicleForm.pricePerKmAfter100km) || 0,
        location: vehicleForm.location.trim(),
        description: vehicleForm.description,
      };
      if (vehicleForm.availableFrom) payload.availableFrom = new Date(vehicleForm.availableFrom).toISOString();
      if (vehicleForm.availableTo) payload.availableTo = new Date(vehicleForm.availableTo).toISOString();
      const res = await axios.put(`${API_URL}/api/vehicles/${editingVehicle._id}`, payload);
      replaceVehicle(res.data);
      setEditingVehicle(null);
      toast.success("Listing updated.");
    } catch (err) {
      toast.error(errMsg(err, "Could not save changes."));
    } finally {
      setSaving(false);
    }
  };

  /* ── Real stats ── */
  const liveCount = vehicles.filter((v) => !v.status || v.status === "active").length;
  const pausedCount = vehicles.filter((v) => v.status === "hidden").length;
  const totalReviews = vehicles.reduce((s, v) => s + (v.reviewCount || 0), 0);
  const avgRating = totalReviews
    ? (vehicles.reduce((s, v) => s + (v.rating || 0) * (v.reviewCount || 0), 0) / totalReviews).toFixed(1)
    : null;
  const displayName = isCompany ? company?.companyName : user?.name;

  /* ── Loading state ── */
  if (loading)
    return (
      <div className="cd-loading">
        <div className="cd-spinner" />
        <p>Loading your dashboard...</p>
        <style>{loadingCSS}</style>
      </div>
    );

  /* ── Company profile setup ── */
  if (needsCompanySetup)
    return (
      <div className="cd-loading" style={{ padding: "40px 16px" }}>
        <div className="cd-error-icon" style={{ background: "#FFEDD5", color: "#F97316" }}>
          <Building2 size={36} />
        </div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 8px 0", textAlign: "center" }}>Set up your company profile</h2>
        <p style={{ color: "#64748B", maxWidth: 440, textAlign: "center", marginBottom: 24, fontSize: "0.95rem" }}>
          Add your rent-a-car company details. Customers will see these on your fleet page.
        </p>

        <form onSubmit={handleCompanySetup} className="cd-setup-form">
          <div className="cd-form-group">
            <label>Company Name</label>
            <input
              type="text"
              placeholder="e.g. Colombo Premier Fleet"
              required
              value={setupForm.companyName}
              onChange={(e) => setSetupForm({ ...setupForm, companyName: e.target.value })}
            />
          </div>
          <div className="cd-form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. +94 77 123 4567"
              value={setupForm.phone}
              onChange={(e) => setSetupForm({ ...setupForm, phone: e.target.value })}
            />
          </div>
          <div className="cd-form-group">
            <label>Address / City</label>
            <input
              type="text"
              placeholder="e.g. Colombo 03"
              value={setupForm.address}
              onChange={(e) => setSetupForm({ ...setupForm, address: e.target.value })}
            />
          </div>
          <button type="submit" disabled={saving} className="cd-add-vehicle-btn cd-btn-block">
            {saving ? "Creating profile..." : "Create & open dashboard →"}
          </button>
          <button type="button" onClick={logout} className="cd-link-danger">
            <LogOut size={14} /> Log out
          </button>
        </form>
        <style>{loadingCSS + dashboardCSS}</style>
      </div>
    );

  return (
    <>
      <div className="cd-wrapper">
        <div className="cd-layout">
          {/* ── Sidebar ── */}
          <aside className="cd-sidebar">
            <Link to={DASHBOARD_PATH} className="cd-logo">
              <span className="cd-logo-icon"><CarFront size={18} /></span>
              <span className="cd-logo-text">
                Yamu<span className="cd-logo-accent"> Car Rentals</span>
              </span>
            </Link>

            <nav className="cd-nav">
              <a href="#overview" className="cd-nav-item cd-nav-active">
                <LayoutDashboard size={16} /> Overview
              </a>
              <a href="#fleet" className="cd-nav-item">
                <Car size={16} /> {isCompany ? "My Fleet" : "My Vehicles"}
              </a>
              <a href="#profile" className="cd-nav-item">
                {isCompany ? <Building2 size={16} /> : <User size={16} />} Profile
              </a>
              <Link to={addVehiclePath} className="cd-nav-item">
                <Plus size={16} /> Add Vehicle
              </Link>

              <div className="cd-nav-divider" />

              <button type="button" className="cd-nav-item" onClick={browseAsCustomer}>
                <Eye size={16} /> View site as customer
              </button>
              {isCompany && company?._id && (
                <Link to={`/companies/${company._id}`} className="cd-nav-item" target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} /> My public page
                </Link>
              )}

              <div className="cd-nav-divider" />

              <button type="button" className="cd-nav-item cd-nav-logout" onClick={logout}>
                <LogOut size={16} /> Log Out
              </button>
            </nav>

            <div className="cd-sidebar-card">
              <p className="cd-sidebar-card-name">{displayName}</p>
              <p className="cd-sidebar-card-sub">
                <CheckCircle size={10} style={{ color: "#10b981" }} />
                {isCompany ? "Rent-a-car company" : "Personal host"}
              </p>
              <Link to={addVehiclePath} className="cd-add-vehicle-btn">
                <Plus size={14} /> Add vehicle
              </Link>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="cd-main" id="overview">
            <header className="cd-header">
              <div>
                <h1 className="cd-title">
                  {greeting()}, <span style={{ color: "#f97316" }}>{displayName}</span>
                </h1>
                <p className="cd-subtitle">
                  {isCompany ? "Manage your fleet and company profile." : "Manage your listed vehicles and profile."}
                </p>
              </div>
              <div className="cd-header-actions">
                <Link to={addVehiclePath} className="cd-btn-primary-sm cd-header-btn">
                  <Plus size={14} /> Add vehicle
                </Link>
                <button type="button" onClick={browseAsCustomer} className="cd-btn-outline cd-header-btn">
                  <Eye size={14} /> View site as customer
                </button>
                <button type="button" onClick={logout} className="cd-btn-outline cd-header-btn cd-btn-logout">
                  <LogOut size={14} /> Log out
                </button>
              </div>
            </header>

            {/* ── Stat cards (all real data) ── */}
            <div className="cd-stats-grid">
              <StatCard icon={CarFront} label="Total vehicles" value={vehicles.length} />
              <StatCard icon={Eye} label="Live on site" value={liveCount} />
              <StatCard icon={EyeOff} label="Paused" value={pausedCount} />
              <StatCard
                icon={Star}
                label="Customer rating"
                value={avgRating ? `${avgRating} ★` : "—"}
                sub={totalReviews ? `${totalReviews} review${totalReviews === 1 ? "" : "s"}` : "No reviews yet"}
              />
            </div>

            {!(isCompany ? company?.phone : user?.phone) && (
              <div className="cd-alert">
                <Phone size={18} />
                <div>
                  <strong>Add your phone number</strong>
                  <p>Customers contact you on WhatsApp from your listings. Without a number they can't reach you.</p>
                </div>
                <button type="button" className="cd-btn-primary-sm" onClick={() => { startEditProfile(); document.getElementById("profile")?.scrollIntoView({ behavior: "smooth" }); }}>
                  Add number
                </button>
              </div>
            )}

            {/* ── Vehicle list ── */}
            <section className="cd-card cd-fleet-card" id="fleet">
              <div className="cd-card-head">
                <div>
                  <h2 className="cd-card-title">{isCompany ? "Vehicle Fleet" : "My Vehicles"}</h2>
                  <p className="cd-card-desc">
                    {vehicles.length === 0
                      ? "You have not listed any vehicles yet."
                      : `${liveCount} live · ${pausedCount} paused`}
                  </p>
                </div>
                <Link to={addVehiclePath} className="cd-btn-primary-sm"><Plus size={12} /> Add</Link>
              </div>

              {vehicles.length === 0 ? (
                <div className="cd-empty-state">
                  <Car size={28} style={{ color: "#f97316" }} />
                  <h3>No vehicles yet</h3>
                  <p>List your first vehicle so customers can find and contact you.</p>
                  <Link to={addVehiclePath} className="cd-add-vehicle-btn" style={{ marginTop: 12, display: "inline-flex" }}>
                    <Plus size={14} /> List a vehicle
                  </Link>
                </div>
              ) : (
                <div className="cd-vehicle-list">
                  {vehicles.map((v) => {
                    const st = statusInfo(v.status);
                    return (
                      <div key={v._id} className="cd-vehicle-row">
                        <div className="cd-cell-vehicle">
                          <img
                            src={formatVehicleImageUrl(v.images, v.vehicleType)}
                            alt={`${v.brand} ${v.model}`}
                            className="cd-vehicle-thumb"
                            onError={(e) => handleImageError(e, formatVehicleImageUrl(null, v.vehicleType))}
                          />
                          <div style={{ minWidth: 0 }}>
                            <span className="cd-vehicle-name">{v.brand} {v.model}</span>
                            <span className="cd-vehicle-meta">
                              {v.year} · <MapPin size={11} /> {v.location}
                            </span>
                          </div>
                        </div>
                        <div className="cd-vehicle-price">
                          LKR {Number(v.pricePerDay || 0).toLocaleString()}<small>/day</small>
                        </div>
                        <span className={`cd-status ${st.className}`}>{st.label}</span>
                        <div className="cd-cell-actions">
                          <Link to={`/vehicle/${v._id}`} className="cd-action-icon-btn cd-view-btn" title="View listing">
                            <ExternalLink size={14} />
                          </Link>
                          <button type="button" className="cd-action-icon-btn cd-view-btn" onClick={() => openVehicleEditor(v)} title="Edit price & details">
                            <Edit3 size={14} />
                          </button>
                          {v.status !== "flagged" && (
                            <button
                              type="button"
                              className="cd-action-icon-btn cd-view-btn"
                              onClick={() => toggleListing(v)}
                              disabled={busyVehicleId === v._id}
                              title={v.status === "hidden" ? "Make live again" : "Pause (hide from customers)"}
                            >
                              {v.status === "hidden" ? <Play size={14} /> : <Pause size={14} />}
                            </button>
                          )}
                          <button type="button" className="cd-action-icon-btn cd-delete-btn" onClick={() => setDeleteConfirm(v)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Profile ── */}
            <section className="cd-card cd-profile-card" id="profile">
              <div className="cd-card-head">
                <div>
                  <h2 className="cd-card-title">{isCompany ? "Company Information" : "My Profile"}</h2>
                  <p className="cd-card-desc">Customers use these details to contact you.</p>
                </div>
                {!editProfile ? (
                  <button type="button" className="cd-btn-outline" onClick={startEditProfile}>
                    <Edit3 size={12} /> Edit
                  </button>
                ) : (
                  <div className="cd-edit-actions">
                    <button type="button" className="cd-btn-text" onClick={() => setEditProfile(false)}>Cancel</button>
                    <button type="button" className="cd-btn-primary-sm" onClick={handleSaveProfile} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>
              <div className="cd-card-body">
                {editProfile ? (
                  isCompany ? (
                    <div className="cd-edit-form">
                      <div className="cd-form-row">
                        <Field label="Company Name" value={profileData.companyName} onChange={(val) => setProfileData({ ...profileData, companyName: val })} />
                        <Field label="Phone Number" type="tel" value={profileData.phone} onChange={(val) => setProfileData({ ...profileData, phone: val })} />
                      </div>
                      <div className="cd-form-row">
                        <Field label="Contact Email" type="email" value={profileData.contactEmail} onChange={(val) => setProfileData({ ...profileData, contactEmail: val })} />
                        <Field label="Address" value={profileData.address} onChange={(val) => setProfileData({ ...profileData, address: val })} />
                      </div>
                      <Field label="Logo URL (optional)" value={profileData.logo} onChange={(val) => setProfileData({ ...profileData, logo: val })} />
                      <div className="cd-form-group">
                        <label>About your company</label>
                        <textarea rows={3} value={profileData.description || ""} onChange={(e) => setProfileData({ ...profileData, description: e.target.value })} placeholder="Describe your services..." />
                      </div>
                    </div>
                  ) : (
                    <div className="cd-edit-form">
                      <div className="cd-form-row">
                        <Field label="Full Name" value={profileData.name} onChange={(val) => setProfileData({ ...profileData, name: val })} />
                        <Field label="Phone Number" type="tel" value={profileData.phone} onChange={(val) => setProfileData({ ...profileData, phone: val })} />
                      </div>
                    </div>
                  )
                ) : (
                  <div className="cd-info-grid">
                    {isCompany ? (
                      <>
                        <InfoItem icon={MapPin} label="Address" value={company?.address} />
                        <InfoItem icon={Phone} label="Phone" value={company?.phone} />
                        <InfoItem icon={Mail} label="Email" value={company?.contactEmail} />
                        {company?.description && (
                          <div className="cd-info-item cd-info-full">
                            <div><span className="cd-info-label">About</span><p className="cd-info-desc">{company.description}</p></div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <InfoItem icon={User} label="Name" value={user?.name} />
                        <InfoItem icon={Phone} label="Phone" value={user?.phone} />
                        <InfoItem icon={Mail} label="Email" value={user?.email} />
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* ── Edit Vehicle Modal ── */}
      {editingVehicle && (
        <div className="cd-modal-overlay" onClick={() => setEditingVehicle(null)}>
          <form className="cd-modal cd-modal-form" onClick={(e) => e.stopPropagation()} onSubmit={saveVehicle}>
            <div className="cd-modal-head">
              <h3>Edit {editingVehicle.brand} {editingVehicle.model}</h3>
              <button type="button" className="cd-modal-close" onClick={() => setEditingVehicle(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="cd-form-row">
              <Field label="Price per day (LKR)" type="number" min="1" value={vehicleForm.pricePerDay} onChange={(val) => setVehicleForm({ ...vehicleForm, pricePerDay: val })} />
              <Field label="Extra per km after 100km (LKR)" type="number" min="0" value={vehicleForm.pricePerKmAfter100km} onChange={(val) => setVehicleForm({ ...vehicleForm, pricePerKmAfter100km: val })} />
            </div>
            <Field label="Location" value={vehicleForm.location} onChange={(val) => setVehicleForm({ ...vehicleForm, location: val })} />
            <div className="cd-form-row">
              <Field label="Available from" type="date" value={vehicleForm.availableFrom} onChange={(val) => setVehicleForm({ ...vehicleForm, availableFrom: val })} />
              <Field label="Available until" type="date" value={vehicleForm.availableTo} onChange={(val) => setVehicleForm({ ...vehicleForm, availableTo: val })} />
            </div>
            <div className="cd-form-group">
              <label>Description</label>
              <textarea rows={4} value={vehicleForm.description} onChange={(e) => setVehicleForm({ ...vehicleForm, description: e.target.value })} />
            </div>
            <div className="cd-modal-actions">
              <button type="button" className="cd-btn-outline" onClick={() => setEditingVehicle(null)}>Cancel</button>
              <button type="submit" className="cd-btn-primary-sm" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="cd-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cd-modal-icon"><Trash2 size={24} /></div>
            <h3>Delete {deleteConfirm.brand} {deleteConfirm.model}?</h3>
            <p>This permanently removes the listing. To hide it temporarily, use Pause instead.</p>
            <div className="cd-modal-actions">
              <button type="button" className="cd-btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button type="button" className="cd-btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{dashboardCSS}</style>
    </>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="cd-stat-card">
      <div className="cd-stat-top">
        <span className="cd-stat-icon"><Icon size={20} /></span>
        <p className="cd-stat-label">{label}</p>
      </div>
      <p className="cd-stat-value">{value}</p>
      {sub && <p className="cd-stat-delta">{sub}</p>}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="cd-info-item">
      <div className="cd-info-icon"><Icon size={16} /></div>
      <div style={{ minWidth: 0 }}>
        <span className="cd-info-label">{label}</span>
        <span className="cd-info-value">{value || "Not specified"}</span>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", ...rest }) {
  return (
    <div className="cd-form-group">
      <label>{label}</label>
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />
    </div>
  );
}

/* ── Loading CSS ── */
const loadingCSS = `
  .cd-loading {
    min-height: 80vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: var(--font-body, "Plus Jakarta Sans", sans-serif);
  }
  .cd-spinner {
    width: 48px; height: 48px;
    border: 3px solid #FFEDD5; border-top-color: #F97316;
    border-radius: 50%; animation: cd-spin 1s ease infinite; margin-bottom: 1rem;
  }
  @keyframes cd-spin { to { transform: rotate(360deg); } }
  .cd-error-icon {
    width: 60px; height: 60px; background: #FEE2E2; color: #EF4444;
    border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;
  }
`;

/* ── Main Dashboard CSS ── */
const dashboardCSS = `
  html { scroll-behavior: smooth; }
  .cd-wrapper {
    min-height: 100vh;
    background: #fafafa;
    font-family: var(--font-body, "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif);
    color: #09090b;
  }
  .cd-layout { display: flex; max-width: 1500px; margin: 0 auto; }

  /* ── Sidebar ── */
  .cd-sidebar {
    position: sticky; top: 0; width: 250px; flex-shrink: 0;
    height: 100vh; overflow-y: auto; padding: 24px 20px;
    border-right: 1px solid rgba(228,228,231,0.6); background: #fff;
    display: flex; flex-direction: column;
  }
  .cd-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; }
  .cd-logo-icon {
    width: 36px; height: 36px; display: grid; place-items: center;
    border-radius: 12px; background: #f97316; color: #fff;
  }
  .cd-logo-text { font-size: 1.05rem; font-weight: 800; font-family: var(--font-display, 'Poppins', sans-serif); }
  .cd-logo-accent { color: #f97316; }

  .cd-nav { margin-top: 32px; display: flex; flex-direction: column; gap: 4px; }
  .cd-nav-item {
    display: flex; align-items: center; gap: 12px; padding: 10px 16px;
    border-radius: 100px; border: none; background: transparent; color: #71717a;
    font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    text-align: left; font-family: inherit; text-decoration: none;
  }
  .cd-nav-item:hover { background: #f4f4f5; color: #18181b; }
  .cd-nav-active { background: #fff7ed !important; color: #ea580c !important; }
  .cd-nav-divider { height: 1px; background: rgba(226,232,240,0.6); margin: 12px 8px; }
  .cd-nav-logout { color: #ef4444 !important; }
  .cd-nav-logout:hover { background: #fef2f2 !important; }

  .cd-sidebar-card {
    margin-top: 32px; border: 1px solid rgba(228,228,231,0.6);
    border-radius: 24px; background: #fff; padding: 16px;
  }
  .cd-sidebar-card-name { font-size: 0.875rem; font-weight: 700; color: #09090b; margin: 0; word-break: break-word; }
  .cd-sidebar-card-sub { font-size: 0.75rem; color: #71717a; margin: 4px 0 0; display: flex; align-items: center; gap: 4px; }
  .cd-add-vehicle-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    margin-top: 12px; padding: 8px 12px; border-radius: 100px;
    background: #f97316; color: #fff; font-size: 0.8rem; font-weight: 700;
    text-decoration: none; transition: background 0.2s; border: none; cursor: pointer; font-family: inherit;
  }
  .cd-add-vehicle-btn:hover { background: #ea580c; }
  .cd-btn-block { width: 100%; padding: 12px; margin-top: 8px; font-size: 0.95rem; }

  .cd-setup-form {
    width: 100%; max-width: 460px; background: #fff; padding: 28px; border-radius: 16px;
    border: 1px solid #E2E8F0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    display: flex; flex-direction: column; gap: 16px; box-sizing: border-box;
  }
  .cd-link-danger {
    background: transparent; border: none; color: #EF4444; font-size: 0.88rem; font-weight: 600;
    cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  }

  /* ── Main ── */
  .cd-main { flex: 1; min-width: 0; padding: 24px 24px 40px; }
  .cd-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .cd-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .cd-header-btn { padding: 8px 14px !important; text-decoration: none; }
  .cd-btn-logout { color: #EF4444 !important; border-color: rgba(239,68,68,0.3) !important; }
  .cd-title {
    font-size: 1.75rem; font-weight: 800; letter-spacing: -0.5px;
    color: #09090b; margin: 0; font-family: var(--font-display, 'Poppins', sans-serif);
  }
  .cd-subtitle { font-size: 0.875rem; color: #71717a; margin: 4px 0 0; }

  /* ── Stats ── */
  .cd-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 24px; }
  .cd-stat-card {
    background: #fff; border: 1px solid rgba(228,228,231,0.6);
    border-radius: 20px; padding: 18px;
  }
  .cd-stat-top { display: flex; align-items: center; gap: 12px; }
  .cd-stat-icon {
    width: 40px; height: 40px; display: grid; place-items: center;
    border-radius: 14px; background: #fff7ed; color: #ea580c; flex-shrink: 0;
  }
  .cd-stat-label { font-size: 0.78rem; color: #71717a; margin: 0; }
  .cd-stat-value { font-size: 1.5rem; font-weight: 800; margin: 12px 0 0; color: #09090b; font-family: var(--font-display, 'Poppins', sans-serif); }
  .cd-stat-delta { font-size: 0.75rem; font-weight: 600; margin: 2px 0 0; color: #71717a; }

  .cd-alert {
    display: flex; align-items: center; gap: 14px; margin-top: 20px; padding: 14px 18px;
    background: #fff7ed; border: 1px solid #fed7aa; border-radius: 16px; color: #9a3412;
  }
  .cd-alert > div { flex: 1; min-width: 0; }
  .cd-alert strong { display: block; font-size: 0.9rem; }
  .cd-alert p { margin: 2px 0 0; font-size: 0.8rem; color: #9a3412; }
  @media (max-width: 640px) { .cd-alert { flex-wrap: wrap; } }

  .cd-card { background: #fff; border: 1px solid rgba(228,228,231,0.6); border-radius: 24px; padding: 20px; }
  .cd-card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .cd-card-title { font-size: 1.05rem; font-weight: 700; color: #09090b; margin: 0; font-family: var(--font-display, 'Poppins', sans-serif); }
  .cd-card-desc { font-size: 0.8rem; color: #71717a; margin: 2px 0 0; }
  .cd-card-body { padding: 16px 0 0; }

  /* ── Buttons ── */
  .cd-edit-actions { display: flex; gap: 8px; }
  .cd-btn-outline {
    background: #fff; color: #09090b; border: 1px solid #e2e8f0; padding: 6px 12px;
    border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer; font-family: inherit;
    display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;
  }
  .cd-btn-outline:hover { border-color: #f97316; color: #f97316; }
  .cd-btn-primary-sm {
    background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
    color: #fff; border: none; padding: 6px 12px; border-radius: 8px; font-family: inherit;
    font-weight: 700; font-size: 0.8rem; cursor: pointer; text-decoration: none;
    display: inline-flex; align-items: center; gap: 4px;
    box-shadow: 0 2px 8px rgba(249,115,22,0.3); transition: all 0.2s;
  }
  .cd-btn-primary-sm:disabled { opacity: 0.7; cursor: wait; }
  .cd-btn-text {
    background: transparent; color: #64748b; border: none; padding: 6px 12px;
    font-weight: 700; font-size: 0.8rem; cursor: pointer; font-family: inherit;
  }
  .cd-btn-danger {
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    color: #fff; border: none; padding: 8px 20px; border-radius: 10px;
    font-weight: 700; font-size: 0.85rem; cursor: pointer; font-family: inherit;
  }

  /* ── Forms ── */
  .cd-edit-form { display: flex; flex-direction: column; gap: 16px; }
  .cd-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .cd-form-group { display: flex; flex-direction: column; gap: 6px; text-align: left; }
  .cd-form-group label { font-size: 0.75rem; font-weight: 800; color: #334155; }
  .cd-form-group input, .cd-form-group textarea {
    padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px;
    font-family: inherit; font-size: 16px; color: #09090b; transition: all 0.2s;
    outline: none; width: 100%; box-sizing: border-box; background: #fff;
  }
  .cd-form-group input:focus, .cd-form-group textarea:focus {
    border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
  }

  /* ── Profile ── */
  .cd-profile-card { margin-top: 24px; scroll-margin-top: 16px; }
  .cd-info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
  .cd-info-item {
    display: flex; gap: 12px; align-items: center; padding: 12px;
    border-radius: 12px; background: #fafafa;
  }
  .cd-info-full { grid-column: 1 / -1; align-items: flex-start; }
  .cd-info-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, #F97316, #EA580C); color: #fff;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .cd-info-label { font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; }
  .cd-info-value { font-size: 0.9rem; font-weight: 700; color: #09090b; display: block; word-break: break-word; }
  .cd-info-desc { margin: 4px 0 0; color: #334155; line-height: 1.5; font-size: 0.85rem; }

  /* ── Vehicles ── */
  .cd-fleet-card { margin-top: 24px; scroll-margin-top: 16px; }
  .cd-empty-state { text-align: center; padding: 40px 20px; }
  .cd-empty-state h3 { margin: 8px 0 4px; font-size: 1rem; }
  .cd-empty-state p { color: #71717a; font-size: 0.875rem; margin: 0; }

  .cd-vehicle-list { display: flex; flex-direction: column; margin-top: 12px; }
  .cd-vehicle-row {
    display: grid; grid-template-columns: minmax(0, 1fr) 140px 110px auto;
    align-items: center; gap: 16px; padding: 14px 4px; border-top: 1px solid #f1f5f9;
  }
  .cd-cell-vehicle { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .cd-vehicle-thumb { width: 64px; height: 48px; border-radius: 10px; object-fit: cover; flex-shrink: 0; background: #f1f5f9; }
  .cd-vehicle-name { font-weight: 700; color: #09090b; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cd-vehicle-meta {
    font-size: 0.78rem; color: #71717a; display: flex; align-items: center; gap: 3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .cd-vehicle-price { font-weight: 700; color: #ea580c; white-space: nowrap; }
  .cd-vehicle-price small { color: #94a3b8; font-weight: 500; margin-left: 2px; }
  .cd-status {
    justify-self: start; padding: 4px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap;
  }
  .cd-status-live { background: #dcfce7; color: #15803d; }
  .cd-status-paused { background: #f1f5f9; color: #475569; }
  .cd-status-flagged { background: #fee2e2; color: #b91c1c; }
  .cd-cell-actions { display: flex; gap: 6px; justify-content: flex-end; }
  .cd-action-icon-btn {
    width: 34px; height: 34px; border-radius: 8px; border: 1px solid #e2e8f0;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; background: #fff; flex-shrink: 0;
  }
  .cd-action-icon-btn:disabled { opacity: 0.5; cursor: wait; }
  .cd-view-btn { color: #334155; }
  .cd-view-btn:hover { background: #fff7ed; border-color: #f97316; color: #ea580c; }
  .cd-delete-btn { color: #ef4444; }
  .cd-delete-btn:hover { background: #fee2e2; border-color: #ef4444; }

  /* ── Modal ── */
  .cd-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center; z-index: 1000;
    padding: 16px; animation: cd-fadeIn 0.2s;
  }
  .cd-modal {
    background: #fff; border-radius: 24px; padding: 28px; text-align: center;
    max-width: 420px; width: 100%; box-sizing: border-box; animation: cd-zoomIn 0.25s;
    max-height: calc(100vh - 32px); overflow-y: auto;
  }
  .cd-modal-form { max-width: 560px; text-align: left; display: flex; flex-direction: column; gap: 14px; }
  .cd-modal-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .cd-modal-head h3 { margin: 0; font-size: 1.1rem; }
  .cd-modal-close { background: #f1f5f9; border: none; border-radius: 8px; width: 32px; height: 32px; display: grid; place-items: center; cursor: pointer; }
  .cd-modal-icon {
    width: 56px; height: 56px; border-radius: 16px; background: #fee2e2; color: #ef4444;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
  }
  .cd-modal h3 { margin: 0 0 8px; font-size: 1.125rem; }
  .cd-modal p { color: #71717a; font-size: 0.875rem; margin: 0 0 20px; }
  .cd-modal-actions { display: flex; gap: 12px; justify-content: center; }
  .cd-modal-form .cd-modal-actions { justify-content: flex-end; }

  @keyframes cd-fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes cd-zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .cd-sidebar { display: none; }
    .cd-stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 720px) {
    .cd-vehicle-row {
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-areas: "veh veh" "price status" "actions actions";
      row-gap: 10px;
    }
    .cd-cell-vehicle { grid-area: veh; }
    .cd-vehicle-price { grid-area: price; }
    .cd-status { grid-area: status; justify-self: end; }
    .cd-cell-actions { grid-area: actions; justify-content: flex-start; }
    .cd-action-icon-btn { width: 40px; height: 40px; }
  }
  @media (max-width: 640px) {
    .cd-main { padding: 16px 16px 48px; }
    .cd-title { font-size: 1.35rem; }
    .cd-header-actions { width: 100%; }
    .cd-header-btn { flex: 1 1 auto; justify-content: center; }
    .cd-form-row { grid-template-columns: 1fr; }
    .cd-stats-grid { gap: 10px; }
    .cd-stat-card { padding: 14px; }
    .cd-stat-value { font-size: 1.25rem; }
    .cd-card { padding: 16px; border-radius: 18px; }
  }
`;
