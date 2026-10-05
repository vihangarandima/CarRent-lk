import React, { useMemo } from "react";
import { useSiteConfig } from "../../context/SiteConfigContext";

/**
 * Modular Christmas SVG Components
 */

// 1. Vector Christmas Tree SVG
export const ChristmasTreeSVG = ({
  width = 160,
  className = "",
  style = {},
  showStarGlow = true,
}) => (
  <svg
    viewBox="0 0 200 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: `${width}px`, height: "auto", overflow: "visible", ...style }}
    className={`xmas-tree-svg ${className}`}
  >
    {/* Trunk */}
    <rect x="88" y="215" width="24" height="35" rx="4" fill="url(#xmasTrunkGrad)" />

    {/* Bottom Layer */}
    <path
      d="M 100 120 L 175 220 C 150 228 130 220 100 228 C 70 220 50 228 25 220 Z"
      fill="url(#xmasBaseGrad)"
    />

    {/* Mid Layer */}
    <path
      d="M 100 75 L 160 160 C 140 167 120 160 100 167 C 80 160 60 167 40 160 Z"
      fill="url(#xmasMidGrad)"
    />

    {/* Top Layer */}
    <path
      d="M 100 30 L 145 105 C 130 112 115 106 100 112 C 85 106 70 112 55 105 Z"
      fill="url(#xmasTopGrad)"
    />

    {/* Twinkling Tree Lights */}
    <g id="tree-lights">
      <circle cx="75" cy="100" r="5" fill="#EF4444" className="xmas-light-1" />
      <circle cx="125" cy="145" r="5.5" fill="#EF4444" className="xmas-light-2" />
      <circle cx="100" cy="70" r="4.5" fill="#FBBF24" className="xmas-light-3" />
      <circle cx="85" cy="155" r="5" fill="#FBBF24" className="xmas-light-1" />
      <circle cx="122" cy="95" r="4.5" fill="#3B82F6" className="xmas-light-2" />
      <circle cx="110" cy="195" r="5" fill="#10B981" className="xmas-light-3" />
      <circle cx="65" cy="180" r="4.5" fill="#F43F5E" className="xmas-light-1" />
      <circle cx="140" cy="190" r="4.5" fill="#FBBF24" className="xmas-light-2" />
    </g>

    {/* Top Radiant Golden Star */}
    <g className="xmas-tree-star">
      {showStarGlow && (
        <circle cx="100" cy="30" r="18" fill="#FDE047" opacity="0.3" filter="url(#xmasGlowFilter)" />
      )}
      <polygon
        points="100,12 105,24 118,24 107,32 111,44 100,36 89,44 93,32 82,24 95,24"
        fill="#F59E0B"
        filter="url(#xmasGlowFilter)"
      />
    </g>
  </svg>
);

