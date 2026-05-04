import React from 'react';
import { useNavigate } from 'react-router-dom';

const Splash = () => {
  const navigate = useNavigate();

  return (
    <div className="splash-page">
      {/* Top Bar */}
      <header className="splash-header">
        <div className="splash-logo">
          <svg className="logo-swirl" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14c3.866 0 7.384-1.568 9.923-4.104" 
              stroke="url(#grad)" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M16 8c-4.418 0-8 3.582-8 8s3.582 8 8 8c2.21 0 4.21-.896 5.657-2.343" 
              stroke="url(#grad)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#7c3aed"/>
                <stop offset="1" stopColor="#06b6d4"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="logo-text">CarRents<span className="logo-dot">.lk</span></span>
        </div>
        <button className="splash-login-btn" onClick={() => navigate('/login')}>Login</button>
      </header>

      {/* Main Content - Two Cards */}
      <div className="splash-cards">
        {/* Card 1: List */}
        <div className="splash-card">
          <h2>List Your Vehicle or Your Driving Skills.</h2>
          <div className="card-icons">
            <svg width="80" height="50" viewBox="0 0 80 50" fill="none">
              <path d="M10 35h60M15 35l5-15h30l5 15M20 20h30M25 35v5M55 35v5M20 28h5M55 28h5" 
                stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <circle cx="25" cy="25" r="18" stroke="#4b5563" strokeWidth="2"/>
              <circle cx="25" cy="25" r="6" stroke="#4b5563" strokeWidth="2"/>
              <line x1="25" y1="7" x2="25" y2="13" stroke="#4b5563" strokeWidth="2"/>
              <line x1="25" y1="37" x2="25" y2="43" stroke="#4b5563" strokeWidth="2"/>
              <line x1="7" y1="25" x2="13" y2="25" stroke="#4b5563" strokeWidth="2"/>
              <line x1="37" y1="25" x2="43" y2="25" stroke="#4b5563" strokeWidth="2"/>
            </svg>
          </div>
          <p>Ready to earn with your car or as a professional driver? Simple steps to get started.</p>
          <button className="card-btn card-btn-purple" onClick={() => navigate('/list-my-car')}>List Now</button>
        </div>

        {/* Card 2: Rent */}
        <div className="splash-card">
          <h2>Rent a Car or Hire a Driver</h2>
          <div className="card-icons">
            <svg width="80" height="50" viewBox="0 0 80 50" fill="none">
              <path d="M10 35h60M15 35l5-15h30l5 15M20 20h30M25 35v5M55 35v5M20 28h5M55 28h5" 
                stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <ellipse cx="25" cy="32" rx="14" ry="8" stroke="#4b5563" strokeWidth="2" fill="none"/>
              <path d="M15 28c0-6 4-14 10-14s10 8 10 14" stroke="#4b5563" strokeWidth="2" fill="none"/>
              <ellipse cx="25" cy="14" rx="4" ry="3" stroke="#4b5563" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <p>Find vehicles or verified drivers for your journey. Easy booking and transparent pricing.</p>
          <button className="card-btn card-btn-green" onClick={() => navigate('/vehicles')}>Rent Now</button>
        </div>
      </div>

      {/* Bottom Bar */}
      <footer className="splash-footer">
        <span className="footer-lang">ENG / SIN</span>
      </footer>

      <style>{`
        .splash-page {
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #c4b5fd 0%, #ddd6fe 25%, #e0f2fe 50%, #a7f3d0 75%, #6ee7b7 100%);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }

        .splash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 3rem;
        }

        .splash-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .logo-swirl {
          flex-shrink: 0;
        }

        .logo-text {
          font-family: 'Outfit', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #1e1b4b;
        }

        .logo-dot {
          color: #7c3aed;
        }

        .splash-login-btn {
          background: transparent;
          border: 2px solid #374151;
          color: #1f2937;
          padding: 0.5rem 1.8rem;
          border-radius: 2rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .splash-login-btn:hover {
          background: #1f2937;
          color: white;
        }

        .splash-cards {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2.5rem;
          padding: 2rem;
          flex-wrap: wrap;
        }

        .splash-card {
          background: white;
          border-radius: 1.2rem;
          padding: 2.5rem 2rem;
          width: 340px;
          text-align: center;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s, box-shadow 0.3s;
          animation: cardFadeIn 0.6s ease-out both;
        }

        .splash-card:nth-child(2) {
          animation-delay: 0.15s;
        }

        .splash-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }

        .splash-card h2 {
          font-size: 1.4rem;
          color: #111827;
          margin-bottom: 1.5rem;
          line-height: 1.3;
          min-height: 3.6rem;
        }

        .card-icons {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .splash-card p {
          color: #6b7280;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 2rem;
        }

        .card-btn {
          width: 100%;
          padding: 0.85rem;
          border: none;
          border-radius: 0.6rem;
          font-size: 1.05rem;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }

        .card-btn:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }

        .card-btn-purple {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
        }

        .card-btn-green {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .splash-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 1rem 3rem;
          gap: 1.5rem;
        }

        .footer-lang {
          color: #374151;
          font-weight: 600;
          font-size: 0.95rem;
        }

        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .splash-cards {
            flex-direction: column;
            gap: 1.5rem;
          }
          .splash-card {
            width: 90%;
            max-width: 380px;
          }
          .splash-header {
            padding: 1rem 1.5rem;
          }
          .splash-footer {
            padding: 1rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Splash;
