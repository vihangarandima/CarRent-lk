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
          padding: 100px 0;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent),
                      radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.15), transparent);
        }
        .hero-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .hero-title {
          font-size: 4rem;
          max-width: 800px;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }
        .hero-title span {
          background: var(--grad-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          color: var(--text-muted);
          font-size: 1.25rem;
          max-width: 600px;
          margin-bottom: 3rem;
        }
        .hero-search {
          display: flex;
          gap: 1rem;
          width: 100%;
          max-width: 700px;
          padding: 1rem;
        }
        .hero-search input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 1rem;
          outline: none;
          padding: 0 1rem;
        }
      `}</style>
    </section>
  );
};

export default Hero;