// 2. Golden Christmas Bells SVG
export const ChristmasBellsSVG = ({
  width = 130,
  className = "",
  style = {},
}) => (
  <svg
    viewBox="0 0 240 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: `${width}px`, height: "auto", overflow: "visible", ...style }}
    className={`xmas-bells-svg ${className}`}
  >
    {/* Background Sparkles */}
    <g id="sparkles">
      <path className="animate-sparkle-1" fill="#FEF08A" d="M40 40 L43 47 L50 50 L43 53 L40 60 L37 53 L30 50 L37 47 Z" />
      <path className="animate-sparkle-2" fill="#FEF08A" d="M220 80 L222 85 L227 87 L222 89 L220 94 L218 89 L213 87 L218 85 Z" />
      <path className="animate-sparkle-1" fill="#FEF08A" d="M190 30 L191 33 L194 34 L191 35 L190 38 L189 35 L186 34 L189 33 Z" />
    </g>

    {/* Left Bell */}
    <g className="animate-bell-left">
      <circle className="animate-clapper-l" cx="82" cy="158" r="9" fill="url(#clapperGrad)" />
      <path
        d="M 102 75 C 102 75 90 120 62 132 C 55 135 50 142 58 148 C 68 155 106 155 116 148 C 122 142 118 135 110 132 C 88 120 94 75 94 75 Z"
        fill="url(#goldBellGrad1)"
      />
      <ellipse cx="87" cy="146" rx="28" ry="6" fill="none" stroke="#FEF08A" strokeWidth="2" opacity="0.6" />
      <path d="M 70 95 Q 85 98 100 95" stroke="#FEF08A" strokeWidth="1.5" fill="none" opacity="0.5" />
    </g>

    {/* Right Bell */}
    <g className="animate-bell-right">
      <circle className="animate-clapper-r" cx="170" cy="162" r="9.5" fill="url(#clapperGrad)" />
      <path
        d="M 160 75 C 160 75 148 122 118 136 C 110 140 106 147 115 153 C 126 160 168 160 178 153 C 185 147 180 140 172 136 C 148 122 152 75 152 75 Z"
        fill="url(#goldBellGrad2)"
      />
      <ellipse cx="147" cy="151" rx="30" ry="6.5" fill="none" stroke="#FEF08A" strokeWidth="2" opacity="0.6" />
      <path d="M 130 98 Q 148 102 162 98" stroke="#FEF08A" strokeWidth="1.5" fill="none" opacity="0.5" />
    </g>

    {/* Holly Leaves & Berries */}
    <g id="holly-group">
      <path d="M 130 60 C 100 40 80 45 70 30 C 85 25 100 35 110 20 C 120 35 130 25 130 60 Z" fill="url(#hollyGrad)" />
      <path d="M 130 60 C 160 40 180 45 190 30 C 175 25 160 35 150 20 C 140 35 130 25 130 60 Z" fill="url(#hollyGrad)" />
      <path d="M 130 55 Q 105 38 85 30" stroke="#6EE7B7" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M 130 55 Q 155 38 175 30" stroke="#6EE7B7" strokeWidth="1" fill="none" opacity="0.6" />

      <circle cx="123" cy="42" r="6" fill="#EF4444" filter="url(#bellGlow)" />
      <circle cx="137" cy="42" r="6" fill="#DC2626" filter="url(#bellGlow)" />
      <circle cx="130" cy="34" r="6.5" fill="#F87171" filter="url(#bellGlow)" />
      <circle cx="121" cy="40" r="1.5" fill="#FFF" />
      <circle cx="135" cy="40" r="1.5" fill="#FFF" />
      <circle cx="128" cy="32" r="1.5" fill="#FFF" />
    </g>

    {/* Satin Ribbon Bow */}
    <g id="ribbon-bow" className="animate-bow">
      <path d="M 120 65 Q 90 95 70 120 Q 82 122 95 110 L 122 75 Z" fill="url(#ribbonGrad)" />
      <path d="M 140 65 Q 170 95 190 120 Q 178 122 165 110 L 138 75 Z" fill="url(#ribbonGrad)" />
      <path d="M 126 62 C 100 40 70 55 85 75 C 100 90 122 70 128 65 Z" fill="url(#ribbonGrad)" />
      <path d="M 118 61 C 100 48 82 60 92 72 C 102 80 118 68 122 64 Z" fill="#991B1B" opacity="0.4" />
      <path d="M 134 62 C 160 40 190 55 175 75 C 160 90 138 70 132 65 Z" fill="url(#ribbonGrad)" />
      <path d="M 142 61 C 160 48 178 60 168 72 C 158 80 142 68 138 64 Z" fill="#991B1B" opacity="0.4" />
      <rect x="122" y="56" width="16" height="14" rx="4" fill="#F87171" filter="url(#bellGlow)" />
      <rect x="124" y="58" width="12" height="10" rx="3" fill="url(#ribbonGrad)" />
    </g>
  </svg>
);

