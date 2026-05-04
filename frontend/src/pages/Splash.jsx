import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for 2.5 seconds then redirect to /home
    const timer = setTimeout(() => {
      navigate('/home');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <h1 className="splash-logo">CarRents<span>.lk</span></h1>
        <div className="splash-loader"></div>
        <p className="splash-tagline">Premium Rentals. Local Owners.</p>
      </div>

      <style>{`
        .splash-screen {
          height: 100vh;
          width: 100vw;
          background-color: var(--bg-dark);
          display: flex;
          justify-content: center;
          align-items: center;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
        }

        .splash-content {
          text-align: center;
          animation: fadeInUp 1s ease-out;
        }

        .splash-logo {
          font-size: 4rem;
          color: white;
          margin-bottom: 1rem;
          font-weight: 800;
        }

        .splash-logo span {
          background: var(--grad-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .splash-tagline {
          color: var(--text-muted);
          font-size: 1.2rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 1.5rem;
          opacity: 0;
          animation: fadeIn 1s ease-out 0.5s forwards;
        }

        .splash-loader {
          width: 60px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }

        .splash-loader::after {
          content: '';
          position: absolute;
          left: -100%;
          width: 100%;
          height: 100%;
          background: var(--grad-primary);
          animation: slideLoader 1.5s ease-in-out infinite;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        @keyframes slideLoader {
          0% { left: -100%; }
          50% { left: 0%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Splash;
