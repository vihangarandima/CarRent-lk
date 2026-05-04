import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VehicleCard from '../components/VehicleCard';

const VehicleListing = () => {
  const [filter, setFilter] = useState({ brand: '', minPrice: '', maxPrice: '' });
  
  // 1. We create a "state" bucket to hold the real data from the database
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. We use useEffect to automatically fetch the data the moment the page opens
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/vehicles');
        setVehicles(res.data); // Dump the database cars into our bucket
        setLoading(false);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []); // The empty array [] means "only run this exactly once right as the page starts"

  return (
    <div className="container listing-page">
      <aside className="filters glass-card">
        <h3>Filter Vehicles</h3>
        <div className="filter-group">
          <label>Brand</label>
          <input type="text" placeholder="e.g. Toyota" value={filter.brand} onChange={(e) => setFilter({...filter, brand: e.target.value})} />
        </div>
        <div className="filter-group">
          <label>Max Price (LKR)</label>
          <input type="number" placeholder="10000" value={filter.maxPrice} onChange={(e) => setFilter({...filter, maxPrice: e.target.value})} />
        </div>
      </aside>

      <div className="results">
        {loading ? (
           <p style={{ color: 'white' }}>Loading amazing vehicles...</p>
        ) : (
          <div className="vehicle-grid">
            {vehicles.map(v => <VehicleCard key={v._id} vehicle={v} />)}
          </div>
        )}
      </div>

      <style>{`
        .listing-page {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 3rem;
          padding: 60px 2rem 100px;
          background: radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.05), transparent),
                      radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.05), transparent);
        }
        .filters {
          height: fit-content;
          position: sticky;
          top: 100px;
          padding: 2rem !important;
          animation: fadeInLeft 0.8s ease-out;
        }
        .filters h3 {
          font-size: 1.25rem;
          font-weight: 800;
          margin-bottom: 2rem;
          letter-spacing: -0.5px;
        }
        .filter-group {
          margin-bottom: 2rem;
        }
        .filter-group label {
          display: block;
          margin-bottom: 0.75rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .filter-group input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1.5px solid var(--border);
          padding: 0.85rem 1.25rem;
          border-radius: 0.75rem;
          color: white;
          outline: none;
          font-family: inherit;
          font-size: 1rem;
          transition: all 0.3s;
        }
        .filter-group input:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.07);
        }
        .results {
          flex: 1;
          animation: fadeInUp 0.8s ease-out;
        }
        .vehicle-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2.5rem;
        }

        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .listing-page { grid-template-columns: 1fr; gap: 2rem; }
          .filters { position: relative; top: 0; }
        }
      `}</style>
    </div>
  );
};

export default VehicleListing;