// 3. Hanging Baubles / Ornaments SVG
export const ChristmasBaublesSVG = ({
  width = 150,
  className = "",
  style = {},
}) => (
  <svg
    viewBox="0 0 280 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: `${width}px`, height: "auto", overflow: "visible", ...style }}
    className={`xmas-ornaments-svg ${className}`}
  >
    {/* Hanging Strings */}
    <line x1="75" y1="0" x2="75" y2="80" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="140" y1="0" x2="140" y2="40" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="200" y1="0" x2="200" y2="110" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="3 2" />

    {/* 1. Ruby Red Ornament */}
    <g className="animate-sway-bauble-1">
      <rect x="67" y="76" width="16" height="10" rx="3" fill="url(#capGrad)" />
      <circle cx="75" cy="74" r="5" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="75" cy="115" r="32" fill="url(#redBaubleGrad)" filter="url(#baubleGlow)" />
      <path
        d="M 50 115 Q 75 130 100 115"
        stroke="#FEF08A"
        strokeWidth="2"
        fill="none"
        opacity="0.85"
        strokeDasharray="4 3"
      />
      <circle cx="62" cy="100" r="10" fill="#FFF" opacity="0.35" filter="url(#baubleGlow)" />
      <polygon
        points="75,98 77,105 84,107 77,109 75,116 73,109 66,107 73,105"
        fill="#FFF"
        className="animate-shimmer"
      />
    </g>

    {/* 2. Emerald Green Ornament */}
    <g className="animate-sway-bauble-2">
      <rect x="132" y="36" width="16" height="10" rx="3" fill="url(#capGrad)" />
      <circle cx="140" cy="34" r="5" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="140" cy="75" r="35" fill="url(#greenBaubleGrad)" filter="url(#baubleGlow)" />
      <path
        d="M 112 75 C 122 92 158 92 168 75"
        stroke="#FEF08A"
        strokeWidth="2.5"
        fill="none"
        opacity="0.9"
      />
      <circle cx="126" cy="62" r="11" fill="#FFF" opacity="0.4" filter="url(#baubleGlow)" />
      <polygon
        points="140,58 142,65 149,67 142,69 140,76 138,69 131,67 138,65"
        fill="#FFF"
        className="animate-shimmer"
      />
    </g>

    {/* 3. Golden Starburst Ornament */}
    <g className="animate-sway-bauble-3">
      <rect x="192" y="106" width="16" height="10" rx="3" fill="url(#capGrad)" />
      <circle cx="200" cy="104" r="5" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="200" cy="142" r="28" fill="url(#goldBaubleGrad)" filter="url(#baubleGlow)" />
      <path
        d="M 180 142 Q 200 155 220 142"
        stroke="#FFFFFF"
        strokeWidth="2"
        fill="none"
        opacity="0.8"
        strokeDasharray="3 3"
      />
      <circle cx="188" cy="130" r="8" fill="#FFF" opacity="0.45" filter="url(#baubleGlow)" />
      <polygon
        points="200,126 202,132 208,134 202,136 200,142 198,136 192,134 198,132"
        fill="#FFF"
        className="animate-shimmer"
      />
    </g>
  </svg>
);

