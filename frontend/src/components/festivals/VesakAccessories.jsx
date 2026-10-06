import React, { useEffect, useRef } from "react";
import { useSiteConfig } from "../../context/SiteConfigContext";

/**
 * Shared Vesak SVG Definitions
 */
export const VesakDefsSVG = () => (
  <svg className="vesak-defs-svg" aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
    <defs>
      {/* Lantern Gradients */}
      <linearGradient id="vesakGoldCore" x1="130" y1="60" x2="130" y2="160" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="vesakBluePanel" x1="60" y1="80" x2="100" y2="140" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#93C5FD" />
        <stop offset="60%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="vesakPinkPanel" x1="200" y1="80" x2="160" y2="140" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F472B6" />
        <stop offset="60%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#BE185D" />
      </linearGradient>
      <linearGradient id="vesakOrangePanel" x1="130" y1="70" x2="130" y2="150" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="60%" stopColor="#FB923C" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
      <radialGradient id="vesakCandleGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="40%" stopColor="#FDE047" />
        <stop offset="80%" stopColor="#F59E0B" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
      </radialGradient>
      <filter id="vesakLanternGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      {/* Lotus Gradients */}
      <radialGradient id="vesakLotusAuraGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
        <stop offset="35%" stopColor="#FBBF24" stopOpacity="0.55" />
        <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="vesakPetalGradOuter" x1="140" y1="30" x2="140" y2="150" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDF2F8" />
        <stop offset="40%" stopColor="#F472B6" />
        <stop offset="80%" stopColor="#DB2777" />
        <stop offset="100%" stopColor="#9D174D" />
      </linearGradient>
      <linearGradient id="vesakPetalGradMid" x1="140" y1="40" x2="140" y2="150" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFF1F2" />
        <stop offset="35%" stopColor="#FB7185" />
        <stop offset="75%" stopColor="#E11D48" />
        <stop offset="100%" stopColor="#881337" />
      </linearGradient>
      <linearGradient id="vesakPetalGradInner" x1="140" y1="50" x2="140" y2="150" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="45%" stopColor="#F43F5E" />
        <stop offset="100%" stopColor="#BE123C" />
      </linearGradient>
      <radialGradient id="vesakLotusCoreGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </radialGradient>
      <radialGradient id="vesakRippleGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
        <stop offset="60%" stopColor="#0284C7" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#0369A1" stopOpacity="0" />
      </radialGradient>
      <filter id="vesakLotusGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="lglow" />
        <feComposite in="SourceGraphic" in2="lglow" operator="over" />
      </filter>

      {/* Flag Gradients */}
      <linearGradient id="vesakFlagBlue" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#1E40AF" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id="vesakFlagYellow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#FDE047" />
      </linearGradient>
      <linearGradient id="vesakFlagRed" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#B91C1C" />
        <stop offset="100%" stopColor="#EF4444" />
      </linearGradient>
      <linearGradient id="vesakFlagWhite" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#FFFFFF" />
      </linearGradient>
      <linearGradient id="vesakFlagOrange" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#C2410C" />
        <stop offset="100%" stopColor="#FB923C" />
      </linearGradient>
      <linearGradient id="vesakPoleGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="40%" stopColor="#F59E0B" />
        <stop offset="80%" stopColor="#B45309" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <linearGradient id="vesakGoldFinial" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="vesakFlagShimmer" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
        <stop offset="50%" stopColor="#000000" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
      </linearGradient>
    </defs>
  </svg>
);

