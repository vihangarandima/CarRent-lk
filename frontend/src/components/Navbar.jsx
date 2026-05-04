import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/home" className="logo">CarRents<span>.lk</span></Link>
        <div className="nav-links">
          <Link to="/vehicles">Find a Car</Link>
          <Link to="/list-my-car">List Your Car</Link>
          {token ? (
            <>
              <span style={{ color: 'var(--text-muted)' }}>Hi, {user?.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-login" style={{ cursor: 'pointer', fontFamily: 'inherit' }}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn-login">Login</Link>
          )}
        </div>
      </div>
      <style>{`
        .navbar {
          height: 80px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid var(--border);
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }
        .logo span {
          color: var(--primary);
        }
        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }
        .nav-links a {
          font-weight: 500;
          color: var(--text-muted);
          transition: color 0.2s;
        }
        .nav-links a:hover {
          color: white;
        }
        .btn-login {
          background: var(--glass);
          border: 1px solid var(--border);
          padding: 0.5rem 1.25rem;
          border-radius: 0.5rem;
          color: white !important;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