// 4. Fairy Lights Garland Component
export const FairyLightsGarland = ({ count = 22, className = "" }) => {
  const colors = [
    { hex: "#EF4444", glow: "rgba(239,68,68,0.85)" },
    { hex: "#10B981", glow: "rgba(16,185,129,0.85)" },
    { hex: "#F59E0B", glow: "rgba(245,158,11,0.9)" },
    { hex: "#3B82F6", glow: "rgba(59,130,246,0.85)" },
  ];

  return (
    <div className={`xmas-lights-garland ${className}`}>
      <div className="xmas-lights-wire" />
      <div className="xmas-bulbs-container">
        {Array.from({ length: count }).map((_, idx) => {
          const c = colors[idx % colors.length];
          return (
            <div
              key={idx}
              className="xmas-bulb-item"
              style={{ animationDelay: `${(idx % 4) * 0.45}s` }}
            >
              <div className="xmas-bulb-cap" />
              <div
                className="xmas-bulb-glass"
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
  );
};

/**
 * Main Christmas Accessories Component
 * Placed organically across the page flow (Hero, Categories, Trust & Footer)
 * so elements scroll naturally with the website instead of feeling glued to the screen.
 */
const ChristmasAccessories = ({ previewConfig = null, isVirtualPreview = false }) => {
  const { config: globalConfig } = useSiteConfig();
  const config = previewConfig || globalConfig;

  const festivalData = config?.global?.festivalTheme;
  const isChristmasActive = festivalData?.active === "christmas";

  if (!isChristmasActive) return null;

  const christmasOptions = festivalData?.christmas || {
    showTree: true,
    treePosition: "bottom-left",
    showBells: true,
    showOrnaments: true,
    showSnow: true,
  };

  const {
    showTree = true,
    showBells = true,
    showOrnaments = true,
    showSnow = true,
  } = christmasOptions;

  // Snowflake particles for ambient winter atmosphere
  const snowflakes = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        left: `${(i * 3.57 + (i % 6) * 1.8) % 100}%`,
        size: `${Math.max(4, (i % 5) * 2.5 + 4)}px`,
        duration: `${8 + (i % 6) * 2.2}s`,
        delay: `${(i % 8) * 1.1}s`,
        opacity: 0.28 + (i % 4) * 0.18,
      })),
    []
  );

  return (
    <div
      className={`xmas-festival-root ${isVirtualPreview ? "virtual-preview-mode" : "live-website-mode"}`}
      aria-hidden="true"
    >
      {/* Global Shared SVG Defs (ensures all multiple instances render gradients correctly) */}
      <svg className="xmas-defs-svg" aria-hidden="true">
        <defs>
          {/* Tree Gradients */}
          <linearGradient id="xmasTopGrad" x1="100" y1="30" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="xmasMidGrad" x1="100" y1="80" x2="100" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="xmasBaseGrad" x1="100" y1="130" x2="100" y2="230" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>
          <linearGradient id="xmasTrunkGrad" x1="90" y1="220" x2="110" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>
          <filter id="xmasGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feComposite in="SourceGraphic" in2="b" operator="over" />
          </filter>

          {/* Bells Gradients */}
          <linearGradient id="goldBellGrad1" x1="60" y1="60" x2="110" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="goldBellGrad2" x1="120" y1="60" x2="180" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="30%" stopColor="#FBBF24" />
            <stop offset="75%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id="clapperGrad" x1="0" y1="0" x2="0" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="ribbonGrad" x1="80" y1="30" x2="180" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="40%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
          <linearGradient id="hollyGrad" x1="100" y1="20" x2="160" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="60%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>
          <filter id="bellGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Baubles Gradients */}
          <radialGradient id="redBaubleGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FCA5A5" />
            <stop offset="25%" stopColor="#EF4444" />
            <stop offset="70%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#450A0A" />
          </radialGradient>
          <radialGradient id="greenBaubleGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="30%" stopColor="#10B981" />
            <stop offset="75%" stopColor="#047857" />
            <stop offset="100%" stopColor="#022C22" />
          </radialGradient>
          <radialGradient id="goldBaubleGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="30%" stopColor="#F59E0B" />
            <stop offset="75%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#451A03" />
          </radialGradient>
          <linearGradient id="capGrad" x1="0" y1="0" x2="20" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <filter id="baubleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="bglow" />
            <feComposite in="SourceGraphic" in2="bglow" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* 1. TOP HEADER SECTION */}
      {/* Top Garland Light Wire hanging along the site header */}
      <FairyLightsGarland count={isVirtualPreview ? 14 : 26} className="xmas-garland-top" />

      {/* Hero Left: Hanging Baubles swaying from the top-left */}
      {showOrnaments && (
        <div className="xmas-spot-hero-baubles" title="Holiday Baubles">
          <ChristmasBaublesSVG width={isVirtualPreview ? 95 : 145} />
        </div>
      )}

      {/* Hero Right: Golden Christmas Bells perched on the hero stage */}
      {showBells && (
        <div className="xmas-spot-hero-bells" title="Golden Christmas Bells">
          <ChristmasBellsSVG width={isVirtualPreview ? 85 : 135} />
        </div>
      )}

      {/* 2. MID-PAGE SECTION (Featured Listings & Categories) */}
      {!isVirtualPreview && (
        <>
          {/* Mid-page Left: A charming Decorative Christmas Tree nestled near Categories */}
          {showTree && (
            <div className="xmas-spot-mid-tree" title="Decorative Christmas Tree">
              <ChristmasTreeSVG width={125} />
            </div>
          )}

          {/* Mid-page Right: Second pair of Golden Bells adorning the Trust / Why Choose section */}
          {showBells && (
            <div className="xmas-spot-mid-bells" title="Holiday Bells Accent">
              <ChristmasBellsSVG width={120} />
            </div>
          )}

          {/* Mid-page Lower: Delicate hanging baubles dangling near Testimonials */}
          {showOrnaments && (
            <div className="xmas-spot-mid-baubles" title="Festive Baubles">
              <ChristmasBaublesSVG width={120} />
            </div>
          )}
        </>
      )}

      {/* 3. FOOTER & BOTTOM CTA SECTION */}
      {/* Majestic Christmas Tree grounded near the bottom CTA / footer */}
      {showTree && (
        <div className="xmas-spot-bottom-tree" title="Grand Christmas Tree">
          <ChristmasTreeSVG width={isVirtualPreview ? 115 : 185} />
        </div>
      )}

      {/* Subtle festive bells framing the bottom */}
      {showBells && (
        <div className="xmas-spot-bottom-bells" title="Christmas Bells">
          <ChristmasBellsSVG width={isVirtualPreview ? 75 : 115} />
        </div>
      )}

      {/* 4. Ambient Snowfall (Smooth falling snowflakes in the page background) */}
      {showSnow && (
        <div className="xmas-snow-container">
          {snowflakes.map((s) => (
            <div
              key={s.id}
              className="xmas-snowflake"
              style={{
                left: s.left,
                width: s.size,
                height: s.size,
                animationDuration: s.duration,
                animationDelay: s.delay,
                opacity: s.opacity,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        /* Christmas Root Container - Stretches with the natural document height */
        .xmas-festival-root {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 45;
          overflow: hidden;
        }

        .xmas-defs-svg {
          position: absolute;
          width: 0;
          height: 0;
          overflow: hidden;
          pointer-events: none;
        }

        /* Ambient Snowfall Layer */
        .xmas-snow-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 2;
        }
        .xmas-snowflake {
          position: absolute;
          top: -20px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(224, 242, 254, 0.6) 70%, transparent 100%);
          border-radius: 50%;
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.9));
          animation: snowfall linear infinite;
        }
        @keyframes snowfall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(50vh) translateX(18px) rotate(180deg);
          }
          100% {
            transform: translateY(105vh) translateX(-12px) rotate(360deg);
          }
        }

        /* 1. TOP GARLAND LIGHT WIRE */
        .xmas-garland-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 22px;
          z-index: 50;
        }
        .xmas-lights-wire {
          position: absolute;
          top: 2px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #10B981, #EF4444, #F59E0B, #3B82F6, #10B981);
          opacity: 0.7;
        }
        .xmas-bulbs-container {
          display: flex;
          justify-content: space-around;
          align-items: flex-start;
          width: 100%;
          padding: 0 10px;
        }
        .xmas-bulb-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: bulb-pulse 2.2s infinite ease-in-out alternate;
        }
        .xmas-bulb-cap {
          width: 4px;
          height: 3px;
          background: #334155;
          border-radius: 1px;
        }
        .xmas-bulb-glass {
          width: 7px;
          height: 10px;
          border-radius: 50% 50% 40% 40%;
        }
        @keyframes bulb-pulse {
          0% { opacity: 0.65; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1.1); filter: brightness(1.25); }
        }

        /* 2. NATURAL SCROLL POSITIONED ACCESSORIES */
        /* Hero Baubles (Top-Left) */
        .xmas-spot-hero-baubles {
          position: absolute;
          top: 15px;
          left: 20px;
          z-index: 46;
          filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.22));
          animation: float-gentle 5s ease-in-out infinite;
          transform-origin: top center;
        }
        @media (min-width: 768px) {
          .xmas-spot-hero-baubles {
            top: 25px;
            left: 45px;
          }
        }

        /* Hero Bells (Top-Right) */
        .xmas-spot-hero-bells {
          position: absolute;
          top: 75px;
          right: 18px;
          z-index: 46;
          filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.22));
          animation: float-gentle 4.6s ease-in-out infinite 0.5s;
          transform-origin: top center;
        }
        @media (min-width: 768px) {
          .xmas-spot-hero-bells {
            top: 95px;
            right: 45px;
          }
        }

        /* Mid-Page Tree (Near Categories) */
        .xmas-spot-mid-tree {
          position: absolute;
          top: 920px;
          right: 20px;
          z-index: 45;
          filter: drop-shadow(0 14px 28px rgba(5, 150, 105, 0.3));
          animation: float-gentle 4.8s ease-in-out infinite 1s;
        }
        @media (min-width: 768px) {
          .xmas-spot-mid-tree {
            right: 48px;
          }
        }

        /* Mid-Page Bells (Near Why Us Promise) */
        .xmas-spot-mid-bells {
          position: absolute;
          top: 1720px;
          left: 18px;
          z-index: 45;
          filter: drop-shadow(0 12px 24px rgba(217, 119, 6, 0.3));
          animation: float-gentle 4.5s ease-in-out infinite 1.5s;
        }
        @media (min-width: 768px) {
          .xmas-spot-mid-bells {
            left: 48px;
          }
        }

        /* Mid-Page Baubles (Near Testimonials) */
        .xmas-spot-mid-baubles {
          position: absolute;
          top: 2480px;
          right: 20px;
          z-index: 45;
          filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.22));
          animation: float-gentle 5.2s ease-in-out infinite 2s;
        }
        @media (min-width: 768px) {
          .xmas-spot-mid-baubles {
            right: 48px;
          }
        }

        /* Bottom Grand Tree (Beside bottom CTA card) */
        .xmas-spot-bottom-tree {
          position: absolute;
          bottom: 120px;
          right: 24px;
          z-index: 46;
          filter: drop-shadow(0 16px 36px rgba(5, 150, 105, 0.38));
          animation: float-gentle 4.5s ease-in-out infinite;
        }
        @media (min-width: 768px) {
          .xmas-spot-bottom-tree {
            bottom: 160px;
            right: 60px;
          }
        }

        /* Bottom Bells (Framing footer) */
        .xmas-spot-bottom-bells {
          position: absolute;
          bottom: 80px;
          left: 20px;
          z-index: 45;
          filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.22));
          animation: float-gentle 4.2s ease-in-out infinite 0.7s;
        }
        @media (min-width: 768px) {
          .xmas-spot-bottom-bells {
            bottom: 90px;
            left: 50px;
          }
        }

        /* ANIMATIONS FOR BELLS, BAUBLES, TREE */
        .animate-sway-bauble-1 {
          transform-origin: 75px 80px;
          animation: sway-1 4.2s ease-in-out infinite alternate;
        }
        .animate-sway-bauble-2 {
          transform-origin: 140px 40px;
          animation: sway-2 5s ease-in-out infinite alternate;
        }
        .animate-sway-bauble-3 {
          transform-origin: 200px 110px;
          animation: sway-3 3.8s ease-in-out infinite alternate;
        }
        .animate-shimmer {
          animation: shimmer-pulse 2.5s ease-in-out infinite alternate;
        }
        @keyframes sway-1 {
          0% { transform: rotate(-5deg); }
          100% { transform: rotate(5deg); }
        }
        @keyframes sway-2 {
          0% { transform: rotate(3deg); }
          100% { transform: rotate(-3.5deg); }
        }
        @keyframes sway-3 {
          0% { transform: rotate(-4.5deg); }
          100% { transform: rotate(4.5deg); }
        }
        @keyframes shimmer-pulse {
          0% { opacity: 0.3; }
          100% { opacity: 0.8; }
        }

        .animate-bell-left {
          transform-origin: 95px 75px;
          animation: swing-bell-l 2.8s ease-in-out infinite alternate;
        }
        .animate-bell-right {
          transform-origin: 155px 75px;
          animation: swing-bell-r 2.8s ease-in-out infinite alternate;
        }
        .animate-clapper-l {
          animation: clapper-l 2.8s ease-in-out infinite alternate;
        }
        .animate-clapper-r {
          animation: clapper-r 2.8s ease-in-out infinite alternate;
        }
        .animate-bow {
          transform-origin: 130px 60px;
          animation: bow-bounce 3.5s ease-in-out infinite;
        }
        @keyframes swing-bell-l {
          0% { transform: rotate(-9deg); }
          100% { transform: rotate(6deg); }
        }
        @keyframes swing-bell-r {
          0% { transform: rotate(-5deg); }
          100% { transform: rotate(10deg); }
        }
        @keyframes clapper-l {
          0% { transform: translateX(5px); }
          100% { transform: translateX(-4px); }
        }
        @keyframes clapper-r {
          0% { transform: translateX(-4px); }
          100% { transform: translateX(6px); }
        }
        @keyframes bow-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .animate-sparkle-1 {
          animation: sparkle-twinkle 1.8s infinite ease-in-out alternate;
        }
        .animate-sparkle-2 {
          animation: sparkle-twinkle 2.4s infinite ease-in-out alternate 0.6s;
        }
        @keyframes sparkle-twinkle {
          0% { transform: scale(0.6) rotate(0deg); opacity: 0.4; }
          100% { transform: scale(1.2) rotate(45deg); opacity: 1; }
        }

        .xmas-light-1 { animation: bulb-glow 1.8s infinite ease-in-out alternate; }
        .xmas-light-2 { animation: bulb-glow 2.2s infinite ease-in-out alternate 0.5s; }
        .xmas-light-3 { animation: bulb-glow 2.6s infinite ease-in-out alternate 1s; }
        @keyframes bulb-glow {
          0% { opacity: 0.4; r: 4px; }
          100% { opacity: 1; r: 6.5px; filter: drop-shadow(0 0 6px #FDE047); }
        }

        .xmas-tree-star {
          animation: star-pulse 2s infinite ease-in-out alternate;
          transform-origin: 100px 30px;
        }
        @keyframes star-pulse {
          0% { transform: scale(0.95); opacity: 0.85; }
          100% { transform: scale(1.15); opacity: 1; filter: drop-shadow(0 0 10px #F59E0B); }
        }

        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        /* VIRTUAL SPLIT-SCREEN PREVIEW MODE (Inside Admin CMS) */
        .xmas-festival-root.virtual-preview-mode {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .xmas-festival-root.virtual-preview-mode .xmas-garland-top {
          top: 0;
        }
        .xmas-festival-root.virtual-preview-mode .xmas-spot-hero-baubles {
          top: 15px;
          left: 10px;
        }
        .xmas-festival-root.virtual-preview-mode .xmas-spot-hero-bells {
          top: 25px;
          right: 10px;
        }
        .xmas-festival-root.virtual-preview-mode .xmas-spot-bottom-tree {
          bottom: 15px;
          left: 12px;
          right: auto;
        }
        .xmas-festival-root.virtual-preview-mode .xmas-spot-bottom-bells {
          bottom: 15px;
          right: 12px;
          left: auto;
        }
      `}</style>
    </div>
  );
};

export default ChristmasAccessories;
