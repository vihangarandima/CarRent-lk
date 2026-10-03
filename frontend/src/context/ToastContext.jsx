import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ArrowRight,
  Sparkles,
  Car,
  Trash2,
  HelpCircle,
  Loader2,
} from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [modalState, setModalState] = useState(null); // { type, title, message, ... }

  // -------------------------------------------------------------
  // TOAST METHODS
  // -------------------------------------------------------------
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = "info", title, message, duration = 4500 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast = { id, type, title, message, duration, createdAt: Date.now() };

      setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (message, title = "Success") =>
      addToast({ type: "success", title, message }),
    error: (message, title = "Error") =>
      addToast({ type: "error", title, message, duration: 6000 }),
    warning: (message, title = "Warning") =>
      addToast({ type: "warning", title, message, duration: 5000 }),
    info: (message, title = "Notice") =>
      addToast({ type: "info", title, message }),
  };

  // -------------------------------------------------------------
  // SUCCESS / CELEBRATION MODAL
  // -------------------------------------------------------------
  const showSuccessModal = useCallback(
    ({
      title = "Vehicle Listed Successfully!",
      badge = "Ready for Bookings",
      message = "Your vehicle is now live and visible to thousands of travelers across Sri Lanka.",
      primaryText = "Go to Dashboard",
      onPrimary,
      secondaryText = "View Fleet",
      onSecondary,
      autoRedirectUrl = null,
      autoRedirectSeconds = 0,
      vehicleInfo = null,
    }) => {
      setModalState({
        type: "success_celebration",
        title,
        badge,
        message,
        primaryText,
        onPrimary,
        secondaryText,
        onSecondary,
        autoRedirectUrl,
        autoRedirectSeconds,
        vehicleInfo,
      });
    },
    []
  );

  // -------------------------------------------------------------
  // CONFIRMATION MODAL (Promise-based)
  // -------------------------------------------------------------
  const confirm = useCallback(
    ({
      title = "Are you sure?",
      message = "Do you want to proceed with this action?",
      confirmText = "Confirm",
      cancelText = "Cancel",
      isDestructive = false,
      icon = null,
    }) => {
      return new Promise((resolve) => {
        setModalState({
          type: "confirm",
          title,
          message,
          confirmText,
          cancelText,
          isDestructive,
          icon,
          onConfirm: () => {
            setModalState(null);
            resolve(true);
          },
          onCancel: () => {
            setModalState(null);
            resolve(false);
          },
        });
      });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModalState(null);
  }, []);

  // Gracefully handle native alert override in browser environment
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      const str = typeof msg === "object" ? JSON.stringify(msg) : String(msg);
      if (str.toLowerCase().includes("success") || str.toLowerCase().includes("listed")) {
        toast.success(str);
      } else if (
        str.toLowerCase().includes("error") ||
        str.toLowerCase().includes("failed") ||
        str.toLowerCase().includes("denied")
      ) {
        toast.error(str);
      } else {
        toast.info(str);
      }
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toast,
        showSuccessModal,
        confirm,
        closeModal,
      }}
    >
      {children}

      {/* Floating Toast Container */}
      <div className="toast-portal" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item toast-${t.type}`}>
            <div className="toast-icon-wrap">
              {t.type === "success" && <CheckCircle2 size={20} className="text-emerald" />}
              {t.type === "error" && <AlertCircle size={20} className="text-rose" />}
              {t.type === "warning" && <AlertTriangle size={20} className="text-amber" />}
              {t.type === "info" && <Info size={20} className="text-blue" />}
            </div>

            <div className="toast-content">
              {t.title && <div className="toast-title">{t.title}</div>}
              <div className="toast-msg">{t.message}</div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="toast-close-btn"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>

            {t.duration > 0 && (
              <div
                className="toast-progress-bar"
                style={{ animationDuration: `${t.duration}ms` }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Modern Modal System */}
      {modalState && modalState.type === "success_celebration" && (
        <div className="modal-backdrop-premium" onClick={closeModal}>
          <div
            className="modal-card-celebration"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti / Sparkle Decor */}
            <div className="sparkle-particles">
              <span className="particle p1" />
              <span className="particle p2" />
              <span className="particle p3" />
              <span className="particle p4" />
              <span className="particle p5" />
              <span className="particle p6" />
            </div>

            <button className="modal-close-icon" onClick={closeModal} aria-label="Close">
              <X size={18} />
            </button>

            {/* Glowing Icon Badge */}
            <div className="celebration-badge-container">
              <div className="badge-pulse-glow" />
              <div className="celebration-badge">
                <Car size={34} className="car-icon" />
                <div className="check-sub-badge">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>

            <div className="celebration-pill">
              <Sparkles size={14} />
              <span>{modalState.badge || "Live on Platform"}</span>
            </div>

            <h2 className="celebration-title">{modalState.title}</h2>
            <p className="celebration-desc">{modalState.message}</p>

            {modalState.vehicleInfo && (
              <div className="celebration-vehicle-preview">
                <div className="vp-title">
                  {modalState.vehicleInfo.brand} {modalState.vehicleInfo.model}
                </div>
                <div className="vp-meta">
                  <span>{modalState.vehicleInfo.location || "Colombo"}</span>
                  <span className="vp-dot">•</span>
                  <span>Rs. {Number(modalState.vehicleInfo.pricePerDay || 0).toLocaleString()} / day</span>
                </div>
              </div>
            )}

            <div className="celebration-actions">
              <button
                className="btn-celebration-primary"
                onClick={() => {
                  closeModal();
                  if (modalState.onPrimary) modalState.onPrimary();
                }}
              >
                <span>{modalState.primaryText || "Go to Dashboard"}</span>
                <ArrowRight size={18} />
              </button>

              {modalState.secondaryText && (
                <button
                  className="btn-celebration-secondary"
                  onClick={() => {
                    closeModal();
                    if (modalState.onSecondary) modalState.onSecondary();
                  }}
                >
                  {modalState.secondaryText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {modalState && modalState.type === "confirm" && (
        <div className="modal-backdrop-premium" onClick={modalState.onCancel}>
          <div
            className="modal-card-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`confirm-icon-wrap ${
                modalState.isDestructive ? "destructive" : "neutral"
              }`}
            >
              {modalState.icon ? (
                modalState.icon
              ) : modalState.isDestructive ? (
                <Trash2 size={26} />
              ) : (
                <HelpCircle size={26} />
              )}
            </div>

            <h3 className="confirm-title">{modalState.title}</h3>
            <p className="confirm-message">{modalState.message}</p>

            <div className="confirm-actions">
              <button
                type="button"
                className="btn-confirm-cancel"
                onClick={modalState.onCancel}
              >
                {modalState.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                className={`btn-confirm-submit ${
                  modalState.isDestructive ? "destructive" : "primary"
                }`}
                onClick={modalState.onConfirm}
              >
                {modalState.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* =========================================================
           TOAST NOTIFICATIONS (TOP RIGHT FLOATING)
           ========================================================= */
        .toast-portal {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 420px;
          width: calc(100vw - 32px);
          pointer-events: none;
        }

        .toast-item {
          pointer-events: auto;
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 14px;
          background: rgba(24, 24, 27, 0.94);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: #f4f4f5;
          box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.08);
          overflow: hidden;
          animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          font-family: var(--font-body, system-ui, sans-serif);
        }

        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .toast-icon-wrap {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .toast-content {
          flex: 1;
          min-width: 0;
        }

        .toast-title {
          font-weight: 700;
          font-size: 0.92rem;
          color: #ffffff;
          margin-bottom: 2px;
          letter-spacing: -0.01em;
        }

        .toast-msg {
          font-size: 0.86rem;
          color: #d4d4d8;
          line-height: 1.45;
          word-break: break-word;
        }

        .toast-close-btn {
          flex-shrink: 0;
          background: transparent;
          border: none;
          color: #a1a1aa;
          cursor: pointer;
          padding: 4px;
          margin: -2px -4px 0 0;
          border-radius: 6px;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toast-close-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
        }

        .toast-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: currentColor;
          opacity: 0.6;
          width: 100%;
          animation: toastProgress linear forwards;
          transform-origin: left;
        }

        @keyframes toastProgress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }

        .toast-success {
          border-left: 3px solid #10b981;
          color: #34d399;
        }
        .toast-success .text-emerald {
          color: #10b981;
        }

        .toast-error {
          border-left: 3px solid #ef4444;
          color: #f87171;
        }
        .toast-error .text-rose {
          color: #ef4444;
        }

        .toast-warning {
          border-left: 3px solid #f59e0b;
          color: #fbbf24;
        }
        .toast-warning .text-amber {
          color: #f59e0b;
        }

        .toast-info {
          border-left: 3px solid #3b82f6;
          color: #60a5fa;
        }
        .toast-info .text-blue {
          color: #3b82f6;
        }

        /* =========================================================
           PREMIUM MODAL BACKDROP & CELEBRATION
           ========================================================= */
        .modal-backdrop-premium {
          position: fixed;
          inset: 0;
          z-index: 10001;
          background: rgba(15, 12, 10, 0.65);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: backdropFade 0.25s ease-out forwards;
        }

        @keyframes backdropFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-card-celebration {
          position: relative;
          background: #1c1917;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 28px;
          padding: 44px 36px 36px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          color: #ffffff;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.6),
            0 0 40px rgba(249, 115, 22, 0.18);
          animation: cardPopIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          overflow: hidden;
          font-family: var(--font-body, system-ui, sans-serif);
        }

        @keyframes cardPopIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-close-icon {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #a8a29e;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-close-icon:hover {
          background: rgba(255, 255, 255, 0.18);
          color: #ffffff;
          transform: rotate(90deg);
        }

        .celebration-badge-container {
          position: relative;
          width: 88px;
          height: 88px;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .badge-pulse-glow {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.45) 0%, rgba(249, 115, 22, 0) 70%);
          animation: glowPulse 2.2s infinite ease-in-out;
        }

        @keyframes glowPulse {
          0%, 100% {
            transform: scale(0.95);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.9;
          }
        }

        .celebration-badge {
          position: relative;
          width: 76px;
          height: 76px;
          border-radius: 22px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 10px 25px rgba(234, 88, 12, 0.45);
        }

        .car-icon {
          animation: carBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes carBounce {
          0% {
            transform: scale(0.5) translateY(10px);
          }
          70% {
            transform: scale(1.15) translateY(-3px);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }

        .check-sub-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          border: 3px solid #1c1917;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);
        }

        .celebration-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 999px;
          background: rgba(249, 115, 22, 0.15);
          border: 1px solid rgba(249, 115, 22, 0.3);
          color: #fb923c;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .celebration-title {
          font-family: var(--font-display, system-ui, sans-serif);
          font-size: 1.7rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 10px;
          letter-spacing: -0.02em;
          line-height: 1.25;
        }

        .celebration-desc {
          font-size: 0.96rem;
          color: #a8a29e;
          line-height: 1.55;
          margin-bottom: 24px;
          max-width: 380px;
          margin-left: auto;
          margin-right: auto;
        }

        .celebration-vehicle-preview {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 12px 18px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
        }

        .vp-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: #ffffff;
        }

        .vp-meta {
          font-size: 0.84rem;
          color: #f97316;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }

        .vp-dot {
          color: #78716c;
        }

        .celebration-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn-celebration-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px 24px;
          border-radius: 14px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #ffffff;
          font-size: 1rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 24px rgba(234, 88, 12, 0.35);
        }

        .btn-celebration-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(234, 88, 12, 0.5);
          filter: brightness(1.05);
        }

        .btn-celebration-secondary {
          width: 100%;
          padding: 12px 20px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.08);
          color: #d6d3d1;
          font-size: 0.92rem;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-celebration-secondary:hover {
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
        }

        /* Particles animation */
        .sparkle-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f97316;
          opacity: 0;
          animation: particleFly 2s ease-out infinite;
        }

        .particle.p1 {
          top: 20%;
          left: 15%;
          background: #f97316;
          animation-delay: 0.1s;
        }
        .particle.p2 {
          top: 15%;
          right: 20%;
          background: #10b981;
          animation-delay: 0.4s;
        }
        .particle.p3 {
          bottom: 30%;
          left: 10%;
          background: #eab308;
          animation-delay: 0.7s;
        }
        .particle.p4 {
          bottom: 25%;
          right: 12%;
          background: #38bdf8;
          animation-delay: 1s;
        }
        .particle.p5 {
          top: 40%;
          left: 8%;
          background: #fb7185;
          animation-delay: 1.3s;
        }
        .particle.p6 {
          top: 35%;
          right: 10%;
          background: #fb923c;
          animation-delay: 1.6s;
        }

        @keyframes particleFly {
          0% {
            transform: scale(0) translateY(0);
            opacity: 0;
          }
          30% {
            opacity: 0.9;
          }
          100% {
            transform: scale(1.5) translateY(-25px);
            opacity: 0;
          }
        }

        /* =========================================================
           CONFIRMATION MODAL
           ========================================================= */
        .modal-card-confirm {
          position: relative;
          background: #1c1917;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 32px 28px;
          max-width: 420px;
          width: 100%;
          text-align: center;
          color: #ffffff;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
          animation: cardPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          font-family: var(--font-body, system-ui, sans-serif);
        }

        .confirm-icon-wrap {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .confirm-icon-wrap.destructive {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .confirm-icon-wrap.neutral {
          background: rgba(249, 115, 22, 0.15);
          color: #f97316;
          border: 1px solid rgba(249, 115, 22, 0.25);
        }

        .confirm-title {
          font-size: 1.35rem;
          font-weight: 750;
          margin-bottom: 8px;
          color: #ffffff;
        }

        .confirm-message {
          font-size: 0.92rem;
          color: #a8a29e;
          line-height: 1.5;
          margin-bottom: 24px;
        }

        .confirm-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .btn-confirm-cancel {
          padding: 12px 18px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #d6d3d1;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-confirm-cancel:hover {
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
        }

        .btn-confirm-submit {
          padding: 12px 18px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          color: #ffffff;
        }

        .btn-confirm-submit.primary {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
        }

        .btn-confirm-submit.primary:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

        .btn-confirm-submit.destructive {
          background: #ef4444;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
        }

        .btn-confirm-submit.destructive:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};
