import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, ChevronRight, KeyRound } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { getStoredUser } from "../utils/session";

const OPTIONS = [
  {
    id: "owner",
    icon: KeyRound,
    title: "I want to list my own vehicle",
    desc: "For individuals renting out one or two personal vehicles.",
  },
  {
    id: "company",
    icon: Building2,
    title: "I run a rent-a-car company",
    desc: "Manage your whole fleet and rentals from one dashboard.",
  },
];

const ChooseListingType = () => {
  const navigate = useNavigate();

  // Listers already know their type: send them straight to the listing form
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = getStoredUser();
    if (!token || !user) return;
    if (user.role === "company") navigate("/fleet/quick-add", { replace: true });
    else if (user.role === "owner" || user.role === "admin") navigate("/list-my-car", { replace: true });
  }, [navigate]);

  const choose = (type) => {
    const loggedIn = Boolean(localStorage.getItem("token") && getStoredUser());
    if (loggedIn) {
      navigate(type === "owner" ? "/list-my-car" : "/dashboard?setup=company");
    } else {
      navigate(`/register?role=${type}`);
    }
  };

  return (
    <AuthLayout
      title="List your vehicle on Yamu"
      subtitle="Which describes you best?"
      wide
      panelTitle="Earn from your vehicle."
      panelPoints={["Free to list", "Customers contact you on WhatsApp", "Manage everything from your dashboard"]}
    >
      <div className="lt-options">
        {OPTIONS.map(({ id, icon: Icon, title, desc }) => (
          <button key={id} type="button" className="lt-option" onClick={() => choose(id)}>
            <span className="lt-option-icon"><Icon size={22} /></span>
            <span className="lt-option-text">
              <strong>{title}</strong>
              <span>{desc}</span>
            </span>
            <ChevronRight size={20} className="lt-option-arrow" />
          </button>
        ))}
      </div>

      <p className="auth-footer-text">
        Wondering what you could earn? <Link to="/earnings-calculator">Try the earnings calculator</Link>
      </p>
      <p className="auth-footer-text" style={{ marginTop: "0.5rem" }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>

      <style>{`
        .lt-options { display: flex; flex-direction: column; gap: 0.75rem; }
        .lt-option {
          display: flex; align-items: center; gap: 1rem; width: 100%; text-align: left;
          padding: 1.1rem 1.25rem; background: #fff; border: 1.5px solid var(--border);
          border-radius: var(--radius); transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }
        .lt-option:hover { border-color: var(--primary); box-shadow: var(--shadow-card-hover); transform: translateY(-2px); }
        .lt-option-icon {
          width: 48px; height: 48px; flex-shrink: 0; border-radius: 14px;
          display: grid; place-items: center; background: var(--primary-soft); color: var(--primary-dark);
        }
        .lt-option-text { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
        .lt-option-text strong { font-size: 1rem; color: var(--text); }
        .lt-option-text span { font-size: 0.88rem; color: var(--text-muted); line-height: 1.45; }
        .lt-option-arrow { color: var(--text-hint); flex-shrink: 0; }
        .lt-option:hover .lt-option-arrow { color: var(--primary); }
      `}</style>
    </AuthLayout>
  );
};

export default ChooseListingType;
