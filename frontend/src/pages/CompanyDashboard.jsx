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
  ChevronRight
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
  }, []);

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

  if (loading)
    return (
      <div className="premium-dash-loading">
        <div className="premium-spinner" />
        <p>Loading your workspace...</p>
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
                  <Building2 size={24} />
                </div>
              )}
            </div>
            <div className="company-info">
              <h3 className="company-name">{company.companyName}</h3>
              <span className="verified-badge">
                <span className="verified-dot"></span>
                Verified Partner
              </span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-title">MAIN MENU</div>
            <div className="nav-item active">
              <Building2 size={18} />
              <span>Company Profile</span>
            </div>
            <Link to="/list-my-car" className="nav-item">
              <Plus size={18} />
              <span>Add Vehicle</span>
            </Link>
            
            <div className="nav-divider"></div>
            <div className="nav-section-title">EXTERNAL</div>
            
            <Link
              to={`/companies/${company._id}`}
              className="nav-item external-link"
              target="_blank"
            >
              <ExternalLink size={18} />
              <span>View Public Page</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="premium-main-content">
          <header className="dash-top-header">
            <div>
              <h1 className="page-title">Dashboard Overview</h1>
              <p className="page-subtitle">Manage your fleet and company details.</p>
            </div>
          </header>

          <div className="dashboard-grid">
            {/* Profile Section */}
            <section className="dash-card profile-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Company Information</h2>
                  <p className="card-description">Your public contact details and description.</p>
                </div>
                {!editMode ? (
                  <button className="btn-outline-small" onClick={() => setEditMode(true)}>
                    <Edit3 size={14} /> Edit Profile
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
                      className="btn-primary-small"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>

              <div className="card-body">
                {editMode ? (
                  <div className="edit-form">
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
                        rows={4}
                        value={editData.description || ""}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        placeholder="Describe your services..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-icon"><MapPin size={16} /></div>
                      <div className="info-content">
                        <span className="info-label">Address</span>
                        <span className="info-value">{company.address || "Not specified"}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon"><Phone size={16} /></div>
                      <div className="info-content">
                        <span className="info-label">Phone</span>
                        <span className="info-value">{company.phone || "Not specified"}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon"><Mail size={16} /></div>
                      <div className="info-content">
                        <span className="info-label">Email</span>
                        <span className="info-value">{company.contactEmail || "Not specified"}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon"><Car size={16} /></div>
                      <div className="info-content">
                        <span className="info-label">Total Fleet</span>
                        <span className="info-value">{vehicles.length} Active Vehicles</span>
                      </div>
                    </div>
                    {company.description && (
                      <div className="info-item full-width mt-4">
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
            <section className="dash-card fleet-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Vehicle Fleet</h2>
                  <p className="card-description">Manage your {vehicles.length} listed vehicles.</p>
                </div>
                <Link to="/list-my-car" className="btn-primary-small">
                  <Plus size={14} /> Add New
                </Link>
              </div>

              <div className="card-body p-0">
                {vehicles.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <Car size={32} />
                    </div>
                    <h3>No vehicles yet</h3>
                    <p>Start building your fleet by adding your first vehicle.</p>
                    <Link to="/list-my-car" className="btn-primary-solid mt-4">
                      Add Vehicle
                    </Link>
                  </div>
                ) : (
                  <div className="premium-table-container">
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Vehicle</th>
                          <th>Location</th>
                          <th>Rate / Day</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map((v) => (
                          <tr key={v._id}>
                            <td>
                              <div className="table-cell-vehicle">
                                <div className="vehicle-img-wrap">
                                  {v.images && v.images[0] ? (
                                    <img src={v.images[0]} alt={v.brand} />
                                  ) : (
                                    <div className="vehicle-img-placeholder">
                                      <Car size={16} />
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
                                  <ChevronRight size={16} />
                                </Link>
                                <button 
                                  className="action-btn delete-btn" 
                                  onClick={() => setDeleteConfirm(v._id)}
                                  title="Delete Vehicle"
                                >
                                  <Trash2 size={16} />
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
        <div className="premium-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon warning">
              <Trash2 size={24} />
            </div>
            <h3 className="modal-title">Delete Vehicle</h3>
            <p className="modal-desc">
              Are you sure you want to remove this vehicle from your fleet? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-outline-solid" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn-danger-solid" onClick={() => handleDelete(deleteConfirm)}>
                Yes, Delete
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
          font-family: var(--font-body);
          color: #0F172A;
          padding-top: 80px; /* Account for navbar */
        }
        
        .premium-dash-container {
          max-width: 1300px;
          margin: 0 auto;
          display: flex;
          min-height: calc(100vh - 80px);
        }

        /* Loading & Error States */
        .premium-dash-loading, .premium-dash-error {
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #F8FAFC;
        }
        .premium-spinner {
          width: 48px; height: 48px;
          border: 3px solid #FFEDD5;
          border-top-color: #F97316;
          border-radius: 50%;
          animation: premium-spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes premium-spin { to { transform: rotate(360deg); } }
        .error-icon-wrap {
          width: 80px; height: 80px;
          background: #FEE2E2; color: #EF4444;
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.5rem;
        }

        /* Premium Sidebar */
        .premium-sidebar {
          width: 280px;
          flex-shrink: 0;
          background: #FFFFFF;
          border-right: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          padding: 2rem 0;
          height: calc(100vh - 80px);
          position: sticky;
          top: 80px;
          overflow-y: auto;
        }

        .sidebar-header {
          padding: 0 1.5rem 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 1px solid #F1F5F9;
          margin-bottom: 1.5rem;
        }

        .company-logo-container {
          width: 56px; height: 56px;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          flex-shrink: 0;
          background: #FFFFFF;
        }
        .company-logo {
          width: 100%; height: 100%; object-fit: cover;
        }
        .company-logo-placeholder {
          width: 100%; height: 100%;
          background: #FFF7ED; color: #F97316;
          display: flex; align-items: center; justify-content: center;
        }
        .company-info {
          display: flex; flex-direction: column; gap: 4px; overflow: hidden;
        }
        .company-name {
          font-family: var(--font-display);
          font-size: 1rem; font-weight: 700; color: #0F172A;
          margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .verified-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.75rem; font-weight: 600; color: #10B981;
          background: #ECFDF5; padding: 2px 8px; border-radius: 100px;
          width: fit-content;
        }
        .verified-dot {
          width: 6px; height: 6px; background: #10B981; border-radius: 50%;
        }

        .sidebar-nav {
          padding: 0 1rem;
          display: flex; flex-direction: column; gap: 4px;
        }
        .nav-section-title {
          font-size: 0.7rem; font-weight: 700; color: #94A3B8;
          letter-spacing: 0.05em; margin: 1rem 0 0.5rem 1rem;
        }
        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 0.75rem 1rem; border-radius: 12px;
          font-size: 0.95rem; font-weight: 600; color: #64748B;
          text-decoration: none; transition: all 0.2s ease;
        }
        .nav-item:hover {
          background: #F8FAFC; color: #0F172A;
        }
        .nav-item.active {
          background: #FFF7ED; color: #F97316;
        }
        .nav-divider {
          height: 1px; background: #F1F5F9; margin: 1rem;
        }
        .external-link:hover {
          color: #3B82F6; background: #EFF6FF;
        }

        /* Main Content Area */
        .premium-main-content {
          flex: 1;
          padding: 2.5rem 3rem;
          max-width: 1020px;
        }
        
        .dash-top-header {
          margin-bottom: 2rem;
        }
        .page-title {
          font-family: var(--font-display);
          font-size: 1.8rem; font-weight: 700; color: #0F172A; margin: 0 0 4px 0;
        }
        .page-subtitle {
          color: #64748B; font-size: 1rem; margin: 0;
        }

        .dashboard-grid {
          display: flex; flex-direction: column; gap: 2rem;
        }

        /* Cards */
        .dash-card {
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 10px 15px -5px rgba(0,0,0,0.02);
          border: 1px solid #F1F5F9;
          overflow: hidden;
        }
        .card-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #F1F5F9;
          display: flex; justify-content: space-between; align-items: center;
        }
        .card-title {
          font-family: var(--font-display);
          font-size: 1.15rem; font-weight: 700; color: #0F172A; margin: 0 0 2px 0;
        }
        .card-description {
          color: #64748B; font-size: 0.85rem; margin: 0;
        }
        .card-body {
          padding: 2rem;
        }
        .card-body.p-0 {
          padding: 0;
        }

        /* Buttons */
        .btn-primary-solid {
          background: #F97316; color: white; border: none; padding: 0.75rem 1.5rem;
          border-radius: 12px; font-weight: 600; font-size: 0.95rem; cursor: pointer;
          transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-primary-solid:hover { background: #EA580C; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2); }
        
        .btn-primary-small {
          background: #F97316; color: white; border: none; padding: 0.5rem 1rem;
          border-radius: 10px; font-weight: 600; font-size: 0.85rem; cursor: pointer;
          transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-primary-small:hover { background: #EA580C; }
        .btn-primary-small:disabled { opacity: 0.7; cursor: not-allowed; }

        .btn-outline-small {
          background: #FFFFFF; color: #0F172A; border: 1px solid #E2E8F0; padding: 0.5rem 1rem;
          border-radius: 10px; font-weight: 600; font-size: 0.85rem; cursor: pointer;
          transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-outline-small:hover { background: #F8FAFC; border-color: #CBD5E1; }

        .btn-text-small {
          background: transparent; color: #64748B; border: none; padding: 0.5rem 1rem;
          font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: color 0.2s;
        }
        .btn-text-small:hover { color: #0F172A; }

        .btn-outline-solid {
          background: #FFFFFF; color: #334155; border: 1px solid #CBD5E1; padding: 0.75rem 1.5rem;
          border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .btn-outline-solid:hover { background: #F8FAFC; }
        
        .btn-danger-solid {
          background: #EF4444; color: white; border: none; padding: 0.75rem 1.5rem;
          border-radius: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s;
        }
        .btn-danger-solid:hover { background: #DC2626; }

        /* Edit Form */
        .edit-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.8rem; font-weight: 700; color: #475569; }
        .form-group input, .form-group textarea {
          padding: 0.75rem 1rem; border: 1px solid #E2E8F0; border-radius: 10px;
          font-family: inherit; font-size: 0.95rem; color: #0F172A; transition: all 0.2s;
          background: #F8FAFC;
        }
        .form-group input:focus, .form-group textarea:focus {
          outline: none; border-color: #F97316; background: #FFFFFF; box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
        }
        .edit-actions { display: flex; gap: 0.5rem; }

        /* Profile View Grid */
        .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
        .info-item { display: flex; gap: 1rem; }
        .info-item.full-width { grid-column: 1 / -1; }
        .info-icon {
          width: 40px; height: 40px; border-radius: 10px; background: #FFF7ED; color: #F97316;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .info-content { display: flex; flex-direction: column; gap: 2px; }
        .info-label { font-size: 0.75rem; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; }
        .info-value { font-size: 0.95rem; font-weight: 600; color: #0F172A; }
        .info-description { margin: 0.5rem 0 0 0; color: #475569; line-height: 1.6; font-size: 0.95rem; }
        .mt-4 { margin-top: 1rem; }

        /* Premium Table */
        .premium-table-container {
          width: 100%; overflow-x: auto;
        }
        .premium-table {
          width: 100%; border-collapse: collapse; text-align: left;
        }
        .premium-table th {
          padding: 1rem 1.5rem; background: #F8FAFC; font-size: 0.75rem; font-weight: 700;
          color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #F1F5F9;
        }
        .premium-table td {
          padding: 1.25rem 1.5rem; border-bottom: 1px solid #F1F5F9; vertical-align: middle;
        }
        .premium-table tr:last-child td { border-bottom: none; }
        .premium-table tr:hover td { background: #FAFAFA; }
        .text-right { text-align: right; }

        .table-cell-vehicle { display: flex; align-items: center; gap: 1rem; }
        .vehicle-img-wrap {
          width: 64px; height: 48px; border-radius: 8px; overflow: hidden; background: #F1F5F9; flex-shrink: 0;
        }
        .vehicle-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .vehicle-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #94A3B8; }
        .vehicle-details { display: flex; flex-direction: column; }
        .vehicle-name { font-weight: 700; color: #0F172A; font-size: 0.95rem; }
        .vehicle-year { font-size: 0.8rem; color: #64748B; }

        .table-cell-location { display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #475569; }
        .table-cell-price { font-weight: 700; color: #0F172A; font-size: 0.95rem; }

        .table-cell-actions { display: flex; justify-content: flex-end; gap: 8px; }
        .action-btn {
          width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; transition: all 0.2s;
        }
        .view-btn { background: #F1F5F9; color: #475569; }
        .view-btn:hover { background: #E2E8F0; color: #0F172A; }
        .delete-btn { background: transparent; color: #94A3B8; }
        .delete-btn:hover { background: #FEE2E2; color: #EF4444; }

        /* Empty State */
        .empty-state {
          padding: 4rem 2rem; display: flex; flex-direction: column; align-items: center; text-align: center;
        }
        .empty-icon {
          width: 64px; height: 64px; border-radius: 16px; background: #F1F5F9; color: #94A3B8;
          display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;
        }
        .empty-state h3 { font-size: 1.15rem; font-weight: 700; color: #0F172A; margin: 0 0 0.5rem 0; }
        .empty-state p { color: #64748B; margin: 0; max-width: 300px; font-size: 0.95rem; }

        /* Modal */
        .premium-modal-overlay {
          position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .premium-modal {
          background: white; border-radius: 24px; padding: 2.5rem; width: 100%; max-width: 400px;
          text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.1); animation: modal-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modal-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .modal-icon {
          width: 56px; height: 56px; border-radius: 50%; margin: 0 auto 1.25rem;
          display: flex; align-items: center; justify-content: center;
        }
        .modal-icon.warning { background: #FEE2E2; color: #EF4444; }
        .modal-title { font-size: 1.25rem; font-weight: 700; color: #0F172A; margin: 0 0 0.5rem; }
        .modal-desc { color: #64748B; font-size: 0.95rem; margin: 0 0 2rem; line-height: 1.5; }
        .modal-actions { display: flex; gap: 1rem; justify-content: center; }

        /* Responsive */
        @media (max-width: 1024px) {
          .premium-dash-container { flex-direction: column; }
          .premium-sidebar {
            width: 100%; height: auto; position: static; border-right: none; border-bottom: 1px solid #E2E8F0;
            padding: 1.5rem; flex-direction: row; align-items: center; justify-content: space-between;
          }
          .sidebar-header { border-bottom: none; margin: 0; padding: 0; }
          .sidebar-nav { flex-direction: row; align-items: center; overflow-x: auto; padding: 0; }
          .nav-section-title, .nav-divider { display: none; }
          .nav-item { white-space: nowrap; }
          .premium-main-content { padding: 2rem 1.5rem; }
        }
        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr; gap: 1rem; }
          .info-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default CompanyDashboard;
