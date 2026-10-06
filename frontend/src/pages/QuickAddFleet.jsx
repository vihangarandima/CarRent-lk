import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Camera, Copy, Loader2, Plus, Trash2, CheckCircle2, X } from "lucide-react";
import { API_URL } from "../config";
import { useToast } from "../context/ToastContext";
import { DASHBOARD_PATH, getStoredUser, updateStoredUser } from "../utils/session";
import { uploadVehicleImage } from "../utils/uploadImage";

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

const BRANDS = [
  "Toyota", "Suzuki", "Honda", "Nissan", "Mitsubishi", "Mazda", "Hyundai", "Kia",
  "Micro", "Perodua", "Daihatsu", "Mercedes-Benz", "BMW", "Audi", "Bajaj", "TVS", "Yamaha", "Hero",
];

const MAX_ROWS = 50;
let rowSeq = 0;
const newRow = (defaults = {}) => ({
  key: ++rowSeq,
  vehicleType: "car",
  rentMode: "self-drive",
  brand: "",
  model: "",
  year: "",
  pricePerDay: "",
  fuelType: "",
  transmission: "",
  location: "",
  image: "",
  uploading: false,
  error: "",
  ...defaults,
});

// Client-side check mirroring the server, so mistakes show on the row before saving
const rowError = (r) => {
  const thisYear = new Date().getFullYear();
  if (!r.brand.trim() || !r.model.trim()) return "Brand and model are required";
  if (!(Number(r.year) >= 1950 && Number(r.year) <= thisYear + 1)) return "Enter a valid year";
  if (!(Number(r.pricePerDay) > 0)) return "Enter a daily price";
  if (!r.location.trim()) return "Location is required";
  return "";
};
const isBlank = (r) => !r.brand && !r.model && !r.year && !r.pricePerDay && !r.image;

