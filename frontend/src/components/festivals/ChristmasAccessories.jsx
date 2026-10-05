import React, { useMemo } from "react";
import { useSiteConfig } from "../../context/SiteConfigContext";

/**
 * Christmas Festival Accessories Component
 * Renders the vector Christmas Tree, Golden Bells, and Hanging Baubles
 * without modifying the brand color scheme.
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
    treePosition = "bottom-left",
    showBells = true,
    showOrnaments = true,
    showSnow = true,
  } = christmasOptions;

  // Snowflake particles for subtle winter atmosphere
  const snowflakes = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        left: `${(i * 4.16 + (i % 5) * 1.5) % 100}%`,
        size: `${Math.max(4, (i % 5) * 2.5 + 4)}px`,
        duration: `${8 + (i % 6) * 2}s`,
        delay: `${(i % 8) * 1.2}s`,
        opacity: 0.3 + (i % 4) * 0.18,
      })),
    []
  );

  return (
    <div
      className={`xmas-festival-overlay ${isVirtualPreview ? "virtual-preview-mode" : ""}`}
      aria-hidden="true"
    >
      {/* 1. Hanging Ornaments / Baubles (Pinned at top edge) */}
      {showOrnaments && (
        <div className="xmas-ornaments-wrapper" title="Festive Baubles">
          <svg
            id="ornaments-svg-element"
            className="xmas-ornaments-svg"
            viewBox="0 0 280 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
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

              <filter id="ornamentGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* TOP HANGING RIBBON STRINGS */}
            <g stroke="#FDE047" strokeWidth="1.2" opacity="0.75" strokeDasharray="3 2">
              <line x1="75" y1="0" x2="75" y2="80" />
              <line x1="140" y1="0" x2="140" y2="40" />
              <line x1="200" y1="0" x2="200" y2="110" />
            </g>

            {/* BAUBLE 1: Emerald Green (Left, Medium) */}
            <g className="animate-sway-bauble-1">
              <line x1="75" y1="0" x2="75" y2="80" stroke="#FBBF24" strokeWidth="1.5" />
              <path d="M 70 76 L 80 76 L 78 86 L 72 86 Z" fill="url(#capGrad)" />
              <circle cx="75" cy="73" r="4" fill="none" stroke="#FBBF24" strokeWidth="1.5" />
              <circle cx="75" cy="118" r="34" fill="url(#greenBaubleGrad)" />
              <path d="M 45 118 Q 75 135 105 118" stroke="#A7F3D0" strokeWidth="2" fill="none" opacity="0.6" strokeDasharray="4 3" />
              <path d="M 48 110 Q 75 127 102 110" stroke="#FEF08A" strokeWidth="1.5" fill="none" opacity="0.5" />
              <ellipse cx="63" cy="102" rx="9" ry="5" fill="#FFF" opacity="0.45" transform="rotate(-30 63 102)" />
            </g>

            {/* BAUBLE 2: Royal Crimson Red (Center, Large) */}
            <g className="animate-sway-bauble-2">
              <line x1="140" y1="0" x2="140" y2="40" stroke="#FBBF24" strokeWidth="1.5" />
              <path d="M 134 36 L 146 36 L 144 48 L 136 48 Z" fill="url(#capGrad)" />
              <circle cx="140" cy="33" r="4.5" fill="none" stroke="#FBBF24" strokeWidth="1.5" />
              <circle cx="140" cy="92" r="46" fill="url(#redBaubleGrad)" />
              <path d="M 140 60 L 140 124 M 108 92 L 172 92" stroke="#FEF08A" strokeWidth="1" opacity="0.3" strokeDasharray="2 4" />
              <circle cx="140" cy="92" r="28" fill="none" stroke="#FDE047" strokeWidth="1.5" opacity="0.4" strokeDasharray="6 4" />
              <path className="animate-shimmer" d="M 102 80 A 40 40 0 0 1 170 70" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" opacity="0.5" filter="url(#ornamentGlow)" />
              <ellipse cx="124" cy="70" rx="12" ry="6" fill="#FFF" opacity="0.55" transform="rotate(-28 124 70)" />
            </g>

            {/* BAUBLE 3: Sparkling Gold (Right, Small) */}
            <g className="animate-sway-bauble-3">
              <line x1="200" y1="0" x2="200" y2="110" stroke="#FBBF24" strokeWidth="1.5" />
              <path d="M 195 106 L 205 106 L 203 115 L 197 115 Z" fill="url(#capGrad)" />
              <circle cx="200" cy="103" r="3.5" fill="none" stroke="#FBBF24" strokeWidth="1.5" />
              <circle cx="200" cy="142" r="28" fill="url(#goldBaubleGrad)" />
              <path d="M 180 130 L 215 155 M 185 122 L 220 147" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
              <ellipse cx="190" cy="130" rx="7" ry="4" fill="#FFF" opacity="0.6" transform="rotate(-30 190 130)" />
            </g>
          </svg>
        </div>
      )}

      {/* 2. Golden Christmas Bells with Holly & Satin Bow (Top-Right Header Corner) */}
      {showBells && (
        <div className="xmas-bells-wrapper" title="Christmas Bells">
          <svg
            id="bells-svg-element"
            className="xmas-bells-svg"
            viewBox="0 0 260 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
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
            </defs>

            {/* Background Sparkles */}
            <g id="sparkles">
              <path className="animate-sparkle-1" fill="#FEF08A" d="M40 40 L43 47 L50 50 L43 53 L40 60 L37 53 L30 50 L37 47 Z" />
              <path className="animate-sparkle-2" fill="#FEF08A" d="M220 80 L222 85 L227 87 L222 89 L220 94 L218 89 L213 87 L218 85 Z" />
              <path className="animate-sparkle-1" fill="#FEF08A" d="M190 30 L191 33 L194 34 L191 35 L190 38 L189 35 L186 34 L189 33 Z" />
            </g>

            {/* LEFT BELL GROUP */}
            <g className="animate-bell-left">
              <circle className="animate-clapper-l" cx="82" cy="158" r="9" fill="url(#clapperGrad)" />
              <path d="M 102 75 C 102 75 90 120 62 132 C 55 135 50 142 58 148 C 68 155 106 155 116 148 C 122 142 118 135 110 132 C 88 120 94 75 94 75 Z" fill="url(#goldBellGrad1)" />
              <ellipse cx="87" cy="146" rx="28" ry="6" fill="none" stroke="#FEF08A" strokeWidth="2" opacity="0.6" />
              <path d="M 70 95 Q 85 98 100 95" stroke="#FEF08A" strokeWidth="1.5" fill="none" opacity="0.5" />
            </g>

            {/* RIGHT BELL GROUP */}
            <g className="animate-bell-right">
              <circle className="animate-clapper-r" cx="170" cy="162" r="9.5" fill="url(#clapperGrad)" />
              <path d="M 160 75 C 160 75 148 122 118 136 C 110 140 106 147 115 153 C 126 160 168 160 178 153 C 185 147 180 140 172 136 C 148 122 152 75 152 75 Z" fill="url(#goldBellGrad2)" />
              <ellipse cx="147" cy="151" rx="30" ry="6.5" fill="none" stroke="#FEF08A" strokeWidth="2" opacity="0.6" />
              <path d="M 130 98 Q 148 102 162 98" stroke="#FEF08A" strokeWidth="1.5" fill="none" opacity="0.5" />
            </g>

            {/* HOLLY LEAVES & BERRIES */}
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

            {/* SATIN RIBBON BOW GROUP */}
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
        </div>
      )}

      {/* 3. Vector Christmas Tree Accessory (Floating Widget) */}
      {showTree && (
        <div id="xmas-accessory" className={`xmas-tree-widget widget-pos-${treePosition}`}>
          <div className="xmas-tree-inner">
            <svg
              viewBox="0 0 200 260"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="xmas-tree-svg"
            >
              <defs>
                <linearGradient id="tTop" x1="100" y1="30" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="tMid" x1="100" y1="80" x2="100" y2="160" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="tBase" x1="100" y1="130" x2="100" y2="230" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#064E3B" />
                </linearGradient>
                <linearGradient id="tTrunk" x1="90" y1="220" x2="110" y2="250" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#78350F" />
                  <stop offset="100%" stopColor="#451A03" />
                </linearGradient>
                <filter id="gGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feComposite in="SourceGraphic" in2="b" operator="over" />
                </filter>
              </defs>

              <rect x="88" y="215" width="24" height="35" rx="4" fill="url(#tTrunk)" />
              <path d="M 100 120 L 175 220 C 150 228 130 220 100 228 C 70 220 50 228 25 220 Z" fill="url(#tBase)" />
              <path d="M 100 75 L 160 160 C 140 167 120 160 100 167 C 80 160 60 167 40 160 Z" fill="url(#tMid)" />
              <path d="M 100 30 L 145 105 C 130 112 115 106 100 112 C 85 106 70 112 55 105 Z" fill="url(#tTop)" />

              <g id="lights">
                <circle cx="75" cy="100" r="5" fill="#EF4444" className="xmas-light-1" />
                <circle cx="125" cy="145" r="5.5" fill="#EF4444" className="xmas-light-2" />
                <circle cx="100" cy="70" r="4.5" fill="#FACE15" className="xmas-light-3" />
                <circle cx="85" cy="155" r="5" fill="#FACE15" className="xmas-light-1" />
                <circle cx="122" cy="95" r="4.5" fill="#3B82F6" className="xmas-light-2" />
              </g>

              <g className="xmas-tree-star">
                <circle cx="100" cy="30" r="16" fill="#FDE047" opacity="0.25" filter="url(#gGlow)" />
                <polygon points="100,12 105,24 118,24 107,32 111,44 100,36 89,44 93,32 82,24 95,24" fill="#F59E0B" filter="url(#gGlow)" />
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* 4. Subtle Ambient Snowfall */}
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
        /* Christmas Overlay Container */
        .xmas-festival-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 998;
          overflow: hidden;
        }

        /* 1. Hanging Ornaments */
        .xmas-ornaments-wrapper {
          position: fixed;
          top: 0;
          left: 20px;
          width: 170px;
          height: auto;
          z-index: 999;
          filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.22));
          animation: float-gentle 5s ease-in-out infinite;
          transform-origin: top center;
        }
        .xmas-ornaments-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }

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

        /* 2. Golden Christmas Bells */
        .xmas-bells-wrapper {
          position: fixed;
          top: 76px;
          right: 28px;
          width: 135px;
          height: auto;
          z-index: 999;
          filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.25));
          animation: float-gentle 4.5s ease-in-out infinite;
        }
        .xmas-bells-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .animate-bell-left {
          transform-origin: 98px 75px;
          animation: bell-left-ring 2.8s ease-in-out infinite alternate;
        }
        .animate-bell-right {
          transform-origin: 156px 75px;
          animation: bell-right-ring 2.8s ease-in-out infinite alternate;
        }
        .animate-clapper-l {
          transform-origin: 82px 146px;
          animation: clapper-l-ring 2.8s ease-in-out infinite alternate;
        }
        .animate-clapper-r {
          transform-origin: 170px 150px;
          animation: clapper-r-ring 2.8s ease-in-out infinite alternate;
        }
        .animate-bow {
          transform-origin: 130px 65px;
          animation: bow-breath 3.5s ease-in-out infinite;
        }

        @keyframes bell-left-ring {
          0% { transform: rotate(-8deg); }
          100% { transform: rotate(5deg); }
        }
        @keyframes bell-right-ring {
          0% { transform: rotate(5deg); }
          100% { transform: rotate(-7deg); }
        }
        @keyframes clapper-l-ring {
          0% { transform: translate(-3px, -1px); }
          100% { transform: translate(4px, 1px); }
        }
        @keyframes clapper-r-ring {
          0% { transform: translate(3px, -1px); }
          100% { transform: translate(-4px, 1px); }
        }
        @keyframes bow-breath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .animate-sparkle-1 {
          animation: sparkle-twinkle 1.8s ease-in-out infinite alternate;
        }
        .animate-sparkle-2 {
          animation: sparkle-twinkle 2.4s ease-in-out infinite alternate 0.6s;
        }
        @keyframes sparkle-twinkle {
          0% { transform: scale(0.6); opacity: 0.2; }
          100% { transform: scale(1.15); opacity: 1; }
        }

        /* 3. Christmas Tree Widget */
        .xmas-tree-widget {
          position: fixed;
          z-index: 997;
          pointer-events: auto;
          transition: transform 0.3s ease;
        }
        .widget-pos-bottom-left {
          bottom: 24px;
          left: 24px;
        }
        .widget-pos-bottom-right {
          bottom: 96px; /* Offset above WhatsApp button */
          right: 24px;
        }
        .widget-pos-top-right {
          top: 140px;
          right: 24px;
        }
        .xmas-tree-inner {
          width: 155px;
          animation: float-gentle 4s infinite ease-in-out;
          filter: drop-shadow(0 14px 28px rgba(4, 120, 87, 0.3));
        }
        .xmas-tree-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .xmas-light-1 {
          animation: tw 1.8s infinite ease-in-out;
        }
        .xmas-light-2 {
          animation: tw 2.4s infinite ease-in-out 0.6s;
        }
        .xmas-light-3 {
          animation: tw 2.1s infinite ease-in-out 1.2s;
        }

        .xmas-tree-star {
          transform-origin: 100px 30px;
          animation: star 3s infinite ease-in-out;
        }

        @keyframes tw {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px currentColor); }
          50% { opacity: 0.25; }
        }
        @keyframes star {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.18); }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        /* 4. Snowfall Container */
        .xmas-snow-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 996;
        }
        .xmas-snowflake {
          position: absolute;
          top: -20px;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.85);
          animation: snowfall linear infinite;
        }
        @keyframes snowfall {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(105vh) rotate(360deg);
          }
        }

        /* Virtual Split-Screen Preview Mode in Admin Dashboard */
        .xmas-festival-overlay.virtual-preview-mode {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
          pointer-events: none !important;
          z-index: 10 !important;
        }
        .xmas-festival-overlay.virtual-preview-mode .xmas-ornaments-wrapper {
          position: absolute !important;
          top: 0 !important;
          left: 10px !important;
          width: 75px !important;
          z-index: 12 !important;
        }
        .xmas-festival-overlay.virtual-preview-mode .xmas-bells-wrapper {
          position: absolute !important;
          top: 36px !important;
          right: 10px !important;
          width: 60px !important;
          z-index: 12 !important;
        }
        .xmas-festival-overlay.virtual-preview-mode .xmas-tree-widget {
          position: absolute !important;
          z-index: 12 !important;
        }
        .xmas-festival-overlay.virtual-preview-mode .xmas-tree-inner {
          width: 75px !important;
        }
        .xmas-festival-overlay.virtual-preview-mode .widget-pos-bottom-left {
          bottom: 12px !important;
          left: 12px !important;
        }
        .xmas-festival-overlay.virtual-preview-mode .widget-pos-bottom-right {
          bottom: 12px !important;
          right: 12px !important;
        }
        .xmas-festival-overlay.virtual-preview-mode .widget-pos-top-right {
          top: 55px !important;
          right: 10px !important;
        }
        .xmas-festival-overlay.virtual-preview-mode .xmas-snow-container {
          position: absolute !important;
          inset: 0 !important;
          overflow: hidden !important;
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .xmas-ornaments-wrapper {
            width: 105px;
            left: 8px;
          }
          .xmas-bells-wrapper {
            width: 90px;
            right: 12px;
            top: 70px;
          }
          .xmas-tree-inner {
            width: 110px;
          }
          .widget-pos-bottom-left {
            bottom: 16px;
            left: 12px;
          }
          .widget-pos-bottom-right {
            bottom: 84px;
            right: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChristmasAccessories;