// 1. Octagonal Sri Lankan Vesak Lantern
export const VesakKuduSVG = ({
  width = 145,
  className = "",
  style = {},
}) => (
  <svg
    viewBox="0 0 260 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: `${width}px`, height: "auto", overflow: "visible", ...style }}
    className={`vesak-lantern-svg ${className}`}
  >
    <line x1="130" y1="0" x2="130" y2="35" stroke="#FDE047" strokeWidth="2" strokeDasharray="4 2" />
    <circle cx="130" cy="35" r="5" fill="none" stroke="#F59E0B" strokeWidth="2" />

    {/* Top Hood */}
    <polygon points="130,38 90,70 170,70" fill="#EA580C" stroke="#FEF08A" strokeWidth="1.5" />
    <polygon points="130,38 130,70 170,70" fill="#C2410C" opacity="0.4" />

    {/* Glowing Candle Core */}
    <circle className="animate-lantern-core-glow" cx="130" cy="110" r="45" fill="url(#vesakCandleGlow)" />

    {/* Panels */}
    <polygon points="90,70 60,110 90,150 100,110" fill="url(#vesakBluePanel)" stroke="#FEF08A" strokeWidth="1.5" />
    <polygon points="170,70 200,110 170,150 160,110" fill="url(#vesakPinkPanel)" stroke="#FEF08A" strokeWidth="1.5" />
    <polygon points="130,70 100,110 130,150 160,110" fill="url(#vesakGoldCore)" stroke="#FFF" strokeWidth="2" filter="url(#vesakLanternGlow)" />

    {/* Petals */}
    <polygon points="90,70 130,70 100,110" fill="url(#vesakOrangePanel)" stroke="#FEF08A" strokeWidth="1" opacity="0.9" />
    <polygon points="170,70 130,70 160,110" fill="url(#vesakOrangePanel)" stroke="#FEF08A" strokeWidth="1" opacity="0.9" />
    <polygon points="90,150 130,150 100,110" fill="url(#vesakOrangePanel)" stroke="#FEF08A" strokeWidth="1" opacity="0.9" />
    <polygon points="170,150 130,150 160,110" fill="url(#vesakOrangePanel)" stroke="#FEF08A" strokeWidth="1" opacity="0.9" />

    {/* Base Hood */}
    <polygon points="130,180 90,150 170,150" fill="#EA580C" stroke="#FEF08A" strokeWidth="1.5" />

    {/* Streamers */}
    <g className="animate-streamer-left">
      <path d="M 65 110 Q 50 190 60 250 Q 55 255 65 255 Q 75 190 70 110 Z" fill="#93C5FD" opacity="0.85" />
      <polygon points="55,250 60,265 65,250" fill="#FEF08A" />
    </g>
    <g className="animate-streamer-right">
      <path d="M 195 110 Q 210 190 200 250 Q 205 255 195 255 Q 185 190 190 110 Z" fill="#F472B6" opacity="0.85" />
      <polygon points="195,250 200,265 205,250" fill="#FEF08A" />
    </g>
    <g className="animate-streamer-right">
      <path d="M 125 180 Q 115 240 120 290 Q 130 295 135 290 Q 140 240 135 180 Z" fill="#FEF08A" opacity="0.95" />
      <polygon points="120,290 127,310 135,290" fill="#F59E0B" />
    </g>
    <g className="animate-streamer-left">
      <path d="M 100 155 Q 85 220 95 270 Q 105 272 105 270 Q 100 220 110 155 Z" fill="#FED7AA" opacity="0.9" />
      <polygon points="95,270 100,285 105,270" fill="#F59E0B" />
    </g>
    <g className="animate-streamer-right">
      <path d="M 150 155 Q 165 220 155 270 Q 145 272 145 270 Q 150 220 140 155 Z" fill="#BBF7D0" opacity="0.9" />
      <polygon points="145,270 150,285 155,270" fill="#F59E0B" />
    </g>
  </svg>
);

