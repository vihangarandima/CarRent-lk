import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const user = JSON.parse(localStorage.getItem('user') || 'null') || {
    name: 'Saman Kumara',
    email: 'saman@carrents.lk',
  };
  const initial = user?.name?.[0]?.toUpperCase() || 'S';
  const firstName = user?.name?.split(' ')[0] || 'User';

  const stats = [
    { emoji: '🚗', label: 'My Listings', value: '3' },
    { emoji: '📅', label: 'Total Rents', value: '12' },
    { emoji: '⭐', label: 'Rating', value: '4.9' },
    { emoji: '💰', label: 'Earned', value: 'LKR 124K' },
  ];

  const listings = [
    { brand: 'Toyota', model: 'Aqua', year: 2021, price: 8500, status: 'Active' },
    { brand: 'Honda', model: 'Vezel', year: 2020, price: 12000, status: 'Rented' },
  ];

  const tabs = [
    { id: 'overview', label: '🏠 Overview' },
    { id: 'listings', label: '🚗 My Cars' },
    { id: 'bookings', label: '📅 Bookings' },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="avatar-lg">{initial}</div>
          <div className="profile-meta">
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
          <button className="btn-ghost edit-btn">Edit Profile</button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {stats.map((s, i) => (
            <div key={i} className="stat-box">
              <span className="stat-emoji">{s.emoji}</span>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tab Nav */}
        <div className="tab-nav">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="animate-in">
              <div className="overview-grid">
                <div className="overview-card">
                  <h3>👋 Welcome back, {firstName}!</h3>
                  <p>Your Toyota Aqua was viewed <strong>45 times</strong> this week.</p>
                </div>
                <Link to="/list-my-car" className="overview-card cta-card">
                  <h3>➕ Add New Vehicle</h3>
                  <p>List another car and earn more every month.</p>
                  <span className="cta-link">Get started →</span>
                </Link>
                <div className="overview-card">
                  <h3>💳 Earnings</h3>
                  <p>You earned <strong>LKR 124,000</strong> this year.</p>
                </div>
                <div className="overview-card">
                  <h3>💬 Messages</h3>
                  <p>You have <strong>2 new offers</strong> waiting for review.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="animate-in">
              <div className="section-header">
                <h2>My Vehicles</h2>
                <Link to="/list-my-car" className="btn-sm">+ Add New</Link>
              </div>
              <div className="listings-list">
                {listings.map((item, i) => (
                  <div key={i} className="listing-row">
                    <div className="listing-thumb">🚗</div>
                    <div className="listing-info">
                      <h4>{item.brand} {item.model} ({item.year})</h4>
                      <p>LKR {item.price.toLocaleString()} / day</p>
                    </div>
                    <div className={`status-pill ${item.status.toLowerCase()}`}>
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="animate-in empty-pane">
              <span>📅</span>
              <h3>No bookings yet</h3>
              <p>When you rent a vehicle, it will appear here.</p>
              <Link to="/vehicles" className="btn-sm">Browse Vehicles</Link>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in settings-pane">
              <h2>Account Settings</h2>
              <div className="settings-form">
                <div className="field">
                  <label>Full Name</label>
                  <input type="text" defaultValue={user.name} />
                </div>
                <div className="field">
                  <label>Email Address</label>
                  <input type="email" defaultValue={user.email} />
                </div>
                <div className="field">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="+94 77 123 4567" />
                </div>
                <button className="btn-primary save-btn">Save Changes</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-page {
          padding: 2.5rem 0 6rem;
        }
        .profile-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .avatar-lg {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--grad-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          font-weight: 900;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 20px rgba(124,58,237,0.4);
        }
        .profile-meta { flex: 1; }
        .profile-meta h1 { font-size: 1.6rem; letter-spacing: -0.5px; }
        .profile-meta p { color: var(--text-muted); font-size: 0.9rem; margin: 0; }
        .edit-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          border-radius: 100px;
          padding: 0.5rem 1.1rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .edit-btn:hover { background: var(--surface); color: white; }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-box {
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          text-align: center;
          transition: all 0.2s;
        }
        .stat-box:hover { border-color: var(--border-strong); background: rgba(124,58,237,0.06); }
        .stat-emoji { font-size: 1.5rem; }
        .stat-value { font-size: 1.4rem; font-weight: 900; color: white; letter-spacing: -0.5px; }
        .stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }

        .tab-nav {
          display: flex;
          gap: 0.25rem;
          border-bottom: 1px solid var(--border);
          margin-bottom: 2rem;
          overflow-x: auto;
          padding-bottom: 0;
        }
        .tab-btn {
          padding: 0.7rem 1.1rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
          transition: all 0.2s;
          margin-bottom: -1px;
        }
        .tab-btn:hover { color: white; }
        .tab-btn.active { color: var(--primary-light); border-bottom-color: var(--primary); }

        .tab-content { min-height: 300px; }

        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .overview-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.2s;
          display: block;
          color: inherit;
        }
        .overview-card:hover { border-color: var(--border-strong); background: rgba(255,255,255,0.06); }
        .overview-card h3 { font-size: 1rem; margin-bottom: 0.5rem; }
        .overview-card p { font-size: 0.9rem; color: var(--text-muted); }
        .overview-card p strong { color: white; }
        .cta-card { border-color: rgba(124,58,237,0.25); background: rgba(124,58,237,0.05); }
        .cta-link { display: inline-block; margin-top: 0.75rem; color: var(--primary-light); font-weight: 700; font-size: 0.9rem; }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }
        .section-header h2 { font-size: 1.2rem; }
        .btn-sm {
          background: var(--grad-primary);
          color: white;
          padding: 0.5rem 1.1rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.85rem;
          transition: all 0.2s;
          display: inline-block;
        }
        .btn-sm:hover { filter: brightness(1.1); }

        .listings-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .listing-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 0.875rem;
          padding: 1rem 1.25rem;
          transition: all 0.2s;
        }
        .listing-row:hover { border-color: var(--border-strong); background: rgba(255,255,255,0.05); }
        .listing-thumb {
          font-size: 1.75rem;
          width: 52px;
          height: 52px;
          background: rgba(255,255,255,0.05);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .listing-info { flex: 1; }
        .listing-info h4 { font-size: 0.95rem; color: white; margin-bottom: 0.2rem; }
        .listing-info p { font-size: 0.85rem; color: var(--text-muted); margin: 0; }
        .status-pill {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.8rem;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-pill.active { background: rgba(16,185,129,0.12); color: #34d399; }
        .status-pill.rented { background: rgba(245,158,11,0.12); color: #fbbf24; }

        .empty-pane {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 4rem 0;
          text-align: center;
        }
        .empty-pane span { font-size: 3rem; }
        .empty-pane h3 { color: var(--text); }
        .empty-pane p { color: var(--text-muted); }

        .settings-pane h2 { margin-bottom: 1.5rem; font-size: 1.2rem; }
        .settings-form { display: flex; flex-direction: column; gap: 1.25rem; max-width: 460px; }
        .save-btn { margin-top: 0.5rem; }

        @media (max-width: 768px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .overview-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
};

export default Profile;
