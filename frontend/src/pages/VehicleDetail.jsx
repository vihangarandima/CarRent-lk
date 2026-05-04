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
          padding: 60px 2rem 100px;
          background: radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.05), transparent),
                      radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.05), transparent);
        }
        .detail-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 4rem;
          animation: fadeInUp 0.8s ease-out;
        }
        .main-image {
          width: 100%;
          height: 500px;
          object-fit: cover;
          border-radius: 2rem;
          margin-bottom: 3rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .vehicle-info h1 {
          font-size: 3rem;
          font-weight: 900;
          letter-spacing: -1.5px;
          margin-bottom: 0.5rem;
        }
        .location {
          color: var(--secondary);
          font-weight: 700;
          margin-bottom: 2rem;
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .description {
          margin-top: 3rem;
        }
        .description h3 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
        }
        .description p {
          color: var(--text-muted);
          font-size: 1.1rem;
          line-height: 1.8;
        }
        .bidding-sidebar .sticky-sidebar {
          position: sticky;
          top: 100px;
          padding: 2.5rem !important;
        }
        .price {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 1rem;
          letter-spacing: -1px;
        }
        .price span {
          font-size: 1.1rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 2rem 0;
        }
        .bidding-sidebar h3 {
          font-size: 1.25rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }
        .bid-form {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .bid-form input, .bid-form textarea {
          background: rgba(255, 255, 255, 0.03);
          border: 1.5px solid var(--border);
          padding: 1rem;
          border-radius: 0.75rem;
          color: white;
          width: 100%;
          outline: none;
          font-family: inherit;
          transition: all 0.3s;
        }
        .bid-form input:focus, .bid-form textarea:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.07);
        }
        .bid-form textarea {
          height: 120px;
          resize: none;
        }
        .w-full {
          width: 100%;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .detail-layout { grid-template-columns: 1fr; gap: 3rem; }
          .bidding-sidebar .sticky-sidebar { position: relative; top: 0; }
          .main-image { height: 350px; }
        }
      `}</style>
    </div>
  );
};

export default VehicleDetail;
