import React from "react";
import { useNavigate } from "react-router-dom";

const ChooseListingType = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "120px 20px 80px", minHeight: "100vh", fontFamily: "var(--font-body, 'Plus Jakarta Sans', 'Poppins', sans-serif)" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#111827", marginBottom: 12 }}>
          How would you like to list?
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1.05rem", marginBottom: 40 }}>
          Choose your listing type to get started.
        </p>

        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/list-my-car")}
            style={{
              padding: "32px 40px",
              borderRadius: 16,
              border: "2px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              transition: "all 0.25s ease",
              minWidth: 220,
              fontFamily: "inherit",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#f97316";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(249,115,22,0.12)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚗</div>
            <h3 style={{ fontWeight: 700, color: "#111827", marginBottom: 6, fontSize: "1.1rem" }}>
              Individual Owner
            </h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>List your personal vehicle</p>
          </button>

          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "32px 40px",
              borderRadius: 16,
              border: "2px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              transition: "all 0.25s ease",
              minWidth: 220,
              fontFamily: "inherit",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#f97316";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(249,115,22,0.12)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
            <h3 style={{ fontWeight: 700, color: "#111827", marginBottom: 6, fontSize: "1.1rem" }}>
              Rent-A-Car Company
            </h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Register your fleet</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseListingType;
