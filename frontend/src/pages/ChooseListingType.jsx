import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Coins, Building2, ArrowLeft, ArrowRight, User } from "lucide-react";

const ChooseListingType = () => {
  const navigate = useNavigate();
  const [listerType, setListerType] = useState('personal');

  const handleContinue = () => {
    if (listerType === 'personal') {
      navigate('/register?role=owner');
    } else {
      navigate('/register?role=company');
    }
  };

  return (
    <div className="lt-wrapper slide-in">
      <div className="lt-card-container">
        <div className="lt-badge-step">Step 1 of 3</div>
        <h1>What type of lister are you?</h1>
        <p className="lt-subtitle">Tick your category so we can set up your correct listing dashboard</p>

        <div className="lt-cards">
          <div 
            className={`lt-card ${listerType === 'personal' ? 'active' : ''}`}
            onClick={() => setListerType('personal')}
          >
            <div className="lt-card-header">
              <div className="lt-icon-wrap green">
                <Coins size={24} />
              </div>
              {listerType === 'personal' ? (
                <div className="lt-status active"><CheckCircle2 size={14} /> Ticked</div>
              ) : (
                <div className="lt-status inactive"></div>
              )}
            </div>
            <h3>Personal Car Owner</h3>
            <h4>1-2 PERSONAL CARS</h4>
            <p>I am a private individual renting out my personal 1-2 cars to earn extra passive income.</p>
          </div>

          <div 
            className={`lt-card ${listerType === 'commercial' ? 'active' : ''}`}
            onClick={() => setListerType('commercial')}
          >
            <div className="lt-card-header">
              <div className="lt-icon-wrap blue">
                <Building2 size={24} />
              </div>
              {listerType === 'commercial' ? (
                <div className="lt-status active"><CheckCircle2 size={14} /> Ticked</div>
              ) : (
                <div className="lt-status inactive"></div>
              )}
            </div>
            <h3>Rent-A-Car Service Owner</h3>
            <h4>COMMERCIAL FLEET</h4>
            <p>I run a commercial car rental business and require a dedicated fleet dashboard & bulk tool.</p>
          </div>
        </div>

        <div className="lt-actions">
          <button className="lt-btn-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <button className="lt-btn-next" onClick={handleContinue}>
            Continue to Enter Details <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="lt-footer-link">
          Already have an account? <a href="/login">Sign in</a>
        </div>
      </div>

      <style>{`
        /* Centered Lister Type Modal */
        .lt-wrapper {
          min-height: calc(100vh - 80px); /* Adjust for navbar */
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #fafafa;
          padding: 2rem;
          font-family: var(--font-body, 'Inter', sans-serif);
        }
        
        .lt-card-container {
          background: #ffffff;
          border-radius: 1.5rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          padding: 3rem;
          max-width: 650px;
          width: 100%;
          text-align: center;
          position: relative;
        }

        .lt-badge-step {
          display: inline-block;
          color: #ea580c;
          background: #fff7ed;
          padding: 0.35rem 1rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .lt-card-container h1 {
          font-size: 2rem;
          font-weight: 800;
          margin: 0 0 0.5rem;
          color: #0f172a;
        }

        .lt-subtitle {
          color: #64748b;
          font-size: 1rem;
          margin: 0 0 2.5rem;
        }

        .lt-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .lt-card {
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 1.25rem;
          padding: 1.5rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lt-card:hover {
          border-color: #cbd5e1;
        }

        .lt-card.active {
          border-color: #10b981;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
        }

        .lt-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .lt-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lt-icon-wrap.green {
          background: #ecfdf5;
          color: #10b981;
        }

        .lt-icon-wrap.blue {
          background: #eff6ff;
          color: #3b82f6;
        }

        .lt-status.active {
          background: #10b981;
          color: white;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.6rem;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .lt-status.inactive {
          width: 20px;
          height: 20px;
          border: 2px solid #cbd5e1;
          border-radius: 50%;
        }

        .lt-card h3 {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0 0 0.25rem;
          color: #0f172a;
        }

        .lt-card h4 {
          font-size: 0.7rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 0.75rem;
        }

        .lt-card p {
          color: #64748b;
          font-size: 0.85rem;
          line-height: 1.4;
          margin: 0;
        }

        .lt-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid #f1f5f9;
        }

        .lt-btn-back {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lt-btn-back:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .lt-btn-next {
          background: linear-gradient(135deg, #ff8800 0%, #f97316 45%, #ea580c 100%);
          color: white;
          border: none;
          padding: 0.85rem 1.75rem;
          border-radius: 12px;
          font-weight: 750;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 24px -4px rgba(249, 115, 22, 0.45);
        }

        .lt-btn-next:hover {
          background: linear-gradient(135deg, #ff9500 0%, #ea580c 100%);
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -4px rgba(234, 88, 12, 0.58);
        }

        .lt-footer-link {
          margin-top: 2rem;
          font-size: 0.9rem;
          color: #64748b;
        }

        .lt-footer-link a {
          color: #ea580c;
          font-weight: 700;
          text-decoration: none;
        }

        .slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .lt-cards {
            grid-template-columns: 1fr;
          }
          .lt-card-container {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ChooseListingType;
