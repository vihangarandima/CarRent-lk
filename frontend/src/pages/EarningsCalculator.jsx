import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowRight, Info } from "lucide-react";
import { API_URL } from "../config";
import PageHero from "../components/PageHero";

const TYPES = [
  { id: "car", label: "Car" },
  { id: "mini-car", label: "Mini car" },
  { id: "premium-car", label: "Premium car" },
  { id: "van", label: "Van" },
  { id: "mini-van", label: "Mini van" },
  { id: "threewheeler", label: "Tuk-tuk" },
  { id: "bicycle", label: "Bike" },
  { id: "others", label: "Other" },
];

const SCENARIOS = [4, 7, 15, 25];
const formatLKR = (n) => `Rs. ${Math.round(n).toLocaleString("en-LK")}`;

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Owner-facing estimate based on the owner's own price — no invented platform statistics
export default function EarningsCalculator() {
  const [listings, setListings] = useState([]);
  const [type, setType] = useState("car");
  const [price, setPrice] = useState("");
  const [days, setDays] = useState(10);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/vehicles`)
      .then((res) => setListings(Array.isArray(res.data) ? res.data : []))
      .catch(() => setListings([]));
  }, []);

  // Typical price from real live listings of this type (only shown with enough data)
  const typical = useMemo(() => {
    const prices = listings
      .filter((v) => v.vehicleType === type && Number(v.pricePerDay) > 0)
      .map((v) => Number(v.pricePerDay));
    return prices.length >= 3 ? { value: Math.round(median(prices) / 100) * 100, count: prices.length } : null;
  }, [listings, type]);

  const dailyPrice = Number(price) || 0;
  const monthly = dailyPrice * days;
  const yearly = monthly * 12;

  return (
    <div className="ec-page">
      <PageHero
        badge="For vehicle owners"
        title="What could your vehicle"
        highlight="earn on Yamu?"
        subtitle="Enter your daily price and how many days a month you expect it to be rented. Listing on Yamu is free."
      />

      <div className="container">
        <div className="ec-layout y-overlap">
          <section className="y-card ec-form">
            <div className="y-field">
              <label className="y-label" htmlFor="ec-type">Vehicle type</label>
              <select id="ec-type" className="y-input" value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>

            <div className="y-field">
              <label className="y-label" htmlFor="ec-price">Your price per day (LKR)</label>
              <input
                id="ec-price"
                className="y-input"
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="e.g. 8000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              {typical && (
                <button type="button" className="ec-typical" onClick={() => setPrice(String(typical.value))}>
                  Typical on Yamu: <strong>{formatLKR(typical.value)}/day</strong> (from {typical.count} live listings) · use this
                </button>
              )}
            </div>

            <div className="y-field">
              <label className="y-label" htmlFor="ec-days">
                Days rented per month: <strong className="ec-days-value">{days}</strong>
              </label>
              <input
                id="ec-days"
                className="ec-range"
                type="range"
                min="1"
                max="30"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              />
              <div className="ec-range-scale"><span>1</span><span>15</span><span>30</span></div>
            </div>
          </section>

          <section className="ec-result">
            <span className="y-badge y-badge-light">Your estimate</span>
            <div className="ec-result-main">
              <span>Per month</span>
              <strong>{dailyPrice ? formatLKR(monthly) : "—"}</strong>
            </div>
            <div className="ec-result-sub">
              <span>Per year</span>
              <strong>{dailyPrice ? formatLKR(yearly) : "—"}</strong>
            </div>

            <div className="ec-scenarios">
              <p>At {dailyPrice ? formatLKR(dailyPrice) : "your price"} per day, per year:</p>
              {SCENARIOS.map((d) => (
                <div key={d} className={`ec-scenario ${d === days ? "active" : ""}`}>
                  <span>{d} days/month</span>
                  <strong>{dailyPrice ? formatLKR(dailyPrice * d * 12) : "—"}</strong>
                </div>
              ))}
            </div>

            <Link to="/choose-listing-type" className="y-btn y-btn-white y-btn-block">
              List your vehicle free <ArrowRight size={18} />
            </Link>
          </section>
        </div>

        <p className="ec-note">
          <Info size={16} />
          These are estimates only, not a promise of earnings. Real earnings depend on your vehicle, location,
          season and price, and are before fuel, maintenance and other costs.
        </p>
      </div>

      <style>{`
        .ec-page { background: var(--bg); padding-bottom: 5rem; min-height: 100vh; }
        .ec-layout { display: grid; grid-template-columns: 1.1fr 1fr; gap: 1.5rem; align-items: start; }
        .ec-form { display: flex; flex-direction: column; gap: 1.4rem; }
        .ec-typical {
          align-self: flex-start; background: var(--primary-soft); border: 1px solid rgba(249,115,22,0.25);
          color: #9a3412; border-radius: 999px; padding: 0.4rem 0.9rem; font-size: 0.82rem; cursor: pointer; text-align: left;
        }
        .ec-days-value { color: var(--primary-dark); font-size: 1rem; }
        .ec-range { width: 100%; accent-color: #f97316; height: 28px; }
        .ec-range-scale { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-hint); }
        .ec-result {
          display: flex; flex-direction: column; gap: 1rem; padding: 1.75rem;
          border-radius: var(--radius-lg); background: var(--grad-hero); color: #fff; box-shadow: var(--shadow-glow);
        }
        .ec-result > .y-badge { align-self: flex-start; }
        .ec-result-main span, .ec-result-sub span { display: block; color: rgba(255,255,255,0.85); font-size: 0.9rem; }
        .ec-result-main strong { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 2.75rem); font-weight: 800; color: #fff; }
        .ec-result-sub strong { font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: #fff; }
        .ec-scenarios { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); border-radius: var(--radius); padding: 0.9rem 1rem; }
        .ec-scenarios p { color: rgba(255,255,255,0.9); font-size: 0.85rem; margin-bottom: 0.5rem; }
        .ec-scenario { display: flex; justify-content: space-between; padding: 0.35rem 0; font-size: 0.92rem; color: rgba(255,255,255,0.92); }
        .ec-scenario.active strong, .ec-scenario.active span { color: #fff; font-weight: 800; }
        .ec-note {
          display: flex; gap: 0.6rem; align-items: flex-start; max-width: 760px; margin: 1.5rem auto 0;
          font-size: 0.85rem; line-height: 1.6;
        }
        .ec-note svg { flex-shrink: 0; margin-top: 2px; color: var(--text-hint); }
        @media (max-width: 860px) { .ec-layout { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
