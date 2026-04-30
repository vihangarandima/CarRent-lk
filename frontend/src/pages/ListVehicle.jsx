import React, { useState } from 'react';
import axios from 'axios';

const ListVehicle = () => {
  const [formData, setFormData] = useState({
    brand: '', model: '', year: '', pricePerDay: '', location: '', description: '', availableFrom: '', availableTo: ''
  });

  // 1. Function to handle when the user types in any input field
  const handleChange = (e) => {
    // e.target.name is the 'name' attribute of the input
    // e.target.value is what the user just typed
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Function to handle when the user clicks 'Post Listing'
  const handleSubmit = async (e) => {
    e.preventDefault(); // This stops the page from refreshing!
    
    try {
      // Assuming you store the JWT token in localStorage when a user logs in
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert("You must be logged in to post a vehicle. Please go securely login first.");
        // As a quick hack for testing, you could hardcode a bypass in your backend, 
        // but it's best to login and set the token.
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      console.log("Ready to send this to the backend:", formData);
      const res = await axios.post('http://localhost:5000/api/vehicles', formData, config);
      alert("Superb successfully saved: " + res.data.brand);
      
      // Optionally reset the form
      setFormData({
        brand: '', model: '', year: '', pricePerDay: '', location: '', description: '', availableFrom: '', availableTo: ''
      });

    } catch (err) {
      console.error("Error from backend:", err.response?.data);
      alert(err.response?.data?.msg || "Failed to save vehicle. Check console for details.");
    }
  };

  return (
    <div className="container list-page">
      <div className="form-container glass-card">
        <h1>List Your Vehicle</h1>
        <p>Earn money by renting your car to verified users in Sri Lanka.</p>
        {/* 3. We tell the form to run 'handleSubmit' when submitted */}
        <form className="list-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-field">
              <label>Vehicle Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. Toyota" />
            </div>
            <div className="input-field">
              <label>Model</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. Aqua" />
            </div>
            <div className="input-field">
              <label>Year</label>
              <input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="2020" />
            </div>
            <div className="input-field">
              <label>Price per Day (LKR)</label>
              <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} placeholder="8500" />
            </div>
            <div className="input-field">
              <label>Available From</label>
              <input type="date" name="availableFrom" value={formData.availableFrom} onChange={handleChange} required />
            </div>
            <div className="input-field">
              <label>Available To</label>
              <input type="date" name="availableTo" value={formData.availableTo} onChange={handleChange} required />
            </div>
          </div>
          <div className="input-field">
            <label>Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Colombo 07" />
          </div>
          <div className="input-field">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your vehicle's condition, features, etc."></textarea>
          </div>
          {/* Changed button type to submit */}
          <button className="btn-primary" type="submit">Post Listing</button>
        </form>
      </div>

      <style>{`
        .list-page {
          padding: 80px 2rem;
          display: flex;
          justify-content: center;
        }
        .form-container {
          max-width: 800px;
          width: 100%;
        }
        .form-container h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        .form-container p {
          color: var(--text-muted);
          margin-bottom: 2.5rem;
        }
        .list-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
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
        .input-field input, .input-field textarea {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: white;
          outline: none;
        }
        .input-field textarea {
          height: 120px;
          resize: none;
        }
      `}</style>
    </div>
  );
};

export default ListVehicle;
