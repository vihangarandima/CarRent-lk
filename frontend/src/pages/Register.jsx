import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'renter' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/home');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <Link to="/" className="brand-logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <polyline points="17 11 19 13 23 9"></polyline>
              </svg>
            </div>
            <span className="logo-text">CarRents<span>.lk</span></span>
          </Link>

          <div className="hero-badge-mini">
            <span className="sparkle">✦</span>
            <span>Join Sri Lanka's premium marketplace</span>
          </div>

          <h1>Create Account</h1>
          <p>Sign up in seconds and start driving or earning</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>FULL NAME</label>
            <div className="input-wrapper">
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Saman Kumara" required />
            </div>
          </div>

          <div className="input-group">
            <label>EMAIL ADDRESS</label>
            <div className="input-wrapper">
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" required />
            </div>
          </div>

          <div className="input-group">
            <label>PASSWORD</label>
            <div className="input-wrapper">
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" required />
            </div>
          </div>

          <div className="input-group">
            <label>I WANT TO...</label>
            <div className="role-selection">
              <div 
                className={`role-option ${formData.role === 'renter' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, role: 'renter'})}
              >
                <span className="role-icon">🚘</span>
                <div className="role-text-meta">
                  <strong>Rent a Car</strong>
                  <p>Browse and book cars</p>
                </div>
              </div>
              <div 
                className={`role-option ${formData.role === 'owner' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, role: 'owner'})}
              >
                <span className="role-icon">💰</span>
                <div className="role-text-meta">
                  <strong>List my Car</strong>
                  <p>Earn by sharing your car</p>
                </div>
              </div>
            </div>
          </div>

          <button className="btn-register" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Get Started'}
            {!loading && <span className="arrow">→</span>}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: transparent;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
        }

        .auth-card {
          width: 100%;
          max-width: 480px;
          background: #FFFFFF;
          border-radius: 2rem;
          padding: 3rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
          border: 1px solid #F1F5F9;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .brand-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 1.5rem;
        }

        .logo-icon {
          background: #7C3AED;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text { font-size: 1.4rem; font-weight: 800; color: #111827; letter-spacing: -0.5px; }
        .logo-text span { color: #7C3AED; }

        .hero-badge-mini {
          background: #F5F3FF;
          color: #7C3AED;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 1.25rem;
        }

        .auth-header h1 { font-size: 2rem; font-weight: 800; color: #111827; margin-bottom: 8px; }
        .auth-header p { color: #6B7280; font-size: 0.95rem; }

        .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }

        .input-group label { display: block; font-size: 11px; font-weight: 800; color: #9CA3AF; margin-bottom: 8px; letter-spacing: 0.05em; }

        .input-wrapper input {
          width: 100%;
          padding: 12px 18px;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          background: #F9FAFB;
          font-size: 15px;
          transition: all 0.2s ease;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: #7C3AED;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
        }

        /* Role Selection Styling */
        .role-selection {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .role-option {
          border: 2px solid #F1F5F9;
          padding: 16px 12px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: #F9FAFB;
        }

        .role-option:hover { border-color: #DDD6FE; background: #F5F3FF; }
        .role-option.active { border-color: #7C3AED; background: #ede9fe; }

        .role-icon { font-size: 1.5rem; margin-bottom: 8px; }
        .role-text-meta strong { font-size: 0.85rem; display: block; color: #1F2937; }
        .role-text-meta p { font-size: 0.7rem; color: #6B7280; margin: 2px 0 0; }

        .btn-register {
          background: #7C3AED;
          color: white;
          padding: 16px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(124, 58, 237, 0.2);
        }

        .btn-register:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(124, 58, 237, 0.3); background: #6D28D9; }
        .btn-register:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-footer { margin-top: 2rem; text-align: center; border-top: 1px solid #F1F5F9; padding-top: 1.5rem; }
        .auth-footer p { color: #6B7280; font-size: 0.9rem; }
        .auth-footer a { color: #7C3AED; font-weight: 700; text-decoration: none; margin-left: 4px; }
        .auth-footer a:hover { text-decoration: underline; }

        .fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 480px) {
          .auth-card { padding: 2rem 1.5rem; }
          .role-selection { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Register;