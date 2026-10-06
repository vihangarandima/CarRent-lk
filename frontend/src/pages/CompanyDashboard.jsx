import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { useToast } from "../context/ToastContext";
import { formatVehicleImageUrl, handleImageError } from "../utils/imageHelper";
import logo from "../assets/images/logo.png";
import { uploadVehicleImage } from "../utils/uploadImage";
import {
  DASHBOARD_PATH,
  logout,
  setBrowsingAsCustomer,
  updateStoredUser,
} from "../utils/session";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  Car,
  CarFront,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  Edit3,
  ExternalLink,
  Eye,
  Camera,
  Loader2,
  Search,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plus,
  Settings,
  Save,
  TrendingUp,
  Trash2,
  UserCheck,
  Users,
  Wallet,
  X,
  MessageSquare,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatLKR } from "../data/mock";

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Fleet", icon: CarFront },
  { label: "Bookings", icon: CalendarCheck },
  { label: "Inquiries & Bids", icon: MessageSquare },
];

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

// Short Y-axis labels: 0, 500, 2k, 1.5M
const formatAxis = (v) => {
  if (v >= 1000000) return `${+(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${+(v / 1000).toFixed(1)}k`;
  return `${v}`;
};

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  // Personal hosts ("owner") use their own account details instead of a company profile
  const isCompany = user?.role === "company";
  const wantsCompanySetup = new URLSearchParams(location.search).get("setup") === "company";
  // Companies add vehicles in bulk; personal hosts use the step-by-step form
  const addVehiclePath = isCompany ? "/fleet/quick-add" : "/list-my-car";

  const [company, setCompany] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [bids, setBids] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [rentalStats, setRentalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleEditData, setVehicleEditData] = useState({});
  const [savingVehicle, setSavingVehicle] = useState(false);

  // Mark as Rented modal state
  const [rentalModal, setRentalModal] = useState(null); // vehicle object or null
  const [rentalForm, setRentalForm] = useState({
    customerName: "",
    customerPhone: "",
    customerNIC: "",
    pickupDate: new Date().toISOString().split("T")[0],
    returnDate: "",
    dailyRate: "",
    notes: "",
  });
  const [savingRental, setSavingRental] = useState(false);
  const [showRentalDetails, setShowRentalDetails] = useState(false);

  const [newCompanyName, setNewCompanyName] = useState(user?.name ? `${user.name} Rentals` : "");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("Colombo, Sri Lanka");

  useEffect(() => {
    if (!token || !user) {
      navigate(`/login?redirect=${encodeURIComponent(DASHBOARD_PATH)}`, { replace: true });
      return;
    }
    if (user.role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }
    if (user.role === "renter" && !wantsCompanySetup) {
      navigate("/choose-listing-type", { replace: true });
      return;
    }
    // Being on the dashboard means working as a lister, not browsing as a customer
    setBrowsingAsCustomer(false);

    const personalProfile = {
      companyName: user.name,
      phone: user.phone || "",
      contactEmail: user.email || "",
      isPersonal: true,
    };

    const fetchData = async () => {
      try {
        const companyReq =
          user.role === "owner"
            ? Promise.resolve({ data: personalProfile })
            : axios.get(`${API_URL}/api/companies/me`).catch((err) => {
                if (err.response?.status === 404) return { data: null };
                throw err;
              });
        const [companyRes, vehiclesRes, bidsRes, rentalsRes, rentalStatsRes] = await Promise.all([
          companyReq,
          axios.get(`${API_URL}/api/vehicles/my`, {
            headers: { "x-auth-token": token },
          }),
          axios.get(`${API_URL}/api/bids/my`, {
            headers: { "x-auth-token": token },
          }).catch(() => ({ data: [] })),
          axios.get(`${API_URL}/api/rentals/my`, {
            headers: { "x-auth-token": token },
          }).catch(() => ({ data: [] })),
          axios.get(`${API_URL}/api/rentals/stats`, {
            headers: { "x-auth-token": token },
          }).catch(() => ({ data: null })),
        ]);
        if (companyRes.data) {
          setCompany(companyRes.data);
          setEditData(companyRes.data);
        }
        setVehicles(vehiclesRes.data || []);
        setBids(bidsRes.data || []);
        setRentals(rentalsRes.data || []);
        setRentalStats(rentalStatsRes.data || null);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        toast.error(err.response?.data?.msg || "Could not load your dashboard. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(
        `${API_URL}/api/companies/me`,
        {
          companyName: newCompanyName || `${user?.name || "My"} Rentals`,
          phone: newPhone,
          address: newAddress,
          contactEmail: user?.email || "",
        },
        { headers: { "x-auth-token": token } }
      );
      setCompany(res.data);
      setEditData(res.data);
      setUser(updateStoredUser({ role: "company", companyId: res.data._id }));
      localStorage.setItem(
        "company",
        JSON.stringify({ id: res.data._id, companyName: res.data.companyName, logo: res.data.logo })
      );
      navigate(DASHBOARD_PATH, { replace: true });
      toast.success("Company profile created successfully!");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to initialize company profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (company?.isPersonal) {
        const res = await axios.post(`${API_URL}/api/auth/update-profile`, {
          name: editData.companyName,
          phone: editData.phone,
        });
        const saved = res.data.user;
        setUser(updateStoredUser({ name: saved.name, phone: saved.phone }));
        setCompany({ ...company, companyName: saved.name, phone: saved.phone });
      } else {
        const { companyName, phone, contactEmail, address, logo, description } = editData;
        const res = await axios.put(`${API_URL}/api/companies/me`, {
          companyName, phone, contactEmail, address, logo, description,
        });
        setCompany(res.data);
      }
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    try {
      await axios.delete(`${API_URL}/api/vehicles/${vehicleId}`, {
        headers: { "x-auth-token": token },
      });
      setVehicles(vehicles.filter((v) => v._id !== vehicleId));
      setDeleteConfirm(null);
      toast.success("Vehicle removed from fleet.");
    } catch (err) {
      toast.error("Failed to delete vehicle: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleOpenVehicleProfile = (v) => {
    setSelectedVehicle(v);
    setVehicleEditData({
      brand: v.brand || "",
      model: v.model || "",
      year: v.year || new Date().getFullYear(),
      pricePerDay: v.pricePerDay || "",
      pricePerKmAfter100km: v.pricePerKmAfter100km || 0,
      vehicleType: v.vehicleType || "car",
      fuelType: v.fuelType || "",
      // older listings stored "Auto"; normalise to the value the forms use
      transmission: v.transmission === "Auto" ? "Automatic" : v.transmission || "",
      rentMode: v.rentMode || "self-drive",
      seats: v.seats || "",
      kmPerDay: v.kmPerDay === 0 ? "0" : String(v.kmPerDay || 100),
      minRentalDays: String(v.minRentalDays || 1),
      location: v.location || "",
      description: v.description || "",
      status: v.status || "active",
      availableFrom: v.availableFrom ? new Date(v.availableFrom).toISOString().split("T")[0] : "",
      availableTo: v.availableTo ? new Date(v.availableTo).toISOString().split("T")[0] : "",
    });
  };

  const handleSaveVehicleProfile = async (e) => {
    if (e) e.preventDefault();
    if (!selectedVehicle) return;
    const vehicleId = selectedVehicle._id || selectedVehicle.id;
    if (!vehicleId) {
      toast.error("Vehicle ID is missing");
      return;
    }
    setSavingVehicle(true);
    try {
      const currentToken = localStorage.getItem("token") || token;
      const res = await axios.put(`${API_URL}/api/vehicles/${vehicleId}`, vehicleEditData, {
        headers: { "x-auth-token": currentToken },
      });
      setVehicles(vehicles.map((v) => ((v._id || v.id) === vehicleId ? res.data : v)));
      setSelectedVehicle(null);
      toast.success(`${res.data.brand} ${res.data.model} updated successfully!`);
    } catch (err) {
      console.error("Vehicle update error:", err);
      toast.error("Failed to update vehicle: " + (err.response?.data?.msg || err.message));
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleLogout = logout;

  // ── One-line fleet management ──
  const [fleetSearch, setFleetSearch] = useState("");
  const [rowBusy, setRowBusy] = useState({});
  const [priceDrafts, setPriceDrafts] = useState({});

  const patchVehicle = async (v, changes, successMsg) => {
    setRowBusy((b) => ({ ...b, [v._id]: true }));
    try {
      const res = await axios.put(`${API_URL}/api/vehicles/${v._id}`, changes);
      setVehicles((prev) => prev.map((x) => (x._id === v._id ? { ...x, ...res.data } : x)));
      if (successMsg) toast.success(successMsg);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Could not update this vehicle.");
      return false;
    } finally {
      setRowBusy((b) => ({ ...b, [v._id]: false }));
    }
  };

  const commitPrice = async (v) => {
    const draft = priceDrafts[v._id];
    if (draft === undefined) return;
    const price = Number(draft);
    if (!(price > 0)) {
      toast.warning("Enter a valid daily price.");
      setPriceDrafts((d) => ({ ...d, [v._id]: undefined }));
      return;
    }
    if (price !== Number(v.pricePerDay)) {
      await patchVehicle(v, { pricePerDay: price }, `${v.brand} ${v.model}: price updated.`);
    }
    setPriceDrafts((d) => ({ ...d, [v._id]: undefined }));
  };

  const toggleLive = (v) =>
    patchVehicle(
      v,
      { status: v.status === "hidden" ? "active" : "hidden" },
      v.status === "hidden" ? `${v.brand} ${v.model} is live again.` : `${v.brand} ${v.model} is paused and hidden from customers.`
    );

  const addRowPhoto = async (v, file) => {
    if (!file) return;
    setRowBusy((b) => ({ ...b, [v._id]: true }));
    try {
      const url = await uploadVehicleImage(file);
      await patchVehicle(v, { images: [url, ...(v.images || [])].slice(0, 5) }, "Photo added.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRowBusy((b) => ({ ...b, [v._id]: false }));
    }
  };

  const browseAsCustomer = () => {
    setBrowsingAsCustomer(true);
    navigate("/");
  };

  const startEditProfile = () => {
    setEditData(company);
    setEditMode(true);
    setActiveTab("Overview");
    setTimeout(() => document.getElementById("cd-profile")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  // ── Mark as Rented ──
  const handleOpenRentalModal = (vehicle) => {
    setRentalModal(vehicle);
    // Default return date to 3 days from now for quick fill
    const defaultReturn = new Date();
    defaultReturn.setDate(defaultReturn.getDate() + 3);
    setRentalForm({
      customerName: "",
      customerPhone: "",
      customerNIC: "",
      pickupDate: new Date().toISOString().split("T")[0],
      returnDate: defaultReturn.toISOString().split("T")[0],
      dailyRate: vehicle.pricePerDay || "",
      notes: "",
    });
    setShowRentalDetails(false);
  };

  const handleSubmitRental = async (e) => {
    e.preventDefault();
    if (!rentalModal) return;
    setSavingRental(true);
    try {
      const vehicleId = rentalModal._id || rentalModal.id;
      const res = await axios.post(
        `${API_URL}/api/rentals`,
        { vehicleId, ...rentalForm },
        { headers: { "x-auth-token": token } }
      );
      // Add rental to list
      setRentals((prev) => [res.data, ...prev]);
      // Update vehicle status locally to 'rented'
      setVehicles((prev) =>
        prev.map((v) => ((v._id || v.id) === vehicleId ? { ...v, status: "rented" } : v))
      );
      // Refresh rental stats
      try {
        const statsRes = await axios.get(`${API_URL}/api/rentals/stats`, {
          headers: { "x-auth-token": token },
        });
        setRentalStats(statsRes.data);
      } catch (_) {}
      setRentalModal(null);
      toast.success(`${rentalModal.brand} ${rentalModal.model} marked as rented!`);
    } catch (err) {
      toast.error("Failed to record rental: " + (err.response?.data?.msg || err.message));
    } finally {
      setSavingRental(false);
    }
  };

  const handleCompleteRental = async (rentalId) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/rentals/${rentalId}`,
        { status: "completed" },
        { headers: { "x-auth-token": token } }
      );
      setRentals((prev) => prev.map((r) => (r._id === rentalId ? res.data : r)));
      // Set vehicle back to active locally
      if (res.data.vehicle) {
        const vid = res.data.vehicle._id || res.data.vehicle;
        setVehicles((prev) =>
          prev.map((v) => ((v._id || v.id) === vid ? { ...v, status: "active" } : v))
        );
      }
      // Refresh stats
      try {
        const statsRes = await axios.get(`${API_URL}/api/rentals/stats`, {
          headers: { "x-auth-token": token },
        });
        setRentalStats(statsRes.data);
      } catch (_) {}
      toast.success("Rental marked as completed / returned!");
    } catch (err) {
      toast.error("Failed to update rental: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleCancelRental = async (rentalId) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/rentals/${rentalId}`,
        { status: "cancelled" },
        { headers: { "x-auth-token": token } }
      );
      setRentals((prev) => prev.map((r) => (r._id === rentalId ? res.data : r)));
      if (res.data.vehicle) {
        const vid = res.data.vehicle._id || res.data.vehicle;
        setVehicles((prev) =>
          prev.map((v) => ((v._id || v.id) === vid ? { ...v, status: "active" } : v))
        );
      }
      try {
        const statsRes = await axios.get(`${API_URL}/api/rentals/stats`, {
          headers: { "x-auth-token": token },
        });
        setRentalStats(statsRes.data);
      } catch (_) {}
      toast.success("Rental cancelled.");
    } catch (err) {
      toast.error("Failed to cancel rental: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleUpdateBidStatus = async (bidId, newStatus) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/bids/${bidId}`,
        { status: newStatus },
        { headers: { "x-auth-token": token } }
      );
      setBids((prev) => prev.map((b) => (b._id === bidId ? res.data : b)));
      toast.success(`Inquiry offer marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Could not update offer status");
    }
  };

  // Calculations from real data (rentals + bids combined)
  const totalVehicles = vehicles.length;
  const rentedVehicles = vehicles.filter((v) => v.status === "rented").length;
  const activeVehicles = vehicles.filter((v) => (v.status || "active") === "active").length;
  const utilisationRate = totalVehicles > 0 ? Math.round((rentedVehicles / totalVehicles) * 100) : 0;

  // Revenue from rentals (primary source)
  const rentalRevenue = rentalStats?.totalRevenue || 0;
  const activeRentalRevenue = rentalStats?.activeRevenue || 0;
  const completedRentalRevenue = rentalStats?.completedRevenue || 0;

  // Revenue from bids (legacy/secondary)
  const bidClearedRevenue = bids
    .filter((b) => b.status === "accepted")
    .reduce((sum, b) => sum + (Number(b.offerPrice) || 0), 0);
  const bidPendingRevenue = bids
    .filter((b) => b.status === "pending")
    .reduce((sum, b) => sum + (Number(b.offerPrice) || 0), 0);
  const refundedRevenue = bids
    .filter((b) => b.status === "rejected")
    .reduce((sum, b) => sum + (Number(b.offerPrice) || 0), 0);

  // Combined totals
  const clearedRevenue = rentalRevenue + bidClearedRevenue;
  const pendingRevenue = bidPendingRevenue + activeRentalRevenue;

  const activeRentalsCount = rentalStats?.activeRentals || 0;
  const activeBookings = activeRentalsCount + bids.filter((b) => b.status === "accepted" || b.status === "pending").length;
  const todayBookings = rentals.filter((r) => new Date(r.createdAt).toDateString() === new Date().toDateString()).length +
    bids.filter((b) => new Date(b.createdAt).toDateString() === new Date().toDateString()).length;
  const dailyFleetRate = vehicles.reduce((sum, v) => sum + (Number(v.pricePerDay) || 0), 0);

  // Monthly chart data: merge rental stats + bid data
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const revenueChartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mIdx = d.getMonth();
    const yr = d.getFullYear();
    const mLabel = monthNames[mIdx];
    // Bid revenue for this month
    const bidRev = bids
      .filter((b) => {
        if (b.status !== "accepted") return false;
        const bd = new Date(b.createdAt);
        return bd.getFullYear() === yr && bd.getMonth() === mIdx;
      })
      .reduce((sum, b) => sum + (Number(b.offerPrice) || 0), 0);
    // Rental revenue for this month (from stats API)
    const rentalChartEntry = rentalStats?.monthlyRevenue?.find((m) => m.month === mLabel);
    const rentalRev = rentalChartEntry ? rentalChartEntry.revenue : 0;
    revenueChartData.push({ month: mLabel, revenue: bidRev + rentalRev });
  }

  /* ── Loading state ── */
  if (loading)
    return (
      <div className="cd-loading">
        <div className="cd-spinner" />
        <p>Loading your dashboard...</p>
        <style>{loadingCSS}</style>
      </div>
    );

  /* ── No company found / Quick Setup Fallback ── */
  if (!company)
    return (
      <div className="cd-loading" style={{ padding: "40px 20px" }}>
        <div className="cd-error-icon" style={{ background: "#FFEDD5", color: "#F97316" }}>
          <Building2 size={36} />
        </div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 8px 0" }}>Setup Your Company Profile</h2>
        <p style={{ color: "#64748B", maxWidth: 440, textAlign: "center", marginBottom: 24, fontSize: "0.95rem" }}>
          Provide your company details below to initialize your fleet manager dashboard.
        </p>

        <form onSubmit={handleQuickCreate} style={{ width: "100%", maxWidth: 460, background: "#fff", padding: "28px", borderRadius: "16px", border: "1px solid #E2E8F0", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="cd-form-group">
            <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155", marginBottom: 6 }}>Company Name</label>
            <input
              type="text"
              placeholder="e.g. Colombo Premier Fleet"
              required
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #CBD5E1", fontSize: "0.9rem", boxSizing: "border-box" }}
            />
          </div>
          <div className="cd-form-group">
            <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155", marginBottom: 6 }}>Phone Number</label>
            <input
              type="text"
              placeholder="e.g. +94 77 123 4567"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #CBD5E1", fontSize: "0.9rem", boxSizing: "border-box" }}
            />
          </div>
          <div className="cd-form-group">
            <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155", marginBottom: 6 }}>Address / City</label>
            <input
              type="text"
              placeholder="e.g. Colombo 03, Sri Lanka"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #CBD5E1", fontSize: "0.9rem", boxSizing: "border-box" }}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="cd-add-vehicle-btn"
            style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: 8, fontSize: "0.95rem" }}
          >
            {saving ? "Creating Profile..." : "Create & Launch Dashboard →"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            style={{ background: "transparent", border: "none", color: "#EF4444", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", marginTop: 4, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <LogOut size={14} /> Log out of account
          </button>
        </form>
        <style>{loadingCSS}</style>
      </div>
    );

  return (
    <>
      <div className="cd-wrapper">
        <div className="cd-layout">
          {/* ── Sidebar ── */}
          <aside className="cd-sidebar">
            <Link to={DASHBOARD_PATH} className="cd-logo">
              <img src={logo} alt="" className="cd-logo-img" />
              <span className="cd-logo-text">
                Yamu<span className="cd-logo-accent"> Car Rentals</span>
              </span>
            </Link>

            <nav className="cd-nav">
              {navItems.map(({ label, icon: Icon }) => (
                <button key={label} type="button"
                  className={`cd-nav-item ${activeTab === label ? "cd-nav-active" : ""}`}
                  onClick={() => setActiveTab(label)}>
                  <Icon size={16} />
                  {label}
                </button>
              ))}

              <div className="cd-nav-divider" />

              <button type="button" className="cd-nav-item" onClick={browseAsCustomer}>
                <Eye size={16} />
                View site as customer
              </button>
              {!company.isPersonal && company._id && (
                <Link to={`/companies/${company._id}`} className="cd-nav-item" target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} />
                  View Public Page
                </Link>
              )}

              <div className="cd-nav-divider" />

              <button className="cd-nav-item cd-nav-logout" onClick={handleLogout}>
                <LogOut size={16} />
                Log Out
              </button>
            </nav>

            <div className="cd-sidebar-card">
              <p className="cd-sidebar-card-name">{company.companyName}</p>
              <p className="cd-sidebar-card-sub">
                <CheckCircle size={10} style={{ color: "#10b981" }} />{" "}
                {company.isPersonal ? "Personal host" : "Rent-a-car company"}
                {company.address ? ` · ${company.address}` : ""}
              </p>
              <Link to={addVehiclePath} className="cd-add-vehicle-btn">
                <Plus size={14} /> Add vehicle
              </Link>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="cd-main">
            <header className="cd-header">
              <div>
                <h1 className="cd-title">
                  {greeting()}, <span style={{ color: "#f97316" }}>{company.companyName}</span>
                </h1>
                <p className="cd-subtitle">
                  {company.isPersonal ? "Manage your vehicles and rentals." : "Manage your fleet, rentals and company profile."}
                </p>
              </div>
              <div className="cd-header-actions">
                <Link to={addVehiclePath} className="cd-btn-primary-sm cd-header-btn">
                  <Plus size={14} /> Add vehicle
                </Link>
                <button type="button" onClick={browseAsCustomer} className="cd-btn-outline cd-header-btn">
                  <Eye size={14} /> View site as customer
                </button>
                <button type="button" onClick={handleLogout} className="cd-btn-outline cd-header-btn cd-btn-logout">
                  <LogOut size={14} /> Log out
                </button>
              </div>
            </header>

            {/* Tabs for phones and tablets, where the sidebar is hidden */}
            <nav className="cd-mobile-tabs" aria-label="Dashboard sections">
              {navItems.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  className={`cd-mobile-tab ${activeTab === label ? "cd-mobile-tab-active" : ""}`}
                  onClick={() => setActiveTab(label)}
                >
                  <Icon size={15} /> {label === "Bookings" ? "Rentals" : label}
                </button>
              ))}
            </nav>

            {!company.phone && (
              <div className="cd-alert">
                <Phone size={18} />
                <div>
                  <strong>Add your phone number</strong>
                  <p>Customers contact you on WhatsApp from your listings. Without a number they can't reach you.</p>
                </div>
                <button type="button" className="cd-btn-primary-sm" onClick={startEditProfile}>
                  Add number
                </button>
              </div>
            )}

            {/* ── OVERVIEW TAB ── */}
            {activeTab === "Overview" && (
              <>
                {/* ── Stat cards ── */}
                <div className="cd-stats-grid">
                  <StatCard icon={Wallet} label="Revenue (7 months)" value={formatLKR(clearedRevenue)} delta={dailyFleetRate > 0 ? `${formatLKR(dailyFleetRate)}/day fleet rate` : "Rs. 0"} deltaColor={clearedRevenue > 0 ? "#10b981" : "#71717a"} />
                  <StatCard icon={CalendarCheck} label="Active rentals" value={activeRentalsCount} delta={todayBookings > 0 ? `+${todayBookings} today` : `${rentals.length} total rentals`} deltaColor={activeRentalsCount > 0 ? "#10b981" : "#71717a"} />
                  <StatCard icon={CarFront} label="Fleet size" value={`${totalVehicles} vehicle${totalVehicles === 1 ? "" : "s"}`} delta={`${rentedVehicles} rented · ${activeVehicles} available`} deltaColor="#71717a" />
                  <StatCard icon={TrendingUp} label="Utilisation" value={`${utilisationRate}%`} delta={totalVehicles > 0 ? `${rentedVehicles} of ${totalVehicles} rented` : "0 listed"} deltaColor={utilisationRate > 0 ? "#10b981" : "#71717a"} />
                </div>

                {/* ── Chart + Quick actions row ── */}
                <div className="cd-mid-row">
                  <section className="cd-card cd-chart-card">
                    <div className="cd-card-head">
                      <h2 className="cd-card-title">Revenue (LKR)</h2>
                      <span className="cd-monthly-badge"><BarChart3 size={14} /> Monthly</span>
                    </div>
                    <div className="cd-chart-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueChartData}>
                          <defs>
                            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ea580c" stopOpacity={0.55} />
                              <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                          <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatAxis} allowDecimals={false} domain={[0, (max) => Math.max(max, 10000)]} />
                          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e5e7eb", background: "#fff", color: "#111827" }} formatter={(v) => formatLKR(v)} />
                          <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={3} fill="url(#rev)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section className="cd-card cd-actions-card">
                    <h2 className="cd-card-title">Quick actions</h2>
                    <div className="cd-actions-grid">
                      {[
                        { label: "Add vehicle", icon: Plus, to: addVehiclePath },
                        {
                          label: "Record a rental",
                          icon: KeyRound,
                          onClick: () => {
                            setActiveTab("Fleet");
                            toast.info("Tap the key icon next to a vehicle to record a rental.");
                          },
                        },
                        { label: "Rental records", icon: CalendarCheck, onClick: () => setActiveTab("Bookings") },
                        { label: "View site as customer", icon: Eye, onClick: browseAsCustomer },
                      ].map(({ label, icon: Icon, to, onClick }) => (
                        to ? (
                          <Link key={label} to={to} className="cd-action-btn">
                            <Icon size={20} className="cd-action-icon" />
                            <span className="cd-action-label">{label}</span>
                          </Link>
                        ) : (
                          <button key={label} type="button" className="cd-action-btn" onClick={onClick}>
                            <Icon size={20} className="cd-action-icon" />
                            <span className="cd-action-label">{label}</span>
                          </button>
                        )
                      ))}
                    </div>

                    <h3 className="cd-payment-title">Payment status</h3>
                    <ul className="cd-payment-list">
                      {[
                        { label: "Completed rentals", value: completedRentalRevenue + bidClearedRevenue, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
                        { label: "Active rentals", value: activeRentalRevenue, color: "#f97316", bg: "rgba(249,115,22,0.1)" },
                        { label: "Pending bids", value: bidPendingRevenue, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
                      ].map((p) => (
                        <li key={p.label} className="cd-payment-row" style={{ background: p.bg }}>
                          <span className="cd-payment-label">{p.label}</span>
                          <span className="cd-payment-value" style={{ color: p.color }}>{formatLKR(p.value)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                {/* ── Company Profile Card ── */}
                <section className="cd-card cd-profile-card" id="cd-profile">
                  <div className="cd-card-head">
                    <div>
                      <h2 className="cd-card-title">{company.isPersonal ? "My Contact Details" : "Company Information"}</h2>
                      <p className="cd-card-desc">Customers use these details to contact you.</p>
                    </div>
                    {!editMode ? (
                      <button className="cd-btn-outline" onClick={startEditProfile}>
                        <Edit3 size={12} /> Edit
                      </button>
                    ) : (
                      <div className="cd-edit-actions">
                        <button className="cd-btn-text" onClick={() => { setEditMode(false); setEditData(company); }}>Cancel</button>
                        <button className="cd-btn-primary-sm" onClick={handleSave} disabled={saving}>
                          {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="cd-card-body">
                    {editMode && company.isPersonal ? (
                      <div className="cd-edit-form">
                        <div className="cd-form-row">
                          <div className="cd-form-group">
                            <label>Full Name</label>
                            <input type="text" value={editData.companyName || ""} onChange={(e) => setEditData({ ...editData, companyName: e.target.value })} />
                          </div>
                          <div className="cd-form-group">
                            <label>Phone Number (WhatsApp)</label>
                            <input type="tel" value={editData.phone || ""} placeholder="077 123 4567" onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    ) : editMode ? (
                      <div className="cd-edit-form">
                        <div className="cd-form-row">
                          <div className="cd-form-group">
                            <label>Company Name</label>
                            <input type="text" value={editData.companyName || ""} onChange={(e) => setEditData({ ...editData, companyName: e.target.value })} />
                          </div>
                          <div className="cd-form-group">
                            <label>Phone Number (WhatsApp)</label>
                            <input type="tel" value={editData.phone || ""} placeholder="077 123 4567" onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
                          </div>
                        </div>
                        <div className="cd-form-row">
                          <div className="cd-form-group">
                            <label>Contact Email</label>
                            <input type="email" value={editData.contactEmail || ""} onChange={(e) => setEditData({ ...editData, contactEmail: e.target.value })} />
                          </div>
                          <div className="cd-form-group">
                            <label>Address</label>
                            <input type="text" value={editData.address || ""} onChange={(e) => setEditData({ ...editData, address: e.target.value })} />
                          </div>
                        </div>
                        <div className="cd-form-group">
                          <label>Logo URL</label>
                          <input type="text" value={editData.logo || ""} onChange={(e) => setEditData({ ...editData, logo: e.target.value })} />
                        </div>
                        <div className="cd-form-group">
                          <label>Description</label>
                          <textarea rows={3} value={editData.description || ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} placeholder="Describe your services..." />
                        </div>
                      </div>
                    ) : (
                      <div className="cd-info-grid">
                        {!company.isPersonal && (
                          <div className="cd-info-item">
                            <div className="cd-info-icon"><MapPin size={16} /></div>
                            <div><span className="cd-info-label">Address</span><span className="cd-info-value">{company.address || "Not specified"}</span></div>
                          </div>
                        )}
                        <div className="cd-info-item">
                          <div className="cd-info-icon"><Phone size={16} /></div>
                          <div><span className="cd-info-label">Phone</span><span className="cd-info-value">{company.phone || "Not specified"}</span></div>
                        </div>
                        <div className="cd-info-item">
                          <div className="cd-info-icon"><Mail size={16} /></div>
                          <div><span className="cd-info-label">Email</span><span className="cd-info-value">{company.contactEmail || "Not specified"}</span></div>
                        </div>
                        {company.description && (
                          <div className="cd-info-item cd-info-full">
                            <div><span className="cd-info-label">About</span><p className="cd-info-desc">{company.description}</p></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* ── FLEET TAB ── */}
            {activeTab === "Fleet" && (
              <section className="cd-card cd-fleet-card" style={{ marginTop: 24 }}>
                <div className="cd-card-head">
                  <div>
                    <h2 className="cd-card-title">Vehicle Fleet</h2>
                    <p className="cd-card-desc">
                      {totalVehicles} vehicle{totalVehicles === 1 ? "" : "s"} · {activeVehicles} available · {rentedVehicles} rented
                    </p>
                  </div>
                  <Link to={addVehiclePath} className="cd-btn-primary-sm"><Plus size={12} /> Add</Link>
                </div>
                <div className="cd-card-body" style={{ padding: 0 }}>
                  {vehicles.length === 0 ? (
                    <div className="cd-empty-state">
                      <Car size={24} style={{ color: "#f97316" }} />
                      <h3>Your fleet is empty</h3>
                      <p>Start building your presence.</p>
                      <Link to={addVehiclePath} className="cd-add-vehicle-btn" style={{ marginTop: 8 }}>Add Vehicle</Link>
                    </div>
                  ) : (
                    <>
                      {vehicles.length > 5 && (
                        <div className="cd-fleet-search">
                          <Search size={16} />
                          <input
                            value={fleetSearch}
                            onChange={(e) => setFleetSearch(e.target.value)}
                            placeholder="Search your fleet by brand, model or location..."
                            aria-label="Search fleet"
                          />
                        </div>
                      )}
                      <div className="cd-fleet-list">
                        {vehicles
                          .filter((v) => {
                            const q = fleetSearch.trim().toLowerCase();
                            return !q || `${v.brand} ${v.model} ${v.location} ${v.year}`.toLowerCase().includes(q);
                          })
                          .map((v) => {
                            const status = v.status || "active";
                            const hasPhoto = Array.isArray(v.images) && v.images.length > 0;
                            const busy = rowBusy[v._id];
                            return (
                              <div key={v._id} className="cd-fleet-row">
                                <label className="cd-fleet-photo" title={hasPhoto ? "Add another photo" : "Add a photo"}>
                                  <input type="file" accept="image/*" hidden disabled={busy}
                                    onChange={(e) => { addRowPhoto(v, e.target.files?.[0]); e.target.value = ""; }} />
                                  <img
                                    src={formatVehicleImageUrl(v.images, v.vehicleType)}
                                    alt={`${v.brand} ${v.model}`}
                                    onError={(e) => handleImageError(e, formatVehicleImageUrl(null, v.vehicleType))}
                                  />
                                  <span className={`cd-fleet-photo-badge ${hasPhoto ? "" : "cd-fleet-photo-missing"}`}>
                                    {busy ? <Loader2 size={12} className="cd-spin" /> : <Camera size={12} />}
                                  </span>
                                </label>

                                <button type="button" className="cd-fleet-info" onClick={() => handleOpenVehicleProfile(v)} title="Edit all details">
                                  <span className="cd-vehicle-name">{v.brand} {v.model}</span>
                                  <span className="cd-vehicle-year">
                                    {v.year} · {v.location}{!hasPhoto && <span className="cd-fleet-nophoto"> · No photo yet</span>}
                                  </span>
                                </button>

                                <label className="cd-fleet-price" title="Price per day">
                                  <span>LKR</span>
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    min="1"
                                    value={priceDrafts[v._id] ?? v.pricePerDay ?? ""}
                                    disabled={busy}
                                    onChange={(e) => setPriceDrafts((d) => ({ ...d, [v._id]: e.target.value }))}
                                    onBlur={() => commitPrice(v)}
                                    onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                                    aria-label={`Price per day for ${v.brand} ${v.model}`}
                                  />
                                  <span>/day</span>
                                </label>

                                {status === "rented" ? (
                                  <span className="cd-fleet-status cd-fleet-rented">🔑 Rented</span>
                                ) : status === "pending" ? (
                                  <span className="cd-fleet-status cd-fleet-pending" title="Awaiting Super Admin review and approval before appearing live on the marketplace.">
                                    ⏳ Pending Approval
                                  </span>
                                ) : status === "rejected" ? (
                                  <span className="cd-fleet-status cd-fleet-rejected" title={v.rejectionReason || "Listing rejected by Super Admin. Please edit and resolve issues."}>
                                    ❌ Listing Rejected
                                  </span>
                                ) : status === "flagged" ? (
                                  <span className="cd-fleet-status cd-fleet-flagged">Under review</span>
                                ) : (
                                  <button
                                    type="button"
                                    className={`cd-fleet-toggle ${status === "active" ? "on" : ""}`}
                                    onClick={() => toggleLive(v)}
                                    disabled={busy}
                                    title={status === "active" ? "Pause (hide from customers)" : "Make live"}
                                  >
                                    <span className="cd-fleet-knob" />
                                    {status === "active" ? "Live" : "Paused"}
                                  </button>
                                )}

                                <div className="cd-cell-actions">
                                  {status === "active" && (
                                    <button type="button" className="cd-action-icon-btn cd-rent-btn" onClick={() => handleOpenRentalModal(v)} title="Record a rental">
                                      <KeyRound size={14} />
                                    </button>
                                  )}
                                  <button type="button" className="cd-action-icon-btn cd-view-btn" onClick={() => handleOpenVehicleProfile(v)} title="Edit all details">
                                    <Edit3 size={14} />
                                  </button>
                                  <button type="button" className="cd-action-icon-btn cd-delete-btn" onClick={() => setDeleteConfirm(v._id)} title="Delete">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {/* ── BOOKINGS / RENTALS TAB ── */}
            {activeTab === "Bookings" && (
              <section className="cd-card" style={{ marginTop: 24 }}>
                <div className="cd-card-head">
                  <div>
                    <h2 className="cd-card-title">Rental Records</h2>
                    <p className="cd-card-desc">{rentals.length} total rental records · {activeRentalsCount} currently active</p>
                  </div>
                </div>
                <div className="cd-card-body" style={{ padding: 0 }}>
                  {rentals.length === 0 ? (
                    <div className="cd-empty-state">
                      <KeyRound size={24} style={{ color: "#f97316" }} />
                      <h3>No rentals yet</h3>
                      <p>When you mark a vehicle as rented, it will appear here.</p>
                    </div>
                  ) : (
                    <div className="cd-table-wrap">
                      <table className="cd-table">
                        <thead>
                          <tr>
                            <th>Vehicle</th>
                            <th>Customer</th>
                            <th>Period</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rentals.map((r) => {
                            const veh = r.vehicle;
                            const statusColors = { active: "#ef4444", completed: "#10b981", cancelled: "#94a3b8" };
                            const statusLabels = { active: "Rented", completed: "Returned", cancelled: "Cancelled" };
                            return (
                              <tr key={r._id}>
                                <td>
                                  <div className="cd-cell-vehicle">
                                    <div>
                                      <span className="cd-vehicle-name">{veh?.brand || "—"} {veh?.model || ""}</span>
                                      <span className="cd-vehicle-year">{veh?.year || ""}</span>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    <span style={{ fontWeight: 600, display: "block", color: "#09090b" }}>{r.customerName}</span>
                                    <span style={{ fontSize: "0.75rem", color: "#71717a" }}>{r.customerPhone || r.customerNIC || ""}</span>
                                  </div>
                                </td>
                                <td className="cd-cell-muted">
                                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <span style={{ fontSize: "0.78rem" }}>{new Date(r.pickupDate).toLocaleDateString()}</span>
                                    <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>→ {new Date(r.returnDate).toLocaleDateString()}</span>
                                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{r.totalDays} day{r.totalDays > 1 ? "s" : ""}</span>
                                  </div>
                                </td>
                                <td className="cd-cell-price">{formatLKR(r.totalAmount)}</td>
                                <td>
                                  <span className="cd-rental-status-badge" style={{ background: `${statusColors[r.status]}15`, color: statusColors[r.status] }}>
                                    {statusLabels[r.status] || r.status}
                                  </span>
                                </td>
                                <td>
                                  <div className="cd-cell-actions">
                                    {r.status === "active" && (
                                      <>
                                        <button
                                          type="button"
                                          className="cd-action-icon-btn cd-view-btn"
                                          onClick={() => handleCompleteRental(r._id)}
                                          title="Mark as Returned"
                                        >
                                          <CheckCircle size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          className="cd-action-icon-btn cd-delete-btn"
                                          onClick={() => handleCancelRental(r._id)}
                                          title="Cancel Rental"
                                        >
                                          <X size={14} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── INQUIRIES & BIDS TAB ── */}
            {activeTab === "Inquiries & Bids" && (
              <section className="cd-card" style={{ marginTop: 24 }}>
                <div className="cd-card-head">
                  <div>
                    <h2 className="cd-card-title">Customer Inquiries & Price Bids</h2>
                    <p className="cd-card-desc">
                      {bids.length} total inquiries · {bids.filter((b) => b.status === "pending").length} pending offers · {bids.filter((b) => b.status === "accepted").length} accepted
                    </p>
                  </div>
                </div>
                <div className="cd-card-body" style={{ padding: 0 }}>
                  {bids.length === 0 ? (
                    <div className="cd-empty-state">
                      <MessageSquare size={24} style={{ color: "#f97316" }} />
                      <h3>No inquiries or bids yet</h3>
                      <p>When customers send price offers or booking inquiries on your vehicles, they will appear here.</p>
                    </div>
                  ) : (
                    <div className="cd-table-wrap">
                      <table className="cd-table">
                        <thead>
                          <tr>
                            <th>Vehicle</th>
                            <th>Customer</th>
                            <th>Offered Price</th>
                            <th>Customer Message</th>
                            <th>Status</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bids.map((b) => {
                            const veh = b.vehicle;
                            const statusColors = { pending: "#f59e0b", accepted: "#10b981", rejected: "#ef4444" };
                            const statusLabels = { pending: "Pending Offer", accepted: "Accepted", rejected: "Declined" };
                            const renterPhone = b.renter?.phone || "";
                            const waDigits = String(renterPhone).replace(/[^0-9]/g, "").replace(/^0/, "94");
                            const waMsg = encodeURIComponent(
                              `Hello ${b.renter?.name || "Customer"}, regarding your inquiry for ${veh?.brand || "the vehicle"} ${veh?.model || ""} on Yamu Car Rentals...`
                            );
                            const waLink = waDigits ? `https://wa.me/${waDigits}?text=${waMsg}` : null;

                            return (
                              <tr key={b._id}>
                                <td>
                                  <div className="cd-cell-vehicle">
                                    <div>
                                      <span className="cd-vehicle-name">{veh?.brand || "—"} {veh?.model || ""}</span>
                                      <span className="cd-vehicle-year">{veh?.year ? `${veh.year} · ` : ""}{veh?.pricePerDay ? `Listed: ${formatLKR(veh.pricePerDay)}/day` : ""}</span>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    <span style={{ fontWeight: 600, display: "block", color: "#09090b" }}>{b.renter?.name || "Customer"}</span>
                                    <span style={{ fontSize: "0.75rem", color: "#71717a" }}>{b.renter?.phone || b.renter?.email || "No direct phone"}</span>
                                  </div>
                                </td>
                                <td className="cd-cell-price">
                                  <div>
                                    <span style={{ fontWeight: 700, color: "#ea580c" }}>{formatLKR(b.offerPrice)}</span>
                                    <span style={{ fontSize: "0.72rem", color: "#71717a", display: "block" }}>
                                      {new Date(b.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </td>
                                <td className="cd-cell-muted" style={{ maxWidth: 220 }}>
                                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={b.message || ""}>
                                    {b.message || "Direct price inquiry"}
                                  </p>
                                </td>
                                <td>
                                  <span className="cd-rental-status-badge" style={{ background: `${statusColors[b.status || "pending"]}15`, color: statusColors[b.status || "pending"] }}>
                                    {statusLabels[b.status || "pending"] || b.status}
                                  </span>
                                </td>
                                <td>
                                  <div className="cd-cell-actions" style={{ justifyContent: "flex-end", gap: 6 }}>
                                    {waLink && (
                                      <a
                                        href={waLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="cd-action-icon-btn"
                                        style={{ background: "#22c55e", color: "#fff", borderColor: "#22c55e" }}
                                        title="Chat on WhatsApp"
                                      >
                                        <Phone size={13} />
                                      </a>
                                    )}
                                    {b.status !== "accepted" && (
                                      <button
                                        type="button"
                                        className="cd-action-icon-btn cd-view-btn"
                                        onClick={() => handleUpdateBidStatus(b._id, "accepted")}
                                        title="Accept Offer"
                                      >
                                        <CheckCircle size={14} />
                                      </button>
                                    )}
                                    {b.status !== "rejected" && (
                                      <button
                                        type="button"
                                        className="cd-action-icon-btn cd-delete-btn"
                                        onClick={() => handleUpdateBidStatus(b._id, "rejected")}
                                        title="Decline Offer"
                                      >
                                        <X size={14} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            )}

          </main>
        </div>
      </div>

      {/* ── Vehicle Profile / Availability Modal ── */}
      {selectedVehicle && (
        <div className="cd-modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="cd-vehicle-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cd-vehicle-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {selectedVehicle.images && selectedVehicle.images.length > 0 ? (
                  <img
                    src={formatVehicleImageUrl(selectedVehicle.images, selectedVehicle.vehicleType)}
                    alt={selectedVehicle.brand}
                    className="cd-vehicle-thumb"
                    style={{ width: 48, height: 38, borderRadius: 8, objectFit: "cover" }}
                    onError={(e) => handleImageError(e, formatVehicleImageUrl(null, selectedVehicle.vehicleType))}
                  />
                ) : (
                  <div className="cd-vehicle-thumb-placeholder" style={{ width: 48, height: 38, borderRadius: 8 }}>
                    <Car size={18} />
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                    {selectedVehicle.brand} {selectedVehicle.model}
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                    {selectedVehicle.year} · Manage availability & vehicle details
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="cd-btn-text"
                onClick={() => setSelectedVehicle(null)}
                style={{ padding: 6, borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVehicleProfile} className="cd-vehicle-modal-body">
              {/* Availability Section */}
              <div className="cd-modal-section">
                <div className="cd-section-badge-title">
                  <CalendarCheck size={14} /> Rental Availability & Status
                </div>
                <div className="cd-form-row">
                  <div className="cd-form-group">
                    <label>Status</label>
                    <select
                      value={vehicleEditData.status || "active"}
                      onChange={(e) => setVehicleEditData({ ...vehicleEditData, status: e.target.value })}
                    >
                      <option value="active">Active (Available for booking)</option>
                      <option value="hidden">Hidden / Maintenance (Paused)</option>
                      <option value="rented" disabled>🔑 Currently Rented</option>
                    </select>
                  </div>
                  <div className="cd-form-group">
                    <label>Available From</label>
                    <input
                      type="date"
                      required
                      value={vehicleEditData.availableFrom || ""}
                      onChange={(e) => setVehicleEditData({ ...vehicleEditData, availableFrom: e.target.value })}
                    />
                  </div>
                  <div className="cd-form-group">
                    <label>Available To</label>
                    <input
                      type="date"
                      required
                      value={vehicleEditData.availableTo || ""}
                      onChange={(e) => setVehicleEditData({ ...vehicleEditData, availableTo: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="cd-modal-section">
                <div className="cd-section-badge-title">
                  <Wallet size={14} /> Pricing (LKR)
                </div>
                <div className="cd-form-row">
                  <div className="cd-form-group">
                    <label>Daily Rental Rate (LKR / day)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="e.g. 5000"
                      value={vehicleEditData.pricePerDay || ""}
                      onChange={(e) => setVehicleEditData({ ...vehicleEditData, pricePerDay: e.target.value })}
                    />
                  </div>
                  <div className="cd-form-group">
                    <label>Extra Rate / Km (after 100km)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 35"
                      value={vehicleEditData.pricePerKmAfter100km || ""}
                      onChange={(e) => setVehicleEditData({ ...vehicleEditData, pricePerKmAfter100km: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Specifications Section */}
              <div className="cd-modal-section">
                <div className="cd-section-badge-title">
                  <CarFront size={14} /> Vehicle Details
                </div>
                <div className="cd-form-row">
                  <div className="cd-form-group">
                    <label>Brand</label>
                    <input
                      type="text"
                      required
                      value={vehicleEditData.brand || ""}
                      onChange={(e) => setVehicleEditData({ ...vehicleEditData, brand: e.target.value })}
                    />
                  </div>
                  <div className="cd-form-group">
                    <label>Model</label>
                    <input
                      type="text"
                      required
                      value={vehicleEditData.model || ""}
                      onChange={(e) => setVehicleEditData({ ...vehicleEditData, model: e.target.value })}
                    />
                  </div>
                  <div className="cd-form-group">
                    <label>Year</label>
                    <input
                      type="number"
                      required
                      value={vehicleEditData.year || ""}
                      onChange={(e) => setVehicleEditData({ ...vehicleEditData, year: e.target.value })}
                    />
                  </div>
                </div>

                <div className="cd-form-row">
                  <div className="cd-form-group">
                    <label>Vehicle Type</label>
                    <select
                      value={vehicleEditData.vehicleType || "car"}
                      onChange={(e) => setVehicleEditData({ ...vehicleEditData, vehicleType: e.target.value })}
                    >
                      <option value="car">Car (Sedan/Hatchback)</option>
                      <option value="premium-car">Premium / Luxury Car</option>
                      <option value="mini-car">Mini Car</option>
                      <option value="threewheeler">Three-Wheeler (Tuk Tuk)</option>
                      <option value="van">Van</option>
                      <option value="mini-van">Mini Van</option>
                      <option value="bicycle">Bicycle / Motorbike</option>
                      <option value="others">Other Vehicles</option>
                    </select>
                  </div>
                  <div className="cd-form-group">
                    <label>Fuel Type</label>
                    <select
                      value={vehicleEditData.fuelType || ""}
                      onChange={(e) => setVehicleEditData({ ...vehicleEditData, fuelType: e.target.value })}
                    >
                      <option value="">Not set</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                  <div className="cd-form-group">
                    <label>Transmission</label>
                    <select
                      value={vehicleEditData.transmission || ""}
                      onChange={(e) => setVehicleEditData({ ...vehicleEditData, transmission: e.target.value })}
                    >
                      <option value="">Not set</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                </div>

                <div className="cd-form-row">
                  <div className="cd-form-group">
                    <label>How can it be rented?</label>
                    <select
                      value={vehicleEditData.rentMode || "self-drive"}
                      onChange={(e) => setVehicleEditData({ ...vehicleEditData, rentMode: e.target.value })}
                    >
                      <option value="self-drive">Self-drive</option>
                      <option value="with-driver">With driver</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div className="cd-form-group">
                    <label>Seats</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      placeholder="5"
                      value={vehicleEditData.seats ?? ""}
                      onChange={(e) => setVehicleEditData({ ...vehicleEditData, seats: e.target.value })}
                    />
                  </div>
                </div>

                <div className="cd-form-row">
                  <div className="cd-form-group">
                    <label>Free km per day</label>
                    <select
                      value={vehicleEditData.kmPerDay ?? "100"}
                      onChange={(e) => setVehicleEditData({ ...vehicleEditData, kmPerDay: e.target.value })}
                    >
                      <option value="100">100 km/day</option>
                      <option value="150">150 km/day</option>
                      <option value="200">200 km/day</option>
                      <option value="0">Unlimited</option>
                    </select>
                  </div>
                  <div className="cd-form-group">
                    <label>Minimum rental</label>
                    <select
                      value={vehicleEditData.minRentalDays ?? "1"}
                      onChange={(e) => setVehicleEditData({ ...vehicleEditData, minRentalDays: e.target.value })}
                    >
                      {[1, 2, 3, 5, 7, 14, 30].map((d) => (
                        <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="cd-form-group">
                  <label>Pickup Location / City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 41 Edward Ln, Colombo 00300"
                    value={vehicleEditData.location || ""}
                    onChange={(e) => setVehicleEditData({ ...vehicleEditData, location: e.target.value })}
                  />
                </div>

                <div className="cd-form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={vehicleEditData.description || ""}
                    onChange={(e) => setVehicleEditData({ ...vehicleEditData, description: e.target.value })}
                    placeholder="Describe condition, features, AC, etc."
                  />
                </div>
              </div>

              <div className="cd-vehicle-modal-footer">
                <Link
                  to={`/vehicle/${selectedVehicle._id}`}
                  target="_blank"
                  className="cd-btn-outline"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <ExternalLink size={14} /> Public View
                </Link>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="cd-btn-text"
                    onClick={() => setSelectedVehicle(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cd-btn-primary-sm"
                    disabled={savingVehicle}
                    style={{ padding: "8px 20px" }}
                  >
                    {savingVehicle ? "Saving..." : "Save Vehicle Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="cd-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cd-modal-icon"><Trash2 size={24} /></div>
            <h3>Delete Vehicle?</h3>
            <p>Permanently delete this vehicle from the marketplace?</p>
            <div className="cd-modal-actions">
              <button className="cd-btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="cd-btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mark as Rented Modal (Quick Recording) ── */}
      {rentalModal && (
        <div className="cd-modal-overlay" onClick={() => setRentalModal(null)}>
          <div className="cd-vehicle-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="cd-vehicle-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="cd-rental-modal-icon">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                    Mark as Rented
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                    {rentalModal.brand} {rentalModal.model} ({rentalModal.year}) · Vehicle will be hidden from listings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRentalModal(null)}
                style={{ padding: 6, borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRental} className="cd-vehicle-modal-body">
              {/* Quick Rental Period — the only required section */}
              <div className="cd-modal-section">
                <div className="cd-section-badge-title">
                  <Clock size={14} /> Rental Period
                </div>
                <div className="cd-form-row">
                  <div className="cd-form-group">
                    <label>Pickup Date</label>
                    <input
                      type="date"
                      required
                      value={rentalForm.pickupDate}
                      onChange={(e) => setRentalForm({ ...rentalForm, pickupDate: e.target.value })}
                    />
                  </div>
                  <div className="cd-form-group">
                    <label>Return Date</label>
                    <input
                      type="date"
                      required
                      value={rentalForm.returnDate}
                      onChange={(e) => setRentalForm({ ...rentalForm, returnDate: e.target.value })}
                    />
                  </div>
                </div>
                {rentalForm.pickupDate && rentalForm.returnDate && (() => {
                  const days = Math.max(1, Math.ceil((new Date(rentalForm.returnDate) - new Date(rentalForm.pickupDate)) / (1000 * 60 * 60 * 24)));
                  const total = days * Number(rentalForm.dailyRate || 0);
                  return (
                    <div className="cd-quick-summary">
                      <span>📅 {days} day{days > 1 ? "s" : ""}</span>
                      <span>💰 {formatLKR(Number(rentalForm.dailyRate || 0))}/day</span>
                      {total > 0 && <span style={{ color: "#ea580c", fontWeight: 700 }}>Total: {formatLKR(total)}</span>}
                    </div>
                  );
                })()}
                <p style={{ fontSize: "0.72rem", color: "#94a3b8", margin: "4px 0 0" }}>
                  ⏰ Vehicle auto-returns to listings when return date passes
                </p>
              </div>

              {/* Rate — pre-filled from vehicle */}
              <div className="cd-form-row">
                <div className="cd-form-group">
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}>Daily Rate (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Auto-filled from vehicle"
                    value={rentalForm.dailyRate}
                    onChange={(e) => setRentalForm({ ...rentalForm, dailyRate: e.target.value })}
                    style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: "0.88rem", color: "#0f172a", background: "#fff", width: "100%", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>
                <div className="cd-form-group">
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}>Customer Name</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={rentalForm.customerName}
                    onChange={(e) => setRentalForm({ ...rentalForm, customerName: e.target.value })}
                    style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: "0.88rem", color: "#0f172a", background: "#fff", width: "100%", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>
              </div>

              {/* Collapsible extra details */}
              <button
                type="button"
                onClick={() => setShowRentalDetails(!showRentalDetails)}
                style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
              >
                <ChevronRight size={14} style={{ transform: showRentalDetails ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                {showRentalDetails ? "Hide" : "More"} details (optional)
              </button>

              {showRentalDetails && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "cd-fadeIn 0.2s" }}>
                  <div className="cd-form-row">
                    <div className="cd-form-group">
                      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}>Phone</label>
                      <input
                        type="text"
                        placeholder="Customer phone"
                        value={rentalForm.customerPhone}
                        onChange={(e) => setRentalForm({ ...rentalForm, customerPhone: e.target.value })}
                        style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: "0.88rem", color: "#0f172a", background: "#fff", width: "100%", boxSizing: "border-box", fontFamily: "inherit" }}
                      />
                    </div>
                    <div className="cd-form-group">
                      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}>NIC / Passport</label>
                      <input
                        type="text"
                        placeholder="ID number"
                        value={rentalForm.customerNIC}
                        onChange={(e) => setRentalForm({ ...rentalForm, customerNIC: e.target.value })}
                        style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: "0.88rem", color: "#0f172a", background: "#fff", width: "100%", boxSizing: "border-box", fontFamily: "inherit" }}
                      />
                    </div>
                  </div>
                  <div className="cd-form-group">
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}>Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Any special notes..."
                      value={rentalForm.notes}
                      style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: "0.88rem", color: "#0f172a", background: "#fff", width: "100%", boxSizing: "border-box", fontFamily: "inherit" }}
                      onChange={(e) => setRentalForm({ ...rentalForm, notes: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="cd-vehicle-modal-footer" style={{ padding: "14px 0 0", borderTop: "1px solid #e2e8f0", margin: "0 -24px", paddingLeft: 24, paddingRight: 24 }}>
                <div />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="cd-btn-text"
                    onClick={() => setRentalModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cd-btn-primary-sm cd-btn-rent-confirm"
                    disabled={savingRental}
                    style={{ padding: "8px 20px" }}
                  >
                    {savingRental ? "Recording..." : "🔑 Confirm Rental"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{dashboardCSS}</style>
    </>
  );
}

function StatCard({ icon: Icon, label, value, delta, deltaColor }) {
  return (
    <div className="cd-stat-card">
      <div className="cd-stat-top">
        <span className="cd-stat-icon"><Icon size={20} /></span>
        <p className="cd-stat-label">{label}</p>
      </div>
      <p className="cd-stat-value">{value}</p>
      <p className="cd-stat-delta" style={{ color: deltaColor }}>{delta}</p>
    </div>
  );
}

/* ── Loading/Error CSS ── */
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
  .cd-wrapper {
    min-height: 100vh;
    background: var(--bg);
    font-family: var(--font-body, "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif);
    color: #09090b;
  }
  .cd-layout { display: flex; max-width: 1500px; margin: 0 auto; }

  /* ── Sidebar ── */
  .cd-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .cd-fleet-search {
    display: flex; align-items: center; gap: 8px; margin: 12px 0 4px; padding: 0 12px;
    border: 1.5px solid #e2e8f0; border-radius: 12px; color: #94a3b8; background: #fff;
  }
  .cd-fleet-search input { flex: 1; border: none; outline: none; padding: 10px 0; font: inherit; font-size: 15px; background: transparent; }
  .cd-fleet-list { display: flex; flex-direction: column; margin-top: 8px; }
  .cd-fleet-row {
    display: grid; grid-template-columns: 64px minmax(0, 1fr) 190px 112px auto;
    align-items: center; gap: 14px; padding: 12px 4px; border-top: 1px solid #f1f5f9;
  }
  .cd-fleet-photo { position: relative; width: 64px; height: 48px; cursor: pointer; display: block; }
  .cd-fleet-photo img { width: 64px; height: 48px; border-radius: 10px; object-fit: cover; background: #f1f5f9; }
  .cd-fleet-photo-badge {
    position: absolute; right: -6px; bottom: -6px; width: 24px; height: 24px; border-radius: 50%;
    display: grid; place-items: center; background: #fff; color: #475569; border: 1px solid #e2e8f0;
  }
  .cd-fleet-photo-missing { background: #f97316; color: #fff; border-color: #f97316; }
  .cd-fleet-info { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; background: none; border: none; padding: 0; text-align: left; cursor: pointer; font: inherit; }
  .cd-fleet-info .cd-vehicle-name, .cd-fleet-info .cd-vehicle-year { max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cd-fleet-nophoto { color: #ea580c; font-weight: 600; }
  .cd-fleet-price {
    display: flex; align-items: center; gap: 6px; padding: 0 10px; height: 40px;
    border: 1.5px solid #e2e8f0; border-radius: 10px; background: #fff; color: #94a3b8; font-size: 0.8rem; font-weight: 600;
  }
  .cd-fleet-price:focus-within { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.12); }
  .cd-fleet-price input {
    flex: 1; min-width: 0; width: 100%; border: none; outline: none; background: transparent;
    font: inherit; font-size: 15px; font-weight: 700; color: #ea580c;
  }
  .cd-fleet-toggle {
    display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 12px 0 4px;
    border-radius: 999px; border: 1px solid #e2e8f0; background: #f1f5f9; color: #475569;
    font: inherit; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;
  }
  .cd-fleet-knob { width: 26px; height: 26px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  .cd-fleet-toggle.on { background: #dcfce7; border-color: #86efac; color: #15803d; flex-direction: row-reverse; padding: 0 4px 0 12px; }
  .cd-fleet-toggle.on .cd-fleet-knob { background: #16a34a; }
  .cd-fleet-status { justify-self: start; padding: 6px 12px; border-radius: 999px; font-size: 0.78rem; font-weight: 700; }
  .cd-fleet-rented { background: #fff7ed; color: #c2410c; }
  .cd-fleet-flagged { background: #fee2e2; color: #b91c1c; }
  .cd-spin { animation: cd-spin 0.8s linear infinite; }
  @keyframes cd-spin { to { transform: rotate(360deg); } }
  @media (max-width: 760px) {
    .cd-fleet-row {
      grid-template-columns: 64px minmax(0, 1fr);
      grid-template-areas: "photo info" "price price" "status actions";
      row-gap: 10px; padding: 14px 2px;
    }
    .cd-fleet-photo { grid-area: photo; }
    .cd-fleet-info { grid-area: info; }
    .cd-fleet-price { grid-area: price; }
    .cd-fleet-toggle, .cd-fleet-status { grid-area: status; justify-self: start; }
    .cd-fleet-row .cd-cell-actions { grid-area: actions; justify-content: flex-end; }
    .cd-action-icon-btn { width: 40px; height: 40px; }
  }
  .cd-header-btn { padding: 8px 14px !important; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
  .cd-btn-logout { color: #EF4444 !important; border-color: rgba(239,68,68,0.3) !important; }
  .cd-mobile-tabs { display: none; }
  .cd-mobile-tab {
    flex: 1 0 auto; white-space: nowrap; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px 8px; border: none; border-radius: 999px; background: transparent;
    color: #71717a; font-weight: 700; font-size: 0.85rem; cursor: pointer; font-family: inherit;
  }
  .cd-mobile-tab-active { background: var(--grad-primary); color: #fff; }
  .cd-alert {
    display: flex; align-items: center; gap: 14px; margin-top: 20px; padding: 14px 18px;
    background: #fff7ed; border: 1px solid #fed7aa; border-radius: 16px; color: #9a3412;
  }
  .cd-alert > div { flex: 1; min-width: 0; }
  .cd-alert strong { display: block; font-size: 0.9rem; }
  .cd-alert p { margin: 2px 0 0; font-size: 0.8rem; color: #9a3412; }
  #cd-profile { scroll-margin-top: 16px; }
  @media (max-width: 1024px) {
    .cd-mobile-tabs {
      display: flex; gap: 4px; margin-top: 16px; padding: 4px; background: #fff;
      overflow-x: auto; scrollbar-width: none; max-width: 100%;
      border: 1px solid rgba(228,228,231,0.8); border-radius: 999px;
      position: sticky; top: 8px; z-index: 20; box-shadow: 0 4px 14px rgba(0,0,0,0.05);
    }
  }
  @media (max-width: 640px) {
    .cd-header-actions { width: 100%; }
    .cd-header-btn { flex: 1 1 auto; justify-content: center; }
    .cd-alert { flex-wrap: wrap; }
  }

  .cd-sidebar {
    position: sticky; top: 0; width: 250px; flex-shrink: 0;
    height: 100vh; overflow-y: auto; padding: 24px 20px;
    border-right: 1px solid rgba(228,228,231,0.6); background: #fff;
    display: flex; flex-direction: column;
  }
  .cd-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; }
  .cd-logo-img { width: 36px; height: 36px; object-fit: contain; flex-shrink: 0; }
  .cd-logo-text { white-space: nowrap; font-size: 1rem !important; }
  .cd-logo-icon {
    width: 36px; height: 36px; display: grid; place-items: center;
    border-radius: 12px; background: #ea580c; color: #fff;
  }
  .cd-logo-text { font-size: 1.125rem; font-weight: 800; font-family: var(--font-display, 'Poppins', sans-serif); }
  .cd-logo-accent { color: #f97316; }

  .cd-nav { margin-top: 32px; display: flex; flex-direction: column; gap: 4px; }
  .cd-nav-item {
    display: flex; align-items: center; gap: 12px; padding: 10px 16px;
    border-radius: 100px; border: none; background: transparent; color: #71717a;
    font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    text-align: left; font-family: inherit; text-decoration: none;
  }
  .cd-nav-item:hover { background: #f4f4f5; color: #18181b; }
  .cd-nav-active { background: var(--grad-primary) !important; color: #fff !important; box-shadow: 0 6px 16px -6px rgba(249,115,22,0.6); }
  .cd-nav-divider { height: 1px; background: rgba(226,232,240,0.6); margin: 12px 8px; }
  .cd-nav-logout { color: #ef4444 !important; }
  .cd-nav-logout:hover { background: #fef2f2 !important; }

  .cd-sidebar-card {
    margin-top: 32px; border: 1px solid rgba(228,228,231,0.6);
    border-radius: 24px; background: #fff; padding: 16px;
  }
  .cd-sidebar-card-name { font-size: 0.875rem; font-weight: 700; color: #09090b; margin: 0; }
  .cd-sidebar-card-sub { font-size: 0.75rem; color: #71717a; margin: 4px 0 0; display: flex; align-items: center; gap: 4px; }
  .cd-add-vehicle-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    margin-top: 12px; padding: 8px 12px; border-radius: 100px;
    background: #f97316; color: #fff; font-size: 0.75rem; font-weight: 700;
    text-decoration: none; transition: background 0.2s; border: none; cursor: pointer;
  }
  .cd-add-vehicle-btn:hover { background: #ea580c; }

  /* ── Main ── */
  .cd-main { flex: 1; min-width: 0; padding: 24px 24px 40px; }
  .cd-header { display: flex; align-items: center; justify-content: space-between; }
  .cd-title {
    font-size: 1.75rem; font-weight: 800; letter-spacing: -0.5px;
    color: #09090b; margin: 0; font-family: var(--font-display, 'Poppins', sans-serif);
  }
  .cd-subtitle { font-size: 0.875rem; color: #71717a; margin: 4px 0 0; }

  /* ── Stats ── */
  .cd-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 24px; }
  .cd-stat-card {
    background: #fff; border: 1px solid rgba(228,228,231,0.6);
    border-radius: 24px; padding: 20px; transition: all 0.2s;
  }
  .cd-stat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
  .cd-stat-top { display: flex; align-items: center; gap: 12px; }
  .cd-stat-icon {
    width: 40px; height: 40px; display: grid; place-items: center;
    border-radius: 16px; background: #fff7ed; color: #ea580c; flex-shrink: 0;
  }
  .cd-stat-label { font-size: 0.75rem; color: #71717a; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cd-stat-value { font-size: 1.25rem; font-weight: 800; margin: 12px 0 0; color: #09090b; font-family: var(--font-display, 'Poppins', sans-serif); }
  .cd-stat-delta { font-size: 0.75rem; font-weight: 600; margin: 2px 0 0; }

  /* ── Mid row ── */
  .cd-mid-row { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-top: 24px; }
  .cd-card { background: #fff; border: 1px solid rgba(228,228,231,0.6); border-radius: 24px; padding: 20px; }
  .cd-card-head { display: flex; align-items: center; justify-content: space-between; }
  .cd-card-title { font-size: 1rem; font-weight: 700; color: #09090b; margin: 0; font-family: var(--font-display, 'Poppins', sans-serif); }
  .cd-card-desc { font-size: 0.8rem; color: #71717a; margin: 2px 0 0; }
  .cd-card-body { padding: 16px 20px; }
  .cd-monthly-badge {
    display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px;
    border-radius: 100px; background: rgba(16,185,129,0.15); color: #10b981;
    font-size: 0.75rem; font-weight: 600;
  }
  .cd-chart-wrap { width: 100%; height: 256px; margin-top: 16px; }

  /* ── Quick actions ── */
  .cd-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
  .cd-action-btn {
    display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
    padding: 16px; border-radius: 16px; border: 1px solid rgba(228,228,231,0.6);
    background: #fafafa; cursor: pointer; transition: all 0.2s; font-family: inherit;
    text-decoration: none; color: inherit;
  }
  .cd-action-btn:hover { border-color: rgba(249,115,22,0.3); box-shadow: 0 6px 16px rgba(0,0,0,0.04); transform: translateY(-1px); }
  .cd-action-icon { color: #ea580c; }
  .cd-action-label { font-size: 0.75rem; font-weight: 700; color: #09090b; }

  .cd-payment-title { font-size: 0.875rem; font-weight: 700; margin: 24px 0 0; color: #09090b; }
  .cd-payment-list { list-style: none; padding: 0; margin: 12px 0 0; display: flex; flex-direction: column; gap: 8px; }
  .cd-payment-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 16px; }
  .cd-payment-label { color: #71717a; font-size: 0.875rem; }
  .cd-payment-value { font-weight: 700; font-size: 0.875rem; }

  /* ── Profile card ── */
  .cd-profile-card { margin-top: 24px; }
  .cd-edit-actions { display: flex; gap: 8px; }
  .cd-btn-outline {
    background: #fff; color: #09090b; border: 1px solid #e2e8f0; padding: 6px 12px;
    border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;
  }
  .cd-btn-outline:hover { border-color: #f97316; color: #f97316; }
  .cd-btn-primary-sm {
    background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
    color: #fff; border: none; padding: 6px 12px; border-radius: 8px;
    font-weight: 700; font-size: 0.8rem; cursor: pointer;
    display: inline-flex; align-items: center; gap: 4px;
    box-shadow: 0 2px 8px rgba(249,115,22,0.3); transition: all 0.2s;
  }
  .cd-btn-primary-sm:hover { transform: translateY(-1px); }
  .cd-btn-text {
    background: transparent; color: #64748b; border: none; padding: 6px 12px;
    font-weight: 700; font-size: 0.8rem; cursor: pointer;
  }
  .cd-btn-danger {
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    color: #fff; border: none; padding: 8px 20px; border-radius: 10px;
    font-weight: 700; font-size: 0.85rem; cursor: pointer;
    box-shadow: 0 2px 8px rgba(239,68,68,0.3);
  }

  .cd-edit-form { display: flex; flex-direction: column; gap: 16px; }
  .cd-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .cd-form-group { display: flex; flex-direction: column; gap: 6px; }
  .cd-form-group label { font-size: 0.75rem; font-weight: 800; color: #334155; }
  .cd-form-group input, .cd-form-group textarea {
    padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px;
    font-family: inherit; font-size: 0.9rem; color: #09090b; transition: all 0.2s;
    outline: none; width: 100%; box-sizing: border-box;
  }
  .cd-form-group input:focus, .cd-form-group textarea:focus {
    border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
  }

  .cd-info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
  .cd-info-item {
    display: flex; gap: 12px; align-items: center; padding: 12px;
    border-radius: 12px; background: #fafafa; border: 1px solid transparent; transition: all 0.2s;
  }
  .cd-info-item:hover { background: #fff7ed; border-color: rgba(249,115,22,0.1); transform: translateY(-1px); }
  .cd-info-full { grid-column: 1 / -1; align-items: flex-start; }
  .cd-info-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, #F97316, #EA580C); color: #fff;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .cd-info-label { font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; }
  .cd-info-value { font-size: 0.9rem; font-weight: 700; color: #09090b; display: block; }
  .cd-info-desc { margin: 4px 0 0; color: #334155; line-height: 1.5; font-size: 0.85rem; }

  /* ── Fleet card ── */
  .cd-fleet-card { margin-top: 24px; }
  .cd-empty-state { text-align: center; padding: 40px 20px; }
  .cd-empty-state h3 { margin: 8px 0 4px; font-size: 1rem; }
  .cd-empty-state p { color: #71717a; font-size: 0.875rem; margin: 0; }

  .cd-table-wrap { overflow-x: auto; }
  .cd-table { width: 100%; min-width: 640px; border-collapse: collapse; font-size: 0.875rem; }
  .cd-table th {
    text-align: left; padding: 12px 20px; font-size: 0.75rem; font-weight: 800;
    color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;
    background: #f8fafc; border-bottom: 1px solid #e2e8f0;
  }
  .cd-table td { padding: 14px 20px; vertical-align: middle; border-bottom: 1px solid #f1f5f9; }
  .cd-table tbody tr:hover td { background: rgba(249,115,22,0.03); }
  .cd-cell-vehicle { display: flex; align-items: center; gap: 10px; }
  .cd-vehicle-thumb { width: 48px; height: 36px; border-radius: 8px; object-fit: cover; }
  .cd-vehicle-thumb-placeholder {
    width: 48px; height: 36px; border-radius: 8px; background: #f1f5f9;
    display: flex; align-items: center; justify-content: center; color: #94a3b8;
  }
  .cd-vehicle-name { font-weight: 600; color: #09090b; display: block; }
  .cd-vehicle-year { font-size: 0.75rem; color: #94a3b8; }
  .cd-cell-muted { color: #71717a; }
  .cd-cell-price { font-weight: 600; color: #ea580c; }
  .cd-cell-actions { display: flex; gap: 8px; justify-content: flex-end; }
  .cd-action-icon-btn {
    width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; background: #fff;
  }
  .cd-view-btn { color: #ea580c; }
  .cd-view-btn:hover { background: #fff7ed; border-color: #ea580c; }
  .cd-rent-btn { color: #f97316; }
  .cd-rent-btn:hover { background: #fff7ed; border-color: #f97316; }
  .cd-delete-btn { color: #ef4444; }
  .cd-delete-btn:hover { background: #fee2e2; border-color: #ef4444; }

  .cd-rental-modal-icon {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, #F97316, #EA580C); color: #fff;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .cd-btn-rent-confirm {
    background: linear-gradient(135deg, #F97316 0%, #EA580C 100%) !important;
  }
  .cd-rental-status-badge {
    display: inline-block; padding: 3px 10px; border-radius: 100px;
    font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;
  }
  .cd-fleet-pending {
    background: #fef3c7 !important; color: #b45309 !important; border: 1px solid #fde68a;
    padding: 4px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 700;
  }
  .cd-fleet-rejected {
    background: #fee2e2 !important; color: #dc2626 !important; border: 1px solid #fecaca;
    padding: 4px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 700;
  }
  .cd-fleet-rented {
    background: #e0f2fe !important; color: #0369a1 !important; border: 1px solid #bae6fd;
    padding: 4px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 700;
  }
  .cd-fleet-flagged {
    background: #ffedd5 !important; color: #c2410c !important; border: 1px solid #fed7aa;
    padding: 4px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 700;
  }
  .cd-quick-summary {
    display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
    font-size: 0.78rem; font-weight: 600; color: #334155;
    padding: 6px 10px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;
  }
  /* ── Vehicle Profile Modal ── */
  .cd-vehicle-modal {
    background: #fff; border-radius: 20px;
    max-width: 620px; width: 92%; max-height: 88vh;
    display: flex; flex-direction: column; overflow: hidden;
    animation: cd-zoomIn 0.25s; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
  .cd-vehicle-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid #e2e8f0; background: #fafafa;
  }
  .cd-vehicle-modal-body {
    padding: 20px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 18px;
  }
  .cd-modal-section {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px;
    display: flex; flex-direction: column; gap: 12px;
  }
  .cd-section-badge-title {
    display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem;
    font-weight: 700; color: #ea580c; text-transform: uppercase; letter-spacing: 0.03em;
  }
  .cd-modal-section .cd-form-group {
    display: flex; flex-direction: column; gap: 4px;
  }
  .cd-modal-section label {
    font-size: 0.78rem; font-weight: 600; color: #475569;
  }
  .cd-modal-section input, .cd-modal-section select, .cd-modal-section textarea {
    padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px;
    font-size: 0.88rem; color: #0f172a; background: #fff; width: 100%; box-sizing: border-box;
    font-family: inherit;
  }
  .cd-modal-section input:focus, .cd-modal-section select:focus, .cd-modal-section textarea:focus {
    outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
  }
  .cd-vehicle-modal-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 24px; border-top: 1px solid #e2e8f0; background: #fafafa;
  }

  /* ── Modal ── */
  .cd-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center; z-index: 1000;
    animation: cd-fadeIn 0.2s;
  }
  .cd-modal {
    background: #fff; border-radius: 24px; padding: 32px; text-align: center;
    max-width: 400px; width: 90%; animation: cd-zoomIn 0.25s;
  }
  .cd-modal-icon {
    width: 56px; height: 56px; border-radius: 16px; background: #fee2e2; color: #ef4444;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
  }
  .cd-modal h3 { margin: 0 0 8px; font-size: 1.125rem; }
  .cd-modal p { color: #71717a; font-size: 0.875rem; margin: 0 0 20px; }
  .cd-modal-actions { display: flex; gap: 12px; justify-content: center; }

  @keyframes cd-fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes cd-zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .cd-sidebar { display: none; }
    .cd-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .cd-mid-row { grid-template-columns: 1fr; }
    .cd-main { padding: 20px 16px 40px; }
    .cd-title { font-size: 1.4rem; }
    .cd-header { flex-wrap: wrap; gap: 12px; }
    .cd-info-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
  }
  @media (max-width: 768px) {
    .cd-main { padding: 16px 12px 40px; }
    .cd-title { font-size: 1.25rem; }
    .cd-subtitle { font-size: 0.8rem; }
    .cd-stats-grid { gap: 10px; }
    .cd-stat-card { padding: 16px; border-radius: 18px; }
    .cd-stat-value { font-size: 1.1rem; }
    .cd-stat-icon { width: 34px; height: 34px; border-radius: 12px; }
    .cd-chart-wrap { height: 200px; }
    .cd-card { border-radius: 18px; padding: 16px; }
    .cd-card-body { padding: 12px 14px; }
    .cd-card-head { flex-wrap: wrap; gap: 8px; }
    .cd-info-grid { grid-template-columns: 1fr; }
    .cd-form-row { grid-template-columns: 1fr; }
    .cd-payment-row { padding: 8px 10px; }
    .cd-payment-label { font-size: 0.8rem; }
    .cd-payment-value { font-size: 0.8rem; }
    .cd-action-btn { padding: 12px; border-radius: 12px; }
    .cd-modal { padding: 24px 20px; border-radius: 18px; }
  }
  @media (max-width: 640px) {
    .cd-main { padding: 12px 10px 80px; }
    .cd-title { font-size: 1.15rem; }
    .cd-stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
    .cd-stat-card { padding: 12px; border-radius: 14px; }
    .cd-stat-top { gap: 8px; }
    .cd-stat-icon { width: 30px; height: 30px; border-radius: 10px; }
    .cd-stat-label { font-size: 0.65rem; }
    .cd-stat-value { font-size: 0.95rem; margin: 8px 0 0; }
    .cd-stat-delta { font-size: 0.65rem; }
    .cd-chart-wrap { height: 170px; }
    .cd-card { padding: 12px; border-radius: 14px; }
    .cd-card-body { padding: 10px; }
    .cd-card-title { font-size: 0.9rem; }
    .cd-card-desc { font-size: 0.7rem; }
    .cd-actions-grid { gap: 8px; }
    .cd-action-btn { padding: 10px; gap: 6px; }
    .cd-action-label { font-size: 0.7rem; }
    .cd-action-icon { width: 16px; height: 16px; }
    .cd-header { flex-direction: column; align-items: flex-start; gap: 8px; }
    .cd-btn-outline { padding: 5px 10px; font-size: 0.75rem; }
    .cd-btn-primary-sm { padding: 5px 10px; font-size: 0.75rem; }
    .cd-table { min-width: 500px; font-size: 0.8rem; }
    .cd-table th { padding: 10px 12px; font-size: 0.65rem; }
    .cd-table td { padding: 10px 12px; }
    .cd-vehicle-thumb { width: 40px; height: 30px; border-radius: 6px; }
    .cd-vehicle-thumb-placeholder { width: 40px; height: 30px; }
    .cd-vehicle-name { font-size: 0.8rem; }
    .cd-vehicle-year { font-size: 0.65rem; }
    .cd-empty-state { padding: 24px 12px; }
    .cd-info-item { padding: 10px; }
    .cd-info-icon { width: 30px; height: 30px; border-radius: 8px; }
    .cd-info-label { font-size: 0.6rem; }
    .cd-info-value { font-size: 0.8rem; }
    .cd-edit-actions { flex-wrap: wrap; }
    .cd-modal { padding: 20px 16px; border-radius: 16px; }
    .cd-modal h3 { font-size: 1rem; }
    .cd-modal p { font-size: 0.8rem; }
    .cd-modal-actions { flex-wrap: wrap; }
    .cd-btn-danger { padding: 7px 16px; font-size: 0.8rem; }
    .cd-profile-card { margin-top: 16px; }
    .cd-fleet-card { margin-top: 16px; }
    .cd-mid-row { gap: 14px; margin-top: 16px; }
    .cd-payment-title { margin-top: 16px; font-size: 0.8rem; }
  }
  @media (max-width: 400px) {
    .cd-stats-grid { grid-template-columns: 1fr; }
    .cd-actions-grid { grid-template-columns: 1fr; }
    .cd-table { min-width: 420px; }
  }
`;