// 2. Sacred Blooming Lotus Flower
export const VesakLotusSVG = ({
  width = 150,
  className = "",
  style = {},
}) => (
  <svg
    viewBox="0 0 280 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: `${width}px`, height: "auto", overflow: "visible", ...style }}
    className={`vesak-lotus-svg ${className}`}
  >
    {/* Ripples */}
    <g id="water-ripples">
      <ellipse className="animate-ripple-1" cx="140" cy="155" rx="115" ry="24" fill="url(#vesakRippleGrad)" />
      <ellipse className="animate-ripple-2" cx="140" cy="155" rx="80" ry="18" fill="url(#vesakRippleGrad)" />
    </g>

    {/* Radiant Aura */}
    <circle className="animate-lotus-aura-glow" cx="140" cy="110" r="75" fill="url(#vesakLotusAuraGrad)" />

    {/* Pollen Sparks */}
    <circle className="animate-sparkle-1" cx="65" cy="80" r="3.5" fill="#FEF08A" opacity="0.85" />
    <circle className="animate-sparkle-2" cx="215" cy="70" r="4" fill="#FDE047" opacity="0.85" />

    {/* Petals */}
    <path d="M 140 145 C 90 145 35 130 45 105 C 60 75 105 110 140 145 Z" fill="url(#vesakPetalGradOuter)" filter="url(#vesakLotusGlow)" />
    <path d="M 140 145 C 190 145 245 130 235 105 C 220 75 175 110 140 145 Z" fill="url(#vesakPetalGradOuter)" filter="url(#vesakLotusGlow)" />
    <path d="M 140 145 C 100 135 70 95 85 65 C 105 45 130 95 140 145 Z" fill="url(#vesakPetalGradMid)" />
    <path d="M 140 145 C 180 135 210 95 195 65 C 175 45 150 95 140 145 Z" fill="url(#vesakPetalGradMid)" />
    <path d="M 140 145 C 115 110 120 50 140 28 C 160 50 165 110 140 145 Z" fill="url(#vesakPetalGradOuter)" />
    <path d="M 140 145 C 115 125 105 85 120 60 C 135 50 145 95 140 145 Z" fill="url(#vesakPetalGradInner)" />
    <path d="M 140 145 C 165 125 175 85 160 60 C 145 50 135 95 140 145 Z" fill="url(#vesakPetalGradInner)" />
    <path d="M 140 145 C 128 115 130 75 140 52 C 150 75 152 115 140 145 Z" fill="url(#vesakPetalGradInner)" />

    {/* Golden Seed Pod */}
    <ellipse cx="140" cy="132" rx="18" ry="12" fill="url(#vesakLotusCoreGrad)" />
  </svg>
);

// 3. Authentic Buddhist 6-Stripe Flag
export const VesakFlagSVG = ({
  width = 125,
  className = "",
  style = {},
}) => (
  <svg
    viewBox="0 0 240 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: `${width}px`, height: "auto", overflow: "visible", ...style }}
    className={`vesak-flag-svg ${className}`}
  >
    <line x1="20" y1="10" x2="20" y2="175" stroke="url(#vesakPoleGrad)" strokeWidth="6" strokeLinecap="round" />
    <polygon points="20,2 26,12 14,12" fill="url(#vesakGoldFinial)" />
    <circle cx="20" cy="12" r="4.5" fill="url(#vesakGoldFinial)" />

    <g className="animate-flag-fabric">
      <path d="M 23 20 Q 80 15 135 25 Q 155 27 165 24 L 165 110 Q 155 113 135 111 Q 80 101 23 106 Z" fill="url(#vesakFlagBlue)" />
      <path d="M 52 20 Q 80 16 108 22 L 108 108 Q 80 102 52 106 Z" fill="url(#vesakFlagYellow)" />
      <path d="M 80 18 Q 94 17 108 20 L 108 106 Q 94 103 80 104 Z" fill="url(#vesakFlagRed)" />
      <path d="M 108 20 Q 122 22 136 24 L 136 110 Q 122 108 108 106 Z" fill="url(#vesakFlagWhite)" />
      <path d="M 136 24 Q 150 26 165 24 L 165 110 Q 150 112 136 110 Z" fill="url(#vesakFlagOrange)" />

      {/* Pabasara combined stripe */}
      <path d="M 165 24 Q 185 22 205 26 L 205 43 Q 185 39 165 41 Z" fill="url(#vesakFlagBlue)" />
      <path d="M 165 41 Q 185 39 205 43 L 205 60 Q 185 56 165 58 Z" fill="url(#vesakFlagYellow)" />
      <path d="M 165 58 Q 185 56 205 60 L 205 77 Q 185 73 165 75 Z" fill="url(#vesakFlagRed)" />
      <path d="M 165 75 Q 185 73 205 77 L 205 94 Q 185 90 165 92 Z" fill="url(#vesakFlagWhite)" />
      <path d="M 165 92 Q 185 90 205 94 L 205 111 Q 185 107 165 109 Z" fill="url(#vesakFlagOrange)" />

      <path d="M 23 20 Q 80 15 135 25 Q 185 22 205 26 L 205 111 Q 185 107 135 111 Q 80 101 23 106 Z" fill="url(#vesakFlagShimmer)" />
    </g>
  </svg>
);

