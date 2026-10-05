import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Palette,
  Car,
  Building2,
  Users,
  Star,
  History,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Shield,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Search,
  Check,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Lock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Download,
  FileCode,
  Tag,
  HelpCircle,
  Layers,
  Sliders,
  DollarSign,
  TrendingUp,
  Bell,
  Clock,
  CheckCircle2,
  KeyRound,
  FileText,
  X,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { API_URL } from "../config";
import { formatVehicleImageUrl, handleImageError } from "../utils/imageHelper";
import {
  useSiteConfig,
  HOLIDAY_THEME_PRESETS,
  DEFAULT_CONFIG,
} from "../context/SiteConfigContext";
import { useToast } from "../context/ToastContext";
import FestivalAccessoriesManager from "../components/festivals/FestivalAccessoriesManager";

const VEHICLE_TYPES = [
  { id: "bicycle", label: "Bicycle / Bike" },
  { id: "threewheeler", label: "Three-Wheeler / Tuk-Tuk" },
  { id: "mini-car", label: "Mini / Economy Car" },
  { id: "car", label: "Sedan / Standard Car" },
  { id: "premium-car", label: "SUV / Premium Car" },
  { id: "mini-van", label: "Mini Van" },
  { id: "van", label: "Full-Size Van" },
  { id: "others", label: "Specialty / Others" },
];

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#eab308"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast, confirm } = useToast();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const { config, updateConfig, restoreSnapshot, resetToDefaults, refreshConfig } =
    useSiteConfig();

  // Active module tab
  const [activeTab, setActiveTab] = useState("analytics"); // analytics | approvals | cms | fleet | companies | rentals | users | reviews | rollback
  const [cmsSection, setCmsSection] = useState("theme"); // theme | global | hero | categories | stats | testimonials | filters | companies | faqs | footer
  const [previewDevice, setPreviewDevice] = useState("desktop"); // desktop | tablet | mobile

  // Form draft state for CMS
  const [draftConfig, setDraftConfig] = useState(config);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Analytics & Data states
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [usersList, setUsersList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [rentalsList, setRentalsList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [snapshotsList, setSnapshotsList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Search & Filters within tabs
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [fleetStatusFilter, setFleetStatusFilter] = useState("all");
  const [fleetTypeFilter, setFleetTypeFilter] = useState("all");
  const [companySearch, setCompanySearch] = useState("");
  const [companyVerifyFilter, setCompanyVerifyFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("pending"); // pending | rejected | all
  const [rentalStatusFilter, setRentalStatusFilter] = useState("all");

  // Feedback banner
  const [actionFeedback, setActionFeedback] = useState("");

  // Super Admin Edit Modals State
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({});
  const [savingVehicle, setSavingVehicle] = useState(false);

  const [rejectingVehicle, setRejectingVehicle] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({});
  const [savingUser, setSavingUser] = useState(false);

  const [editingCompany, setEditingCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState({});
  const [savingCompany, setSavingCompany] = useState(false);

  // Sync draftConfig with live config on load or reset
  useEffect(() => {
    if (config) {
      setDraftConfig(config);
    }
  }, [config]);

  // Auth & Admin check
  useEffect(() => {
    if (!token || user?.role !== "admin") {
      // If user is not admin, notify or route
    }
  }, [token, user]);

  // Fetch admin statistics
  const fetchStats = async () => {
    if (!token) return;
    try {
      setLoadingStats(true);
      const res = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { "x-auth-token": token },
      });
      setStats(res.data);
    } catch (err) {
      console.warn("Could not fetch admin stats (demo mode or offline):", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch specific tab data
  const fetchTabData = async (tab) => {
    if (!token) return;
    try {
      setLoadingData(true);
      if (tab === "users") {
        const res = await axios.get(`${API_URL}/api/admin/users`, {
          headers: { "x-auth-token": token },
        });
        setUsersList(res.data);
      } else if (tab === "companies") {
        const res = await axios.get(`${API_URL}/api/admin/companies`, {
          headers: { "x-auth-token": token },
        });
        setCompaniesList(res.data);
      } else if (tab === "fleet" || tab === "approvals") {
        const res = await axios.get(`${API_URL}/api/admin/vehicles`, {
          headers: { "x-auth-token": token },
        });
        setVehiclesList(res.data);
      } else if (tab === "rentals") {
        const res = await axios.get(`${API_URL}/api/admin/rentals`, {
          headers: { "x-auth-token": token },
        });
        setRentalsList(res.data);
      } else if (tab === "reviews") {
        const res = await axios.get(`${API_URL}/api/admin/reviews`, {
          headers: { "x-auth-token": token },
        });
        setReviewsList(res.data);
      } else if (tab === "rollback") {
        const res = await axios.get(`${API_URL}/api/site-config/snapshots`, {
          headers: { "x-auth-token": token },
        });
        setSnapshotsList(res.data);
      }
    } catch (err) {
      console.error(`Error fetching ${tab} data:`, err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  useEffect(() => {
    if (["users", "companies", "fleet", "approvals", "rentals", "reviews", "rollback"].includes(activeTab)) {
      fetchTabData(activeTab);
    }
  }, [activeTab]);

  // Handlers for CMS
  const handleDraftChange = (path, value) => {
    setDraftConfig((prev) => {
      const copy = JSON.parse(JSON.stringify(prev || DEFAULT_CONFIG));
      const parts = path.split(".");
      let current = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  const handleApplyPresetTheme = (presetKey) => {
    const preset = HOLIDAY_THEME_PRESETS[presetKey];
    if (!preset) return;
    setDraftConfig((prev) => {
      const copy = JSON.parse(JSON.stringify(prev || DEFAULT_CONFIG));
      copy.global.themePreset = presetKey;
      copy.global.primaryColor = preset.primary;
      copy.global.primaryDark = preset.primaryDark;
      copy.global.primaryLight = preset.primaryLight;
      copy.global.accentColor = preset.accent;
      copy.global.announcement.bgColor = preset.announcementBg;
      copy.global.announcement.text = preset.announcementText;
      return copy;
    });
  };

  const handleSaveCMS = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await updateConfig(
        draftConfig,
        `CMS Update (${cmsSection})`,
        `Saved changes to ${cmsSection} section`
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setSaveError(
        err.response?.data?.msg || "Failed to save configuration. Are you logged in as Admin?"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (snapshotId) => {
    const ok = await confirm({
      title: "Restore Configuration Snapshot?",
      message: "Are you sure you want to restore this configuration snapshot? Live settings will be reverted.",
      confirmText: "Restore Snapshot",
    });
    if (!ok) return;
    try {
      await restoreSnapshot(snapshotId);
      toast.success("Snapshot restored successfully!");
      fetchTabData("rollback");
    } catch (err) {
      toast.error("Error restoring snapshot: " + err.message);
    }
  };

  const handleResetDefaults = async () => {
    const ok = await confirm({
      title: "Reset to Factory Defaults?",
      message: "WARNING: This will reset all site customizations, colors, and content to factory defaults. This action cannot be undone.",
      confirmText: "Reset Defaults",
      isDestructive: true,
    });
    if (!ok) return;
    try {
      await resetToDefaults();
      toast.success("Site reset to factory defaults!");
    } catch (err) {
      toast.error("Error resetting: " + err.message);
    }
  };

  // ==========================================
  // SUPER ADMIN APPROVAL ACTIONS
  // ==========================================

  const handleApproveVehicle = async (vehicleId, vehicleName) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/vehicles/${vehicleId}/approve`,
        {},
        { headers: { "x-auth-token": token } }
      );
      toast.success(res.data.msg || `${vehicleName || "Vehicle"} is now live on the marketplace!`);
      fetchStats();
      fetchTabData("approvals");
      fetchTabData("fleet");
    } catch (err) {
      toast.error("Error approving vehicle: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleOpenRejectModal = (vehicle) => {
    setRejectingVehicle(vehicle);
    setRejectionReasonInput(vehicle.rejectionReason || "");
  };

  const handleConfirmReject = async () => {
    if (!rejectingVehicle) return;
    setSubmittingReject(true);
    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/vehicles/${rejectingVehicle._id}/reject`,
        { reason: rejectionReasonInput },
        { headers: { "x-auth-token": token } }
      );
      toast.success(res.data.msg || "Listing rejected");
      setRejectingVehicle(null);
      setRejectionReasonInput("");
      fetchStats();
      fetchTabData("approvals");
      fetchTabData("fleet");
    } catch (err) {
      toast.error("Error rejecting vehicle: " + (err.response?.data?.msg || err.message));
    } finally {
      setSubmittingReject(false);
    }
  };

  // ==========================================
  // SUPER ADMIN VEHICLE EDIT & STATUS ACTIONS
  // ==========================================

  const handleOpenEditVehicleModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      year: vehicle.year || new Date().getFullYear(),
      vehicleType: vehicle.vehicleType || "car",
      pricePerDay: vehicle.pricePerDay || 0,
      pricePerKmAfter100km: vehicle.pricePerKmAfter100km || 0,
      freeKmPerDay: vehicle.freeKmPerDay || 100,
      deposit: vehicle.deposit || 0,
      transmission: vehicle.transmission || "Automatic",
      fuelType: vehicle.fuelType || "Petrol",
      seats: vehicle.seats || 4,
      mileage: vehicle.mileage || "",
      location: vehicle.location || "Colombo",
      status: vehicle.status || "active",
      rejectionReason: vehicle.rejectionReason || "",
      isFeatured: !!vehicle.isFeatured,
      images: Array.isArray(vehicle.images) ? [...vehicle.images] : [],
      features: Array.isArray(vehicle.features) ? vehicle.features.join(", ") : (vehicle.features || ""),
    });
  };

  const handleSaveVehicleAdmin = async (forceApprove = false) => {
    if (!editingVehicle) return;
    setSavingVehicle(true);
    try {
      const payload = {
        ...vehicleForm,
        status: forceApprove ? "active" : vehicleForm.status,
        features: typeof vehicleForm.features === "string"
          ? vehicleForm.features.split(",").map((f) => f.trim()).filter(Boolean)
          : vehicleForm.features,
      };

      const res = await axios.put(
        `${API_URL}/api/admin/vehicles/${editingVehicle._id}`,
        payload,
        { headers: { "x-auth-token": token } }
      );
      toast.success(res.data.msg || "Vehicle listing updated successfully!");
      setEditingVehicle(null);
      fetchStats();
      fetchTabData("fleet");
      fetchTabData("approvals");
    } catch (err) {
      toast.error("Error saving vehicle: " + (err.response?.data?.msg || err.message));
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleChangeVehicleStatus = async (vehicleId, newStatus) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/vehicles/${vehicleId}/status`,
        { status: newStatus },
        { headers: { "x-auth-token": token } }
      );
      toast.success(res.data.msg);
      fetchStats();
      fetchTabData("fleet");
      fetchTabData("approvals");
    } catch (err) {
      toast.error("Error updating status: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleToggleVehicleFeature = async (vehicleId) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/vehicles/${vehicleId}/feature`,
        {},
        { headers: { "x-auth-token": token } }
      );
      toast.success(res.data.msg);
      fetchTabData("fleet");
      fetchStats();
    } catch (err) {
      toast.error("Error updating vehicle: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    const ok = await confirm({
      title: "Delete Vehicle Listing Permanently?",
      message: "Are you sure? This will delete the listing and all inquiries from the marketplace completely.",
      confirmText: "Delete Listing",
      isDestructive: true,
    });
    if (!ok) return;
    try {
      await axios.delete(`${API_URL}/api/admin/vehicles/${vehicleId}`, {
        headers: { "x-auth-token": token },
      });
      toast.success("Vehicle deleted successfully");
      fetchStats();
      fetchTabData("fleet");
      fetchTabData("approvals");
    } catch (err) {
      toast.error("Error deleting vehicle: " + err.message);
    }
  };

  // ==========================================
  // SUPER ADMIN USER MANAGEMENT
  // ==========================================

  const handleOpenEditUserModal = (u) => {
    setEditingUser(u);
    setUserForm({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || "renter",
    });
  };

  const handleSaveUserAdmin = async () => {
    if (!editingUser) return;
    setSavingUser(true);
    try {
      const res = await axios.put(
        `${API_URL}/api/admin/users/${editingUser._id}`,
        userForm,
        { headers: { "x-auth-token": token } }
      );
      toast.success(res.data.msg || "User updated successfully");
      setEditingUser(null);
      fetchStats();
      fetchTabData("users");
    } catch (err) {
      toast.error("Error saving user: " + (err.response?.data?.msg || err.message));
    } finally {
      setSavingUser(false);
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      await axios.patch(
        `${API_URL}/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { "x-auth-token": token } }
      );
      toast.success(`User role changed to ${newRole}`);
      fetchStats();
      fetchTabData("users");
    } catch (err) {
      toast.error("Error updating role: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const ok = await confirm({
      title: `Delete Account: ${userName || "User"}?`,
      message: "WARNING: This will delete the user account, their company profile, and all their vehicle listings permanently.",
      confirmText: "Delete User",
      isDestructive: true,
    });
    if (!ok) return;
    try {
      const res = await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: { "x-auth-token": token },
      });
      toast.success(res.data.msg);
      fetchStats();
      fetchTabData("users");
    } catch (err) {
      toast.error("Error deleting user: " + err.message);
    }
  };

  // ==========================================
  // SUPER ADMIN COMPANY MANAGEMENT
  // ==========================================

  const handleOpenEditCompanyModal = (c) => {
    setEditingCompany(c);
    setCompanyForm({
      companyName: c.companyName || "",
      contactEmail: c.contactEmail || "",
      phone: c.phone || "",
      address: c.address || "",
      description: c.description || "",
      logo: c.logo || "",
      isVerified: !!c.isVerified,
    });
  };

  const handleSaveCompanyAdmin = async () => {
    if (!editingCompany) return;
    setSavingCompany(true);
    try {
      const res = await axios.put(
        `${API_URL}/api/admin/companies/${editingCompany._id}`,
        companyForm,
        { headers: { "x-auth-token": token } }
      );
      toast.success(res.data.msg || "Company updated successfully");
      setEditingCompany(null);
      fetchStats();
      fetchTabData("companies");
    } catch (err) {
      toast.error("Error saving company: " + (err.response?.data?.msg || err.message));
    } finally {
      setSavingCompany(false);
    }
  };

  const handleToggleCompanyVerify = async (companyId) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/companies/${companyId}/verify`,
        {},
        { headers: { "x-auth-token": token } }
      );
      toast.success(res.data.msg);
      fetchStats();
      fetchTabData("companies");
    } catch (err) {
      toast.error("Error verifying company: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleDeleteCompany = async (companyId, companyName) => {
    const ok = await confirm({
      title: `Delete Company: ${companyName}?`,
      message: "Are you sure you want to permanently delete this company profile from the platform?",
      confirmText: "Delete Company",
      isDestructive: true,
    });
    if (!ok) return;
    try {
      const res = await axios.delete(`${API_URL}/api/admin/companies/${companyId}`, {
        headers: { "x-auth-token": token },
      });
      toast.success(res.data.msg);
      fetchStats();
      fetchTabData("companies");
    } catch (err) {
      toast.error("Error deleting company: " + err.message);
    }
  };

  // ==========================================
  // SUPER ADMIN RENTALS SUPERVISOR
  // ==========================================

  const handleUpdateRentalStatus = async (rentalId, newStatus) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/rentals/${rentalId}/status`,
        { status: newStatus },
        { headers: { "x-auth-token": token } }
      );
      toast.success(res.data.msg);
      fetchStats();
      fetchTabData("rentals");
    } catch (err) {
      toast.error("Error updating rental: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleDeleteRental = async (rentalId) => {
    const ok = await confirm({
      title: "Delete Rental Record?",
      message: "Are you sure you want to delete this booking record?",
      confirmText: "Delete Rental",
      isDestructive: true,
    });
    if (!ok) return;
    try {
      const res = await axios.delete(`${API_URL}/api/admin/rentals/${rentalId}`, {
        headers: { "x-auth-token": token },
      });
      toast.success(res.data.msg);
      fetchStats();
      fetchTabData("rentals");
    } catch (err) {
      toast.error("Error deleting rental: " + err.message);
    }
  };

  // Review delete
  const handleDeleteReview = async (reviewId) => {
    const ok = await confirm({
      title: "Delete Customer Review?",
      message: "Are you sure you want to delete this review?",
      confirmText: "Delete Review",
      isDestructive: true,
    });
    if (!ok) return;
    try {
      await axios.delete(`${API_URL}/api/admin/reviews/${reviewId}`, {
        headers: { "x-auth-token": token },
      });
      toast.success("Review deleted");
      fetchStats();
      fetchTabData("reviews");
    } catch (err) {
      toast.error("Error deleting review: " + err.message);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(draftConfig, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `yamu-site-config-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered lists
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
      const matchesSearch =
        !userSearch ||
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phone?.toLowerCase().includes(userSearch.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [usersList, userRoleFilter, userSearch]);

  const filteredVehicles = useMemo(() => {
    return vehiclesList.filter((v) => {
      const matchesStatus = fleetStatusFilter === "all" || v.status === fleetStatusFilter;
      const matchesType = fleetTypeFilter === "all" || v.vehicleType === fleetTypeFilter;
      const matchesSearch =
        !vehicleSearch ||
        v.brand?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.model?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.location?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.company?.companyName?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.owner?.name?.toLowerCase().includes(vehicleSearch.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [vehiclesList, fleetStatusFilter, fleetTypeFilter, vehicleSearch]);

  const pendingApprovalsVehicles = useMemo(() => {
    return vehiclesList.filter((v) => {
      if (approvalFilter === "pending") return v.status === "pending";
      if (approvalFilter === "rejected") return v.status === "rejected";
      return true;
    });
  }, [vehiclesList, approvalFilter]);

  const filteredCompanies = useMemo(() => {
    return companiesList.filter((c) => {
      const matchesVerify =
        companyVerifyFilter === "all" ||
        (companyVerifyFilter === "verified" ? c.isVerified : !c.isVerified);
      const matchesSearch =
        !companySearch ||
        c.companyName?.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.contactEmail?.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.address?.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.phone?.toLowerCase().includes(companySearch.toLowerCase());
      return matchesVerify && matchesSearch;
    });
  }, [companiesList, companyVerifyFilter, companySearch]);

  const filteredRentals = useMemo(() => {
    return rentalsList.filter((r) => {
      return rentalStatusFilter === "all" || r.status === rentalStatusFilter;
    });
  }, [rentalsList, rentalStatusFilter]);

  const pendingCount = stats?.pendingApprovals?.vehicles ?? vehiclesList.filter((v) => v.status === "pending").length;

  return (
    <div className="admin-portal">
      {/* Top Navbar */}
      <header className="admin-header">
        <div className="admin-header-left">
          <Link to="/" className="admin-brand">
            <img
              src={draftConfig?.global?.logoUrl || "/logo.png"}
              alt="Logo"
              className="admin-logo-img"
            />
            <div>
              <div className="admin-brand-name">{draftConfig?.global?.brandName || "Yamu"}</div>
              <div className="admin-brand-tag">Super Admin Control Center</div>
            </div>
          </Link>
          <div className="admin-badge-pill">
            <ShieldCheck size={14} /> Ultimate Super Admin
          </div>
        </div>

        <div className="admin-header-right">
          {actionFeedback && (
            <div className="admin-toast-badge">
              <Check size={14} /> {actionFeedback}
            </div>
          )}

          {pendingCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("approvals")}
              className="admin-header-alert-btn"
              title={`${pendingCount} listing requests need your approval`}
            >
              <Bell size={15} className="bell-ring" />
              <span>{pendingCount} Pending Approvals</span>
            </button>
          )}

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-live-btn"
            title="Open live website in new tab"
          >
            <ExternalLink size={15} /> View Live Website
          </a>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="admin-logout-btn"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Global Super Admin Alert Notification Banner */}
      {stats?.pendingApprovals?.vehicles > 0 && (
        <div className="admin-urgent-banner">
          <div className="urgent-banner-content">
            <div className="urgent-icon">
              <Bell size={18} />
            </div>
            <div>
              <strong>Super Admin Action Required:</strong> You have{" "}
              <span className="urgent-highlight">{stats.pendingApprovals.vehicles} vehicle listing request(s)</span>{" "}
              submitted by listers awaiting your verification & approval before they go live on Yamu.
            </div>
          </div>
          <button
            type="button"
            className="btn-urgent-action"
            onClick={() => {
              setActiveTab("approvals");
              setApprovalFilter("pending");
            }}
          >
            Review & Approve Now →
          </button>
        </div>
      )}

      {/* Main Admin Body */}
      <div className="admin-layout">
        {/* Left Sidebar Tabs */}
        <aside className="admin-sidebar">
          <div className="sidebar-group-title">MAIN CONTROLS</div>
          <button
            type="button"
            className={`admin-nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <LayoutDashboard size={18} />
            <span>Overview & Analytics</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "approvals" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("approvals");
              fetchTabData("approvals");
            }}
          >
            <CheckCircle2 size={18} />
            <div className="nav-item-content">
              <span>Listing Approvals</span>
              {pendingCount > 0 && (
                <span className="approval-badge-count">{pendingCount}</span>
              )}
            </div>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "cms" ? "active" : ""}`}
            onClick={() => setActiveTab("cms")}
          >
            <Palette size={18} />
            <div className="nav-item-content">
              <span>Page Customizer CMS</span>
              <span className="cms-badge">Live Edit</span>
            </div>
          </button>

          <div className="sidebar-group-title">PLATFORM SUPERVISION</div>
          <button
            type="button"
            className={`admin-nav-item ${activeTab === "fleet" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("fleet");
              fetchTabData("fleet");
            }}
          >
            <Car size={18} />
            <span>Fleet & All Cars</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "companies" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("companies");
              fetchTabData("companies");
            }}
          >
            <Building2 size={18} />
            <div className="nav-item-content">
              <span>Companies & Partners</span>
              {stats?.companies?.pending > 0 && (
                <span className="pending-pill-sm">{stats.companies.pending}</span>
              )}
            </div>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "rentals" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("rentals");
              fetchTabData("rentals");
            }}
          >
            <KeyRound size={18} />
            <span>Rental Bookings</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("users");
              fetchTabData("users");
            }}
          >
            <Users size={18} />
            <span>User Management</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("reviews");
              fetchTabData("reviews");
            }}
          >
            <Star size={18} />
            <span>Reviews & Feedback</span>
          </button>

          <div className="sidebar-group-title">SYSTEM & BACKUPS</div>
          <button
            type="button"
            className={`admin-nav-item ${activeTab === "rollback" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("rollback");
              fetchTabData("rollback");
            }}
          >
            <History size={18} />
            <span>1-Click Rollback</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="admin-main">
          {/* TAB 1: ANALYTICS & COMMAND CENTER */}
          {activeTab === "analytics" && (
            <div className="tab-pane analytics-pane">
              <div className="pane-header">
                <div>
                  <h2>Platform Command Center</h2>
                  <p>Real-time metrics, platform health, and key performance indicators.</p>
                </div>
                <button type="button" onClick={fetchStats} className="btn-secondary-sm">
                  <RefreshCw size={14} /> Refresh Data
                </button>
              </div>

              {/* KPI Stat Cards */}
              <div className="admin-kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon-wrap kpi-orange">
                    <Car size={24} />
                  </div>
                  <div className="kpi-info">
                    <div className="kpi-num">{stats?.vehicles?.total ?? "..."}</div>
                    <div className="kpi-label">Total Vehicles Listed</div>
                    <div className="kpi-sub">
                      <span>★ {stats?.vehicles?.featured ?? 0}</span> featured • {stats?.vehicles?.active ?? 0} live
                    </div>
                  </div>
                </div>

                <div className={`kpi-card ${pendingCount > 0 ? "kpi-card-urgent" : ""}`}>
                  <div className="kpi-icon-wrap kpi-amber">
                    <Bell size={24} />
                  </div>
                  <div className="kpi-info">
                    <div className="kpi-num">{pendingCount}</div>
                    <div className="kpi-label">Pending Car Approvals</div>
                    <div className="kpi-sub">
                      {pendingCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("approvals");
                            setApprovalFilter("pending");
                          }}
                          className="kpi-link-btn"
                        >
                          Review Now →
                        </button>
                      ) : (
                        <span className="text-green">All listings reviewed!</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-wrap kpi-blue">
                    <Building2 size={24} />
                  </div>
                  <div className="kpi-info">
                    <div className="kpi-num">{stats?.companies?.total ?? "..."}</div>
                    <div className="kpi-label">Rental Companies</div>
                    <div className="kpi-sub">
                      <span className="text-green">✓ {stats?.companies?.verified ?? 0} verified</span>
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-wrap kpi-green">
                    <Users size={24} />
                  </div>
                  <div className="kpi-info">
                    <div className="kpi-num">{stats?.users?.total ?? "..."}</div>
                    <div className="kpi-label">Registered Users</div>
                    <div className="kpi-sub">
                      {stats?.users?.renters ?? 0} Renters • {stats?.users?.owners ?? 0} Hosts
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-wrap kpi-emerald">
                    <DollarSign size={24} />
                  </div>
                  <div className="kpi-info">
                    <div className="kpi-num">
                      Rs. {stats?.rentals?.totalRevenue ? (stats.rentals.totalRevenue >= 1000000 ? `${(stats.rentals.totalRevenue / 1000000).toFixed(1)}M` : stats.rentals.totalRevenue.toLocaleString()) : "0"}
                    </div>
                    <div className="kpi-label">Platform Bookings Value</div>
                    <div className="kpi-sub">
                      {stats?.rentals?.total ?? 0} total bookings ({stats?.rentals?.active ?? 0} active)
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-wrap kpi-purple">
                    <Star size={24} />
                  </div>
                  <div className="kpi-info">
                    <div className="kpi-num">{stats?.reviews?.averageRating ?? "5.0"}</div>
                    <div className="kpi-label">Average Fleet Rating</div>
                    <div className="kpi-sub">{stats?.reviews?.total ?? 0} verified reviews</div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="admin-charts-grid">
                <div className="chart-card">
                  <div className="chart-title">Fleet Breakdown by Vehicle Type</div>
                  <div className="chart-container">
                    {stats?.vehicles?.byType && stats.vehicles.byType.length > 0 ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={stats.vehicles.byType}>
                          <XAxis dataKey="_id" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip
                            contentStyle={{
                              background: "#0f172a",
                              border: "none",
                              borderRadius: "8px",
                              color: "#fff",
                            }}
                          />
                          <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="chart-empty">No vehicle distribution data yet</div>
                    )}
                  </div>
                </div>

                <div className="chart-card">
                  <div className="chart-title">User Roles Distribution</div>
                  <div className="chart-container">
                    {stats?.users ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Renters", value: stats.users.renters || 0 },
                              { name: "Car Owners", value: stats.users.owners || 0 },
                              { name: "Companies", value: stats.users.companies || 0 },
                              { name: "Admins", value: stats.users.admins || 0 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={4}
                            dataKey="value"
                            label
                          >
                            {COLORS.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "#0f172a",
                              border: "none",
                              borderRadius: "8px",
                              color: "#fff",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="chart-empty">Loading user role breakdown...</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity-card">
                <div className="chart-title">Recent Registered Users & Activity</div>
                <div className="activity-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recent?.users && stats.recent.users.length > 0 ? (
                        stats.recent.users.map((u) => (
                          <tr key={u._id}>
                            <td className="font-semibold">{u.name}</td>
                            <td className="text-muted">{u.email}</td>
                            <td>
                              <span className={`role-tag role-${u.role}`}>{u.role}</span>
                            </td>
                            <td className="text-muted">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            No recent activity found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAGE CUSTOMIZER CMS */}
          {activeTab === "cms" && (
            <div className="tab-pane cms-pane">
              <div className="cms-toolbar">
                <div className="cms-tabs-scroll">
                  {[
                    { id: "festivals", label: "🎄 Festival Accessories" },
                    { id: "theme", label: "🎨 Theme & Holiday Presets" },
                    { id: "global", label: "📢 Global & Announcements" },
                    { id: "hero", label: "🚗 Hero Stage & Watermark" },
                    { id: "categories", label: "🏷️ 6 Home Categories" },
                    { id: "stats", label: "📈 Home Stats & Cards" },
                    { id: "testimonials", label: "⭐ 3 Home Testimonials" },
                    { id: "filters", label: "🔍 Search Filter Images" },
                    { id: "companies", label: "🏢 Companies & City Pills" },
                    { id: "faqs", label: "❓ Why Us & FAQs" },
                    { id: "footer", label: "📄 Footer & Contact" },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      className={`cms-sub-tab ${cmsSection === sec.id ? "active" : ""}`}
                      onClick={() => setCmsSection(sec.id)}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>

                <div className="cms-actions-bar">
                  <button
                    type="button"
                    onClick={handleSaveCMS}
                    disabled={saving}
                    className="btn-save-cms"
                  >
                    <Save size={16} />
                    {saving ? "Saving Changes..." : "Publish Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="btn-icon-cms"
                    title="Export backup as JSON"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div className="cms-alert-success">
                  <CheckCircle size={18} />
                  <span>
                    <strong>Changes Published!</strong> Your live website has updated immediately
                    without needing a rebuild or code commit.
                  </span>
                </div>
              )}

              {saveError && (
                <div className="cms-alert-error">
                  <AlertTriangle size={18} />
                  <span>{saveError}</span>
                </div>
              )}

              {/* CMS Split-Screen Layout */}
              <div className="cms-split-container">
                {/* Left Column: Form Editor */}
                <div className="cms-editor-column">
                  {/* FESTIVAL CELEBRATION ACCESSORIES */}
                  {cmsSection === "festivals" && (
                    <div className="cms-form-section">
                      <div className="section-intro">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3>🎄 Festival Celebration Themes & Accessories</h3>
                            <p>
                              Overlay celebratory festive accessories across the Yamu platform
                              without changing your brand's core color palette or typography.
                            </p>
                          </div>
                          {draftConfig?.global?.festivalTheme?.active &&
                            draftConfig?.global?.festivalTheme?.active !== "none" && (
                              <span className="badge-active-festival">
                                Active: {draftConfig?.global?.festivalTheme?.active?.toUpperCase()}
                              </span>
                            )}
                        </div>
                      </div>

                      {/* Festival Mode Selector Cards */}
                      <div className="festival-selector-grid">
                        {/* None / Standard */}
                        <div
                          className={`festival-card ${
                            !draftConfig?.global?.festivalTheme?.active ||
                            draftConfig?.global?.festivalTheme?.active === "none"
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => handleDraftChange("global.festivalTheme.active", "none")}
                        >
                          <div className="festival-card-header">
                            <span className="festival-icon">🚫</span>
                            <div>
                              <h4>Standard Site (Off)</h4>
                              <p>No holiday accessories active</p>
                            </div>
                          </div>
                          {(!draftConfig?.global?.festivalTheme?.active ||
                            draftConfig?.global?.festivalTheme?.active === "none") && (
                            <span className="festival-badge-active">Selected</span>
                          )}
                        </div>

                        {/* Christmas */}
                        <div
                          className={`festival-card ${
                            draftConfig?.global?.festivalTheme?.active === "christmas"
                              ? "selected active-xmas"
                              : ""
                          }`}
                          onClick={() => handleDraftChange("global.festivalTheme.active", "christmas")}
                        >
                          <div className="festival-card-header">
                            <span className="festival-icon">🎄</span>
                            <div>
                              <h4>Christmas Celebration</h4>
                              <p>Floating vector tree, golden bells, baubles & snow</p>
                            </div>
                          </div>
                          {draftConfig?.global?.festivalTheme?.active === "christmas" ? (
                            <span className="festival-badge-active" style={{ background: "#059669" }}>
                              Active
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn-select-festival"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDraftChange("global.festivalTheme.active", "christmas");
                              }}
                            >
                              Activate
                            </button>
                          )}
                        </div>

                        {/* Avurudu (Upcoming) */}
                        <div className="festival-card disabled">
                          <div className="festival-card-header">
                            <span className="festival-icon">☀️</span>
                            <div>
                              <h4>Sinhala & Tamil New Year</h4>
                              <p>Avurudu celebration accessories</p>
                            </div>
                          </div>
                          <span className="festival-badge-soon">Coming Soon</span>
                        </div>

                        {/* Vesak Poya Celebration */}
                        <div
                          className={`festival-card ${
                            draftConfig?.global?.festivalTheme?.active === "vesak"
                              ? "selected active-vesak"
                              : ""
                          }`}
                          onClick={() => handleDraftChange("global.festivalTheme.active", "vesak")}
                        >
                          <div className="festival-card-header">
                            <span className="festival-icon">🏮</span>
                            <div>
                              <h4>Vesak Poya Celebration</h4>
                              <p>Vesak kudu, blooming lotus, flag & light garland</p>
                            </div>
                          </div>
                          {draftConfig?.global?.festivalTheme?.active === "vesak" ? (
                            <span className="festival-badge-active" style={{ background: "#D97706" }}>
                              Active
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn-select-festival"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDraftChange("global.festivalTheme.active", "vesak");
                              }}
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="cms-divider" />

                      {/* Christmas Customization Controls */}
                      {draftConfig?.global?.festivalTheme?.active === "christmas" ? (
                        <div className="festival-customization-panel">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span>🎅</span> Christmas Accessories Customization
                              </h4>
                              <p className="text-sm text-gray-500">
                                Toggle specific accessories on or off to achieve the exact festive feel you want.
                              </p>
                            </div>
                            <button
                              type="button"
                              className="btn-text-danger"
                              onClick={() => handleDraftChange("global.festivalTheme.active", "none")}
                            >
                              Turn Off Christmas Mode
                            </button>
                          </div>

                          <div className="accessory-toggles-list">
                            {/* Accessory 1: Vector Christmas Tree */}
                            <div className="accessory-toggle-card">
                              <div className="toggle-box">
                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    checked={
                                      draftConfig?.global?.festivalTheme?.christmas?.showTree !== false
                                    }
                                    onChange={(e) =>
                                      handleDraftChange(
                                        "global.festivalTheme.christmas.showTree",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="slider round" />
                                </label>
                                <div className="flex-1">
                                  <strong>🎄 Floating Vector Christmas Tree</strong>
                                  <div className="text-muted text-sm">
                                    Floating animated evergreen tree with glowing yellow star, emerald gradients, and twinkling multicolored fairy lights.
                                  </div>
                                </div>
                              </div>

                              {draftConfig?.global?.festivalTheme?.christmas?.showTree !== false && (
                                <div className="mt-3 pl-12">
                                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1">
                                    Screen Placement:
                                  </label>
                                  <select
                                    className="festival-select"
                                    value={
                                      draftConfig?.global?.festivalTheme?.christmas?.treePosition ||
                                      "bottom-left"
                                    }
                                    onChange={(e) =>
                                      handleDraftChange(
                                        "global.festivalTheme.christmas.treePosition",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="bottom-left">
                                      Bottom Left (Recommended - doesn't clash with WhatsApp)
                                    </option>
                                    <option value="bottom-right">
                                      Bottom Right (Floating above WhatsApp button)
                                    </option>
                                    <option value="top-right">
                                      Top Right (Floating under header)
                                    </option>
                                  </select>
                                </div>
                              )}
                            </div>

                            {/* Accessory 2: Golden Christmas Bells */}
                            <div className="accessory-toggle-card">
                              <div className="toggle-box">
                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    checked={
                                      draftConfig?.global?.festivalTheme?.christmas?.showBells !== false
                                    }
                                    onChange={(e) =>
                                      handleDraftChange(
                                        "global.festivalTheme.christmas.showBells",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="slider round" />
                                </label>
                                <div className="flex-1">
                                  <strong>🔔 Golden Christmas Bells with Satin Ribbon & Holly</strong>
                                  <div className="text-muted text-sm">
                                    Pair of metallic gold ringing bells with swinging clappers, satin red bow ribbon, emerald holly leaves, red berries, and gold sparkles floating near the top right.
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Accessory 3: Hanging Baubles & Ornaments */}
                            <div className="accessory-toggle-card">
                              <div className="toggle-box">
                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    checked={
                                      draftConfig?.global?.festivalTheme?.christmas?.showOrnaments !== false
                                    }
                                    onChange={(e) =>
                                      handleDraftChange(
                                        "global.festivalTheme.christmas.showOrnaments",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="slider round" />
                                </label>
                                <div className="flex-1">
                                  <strong>🪩 Hanging Glass Baubles & Ornaments</strong>
                                  <div className="text-muted text-sm">
                                    Emerald green, royal crimson, and metallic gold baubles with golden caps suspended from the top edge with gentle pendulum sway and shimmer arcs.
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Accessory 4: Ambient Snowfall */}
                            <div className="accessory-toggle-card">
                              <div className="toggle-box">
                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    checked={
                                      draftConfig?.global?.festivalTheme?.christmas?.showSnow !== false
                                    }
                                    onChange={(e) =>
                                      handleDraftChange(
                                        "global.festivalTheme.christmas.showSnow",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="slider round" />
                                </label>
                                <div className="flex-1">
                                  <strong>❄️ Ambient Gentle Snowfall Effect</strong>
                                  <div className="text-muted text-sm">
                                    Subtle, lightweight translucent falling snowflakes for an immersive winter celebration atmosphere.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : draftConfig?.global?.festivalTheme?.active === "vesak" ? (
                        <div className="festival-customization-panel">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span>☸️</span> Sacred Vesak Accessories Customization
                              </h4>
                              <p className="text-sm text-gray-500">
                                Toggle sacred Vesak celebration accessories on or off to create your desired festival mood.
                              </p>
                            </div>
                            <button
                              type="button"
                              className="btn-text-danger"
                              onClick={() => handleDraftChange("global.festivalTheme.active", "none")}
                            >
                              Turn Off Vesak Mode
                            </button>
                          </div>

                          <div className="accessory-toggles-list">
                            {/* Accessory 1: Octagonal Vesak Lantern */}
                            <div className="accessory-toggle-card">
                              <div className="toggle-box">
                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    checked={
                                      draftConfig?.global?.festivalTheme?.vesak?.showLantern !== false
                                    }
                                    onChange={(e) =>
                                      handleDraftChange(
                                        "global.festivalTheme.vesak.showLantern",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="slider round" />
                                </label>
                                <div className="flex-1">
                                  <strong>🏮 Octagonal Vesak Lantern (Vesak Kudu)</strong>
                                  <div className="text-muted text-sm">
                                    Traditional Sri Lankan hanging paper lantern with candle flame core glow, colorful octagonal panels, surrounding petals, and flowing waving streamers.
                                  </div>
                                </div>
                              </div>

                              {draftConfig?.global?.festivalTheme?.vesak?.showLantern !== false && (
                                <div className="mt-3 pl-12">
                                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1">
                                    Lantern Screen Position:
                                  </label>
                                  <select
                                    className="festival-select"
                                    value={
                                      draftConfig?.global?.festivalTheme?.vesak?.lanternPosition ||
                                      "top-right"
                                    }
                                    onChange={(e) =>
                                      handleDraftChange(
                                        "global.festivalTheme.vesak.lanternPosition",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="top-right">Top Right (Hanging near navigation)</option>
                                    <option value="top-left">Top Left (Hanging from top bar)</option>
                                    <option value="bottom-right">Bottom Right (Above WhatsApp button)</option>
                                  </select>
                                </div>
                              )}
                            </div>

                            {/* Accessory 2: Sacred Blooming Lotus */}
                            <div className="accessory-toggle-card">
                              <div className="toggle-box">
                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    checked={
                                      draftConfig?.global?.festivalTheme?.vesak?.showLotus !== false
                                    }
                                    onChange={(e) =>
                                      handleDraftChange(
                                        "global.festivalTheme.vesak.showLotus",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="slider round" />
                                </label>
                                <div className="flex-1">
                                  <strong>🪷 Sacred Blooming Lotus Flower (Nelum Mala)</strong>
                                  <div className="text-muted text-sm">
                                    Sacred pink & golden lotus floating gracefully on green pad with water ripple rings, radiating peaceful aura, and breathing petals.
                                  </div>
                                </div>
                              </div>

                              {draftConfig?.global?.festivalTheme?.vesak?.showLotus !== false && (
                                <div className="mt-3 pl-12">
                                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1">
                                    Lotus Placement:
                                  </label>
                                  <select
                                    className="festival-select"
                                    value={
                                      draftConfig?.global?.festivalTheme?.vesak?.lotusPosition ||
                                      "bottom-left"
                                    }
                                    onChange={(e) =>
                                      handleDraftChange(
                                        "global.festivalTheme.vesak.lotusPosition",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="bottom-left">Bottom Left (Floating serenely - Recommended)</option>
                                    <option value="bottom-right">Bottom Right (Floating on water)</option>
                                  </select>
                                </div>
                              )}
                            </div>

                            {/* Accessory 3: Buddhist Flag */}
                            <div className="accessory-toggle-card">
                              <div className="toggle-box">
                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    checked={
                                      draftConfig?.global?.festivalTheme?.vesak?.showFlag !== false
                                    }
                                    onChange={(e) =>
                                      handleDraftChange(
                                        "global.festivalTheme.vesak.showFlag",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="slider round" />
                                </label>
                                <div className="flex-1">
                                  <strong>☸️ Waving Six-Color Buddhist Flag (Sadaham Kodiy)</strong>
                                  <div className="text-muted text-sm">
                                    Authentic Buddhist flag fluttering gently on silver flagpole with gold finial and cloth wave shimmer.
                                  </div>
                                </div>
                              </div>

                              {draftConfig?.global?.festivalTheme?.vesak?.showFlag !== false && (
                                <div className="mt-3 pl-12">
                                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1">
                                    Flag Placement:
                                  </label>
                                  <select
                                    className="festival-select"
                                    value={
                                      draftConfig?.global?.festivalTheme?.vesak?.flagPosition ||
                                      "top-left"
                                    }
                                    onChange={(e) =>
                                      handleDraftChange(
                                        "global.festivalTheme.vesak.flagPosition",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="top-left">Top Left (Opposite lantern)</option>
                                    <option value="top-right">Top Right</option>
                                  </select>
                                </div>
                              )}
                            </div>

                            {/* Accessory 4: Illuminated Light Garland */}
                            <div className="accessory-toggle-card">
                              <div className="toggle-box">
                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    checked={
                                      draftConfig?.global?.festivalTheme?.vesak?.showLightString !== false
                                    }
                                    onChange={(e) =>
                                      handleDraftChange(
                                        "global.festivalTheme.vesak.showLightString",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="slider round" />
                                </label>
                                <div className="flex-1">
                                  <strong>💡 Illuminated Top Vesak Garland (Buddhist Flag Bulbs)</strong>
                                  <div className="text-muted text-sm">
                                    Delicate string of pulsating illuminated light bulbs in the 6 sacred Buddhist flag colors (Blue, Yellow, Red, White, Orange) across the top of the screen.
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Accessory 5: Golden Light Particles */}
                            <div className="accessory-toggle-card">
                              <div className="toggle-box">
                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    checked={
                                      draftConfig?.global?.festivalTheme?.vesak?.showParticles !== false
                                    }
                                    onChange={(e) =>
                                      handleDraftChange(
                                        "global.festivalTheme.vesak.showParticles",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="slider round" />
                                </label>
                                <div className="flex-1">
                                  <strong>✨ Ascending Golden Pahan Embers / Light Particles</strong>
                                  <div className="text-muted text-sm">
                                    Luminous floating golden clay lamp embers and warm bokeh particles gently ascending upward across the entire webpage.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="festival-empty-notice">
                          <p className="text-gray-500 text-sm">
                            Click <strong>Christmas Celebration</strong> or <strong>Vesak Poya Celebration</strong> above to activate and configure animated festival accessories.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 1. THEME & HOLIDAY PRESETS */}
                  {cmsSection === "theme" && (
                    <div className="cms-form-section">
                      {/* Festive accessories banner */}
                      <div className="p-4 mb-5 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-gradient-to-r from-amber-50/70 to-emerald-50/70 dark:from-amber-950/20 dark:to-emerald-950/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🏮</span>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                              Looking for Vesak or Christmas Celebration Accessories?
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Toggle animated Vesak lanterns, lotus, flags, or Christmas trees without changing your brand palette!
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition"
                          onClick={() => setCmsSection("festivals")}
                        >
                          Open Festival Accessories →
                        </button>
                      </div>

                      <div className="section-intro">
                        <h3>1-Click Holiday & Seasonal Theme Switcher</h3>
                        <p>
                          Switch the entire website's mood, color palette, and banners in 1 click for
                          special occasions like Avurudu or Christmas.
                        </p>
                      </div>

                      <div className="theme-presets-grid">
                        {Object.entries(HOLIDAY_THEME_PRESETS).map(([key, p]) => (
                          <div
                            key={key}
                            className={`theme-preset-card ${
                              draftConfig?.global?.themePreset === key ? "selected" : ""
                            }`}
                            onClick={() => handleApplyPresetTheme(key)}
                          >
                            <div className="preset-header">
                              <span className="preset-name">{p.name}</span>
                              {draftConfig?.global?.themePreset === key && (
                                <span className="preset-active-tag">Active</span>
                              )}
                            </div>
                            <div className="preset-color-swatches">
                              <span style={{ background: p.primary }} title="Primary" />
                              <span style={{ background: p.primaryDark }} title="Primary Dark" />
                              <span style={{ background: p.primaryLight }} title="Primary Light" />
                              <span style={{ background: p.accent }} title="Accent" />
                            </div>
                            <div className="preset-ticker-sample">{p.announcementText}</div>
                          </div>
                        ))}
                      </div>

                      <div className="cms-divider" />

                      <div className="section-intro">
                        <h3>Custom Color Palette (Hex Codes)</h3>
                        <p>Customize exact hex colors if you don't want a preset.</p>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Primary Brand Color</label>
                          <div className="color-picker-input">
                            <input
                              type="color"
                              value={draftConfig?.global?.primaryColor || "#f97316"}
                              onChange={(e) =>
                                handleDraftChange("global.primaryColor", e.target.value)
                              }
                            />
                            <input
                              type="text"
                              value={draftConfig?.global?.primaryColor || "#f97316"}
                              onChange={(e) =>
                                handleDraftChange("global.primaryColor", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Primary Dark Gradient</label>
                          <div className="color-picker-input">
                            <input
                              type="color"
                              value={draftConfig?.global?.primaryDark || "#ea580c"}
                              onChange={(e) =>
                                handleDraftChange("global.primaryDark", e.target.value)
                              }
                            />
                            <input
                              type="text"
                              value={draftConfig?.global?.primaryDark || "#ea580c"}
                              onChange={(e) =>
                                handleDraftChange("global.primaryDark", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Primary Light Glow</label>
                          <div className="color-picker-input">
                            <input
                              type="color"
                              value={draftConfig?.global?.primaryLight || "#fb923c"}
                              onChange={(e) =>
                                handleDraftChange("global.primaryLight", e.target.value)
                              }
                            />
                            <input
                              type="text"
                              value={draftConfig?.global?.primaryLight || "#fb923c"}
                              onChange={(e) =>
                                handleDraftChange("global.primaryLight", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Accent Highlights Color</label>
                          <div className="color-picker-input">
                            <input
                              type="color"
                              value={draftConfig?.global?.accentColor || "#10b981"}
                              onChange={(e) =>
                                handleDraftChange("global.accentColor", e.target.value)
                              }
                            />
                            <input
                              type="text"
                              value={draftConfig?.global?.accentColor || "#10b981"}
                              onChange={(e) =>
                                handleDraftChange("global.accentColor", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. GLOBAL & ANNOUNCEMENTS */}
                  {cmsSection === "global" && (
                    <div className="cms-form-section">
                      <div className="section-intro">
                        <h3>Brand & Top Announcement Bar</h3>
                        <p>Configure company brand name, logo, and top-of-site banner.</p>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Brand Name</label>
                          <input
                            type="text"
                            value={draftConfig?.global?.brandName || ""}
                            onChange={(e) => handleDraftChange("global.brandName", e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Brand Tagline</label>
                          <input
                            type="text"
                            value={draftConfig?.global?.brandTagline || ""}
                            onChange={(e) =>
                              handleDraftChange("global.brandTagline", e.target.value)
                            }
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>Logo Image URL / Path</label>
                          <input
                            type="text"
                            value={draftConfig?.global?.logoUrl || ""}
                            onChange={(e) => handleDraftChange("global.logoUrl", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="cms-divider" />

                      <div className="section-intro">
                        <h3>Top Announcement Ticker Banner</h3>
                      </div>

                      <div className="toggle-box">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={draftConfig?.global?.announcement?.enabled || false}
                            onChange={(e) =>
                              handleDraftChange("global.announcement.enabled", e.target.checked)
                            }
                          />
                          <span className="slider round" />
                        </label>
                        <div>
                          <strong>Show Top Announcement Banner</strong>
                          <div className="text-muted text-sm">
                            Displays a highlighted promo banner at the very top of all pages.
                          </div>
                        </div>
                      </div>

                      {draftConfig?.global?.announcement?.enabled && (
                        <div className="form-grid-2 mt-4">
                          <div className="form-group full-width">
                            <label>Banner Text</label>
                            <input
                              type="text"
                              value={draftConfig?.global?.announcement?.text || ""}
                              onChange={(e) =>
                                handleDraftChange("global.announcement.text", e.target.value)
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>Banner Link (optional)</label>
                            <input
                              type="text"
                              value={draftConfig?.global?.announcement?.link || ""}
                              onChange={(e) =>
                                handleDraftChange("global.announcement.link", e.target.value)
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>Banner Background Color</label>
                            <div className="color-picker-input">
                              <input
                                type="color"
                                value={
                                  draftConfig?.global?.announcement?.bgColor || "var(--primary)"
                                }
                                onChange={(e) =>
                                  handleDraftChange("global.announcement.bgColor", e.target.value)
                                }
                              />
                              <input
                                type="text"
                                value={
                                  draftConfig?.global?.announcement?.bgColor || "var(--primary)"
                                }
                                onChange={(e) =>
                                  handleDraftChange("global.announcement.bgColor", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="cms-divider" />

                      <div className="section-intro">
                        <h3>WhatsApp Floating Quick-Chat Widget</h3>
                      </div>

                      <div className="toggle-box">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={draftConfig?.global?.whatsAppSupport?.enabled ?? true}
                            onChange={(e) =>
                              handleDraftChange("global.whatsAppSupport.enabled", e.target.checked)
                            }
                          />
                          <span className="slider round" />
                        </label>
                        <div>
                          <strong>Enable Floating WhatsApp Button</strong>
                          <div className="text-muted text-sm">
                            Allows customers to message your team directly in 1 click.
                          </div>
                        </div>
                      </div>

                      {draftConfig?.global?.whatsAppSupport?.enabled && (
                        <div className="form-grid-2 mt-4">
                          <div className="form-group">
                            <label>WhatsApp Phone Number (with country code)</label>
                            <input
                              type="text"
                              placeholder="+94770000000"
                              value={draftConfig?.global?.whatsAppSupport?.phoneNumber || ""}
                              onChange={(e) =>
                                handleDraftChange(
                                  "global.whatsAppSupport.phoneNumber",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>Default Greeting Message</label>
                            <input
                              type="text"
                              value={draftConfig?.global?.whatsAppSupport?.greetingMessage || ""}
                              onChange={(e) =>
                                handleDraftChange(
                                  "global.whatsAppSupport.greetingMessage",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. HERO STAGE */}
                  {cmsSection === "hero" && (
                    <div className="cms-form-section">
                      <div className="section-intro">
                        <h3>Hero Stage & Watermark</h3>
                        <p>Customize the high-impact visual entrance on the homepage.</p>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Massive Watermark Text</label>
                          <input
                            type="text"
                            value={draftConfig?.hero?.watermarkText || "YAMU"}
                            onChange={(e) =>
                              handleDraftChange("hero.watermarkText", e.target.value)
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>Top Tagline</label>
                          <input
                            type="text"
                            value={draftConfig?.hero?.taglineTop || ""}
                            onChange={(e) => handleDraftChange("hero.taglineTop", e.target.value)}
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>Bottom Main Tagline</label>
                          <input
                            type="text"
                            value={draftConfig?.hero?.taglineBottom || ""}
                            onChange={(e) =>
                              handleDraftChange("hero.taglineBottom", e.target.value)
                            }
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>Foreground Fleet Cutout PNG Image URL (Leave blank for default)</label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={draftConfig?.hero?.fleetCutoutUrl || ""}
                            onChange={(e) =>
                              handleDraftChange("hero.fleetCutoutUrl", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="cms-divider" />

                      <div className="section-intro">
                        <h3>Quick-Search Popular Chips</h3>
                        <p>Pills displayed under the search card to guide users.</p>
                      </div>

                      <div className="chips-editor">
                        {draftConfig?.hero?.popularSearchChips?.map((chip, idx) => (
                          <div key={idx} className="chip-row">
                            <input
                              type="text"
                              value={chip}
                              onChange={(e) => {
                                const newChips = [...draftConfig.hero.popularSearchChips];
                                newChips[idx] = e.target.value;
                                handleDraftChange("hero.popularSearchChips", newChips);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newChips = draftConfig.hero.popularSearchChips.filter(
                                  (_, i) => i !== idx
                                );
                                handleDraftChange("hero.popularSearchChips", newChips);
                              }}
                              className="btn-trash"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newChips = [
                              ...(draftConfig?.hero?.popularSearchChips || []),
                              "New Search Pill",
                            ];
                            handleDraftChange("hero.popularSearchChips", newChips);
                          }}
                          className="btn-add-item"
                        >
                          <Plus size={14} /> Add Quick-Search Pill
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 4. THE 6 HOMEPAGE CATEGORIES */}
                  {cmsSection === "categories" && (
                    <div className="cms-form-section">
                      <div className="section-intro">
                        <h3>The 6 Highlighted Category Slots</h3>
                        <p>
                          Pick exactly which 6 vehicle categories appear beside "View all
                          categories" on the homepage, along with custom labels and preview photos.
                        </p>
                      </div>

                      <div className="category-slots-grid">
                        {draftConfig?.home?.categories?.map((cat, idx) => (
                          <div key={idx} className="category-slot-card">
                            <div className="slot-badge">Slot #{idx + 1}</div>

                            <div className="form-group mt-2">
                              <label>Linked Vehicle Type</label>
                              <select
                                value={cat.vehicleType || "car"}
                                onChange={(e) => {
                                  const newCats = [...draftConfig.home.categories];
                                  newCats[idx] = { ...newCats[idx], vehicleType: e.target.value };
                                  handleDraftChange("home.categories", newCats);
                                }}
                              >
                                {VEHICLE_TYPES.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.label} ({t.id})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="form-group">
                              <label>Display Label</label>
                              <input
                                type="text"
                                value={cat.label || ""}
                                onChange={(e) => {
                                  const newCats = [...draftConfig.home.categories];
                                  newCats[idx] = { ...newCats[idx], label: e.target.value };
                                  handleDraftChange("home.categories", newCats);
                                }}
                              />
                            </div>

                            <div className="form-group">
                              <label>Preview Image URL</label>
                              <input
                                type="text"
                                value={cat.image || ""}
                                onChange={(e) => {
                                  const newCats = [...draftConfig.home.categories];
                                  newCats[idx] = { ...newCats[idx], image: e.target.value };
                                  handleDraftChange("home.categories", newCats);
                                }}
                              />
                            </div>

                            {cat.image && (
                              <div className="cat-img-preview">
                                <img src={cat.image} alt={cat.label} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. HOMEPAGE STATS & CTA */}
                  {cmsSection === "stats" && (
                    <div className="cms-form-section">
                      <div className="section-intro">
                        <h3>Homepage 4 Stats Counters</h3>
                        <p>Customize the metrics displayed below the hero section.</p>
                      </div>

                      <div className="form-grid-2">
                        {draftConfig?.home?.stats?.map((stat, idx) => (
                          <div key={idx} className="stat-edit-box">
                            <div className="stat-edit-header">Stat #{idx + 1}</div>
                            <div className="form-group mt-2">
                              <label>Counter Number (e.g. 500+)</label>
                              <input
                                type="text"
                                value={stat.number || ""}
                                onChange={(e) => {
                                  const newStats = [...draftConfig.home.stats];
                                  newStats[idx] = { ...newStats[idx], number: e.target.value };
                                  handleDraftChange("home.stats", newStats);
                                }}
                              />
                            </div>
                            <div className="form-group">
                              <label>Label</label>
                              <input
                                type="text"
                                value={stat.label || ""}
                                onChange={(e) => {
                                  const newStats = [...draftConfig.home.stats];
                                  newStats[idx] = { ...newStats[idx], label: e.target.value };
                                  handleDraftChange("home.stats", newStats);
                                }}
                              />
                            </div>
                            <div className="form-group">
                              <label>Short Description</label>
                              <input
                                type="text"
                                value={stat.desc || ""}
                                onChange={(e) => {
                                  const newStats = [...draftConfig.home.stats];
                                  newStats[idx] = { ...newStats[idx], desc: e.target.value };
                                  handleDraftChange("home.stats", newStats);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="cms-divider" />

                      <div className="section-intro">
                        <h3>Bottom Call to Action Banner</h3>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group full-width">
                          <label>Headline</label>
                          <input
                            type="text"
                            value={draftConfig?.home?.bottomCta?.title || ""}
                            onChange={(e) =>
                              handleDraftChange("home.bottomCta.title", e.target.value)
                            }
                          />
                        </div>
                        <div className="form-group full-width">
                          <label>Subtitle</label>
                          <input
                            type="text"
                            value={draftConfig?.home?.bottomCta?.subtitle || ""}
                            onChange={(e) =>
                              handleDraftChange("home.bottomCta.subtitle", e.target.value)
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Primary Button Label</label>
                          <input
                            type="text"
                            value={draftConfig?.home?.bottomCta?.buttonText || ""}
                            onChange={(e) =>
                              handleDraftChange("home.bottomCta.buttonText", e.target.value)
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Lister Button Label</label>
                          <input
                            type="text"
                            value={draftConfig?.home?.bottomCta?.listerButtonText || ""}
                            onChange={(e) =>
                              handleDraftChange("home.bottomCta.listerButtonText", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. THE 3 HOMEPAGE TESTIMONIALS */}
                  {cmsSection === "testimonials" && (
                    <div className="cms-form-section">
                      <div className="section-intro">
                        <h3>The 3 Featured Customer Testimonials</h3>
                        <p>
                          Pick and customize the 3 customer reviews highlighted on the homepage.
                        </p>
                      </div>

                      <div className="testimonials-editor-list">
                        {draftConfig?.home?.testimonials?.map((t, idx) => (
                          <div key={idx} className="testimonial-edit-card">
                            <div className="test-header">
                              <span className="slot-badge">Testimonial #{idx + 1}</span>
                              <div className="stars-picker">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={16}
                                    className={`star-icon ${
                                      s <= (t.rating || 5) ? "filled" : "empty"
                                    }`}
                                    onClick={() => {
                                      const newTests = [...draftConfig.home.testimonials];
                                      newTests[idx] = { ...newTests[idx], rating: s };
                                      handleDraftChange("home.testimonials", newTests);
                                    }}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="form-grid-2 mt-3">
                              <div className="form-group">
                                <label>Customer Name</label>
                                <input
                                  type="text"
                                  value={t.name || ""}
                                  onChange={(e) => {
                                    const newTests = [...draftConfig.home.testimonials];
                                    newTests[idx] = { ...newTests[idx], name: e.target.value };
                                    handleDraftChange("home.testimonials", newTests);
                                  }}
                                />
                              </div>

                              <div className="form-group">
                                <label>City / Location (e.g. Colombo, Kandy)</label>
                                <input
                                  type="text"
                                  value={t.location || ""}
                                  onChange={(e) => {
                                    const newTests = [...draftConfig.home.testimonials];
                                    newTests[idx] = { ...newTests[idx], location: e.target.value };
                                    handleDraftChange("home.testimonials", newTests);
                                  }}
                                />
                              </div>

                              <div className="form-group full-width">
                                <label>Avatar Photo URL</label>
                                <input
                                  type="text"
                                  value={t.avatar || ""}
                                  onChange={(e) => {
                                    const newTests = [...draftConfig.home.testimonials];
                                    newTests[idx] = { ...newTests[idx], avatar: e.target.value };
                                    handleDraftChange("home.testimonials", newTests);
                                  }}
                                />
                              </div>

                              <div className="form-group full-width">
                                <label>Review Quote Text</label>
                                <textarea
                                  rows={3}
                                  value={t.text || ""}
                                  onChange={(e) => {
                                    const newTests = [...draftConfig.home.testimonials];
                                    newTests[idx] = { ...newTests[idx], text: e.target.value };
                                    handleDraftChange("home.testimonials", newTests);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 7. VEHICLE SEARCH FILTER IMAGES */}
                  {cmsSection === "filters" && (
                    <div className="cms-form-section">
                      <div className="section-intro">
                        <h3>Vehicle Filter Pill Thumbnails</h3>
                        <p>
                          Customize the thumbnail images for all 8 vehicle type filter pills on the
                          Search & Fleet page (`/vehicles`).
                        </p>
                      </div>

                      <div className="form-grid-2">
                        {VEHICLE_TYPES.map((vt) => (
                          <div key={vt.id} className="filter-thumb-card">
                            <label className="font-semibold">{vt.label}</label>
                            <input
                              type="text"
                              placeholder="Image URL (Leave empty for default)"
                              value={draftConfig?.vehicleListing?.categoryThumbnails?.[vt.id] || ""}
                              onChange={(e) => {
                                const newMap = {
                                  ...(draftConfig?.vehicleListing?.categoryThumbnails || {}),
                                  [vt.id]: e.target.value,
                                };
                                handleDraftChange("vehicleListing.categoryThumbnails", newMap);
                              }}
                            />
                            {draftConfig?.vehicleListing?.categoryThumbnails?.[vt.id] && (
                              <div className="filter-img-preview">
                                <img
                                  src={draftConfig.vehicleListing.categoryThumbnails[vt.id]}
                                  alt={vt.label}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 8. COMPANIES & CITY PILLS */}
                  {cmsSection === "companies" && (
                    <div className="cms-form-section">
                      <div className="section-intro">
                        <h3>Rental Companies Directory & City Filter Pills</h3>
                        <p>
                          Manage the popular cities filter list shown on the Companies page
                          (`/companies`).
                        </p>
                      </div>

                      <div className="form-group">
                        <label>Page Header Title</label>
                        <input
                          type="text"
                          value={draftConfig?.companies?.headerTitle || ""}
                          onChange={(e) =>
                            handleDraftChange("companies.headerTitle", e.target.value)
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Page Header Subtitle</label>
                        <input
                          type="text"
                          value={draftConfig?.companies?.headerSubtitle || ""}
                          onChange={(e) =>
                            handleDraftChange("companies.headerSubtitle", e.target.value)
                          }
                        />
                      </div>

                      <div className="cms-divider" />

                      <div className="section-intro">
                        <h3>Popular Cities Filter Pills</h3>
                      </div>

                      <div className="chips-editor">
                        {draftConfig?.companies?.popularCities?.map((city, idx) => (
                          <div key={idx} className="chip-row">
                            <input
                              type="text"
                              value={city}
                              onChange={(e) => {
                                const newCities = [...draftConfig.companies.popularCities];
                                newCities[idx] = e.target.value;
                                handleDraftChange("companies.popularCities", newCities);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newCities = draftConfig.companies.popularCities.filter(
                                  (_, i) => i !== idx
                                );
                                handleDraftChange("companies.popularCities", newCities);
                              }}
                              className="btn-trash"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newCities = [
                              ...(draftConfig?.companies?.popularCities || []),
                              "New City",
                            ];
                            handleDraftChange("companies.popularCities", newCities);
                          }}
                          className="btn-add-item"
                        >
                          <Plus size={14} /> Add City Pill
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 9. WHY US & FAQS */}
                  {cmsSection === "faqs" && (
                    <div className="cms-form-section">
                      <div className="section-intro">
                        <h3>Why Us Page & Interactive FAQs</h3>
                        <p>Manage the FAQ questions and answers on `/why-us`.</p>
                      </div>

                      <div className="form-group">
                        <label>Page Badge</label>
                        <input
                          type="text"
                          value={draftConfig?.whyUs?.badge || ""}
                          onChange={(e) => handleDraftChange("whyUs.badge", e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Main Title</label>
                        <input
                          type="text"
                          value={draftConfig?.whyUs?.title || ""}
                          onChange={(e) => handleDraftChange("whyUs.title", e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Subtitle</label>
                        <input
                          type="text"
                          value={draftConfig?.whyUs?.subtitle || ""}
                          onChange={(e) => handleDraftChange("whyUs.subtitle", e.target.value)}
                        />
                      </div>

                      <div className="cms-divider" />

                      <div className="section-intro">
                        <h3>Frequently Asked Questions (FAQ List)</h3>
                      </div>

                      <div className="faqs-editor">
                        {draftConfig?.whyUs?.faqs?.map((faq, idx) => (
                          <div key={idx} className="faq-edit-card">
                            <div className="faq-header">
                              <span className="slot-badge">Q#{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newFaqs = draftConfig.whyUs.faqs.filter((_, i) => i !== idx);
                                  handleDraftChange("whyUs.faqs", newFaqs);
                                }}
                                className="btn-trash"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            <div className="form-group mt-2">
                              <label>Question</label>
                              <input
                                type="text"
                                value={faq.q || ""}
                                onChange={(e) => {
                                  const newFaqs = [...draftConfig.whyUs.faqs];
                                  newFaqs[idx] = { ...newFaqs[idx], q: e.target.value };
                                  handleDraftChange("whyUs.faqs", newFaqs);
                                }}
                              />
                            </div>

                            <div className="form-group">
                              <label>Answer</label>
                              <textarea
                                rows={2}
                                value={faq.a || ""}
                                onChange={(e) => {
                                  const newFaqs = [...draftConfig.whyUs.faqs];
                                  newFaqs[idx] = { ...newFaqs[idx], a: e.target.value };
                                  handleDraftChange("whyUs.faqs", newFaqs);
                                }}
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            const newFaqs = [
                              ...(draftConfig?.whyUs?.faqs || []),
                              { q: "New Question?", a: "Answer here..." },
                            ];
                            handleDraftChange("whyUs.faqs", newFaqs);
                          }}
                          className="btn-add-item"
                        >
                          <Plus size={14} /> Add FAQ Question
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 10. FOOTER & CONTACT */}
                  {cmsSection === "footer" && (
                    <div className="cms-form-section">
                      <div className="section-intro">
                        <h3>Footer, Contact & Social Links</h3>
                        <p>Customize the contact details and social media links.</p>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Contact Phone</label>
                          <input
                            type="text"
                            value={draftConfig?.global?.contact?.phone || ""}
                            onChange={(e) =>
                              handleDraftChange("global.contact.phone", e.target.value)
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>Contact Email</label>
                          <input
                            type="text"
                            value={draftConfig?.global?.contact?.email || ""}
                            onChange={(e) =>
                              handleDraftChange("global.contact.email", e.target.value)
                            }
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>Physical Address</label>
                          <input
                            type="text"
                            value={draftConfig?.global?.contact?.address || ""}
                            onChange={(e) =>
                              handleDraftChange("global.contact.address", e.target.value)
                            }
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>Footer Tagline</label>
                          <input
                            type="text"
                            value={draftConfig?.footer?.tagline || ""}
                            onChange={(e) => handleDraftChange("footer.tagline", e.target.value)}
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>Copyright Text</label>
                          <input
                            type="text"
                            value={draftConfig?.footer?.copyrightText || ""}
                            onChange={(e) =>
                              handleDraftChange("footer.copyrightText", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="cms-divider" />

                      <div className="section-intro">
                        <h3>Social Media Profiles</h3>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>TikTok URL</label>
                          <input
                            type="text"
                            value={draftConfig?.global?.socialLinks?.tiktok || ""}
                            onChange={(e) =>
                              handleDraftChange("global.socialLinks.tiktok", e.target.value)
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>Facebook URL</label>
                          <input
                            type="text"
                            value={draftConfig?.global?.socialLinks?.facebook || ""}
                            onChange={(e) =>
                              handleDraftChange("global.socialLinks.facebook", e.target.value)
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>Instagram URL</label>
                          <input
                            type="text"
                            value={draftConfig?.global?.socialLinks?.instagram || ""}
                            onChange={(e) =>
                              handleDraftChange("global.socialLinks.instagram", e.target.value)
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>LinkedIn URL</label>
                          <input
                            type="text"
                            value={draftConfig?.global?.socialLinks?.linkedin || ""}
                            onChange={(e) =>
                              handleDraftChange("global.socialLinks.linkedin", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Live Virtual Split-Screen Preview */}
                <div className="cms-preview-column">
                  <div className="preview-top-bar">
                    <div className="preview-label">
                      <Eye size={15} /> Live Visual Preview
                    </div>
                    <div className="device-switcher">
                      <button
                        type="button"
                        className={`device-btn ${previewDevice === "desktop" ? "active" : ""}`}
                        onClick={() => setPreviewDevice("desktop")}
                        title="Desktop (100%)"
                      >
                        <Monitor size={15} />
                      </button>
                      <button
                        type="button"
                        className={`device-btn ${previewDevice === "tablet" ? "active" : ""}`}
                        onClick={() => setPreviewDevice("tablet")}
                        title="Tablet (768px)"
                      >
                        <Tablet size={15} />
                      </button>
                      <button
                        type="button"
                        className={`device-btn ${previewDevice === "mobile" ? "active" : ""}`}
                        onClick={() => setPreviewDevice("mobile")}
                        title="Smartphone (375px)"
                      >
                        <Smartphone size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Virtual Rendered Device Frame */}
                  <div className={`virtual-viewport ${previewDevice}`}>
                    <div className="virtual-screen-content" style={{ position: "relative" }}>
                      <FestivalAccessoriesManager previewConfig={draftConfig} isVirtualPreview={true} />
                      {/* Virtual Announcement Bar */}
                      {draftConfig?.global?.announcement?.enabled && (
                        <div
                          className="virtual-announcement"
                          style={{
                            backgroundColor:
                              draftConfig?.global?.announcement?.bgColor ||
                              draftConfig?.global?.primaryColor ||
                              "#f97316",
                          }}
                        >
                          <Sparkles size={12} />
                          <span>{draftConfig?.global?.announcement?.text}</span>
                        </div>
                      )}

                      {/* Virtual Nav */}
                      <div className="virtual-nav">
                        <div className="v-brand">
                          <img
                            src={draftConfig?.global?.logoUrl || "/logo.png"}
                            alt="Logo"
                            className="v-logo"
                          />
                          <span
                            style={{
                              color: draftConfig?.global?.primaryColor || "#f97316",
                              fontWeight: 800,
                            }}
                          >
                            {draftConfig?.global?.brandName || "Yamu"}
                          </span>
                        </div>
                        <div className="v-links">
                          <span>Find Cars</span>
                          <span>Fleets</span>
                          <span>Why Us</span>
                        </div>
                      </div>

                      {/* Virtual Hero Stage */}
                      <div
                        className="virtual-hero"
                        style={{
                          background: `radial-gradient(circle at 50% 34%, ${
                            draftConfig?.global?.primaryLight || "#fb923c"
                          } 0%, ${draftConfig?.global?.primaryColor || "#f97316"} 40%, ${
                            draftConfig?.global?.primaryDark || "#ea580c"
                          } 100%)`,
                        }}
                      >
                        <div className="v-watermark">
                          {draftConfig?.hero?.watermarkText || "YAMU"}
                        </div>
                        <div className="v-tag-top">
                          ✦ {draftConfig?.hero?.taglineTop || "Make The Right Choice"} ✦
                        </div>
                        <div className="v-tag-bottom">
                          {draftConfig?.hero?.taglineBottom || "Find Your Dream Car"}
                        </div>
                      </div>

                      {/* Virtual Categories Bar */}
                      <div className="virtual-categories-bar">
                        <div className="v-cat-title">Explore Categories:</div>
                        <div className="v-cat-scroll">
                          {draftConfig?.home?.categories?.map((c, i) => (
                            <div key={i} className="v-cat-pill">
                              {c.image && <img src={c.image} alt={c.label} />}
                              <span>{c.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Virtual Stats Bar */}
                      <div className="virtual-stats-bar">
                        {draftConfig?.home?.stats?.map((s, i) => (
                          <div key={i} className="v-stat-item">
                            <div
                              className="v-stat-num"
                              style={{ color: draftConfig?.global?.primaryColor || "#f97316" }}
                            >
                              {s.number}
                            </div>
                            <div className="v-stat-lbl">{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Virtual Testimonials */}
                      <div className="virtual-testimonials-section">
                        <div className="v-sec-title">What Our Guests Say</div>
                        <div className="v-test-cards">
                          {draftConfig?.home?.testimonials?.map((t, i) => (
                            <div key={i} className="v-test-card">
                              <div className="v-test-stars">
                                {"★".repeat(t.rating || 5)}
                              </div>
                              <p className="v-test-quote">"{t.text}"</p>
                              <div className="v-test-author">
                                <strong>{t.name}</strong> • {t.location}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Virtual Footer */}
                      <div className="virtual-footer">
                        <div>{draftConfig?.footer?.tagline}</div>
                        <div className="v-foot-copy">{draftConfig?.footer?.copyrightText}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LISTING APPROVALS HUB (SUPER ADMIN) */}
          {activeTab === "approvals" && (
            <div className="tab-pane">
              <div className="pane-header">
                <div>
                  <h2>Car Listing Verification & Approval Center</h2>
                  <p>
                    Super Admin gateway: Review vehicle listings submitted by personal hosts and
                    rental companies. Only approved vehicles appear live on the Yamu marketplace.
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="approval-filter-pills">
                    <button
                      type="button"
                      className={`pill-btn ${approvalFilter === "pending" ? "active" : ""}`}
                      onClick={() => setApprovalFilter("pending")}
                    >
                      ⏳ Pending Review ({vehiclesList.filter((v) => v.status === "pending").length})
                    </button>
                    <button
                      type="button"
                      className={`pill-btn ${approvalFilter === "rejected" ? "active" : ""}`}
                      onClick={() => setApprovalFilter("rejected")}
                    >
                      ❌ Rejected ({vehiclesList.filter((v) => v.status === "rejected").length})
                    </button>
                    <button
                      type="button"
                      className={`pill-btn ${approvalFilter === "all" ? "active" : ""}`}
                      onClick={() => setApprovalFilter("all")}
                    >
                      All Listings ({vehiclesList.length})
                    </button>
                  </div>
                  <button type="button" onClick={() => fetchTabData("approvals")} className="btn-secondary-sm">
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>

              {loadingData ? (
                <div className="loading-state">Loading vehicle listings for approval...</div>
              ) : pendingApprovalsVehicles.length === 0 ? (
                <div className="empty-approvals-box">
                  <CheckCircle2 size={48} className="text-green mb-3" />
                  <h3>No {approvalFilter === "pending" ? "Pending" : approvalFilter} Requests</h3>
                  <p>
                    {approvalFilter === "pending"
                      ? "Awesome! All car listing requests have been reviewed and approved."
                      : "No listings found matching this filter."}
                  </p>
                </div>
              ) : (
                <div className="approvals-grid">
                  {pendingApprovalsVehicles.map((v) => {
                    const listerPhone = v.company?.phone || v.owner?.phone || "";
                    const sanitizedPhone = listerPhone.replace(/[^0-9]/g, "");
                    const waText = encodeURIComponent(
                      `Hello ${v.company?.companyName || v.owner?.name || "Host"}, this is Yamu Admin regarding your car listing for ${v.brand} ${v.model} (${v.year}).`
                    );

                    return (
                      <div key={v._id} className={`approval-card ${v.status === "pending" ? "is-pending" : ""}`}>
                        {/* Top Card Bar */}
                        <div className="approval-card-top">
                          <div className="approval-card-thumb-wrap">
                            <img
                              src={formatVehicleImageUrl(v.images, v.vehicleType)}
                              alt={`${v.brand} ${v.model}`}
                              className="approval-card-thumb"
                              onError={(e) => handleImageError(e, formatVehicleImageUrl(null, v.vehicleType))}
                            />
                            <span className={`approval-status-pill status-${v.status}`}>
                              {v.status === "pending" ? "⏳ Awaiting Approval" : v.status === "rejected" ? "❌ Rejected" : "🟢 " + v.status}
                            </span>
                            {v.images && v.images.length > 1 && (
                              <span className="approval-photos-count">
                                📷 {v.images.length} Photos
                              </span>
                            )}
                          </div>

                          <div className="approval-card-main">
                            <div className="approval-card-title-row">
                              <div>
                                <h3 className="approval-vehicle-title">
                                  {v.brand} {v.model} <span className="text-muted">({v.year})</span>
                                </h3>
                                <div className="approval-vehicle-meta">
                                  <span className="type-badge">{v.vehicleType}</span>
                                  <span>•</span>
                                  <span>{v.transmission}</span>
                                  <span>•</span>
                                  <span>{v.fuelType}</span>
                                  <span>•</span>
                                  <span>{v.seats} Seats</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} /> {v.location}
                                  </span>
                                </div>
                              </div>

                              <div className="approval-price-box">
                                <div className="approval-price-val">Rs. {v.pricePerDay?.toLocaleString()}</div>
                                <div className="approval-price-lbl">per day</div>
                              </div>
                            </div>

                            {/* Rates & Specifications Row */}
                            <div className="approval-specs-grid">
                              <div className="spec-item">
                                <span className="spec-lbl">Free KM / Day:</span>
                                <span className="spec-val">{v.freeKmPerDay || 100} KM</span>
                              </div>
                              <div className="spec-item">
                                <span className="spec-lbl">Extra KM Rate:</span>
                                <span className="spec-val">Rs. {v.pricePerKmAfter100km || 0}/km</span>
                              </div>
                              <div className="spec-item">
                                <span className="spec-lbl">Security Deposit:</span>
                                <span className="spec-val">Rs. {v.deposit ? v.deposit.toLocaleString() : "0"}</span>
                              </div>
                              <div className="spec-item">
                                <span className="spec-lbl">Submitted On:</span>
                                <span className="spec-val">{new Date(v.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Rejection Note if Rejected */}
                            {v.status === "rejected" && v.rejectionReason && (
                              <div className="rejection-reason-box">
                                <strong>Rejection Reason:</strong> {v.rejectionReason}
                              </div>
                            )}

                            {/* Features list */}
                            {v.features && v.features.length > 0 && (
                              <div className="approval-features-list">
                                {v.features.map((f, i) => (
                                  <span key={i} className="approval-feature-chip">✓ {f}</span>
                                ))}
                              </div>
                            )}

                            {/* Lister Profile & Contact Section */}
                            <div className="approval-lister-row">
                              <div className="approval-lister-info">
                                <div className="lister-avatar">
                                  {v.company ? <Building2 size={16} /> : <Users size={16} />}
                                </div>
                                <div>
                                  <div className="lister-name">
                                    {v.company ? v.company.companyName : (v.owner?.name || "Private Host")}
                                    {v.company?.isVerified && (
                                      <span className="verified-badge-sm" title="Gold Verified Partner">✓</span>
                                    )}
                                    <span className="lister-type-tag">
                                      {v.company ? "Rental Company" : "Personal Host"}
                                    </span>
                                  </div>
                                  <div className="lister-contact-line">
                                    <span>✉️ {v.company?.contactEmail || v.owner?.email || "—"}</span>
                                    {listerPhone && <span>📞 {listerPhone}</span>}
                                  </div>
                                </div>
                              </div>

                              {/* Quick Contact & Verification Buttons */}
                              <div className="approval-quick-contact">
                                {sanitizedPhone && (
                                  <a
                                    href={`https://wa.me/${sanitizedPhone}?text=${waText}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-lister-whatsapp"
                                    title="Chat with lister on WhatsApp"
                                  >
                                    <MessageCircle size={14} /> WhatsApp Lister
                                  </a>
                                )}
                                {listerPhone && (
                                  <a href={`tel:${listerPhone}`} className="btn-lister-call" title="Call lister">
                                    <Phone size={14} /> Call
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Super Admin Action Buttons */}
                            <div className="approval-actions-bar">
                              {v.status !== "active" && (
                                <button
                                  type="button"
                                  onClick={() => handleApproveVehicle(v._id, `${v.brand} ${v.model}`)}
                                  className="btn-admin-approve"
                                >
                                  <CheckCircle size={16} /> Approve & Publish Live
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenEditVehicleModal(v)}
                                className="btn-admin-edit"
                              >
                                <Edit3 size={15} /> Edit Details
                              </button>

                              {v.status !== "rejected" && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenRejectModal(v)}
                                  className="btn-admin-reject"
                                >
                                  <XCircle size={15} /> Reject Listing
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteVehicle(v._id)}
                                className="btn-admin-delete"
                                title="Delete listing permanently"
                              >
                                <Trash2 size={15} /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FLEET & ALL LISTINGS */}
          {activeTab === "fleet" && (
            <div className="tab-pane">
              <div className="pane-header">
                <div>
                  <h2>Vehicle Fleet & Listings Supervisor</h2>
                  <p>
                    Full Super Admin authority to view, edit, approve, reject, pin to homepage, or delete any vehicle listing across the platform.
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={fleetStatusFilter}
                    onChange={(e) => setFleetStatusFilter(e.target.value)}
                    className="select-role-filter"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active (Live)</option>
                    <option value="pending">Pending Approval</option>
                    <option value="rejected">Rejected</option>
                    <option value="hidden">Hidden / Paused</option>
                    <option value="rented">Currently Rented</option>
                  </select>

                  <select
                    value={fleetTypeFilter}
                    onChange={(e) => setFleetTypeFilter(e.target.value)}
                    className="select-role-filter"
                  >
                    <option value="all">All Categories</option>
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>

                  <div className="search-box">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search brand, model, city, owner..."
                      value={vehicleSearch}
                      onChange={(e) => setVehicleSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {loadingData ? (
                <div className="loading-state">Loading vehicle fleet...</div>
              ) : (
                <div className="table-card">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Vehicle</th>
                        <th>Type</th>
                        <th>Day Rate</th>
                        <th>Location</th>
                        <th>Owner / Company</th>
                        <th>Status</th>
                        <th>Featured</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVehicles.length > 0 ? (
                        filteredVehicles.map((v) => (
                          <tr key={v._id}>
                            <td>
                              <div className="vehicle-cell">
                                <img
                                  src={formatVehicleImageUrl(v.images, v.vehicleType)}
                                  alt={v.model}
                                  className="v-cell-thumb"
                                  onError={(e) => handleImageError(e, formatVehicleImageUrl(null, v.vehicleType))}
                                />
                                <div>
                                  <div className="font-semibold">
                                    {v.brand} {v.model} ({v.year})
                                  </div>
                                  <div className="text-muted text-xs">
                                    {v.transmission} • {v.fuelType} • {v.seats} seats
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="type-badge">{v.vehicleType}</span>
                            </td>
                            <td className="font-semibold text-primary">
                              Rs. {v.pricePerDay?.toLocaleString()}/day
                            </td>
                            <td>
                              <div className="flex items-center gap-1 text-muted text-sm">
                                <MapPin size={13} /> {v.location}
                              </div>
                            </td>
                            <td>
                              {v.company ? (
                                <div className="text-sm">
                                  <span className="font-semibold">{v.company.companyName}</span>
                                  {v.company.isVerified && (
                                    <span className="verified-badge-sm">✓</span>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm">{v.owner?.name || "Private Host"}</div>
                              )}
                            </td>
                            <td>
                              <select
                                value={v.status || "active"}
                                onChange={(e) => handleChangeVehicleStatus(v._id, e.target.value)}
                                className={`status-changer-select status-${v.status || "active"}`}
                              >
                                <option value="active">🟢 Active</option>
                                <option value="pending">⏳ Pending</option>
                                <option value="rejected">❌ Rejected</option>
                                <option value="hidden">⏸️ Hidden</option>
                                <option value="rented">🔑 Rented</option>
                                <option value="flagged">🚩 Flagged</option>
                              </select>
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => handleToggleVehicleFeature(v._id)}
                                className={`btn-feature-toggle ${v.isFeatured ? "featured" : ""}`}
                              >
                                {v.isFeatured ? "★ Featured" : "☆ Not Featured"}
                              </button>
                            </td>
                            <td>
                              <div className="actions-cell">
                                <Link
                                  to={`/vehicle/${v._id}`}
                                  target="_blank"
                                  className="btn-action-view"
                                  title="View on public site"
                                >
                                  <Eye size={14} />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditVehicleModal(v)}
                                  className="btn-action-edit"
                                  title="Super Admin Edit"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVehicle(v._id)}
                                  className="btn-action-del"
                                  title="Delete listing"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center text-muted">
                            No vehicles found matching search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMPANY VERIFICATION & MANAGEMENT */}
          {activeTab === "companies" && (
            <div className="tab-pane">
              <div className="pane-header">
                <div>
                  <h2>Rental Company Verification & Partner Hub</h2>
                  <p>
                    Manage rental companies. Review registration details, grant/revoke official Yamu Gold Verified Badges, edit profiles, or delete accounts.
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={companyVerifyFilter}
                    onChange={(e) => setCompanyVerifyFilter(e.target.value)}
                    className="select-role-filter"
                  >
                    <option value="all">All Companies</option>
                    <option value="verified">Verified Partners</option>
                    <option value="unverified">Pending Verification</option>
                  </select>

                  <div className="search-box">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search company name, email, phone..."
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {loadingData ? (
                <div className="loading-state">Loading companies...</div>
              ) : (
                <div className="table-card">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Contact Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Fleet Count</th>
                        <th>Verification Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.length > 0 ? (
                        filteredCompanies.map((c) => (
                          <tr key={c._id}>
                            <td>
                              <div className="company-cell">
                                {c.logo ? (
                                  <img src={c.logo} alt={c.companyName} className="c-logo-thumb" />
                                ) : (
                                  <div className="c-logo-placeholder">
                                    <Building2 size={16} />
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold">{c.companyName}</div>
                                  <div className="text-muted text-xs">
                                    Owner: {c.user?.name || "User"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-muted">{c.contactEmail || c.user?.email}</td>
                            <td className="text-muted">{c.phone || "—"}</td>
                            <td className="text-muted">{c.address || "—"}</td>
                            <td>
                              <span className="badge-count-sm">{c.vehicleCount || 0} cars</span>
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  c.isVerified ? "status-verified" : "status-pending"
                                }`}
                              >
                                {c.isVerified ? "✓ Verified Partner" : "⏳ Pending Review"}
                              </span>
                            </td>
                            <td>
                              <div className="actions-cell">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCompanyVerify(c._id)}
                                  className={`btn-verify-toggle ${
                                    c.isVerified ? "btn-revoke" : "btn-approve"
                                  }`}
                                >
                                  {c.isVerified ? "Revoke Badge" : "✓ Approve Verified"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditCompanyModal(c)}
                                  className="btn-action-edit"
                                  title="Edit Company"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCompany(c._id, c.companyName)}
                                  className="btn-action-del"
                                  title="Delete Company"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center text-muted">
                            No companies found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: PLATFORM RENTALS SUPERVISOR */}
          {activeTab === "rentals" && (
            <div className="tab-pane">
              <div className="pane-header">
                <div>
                  <h2>Platform Rental Bookings Supervisor</h2>
                  <p>
                    Oversee all active, returned, and cancelled rentals recorded across hosts and companies.
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={rentalStatusFilter}
                    onChange={(e) => setRentalStatusFilter(e.target.value)}
                    className="select-role-filter"
                  >
                    <option value="all">All Bookings</option>
                    <option value="active">Active Rentals</option>
                    <option value="completed">Completed / Returned</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button type="button" onClick={() => fetchTabData("rentals")} className="btn-secondary-sm">
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>

              {loadingData ? (
                <div className="loading-state">Loading rentals...</div>
              ) : (
                <div className="table-card">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Vehicle</th>
                        <th>Customer</th>
                        <th>Rental Period</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Host / Company</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRentals.length > 0 ? (
                        filteredRentals.map((r) => {
                          const veh = r.vehicle;
                          return (
                            <tr key={r._id}>
                              <td>
                                <div className="vehicle-cell">
                                  <div className="font-semibold">
                                    {veh?.brand || "—"} {veh?.model || ""}
                                  </div>
                                  <div className="text-muted text-xs">
                                    {veh?.year} • {veh?.location || "Colombo"}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div className="font-semibold">{r.customerName}</div>
                                  <div className="text-muted text-xs">
                                    {r.customerPhone || r.customerNIC || "—"}
                                  </div>
                                </div>
                              </td>
                              <td className="text-muted">
                                <div>{new Date(r.pickupDate).toLocaleDateString()} → {new Date(r.returnDate).toLocaleDateString()}</div>
                                <div className="text-xs text-muted">{r.totalDays} day(s)</div>
                              </td>
                              <td className="font-semibold text-primary">
                                Rs. {r.totalAmount?.toLocaleString()}
                              </td>
                              <td>
                                <span className={`status-badge status-${r.status}`}>
                                  {r.status === "active" ? "🔑 Active" : r.status === "completed" ? "✓ Returned" : "❌ Cancelled"}
                                </span>
                              </td>
                              <td>
                                <div className="text-sm">
                                  {r.company ? r.company.companyName : (r.owner?.name || "Host")}
                                </div>
                              </td>
                              <td>
                                <div className="actions-cell">
                                  {r.status === "active" && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateRentalStatus(r._id, "completed")}
                                        className="btn-verify-toggle btn-approve"
                                        title="Mark as Returned"
                                      >
                                        Mark Returned
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateRentalStatus(r._id, "cancelled")}
                                        className="btn-verify-toggle btn-revoke"
                                        title="Cancel Rental"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRental(r._id)}
                                    className="btn-action-del"
                                    title="Delete rental record"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center text-muted">
                            No rental records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: USER MANAGEMENT */}
          {activeTab === "users" && (
            <div className="tab-pane">
              <div className="pane-header">
                <div>
                  <h2>User & Role Management</h2>
                  <p>
                    Full user supervision. Promote/demote roles, edit profile info, or delete accounts.
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="select-role-filter"
                  >
                    <option value="all">All Roles</option>
                    <option value="renter">Renters</option>
                    <option value="owner">Car Owners / Hosts</option>
                    <option value="company">Companies</option>
                    <option value="admin">Super Admins</option>
                  </select>

                  <div className="search-box">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search name, email, phone..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {loadingData ? (
                <div className="loading-state">Loading users...</div>
              ) : (
                <div className="table-card">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Current Role</th>
                        <th>Change Role</th>
                        <th>Joined Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                          <tr key={u._id}>
                            <td className="font-semibold">{u.name}</td>
                            <td className="text-muted">{u.email}</td>
                            <td className="text-muted">{u.phone || "—"}</td>
                            <td>
                              <span className={`role-tag role-${u.role}`}>{u.role}</span>
                            </td>
                            <td>
                              <select
                                value={u.role}
                                onChange={(e) => handleChangeUserRole(u._id, e.target.value)}
                                className="role-changer-select"
                              >
                                <option value="renter">Renter</option>
                                <option value="owner">Host / Owner</option>
                                <option value="company">Company</option>
                                <option value="admin">Super Admin</option>
                              </select>
                            </td>
                            <td className="text-muted">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <div className="actions-cell">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditUserModal(u)}
                                  className="btn-action-edit"
                                  title="Edit User"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u._id, u.name)}
                                  className="btn-action-del"
                                  title="Delete User"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center text-muted">
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: REVIEWS & FEEDBACK */}
          {activeTab === "reviews" && (
            <div className="tab-pane">
              <div className="pane-header">
                <div>
                  <h2>Customer Reviews & Feedback Moderation</h2>
                  <p>View all reviews submitted across vehicles and remove abusive or spam ratings.</p>
                </div>
              </div>

              {loadingData ? (
                <div className="loading-state">Loading reviews...</div>
              ) : (
                <div className="table-card">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Vehicle</th>
                        <th>Customer</th>
                        <th>Rating</th>
                        <th>Comment</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewsList.length > 0 ? (
                        reviewsList.map((r) => (
                          <tr key={r._id}>
                            <td className="font-semibold">
                              {r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : "Vehicle Deleted"}
                            </td>
                            <td>{r.user?.name || "Guest"}</td>
                            <td>
                              <span className="star-rating-pill">
                                ★ {r.rating}/5
                              </span>
                            </td>
                            <td className="text-muted max-w-xs">{r.comment}</td>
                            <td className="text-muted text-xs">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(r._id)}
                                className="btn-action-del"
                                title="Delete review"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">
                            No reviews submitted yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: 1-CLICK ROLLBACK & VERSION HISTORY */}
          {activeTab === "rollback" && (
            <div className="tab-pane">
              <div className="pane-header">
                <div>
                  <h2>1-Click Version Snapshots & Rollback</h2>
                  <p>
                    Every time you save changes in the CMS, an automated snapshot is stored. You can
                    roll back to any previous layout snapshot in 1 click!
                  </p>
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={handleExportJSON} className="btn-secondary-sm">
                    <Download size={14} /> Export Backup JSON
                  </button>
                  <button type="button" onClick={handleResetDefaults} className="btn-danger-sm">
                    <RotateCcw size={14} /> Reset Factory Defaults
                  </button>
                </div>
              </div>

              {loadingData ? (
                <div className="loading-state">Loading version history...</div>
              ) : (
                <div className="snapshots-list">
                  {snapshotsList.length > 0 ? (
                    snapshotsList.map((snap) => (
                      <div key={snap._id} className="snapshot-card">
                        <div className="snapshot-info">
                          <div className="snapshot-title">
                            <History size={16} className="text-primary" />
                            <strong>{snap.name}</strong>
                          </div>
                          <div className="snapshot-meta">
                            Saved by: <strong>{snap.createdBy?.name || "Admin"}</strong> •{" "}
                            {new Date(snap.createdAt).toLocaleString()}
                          </div>
                          {snap.description && (
                            <div className="snapshot-desc text-muted">{snap.description}</div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRollback(snap._id)}
                          className="btn-restore-snap"
                        >
                          <RotateCcw size={14} /> Restore This Snapshot
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-snapshots-box">
                      <History size={40} className="text-muted mb-2" />
                      <p>No snapshots created yet. Edit and save the CMS to create automatic version history!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* SUPER ADMIN MODALS: VEHICLE EDIT, REJECT, USER, COMPANY */}
          {/* ==================================================== */}

          {/* 1. SUPER ADMIN VEHICLE EDIT MODAL */}
          {editingVehicle && (
            <div className="admin-modal-overlay" onClick={() => setEditingVehicle(null)}>
              <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <div>
                    <h3>Super Admin Vehicle Editor</h3>
                    <p>Modify any specification, rates, images, or status for this listing</p>
                  </div>
                  <button type="button" className="btn-close-modal" onClick={() => setEditingVehicle(null)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="admin-modal-body">
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Brand / Make</label>
                      <input
                        type="text"
                        value={vehicleForm.brand || ""}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                        placeholder="Toyota, Honda, etc."
                      />
                    </div>
                    <div className="form-group">
                      <label>Model</label>
                      <input
                        type="text"
                        value={vehicleForm.model || ""}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                        placeholder="Prius, Vezel, Axio..."
                      />
                    </div>
                  </div>

                  <div className="form-grid-3">
                    <div className="form-group">
                      <label>Year</label>
                      <input
                        type="number"
                        value={vehicleForm.year || ""}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Vehicle Category</label>
                      <select
                        value={vehicleForm.vehicleType || "car"}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
                      >
                        {VEHICLE_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Location / City</label>
                      <input
                        type="text"
                        value={vehicleForm.location || ""}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, location: e.target.value })}
                        placeholder="Colombo, Kandy, Galle..."
                      />
                    </div>
                  </div>

                  <div className="form-grid-3">
                    <div className="form-group">
                      <label>Day Rate (LKR)</label>
                      <input
                        type="number"
                        value={vehicleForm.pricePerDay || ""}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, pricePerDay: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Free KM / Day</label>
                      <input
                        type="number"
                        value={vehicleForm.freeKmPerDay || ""}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, freeKmPerDay: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Extra KM Fee (LKR)</label>
                      <input
                        type="number"
                        value={vehicleForm.pricePerKmAfter100km || ""}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, pricePerKmAfter100km: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-grid-3">
                    <div className="form-group">
                      <label>Transmission</label>
                      <select
                        value={vehicleForm.transmission || "Automatic"}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, transmission: e.target.value })}
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fuel Type</label>
                      <select
                        value={vehicleForm.fuelType || "Petrol"}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value })}
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Electric">Electric</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Seats Count</label>
                      <input
                        type="number"
                        value={vehicleForm.seats || 4}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, seats: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Listing Status</label>
                      <select
                        value={vehicleForm.status || "active"}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value })}
                      >
                        <option value="active">🟢 Active (Live on Marketplace)</option>
                        <option value="pending">⏳ Pending Super Admin Approval</option>
                        <option value="rejected">❌ Rejected</option>
                        <option value="hidden">⏸️ Hidden / Paused</option>
                        <option value="rented">🔑 Currently Rented</option>
                        <option value="flagged">🚩 Flagged</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Security Deposit (LKR)</label>
                      <input
                        type="number"
                        value={vehicleForm.deposit || 0}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, deposit: e.target.value })}
                      />
                    </div>
                  </div>

                  {vehicleForm.status === "rejected" && (
                    <div className="form-group full-width">
                      <label>Rejection Reason for Lister</label>
                      <textarea
                        rows="2"
                        value={vehicleForm.rejectionReason || ""}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, rejectionReason: e.target.value })}
                        placeholder="Explain to lister why this car is rejected..."
                      />
                    </div>
                  )}

                  <div className="form-group full-width">
                    <label>Features & Perks (comma-separated)</label>
                    <input
                      type="text"
                      value={vehicleForm.features || ""}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, features: e.target.value })}
                      placeholder="Air Conditioning, Bluetooth, Backup Camera, Cruise Control..."
                    />
                  </div>

                  {/* Images Editor */}
                  <div className="form-group full-width">
                    <label>Vehicle Images (URLs)</label>
                    <div className="images-editor-grid">
                      {Array.isArray(vehicleForm.images) && vehicleForm.images.map((img, idx) => (
                        <div key={idx} className="img-editor-card">
                          <img src={img} alt="Vehicle" className="img-editor-thumb" />
                          <button
                            type="button"
                            className="btn-remove-img"
                            onClick={() => {
                              const updated = vehicleForm.images.filter((_, i) => i !== idx);
                              setVehicleForm({ ...vehicleForm, images: updated });
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="toggle-box mt-2">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={!!vehicleForm.isFeatured}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, isFeatured: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                    <div>
                      <strong>Pin to Homepage Featured Showcase</strong>
                      <div className="text-muted text-xs">Featured cars appear prominently on the Yamu homepage hero & deals section</div>
                    </div>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setEditingVehicle(null)}>
                    Cancel
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={savingVehicle}
                      onClick={() => handleSaveVehicleAdmin(false)}
                    >
                      {savingVehicle ? "Saving..." : "Save Changes"}
                    </button>
                    {vehicleForm.status !== "active" && (
                      <button
                        type="button"
                        className="btn-admin-approve"
                        disabled={savingVehicle}
                        onClick={() => handleSaveVehicleAdmin(true)}
                      >
                        ✓ Save & Set Live
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SUPER ADMIN REJECT REASON MODAL */}
          {rejectingVehicle && (
            <div className="admin-modal-overlay" onClick={() => setRejectingVehicle(null)}>
              <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <div>
                    <h3>Reject Listing: {rejectingVehicle.brand} {rejectingVehicle.model}</h3>
                    <p>Provide a clear reason to notify the lister what needs to be fixed</p>
                  </div>
                  <button type="button" className="btn-close-modal" onClick={() => setRejectingVehicle(null)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="admin-modal-body">
                  <div className="reject-presets">
                    <div className="text-xs font-semibold text-muted mb-1">Quick Reason Presets:</div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {[
                        "Vehicle photos are blurry or not real photos of the car",
                        "Price per day or excess mileage rate is unrealistic",
                        "Missing required insurance or vehicle registration details",
                        "Incomplete or misleading vehicle specifications",
                        "Duplicate vehicle listing detected",
                      ].map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          className="preset-pill-btn"
                          onClick={() => setRejectionReasonInput(preset)}
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Rejection Reason Note</label>
                    <textarea
                      rows="4"
                      value={rejectionReasonInput}
                      onChange={(e) => setRejectionReasonInput(e.target.value)}
                      placeholder="Type details for the lister..."
                    />
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setRejectingVehicle(null)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    disabled={submittingReject}
                    onClick={handleConfirmReject}
                  >
                    {submittingReject ? "Rejecting..." : "Confirm & Reject Listing"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. SUPER ADMIN USER EDIT MODAL */}
          {editingUser && (
            <div className="admin-modal-overlay" onClick={() => setEditingUser(null)}>
              <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <div>
                    <h3>Super Admin User Editor</h3>
                    <p>Edit user account details, phone number, and platform role</p>
                  </div>
                  <button type="button" className="btn-close-modal" onClick={() => setEditingUser(null)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="admin-modal-body">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={userForm.name || ""}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={userForm.email || ""}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={userForm.phone || ""}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Platform Role</label>
                    <select
                      value={userForm.role || "renter"}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    >
                      <option value="renter">Renter (Customer)</option>
                      <option value="owner">Car Owner / Host</option>
                      <option value="company">Rental Company</option>
                      <option value="admin">Super Admin</option>
                    </select>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setEditingUser(null)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={savingUser}
                    onClick={handleSaveUserAdmin}
                  >
                    {savingUser ? "Saving..." : "Save User"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. SUPER ADMIN COMPANY EDIT MODAL */}
          {editingCompany && (
            <div className="admin-modal-overlay" onClick={() => setEditingCompany(null)}>
              <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <div>
                    <h3>Super Admin Company Editor</h3>
                    <p>Edit rental company profile, contact details, and trust badge</p>
                  </div>
                  <button type="button" className="btn-close-modal" onClick={() => setEditingCompany(null)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="admin-modal-body">
                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={companyForm.companyName || ""}
                      onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    />
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Contact Email</label>
                      <input
                        type="email"
                        value={companyForm.contactEmail || ""}
                        onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        value={companyForm.phone || ""}
                        onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Address / Headquarters</label>
                    <input
                      type="text"
                      value={companyForm.address || ""}
                      onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Logo Image URL</label>
                    <input
                      type="text"
                      value={companyForm.logo || ""}
                      onChange={(e) => setCompanyForm({ ...companyForm, logo: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Company Description / Bio</label>
                    <textarea
                      rows="3"
                      value={companyForm.description || ""}
                      onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                    />
                  </div>
                  <div className="toggle-box mt-2">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={!!companyForm.isVerified}
                        onChange={(e) => setCompanyForm({ ...companyForm, isVerified: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                    <div>
                      <strong>Grant Yamu Gold Verified Trust Badge</strong>
                      <div className="text-muted text-xs">Displays official verified badge on listings and company profile</div>
                    </div>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setEditingCompany(null)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={savingCompany}
                    onClick={handleSaveCompanyAdmin}
                  >
                    {savingCompany ? "Saving..." : "Save Company"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .admin-portal {
          min-height: 100vh;
          background: #090d16;
          color: #f1f5f9;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* Top Header */
        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 28px;
          background: #0d1322;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .admin-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
        }

        .admin-logo-img {
          height: 36px;
          width: auto;
          object-fit: contain;
        }

        .admin-brand-name {
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
        }

        .admin-brand-tag {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 600;
        }

        .admin-badge-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(249, 115, 22, 0.15);
          color: var(--primary);
          border: 1px solid rgba(249, 115, 22, 0.3);
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .admin-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-toast-badge {
          background: #059669;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          animation: fadeIn 0.2s ease;
        }

        .admin-live-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.08);
          color: #f1f5f9;
          padding: 8px 14px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.84rem;
          font-weight: 600;
          transition: background 0.2s;
        }

        .admin-live-btn:hover {
          background: rgba(255, 255, 255, 0.14);
        }

        .admin-logout-btn {
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #f87171;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .admin-logout-btn:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        /* Layout Grid */
        .admin-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          flex: 1;
          min-height: calc(100vh - 65px);
        }

        /* Sidebar */
        .admin-sidebar {
          background: #0c121e;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          padding: 20px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sidebar-group-title {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #64748b;
          padding: 12px 10px 4px;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 14px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .admin-nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .admin-nav-item.active {
          background: rgba(249, 115, 22, 0.15);
          color: var(--primary);
          font-weight: 700;
        }

        .nav-item-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex: 1;
        }

        .cms-badge {
          background: var(--primary);
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        /* Main Content */
        .admin-main {
          padding: 28px 32px;
          overflow-y: auto;
          background: #090d16;
        }

        .pane-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .pane-header h2 {
          font-size: 1.45rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .pane-header p {
          color: #94a3b8;
          font-size: 0.88rem;
        }

        /* KPI Cards */
        .admin-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          margin-bottom: 28px;
        }

        .kpi-card {
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .kpi-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kpi-orange { background: rgba(249, 115, 22, 0.15); color: #f97316; }
        .kpi-blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
        .kpi-green { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .kpi-purple { background: rgba(168, 85, 247, 0.15); color: #a855f7; }

        .kpi-num {
          font-size: 1.6rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
        }

        .kpi-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #94a3b8;
          margin-top: 4px;
        }

        .kpi-sub {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 4px;
        }

        .text-green { color: #10b981; font-weight: 600; }

        /* Charts Grid */
        .admin-charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .chart-card, .recent-activity-card {
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 22px;
        }

        .chart-title {
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .chart-empty {
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 0.88rem;
        }

        /* Tables */
        .table-card {
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          overflow: hidden;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }

        .admin-table th {
          background: #0e1422;
          padding: 12px 16px;
          text-align: left;
          font-weight: 700;
          color: #94a3b8;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .admin-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          vertical-align: middle;
        }

        .admin-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .role-tag {
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .role-renter { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
        .role-owner { background: rgba(249, 115, 22, 0.15); color: #fb923c; }
        .role-company { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .role-admin { background: rgba(239, 68, 68, 0.15); color: #f87171; }

        .status-badge {
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .status-verified { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .status-pending { background: rgba(234, 179, 8, 0.15); color: #eab308; }

        .btn-verify-toggle {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-approve { background: #059669; color: #ffffff; }
        .btn-revoke { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }

        .btn-feature-toggle {
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-feature-toggle.featured {
          background: rgba(249, 115, 22, 0.2);
          color: #f97316;
          border-color: rgba(249, 115, 22, 0.4);
        }

        .role-changer-select {
          background: #1e293b;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .vehicle-cell, .company-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .v-cell-thumb, .c-logo-thumb {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          object-fit: cover;
          background: #1e293b;
        }

        .c-logo-placeholder {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
        }

        .type-badge {
          background: rgba(255, 255, 255, 0.08);
          color: #f1f5f9;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .actions-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-action-view, .btn-action-del {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .btn-action-view { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
        .btn-action-del { background: rgba(239, 68, 68, 0.15); color: #f87171; }
        .btn-action-del:hover { background: #ef4444; color: #ffffff; }

        /* CMS Customizer Specific */
        .cms-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 10px 16px;
          margin-bottom: 20px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .cms-tabs-scroll {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .cms-sub-tab {
          background: transparent;
          border: none;
          color: #94a3b8;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .cms-sub-tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .cms-sub-tab.active {
          background: var(--primary);
          color: #ffffff;
        }

        .cms-actions-bar {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-save-cms {
          background: var(--primary);
          color: #ffffff;
          border: none;
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
          transition: transform 0.15s;
        }

        .btn-save-cms:hover {
          transform: translateY(-1px);
        }

        .btn-icon-cms {
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: #f1f5f9;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .cms-alert-success, .cms-alert-error {
          padding: 12px 18px;
          border-radius: 10px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.88rem;
        }

        .cms-alert-success { background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; }
        .cms-alert-error { background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #f87171; }

        /* Split-Screen Layout */
        .cms-split-container {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 24px;
          align-items: start;
        }

        .cms-editor-column {
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 24px;
        }

        .section-intro {
          margin-bottom: 18px;
        }

        .section-intro h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .section-intro p {
          color: #94a3b8;
          font-size: 0.84rem;
        }

        .cms-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          margin: 24px 0;
        }

        /* Form Inputs */
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .form-group input, .form-group select, .form-group textarea {
          background: #0c121e;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.88rem;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: var(--primary);
          outline: none;
        }

        .color-picker-input {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .color-picker-input input[type="color"] {
          width: 42px;
          height: 42px;
          padding: 2px;
          border-radius: 8px;
          cursor: pointer;
        }

        /* Theme Presets Cards */
        .theme-presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .theme-preset-card {
          background: #0c121e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .theme-preset-card:hover {
          border-color: var(--primary);
        }

        .theme-preset-card.selected {
          border: 2px solid var(--primary);
          background: rgba(249, 115, 22, 0.08);
        }

        .preset-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 700;
          font-size: 0.88rem;
          margin-bottom: 8px;
        }

        .preset-active-tag {
          background: var(--primary);
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 800;
        }

        .preset-color-swatches {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
        }

        .preset-color-swatches span {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }

        .preset-ticker-sample {
          font-size: 0.72rem;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Toggle Box */
        .toggle-box {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #0c121e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 12px 16px;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }

        .switch input { opacity: 0; width: 0; height: 0; }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #334155;
          transition: .3s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }

        input:checked + .slider { background-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(20px); }

        /* Chips & Slot Cards */
        .chips-editor, .faqs-editor, .testimonials-editor-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chip-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chip-row input {
          flex: 1;
          background: #0c121e;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
        }

        .btn-trash {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: none;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
        }

        .btn-add-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.06);
          color: #f1f5f9;
          border: 1px dashed rgba(255, 255, 255, 0.2);
          padding: 10px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
        }

        .category-slots-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .category-slot-card, .testimonial-edit-card, .stat-edit-box, .filter-thumb-card, .faq-edit-card {
          background: #0c121e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
        }

        .slot-badge {
          background: rgba(249, 115, 22, 0.15);
          color: var(--primary);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .cat-img-preview, .filter-img-preview {
          margin-top: 8px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          background: #1e293b;
        }

        .cat-img-preview img, .filter-img-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .test-header, .faq-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stars-picker {
          display: flex;
          gap: 2px;
          cursor: pointer;
        }

        .star-icon.filled { color: #f59e0b; fill: #f59e0b; }
        .star-icon.empty { color: #475569; }

        /* Right Column: Virtual Preview Frame */
        .cms-preview-column {
          position: sticky;
          top: 80px;
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .preview-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .preview-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .device-switcher {
          display: flex;
          gap: 4px;
          background: #0c121e;
          padding: 4px;
          border-radius: 8px;
        }

        .device-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          width: 30px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .device-btn.active {
          background: var(--primary);
          color: #ffffff;
        }

        .virtual-viewport {
          background: #faf9f7;
          color: #0f172a;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          transition: all 0.3s ease;
          margin: 0 auto;
          max-height: 580px;
          overflow-y: auto;
          width: 100%;
        }

        .virtual-viewport.tablet { max-width: 480px; }
        .virtual-viewport.mobile { max-width: 320px; }

        .virtual-announcement {
          padding: 4px 10px;
          color: #ffffff;
          font-size: 0.68rem;
          font-weight: 700;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .virtual-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
        }

        .v-brand { display: flex; align-items: center; gap: 6px; }
        .v-logo { height: 18px; }
        .v-links { display: flex; gap: 8px; font-size: 0.65rem; color: #64748b; font-weight: 600; }

        .virtual-hero {
          padding: 24px 14px;
          text-align: center;
          color: #ffffff;
        }

        .v-watermark {
          font-size: 1.8rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          opacity: 0.9;
        }

        .v-tag-top { font-size: 0.65rem; font-weight: 700; opacity: 0.9; }
        .v-tag-bottom { font-size: 0.85rem; font-weight: 800; margin-top: 2px; }

        .virtual-categories-bar {
          padding: 10px 12px;
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
        }

        .v-cat-title { font-size: 0.68rem; font-weight: 700; color: #475569; margin-bottom: 6px; }
        .v-cat-scroll { display: flex; gap: 6px; overflow-x: auto; }
        .v-cat-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 3px 8px;
          border-radius: 100px;
          font-size: 0.62rem;
          font-weight: 700;
          white-space: nowrap;
        }
        .v-cat-pill img { width: 14px; height: 14px; border-radius: 50%; object-fit: cover; }

        .virtual-stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          padding: 10px;
          background: #f8fafc;
          text-align: center;
          gap: 4px;
        }
        .v-stat-num { font-size: 0.85rem; font-weight: 900; line-height: 1; }
        .v-stat-lbl { font-size: 0.55rem; color: #64748b; font-weight: 600; }

        .virtual-testimonials-section {
          padding: 12px;
          background: #ffffff;
        }
        .v-sec-title { font-size: 0.72rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; text-align: center; }
        .v-test-cards { display: flex; flex-direction: column; gap: 6px; }
        .v-test-card { background: #f8fafc; padding: 6px 8px; border-radius: 6px; font-size: 0.62rem; }
        .v-test-stars { color: #f59e0b; font-size: 0.6rem; }
        .v-test-quote { color: #334155; font-style: italic; margin: 2px 0; }
        .v-test-author { color: #64748b; font-size: 0.58rem; }

        .virtual-footer {
          padding: 10px;
          background: #0f172a;
          color: #94a3b8;
          font-size: 0.58rem;
          text-align: center;
        }
        .v-foot-copy { font-size: 0.52rem; color: #64748b; margin-top: 2px; }

        /* Snapshots List */
        .snapshots-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .snapshot-card {
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .snapshot-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          color: #ffffff;
        }

        .snapshot-meta {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 4px;
        }

        .snapshot-desc {
          font-size: 0.78rem;
          margin-top: 2px;
        }

        .btn-restore-snap {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-restore-snap:hover {
          background: #3b82f6;
          color: #ffffff;
        }

        .empty-snapshots-box {
          background: #111827;
          border-radius: 14px;
          padding: 48px;
          text-align: center;
          color: #94a3b8;
        }

        .btn-secondary-sm {
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: #f1f5f9;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .btn-danger-sm {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px 12px;
          border-radius: 8px;
          color: #94a3b8;
        }

        .search-box input {
          background: transparent;
          border: none;
          color: #f1f5f9;
          font-size: 0.84rem;
          outline: none;
          width: 200px;
        }

        .select-role-filter {
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 600;
        }

        /* Top Urgent Banner */
        .admin-urgent-banner {
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%);
          border-bottom: 1px solid rgba(239, 68, 68, 0.4);
          padding: 12px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          animation: fadeIn 0.3s ease;
        }

        .urgent-banner-content {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.88rem;
          color: #fecdd3;
        }

        .urgent-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.3);
          color: #f87171;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .urgent-highlight {
          color: #ffffff;
          font-weight: 800;
          text-decoration: underline;
        }

        .btn-urgent-action {
          background: #ef4444;
          color: #ffffff;
          border: none;
          padding: 7px 16px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s, background 0.2s;
          box-shadow: 0 2px 10px rgba(239, 68, 68, 0.4);
        }

        .btn-urgent-action:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }

        .admin-header-alert-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fecdd3;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .admin-header-alert-btn:hover {
          background: #ef4444;
          color: #ffffff;
        }

        .bell-ring {
          animation: ringBell 2s infinite ease-in-out;
        }

        @keyframes ringBell {
          0%, 100% { transform: rotate(0); }
          10%, 30% { transform: rotate(14deg); }
          20%, 40% { transform: rotate(-14deg); }
          50% { transform: rotate(0); }
        }

        .approval-badge-count {
          background: #ef4444;
          color: #ffffff;
          padding: 2px 8px;
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 800;
          animation: pulseBadge 1.5s infinite ease-in-out;
        }

        @keyframes pulseBadge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .pending-pill-sm {
          background: rgba(234, 179, 8, 0.2);
          color: #facc15;
          padding: 2px 6px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .kpi-amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .kpi-emerald { background: rgba(16, 185, 129, 0.15); color: #10b981; }

        .kpi-card-urgent {
          border-color: rgba(245, 158, 11, 0.4);
          background: linear-gradient(135deg, #111827 0%, rgba(245, 158, 11, 0.08) 100%);
        }

        .kpi-link-btn {
          background: transparent;
          border: none;
          color: #f59e0b;
          font-weight: 700;
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }

        /* Approvals Tab Styles */
        .approval-filter-pills {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #111827;
          padding: 4px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .pill-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pill-btn:hover {
          color: #ffffff;
        }

        .pill-btn.active {
          background: var(--primary);
          color: #ffffff;
        }

        .empty-approvals-box {
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 60px 24px;
          text-align: center;
          color: #94a3b8;
        }

        .empty-approvals-box h3 {
          font-size: 1.25rem;
          color: #ffffff;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .approvals-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .approval-card {
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          transition: border-color 0.2s;
        }

        .approval-card.is-pending {
          border-left: 4px solid #f59e0b;
        }

        .approval-card-top {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 22px;
        }

        .approval-card-thumb-wrap {
          position: relative;
          width: 100%;
          height: 175px;
          border-radius: 12px;
          overflow: hidden;
          background: #0c121e;
        }

        .approval-card-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .approval-status-pill {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 800;
          backdrop-filter: blur(8px);
        }

        .approval-status-pill.status-pending {
          background: rgba(234, 179, 8, 0.9);
          color: #0f172a;
        }

        .approval-status-pill.status-rejected {
          background: rgba(239, 68, 68, 0.9);
          color: #ffffff;
        }

        .approval-status-pill.status-active {
          background: rgba(16, 185, 129, 0.9);
          color: #ffffff;
        }

        .approval-photos-count {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(15, 23, 42, 0.85);
          color: #f1f5f9;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .approval-card-main {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .approval-card-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .approval-vehicle-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .approval-vehicle-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #94a3b8;
          flex-wrap: wrap;
        }

        .approval-price-box {
          text-align: right;
        }

        .approval-price-val {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--primary);
        }

        .approval-price-lbl {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .approval-specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px;
          background: #0c121e;
          padding: 12px 16px;
          border-radius: 10px;
        }

        .spec-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .spec-lbl {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
        }

        .spec-val {
          font-size: 0.88rem;
          font-weight: 700;
          color: #f1f5f9;
        }

        .rejection-reason-box {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fecdd3;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.84rem;
        }

        .approval-features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .approval-feature-chip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .approval-lister-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 12px;
          gap: 14px;
          flex-wrap: wrap;
        }

        .approval-lister-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .lister-avatar {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #1e293b;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .lister-name {
          font-size: 0.88rem;
          font-weight: 700;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .verified-badge-sm {
          background: #059669;
          color: #ffffff;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 800;
        }

        .lister-type-tag {
          font-size: 0.68rem;
          padding: 1px 6px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-weight: 600;
        }

        .lister-contact-line {
          font-size: 0.75rem;
          color: #64748b;
          display: flex;
          gap: 10px;
          margin-top: 2px;
        }

        .approval-quick-contact {
          display: flex;
          gap: 8px;
        }

        .btn-lister-whatsapp {
          background: rgba(37, 211, 102, 0.15);
          color: #25d366;
          border: 1px solid rgba(37, 211, 102, 0.3);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-lister-whatsapp:hover {
          background: #25d366;
          color: #ffffff;
        }

        .btn-lister-call {
          background: rgba(255, 255, 255, 0.08);
          color: #f1f5f9;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-lister-call:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .approval-actions-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 4px;
        }

        .btn-admin-approve {
          background: #059669;
          color: #ffffff;
          border: none;
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: transform 0.15s, background 0.2s;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
        }

        .btn-admin-approve:hover {
          background: #047857;
          transform: translateY(-1px);
        }

        .btn-admin-edit {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-admin-edit:hover {
          background: #3b82f6;
          color: #ffffff;
        }

        .btn-admin-reject {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-admin-reject:hover {
          background: #ef4444;
          color: #ffffff;
        }

        .btn-admin-delete {
          background: transparent;
          color: #64748b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.84rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
          margin-left: auto;
        }

        .btn-admin-delete:hover {
          background: #ef4444;
          border-color: #ef4444;
          color: #ffffff;
        }

        /* Status changer select in tables */
        .status-changer-select {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #1e293b;
          color: #f1f5f9;
          cursor: pointer;
        }

        .status-changer-select.status-active { color: #34d399; }
        .status-changer-select.status-pending { color: #facc15; }
        .status-changer-select.status-rejected { color: #f87171; }
        .status-changer-select.status-rented { color: #60a5fa; }
        .status-changer-select.status-hidden { color: #94a3b8; }

        .btn-action-edit {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          background: rgba(249, 115, 22, 0.15);
          color: #fb923c;
          transition: all 0.2s;
        }

        .btn-action-edit:hover {
          background: var(--primary);
          color: #ffffff;
        }

        .badge-count-sm {
          background: rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        /* Super Admin Modals */
        .admin-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        .admin-modal {
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          width: 100%;
          max-width: 540px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
        }

        .admin-modal.admin-modal-lg {
          max-width: 760px;
        }

        .admin-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: #0d1322;
        }

        .admin-modal-header h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 2px;
        }

        .admin-modal-header p {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .btn-close-modal {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: color 0.2s;
        }

        .btn-close-modal:hover {
          color: #ffffff;
        }

        .admin-modal-body {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .admin-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: #0d1322;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .reject-presets {
          background: #0c121e;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 12px;
        }

        .preset-pill-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.72rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .preset-pill-btn:hover {
          background: rgba(249, 115, 22, 0.2);
          border-color: rgba(249, 115, 22, 0.4);
          color: #ffffff;
        }

        .images-editor-grid {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 6px;
        }

        .img-editor-card {
          position: relative;
          width: 72px;
          height: 52px;
          border-radius: 8px;
          overflow: hidden;
          background: #0c121e;
        }

        .img-editor-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-remove-img {
          position: absolute;
          top: 2px;
          right: 2px;
          background: rgba(239, 68, 68, 0.85);
          color: #ffffff;
          border: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .btn-primary {
          background: var(--primary);
          color: #ffffff;
          border: none;
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #ea580c;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.08);
          color: #f1f5f9;
          border: none;
          padding: 9px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-danger {
          background: #ef4444;
          color: #ffffff;
          border: none;
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .admin-layout {
            grid-template-columns: 1fr;
          }
          .admin-sidebar {
            flex-direction: row;
            overflow-x: auto;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }
          .sidebar-group-title {
            display: none;
          }
          .cms-split-container {
            grid-template-columns: 1fr;
          }
          .cms-preview-column {
            position: static;
          }
          .approval-card-top {
            grid-template-columns: 1fr;
          }
          .form-grid-3 {
            grid-template-columns: 1fr;
          }
        }

        /* Festival Celebration Themes & Accessories Customizer Styles */
        .badge-active-festival {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          background: rgba(5, 150, 105, 0.15);
          color: #059669;
          border: 1px solid rgba(5, 150, 105, 0.3);
        }
        .festival-selector-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }
        .festival-card {
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 10px;
        }
        :is(.dark, [data-theme="dark"]) .festival-card {
          background: #1e293b;
          border-color: #334155;
        }
        .festival-card:hover:not(.disabled) {
          border-color: #10b981;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
        }
        .festival-card.selected {
          border-color: #059669;
          background: rgba(5, 150, 105, 0.04);
          box-shadow: 0 0 0 1px #059669;
        }
        .festival-card.disabled {
          opacity: 0.55;
          cursor: not-allowed;
          background: #f8fafc;
        }
        :is(.dark, [data-theme="dark"]) .festival-card.disabled {
          background: #0f172a;
        }
        .festival-card-header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .festival-icon {
          font-size: 1.6rem;
          line-height: 1;
        }
        .festival-card-header h4 {
          font-size: 0.92rem;
          font-weight: 700;
          margin: 0 0 2px 0;
          color: #0f172a;
        }
        :is(.dark, [data-theme="dark"]) .festival-card-header h4 {
          color: #f8fafc;
        }
        .festival-card-header p {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
          line-height: 1.3;
        }
        .festival-badge-active {
          align-self: flex-start;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
          background: #059669;
          color: #ffffff;
        }
        .festival-badge-soon {
          align-self: flex-start;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 6px;
          background: #e2e8f0;
          color: #64748b;
        }
        :is(.dark, [data-theme="dark"]) .festival-badge-soon {
          background: #334155;
          color: #94a3b8;
        }
        .btn-select-festival {
          align-self: flex-start;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 6px;
          background: #f1f5f9;
          color: #334155;
          border: none;
          cursor: pointer;
        }
        .btn-select-festival:hover {
          background: #059669;
          color: #ffffff;
        }
        .festival-customization-panel {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px;
          margin-top: 12px;
        }
        :is(.dark, [data-theme="dark"]) .festival-customization-panel {
          background: #1e293b;
          border-color: #334155;
        }
        .accessory-toggles-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .accessory-toggle-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px;
          transition: border-color 0.2s;
        }
        :is(.dark, [data-theme="dark"]) .accessory-toggle-card {
          background: #0f172a;
          border-color: #334155;
        }
        .accessory-toggle-card:hover {
          border-color: #cbd5e1;
        }
        .festival-select {
          width: 100%;
          max-width: 420px;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #0f172a;
          font-size: 0.85rem;
          outline: none;
        }
        :is(.dark, [data-theme="dark"]) .festival-select {
          background: #1e293b;
          border-color: #475569;
          color: #f8fafc;
        }
        .btn-text-danger {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }
        .btn-text-danger:hover {
          color: #dc2626;
        }
        .festival-empty-notice {
          padding: 24px;
          text-align: center;
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          color: #64748b;
        }
        :is(.dark, [data-theme="dark"]) .festival-empty-notice {
          border-color: #334155;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
