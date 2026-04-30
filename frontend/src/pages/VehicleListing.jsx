import React, { useState } from 'react';
import VehicleCard from '../components/VehicleCard';

const VehicleListing = () => {
  const [filter, setFilter] = useState({ brand: '', minPrice: '', maxPrice: '' });

  // Mock data for demonstration
  const vehicles = [
    { id: '1', brand: 'Toyota', model: 'Aqua', year: 2018, pricePerDay: 8500, location: 'Colombo', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=300' },
    { id: '2', brand: 'Honda', model: 'Vezel', year: 2017, pricePerDay: 12000, location: 'Kandy', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=300' },
    { id: '3', brand: 'Suzuki', model: 'Wagon R', year: 2019, pricePerDay: 6500, location: 'Galle', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=300' }
  ];

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
        <div className="vehicle-grid">
          {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
        </div>
      </div>

      <style>{`
        .listing-page {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
          padding: 60px 2rem;
        }
        .filters {
          height: fit-content;
          position: sticky;
          top: 100px;
        }
        .filter-group {
          margin-bottom: 1.5rem;
        }
        .filter-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .filter-group input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: white;
          outline: none;
        }
        .results {
            flex: 1;
        }
        .vehicle-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }

        @media (max-width: 768px) {
            .listing-page {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
    </div>
  );
};

export default VehicleListing;
