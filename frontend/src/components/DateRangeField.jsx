import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

// "yyyy-mm-dd" <-> local Date (no UTC shift)
export const toDay = (value) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || "");
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};
export const toInputValue = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Field text stays short so it fits narrow search bars; the spoken label keeps the weekday
const fmt = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const fmtLong = (d) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
const PHONE_QUERY = "(max-width: 640px)";

/**
 * One date-range picker for the whole site.
 * Values are "yyyy-mm-dd" strings; onChange receives { from, to }.
 * variant "bare" sits inside an existing styled field, "boxed" looks like a form input.
 */
const DateRangeField = ({
  from = "",
  to = "",
  onChange,
  minDate,
  placeholder = "Add dates",
  variant = "boxed",
  id,
  ariaLabel = "Choose dates",
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState([toDay(from), toDay(to)]);
  const [pos, setPos] = useState(null);
  const [isPhone, setIsPhone] = useState(() => typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches);
  const triggerRef = useRef(null);
  const popRef = useRef(null);

  const start = toDay(from);
  const end = toDay(to) || start;
  const days = start && end ? Math.round((end - start) / 86400000) + 1 : 0;

  // Keep the calendar in step with the value while it's closed
  useEffect(() => {
    if (!open) setDraft([toDay(from), toDay(to)]);
  }, [from, to, open]);

  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const update = () => setIsPhone(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Desktop: float under the field, kept inside the window
  useLayoutEffect(() => {
    if (!open || isPhone) return undefined;
    const place = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      const width = 320;
      const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
      const below = r.bottom + 8;
      const tooLow = below + 400 > window.innerHeight && r.top > 420;
      setPos({ left, top: tooLow ? r.top - 8 : below, above: tooLow });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, isPhone]);

  // Close on Escape or a click outside
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onDown = (e) => {
      if (popRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  const commit = ([s, e]) => onChange({ from: toInputValue(s), to: toInputValue(e || s) });

  const handleSelect = (range) => {
    setDraft(range);
    const [s, e] = range;
    if (s && e) {
      commit(range);
      setOpen(false);
    }
  };

  const [dStart, dEnd] = draft;
  const hint = !dStart ? "Tap your first day" : !dEnd ? "Now tap your last day (or the same day again)" : "";

  const popover = open && (
    <>
      {isPhone && <div className="drf-scrim" aria-hidden="true" />}
      <div
        ref={popRef}
        className={`drf-pop ${isPhone ? "drf-sheet" : ""}`}
        role="dialog"
        aria-label={ariaLabel}
        style={!isPhone && pos ? { left: pos.left, top: pos.top, transform: pos.above ? "translateY(-100%)" : undefined } : undefined}
      >
        {isPhone && (
          <div className="drf-sheet-head">
            <strong>{ariaLabel}</strong>
            <button type="button" className="drf-icon-btn" onClick={() => setOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        )}
        <DatePicker
          inline
          selectsRange
          selected={dStart}
          startDate={dStart}
          endDate={dEnd}
          onChange={handleSelect}
          minDate={minDate}
          renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
            <div className="drf-head">
              <button type="button" className="drf-icon-btn" onClick={decreaseMonth} disabled={prevMonthButtonDisabled} aria-label="Previous month">
                <ChevronLeft size={16} />
              </button>
              <span>{date.toLocaleString("en-GB", { month: "long", year: "numeric" })}</span>
              <button type="button" className="drf-icon-btn" onClick={increaseMonth} disabled={nextMonthButtonDisabled} aria-label="Next month">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        />
        <div className="drf-foot">
          <span className="drf-hint">{hint}</span>
          <div className="drf-actions">
            {(dStart || from) && (
              <button
                type="button"
                className="drf-text-btn"
                onClick={() => {
                  setDraft([null, null]);
                  onChange({ from: "", to: "" });
                }}
              >
                Clear
              </button>
            )}
            <button
              type="button"
              className="drf-done-btn"
              onClick={() => {
                if (dStart) commit(draft);
                setOpen(false);
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className={`drf-trigger drf-${variant} ${start ? "has-value" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={start ? `${ariaLabel}: ${fmtLong(start)} to ${fmtLong(end)}` : ariaLabel}
      >
        <Calendar size={16} className="drf-icon" aria-hidden="true" />
        {start ? (
          <span className="drf-value">
            <span className="drf-range">
              {fmt(start)}
              {days > 1 && <> → {fmt(end)}</>}
            </span>
            <span className="drf-days">{days} day{days > 1 ? "s" : ""}</span>
          </span>
        ) : (
          <span className="drf-placeholder">{placeholder}</span>
        )}
      </button>
      {popover && createPortal(popover, document.body)}

      <style>{`
        .drf-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          min-width: 0;
          border: none;
          background: transparent;
          padding: 0;
          font: inherit;
          text-align: left;
          cursor: pointer;
          color: #0f172a;
        }
        .drf-boxed {
          height: 42px;
          padding: 0 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          background: #ffffff;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .drf-boxed:hover { border-color: #cbd5e1; }
        .drf-boxed[aria-expanded="true"] {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
        }
        .drf-icon { color: #f97316; flex-shrink: 0; }
        .drf-bare .drf-icon { display: none; }
        .drf-placeholder {
          color: #94a3b8;
          font-weight: 500;
          font-size: 0.92rem;
          white-space: nowrap;
        }
        .drf-value {
          display: flex;
          align-items: baseline;
          gap: 8px;
          min-width: 0;
        }
        .drf-range {
          font-size: 0.9rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .drf-days {
          flex-shrink: 0;
          font-size: 0.74rem;
          font-weight: 700;
          color: #c2410c;
          background: #fff7ed;
          border-radius: 999px;
          padding: 1px 7px;
        }

        .drf-scrim {
          position: fixed;
          inset: 0;
          z-index: 10040;
          background: rgba(15, 23, 42, 0.45);
        }
        .drf-pop {
          position: fixed;
          z-index: 10050;
          width: 320px;
          padding: 12px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 45px -12px rgba(15, 23, 42, 0.3);
          font-family: inherit;
        }
        .drf-sheet {
          left: 0 !important;
          right: 0;
          bottom: 0;
          top: auto !important;
          width: auto;
          padding: 12px 16px calc(16px + env(safe-area-inset-bottom, 0px));
          border-radius: 20px 20px 0 0;
          animation: drfUp 0.2s ease;
        }
        @keyframes drfUp { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
        .drf-sheet-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 1rem;
          color: #0f172a;
        }
        .drf-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2px 4px 8px;
          font-weight: 800;
          font-size: 0.95rem;
          color: #0f172a;
        }
        .drf-icon-btn {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #ffffff;
          color: #334155;
          cursor: pointer;
        }
        .drf-icon-btn:disabled { opacity: 0.35; cursor: default; }

        .drf-pop .react-datepicker {
          width: 100%;
          border: none;
          font-family: inherit;
          background: transparent;
        }
        .drf-pop .react-datepicker__month-container { width: 100%; float: none; }
        .drf-pop .react-datepicker__header {
          background: transparent;
          border: none;
          padding: 0;
        }
        .drf-pop .react-datepicker__day-names,
        .drf-pop .react-datepicker__week {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        .drf-pop .react-datepicker__day-name {
          width: auto;
          margin: 0;
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .drf-pop .react-datepicker__month { margin: 4px 0 0; }
        .drf-pop .react-datepicker__day {
          width: auto;
          height: 40px;
          margin: 2px 0;
          line-height: 40px;
          border-radius: 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: #0f172a;
        }
        .drf-pop .react-datepicker__day:hover { background: #fff7ed; border-radius: 10px; }
        .drf-pop .react-datepicker__day--outside-month { color: #cbd5e1; }
        .drf-pop .react-datepicker__day--disabled { color: #d6dbe3; cursor: not-allowed; }
        .drf-pop .react-datepicker__day--disabled:hover { background: transparent; }
        .drf-pop .react-datepicker__day--today { color: #ea580c; font-weight: 800; }
        .drf-pop .react-datepicker__day--keyboard-selected { background: transparent; }
        .drf-pop .react-datepicker__day--in-range,
        .drf-pop .react-datepicker__day--in-selecting-range {
          background: #ffedd5;
          color: #9a3412;
        }
        .drf-pop .react-datepicker__day--selected,
        .drf-pop .react-datepicker__day--range-start,
        .drf-pop .react-datepicker__day--range-end,
        .drf-pop .react-datepicker__day--selecting-range-start {
          background: #f97316 !important;
          color: #ffffff !important;
          border-radius: 10px;
        }

        .drf-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 8px;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
        }
        .drf-hint { font-size: 0.78rem; color: #64748b; }
        .drf-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; }
        .drf-text-btn {
          border: none;
          background: none;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 8px 10px;
          cursor: pointer;
        }
        .drf-done-btn {
          border: none;
          border-radius: 10px;
          background: #f97316;
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 800;
          padding: 9px 16px;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default DateRangeField;
