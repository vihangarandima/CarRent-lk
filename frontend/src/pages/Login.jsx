import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert("Login successful!");
      navigate('/');
      
      // Optionally reload the page so the navbar updates if it depends on localStorage state
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="container auth-page">
      <div className="form-container glass-card">
        <h1>Welcome Back</h1>
        <p>Login to your account to rent or list vehicles.</p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-field">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="input-field">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="********" required />
          </div>
          
          <button className="btn-primary" type="submit" style={{ marginTop: '1rem' }}>Login</button>
        </form>
        
        <p className="auth-redirect">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          padding: 80px 2rem;
          display: flex;
          justify-content: center;
        }
        .form-container {
          max-width: 500px;
          width: 100%;
          text-align: center;
        }
        .form-container h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        .form-container p {
          color: var(--text-muted);
          margin-bottom: 2rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          text-align: left;
        }
        .input-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .input-field label {
          font-size: 0.9rem;
          font-weight: 500;
        }
        .input-field input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: white;
          outline: none;
        }
        .auth-redirect {
          margin-top: 2rem !important;
          margin-bottom: 0 !important;
        }
        .auth-redirect a {
          color: var(--primary);
          text-decoration: none;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default Login;
