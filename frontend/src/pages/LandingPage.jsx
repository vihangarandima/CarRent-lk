import React from 'react';
import Hero from '../components/Hero';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Hero />
      <section className="featured container">
        <h2>Featured Vehicles</h2>
        <div className="vehicle-grid">
            {/* We will add vehicle cards here */}
            <p style={{color: 'var(--text-muted)'}}>Discover premium cars from trusted owners...</p>
        </div>
      </section>
      <style>{`
        .featured {
          padding: 100px 0;
        }
        .featured h2 {
          font-size: 3rem;
          margin-bottom: 3.5rem;
          font-weight: 900;
          letter-spacing: -1.5px;
        }
        .vehicle-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2.5rem;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
