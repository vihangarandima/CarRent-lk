import React, { useEffect, useRef } from "react";
import { useSiteConfig } from "../../context/SiteConfigContext";

/**
 * Vesak Festival Celebration Accessories Component
 * Renders the authentic Sri Lankan Octagonal Vesak Kudu (Lantern), Sacred Blooming Lotus,
 * Buddhist Flag, Top Illuminated Festive Garland, and Ascending Golden Light Particles.
 * Non-destructive: Does not alter brand colors or layout.
 */
const VesakAccessories = ({ previewConfig = null, isVirtualPreview = false }) => {
  const { config: globalConfig } = useSiteConfig();
  const config = previewConfig || globalConfig;

  const festivalData = config?.global?.festivalTheme;
  const isVesakActive = festivalData?.active === "vesak";

  if (!isVesakActive) return null;

  const vesakOptions = festivalData?.vesak || {
    showLantern: true,
    lanternPosition: "top-right",
    showLotus: true,
    lotusPosition: "bottom-left",
    showFlag: true,
    flagPosition: "top-left",
    showLightString: true,
    showParticles: true,
  };

  const {
    showLantern = true,
    lanternPosition = "top-right",
    showLotus = true,
    lotusPosition = "bottom-left",
    showFlag = true,
    flagPosition = "top-left",
    showLightString = true,
    showParticles = true,
  } = vesakOptions;

  const canvasRef = useRef(null);

  // Floating Golden Pahan Embers / Light Particles Canvas Effect
  useEffect(() => {
    if (!showParticles || isVirtualPreview) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const particleColors = [
      "#FFD700",
      "#FFB300",
      "#FF9800",
      "#FF7043",
      "#FFEE58",
      "#FFFFFF",
    ];

    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.8 + 1.2,
      speedY: -(Math.random() * 0.9 + 0.35),
      speedX: Math.random() * 0.6 - 0.3,
      opacity: Math.random() * 0.75 + 0.25,
      pulseSpeed: Math.random() * 0.025 + 0.01,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.015) * 0.45 + p.speedX;
        p.opacity += Math.sin(p.y * p.pulseSpeed) * 0.018;

        if (p.y < -15) {
          p.y = height + 15;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0.12, Math.min(0.9, p.opacity));
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [showParticles, isVirtualPreview]);

  return (
    <div
      className={`vesak-festival-overlay ${isVirtualPreview ? "virtual-preview-mode" : ""}`}
      aria-hidden="true"
    >
      {/* 1. Ascending Golden Light Particles Canvas */}
      {showParticles && !isVirtualPreview && (
        <canvas ref={canvasRef} className="vesak-particles-canvas" />
      )}

      {/* 2. Top Illuminated Vesak Torana Garland (Buddhist Sacred Flag Colors) */}
      {showLightString && (
        <div className="vesak-lights-garland" title="Vesak Illumination Garland">
          <div className="vesak-lights-wire" />
          <div className="vesak-bulbs-container">
            {Array.from({ length: 22 }).map((_, idx) => {
              // 6 Buddhist sacred flag colors sequence
              const colors = [
                { hex: "#2563EB", glow: "rgba(37,99,235,0.8)", label: "Nila (Blue)" },
                { hex: "#FACC15", glow: "rgba(250,204,21,0.85)", label: "Pita (Yellow)" },
                { hex: "#DC2626", glow: "rgba(220,38,38,0.8)", label: "Lohita (Red)" },
                { hex: "#FFFFFF", glow: "rgba(255,255,255,0.9)", label: "Odata (White)" },
                { hex: "#EA580C", glow: "rgba(234,88,12,0.85)", label: "Manjettha (Orange)" },
              ];
              const c = colors[idx % colors.length];
              return (
                <div
                  key={idx}
                  className="vesak-bulb-item"
                  style={{
                    animationDelay: `${(idx % 5) * 0.45}s`,
                  }}
                >
                  <div className="vesak-bulb-cap" />
                  <div
                    className="vesak-bulb-glass"
                    style={{
                      backgroundColor: c.hex,
                      boxShadow: `0 0 10px 2px ${c.glow}`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Waving Buddhist Flag (Sadaham Kodiy) */}
      {showFlag && (
        <div
          className={`vesak-flag-wrapper flag-pos-${flagPosition}`}
          title="Buddhist Flag (Sadaham Kodiy)"
        >
          <svg
            id="flag-svg-element"
            className="vesak-flag-svg"
            viewBox="0 0 280 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Flag Pole */}
            <rect x="12" y="10" width="6" height="160" rx="3" fill="#D1D5DB" />
            <circle cx="15" cy="10" r="6" fill="#F59E0B" />

            {/* WAVING FLAG FABRIC GROUP */}
            <g className="animate-flag-fabric">
              {/* Stripe 1: Blue (Nila) */}
              <rect x="18" y="20" width="36" height="100" fill="#2563EB" />
              {/* Stripe 2: Yellow (Pita) */}
              <rect x="54" y="20" width="36" height="100" fill="#FACC15" />
              {/* Stripe 3: Red (Lohita) */}
              <rect x="90" y="20" width="36" height="100" fill="#DC2626" />
              {/* Stripe 4: White (Odata) */}
              <rect x="126" y="20" width="36" height="100" fill="#FFFFFF" />
              {/* Stripe 5: Orange (Manjettha) */}
              <rect x="162" y="20" width="36" height="100" fill="#EA580C" />

              {/* Stripe 6: Composite (Prabhasvara) - 5 horizontal bars */}
              <g>
                <rect x="198" y="20" width="36" height="20" fill="#2563EB" />
                <rect x="198" y="40" width="36" height="20" fill="#FACC15" />
                <rect x="198" y="60" width="36" height="20" fill="#DC2626" />
                <rect x="198" y="80" width="36" height="20" fill="#FFFFFF" />
                <rect x="198" y="100" width="36" height="20" fill="#EA580C" />
              </g>

              {/* Cloth Wave Shimmer Overlay */}
              <path
                className="animate-shimmer-pass"
                d="M 18 20 Q 80 10 130 20 Q 180 30 234 20 L 234 120 Q 180 130 130 120 Q 80 110 18 120 Z"
                fill="white"
                opacity="0.15"
              />
            </g>
          </svg>
        </div>
      )}

      {/* 4. Octagonal Vesak Lantern (Vesak Kudu) */}
      {showLantern && (
        <div
          className={`vesak-lantern-wrapper lantern-pos-${lanternPosition}`}
          title="Traditional Vesak Lantern"
        >
          <svg
            id="vesak-lantern-svg-element"
            className="vesak-lantern-svg animate-lantern-body"
            viewBox="0 0 260 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Panel Gradients */}
              <linearGradient
                id="goldCore"
                x1="130"
                y1="60"
                x2="130"
                y2="160"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>

              <linearGradient
                id="bluePanel"
                x1="60"
                y1="80"
                x2="100"
                y2="140"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>

              <linearGradient
                id="pinkPanel"
                x1="160"
                y1="80"
                x2="200"
                y2="140"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#BE185D" />
              </linearGradient>

              <linearGradient
                id="orangePanel"
                x1="100"
                y1="60"
                x2="160"
                y2="160"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FDBA74" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>

              <radialGradient id="candleGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#FDE047" />
                <stop offset="80%" stopColor="#F59E0B" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
              </radialGradient>

              <filter id="lanternGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Hanging String & Top Ring */}
            <line
              x1="130"
              y1="0"
              x2="130"
              y2="35"
              stroke="#FDE047"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <circle cx="130" cy="35" r="5" fill="none" stroke="#F59E0B" strokeWidth="2" />

            {/* TOP PYRAMID HOOD */}
            <polygon
              points="130,38 90,70 170,70"
              fill="#EA580C"
              stroke="#FEF08A"
              strokeWidth="1.5"
            />
            <polygon points="130,38 130,70 170,70" fill="#C2410C" opacity="0.4" />

            {/* INNER GLOWING CANDLE CORE */}
            <circle
              className="animate-lantern-core-glow"
              cx="130"
              cy="110"
              r="45"
              fill="url(#candleGlow)"
            />

            {/* OCTAGONAL LANTERN MAIN BODY */}
            {/* Side Left Panel */}
            <polygon
              points="90,70 60,110 90,150 100,110"
              fill="url(#bluePanel)"
              stroke="#FEF08A"
              strokeWidth="1.5"
            />
            {/* Side Right Panel */}
            <polygon
              points="170,70 200,110 170,150 160,110"
              fill="url(#pinkPanel)"
              stroke="#FEF08A"
              strokeWidth="1.5"
            />
            {/* Center Main Panel */}
            <polygon
              points="130,70 100,110 130,150 160,110"
              fill="url(#goldCore)"
              stroke="#FFF"
              strokeWidth="2"
              filter="url(#lanternGlow)"
            />

            {/* Surrounding Triangle Petals (Vesak Flower Cutouts) */}
            <polygon
              points="90,70 130,70 100,110"
              fill="url(#orangePanel)"
              stroke="#FEF08A"
              strokeWidth="1"
              opacity="0.9"
            />
            <polygon
              points="170,70 130,70 160,110"
              fill="url(#orangePanel)"
              stroke="#FEF08A"
              strokeWidth="1"
              opacity="0.9"
            />
            <polygon
              points="90,150 130,150 100,110"
              fill="url(#orangePanel)"
              stroke="#FEF08A"
              strokeWidth="1"
              opacity="0.9"
            />
            <polygon
              points="170,150 130,150 160,110"
              fill="url(#orangePanel)"
              stroke="#FEF08A"
              strokeWidth="1"
              opacity="0.9"
            />

            {/* BOTTOM BASE HOOD */}
            <polygon
              points="130,180 90,150 170,150"
              fill="#EA580C"
              stroke="#FEF08A"
              strokeWidth="1.5"
            />

            {/* FLOWING TASSELS / STREAMERS */}
            {/* Left Outer Streamers */}
            <g className="animate-streamer-left">
              <path
                d="M 65 110 Q 55 170 60 270 Q 62 275 65 270 Q 70 170 65 110 Z"
                fill="#60A5FA"
                opacity="0.85"
              />
              <path
                d="M 90 150 Q 82 210 85 295 Q 88 300 91 295 Q 96 210 90 150 Z"
                fill="#F472B6"
                opacity="0.9"
              />
            </g>

            {/* Center Streamer Group */}
            <g className="animate-streamer-right">
              <path
                d="M 110 165 Q 105 230 108 310 Q 111 315 114 310 Q 118 230 110 165 Z"
                fill="#FEF08A"
                opacity="0.95"
              />
              <path
                d="M 130 180 Q 128 240 130 320 Q 133 325 136 320 Q 138 240 130 180 Z"
                fill="#FFFFFF"
                opacity="0.95"
              />
              <path
                d="M 150 165 Q 152 230 150 310 Q 153 315 156 310 Q 158 230 150 165 Z"
                fill="#FEF08A"
                opacity="0.95"
              />
            </g>

            {/* Right Outer Streamers */}
            <g className="animate-streamer-left">
              <path
                d="M 170 150 Q 175 210 172 295 Q 175 300 178 295 Q 182 210 170 150 Z"
                fill="#F472B6"
                opacity="0.9"
              />
              <path
                d="M 195 110 Q 200 170 195 270 Q 198 275 201 270 Q 205 170 195 110 Z"
                fill="#60A5FA"
                opacity="0.85"
              />
            </g>
          </svg>
        </div>
      )}

      {/* 5. Sacred Blooming Lotus Flower (Nelum Mala) */}
      {showLotus && (
        <div
          className={`vesak-lotus-wrapper lotus-pos-${lotusPosition}`}
          title="Sacred Blooming Lotus"
        >
          <svg
            id="lotus-svg-element"
            className="vesak-lotus-svg animate-lotus-float"
            viewBox="0 0 260 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="lotusAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FBCFE8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#F472B6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#DB2777" stopOpacity="0" />
              </radialGradient>

              <linearGradient
                id="petalOuter"
                x1="130"
                y1="60"
                x2="130"
                y2="180"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="60%" stopColor="#DB2777" />
                <stop offset="100%" stopColor="#831843" />
              </linearGradient>

              <linearGradient
                id="petalInner"
                x1="130"
                y1="80"
                x2="130"
                y2="170"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#FCE7F3" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>

              <linearGradient
                id="leafGrad"
                x1="30"
                y1="180"
                x2="230"
                y2="180"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#059669" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>

            {/* WATER RIPPLE RINGS */}
            <ellipse
              className="animate-ripple-1"
              cx="130"
              cy="180"
              rx="70"
              ry="18"
              fill="none"
              stroke="#FBCFE8"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <ellipse
              className="animate-ripple-2"
              cx="130"
              cy="180"
              rx="70"
              ry="18"
              fill="none"
              stroke="#60A5FA"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* AURA GLOW */}
            <circle cx="130" cy="140" r="85" fill="url(#lotusAura)" />

            {/* GREEN LOTUS LEAF PAD */}
            <path
              d="M 30 180 C 30 160 80 150 130 150 C 180 150 230 160 230 180 C 230 200 180 208 130 208 C 80 208 30 200 30 180 Z"
              fill="url(#leafGrad)"
            />
            <path
              d="M 130 180 L 35 175 M 130 180 L 225 175 M 130 180 L 130 208 M 130 180 L 80 198 M 130 180 L 180 198"
              stroke="#047857"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* OUTER PETALS LAYER */}
            <g className="animate-petal">
              <path
                d="M 130 170 C 70 170 40 140 50 120 C 70 120 100 145 130 170 Z"
                fill="url(#petalOuter)"
              />
              <path
                d="M 130 170 C 190 170 220 140 210 120 C 190 120 160 145 130 170 Z"
                fill="url(#petalOuter)"
              />
              <path
                d="M 130 175 C 80 180 50 160 65 138 C 85 140 110 155 130 175 Z"
                fill="url(#petalOuter)"
              />
              <path
                d="M 130 175 C 180 180 210 160 195 138 C 175 140 150 155 130 175 Z"
                fill="url(#petalOuter)"
              />
            </g>

            {/* MID PETALS LAYER */}
            <path
              d="M 130 165 C 80 150 65 105 85 85 C 105 105 118 135 130 165 Z"
              fill="url(#petalInner)"
            />
            <path
              d="M 130 165 C 180 150 195 105 175 85 C 155 105 142 135 130 165 Z"
              fill="url(#petalInner)"
            />
            <path
              d="M 130 165 C 90 135 90 90 108 70 C 122 95 125 130 130 165 Z"
              fill="url(#petalInner)"
            />
            <path
              d="M 130 165 C 170 135 170 90 152 70 C 138 95 135 130 130 165 Z"
              fill="url(#petalInner)"
            />

            {/* CENTER INNERMOST PETAL & STAMEN */}
            <path
              d="M 130 165 C 110 125 115 75 130 55 C 145 75 150 125 130 165 Z"
              fill="#FFFFFF"
            />
            <path
              d="M 130 165 C 118 130 122 85 130 65 C 138 85 142 130 130 165 Z"
              fill="#FCE7F3"
            />

            {/* Golden Stamen Core */}
            <circle cx="130" cy="142" r="10" fill="#F59E0B" />
            <circle cx="130" cy="142" r="6" fill="#FEF08A" />
          </svg>
        </div>
      )}

      {/* Scoped CSS Animations and Styles */}
      <style>{`
        .vesak-festival-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 998;
          overflow: hidden;
        }

        /* 1. Canvas Light Particles */
        .vesak-particles-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 995;
        }

        /* 2. Top Garland Illuminated Light Bulbs */
        .vesak-lights-garland {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 24px;
          z-index: 999;
          pointer-events: none;
        }
        .vesak-lights-wire {
          position: absolute;
          top: 2px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #FDE047, #EA580C, #2563EB, #FDE047);
          opacity: 0.65;
        }
        .vesak-bulbs-container {
          display: flex;
          justify-content: space-around;
          align-items: flex-start;
          width: 100%;
          padding: 0 10px;
        }
        .vesak-bulb-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: bulb-pulse 2.2s infinite ease-in-out alternate;
        }
        .vesak-bulb-cap {
          width: 4px;
          height: 3px;
          background: #334155;
          border-radius: 1px;
        }
        .vesak-bulb-glass {
          width: 7px;
          height: 10px;
          border-radius: 50% 50% 40% 40%;
          transition: transform 0.2s;
        }
        @keyframes bulb-pulse {
          0% {
            opacity: 0.5;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        /* 3. Waving Buddhist Flag */
        .vesak-flag-wrapper {
          position: fixed;
          z-index: 997;
          pointer-events: auto;
          filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.28));
          transition: all 0.3s ease;
        }
        .flag-pos-top-left {
          top: 80px;
          left: 20px;
          width: 130px;
        }
        .flag-pos-top-right {
          top: 80px;
          right: 20px;
          width: 130px;
        }
        .vesak-flag-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }
        .animate-flag-fabric {
          transform-origin: 18px 20px;
          animation: flag-wave 3.5s ease-in-out infinite;
        }
        .animate-shimmer-pass {
          animation: shimmer-pass 2.8s ease-in-out infinite alternate;
        }
        @keyframes flag-wave {
          0%, 100% {
            transform: skewY(0deg) scaleX(1);
          }
          50% {
            transform: skewY(-2.5deg) scaleX(0.97);
          }
        }
        @keyframes shimmer-pass {
          0% {
            opacity: 0.1;
            transform: translateX(-12px);
          }
          100% {
            opacity: 0.4;
            transform: translateX(14px);
          }
        }

        /* 4. Octagonal Vesak Lantern (Vesak Kudu) */
        .vesak-lantern-wrapper {
          position: fixed;
          z-index: 999;
          pointer-events: auto;
          transition: all 0.3s ease;
          filter: drop-shadow(0 16px 32px rgba(245, 158, 11, 0.35));
        }
        .lantern-pos-top-right {
          top: 65px;
          right: 24px;
          width: 155px;
        }
        .lantern-pos-top-left {
          top: 65px;
          left: 24px;
          width: 155px;
        }
        .lantern-pos-bottom-right {
          bottom: 96px;
          right: 24px;
          width: 155px;
        }
        .vesak-lantern-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }
        .animate-lantern-body {
          transform-origin: 130px 10px;
          animation: lantern-sway 4.5s ease-in-out infinite alternate;
        }
        .animate-lantern-core-glow {
          transform-origin: 130px 110px;
          animation: candle-flicker 2.4s ease-in-out infinite alternate;
        }
        .animate-streamer-left {
          transform-origin: 65px 110px;
          animation: streamer-wave-l 3.8s ease-in-out infinite alternate;
        }
        .animate-streamer-right {
          transform-origin: 130px 180px;
          animation: streamer-wave-r 4.2s ease-in-out infinite alternate;
        }
        @keyframes lantern-sway {
          0% {
            transform: translateY(0) rotate(-2.5deg);
          }
          100% {
            transform: translateY(-8px) rotate(2.5deg);
          }
        }
        @keyframes candle-flicker {
          0% {
            transform: scale(0.92);
            opacity: 0.75;
          }
          100% {
            transform: scale(1.18);
            opacity: 1;
            filter: drop-shadow(0 0 16px #FEF08A);
          }
        }
        @keyframes streamer-wave-l {
          0% {
            transform: rotate(-3deg) skewX(-2deg);
          }
          100% {
            transform: rotate(4deg) skewX(3deg);
          }
        }
        @keyframes streamer-wave-r {
          0% {
            transform: rotate(3deg) skewX(2deg);
          }
          100% {
            transform: rotate(-4deg) skewX(-3deg);
          }
        }

        /* 5. Sacred Blooming Lotus Flower */
        .vesak-lotus-wrapper {
          position: fixed;
          z-index: 997;
          pointer-events: auto;
          transition: all 0.3s ease;
          filter: drop-shadow(0 14px 28px rgba(219, 39, 119, 0.3));
        }
        .lotus-pos-bottom-left {
          bottom: 24px;
          left: 24px;
          width: 165px;
        }
        .lotus-pos-bottom-right {
          bottom: 96px;
          right: 24px;
          width: 165px;
        }
        .vesak-lotus-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }
        .animate-lotus-float {
          transform-origin: 130px 180px;
          animation: lotus-bob 4.5s ease-in-out infinite alternate;
        }
        .animate-petal {
          transform-origin: 130px 170px;
          animation: petal-breathe 3.6s ease-in-out infinite alternate;
        }
        .animate-ripple-1 {
          transform-origin: 130px 180px;
          animation: ripple 3s ease-out infinite;
        }
        .animate-ripple-2 {
          transform-origin: 130px 180px;
          animation: ripple 3s ease-out infinite 1.5s;
        }
        @keyframes lotus-bob {
          0% {
            transform: translateY(0) rotate(-1.5deg);
          }
          100% {
            transform: translateY(-8px) rotate(1.5deg);
          }
        }
        @keyframes petal-breathe {
          0% {
            transform: scale(0.97);
          }
          100% {
            transform: scale(1.04);
          }
        }
        @keyframes ripple {
          0% {
            transform: scale(0.85);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        /* Virtual Split-Screen Preview Mode in Admin Dashboard */
        .vesak-festival-overlay.virtual-preview-mode {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
          pointer-events: none !important;
          z-index: 10 !important;
        }
        .vesak-festival-overlay.virtual-preview-mode .vesak-lantern-wrapper {
          position: absolute !important;
          width: 75px !important;
          z-index: 12 !important;
        }
        .vesak-festival-overlay.virtual-preview-mode .lantern-pos-top-right {
          top: 36px !important;
          right: 10px !important;
        }
        .vesak-festival-overlay.virtual-preview-mode .lantern-pos-top-left {
          top: 36px !important;
          left: 10px !important;
        }
        .vesak-festival-overlay.virtual-preview-mode .lantern-pos-bottom-right {
          bottom: 12px !important;
          right: 12px !important;
        }
        .vesak-festival-overlay.virtual-preview-mode .vesak-lotus-wrapper {
          position: absolute !important;
          width: 80px !important;
          z-index: 12 !important;
        }
        .vesak-festival-overlay.virtual-preview-mode .lotus-pos-bottom-left {
          bottom: 12px !important;
          left: 12px !important;
        }
        .vesak-festival-overlay.virtual-preview-mode .lotus-pos-bottom-right {
          bottom: 12px !important;
          right: 12px !important;
        }
        .vesak-festival-overlay.virtual-preview-mode .vesak-flag-wrapper {
          position: absolute !important;
          width: 65px !important;
          z-index: 12 !important;
        }
        .vesak-festival-overlay.virtual-preview-mode .flag-pos-top-left {
          top: 36px !important;
          left: 10px !important;
        }
        .vesak-festival-overlay.virtual-preview-mode .flag-pos-top-right {
          top: 36px !important;
          right: 10px !important;
        }
        .vesak-festival-overlay.virtual-preview-mode .vesak-lights-garland {
          position: absolute !important;
        }

        /* Mobile Responsive Adjustments */
        @media (max-width: 768px) {
          .vesak-lantern-wrapper {
            width: 100px;
          }
          .lantern-pos-top-right {
            top: 70px;
            right: 12px;
          }
          .lantern-pos-top-left {
            top: 70px;
            left: 12px;
          }
          .vesak-lotus-wrapper {
            width: 110px;
          }
          .lotus-pos-bottom-left {
            bottom: 16px;
            left: 12px;
          }
          .lotus-pos-bottom-right {
            bottom: 84px;
            right: 16px;
          }
          .vesak-flag-wrapper {
            width: 90px;
          }
          .flag-pos-top-left {
            top: 70px;
            left: 12px;
          }
          .flag-pos-top-right {
            top: 70px;
            right: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default VesakAccessories;
