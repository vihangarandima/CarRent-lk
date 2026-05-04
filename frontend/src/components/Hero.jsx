import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="container hero-content">
        <h1 className="hero-title">Rent the Perfect Car for Your <span>Sri Lankan</span> Adventure</h1>
        <p className="hero-subtitle">Premium vehicles from local owners. Transparent pricing, no hidden fees.</p>
        <div className="hero-search glass-card">
          <input type="text" placeholder="Where are you looking for a car?" />
          <button className="btn-primary" onClick={() => navigate('/vehicles')}>Search Cars</button>
        </div>
      </div>
      <style>{`
        .hero {
          padding: 80px 0 120px;
          background: radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.1), transparent),
                      radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.1), transparent);
        }
        .hero-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: fadeInUp 1s ease-out;
        }
        .hero-title {
          font-size: 4.5rem;
          max-width: 900px;
          line-height: 1.05;
          margin-bottom: 1.5rem;
          font-weight: 900;
          letter-spacing: -2.5px;
        }
        .hero-title span {
          background: var(--grad-splash);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          color: var(--text-muted);
          font-size: 1.25rem;
          max-width: 650px;
          margin-bottom: 4rem;
          line-height: 1.6;
        }
        .hero-search {
          display: flex;
          gap: 1rem;
          width: 100%;
          max-width: 700px;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1.5px solid var(--border);
          border-radius: 1.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        .hero-search input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 1.1rem;
          outline: none;
          padding: 0 1.5rem;
          font-weight: 500;
        }
        .hero-search input::placeholder {
          color: var(--text-muted);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 3rem; }
          .hero-search { flex-direction: column; border-radius: 1rem; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
