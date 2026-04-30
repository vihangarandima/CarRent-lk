import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const VehicleDetail = () => {
  const { id } = useParams();
  const [bidPrice, setBidPrice] = useState('');
  const [message, setMessage] = useState('');

  // Mock vehicle
  const vehicle = {
    brand: 'Toyota', model: 'Aqua', year: 2018, pricePerDay: 8500, location: 'Colombo',
    description: 'Very well maintained hybrid car. Perfect for city travel and long trips. Fuel efficient and comfortable.',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'
  };

  return (
    <div className="container detail-page">
      <div className="detail-layout">
        <div className="vehicle-info">
          <img src={vehicle.image} alt={vehicle.brand} className="main-image" />
          <div className="info-content">
            <h1>{vehicle.brand} {vehicle.model} ({vehicle.year})</h1>
            <p className="location">{vehicle.location}</p>
            <div className="description">
              <h3>About this car</h3>
              <p>{vehicle.description}</p>
            </div>
          </div>
        </div>

        <aside className="bidding-sidebar">
          <div className="glass-card sticky-sidebar">
            <h2 className="price">LKR {vehicle.pricePerDay} <span>/ day</span></h2>
            <hr />
            <h3>Tag a Price</h3>
            <p>Make an offer to the owner</p>
            <div className="bid-form">
              <input type="number" placeholder="Your offer (LKR)" value={bidPrice} onChange={(e) => setBidPrice(e.target.value)} />
              <textarea placeholder="Message to owner..." value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
              <button className="btn-primary w-full">Send Offer</button>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .detail-page {
          padding: 60px 2rem;
        }
        .detail-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 3rem;
        }
        .main-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: 1rem;
          margin-bottom: 2rem;
        }
        .location {
          color: var(--primary);
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .description {
          margin-top: 2rem;
        }
        .description h3 {
          margin-bottom: 1rem;
        }
        .description p {
          color: var(--text-muted);
        }
        .bidding-sidebar .sticky-sidebar {
            position: sticky;
            top: 100px;
        }
        .price {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        .price span {
          font-size: 1rem;
          color: var(--text-muted);
        }
        hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 1.5rem 0;
        }
        .bid-form {
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .bid-form input, .bid-form textarea {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          padding: 1rem;
          border-radius: 0.5rem;
          color: white;
          width: 100%;
          outline: none;
        }
        .bid-form textarea {
          height: 100px;
          resize: none;
        }
        .w-full {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default VehicleDetail;
