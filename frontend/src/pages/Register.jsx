import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'renter'
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert("Registration successful!");
      navigate('/');
      
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="container auth-page">
      <div className="form-container glass-card">
        <h1>Create an Account</h1>
        <p>Join CarRents.lk as an owner or a renter.</p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-field">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
          </div>
          <div className="input-field">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="input-field">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="********" required />
          </div>
          <div className="input-field">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="styled-select" required>
              <option value="renter">Looking to rent a vehicle (Renter)</option>
              <option value="owner">Looking to list my vehicle (Owner)</option>
            </select>
          </div>
          
          <button className="btn-primary" type="submit" style={{ marginTop: '1rem' }}>Register</button>
        </form>
        
        <p className="auth-redirect">
          Already have an account? <Link to="/login">Sign in</Link>
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
        .input-field input, .styled-select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: white;
          outline: none;
        }
        .styled-select option {
          background: #111; /* dark background so text is visible */
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

export default Register;