export default function QuickAddFleet() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getStoredUser();
  const [defaultLocation, setDefaultLocation] = useState("");
  const [rows, setRows] = useState(() => [newRow(), newRow(), newRow()]);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const fileInputs = useRef({});

  useEffect(() => {
    if (!localStorage.getItem("token") || !user) {
      navigate(`/login?redirect=${encodeURIComponent("/fleet/quick-add")}`, { replace: true });
      return;
    }
    // Pre-fill location from the company address so most rows need no typing
    if (user.role === "company") {
      axios
        .get(`${API_URL}/api/companies/me`)
        .then((res) => {
          const addr = res.data?.address || "";
          if (addr) {
            setDefaultLocation(addr);
            setRows((prev) => prev.map((r) => (r.location ? r : { ...r, location: addr })));
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (key, changes) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...changes, error: changes.error ?? "" } : r)));

  const addRow = () => {
    if (rows.length >= MAX_ROWS) {
      toast.warning(`You can add up to ${MAX_ROWS} vehicles at a time.`);
      return;
    }
    setRows((prev) => [...prev, newRow({ location: defaultLocation })]);
  };

  // Copies everything except the photo, so "10 Toyota Axio" is one row + a few clicks
  const duplicateRow = (row) => {
    if (rows.length >= MAX_ROWS) {
      toast.warning(`You can add up to ${MAX_ROWS} vehicles at a time.`);
      return;
    }
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.key === row.key);
      const copy = newRow({ ...row, key: undefined, image: "", uploading: false, error: "" });
      copy.key = ++rowSeq;
      return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
    });
  };

  const removeRow = (key) =>
    setRows((prev) => (prev.length === 1 ? [newRow({ location: defaultLocation })] : prev.filter((r) => r.key !== key)));

  const handlePhoto = async (row, file) => {
    if (!file) return;
    update(row.key, { uploading: true });
    try {
      const url = await uploadVehicleImage(file);
      update(row.key, { image: url, uploading: false });
    } catch (err) {
      update(row.key, { uploading: false, error: err.message });
    }
  };

  const handleSave = async () => {
    const filled = rows.filter((r) => !isBlank(r));
    if (filled.length === 0) {
      toast.warning("Fill in at least one vehicle.");
      return;
    }
    if (rows.some((r) => r.uploading)) {
      toast.warning("Please wait for photos to finish uploading.");
      return;
    }
    // Show problems on the rows before sending anything
    setRows((prev) => prev.map((r) => (isBlank(r) ? r : { ...r, error: rowError(r) })));
    if (filled.some((r) => rowError(r))) {
      toast.warning("Some rows need fixing. They are marked in red.");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(`${API_URL}/api/vehicles/bulk`, {
        vehicles: filled.map((r) => ({
          vehicleType: r.vehicleType,
          brand: r.brand,
          model: r.model,
          year: Number(r.year),
          pricePerDay: Number(r.pricePerDay),
          fuelType: r.fuelType,
          transmission: r.transmission,
          rentMode: r.rentMode,
          location: r.location,
          images: r.image ? [r.image] : [],
        })),
      });
      applyResults(filled, res.data);
    } catch (err) {
      if (err.response?.data?.results) {
        applyResults(filled, err.response.data);
      } else {
        toast.error(err.response?.data?.msg || "Couldn't save. Please check your connection and try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Remove saved rows, keep failed ones with their error so they can be fixed and re-saved
  const applyResults = (sent, data) => {
    const failedByKey = {};
    data.results.forEach((r) => {
      if (!r.ok) failedByKey[sent[r.index].key] = r.msg;
    });
    const savedKeys = new Set(sent.filter((r) => !failedByKey[r.key]).map((r) => r.key));
    setRows((prev) => {
      const remaining = prev
        .filter((r) => !savedKeys.has(r.key))
        .map((r) => (failedByKey[r.key] ? { ...r, error: failedByKey[r.key] } : r));
      return remaining.length ? remaining : [newRow({ location: defaultLocation })];
    });
    if (data.listerRole && user && data.listerRole !== user.role) updateStoredUser({ role: data.listerRole });
    setSavedCount((n) => n + data.saved);
    if (data.saved) toast.success(`${data.saved} vehicle${data.saved === 1 ? "" : "s"} listed and live on the site.`);
    if (data.failed) toast.warning(`${data.failed} row${data.failed === 1 ? "" : "s"} could not be saved. See the red notes.`);
  };

  const filledCount = rows.filter((r) => !isBlank(r)).length;

  return (
    <div className="qa-page">
      <div className="qa-container">
        <div className="qa-head">
          <Link to={DASHBOARD_PATH} className="qa-back"><ArrowLeft size={16} /> Dashboard</Link>
          <span className="y-badge">Quick add</span>
          <h1>Add your fleet</h1>
          <p>One row per vehicle. Use <strong>Copy</strong> for vehicles that are the same model. Photos are optional now; you can add them later from your Fleet.</p>
        </div>

        {savedCount > 0 && (
          <div className="qa-success">
            <CheckCircle2 size={20} />
            <span><strong>{savedCount}</strong> vehicle{savedCount === 1 ? "" : "s"} added this session.</span>
            <Link to={DASHBOARD_PATH} className="y-btn y-btn-soft y-btn-sm">View fleet</Link>
          </div>
        )}

        <div className="qa-sheet" role="table" aria-label="Vehicles to add">
          <div className="qa-row qa-row-head" role="row">
            <span>Photo</span>
            <span>Type</span>
            <span>Brand</span>
            <span>Model</span>
            <span>Year</span>
            <span>Price / day (LKR)</span>
            <span>Fuel</span>
            <span>Gear</span>
            <span>Rent</span>
            <span>Location</span>
            <span />
          </div>

          {rows.map((r, i) => (
            <div key={r.key} className={`qa-row ${r.error ? "qa-row-error" : ""}`} role="row">
              <div className="qa-cell qa-photo-cell">
                <span className="qa-mobile-label">Vehicle {i + 1}</span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={(el) => { fileInputs.current[r.key] = el; }}
                  onChange={(e) => { handlePhoto(r, e.target.files?.[0]); e.target.value = ""; }}
                />
                <button
                  type="button"
                  className="qa-photo"
                  onClick={() => fileInputs.current[r.key]?.click()}
                  title={r.image ? "Change photo" : "Add photo"}
                  style={r.image ? { backgroundImage: `url(${r.image})` } : undefined}
                >
                  {r.uploading ? <Loader2 size={18} className="qa-spin" /> : !r.image && <Camera size={18} />}
                </button>
              </div>
              <label className="qa-cell">
                <span className="qa-mobile-label">Type</span>
                <select className="qa-input" value={r.vehicleType} onChange={(e) => update(r.key, { vehicleType: e.target.value })}>
                  {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </label>
              <label className="qa-cell">
                <span className="qa-mobile-label">Brand</span>
                <input className="qa-input" list="qa-brands" value={r.brand} placeholder="Toyota"
                  onChange={(e) => update(r.key, { brand: e.target.value })} />
              </label>
              <label className="qa-cell">
                <span className="qa-mobile-label">Model</span>
                <input className="qa-input" value={r.model} placeholder="Axio"
                  onChange={(e) => update(r.key, { model: e.target.value })} />
              </label>
              <label className="qa-cell">
                <span className="qa-mobile-label">Year</span>
                <input className="qa-input" type="number" inputMode="numeric" value={r.year} placeholder="2018"
                  onChange={(e) => update(r.key, { year: e.target.value })} />
              </label>
              <label className="qa-cell">
                <span className="qa-mobile-label">Price / day (LKR)</span>
                <input className="qa-input" type="number" inputMode="numeric" min="1" value={r.pricePerDay} placeholder="8000"
                  onChange={(e) => update(r.key, { pricePerDay: e.target.value })} />
              </label>
              <label className="qa-cell">
                <span className="qa-mobile-label">Fuel</span>
                <select className="qa-input" value={r.fuelType} onChange={(e) => update(r.key, { fuelType: e.target.value })}>
                  <option value="">—</option>
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>Hybrid</option>
                  <option>Electric</option>
                </select>
              </label>
              <label className="qa-cell">
                <span className="qa-mobile-label">Gear</span>
                <select className="qa-input" value={r.transmission} onChange={(e) => update(r.key, { transmission: e.target.value })}>
                  <option value="">—</option>
                  <option>Automatic</option>
                  <option>Manual</option>
                </select>
              </label>
              <label className="qa-cell">
                <span className="qa-mobile-label">Rent</span>
                <select className="qa-input" value={r.rentMode} onChange={(e) => update(r.key, { rentMode: e.target.value })}>
                  <option value="self-drive">Self-drive</option>
                  <option value="with-driver">With driver</option>
                  <option value="both">Both</option>
                </select>
              </label>
              <label className="qa-cell">
                <span className="qa-mobile-label">Location</span>
                <input className="qa-input" value={r.location} placeholder="Colombo 03"
                  onChange={(e) => update(r.key, { location: e.target.value })} />
              </label>
              <div className="qa-cell qa-actions">
                <button type="button" className="qa-icon-btn" onClick={() => duplicateRow(r)} title="Copy this row">
                  <Copy size={15} /> <span className="qa-mobile-only">Copy</span>
                </button>
                <button type="button" className="qa-icon-btn qa-icon-danger" onClick={() => removeRow(r.key)} title="Remove row">
                  <Trash2 size={15} /> <span className="qa-mobile-only">Remove</span>
                </button>
              </div>
              {r.error && (
                <p className="qa-row-msg"><X size={14} /> {r.error}</p>
              )}
            </div>
          ))}
          <datalist id="qa-brands">
            {BRANDS.map((b) => <option key={b} value={b} />)}
          </datalist>
        </div>

        <div className="qa-footer">
          <button type="button" className="y-btn y-btn-outline" onClick={addRow}>
            <Plus size={16} /> Add row
          </button>
          <div className="qa-footer-right">
            <Link to="/company-list-vehicle" className="qa-detailed-link">Use the detailed form instead</Link>
            <button type="button" className="y-btn y-btn-primary" onClick={handleSave} disabled={saving || filledCount === 0}>
              {saving ? "Saving..." : `Save ${filledCount || ""} vehicle${filledCount === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .qa-page { background: var(--bg); min-height: 100vh; padding: 110px 0 4rem; }
        .qa-container { max-width: 1400px; margin: 0 auto; padding: 0 1.25rem; }
        .qa-head { display: flex; flex-direction: column; align-items: flex-start; gap: 0.6rem; margin-bottom: 1.5rem; }
        .qa-head h1 { font-size: clamp(1.75rem, 3.5vw, 2.4rem); font-weight: 800; }
        .qa-head p { max-width: 720px; }
        .qa-back { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-weight: 600; font-size: 0.9rem; }
        .qa-back:hover { color: var(--primary-dark); }
        .qa-success {
          display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
          padding: 0.8rem 1rem; margin-bottom: 1rem; border-radius: var(--radius);
          background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46;
        }
        .qa-success span { flex: 1; }

        .qa-sheet { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); overflow: hidden; }
        .qa-row {
          display: grid;
          grid-template-columns: 52px 120px minmax(100px, 1fr) minmax(100px, 1fr) 76px 120px 96px 108px 122px minmax(110px, 1.1fr) 76px;
          gap: 8px; align-items: center; padding: 8px 12px; border-top: 1px solid #f1f5f9;
        }
        .qa-row-head {
          border-top: none; background: #fafaf9; padding-top: 12px; padding-bottom: 12px;
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted);
        }
        .qa-row-error { background: #fff5f5; }
        .qa-cell { display: flex; flex-direction: column; min-width: 0; }
        .qa-mobile-label, .qa-mobile-only { display: none; }
        .qa-input {
          width: 100%; min-width: 0; padding: 0.55rem 0.6rem; border: 1.5px solid var(--border); border-radius: 10px;
          background: #fff; font-family: var(--font-body); font-size: 15px; color: var(--text); outline: none;
        }
        .qa-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(249,115,22,0.12); }
        .qa-photo {
          width: 44px; height: 44px; border-radius: 10px; border: 1.5px dashed #cbd5e1; background: #f8fafc center / cover no-repeat;
          color: var(--text-hint); display: grid; place-items: center; cursor: pointer;
        }
        .qa-photo:hover { border-color: var(--primary); color: var(--primary); }
        .qa-spin { animation: qa-spin 0.8s linear infinite; }
        @keyframes qa-spin { to { transform: rotate(360deg); } }
        .qa-actions { flex-direction: row; gap: 6px; justify-content: flex-end; }
        .qa-icon-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 4px;
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: #fff; color: #475569;
        }
        .qa-icon-btn:hover { border-color: var(--primary); color: var(--primary-dark); }
        .qa-icon-danger:hover { border-color: #ef4444; color: #ef4444; }
        .qa-row-msg { grid-column: 1 / -1; display: flex; align-items: center; gap: 4px; color: #b91c1c; font-size: 0.82rem; font-weight: 600; margin: 0; }

        .qa-footer { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; }
        .qa-footer-right { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .qa-detailed-link { color: var(--text-muted); font-size: 0.88rem; text-decoration: underline; }

        /* Phones and tablets: each vehicle becomes a compact card */
        @media (max-width: 1100px) {
          .qa-page { padding-top: 96px; }
          .qa-sheet { background: transparent; border: none; box-shadow: none; display: flex; flex-direction: column; gap: 0.75rem; }
          .qa-row-head { display: none; }
          .qa-row {
            grid-template-columns: 1fr 1fr; gap: 10px; padding: 14px; border: 1px solid var(--border);
            border-radius: var(--radius); background: #fff; box-shadow: var(--shadow-sm);
          }
          .qa-row-error { background: #fff5f5; border-color: #fecaca; }
          .qa-mobile-label { display: block; font-size: 0.72rem; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; }
          .qa-photo-cell { grid-column: 1 / -1; flex-direction: row; align-items: center; justify-content: space-between; }
          .qa-photo-cell .qa-mobile-label { font-size: 0.9rem; color: var(--text); font-weight: 800; margin: 0; }
          .qa-photo { width: 56px; height: 56px; }
          .qa-actions { grid-column: 1 / -1; justify-content: stretch; }
          .qa-icon-btn { flex: 1; width: auto; height: 38px; }
          .qa-mobile-only { display: inline; }
          .qa-input { font-size: 16px; padding: 0.65rem 0.7rem; }
          .qa-footer { position: sticky; bottom: 0; background: var(--bg); padding: 0.75rem 0; }
          .qa-footer > .y-btn, .qa-footer-right, .qa-footer-right .y-btn { flex: 1 1 auto; }
          .qa-detailed-link { width: 100%; text-align: center; order: 2; }
        }
      `}</style>
    </div>
  );
}