// 4. Buddhist Lights Garland
export const BuddhistLightsGarland = ({ count = 24, className = "" }) => {
  const colors = [
    { hex: "#2563EB", glow: "rgba(37,99,235,0.8)" },
    { hex: "#FACC15", glow: "rgba(250,204,21,0.85)" },
    { hex: "#DC2626", glow: "rgba(220,38,38,0.8)" },
    { hex: "#FFFFFF", glow: "rgba(255,255,255,0.9)" },
    { hex: "#EA580C", glow: "rgba(234,88,12,0.85)" },
  ];

  return (
    <div className={`vesak-lights-garland ${className}`}>
      <div className="vesak-lights-wire" />
      <div className="vesak-bulbs-container">
        {Array.from({ length: count }).map((_, idx) => {
          const c = colors[idx % colors.length];
          return (
            <div key={idx} className="vesak-bulb-item" style={{ animationDelay: `${(idx % 5) * 0.4}s` }}>
              <div className="vesak-bulb-cap" />
              <div
                className="vesak-bulb-glass"
                style={{
                  backgroundColor: c.hex,
                  boxShadow: `0 0 10px 3px ${c.glow}`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 5. Full-Page Ambient Ascending Golden Sparks Canvas
export const VesakParticlesCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
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
      speedY: -(Math.random() * 0.85 + 0.3),
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
  }, []);

  return <canvas ref={canvasRef} className="vesak-particles-canvas" aria-hidden="true" />;
};

/**
 * Hero Section Vesak Decorations (ONLY IN HERO)
 * Positioned in open corners/flanks so text is NEVER covered.
 */
export const VesakHeroDecorations = ({ compact = false }) => {
  const { config } = useSiteConfig();
  if (config?.global?.festivalTheme?.active !== "vesak") return null;

  return (
    <div className="vesak-hero-decorations-layer" aria-hidden="true">
      <VesakDefsSVG />

      {/* Top-Left Corner: Waving Buddhist Flag in open margin */}
      <div className="vesak-hero-corner-flag">
        <VesakFlagSVG width={compact ? 75 : 120} />
      </div>

      {/* Top-Right Corner: Octagonal Vesak Kudu lantern in open margin */}
      <div className="vesak-hero-corner-lantern">
        <VesakKuduSVG width={compact ? 80 : 135} />
      </div>

      {/* Bottom Flank: Sacred Blooming Lotus on pond ripples (desktop only) */}
      {!compact && (
        <div className="vesak-hero-flank-lotus">
          <VesakLotusSVG width={140} />
        </div>
      )}
    </div>
  );
};

/**
 * Footer Section Vesak Decorations (ONLY IN FOOTER)
 * Positioned cleanly framing the CTA banner so text is NEVER covered.
 */
export const VesakFooterDecorations = () => {
  const { config } = useSiteConfig();
  if (config?.global?.festivalTheme?.active !== "vesak") return null;

  return (
    <div className="vesak-footer-decorations-layer" aria-hidden="true">
      <VesakDefsSVG />

      {/* Right Flank: Illuminated Vesak Kudu beside CTA banner */}
      <div className="vesak-footer-flank-lantern">
        <VesakKuduSVG width={135} />
      </div>

      {/* Bottom Corner: Sacred Blooming Lotus resting at footer water line */}
      <div className="vesak-footer-corner-lotus">
        <VesakLotusSVG width={125} />
      </div>
    </div>
  );
};

/**
 * Main Vesak Festival Accessories Component (Mounted in App.jsx)
 * Renders ONLY the ambient ascending golden particles animation and top header garland,
 * plus virtual preview mode inside Admin CMS.
 */
const VesakAccessories = ({ previewConfig = null, isVirtualPreview = false }) => {
  const { config: globalConfig } = useSiteConfig();
  const config = previewConfig || globalConfig;
  const isVesakActive = config?.global?.festivalTheme?.active === "vesak";

  if (!isVesakActive) return null;

  return (
    <div
      className={`vesak-festival-root ${isVirtualPreview ? "virtual-preview-mode" : "live-website-mode"}`}
      aria-hidden="true"
    >
      <VesakDefsSVG />

      {/* Top Header Garland Wire */}
      <BuddhistLightsGarland count={isVirtualPreview ? 14 : 26} className="vesak-garland-top" />

      {/* Full-Page Ambient Glowing Golden Particles Animation */}
      {!isVirtualPreview && <VesakParticlesCanvas />}

      {/* Virtual Preview Mode Fallbacks (For Admin CMS Split-Screen only) */}
      {isVirtualPreview && (
        <>
          <div style={{ position: "absolute", top: "15px", left: "10px" }}>
            <VesakFlagSVG width={65} />
          </div>
          <div style={{ position: "absolute", top: "15px", right: "10px" }}>
            <VesakKuduSVG width={70} />
          </div>
          <div style={{ position: "absolute", bottom: "12px", right: "12px" }}>
            <VesakLotusSVG width={80} />
          </div>
        </>
      )}

      <style>{`
        /* Vesak Root */
        .vesak-festival-root {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 40;
          overflow: hidden;
        }

        /* Ambient Pahan Embers Canvas */
        .vesak-particles-canvas {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 30;
        }

        /* Top Garland */
        .vesak-garland-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 20px;
          z-index: 50;
        }
        .vesak-lights-wire {
          position: absolute;
          top: 2px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #2563EB, #FACC15, #DC2626, #FFFFFF, #EA580C, #2563EB);
          opacity: 0.7;
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
          animation: bulb-pulse 2.4s infinite ease-in-out alternate;
        }
        .vesak-bulb-cap {
          width: 4px;
          height: 3px;
          background: #475569;
          border-radius: 1px;
        }
        .vesak-bulb-glass {
          width: 7px;
          height: 10px;
          border-radius: 50% 50% 40% 40%;
        }
        @keyframes bulb-pulse {
          0% { opacity: 0.65; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1.12); filter: brightness(1.25); }
        }

        /* HERO DECORATIONS LAYER */
        .vesak-hero-decorations-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          overflow: hidden;
        }
        .vesak-hero-corner-flag {
          position: absolute;
          top: 20px;
          left: 18px;
          filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.25));
          animation: float-gentle 4.8s ease-in-out infinite;
        }
        .vesak-hero-corner-lantern {
          position: absolute;
          top: 15px;
          right: 18px;
          filter: drop-shadow(0 14px 30px rgba(245, 158, 11, 0.4));
          animation: lantern-sway 4.5s ease-in-out infinite alternate;
          transform-origin: top center;
        }
        .vesak-hero-flank-lotus {
          position: absolute;
          bottom: 30px;
          left: 30px;
          filter: drop-shadow(0 12px 28px rgba(219, 39, 119, 0.35));
          animation: float-gentle 4.2s ease-in-out infinite 0.6s;
        }
        @media (max-width: 1024px) {
          .vesak-hero-flank-lotus {
            display: none; /* Hide on tablets and mobile so search inputs have 100% clean space */
          }
          .vesak-hero-corner-flag {
            top: 10px;
            left: 10px;
            transform: scale(0.8);
          }
          .vesak-hero-corner-lantern {
            top: 10px;
            right: 10px;
            transform: scale(0.8);
          }
        }

        /* FOOTER DECORATIONS LAYER */
        .vesak-footer-decorations-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          overflow: hidden;
        }
        .vesak-footer-flank-lantern {
          position: absolute;
          top: 20px;
          right: 35px;
          filter: drop-shadow(0 14px 32px rgba(245, 158, 11, 0.45));
          animation: lantern-sway 4.2s ease-in-out infinite alternate;
          transform-origin: top center;
        }
        .vesak-footer-corner-lotus {
          position: absolute;
          bottom: 25px;
          left: 25px;
          filter: drop-shadow(0 12px 28px rgba(219, 39, 119, 0.4));
          animation: float-gentle 4.4s ease-in-out infinite;
        }
        @media (max-width: 768px) {
          .vesak-footer-flank-lantern {
            display: none;
          }
          .vesak-footer-corner-lotus {
            display: none;
          }
        }

        /* ANIMATIONS */
        .animate-flag-fabric {
          transform-origin: 20px 20px;
          animation: flag-wave 3.6s ease-in-out infinite;
        }
        @keyframes flag-wave {
          0%, 100% { transform: skewY(0deg) scaleX(1); }
          50% { transform: skewY(-2.5deg) scaleX(0.97); }
        }

        .animate-lantern-core-glow {
          transform-origin: 130px 110px;
          animation: candle-flicker 2.4s ease-in-out infinite alternate;
        }
        @keyframes candle-flicker {
          0% { transform: scale(0.92); opacity: 0.75; }
          100% { transform: scale(1.18); opacity: 1; filter: drop-shadow(0 0 16px #FEF08A); }
        }

        .animate-streamer-left {
          transform-origin: 65px 110px;
          animation: streamer-wave-l 3.8s ease-in-out infinite alternate;
        }
        .animate-streamer-right {
          transform-origin: 130px 180px;
          animation: streamer-wave-r 4.2s ease-in-out infinite alternate;
        }
        @keyframes streamer-wave-l {
          0% { transform: rotate(-3deg) skewX(-2deg); }
          100% { transform: rotate(4deg) skewX(3deg); }
        }
        @keyframes streamer-wave-r {
          0% { transform: rotate(3deg) skewX(2deg); }
          100% { transform: rotate(-4deg) skewX(-3deg); }
        }

        .animate-lotus-aura-glow {
          transform-origin: 140px 110px;
          animation: lotus-aura-pulse 3.4s ease-in-out infinite alternate;
        }
        @keyframes lotus-aura-pulse {
          0% { transform: scale(0.88); opacity: 0.55; }
          100% { transform: scale(1.16); opacity: 0.95; }
        }

        .animate-ripple-1 { animation: ripple-pulse 3.8s ease-in-out infinite; transform-origin: 140px 155px; }
        .animate-ripple-2 { animation: ripple-pulse 3.8s ease-in-out infinite 1.2s; transform-origin: 140px 155px; }
        @keyframes ripple-pulse {
          0% { transform: scale(0.85); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 0.25; }
          100% { transform: scale(1.25); opacity: 0; }
        }

        .animate-sparkle-1 { animation: sparkle-twinkle 2s infinite ease-in-out alternate; }
        .animate-sparkle-2 { animation: sparkle-twinkle 2.5s infinite ease-in-out alternate 0.8s; }
        @keyframes sparkle-twinkle {
          0% { transform: scale(0.6); opacity: 0.35; }
          100% { transform: scale(1.2); opacity: 0.95; filter: drop-shadow(0 0 6px #FEF08A); }
        }

        @keyframes lantern-sway {
          0% { transform: translateY(0) rotate(-2deg); }
          100% { transform: translateY(-7px) rotate(2.5deg); }
        }

        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default VesakAccessories;
