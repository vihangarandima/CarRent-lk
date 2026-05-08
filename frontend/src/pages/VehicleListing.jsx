import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VehicleCard from '../components/VehicleCard';

const VehicleListing = () => {
  const [filter, setFilter] = useState({ brand: '', location: '', maxPrice: '' });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/vehicles');
        setVehicles(res.data);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const filtered = vehicles.filter(v => {
    const matchBrand = !filter.brand || v.brand?.toLowerCase().includes(filter.brand.toLowerCase());
    const matchLocation = !filter.location || v.location?.toLowerCase().includes(filter.location.toLowerCase());
    const matchPrice = !filter.maxPrice || v.pricePerDay <= parseInt(filter.maxPrice);
    return matchBrand && matchLocation && matchPrice;
  });

  return (
    <div className="listing-page">
      {/* Header */}
      <div className="listing-header">
        <div className="container">
          <h1>Find Your Perfect Car</h1>
          <p>Browse verified vehicles across Sri Lanka</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar-wrap">
        <div className="container">
          <div className="filter-bar">
            <div className="filter-field">
              <span>🚗</span>
              <input
                type="text"
                placeholder="Brand (e.g. Toyota)"
                value={filter.brand}
                onChange={(e) => setFilter({ ...filter, brand: e.target.value })}
              />
            </div>
            <div className="filter-sep" />
            <div className="filter-field">
              <span>📍</span>
              <input
                type="text"
                placeholder="Location (e.g. Colombo)"
                value={filter.location}
                onChange={(e) => setFilter({ ...filter, location: e.target.value })}
              />
            </div>
            <div className="filter-sep" />
            <div className="filter-field">
              <span>💰</span>
              <input
                type="number"
                placeholder="Max Price/Day (LKR)"
                value={filter.maxPrice}
                onChange={(e) => setFilter({ ...filter, maxPrice: e.target.value })}
              />
            </div>
            {(filter.brand || filter.location || filter.maxPrice) && (
              <button className="filter-clear" onClick={() => setFilter({ brand: '', location: '', maxPrice: '' })}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container">
        <div className="results-meta">
          {!loading && <span>{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} found</span>}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading vehicles...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span>🔍</span>
            <h3>No vehicles found</h3>
            <p>Try changing your filters</p>
          </div>
        ) : (
          <div className="vehicle-grid animate-up">
            {filtered.map(v => <VehicleCard key={v._id} vehicle={v} />)}
          </div>
        )}
      </div>

      <style>{`
        .listing-page {
          min-height: calc(100vh - 68px);
          padding-bottom: 80px;
        }
        .listing-header {
          padding: 3rem 0 2rem;
          text-align: center;
        }
        .listing-header h1 { margin-bottom: 0.5rem; }
        .listing-header p { color: var(--text-muted); }

        .filter-bar-wrap {
          padding: 0 0 2.5rem;
          position: sticky;
          top: 68px;
          z-index: 10;
          background: rgba(15,10,30,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding: 1rem 0;
        }
        .filter-bar {
          display: flex;
          align-items: center;
          gap: 0;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 100px;
          overflow: hidden;
          padding: 0 0.5rem;
        }
        .filter-field {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          padding: 0.6rem 1rem;
        }
        .filter-field span { font-size: 1rem; flex-shrink: 0; }
        .filter-field input {
          border: none;
          background: none;
          color: var(--text);
          font-size: 0.9rem;
          font-family: inherit;
          outline: none;
          width: 100%;
        }
        .filter-field input::placeholder { color: var(--text-hint); }
        .filter-sep {
          width: 1px;
          height: 24px;
          background: var(--border);
          flex-shrink: 0;
        }
        .filter-clear {
          background: var(--grad-primary);
          color: white;
          border: none;
          padding: 0.55rem 1.1rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          flex-shrink: 0;
          margin: 0.3rem;
          transition: all 0.2s;
          font-family: inherit;
        }
        .filter-clear:hover { filter: brightness(1.1); }

        .results-meta {
          padding: 1.5rem 0 1rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
        }
        .vehicle-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 1.5rem;
        }
        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 5rem 0;
          color: var(--text-muted);
        }
        .empty-state span { font-size: 3rem; }
        .empty-state h3 { color: var(--text); margin: 0; }
        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .filter-bar {
            flex-direction: column;
            border-radius: 1rem;
            gap: 0;
          }
          .filter-sep { width: 100%; height: 1px; }
          .filter-clear { width: calc(100% - 0.6rem); border-radius: 0.75rem; }
        }
      `}</style>
    </div>
  );
};

export default VehicleListing;
