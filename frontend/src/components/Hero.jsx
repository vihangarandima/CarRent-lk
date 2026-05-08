import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2l1.5 4.5L14 8l-4.5 1.5L8 14l-1.5-4.5L2 8l4.5-1.5L8 2z" fill="#8B5CF6" />
            </svg>
            <span>Sri Lanka's modern car marketplace</span>
          </div>

          {/* Titles */}
          <h1 className="hero-title">
            Drive anything. <br />
            <span className="purple-text">Anywhere in Lanka.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            Rent verified vehicles from trusted hosts, or list your own car and start earning — all in a few taps.
          </p>

          {/* CTA Buttons */}
          <div className="hero-actions">
            <button className="btn-find" onClick={() => navigate('/vehicles')}>
              Find a car
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button className="btn-list" onClick={() => navigate('/list-my-car')}>
              List your vehicle
            </button>
          </div>

          {/* Features Checklist */}
          <div className="hero-features">
            <div className="feature-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Verified hosts</span>
            </div>
            <div className="feature-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Insured trips</span>
            </div>
            <div className="feature-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>24/7 support</span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="hero-image-container">
          <img 
            src="http://localhost:5000/uploads/maybach.png" 
            alt="Premium Mercedes Maybach" 
            className="hero-car-img"
          />
        </div>
      </div>

      <style>{`
        .hero {
          padding: 3rem 0;
          background: transparent;
          overflow: hidden;
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
        }

        .hero-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          width: 100%;
        }

        .hero-content {
          flex: 1;
          max-width: 620px;
          z-index: 2;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          background: #F5F3FF;
          border: 1px solid #E9E3FF;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #6B7280;
          margin-bottom: 2rem;
        }

        .hero-badge span {
          color: #4B5563;
        }

        .hero-title {
          font-size: 3.8rem;
          font-weight: 800;
          color: #1F2937;
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin-bottom: 1.25rem;
        }

        .purple-text {
          color: #8B5CF6;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: #6B7280;
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 500px;
        }

        .hero-actions {
          display: flex;
          gap: 1.25rem;
          margin-bottom: 3.5rem;
        }

        .btn-find {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #8B5CF6, #7C3AED);
          color: white;
          padding: 0.9rem 1.8rem;
          border-radius: 3rem;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
          border: none;
          cursor: pointer;
        }

        .btn-find:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(139, 92, 246, 0.5);
        }

        .btn-list {
          background: white;
          color: #1F2937;
          padding: 0.9rem 2rem;
          border-radius: 3rem;
          font-weight: 700;
          font-size: 1rem;
          border: 1px solid #E5E7EB;
          transition: all 0.2s;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .btn-list:hover {
          background: #F9FAFB;
          border-color: #D1D5DB;
        }

        .hero-features {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          color: #6B7280;
          font-weight: 500;
          font-size: 1rem;
        }

        .hero-image-container {
          flex: 1.2;
          display: flex;
          justify-content: flex-end;
          position: relative;
        }

        /* The Glow Effect */
        .hero-image-container::before {
          content: "";
          position: absolute;
          width: 140%;
          height: 140%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(255, 255, 255, 0) 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
        }

        .hero-car-img {
          width: 85%;
          max-width: none;
          position: relative;
          z-index: 2;
          transform: translate(30px, -60px);
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.05));
          animation: carFloat 6s ease-in-out infinite;
        }

        @keyframes carFloat {
          0%, 100% { transform: translate(30px, -60px); }
          50% { transform: translate(30px, -75px); }
        }

        @media (max-width: 1200px) {
          .hero-title { font-size: 3.5rem; }
          .hero-car-img { width: 90%; transform: translate(15px, -30px); }
          @keyframes carFloat {
            0%, 100% { transform: translate(15px, -30px); }
            50% { transform: translate(15px, -45px); }
          }
        }

        @media (max-width: 1024px) {
          .hero { padding: 4rem 0; min-height: auto; }
          .hero-container { flex-direction: column; text-align: center; }
          .hero-content { max-width: 100%; display: flex; flex-direction: column; align-items: center; }
          .hero-subtitle { max-width: 80%; }
          .hero-actions { justify-content: center; }
          .hero-features { justify-content: center; }
          .hero-image-container { justify-content: center; width: 100%; margin-top: 3rem; }
          .hero-car-img { width: 100%; transform: none; }
          @keyframes carFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
        }

        @media (max-width: 640px) {
          .hero-title { font-size: 2.8rem; }
          .hero-actions { flex-direction: column; gap: 1rem; width: 100%; }
          .btn-find, .btn-list { width: 100%; justify-content: center; }
          .hero-features { flex-direction: column; gap: 1rem; align-items: flex-start; }
        }
      `}</style>
    </section>
  );
};

export default Hero;