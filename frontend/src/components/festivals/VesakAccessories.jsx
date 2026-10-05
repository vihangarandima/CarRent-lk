import React, { useEffect, useRef } from "react";
import { useSiteConfig } from "../../context/SiteConfigContext";

/**
 * Modular Vesak SVG Components
 */

// 1. Octagonal Sri Lankan Vesak Lantern (Vesak Kudu)
export const VesakKuduSVG = ({
  width = 155,
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
    {/* Hanging String & Top Ring */}
    <line x1="130" y1="0" x2="130" y2="35" stroke="#FDE047" strokeWidth="2" strokeDasharray="4 2" />
    <circle cx="130" cy="35" r="5" fill="none" stroke="#F59E0B" strokeWidth="2" />

    {/* TOP PYRAMID HOOD */}
    <polygon points="130,38 90,70 170,70" fill="#EA580C" stroke="#FEF08A" strokeWidth="1.5" />
    <polygon points="130,38 130,70 170,70" fill="#C2410C" opacity="0.4" />

    {/* INNER GLOWING CANDLE CORE */}
    <circle
      className="animate-lantern-core-glow"
      cx="130"
      cy="110"
      r="45"
      fill="url(#vesakCandleGlow)"
    />

    {/* OCTAGONAL LANTERN MAIN BODY */}
    {/* Side Left Panel */}
    <polygon
      points="90,70 60,110 90,150 100,110"
      fill="url(#vesakBluePanel)"
      stroke="#FEF08A"
      strokeWidth="1.5"
    />
    {/* Side Right Panel */}
    <polygon
      points="170,70 200,110 170,150 160,110"
      fill="url(#vesakPinkPanel)"
      stroke="#FEF08A"
      strokeWidth="1.5"
    />
    {/* Center Main Panel */}
    <polygon
      points="130,70 100,110 130,150 160,110"
      fill="url(#vesakGoldCore)"
      stroke="#FFF"
      strokeWidth="2"
      filter="url(#vesakLanternGlow)"
    />

    {/* Surrounding Triangular Petals */}
    <polygon points="90,70 130,70 100,110" fill="url(#vesakOrangePanel)" stroke="#FEF08A" strokeWidth="1" opacity="0.9" />
    <polygon points="170,70 130,70 160,110" fill="url(#vesakOrangePanel)" stroke="#FEF08A" strokeWidth="1" opacity="0.9" />
    <polygon points="90,150 130,150 100,110" fill="url(#vesakOrangePanel)" stroke="#FEF08A" strokeWidth="1" opacity="0.9" />
    <polygon points="170,150 130,150 160,110" fill="url(#vesakOrangePanel)" stroke="#FEF08A" strokeWidth="1" opacity="0.9" />

    {/* BOTTOM BASE HOOD */}
    <polygon points="130,180 90,150 170,150" fill="#EA580C" stroke="#FEF08A" strokeWidth="1.5" />
    <polygon points="130,180 130,150 170,150" fill="#C2410C" opacity="0.4" />

    {/* FLUTTERING PAPER STREAMERS (WALLI) */}
    {/* Left Outer Streamer */}
    <g className="animate-streamer-left">
      <path d="M 65 110 Q 50 190 60 250 Q 55 255 65 255 Q 75 190 70 110 Z" fill="#93C5FD" opacity="0.85" />
      <polygon points="55,250 60,265 65,250" fill="#FEF08A" />
    </g>

    {/* Right Outer Streamer */}
    <g className="animate-streamer-right">
      <path d="M 195 110 Q 210 190 200 250 Q 205 255 195 255 Q 185 190 190 110 Z" fill="#F472B6" opacity="0.85" />
      <polygon points="195,250 200,265 205,250" fill="#FEF08A" />
    </g>

    {/* Center Bottom Main Streamer */}
    <g className="animate-streamer-right">
      <path d="M 125 180 Q 115 240 120 290 Q 130 295 135 290 Q 140 240 135 180 Z" fill="#FEF08A" opacity="0.95" />
      <polygon points="120,290 127,310 135,290" fill="#F59E0B" />
    </g>

    {/* Bottom Left Streamer */}
    <g className="animate-streamer-left">
      <path d="M 100 155 Q 85 220 95 270 Q 105 272 105 270 Q 100 220 110 155 Z" fill="#FED7AA" opacity="0.9" />
      <polygon points="95,270 100,285 105,270" fill="#F59E0B" />
    </g>

    {/* Bottom Right Streamer */}
    <g className="animate-streamer-right">
      <path d="M 150 155 Q 165 220 155 270 Q 145 272 145 270 Q 150 220 140 155 Z" fill="#BBF7D0" opacity="0.9" />
      <polygon points="145,270 150,285 155,270" fill="#F59E0B" />
    </g>
  </svg>
);

// 2. Sacred Blooming Lotus Flower
export const VesakLotusSVG = ({
  width = 160,
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
    {/* Concentric Water Ripples */}
    <g id="water-ripples">
      <ellipse className="animate-ripple-1" cx="140" cy="155" rx="115" ry="24" fill="url(#vesakRippleGrad)" />
      <ellipse className="animate-ripple-2" cx="140" cy="155" rx="80" ry="18" fill="url(#vesakRippleGrad)" />
      <ellipse className="animate-ripple-3" cx="140" cy="155" rx="50" ry="12" fill="url(#vesakRippleGrad)" />
    </g>

    {/* Radiant Spiritual Aura Backlight */}
    <circle
      className="animate-lotus-aura-glow"
      cx="140"
      cy="110"
      r="75"
      fill="url(#vesakLotusAuraGrad)"
    />

    {/* Floating Bokeh Pollen Sparks */}
    <circle className="animate-sparkle-1" cx="65" cy="80" r="3.5" fill="#FEF08A" opacity="0.85" />
    <circle className="animate-sparkle-2" cx="215" cy="70" r="4" fill="#FDE047" opacity="0.85" />
    <circle className="animate-sparkle-1" cx="140" cy="35" r="3" fill="#FFF" opacity="0.9" />

    {/* OUTER LOTUS PETALS (Base Pad) */}
    <g id="outer-petals">
      {/* Outer Far-Left Petal */}
      <path
        d="M 140 145 C 90 145 35 130 45 105 C 60 75 105 110 140 145 Z"
        fill="url(#vesakPetalGradOuter)"
        filter="url(#vesakLotusGlow)"
      />
      {/* Outer Far-Right Petal */}
      <path
        d="M 140 145 C 190 145 245 130 235 105 C 220 75 175 110 140 145 Z"
        fill="url(#vesakPetalGradOuter)"
        filter="url(#vesakLotusGlow)"
      />
      {/* Bottom Leaf Support */}
      <ellipse cx="140" cy="152" rx="70" ry="10" fill="#047857" opacity="0.5" />
    </g>

    {/* MIDDLE LOTUS PETALS */}
    <g id="mid-petals">
      {/* Mid Left Petal */}
      <path
        d="M 140 145 C 100 135 70 95 85 65 C 105 45 130 95 140 145 Z"
        fill="url(#vesakPetalGradMid)"
      />
      {/* Mid Right Petal */}
      <path
        d="M 140 145 C 180 135 210 95 195 65 C 175 45 150 95 140 145 Z"
        fill="url(#vesakPetalGradMid)"
      />
      {/* Center Background Crown Petal */}
      <path
        d="M 140 145 C 115 110 120 50 140 28 C 160 50 165 110 140 145 Z"
        fill="url(#vesakPetalGradOuter)"
      />
    </g>

    {/* INNER CORE BLOOM PETALS */}
    <g id="inner-petals">
      {/* Inner Left Petal */}
      <path
        d="M 140 145 C 115 125 105 85 120 60 C 135 50 145 95 140 145 Z"
        fill="url(#vesakPetalGradInner)"
      />
      {/* Inner Right Petal */}
      <path
        d="M 140 145 C 165 125 175 85 160 60 C 145 50 135 95 140 145 Z"
        fill="url(#vesakPetalGradInner)"
      />
      {/* Center Sacred Heart Petal */}
      <path
        d="M 140 145 C 128 115 130 75 140 52 C 150 75 152 115 140 145 Z"
        fill="url(#vesakPetalGradInner)"
      />
    </g>

    {/* GOLDEN GLOWING SEED POD CORE */}
    <ellipse cx="140" cy="132" rx="18" ry="12" fill="url(#vesakLotusCoreGrad)" />
    <circle cx="134" cy="130" r="2.2" fill="#D97706" />
    <circle cx="140" cy="128" r="2.2" fill="#D97706" />
    <circle cx="146" cy="130" r="2.2" fill="#D97706" />
    <circle cx="137" cy="134" r="2.2" fill="#D97706" />
    <circle cx="143" cy="134" r="2.2" fill="#D97706" />
  </svg>
);

// 3. Authentic Buddhist 6-Stripe Flag
export const VesakFlagSVG = ({
  width = 135,
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
    {/* Flag Pole (Golden Brass) */}
    <line x1="20" y1="10" x2="20" y2="175" stroke="url(#vesakPoleGrad)" strokeWidth="6" strokeLinecap="round" />
    {/* Pole Top Golden Finial Spear */}
    <polygon points="20,2 26,12 14,12" fill="url(#vesakGoldFinial)" />
    <circle cx="20" cy="12" r="4.5" fill="url(#vesakGoldFinial)" />

    {/* Golden Cords & Hanging Tassels */}
    <path d="M 20 22 Q 10 35 14 50" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
    <circle cx="14" cy="52" r="2.5" fill="#D97706" />

    {/* WAVING BUDDHIST 6-STRIPE FABRIC */}
    <g className="animate-flag-fabric">
      {/* 1. Nila (Sapphire Blue) */}
      <path d="M 23 20 Q 80 15 135 25 Q 155 27 165 24 L 165 110 Q 155 113 135 111 Q 80 101 23 106 Z" fill="url(#vesakFlagBlue)" />

      {/* 2. Pita (Golden Yellow) */}
      <path d="M 52 20 Q 80 16 108 22 L 108 108 Q 80 102 52 106 Z" fill="url(#vesakFlagYellow)" />

      {/* 3. Lohita (Crimson Red) */}
      <path d="M 80 18 Q 94 17 108 20 L 108 106 Q 94 103 80 104 Z" fill="url(#vesakFlagRed)" />

      {/* 4. Odata (Pure White) */}
      <path d="M 108 20 Q 122 22 136 24 L 136 110 Q 122 108 108 106 Z" fill="url(#vesakFlagWhite)" />

      {/* 5. Manjettha (Deep Orange) */}
      <path d="M 136 24 Q 150 26 165 24 L 165 110 Q 150 112 136 110 Z" fill="url(#vesakFlagOrange)" />

      {/* 6. Pabasara (Prismatic Combined Stripe - 5 horizontal bands) */}
      <g id="pabasara-stripe">
        <path d="M 165 24 Q 185 22 205 26 L 205 43 Q 185 39 165 41 Z" fill="url(#vesakFlagBlue)" />
        <path d="M 165 41 Q 185 39 205 43 L 205 60 Q 185 56 165 58 Z" fill="url(#vesakFlagYellow)" />
        <path d="M 165 58 Q 185 56 205 60 L 205 77 Q 185 73 165 75 Z" fill="url(#vesakFlagRed)" />
        <path d="M 165 75 Q 185 73 205 77 L 205 94 Q 185 90 165 92 Z" fill="url(#vesakFlagWhite)" />
        <path d="M 165 92 Q 185 90 205 94 L 205 111 Q 185 107 165 109 Z" fill="url(#vesakFlagOrange)" />
      </g>

      {/* Waving Fabric Ripple Shadows */}
      <path d="M 23 20 Q 80 15 135 25 Q 185 22 205 26 L 205 111 Q 185 107 135 111 Q 80 101 23 106 Z" fill="url(#vesakFlagShimmer)" />
    </g>
  </svg>
);

// 4. Buddhist Flag Colors Light Garland
export const BuddhistLightsGarland = ({ count = 22, className = "" }) => {
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
            <div
              key={idx}
              className="vesak-bulb-item"
              style={{ animationDelay: `${(idx % 5) * 0.4}s` }}
            >
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

/**
 * Main Vesak Festival Accessories Component
 * Placed organically across the page flow (Hero, Categories, Why Us & Footer)
 * so elements scroll naturally with the website instead of feeling glued to the screen.
 */
const VesakAccessories = ({ previewConfig = null, isVirtualPreview = false }) => {
  const { config: globalConfig } = useSiteConfig();
  const config = previewConfig || globalConfig;

  const festivalData = config?.global?.festivalTheme;
  const isVesakActive = festivalData?.active === "vesak";

  if (!isVesakActive) return null;

  const vesakOptions = festivalData?.vesak || {
    showLantern: true,
    showLotus: true,
    showFlag: true,
    showLightString: true,
    showParticles: true,
  };

  const {
    showLantern = true,
    showLotus = true,
    showFlag = true,
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
    let height = (canvas.height = Math.max(window.innerHeight, document.body.scrollHeight || 2500));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = Math.max(window.innerHeight, document.body.scrollHeight || 2500);
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

    const particles = Array.from({ length: 48 }, () => ({
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
  }, [showParticles, isVirtualPreview]);

  return (
    <div
      className={`vesak-festival-root ${isVirtualPreview ? "virtual-preview-mode" : "live-website-mode"}`}
      aria-hidden="true"
    >
      {/* Global Shared SVG Defs (ensures all multiple instances render gradients correctly) */}
      <svg className="vesak-defs-svg" aria-hidden="true">
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

      {/* 1. TOP HEADER SECTION */}
      {/* Buddhist Flag Lights Garland across the top wire */}
      {showLightString && (
        <BuddhistLightsGarland count={isVirtualPreview ? 14 : 26} className="vesak-garland-top" />
      )}

      {/* Hero Left: Waving Buddhist 6-Stripe Flag standing proudly */}
      {showFlag && (
        <div className="vesak-spot-hero-flag" title="Sacred Buddhist Flag">
          <VesakFlagSVG width={isVirtualPreview ? 85 : 130} />
        </div>
      )}

      {/* Hero Right: Majestic Octagonal Vesak Kudu hanging with candle core */}
      {showLantern && (
        <div className="vesak-spot-hero-lantern" title="Octagonal Vesak Kudu">
          <VesakKuduSVG width={isVirtualPreview ? 95 : 155} />
        </div>
      )}

      {/* Hero Bottom: Sacred Blooming Lotus with pond ripples */}
      {showLotus && (
        <div className="vesak-spot-hero-lotus" title="Sacred Blooming Lotus">
          <VesakLotusSVG width={isVirtualPreview ? 95 : 150} />
        </div>
      )}

      {/* 2. MID-PAGE SECTION (Featured Listings, Categories, Why Us) */}
      {!isVirtualPreview && (
        <>
          {/* Mid-page Left: Secondary charming Vesak Kudu hanging beside Categories */}
          {showLantern && (
            <div className="vesak-spot-mid-lantern" title="Vesak Kudu Illumination">
              <VesakKuduSVG width={125} />
            </div>
          )}

          {/* Mid-page Right: Sacred Blooming Lotus resting beside "Why Choose Yamu" */}
          {showLotus && (
            <div className="vesak-spot-mid-lotus" title="Sacred Lotus Flower">
              <VesakLotusSVG width={135} />
            </div>
          )}

          {/* Mid-page Lower: Waving Buddhist Flag beside Rental Partners list */}
          {showFlag && (
            <div className="vesak-spot-mid-flag" title="Buddhist Flag">
              <VesakFlagSVG width={120} />
            </div>
          )}
        </>
      )}

      {/* 3. FOOTER & BOTTOM CTA SECTION */}
      {/* Vesak Kudu hanging beside the bottom CTA banner */}
      {showLantern && (
        <div className="vesak-spot-bottom-lantern" title="Vesak Kudu">
          <VesakKuduSVG width={isVirtualPreview ? 90 : 140} />
        </div>
      )}

      {/* Grand Sacred Blooming Lotus floating serenely on footer water line */}
      {showLotus && (
        <div className="vesak-spot-bottom-lotus" title="Grand Sacred Lotus">
          <VesakLotusSVG width={isVirtualPreview ? 105 : 175} />
        </div>
      )}

      {/* 4. Ambient Rising Golden Sparks / Pahan Eliya */}
      {showParticles && !isVirtualPreview && (
        <canvas ref={canvasRef} className="vesak-particles-canvas" />
      )}

      <style>{`
        /* Vesak Root Container - Stretches with the natural document height */
        .vesak-festival-root {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 45;
          overflow: hidden;
        }

        .vesak-defs-svg {
          position: absolute;
          width: 0;
          height: 0;
          overflow: hidden;
          pointer-events: none;
        }

        /* Ambient Pahan Embers Canvas */
        .vesak-particles-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
        }

        /* 1. TOP GARLAND LIGHT WIRE */
        .vesak-garland-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 22px;
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

        /* 2. NATURAL SCROLL POSITIONED ACCESSORIES */
        /* Hero Flag (Top-Left) */
        .vesak-spot-hero-flag {
          position: absolute;
          top: 25px;
          left: 18px;
          z-index: 46;
          filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.22));
          animation: float-gentle 4.8s ease-in-out infinite;
        }
        @media (min-width: 768px) {
          .vesak-spot-hero-flag {
            top: 35px;
            left: 45px;
          }
        }

        /* Hero Lantern (Top-Right) */
        .vesak-spot-hero-lantern {
          position: absolute;
          top: 15px;
          right: 18px;
          z-index: 46;
          filter: drop-shadow(0 16px 36px rgba(245, 158, 11, 0.4));
          animation: lantern-sway 4.5s ease-in-out infinite alternate;
          transform-origin: top center;
        }
        @media (min-width: 768px) {
          .vesak-spot-hero-lantern {
            top: 25px;
            right: 48px;
          }
        }

        /* Hero Lotus (Bottom-Left) */
        .vesak-spot-hero-lotus {
          position: absolute;
          top: 500px;
          left: 18px;
          z-index: 46;
          filter: drop-shadow(0 14px 28px rgba(219, 39, 119, 0.35));
          animation: float-gentle 4.2s ease-in-out infinite 0.8s;
        }
        @media (min-width: 768px) {
          .vesak-spot-hero-lotus {
            top: 520px;
            left: 45px;
          }
        }

        /* Mid-Page Lantern (Near Categories) */
        .vesak-spot-mid-lantern {
          position: absolute;
          top: 1040px;
          left: 18px;
          z-index: 45;
          filter: drop-shadow(0 14px 28px rgba(245, 158, 11, 0.35));
          animation: lantern-sway 4.8s ease-in-out infinite alternate 0.5s;
          transform-origin: top center;
        }
        @media (min-width: 768px) {
          .vesak-spot-mid-lantern {
            left: 45px;
          }
        }

        /* Mid-Page Lotus (Near Why Us Promise) */
        .vesak-spot-mid-lotus {
          position: absolute;
          top: 1720px;
          right: 18px;
          z-index: 45;
          filter: drop-shadow(0 14px 28px rgba(219, 39, 119, 0.35));
          animation: float-gentle 4.6s ease-in-out infinite 1.2s;
        }
        @media (min-width: 768px) {
          .vesak-spot-mid-lotus {
            right: 48px;
          }
        }

        /* Mid-Page Flag (Near Rental Partners) */
        .vesak-spot-mid-flag {
          position: absolute;
          top: 2420px;
          left: 18px;
          z-index: 45;
          filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.22));
          animation: float-gentle 5s ease-in-out infinite 1.6s;
        }
        @media (min-width: 768px) {
          .vesak-spot-mid-flag {
            left: 45px;
          }
        }

        /* Bottom Lantern (Beside bottom CTA card) */
        .vesak-spot-bottom-lantern {
          position: absolute;
          bottom: 150px;
          left: 20px;
          z-index: 46;
          filter: drop-shadow(0 16px 36px rgba(245, 158, 11, 0.42));
          animation: lantern-sway 4.2s ease-in-out infinite alternate 1s;
          transform-origin: top center;
        }
        @media (min-width: 768px) {
          .vesak-spot-bottom-lantern {
            bottom: 170px;
            left: 55px;
          }
        }

        /* Bottom Grand Lotus (Floating in footer pond water line) */
        .vesak-spot-bottom-lotus {
          position: absolute;
          bottom: 70px;
          right: 20px;
          z-index: 46;
          filter: drop-shadow(0 16px 36px rgba(219, 39, 119, 0.45));
          animation: float-gentle 4.4s ease-in-out infinite;
        }
        @media (min-width: 768px) {
          .vesak-spot-bottom-lotus {
            bottom: 85px;
            right: 60px;
          }
        }

        /* ANIMATIONS FOR VESAK ACCESSORIES */
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
        .animate-ripple-3 { animation: ripple-pulse 3.8s ease-in-out infinite 2.4s; transform-origin: 140px 155px; }
        @keyframes ripple-pulse {
          0% { transform: scale(0.85); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 0.25; }
          100% { transform: scale(1.25); opacity: 0; }
        }

        .animate-sparkle-1 {
          animation: sparkle-twinkle 2s infinite ease-in-out alternate;
        }
        .animate-sparkle-2 {
          animation: sparkle-twinkle 2.5s infinite ease-in-out alternate 0.8s;
        }
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

        /* VIRTUAL SPLIT-SCREEN PREVIEW MODE (Inside Admin CMS) */
        .vesak-festival-root.virtual-preview-mode {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .vesak-festival-root.virtual-preview-mode .vesak-garland-top {
          top: 0;
        }
        .vesak-festival-root.virtual-preview-mode .vesak-spot-hero-flag {
          top: 15px;
          left: 10px;
        }
        .vesak-festival-root.virtual-preview-mode .vesak-spot-hero-lantern {
          top: 15px;
          right: 10px;
        }
        .vesak-festival-root.virtual-preview-mode .vesak-spot-bottom-lotus {
          bottom: 15px;
          right: 12px;
        }
        .vesak-festival-root.virtual-preview-mode .vesak-spot-bottom-lantern {
          bottom: 15px;
          left: 12px;
        }
      `}</style>
    </div>
  );
};

export default VesakAccessories;
