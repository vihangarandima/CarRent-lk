import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import {
  Building2,
  Car,
  Edit3,
  Trash2,
  Plus,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Activity,
  CheckCircle,
  TrendingUp,
  LogOut
} from "lucide-react";

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [company, setCompany] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!token || !user || user.role !== "company") {
      navigate("/login");
      return;
    }
    const fetchData = async () => {
      try {
        const [companyRes, vehiclesRes] = await Promise.all([
          axios.get(`${API_URL}/api/companies/me`, {
            headers: { "x-auth-token": token },
          }),
          axios.get(`${API_URL}/api/vehicles/my`, {
            headers: { "x-auth-token": token },
          }),
        ]);
        setCompany(companyRes.data);
        setEditData(companyRes.data);
        setVehicles(vehiclesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, token, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(
        `${API_URL}/api/companies/me`,
        editData,
        {
          headers: { "x-auth-token": token },
        },
      );
      setCompany(res.data);
      setEditMode(false);
    } catch (err) {
      alert("Failed to save profile. Please try again.");
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
    } catch (err) {
      alert("Failed to delete vehicle.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading)
    return (
      <div className="premium-dash-loading">
        <div className="premium-spinner" />
        <p>Loading your interactive workspace...</p>
      </div>
    );

  if (!company)
    return (
      <div className="premium-dash-error">
        <div className="error-icon-wrap">
          <Building2 size={40} />
        </div>
        <h2>Profile Not Found</h2>
        <p>We couldn't load your company profile. It may not exist yet.</p>
        <Link to="/register?role=company" className="btn-primary-solid">
          Register Company
        </Link>
      </div>
    );

  return (
    <div className="premium-dash-wrapper">
      <div className="premium-dash-container">
        {/* Sidebar */}
        <aside className="premium-sidebar">
          <div className="sidebar-header">
            <div className="company-logo-container">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.companyName}
                  className="company-logo"
                />
              ) : (
                <div className="company-logo-placeholder">
                  <Building2 size={28} />
                </div>
              )}
            </div>
            <div className="company-info">
              <h3 className="company-name">{company.companyName}</h3>
              <span className="verified-badge">
                <CheckCircle size={10} />
                Verified
              </span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-title">MAIN MENU</div>
            <div className="nav-item active">
              <div className="nav-icon-box"><Building2 size={16} /></div>
              <span>Dashboard</span>
            </div>
            <Link to="/list-my-car" className="nav-item">
              <div className="nav-icon-box"><Plus size={16} /></div>
              <span>Add Vehicle</span>
            </Link>
            
            <div className="nav-divider"></div>
            <div className="nav-section-title">EXTERNAL</div>
            
            <Link
              to={`/companies/${company._id}`}
              className="nav-item external-link"
              target="_blank"
            >
              <div className="nav-icon-box"><ExternalLink size={16} /></div>
              <span>View Public Page</span>
            </Link>

            <div className="nav-divider"></div>
            <button
              onClick={handleLogout}
              className="nav-item logout-btn"
            >
              <div className="nav-icon-box"><LogOut size={16} /></div>
              <span>Log Out</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="premium-main-content">
          <header className="dash-top-header">
            <div>
              <h1 className="page-title">
                Welcome back, <span className="text-orange">{company.companyName}</span>!
              </h1>
              <p className="page-subtitle">Here is what's happening with your fleet today.</p>
            </div>
          </header>

          {/* Quick Stats Grid */}
          <div className="quick-stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper orange-glow">
                <Car size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Active Vehicles</p>
                <h3 className="stat-value">{vehicles.length}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper green-glow">
                <Activity size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Profile Status</p>
                <h3 className="stat-value text-green">100%</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper blue-glow">
                <TrendingUp size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Views</p>
                <h3 className="stat-value">Soon</h3>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Profile Section */}
            <section className="dash-card profile-card interactive-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Company Information</h2>
                  <p className="card-description">Manage your public contact details.</p>
                </div>
                {!editMode ? (
                  <button className="btn-outline-small" onClick={() => setEditMode(true)}>
                    <Edit3 size={12} /> Edit
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button
                      className="btn-text-small"
                      onClick={() => {
                        setEditMode(false);
                        setEditData(company);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-primary-small glowing-btn"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>

              <div className="card-body">
                {editMode ? (
                  <div className="edit-form fade-in">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Company Name</label>
                        <input
                          type="text"
                          value={editData.companyName || ""}
                          onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="text"
                          value={editData.phone || ""}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Contact Email</label>
                        <input
                          type="email"
                          value={editData.contactEmail || ""}
                          onChange={(e) => setEditData({ ...editData, contactEmail: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Address</label>
                        <input
                          type="text"
                          value={editData.address || ""}
                          onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Logo URL</label>
                      <input
                        type="text"
                        value={editData.logo || ""}
                        onChange={(e) => setEditData({ ...editData, logo: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        rows={3}
                        value={editData.description || ""}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        placeholder="Describe your services..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="info-grid fade-in">
                    <div className="info-item hover-up">
                      <div className="info-icon"><MapPin size={16} /></div>
                      <div className="info-content">
                        <span className="info-label">Address</span>
                        <span className="info-value">{company.address || "Not specified"}</span>
                      </div>
                    </div>
                    <div className="info-item hover-up">
                      <div className="info-icon"><Phone size={16} /></div>
                      <div className="info-content">
                        <span className="info-label">Phone</span>
                        <span className="info-value">{company.phone || "Not specified"}</span>
                      </div>
                    </div>
                    <div className="info-item hover-up">
                      <div className="info-icon"><Mail size={16} /></div>
                      <div className="info-content">
                        <span className="info-label">Email</span>
                        <span className="info-value">{company.contactEmail || "Not specified"}</span>
                      </div>
                    </div>
                    {company.description && (
                      <div className="info-item full-width mt-2 hover-up">
                        <div className="info-content">
                          <span className="info-label">About Company</span>
                          <p className="info-description">{company.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Fleet Section */}
            <section className="dash-card fleet-card interactive-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Vehicle Fleet</h2>
                  <p className="card-description">You have {vehicles.length} vehicles active.</p>
                </div>
                <Link to="/list-my-car" className="btn-primary-small glowing-btn">
                  <Plus size={12} /> Add
                </Link>
              </div>

              <div className="card-body p-0">
                {vehicles.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon pulse-animation">
                      <Car size={24} />
                    </div>
                    <h3>Your fleet is empty</h3>
                    <p>Start building your presence.</p>
                    <Link to="/list-my-car" className="btn-primary-solid glowing-btn mt-2">
                      Add Vehicle
                    </Link>
                  </div>
                ) : (
                  <div className="premium-table-container">
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Vehicle Details</th>
                          <th>Location</th>
                          <th>Rate / Day</th>
                          <th className="text-right">Manage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map((v) => (
                          <tr key={v._id} className="interactive-row">
                            <td>
                              <div className="table-cell-vehicle">
                                <div className="vehicle-img-wrap">
                                  {v.images && v.images[0] ? (
                                    <img src={v.images[0]} alt={v.brand} />
                                  ) : (
                                    <div className="vehicle-img-placeholder">
                                      <Car size={14} />
                                    </div>
                                  )}
                                </div>
                                <div className="vehicle-details">
                                  <span className="vehicle-name">{v.brand} {v.model}</span>
                                  <span className="vehicle-year">{v.year}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="table-cell-location">
                                <MapPin size={12} /> {v.location}
                              </span>
                            </td>
                            <td>
                              <span className="table-cell-price">
                                LKR {v.pricePerDay?.toLocaleString()}
                              </span>
                            </td>
                            <td>
                              <div className="table-cell-actions">
                                <Link to={`/vehicle/${v._id}`} className="action-btn view-btn" title="View Listing">
                                  <ChevronRight size={14} />
                                </Link>
                                <button 
                                  className="action-btn delete-btn" 
                                  onClick={() => setDeleteConfirm(v._id)}
                                  title="Delete Vehicle"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="premium-modal-overlay fade-in" onClick={() => setDeleteConfirm(null)}>
          <div className="premium-modal zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon warning pulse-animation">
              <Trash2 size={24} />
            </div>
            <h3 className="modal-title">Delete Vehicle?</h3>
            <p className="modal-desc">
              Permanently delete this vehicle from the marketplace?
            </p>
            <div className="modal-actions">
              <button className="btn-outline-small" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn-danger-solid glowing-btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Dashboard Layout & Background */
        .premium-dash-wrapper {
          min-height: 100vh;
          background-color: #F8FAFC;
          background-image: radial-gradient(circle at top right, rgba(249, 115, 22, 0.05) 0%, transparent 40%),
                            radial-gradient(circle at bottom left, rgba(249, 115, 22, 0.03) 0%, transparent 40%);
          font-family: var(--font-body);
          color: #0F172A;
          padding-top: 60px; /* smaller header gap */
        }
        
        .premium-dash-container {
          max-width: 1200px; /* smaller max width */
          margin: 0 auto;
          display: flex;
          min-height: calc(100vh - 60px);
        }

        /* Loading & Error States */
        .premium-dash-loading, .premium-dash-error {
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .premium-spinner {
          width: 48px; height: 48px;
          border: 3px solid #FFEDD5;
          border-top-color: #F97316;
          border-radius: 50%;
          animation: premium-spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          margin-bottom: 1rem;
        }
        @keyframes premium-spin { to { transform: rotate(360deg); } }
        
        .error-icon-wrap {
          width: 60px; height: 60px;
          background: #FEE2E2; color: #EF4444;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem;
        }

        /* Text Utilities */
        .text-orange { color: #F97316; }
        .text-green { color: #10B981; }

        /* Premium Sidebar */
        .premium-sidebar {
          width: 240px; /* narrower sidebar */
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border-right: 1px solid rgba(249, 115, 22, 0.1);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 0; /* reduced padding */
          height: calc(100vh - 60px);
          position: sticky;
          top: 60px;
          overflow-y: auto;
        }

        .sidebar-header {
          padding: 0 1.25rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.6);
          margin-bottom: 1rem;
        }

        .company-logo-container {
          width: 56px; height: 56px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          background: #FFFFFF;
          border: 1px solid #FFF7ED;
        }
        .company-logo {
          width: 100%; height: 100%; object-fit: cover;
        }
        .company-logo-placeholder {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
          color: #F97316;
          display: flex; align-items: center; justify-content: center;
        }
        .company-info {
          display: flex; flex-direction: column; gap: 2px; overflow: hidden;
        }
        .company-name {
          font-family: var(--font-display);
          font-size: 0.95rem; font-weight: 800; color: #0F172A;
          margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .verified-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.65rem; font-weight: 700; color: #10B981;
          background: #ECFDF5; padding: 2px 6px; border-radius: 100px;
          width: fit-content; border: 1px solid #A7F3D0;
        }

        .sidebar-nav {
          padding: 0 1rem;
          display: flex; flex-direction: column; gap: 4px;
        }
        .nav-section-title {
          font-size: 0.65rem; font-weight: 800; color: #94A3B8;
          letter-spacing: 0.05em; margin: 1rem 0 0.25rem 0.5rem;
        }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 0.6rem 0.8rem; border-radius: 10px;
          font-size: 0.85rem; font-weight: 600; color: #64748B;
          text-decoration: none; transition: all 0.2s ease-in-out;
          position: relative; overflow: hidden; border: none; cursor: pointer; background: transparent; text-align: left;
        }
        .nav-icon-box {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 8px;
          background: #F1F5F9; color: #64748B; transition: all 0.2s;
        }
        .nav-item:hover {
          background: #F8FAFC; color: #0F172A;
        }
        .nav-item:hover .nav-icon-box {
          background: #E2E8F0; color: #0F172A;
        }
        
        .nav-item.active {
          background: linear-gradient(90deg, #FFF7ED 0%, #FFEDD5 100%);
          color: #EA580C;
          border: 1px solid rgba(249, 115, 22, 0.1);
        }
        .nav-item.active .nav-icon-box {
          background: #F97316; color: white;
        }
        
        .logout-btn { color: #EF4444 !important; }
        .logout-btn .nav-icon-box { background: #FEE2E2 !important; color: #EF4444 !important; }
        .logout-btn:hover { background: #FEF2F2 !important; color: #DC2626 !important; }

        .nav-divider {
          height: 1px; background: rgba(226, 232, 240, 0.6); margin: 0.75rem 0.5rem;
        }
        .external-link:hover {
          color: #3B82F6; background: #EFF6FF;
        }
        .external-link:hover .nav-icon-box { background: #DBEAFE; color: #2563EB; }

        /* Main Content Area */
        .premium-main-content {
          flex: 1;
          padding: 1.5rem 2.5rem; /* much less padding */
          max-width: 1000px;
        }
        
        .dash-top-header {
          margin-bottom: 1.5rem;
          animation: slideDown 0.4s ease-out forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-title {
          font-family: var(--font-display);
          font-size: 1.6rem; font-weight: 800; color: #0F172A; margin: 0 0 4px 0;
          letter-spacing: -0.5px;
        }
        .page-subtitle {
          color: #64748B; font-size: 0.95rem; margin: 0;
        }

        /* Quick Stats Grid */
        .quick-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .stat-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 1px solid rgba(226, 232, 240, 0.6);
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px -4px rgba(249, 115, 22, 0.08);
          border-color: rgba(249, 115, 22, 0.2);
        }
        .stat-icon-wrapper {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .orange-glow { background: #FFF7ED; color: #F97316; }
        .green-glow { background: #ECFDF5; color: #10B981; }
        .blue-glow { background: #EFF6FF; color: #3B82F6; }
        
        .stat-content { display: flex; flex-direction: column; gap: 2px; }
        .stat-label { font-size: 0.7rem; font-weight: 700; color: #64748B; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-value { font-size: 1.15rem; font-weight: 800; color: #0F172A; margin: 0; font-family: var(--font-display); }

        .dashboard-grid {
          display: flex; flex-direction: column; gap: 1.5rem;
        }

        /* Cards */
        .interactive-card {
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          border: 1px solid rgba(226, 232, 240, 0.8);
          overflow: hidden;
          transition: all 0.3s;
        }
        .interactive-card:hover {
          box-shadow: 0 10px 20px -8px rgba(249, 115, 22, 0.08);
          border-color: rgba(249, 115, 22, 0.2);
        }

        .card-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.6);
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(255, 255, 255, 0.9);
        }
        .card-title {
          font-family: var(--font-display);
          font-size: 1.1rem; font-weight: 800; color: #0F172A; margin: 0 0 2px 0;
        }
        .card-description {
          color: #64748B; font-size: 0.8rem; margin: 0;
        }
        .card-body {
          padding: 1.25rem 1.5rem;
        }
        .card-body.p-0 {
          padding: 0;
        }

        /* Buttons (Smaller versions) */
        .glowing-btn {
          position: relative;
          box-shadow: 0 2px 8px 0 rgba(249, 115, 22, 0.3);
        }
        .glowing-btn:hover {
          transform: translateY(-1px);
        }
        .glowing-btn-danger { box-shadow: 0 2px 8px 0 rgba(239, 68, 68, 0.3); }

        .btn-primary-small {
          background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); 
          color: white; border: none; padding: 0.4rem 0.8rem;
          border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer;
          transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
        }
        .btn-outline-small {
          background: #FFFFFF; color: #0F172A; border: 1px solid #E2E8F0; padding: 0.4rem 0.8rem;
          border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer;
          transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-outline-small:hover { background: #F8FAFC; border-color: #F97316; color: #F97316; }

        .btn-text-small {
          background: transparent; color: #64748B; border: none; padding: 0.4rem 0.8rem;
          font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: color 0.2s;
        }
        
        .btn-danger-solid {
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          color: white; border: none; padding: 0.6rem 1.25rem; font-size: 0.85rem;
          border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }

        /* Edit Form smaller */
        .edit-form { display: flex; flex-direction: column; gap: 1rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group label { font-size: 0.75rem; font-weight: 800; color: #334155; }
        .form-group input, .form-group textarea {
          padding: 0.6rem 1rem; border: 1px solid #E2E8F0; border-radius: 8px;
          font-family: inherit; font-size: 0.9rem; color: #0F172A; transition: all 0.2s;
        }
        .form-group input:focus, .form-group textarea:focus {
          outline: none; border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
        }

        /* Profile View Grid (Compact) */
        .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
        .info-item { 
          display: flex; gap: 0.75rem; align-items: center; 
          padding: 0.75rem; border-radius: 12px; transition: all 0.2s;
          border: 1px solid transparent; background: #FAFAFA;
        }
        .hover-up:hover {
          background: #FFF7ED; border-color: rgba(249, 115, 22, 0.1); transform: translateY(-1px);
        }
        .info-item.full-width { grid-column: 1 / -1; align-items: flex-start; }
        .info-icon {
          width: 36px; height: 36px; border-radius: 10px; 
          background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: white;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .info-content { display: flex; flex-direction: column; gap: 2px; }
        .info-label { font-size: 0.7rem; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; }
        .info-value { font-size: 0.9rem; font-weight: 700; color: #0F172A; }
        .info-description { margin: 0.25rem 0 0 0; color: #334155; line-height: 1.5; font-size: 0.85rem; }
        .mt-2 { margin-top: 0.5rem; }

        /* Interactive Premium Table (Compact) */
        .premium-table-container { width: 100%; overflow-x: auto; }
        .premium-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
        .premium-table th {
          padding: 0.75rem 1.25rem; background: #F8FAFC; font-size: 0.75rem; font-weight: 800;
          color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #E2E8F0;
        }
        .interactive-row td {
          padding: 0.85rem 1.25rem; border-bottom: 1px solid #F1F5F9; vertical-align: middle;
          transition: all 0.2s;
        }
        .interactive-row:hover td { background: rgba(249, 115, 22, 0.03); }
        .interactive-row:hover .action-btn.view-btn { background: #F97316; color: white; }
        
        .table-cell-vehicle { display: flex; align-items: center; gap: 1rem; }
        .vehicle-img-wrap {
          width: 60px; height: 44px; border-radius: 8px; overflow: hidden; background: #F1F5F9; flex-shrink: 0;
        }
        .vehicle-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .vehicle-name { font-weight: 800; color: #0F172A; font-size: 0.9rem; display: block; }
        .vehicle-year { font-size: 0.75rem; color: #64748B; font-weight: 600; }

        .table-cell-location { display: inline-flex; align-items: center; gap: 4px; font-size: 0.85rem; color: #475569; font-weight: 500; }
        .table-cell-price { font-weight: 800; color: #0F172A; font-size: 0.9rem; }

        .table-cell-actions { display: flex; justify-content: flex-end; gap: 8px; }
        .action-btn {
          width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; transition: all 0.2s;
        }
        .view-btn { background: #F1F5F9; color: #475569; }
        .delete-btn { background: transparent; color: #94A3B8; }
        .delete-btn:hover { background: #FEE2E2; color: #EF4444; }

        /* Animations */
        .fade-in { animation: fadeIn 0.3s ease-out; }
        .zoom-in { animation: zoomIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        /* Empty State */
        .empty-state { padding: 3rem 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .empty-icon { width: 64px; height: 64px; border-radius: 16px; background: #FFF7ED; color: #F97316; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
        .empty-state h3 { font-size: 1.15rem; font-weight: 800; color: #0F172A; margin: 0 0 0.5rem 0; }
        .empty-state p { color: #64748B; margin: 0; max-width: 300px; font-size: 0.9rem; }

        /* Modal */
        .premium-modal-overlay {
          position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .premium-modal {
          background: white; border-radius: 20px; padding: 2rem; width: 100%; max-width: 360px;
          text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2); 
        }
        .modal-icon {
          width: 48px; height: 48px; border-radius: 50%; margin: 0 auto 1rem;
          display: flex; align-items: center; justify-content: center;
        }
        .modal-icon.warning { background: #FEE2E2; color: #EF4444; }
        .modal-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: #0F172A; margin: 0 0 0.5rem; }
        .modal-desc { color: #475569; font-size: 0.9rem; margin: 0 0 1.5rem; line-height: 1.5; }
        .modal-actions { display: flex; gap: 0.75rem; justify-content: center; }
      `}</style>
    </div>
  );
};

export default CompanyDashboard;
