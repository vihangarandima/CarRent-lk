import React, { useState } from 'react';
import axios from 'axios';

const ListVehicle = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    brand: '', model: '', year: '', pricePerDay: '', location: '', description: '', availableFrom: '', availableTo: '', image: ''
  });

  const nextStep = (e) => { e.preventDefault(); setStep(step + 1); };
  const prevStep = (e) => { e.preventDefault(); setStep(step - 1); };

  // 1. Function to handle when the user types in any input field
  const handleChange = (e) => {
    // e.target.name is the 'name' attribute of the input
    // e.target.value is what the user just typed
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to upload the photo to our new backend route
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a FormData object to send the file
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      // Send it to the upload endpoint
      const res = await axios.post('http://localhost:5000/api/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Save the returned URL (http://localhost:5000/uploads/...) to our form data
      setFormData({ ...formData, image: res.data.url });
      alert("Image uploaded successfully!");
      
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Failed to upload image.");
    }
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

      const payload = {
        ...formData,
        images: formData.image ? [formData.image] : [] // Backend expects an array of images
      };

      console.log("Ready to send this to the backend:", payload);
      const res = await axios.post('http://localhost:5000/api/vehicles', payload, config);
      alert("Superb successfully saved: " + res.data.brand);
      
      // Optionally reset the form and go to Step 1
      setFormData({
        brand: '', model: '', year: '', pricePerDay: '', location: '', description: '', availableFrom: '', availableTo: '', image: ''
      });
      setStep(1);

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
        <form className="list-form">
          {/* STEP 1: Basic Vehicle Specs */}
          {step === 1 && (
            <div className="wizard-step fade-in">
              <h2>Step 1: Vehicle Details</h2>
              <div className="form-grid" style={{ marginTop: '1rem' }}>
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
              <div className="input-field" style={{ marginTop: '1.5rem' }}>
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your vehicle's condition, features, etc."></textarea>
              </div>
              <button className="btn-primary" onClick={nextStep} style={{ marginTop: '2rem' }}>Next: Upload Photos</button>
            </div>
          )}

          {/* STEP 2: Photos */}
          {step === 2 && (
            <div className="wizard-step fade-in">
              <h2>Step 2: Add Awesome Photos</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>A good photo increases your rent chances massively.</p>
              
              <div className="input-field">
                <label>Upload Vehicle Photo (from your computer)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                />
              </div>
              
              {formData.image && (
                <div style={{ marginTop: '1rem', borderRadius: '0.5rem', overflow: 'hidden', height: '200px' }}>
                  <img src={formData.image} alt="Car Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              
              <div className="wizard-buttons">
                <button className="btn-secondary" onClick={prevStep}>Back</button>
                <button className="btn-primary" onClick={nextStep}>Next: Location & Map</button>
              </div>
            </div>
          )}

          {/* STEP 3: Location */}
          {step === 3 && (
            <div className="wizard-step fade-in">
              <h2>Step 3: Pin on Map</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Where can the renter pick up this car?</p>
              
              <div className="input-field">
                <label>Location Address</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Colombo 07" />
              </div>
              
              {/* Map Placeholder for Step-by-Step Learning */}
              <div className="map-placeholder">
                <p>🗺️ Map Component Will Go Here Shortly!</p>
              </div>

              <div className="wizard-buttons">
                <button className="btn-secondary" onClick={prevStep}>Back</button>
                <button className="btn-primary" onClick={handleSubmit}>Publish Listing 🎉</button>
              </div>
            </div>
          )}
        </form>
      </div>

      <style>{`
        .list-page {
          padding: 60px 1rem 100px;
          display: flex;
          justify-content: center;
          min-height: calc(100vh - 72px);
          background: radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.05), transparent),
                      radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.05), transparent);
        }
        .form-container {
          max-width: 800px;
          width: 100%;
          padding: 3rem !important;
          animation: fadeInUp 0.8s ease-out;
        }
        .form-container h1 {
          font-size: 3rem;
          margin-bottom: 0.75rem;
          font-weight: 900;
          letter-spacing: -1.5px;
        }
        .form-container p {
          color: var(--text-muted);
          margin-bottom: 3rem;
          font-size: 1.1rem;
        }
        .list-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .wizard-step h2 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          color: white;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .input-field {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .input-field label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .input-field input, .input-field textarea {
          background: rgba(255, 255, 255, 0.03);
          border: 1.5px solid var(--border);
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          color: white;
          outline: none;
          font-family: inherit;
          font-size: 1rem;
          transition: all 0.3s;
        }
        .input-field input:focus, .input-field textarea:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.07);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }
        .input-field textarea {
          height: 120px;
          resize: none;
        }
        .fade-in {
          animation: fadeIn 0.4s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .wizard-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 3rem;
        }
        .btn-primary {
          background: var(--grad-primary);
          color: white;
          padding: 1rem 2rem;
          border-radius: 3rem;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
          transition: all 0.3s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
        }
        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid var(--border);
          color: white;
          padding: 1rem 2rem;
          border-radius: 3rem;
          cursor: pointer;
          font-weight: 700;
          font-size: 1rem;
          transition: all 0.3s;
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }
        .map-placeholder {
          height: 250px;
          background: rgba(0, 0, 0, 0.2);
          border: 2px dashed var(--border);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1.5rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr; }
          .form-container { padding: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
};

export default ListVehicle;
