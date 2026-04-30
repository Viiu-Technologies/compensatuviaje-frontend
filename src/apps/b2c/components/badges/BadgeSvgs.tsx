/**
 * BadgeSvgs.tsx
 * Raw animated SVG badge wrappers using dangerouslySetInnerHTML.
 * Do NOT convert to JSX — CSS keyframe animations rely on class names
 * and SVG attributes that would break during JSX conversion.
 */

const GLOBE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%" role="img" overflow="visible">
<title>Elite Premium Eco Globe Badge</title>
<defs>
  <filter id="f-shadow" x="-60%" y="-60%" width="220%" height="220%">
    <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#0F172A" flood-opacity="0.18"/>
  </filter>
  <filter id="f-shadow-sm" x="-40%" y="-40%" width="180%" height="180%">
    <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0F172A" flood-opacity="0.22"/>
  </filter>
  <filter id="f-glow-green" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="2.5" result="blur"/>
    <feColorMatrix in="blur" type="matrix"
      values="0 0 0 0 0.2
              0 0 0 0 1
              0 0 0 0 0.4
              0 0 0 2 0" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="f-glow-cyan" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="2" result="blur"/>
    <feColorMatrix in="blur" type="matrix"
      values="0 0 0 0 0
              0 0 0 0 0.9
              0 0 0 0 1
              0 0 0 2 0" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="f-glow-white" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="1.5" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="f-atmosphere" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="3" result="blur"/>
    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
  </filter>
  <radialGradient id="g-aura" cx="42%" cy="38%" r="58%">
    <stop offset="0%"   stop-color="#FFFFFF" stop-opacity="1.0"/>
    <stop offset="40%"  stop-color="#E8F5E9" stop-opacity="0.95"/>
    <stop offset="75%"  stop-color="#C8E6C9" stop-opacity="0.7"/>
    <stop offset="100%" stop-color="#A5D6A7" stop-opacity="0.3"/>
  </radialGradient>
  <radialGradient id="g-ocean" cx="38%" cy="32%" r="72%">
    <stop offset="0%"   stop-color="#4FC3F7"/>
    <stop offset="35%"  stop-color="#0288D1"/>
    <stop offset="70%"  stop-color="#01579B"/>
    <stop offset="100%" stop-color="#013A6B"/>
  </radialGradient>
  <linearGradient id="g-land" x1="30" y1="25" x2="90" y2="95" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="#E6FF99"/>
    <stop offset="30%"  stop-color="#69F07A"/>
    <stop offset="65%"  stop-color="#2E7D32"/>
    <stop offset="100%" stop-color="#1B3A20"/>
  </linearGradient>
  <radialGradient id="g-globe-vol" cx="33%" cy="28%" r="75%">
    <stop offset="0%"   stop-color="#FFFFFF" stop-opacity="0.80"/>
    <stop offset="18%"  stop-color="#FFFFFF" stop-opacity="0.30"/>
    <stop offset="40%"  stop-color="#FFFFFF" stop-opacity="0.00"/>
    <stop offset="65%"  stop-color="#000B20" stop-opacity="0.10"/>
    <stop offset="85%"  stop-color="#000B20" stop-opacity="0.38"/>
    <stop offset="100%" stop-color="#000B20" stop-opacity="0.72"/>
  </radialGradient>
  <radialGradient id="g-specular" cx="30%" cy="25%" r="25%">
    <stop offset="0%"   stop-color="#FFFFFF" stop-opacity="0.90"/>
    <stop offset="60%"  stop-color="#FFFFFF" stop-opacity="0.20"/>
    <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.00"/>
  </radialGradient>
  <radialGradient id="g-atmos" cx="50%" cy="50%" r="50%">
    <stop offset="88%"  stop-color="#4FC3F7" stop-opacity="0.00"/>
    <stop offset="94%"  stop-color="#80DEEA" stop-opacity="0.45"/>
    <stop offset="100%" stop-color="#B2EBF2" stop-opacity="0.00"/>
  </radialGradient>
  <linearGradient id="g-leaf-a-light" x1="0%" y1="100%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="#388E3C"/>
    <stop offset="50%"  stop-color="#66BB6A"/>
    <stop offset="100%" stop-color="#CCFF90"/>
  </linearGradient>
  <linearGradient id="g-leaf-a-dark" x1="0%" y1="100%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="#1B5E20"/>
    <stop offset="100%" stop-color="#4CAF50"/>
  </linearGradient>
  <linearGradient id="g-leaf-b-light" x1="0%" y1="100%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="#2E7D32"/>
    <stop offset="50%"  stop-color="#43A047"/>
    <stop offset="100%" stop-color="#B9F6CA"/>
  </linearGradient>
  <linearGradient id="g-leaf-b-dark" x1="0%" y1="100%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="#0A2E0C"/>
    <stop offset="100%" stop-color="#2E7D32"/>
  </linearGradient>
  <linearGradient id="g-ring" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%"   stop-color="#80CBC4" stop-opacity="0.8"/>
    <stop offset="30%"  stop-color="#B2DFDB" stop-opacity="0.15"/>
    <stop offset="60%"  stop-color="#4DB6AC" stop-opacity="0.05"/>
    <stop offset="100%" stop-color="#00796B" stop-opacity="0.75"/>
  </linearGradient>
  <linearGradient id="g-neon-orbit" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="#00E5FF" stop-opacity="0.9"/>
    <stop offset="50%"  stop-color="#69F0AE" stop-opacity="0.4"/>
    <stop offset="100%" stop-color="#00E5FF" stop-opacity="0.9"/>
  </linearGradient>
  <radialGradient id="g-bokeh" cx="50%" cy="50%" r="50%">
    <stop offset="0%"   stop-color="#A5F3B4" stop-opacity="0.8"/>
    <stop offset="100%" stop-color="#A5F3B4" stop-opacity="0"/>
  </radialGradient>
  <clipPath id="cp-globe"><circle cx="60" cy="60" r="29.8"/></clipPath>
  <clipPath id="cp-outer"><circle cx="60" cy="60" r="56"/></clipPath>
  <marker id="mk-arrow" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
    <path d="M0 0 L4 2 L0 4 Z" fill="#69F0AE" opacity="0.8"/>
  </marker>
  <style>
    .a-float       { animation: kf-float 7s ease-in-out infinite; transform-origin: 60px 60px; }
    .a-blob        { animation: kf-blob 28s linear infinite; transform-origin: 60px 60px; }
    .a-globe-land  { animation: kf-land 12s linear infinite; }
    .a-leaf-1      { animation: kf-leaf 8s ease-in-out infinite; transform-origin: 42px 84px; }
    .a-leaf-2      { animation: kf-leaf 8s ease-in-out infinite 0.5s; transform-origin: 34px 90px; }
    .a-orbit       { animation: kf-orbit 16s ease-in-out infinite; transform-origin: 60px 60px; }
    .a-orbit-sh    { animation: kf-orbit-sh 16s ease-in-out infinite; transform-origin: 60px 60px; }
    .a-ring-outer  { animation: kf-ring 35s linear infinite; transform-origin: 60px 60px; }
    .a-ring-inner  { animation: kf-ring 20s linear infinite reverse; transform-origin: 60px 60px; }
    .a-dot-1       { animation: kf-dot 5s ease-in-out infinite; }
    .a-dot-2       { animation: kf-dot 5s ease-in-out infinite 0.9s; }
    .a-dot-3       { animation: kf-dot 5s ease-in-out infinite 1.8s; }
    .a-dot-4       { animation: kf-dot 5s ease-in-out infinite 0.4s; }
    .a-dot-5       { animation: kf-dot 5s ease-in-out infinite 1.3s; }
    .a-bokeh-1     { animation: kf-bokeh 9s ease-in-out infinite; }
    .a-bokeh-2     { animation: kf-bokeh 11s ease-in-out infinite 3s; }
    .a-bokeh-3     { animation: kf-bokeh 7s ease-in-out infinite 1.5s; }
    .a-shimmer     { animation: kf-shimmer 4s ease-in-out infinite; }
    .a-pulse-atmos { animation: kf-pulse-atmos 5s ease-in-out infinite; }
    @keyframes kf-float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-6px); }
    }
    @keyframes kf-blob {
      0%   { transform: rotate(0deg) scale(1); }
      50%  { transform: rotate(180deg) scale(1.015); }
      100% { transform: rotate(360deg) scale(1); }
    }
    @keyframes kf-land {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-64px); }
    }
    @keyframes kf-leaf {
      0%, 100% { transform: rotate(0deg) scale(1); }
      30%       { transform: rotate(-5deg) scale(1.02); }
      70%       { transform: rotate(2deg) scale(0.99); }
    }
    @keyframes kf-orbit {
      0%, 100% { transform: rotate(-10deg) scaleY(0.42); }
      50%       { transform: rotate(-18deg) scaleY(0.40); }
    }
    @keyframes kf-orbit-sh {
      0%, 100% { transform: rotate(-10deg); }
      50%       { transform: rotate(-18deg); }
    }
    @keyframes kf-ring {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes kf-dot {
      0%, 100% { transform: translate(0, 0) scale(0.8); opacity: 0.45; }
      50%       { transform: translate(0, -9px) scale(1.2); opacity: 1; }
    }
    @keyframes kf-bokeh {
      0%, 100% { opacity: 0.12; transform: scale(1); }
      50%       { opacity: 0.35; transform: scale(1.15); }
    }
    @keyframes kf-shimmer {
      0%, 100% { opacity: 0.3; }
      50%       { opacity: 0.7; }
    }
    @keyframes kf-pulse-atmos {
      0%, 100% { opacity: 0.5; r: 30.5; }
      50%       { opacity: 0.9; r: 31.5; }
    }
  </style>
</defs>
<g class="a-float">
  <circle class="a-bokeh-1" cx="90" cy="18" r="16" fill="url(#g-bokeh)" opacity="0.18"/>
  <circle class="a-bokeh-2" cx="18" cy="82" r="12" fill="url(#g-bokeh)" opacity="0.18"/>
  <circle class="a-bokeh-3" cx="96" cy="86" r="10" fill="url(#g-bokeh)" opacity="0.14"/>
  <g filter="url(#f-shadow)">
    <path class="a-blob"
      d="M60 7 C72 4 88 8 98 18 C110 30 115 46 114 60 C113 76 105 92 92 102 C79 112 63 116 48 112 C33 108 18 98 11 84 C4 70 5 52 12 38 C20 23 35 10 50 7.5 C53.3 7 56.6 7.3 60 7Z"
      fill="url(#g-aura)"/>
  </g>
  <g class="a-ring-outer" clip-path="url(#cp-outer)">
    <ellipse cx="60" cy="60" rx="52" ry="52" fill="none" stroke="url(#g-ring)" stroke-width="1.1"/>
    <ellipse cx="60" cy="60" rx="47" ry="47" fill="none" stroke="url(#g-ring)" stroke-width="0.55" stroke-dasharray="3 7" opacity="0.7"/>
  </g>
  <g class="a-ring-inner" clip-path="url(#cp-outer)">
    <ellipse cx="60" cy="60" rx="55" ry="55" fill="none" stroke="url(#g-ring)" stroke-width="0.4" stroke-dasharray="1 10" opacity="0.5"/>
  </g>
  <g class="a-orbit">
    <ellipse cx="60" cy="60" rx="42" ry="17" fill="none" stroke="url(#g-neon-orbit)" stroke-width="1.0" stroke-dasharray="5 4" filter="url(#f-glow-cyan)" opacity="0.85"/>
  </g>
  <g class="a-orbit-sh">
    <circle cx="60" cy="15" r="4.2" fill="#0F2040" opacity="0.3"/>
    <circle cx="60" cy="15" r="3.8" fill="#B3E5FC"/>
    <circle cx="60" cy="15" r="3.8" fill="none" stroke="#0277BD" stroke-width="0.5" opacity="0.6"/>
    <circle cx="58.8" cy="14" r="1.2" fill="#FFFFFF" opacity="0.55" filter="url(#f-glow-white)"/>
    <path d="M57.5 15.5 Q60 17.5 62.5 15.5" fill="none" stroke="#4FC3F7" stroke-width="0.4" opacity="0.7"/>
  </g>
  <g>
    <circle cx="60" cy="60" r="30" fill="url(#g-ocean)"/>
    <g clip-path="url(#cp-globe)">
      <g class="a-globe-land" fill="url(#g-land)">
        <path d="M25 38 C28 30 38 26 46 30 C50 33 49 40 44 46 C40 51 33 52 28 48 C23 44 22 42 25 38Z"/>
        <path d="M36 53 C38 51 42 52 43 55 C44 58 41 60 38 59 C35 57 34 55 36 53Z"/>
        <path d="M33 62 C37 58 44 60 47 66 C50 73 47 82 42 85 C37 87 31 82 29 76 C27 70 28 66 33 62Z"/>
        <path d="M62 32 C66 28 74 28 77 33 C80 38 78 46 73 49 C68 51 62 48 60 43 C58 38 59 36 62 32Z"/>
        <path d="M63 52 C67 50 72 52 73 58 C74 64 70 70 65 71 C60 71 57 66 58 60 C59 55 61 53 63 52Z"/>
        <path d="M62 73 C65 71 69 73 70 77 C71 82 68 86 64 86 C60 86 58 82 59 77 C60 74 60 73 62 73Z"/>
        <path d="M82 36 C88 32 96 34 99 40 C102 46 99 53 93 55 C87 57 81 52 80 46 C79 41 80 38 82 36Z"/>
        <path d="M90 58 C94 56 98 58 100 63 C101 67 98 72 93 72 C88 72 85 68 86 63 C87 60 88 58 90 58Z"/>
        <path d="M89 38 C92 30 102 26 110 30 C114 33 113 40 108 46 C104 51 97 52 92 48 C87 44 86 42 89 38Z"/>
        <path d="M126 32 C130 28 138 28 141 33 C144 38 142 46 137 49 C132 51 126 48 124 43 C122 38 123 36 126 32Z"/>
        <path d="M127 52 C131 50 136 52 137 58 C138 64 134 70 129 71 C124 71 121 66 122 60 C123 55 125 53 127 52Z"/>
        <path d="M146 36 C152 32 160 34 163 40 C166 46 163 53 157 55 C151 57 145 52 144 46 C143 41 144 38 146 36Z"/>
      </g>
      <g fill="none" stroke="#FFFFFF" stroke-width="0.65" opacity="0.35">
        <path d="M 33 47 Q 60 58 87 47"/>
        <path d="M 30 60 Q 60 73 90 60"/>
        <path d="M 33 73 Q 60 83 87 73"/>
        <path d="M 60 30 Q 63 60 60 90" opacity="0.5"/>
        <path d="M 48 31 Q 44 60 48 89" opacity="0.3"/>
        <path d="M 72 31 Q 76 60 72 89" opacity="0.3"/>
      </g>
      <g fill="#FFFFFF" opacity="0.18">
        <ellipse cx="40" cy="42" rx="9" ry="3.5" transform="rotate(-8 40 42)"/>
        <ellipse cx="72" cy="48" rx="7" ry="2.5" transform="rotate(5 72 48)"/>
        <ellipse cx="55" cy="35" rx="6" ry="2" transform="rotate(-3 55 35)"/>
        <ellipse cx="70" cy="70" rx="8" ry="2.8" transform="rotate(4 70 70)"/>
      </g>
    </g>
    <circle cx="60" cy="60" r="30" fill="url(#g-globe-vol)"/>
    <circle cx="60" cy="60" r="30" fill="url(#g-atmos)"/>
    <ellipse cx="51" cy="48" rx="8" ry="6" fill="url(#g-specular)" transform="rotate(-20 51 48)"/>
    <circle cx="60" cy="60" r="31" fill="none" stroke="#80DEEA" stroke-width="2.5" opacity="0.28" class="a-pulse-atmos" filter="url(#f-atmosphere)"/>
    <circle cx="60" cy="60" r="29.7" fill="none" stroke="rgba(255,255,255,0.42)" stroke-width="1.0"/>
  </g>
  <g class="a-orbit">
    <ellipse cx="60" cy="60" rx="42" ry="17" fill="none" stroke="url(#g-neon-orbit)" stroke-width="0.7" stroke-dasharray="3 6" opacity="0.55"/>
  </g>
  <g class="a-orbit-sh">
    <circle cx="60" cy="105" r="5.5" fill="#C8E6C9" filter="url(#f-shadow-sm)"/>
    <circle cx="60" cy="105" r="5.5" fill="none" stroke="#2E7D32" stroke-width="0.7" opacity="0.8"/>
    <circle cx="58.5" cy="103.5" r="1.1" fill="none" stroke="#388E3C" stroke-width="0.5" opacity="0.7"/>
    <circle cx="61.5" cy="106.5" r="0.7" fill="none" stroke="#388E3C" stroke-width="0.4" opacity="0.5"/>
    <circle cx="58.8" cy="103.2" r="1.6" fill="#FFFFFF" opacity="0.60" filter="url(#f-glow-white)"/>
    <ellipse cx="60" cy="110.5" rx="4" ry="1.2" fill="#0F172A" opacity="0.15"/>
  </g>
  <g filter="url(#f-shadow)">
    <g class="a-leaf-1">
      <path d="M42 84 Q28 76 20 58 Q26 48 38 46 Q46 54 42 84Z" fill="url(#g-leaf-a-light)"/>
      <path d="M42 84 Q34 68 26 52 Q32 48 38 46 Q42 58 42 84Z" fill="url(#g-leaf-a-dark)"/>
      <path d="M38 46 Q39 62 42 84" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.7"/>
      <path d="M38 54 Q33 58 28 56" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.5"/>
      <path d="M39.5 64 Q34 66 30 63" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.5"/>
      <path d="M40.5 74 Q36 75 32 73" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.4"/>
    </g>
    <g class="a-leaf-2">
      <path d="M34 90 Q18 84 12 68 Q16 56 26 54 Q32 64 34 90Z" fill="url(#g-leaf-b-light)"/>
      <path d="M34 90 Q26 76 18 62 Q22 56 26 54 Q30 66 34 90Z" fill="url(#g-leaf-b-dark)"/>
      <path d="M26 54 Q29 70 34 90" fill="none" stroke="rgba(255,255,255,0.30)" stroke-width="0.7"/>
      <path d="M27 62 Q22 65 19 63" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="0.4"/>
      <path d="M29 72 Q24 74 21 72" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="0.4"/>
    </g>
  </g>
  <g class="a-dot-1" filter="url(#f-glow-green)">
    <circle cx="94" cy="22" r="2.8" fill="#C6FF00"/>
    <circle cx="94" cy="22" r="1.2" fill="#FFFFFF" opacity="0.85"/>
  </g>
  <g class="a-dot-2" filter="url(#f-glow-cyan)">
    <circle cx="108" cy="70" r="2.0" fill="#18FFFF"/>
    <circle cx="108" cy="70" r="0.8" fill="#FFFFFF" opacity="0.9"/>
  </g>
  <g class="a-dot-3" filter="url(#f-glow-green)">
    <circle cx="18" cy="28" r="2.2" fill="#69F0AE"/>
    <circle cx="18" cy="28" r="0.9" fill="#FFFFFF" opacity="0.8"/>
  </g>
  <g class="a-dot-4">
    <circle cx="15" cy="78" r="1.7" fill="#FFFF00" filter="url(#f-glow-green)"/>
    <circle cx="15" cy="78" r="0.7" fill="#FFFFFF" opacity="0.75"/>
  </g>
  <g class="a-dot-5" filter="url(#f-glow-green)">
    <circle cx="97" cy="48" r="1.6" fill="#00E676"/>
    <circle cx="97" cy="48" r="0.6" fill="#FFFFFF" opacity="0.8"/>
  </g>
  <g class="a-dot-1" filter="url(#f-glow-cyan)" style="animation-delay: 2.2s">
    <circle cx="32" cy="100" r="1.5" fill="#40C4FF"/>
    <circle cx="32" cy="100" r="0.6" fill="#FFFFFF" opacity="0.9"/>
  </g>
  <g class="a-shimmer" opacity="0.5">
    <path d="M88 14 L89.5 16 L88 18 L86.5 16 Z" fill="#FFFFFF" opacity="0.6"/>
  </g>
  <g class="a-shimmer" style="animation-delay: 2s" opacity="0.4">
    <path d="M26 42 L27 44 L26 46 L25 44 Z" fill="#FFFFFF" opacity="0.5"/>
  </g>
</g>
</svg>`;

const SPROUT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%" role="img">
<title>Animated Sprout Badge</title>
<defs>
  <radialGradient id="bgGrad" cx="50%" cy="45%" r="55%">
    <stop offset="0%" stop-color="#FFFDE7"/>
    <stop offset="50%" stop-color="#FFF8D6"/>
    <stop offset="100%" stop-color="#FFE9A0"/>
  </radialGradient>
  <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
    <stop offset="60%" stop-color="#66BB6A" stop-opacity="0.15"/>
    <stop offset="85%" stop-color="#A5D6A7" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#C8E6C9" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="stemGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#66BB6A"/>
    <stop offset="40%" stop-color="#4CAF50"/>
    <stop offset="100%" stop-color="#2E7D32"/>
  </linearGradient>
  <linearGradient id="seedGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#6D4C41"/>
    <stop offset="50%" stop-color="#4E342E"/>
    <stop offset="100%" stop-color="#3E2723"/>
  </linearGradient>
  <linearGradient id="seedHighlight" x1="0.3" y1="0" x2="0.7" y2="1">
    <stop offset="0%" stop-color="#8D6E63" stop-opacity="0.6"/>
    <stop offset="100%" stop-color="#4E342E" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="leafL" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#81C784"/>
    <stop offset="100%" stop-color="#43A047"/>
  </linearGradient>
  <linearGradient id="leafR" x1="1" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#4CAF50"/>
    <stop offset="100%" stop-color="#2E7D32"/>
  </linearGradient>
  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#FFD54F"/>
    <stop offset="25%" stop-color="#FFCA28"/>
    <stop offset="50%" stop-color="#FFC107"/>
    <stop offset="75%" stop-color="#FFB300"/>
    <stop offset="100%" stop-color="#FFD54F"/>
  </linearGradient>
  <radialGradient id="sparkle">
    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1"/>
    <stop offset="50%" stop-color="#FFFDE7" stop-opacity="0.6"/>
    <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="shineGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="white" stop-opacity="0"/>
    <stop offset="40%" stop-color="white" stop-opacity="0"/>
    <stop offset="50%" stop-color="white" stop-opacity="0.25"/>
    <stop offset="60%" stop-color="white" stop-opacity="0"/>
    <stop offset="100%" stop-color="white" stop-opacity="0"/>
  </linearGradient>
  <filter id="shadow" x="-15%" y="-15%" width="130%" height="130%">
    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#5D4037" flood-opacity="0.18"/>
  </filter>
  <filter id="leafGlow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur"/>
    <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.8  0 0 0 0 0.4  0 0 0 0.3 0" result="glow"/>
    <feMerge>
      <feMergeNode in="glow"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
  <filter id="sparkGlow">
    <feGaussianBlur stdDeviation="0.8"/>
  </filter>
  <clipPath id="badgeClip">
    <circle cx="60" cy="60" r="56"/>
  </clipPath>
  <style>
    .st{animation:gr 6s cubic-bezier(.4,0,.2,1) infinite;transform-origin:60px 85px}
    .lv{animation:bl 6s cubic-bezier(.4,0,.2,1) infinite;transform-origin:60px 50px}
    .ll{animation:swl 6s ease-in-out infinite;transform-origin:60px 50px}
    .lr{animation:swr 6s ease-in-out infinite;transform-origin:60px 50px}
    .sd{animation:sd 6s ease-in-out infinite;transform-origin:60px 85px}
    .d1{animation:p 6s ease-in-out infinite .2s}
    .d2{animation:p 6s ease-in-out infinite .4s}
    .d3{animation:p 6s ease-in-out infinite .6s}
    .d4{animation:p 6s ease-in-out infinite .8s}
    .d5{animation:p 6s ease-in-out infinite 1s}
    .d6{animation:p 6s ease-in-out infinite 1.2s}
    .sp1{animation:sparkPulse 3s ease-in-out infinite 0s}
    .sp2{animation:sparkPulse 3s ease-in-out infinite 0.5s}
    .sp3{animation:sparkPulse 3s ease-in-out infinite 1s}
    .sp4{animation:sparkPulse 3s ease-in-out infinite 1.5s}
    .sp5{animation:sparkPulse 3s ease-in-out infinite 2s}
    .sp6{animation:sparkPulse 3s ease-in-out infinite 2.5s}
    .ring-rotate{animation:ringRotate 20s linear infinite;transform-origin:60px 60px}
    .outer-glow{animation:glowPulse 4s ease-in-out infinite;transform-origin:60px 60px}
    .shine{animation:shineSweep 6s ease-in-out infinite 2s}
    .float1{animation:float 4s ease-in-out infinite 0s}
    .float2{animation:float 4s ease-in-out infinite 0.7s}
    .float3{animation:float 4s ease-in-out infinite 1.4s}
    .seed-shine{animation:seedShine 6s ease-in-out infinite}
    @keyframes gr{0%,10%{transform:scaleY(0)}35%,80%{transform:scaleY(1)}95%,100%{transform:scaleY(0)}}
    @keyframes bl{0%,28%{transform:translate(0,35px) scale(0);opacity:0}45%,80%{transform:translate(0,0) scale(1);opacity:1}95%,100%{transform:translate(0,35px) scale(0);opacity:0}}
    @keyframes swl{0%,40%{transform:rotate(0deg)}50%{transform:rotate(-8deg)}60%{transform:rotate(-5deg)}70%{transform:rotate(-7deg)}80%,100%{transform:rotate(0deg)}}
    @keyframes swr{0%,40%{transform:rotate(0deg)}50%{transform:rotate(8deg)}60%{transform:rotate(5deg)}70%{transform:rotate(7deg)}80%,100%{transform:rotate(0deg)}}
    @keyframes sd{0%,10%{transform:scale(.6);opacity:.5}35%,80%{transform:scale(1);opacity:1}95%,100%{transform:scale(.6);opacity:.5}}
    @keyframes p{0%,20%{opacity:0;transform:translateY(4px) scale(0.5)}45%,75%{opacity:1;transform:translateY(0) scale(1)}90%,100%{opacity:0;transform:translateY(-6px) scale(0.5)}}
    @keyframes sparkPulse{0%,100%{opacity:0;transform:scale(0)}30%{opacity:1;transform:scale(1.2)}50%{opacity:0.8;transform:scale(0.9)}70%{opacity:1;transform:scale(1.1)}90%{opacity:0;transform:scale(0)}}
    @keyframes ringRotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    @keyframes glowPulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.06);opacity:1}}
    @keyframes shineSweep{0%,30%{transform:translateX(-120px)}50%,60%{transform:translateX(120px)}100%{transform:translateX(120px)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    @keyframes seedShine{0%,10%{opacity:0}40%,75%{opacity:1}90%,100%{opacity:0}}
  </style>
</defs>
<g id="outer_glow" class="outer-glow">
  <circle cx="60" cy="60" r="59" fill="url(#glowGrad)"/>
</g>
<g id="background" filter="url(#shadow)">
  <circle cx="60" cy="60" r="56" fill="url(#bgGrad)"/>
</g>
<g id="decorative_ring">
  <path fill-rule="evenodd" d="M60 7A53 53 0 1060 113A53 53 0 1060 7ZM60 9A51 51 0 1160 111A51 51 0 1160 9Z" fill="url(#ringGrad)" opacity="0.7"/>
  <path fill-rule="evenodd" d="M60 11.5A48.5 48.5 0 1060 108.5A48.5 48.5 0 1060 11.5ZM60 12.3A47.7 47.7 0 1160 107.7A47.7 47.7 0 1160 12.3Z" fill="url(#ringGrad)" opacity="0.45"/>
  <g class="ring-rotate" opacity="0.5">
    <circle cx="60" cy="8.5" r="1.8" fill="#FFD54F"/>
    <circle cx="60" cy="111.5" r="1.8" fill="#FFD54F"/>
    <circle cx="8.5" cy="60" r="1.8" fill="#FFD54F"/>
    <circle cx="111.5" cy="60" r="1.8" fill="#FFD54F"/>
    <circle cx="23" cy="23" r="1.2" fill="#FFCA28"/>
    <circle cx="97" cy="23" r="1.2" fill="#FFCA28"/>
    <circle cx="23" cy="97" r="1.2" fill="#FFCA28"/>
    <circle cx="97" cy="97" r="1.2" fill="#FFCA28"/>
  </g>
</g>
<g id="accent_elements">
  <g class="d2 float1"><ellipse cx="28" cy="54" rx="2.5" ry="1.5" fill="#A5D6A7" transform="rotate(-20 28 54)"/></g>
  <g class="d4 float2"><ellipse cx="92" cy="54" rx="2.5" ry="1.5" fill="#A5D6A7" transform="rotate(20 92 54)"/></g>
  <g class="d6 float3"><circle cx="60" cy="21" r="2" fill="#FFCA28"/></g>
  <g class="d1 float2"><ellipse cx="79" cy="29" rx="2" ry="1.2" fill="#81C784" transform="rotate(30 79 29)"/></g>
  <g class="d3 float1"><ellipse cx="41" cy="29" rx="2" ry="1.2" fill="#C8E6C9" transform="rotate(-30 41 29)"/></g>
  <g class="d5 float3"><circle cx="23" cy="42" r="1.6" fill="#FFCA28"/></g>
  <g class="d1 float1"><circle cx="97" cy="42" r="1.6" fill="#81C784"/></g>
  <g class="d3 float2"><circle cx="35" cy="70" r="1.2" fill="#C8E6C9" opacity="0.7"/></g>
  <g class="d5 float1"><circle cx="85" cy="70" r="1.2" fill="#A5D6A7" opacity="0.7"/></g>
  <g class="d2 float3"><circle cx="45" cy="20" r="1" fill="#FFE082" opacity="0.8"/></g>
  <g class="d4 float2"><circle cx="75" cy="20" r="1" fill="#FFE082" opacity="0.8"/></g>
</g>
<g id="sparkles">
  <g class="sp1" style="transform-origin:25px 35px">
    <path d="M25 33 L25.5 35 L27 35.5 L25.5 36 L25 38 L24.5 36 L23 35.5 L24.5 35Z" fill="#FFD54F" filter="url(#sparkGlow)"/>
  </g>
  <g class="sp2" style="transform-origin:95px 50px">
    <path d="M95 48 L95.4 50 L97 50.4 L95.4 50.8 L95 53 L94.6 50.8 L93 50.4 L94.6 50Z" fill="#FFD54F" filter="url(#sparkGlow)"/>
  </g>
  <g class="sp3" style="transform-origin:72px 22px">
    <path d="M72 20.5 L72.3 22 L74 22.3 L72.3 22.6 L72 24.5 L71.7 22.6 L70 22.3 L71.7 22Z" fill="#FFFFFF" filter="url(#sparkGlow)"/>
  </g>
  <g class="sp4" style="transform-origin:18px 60px">
    <path d="M18 58.5 L18.3 60 L20 60.3 L18.3 60.6 L18 62.5 L17.7 60.6 L16 60.3 L17.7 60Z" fill="#FFE082" filter="url(#sparkGlow)"/>
  </g>
  <g class="sp5" style="transform-origin:48px 15px">
    <path d="M48 13.5 L48.3 15 L50 15.3 L48.3 15.6 L48 17.5 L47.7 15.6 L46 15.3 L47.7 15Z" fill="#FFD54F" filter="url(#sparkGlow)"/>
  </g>
  <g class="sp6" style="transform-origin:100px 70px">
    <path d="M100 68.5 L100.3 70 L102 70.3 L100.3 70.6 L100 72.5 L99.7 70.6 L98 70.3 L99.7 70Z" fill="#FFFFFF" filter="url(#sparkGlow)"/>
  </g>
</g>
<g id="stem">
  <g class="st">
    <rect x="57" y="50" width="6" height="35" rx="3" fill="url(#stemGrad)"/>
    <rect x="58" y="50" width="2" height="35" rx="1" fill="#81C784" opacity="0.4"/>
  </g>
</g>
<g id="seed" class="sd">
  <path d="M44 85a16 16 0 0032 0z" fill="url(#seedGrad)"/>
  <path d="M48 85a12 10 0 0024 0z" fill="url(#seedHighlight)" class="seed-shine"/>
  <path d="M60 85v14a16 16 0 0016-14z" fill="#3E2723" opacity="0.5"/>
  <line x1="60" y1="85" x2="60" y2="96" stroke="#5D4037" stroke-width="0.6" opacity="0.5"/>
</g>
<g id="leaves" class="lv" filter="url(#leafGlow)">
  <g class="ll">
    <path d="M60 50Q34 44 31 25Q40 32 60 50Z" fill="url(#leafL)"/>
    <path d="M60 50Q34 44 31 25Q36 24 60 50Z" fill="#4CAF50" opacity="0.8"/>
    <line x1="58" y1="49" x2="38" y2="32" stroke="#2E7D32" stroke-width="0.4" opacity="0.5"/>
  </g>
  <g class="lr">
    <path d="M60 50Q86 44 89 25Q80 32 60 50Z" fill="url(#leafR)"/>
    <path d="M60 50Q86 44 89 25Q84 24 60 50Z" fill="#2E7D32" opacity="0.8"/>
    <line x1="62" y1="49" x2="82" y2="32" stroke="#1B5E20" stroke-width="0.4" opacity="0.5"/>
  </g>
  <ellipse cx="60" cy="48" rx="4.5" ry="5.5" fill="#66BB6A"/>
  <ellipse cx="61" cy="48" rx="3" ry="5" fill="#4CAF50"/>
  <ellipse cx="59" cy="46" rx="1.5" ry="2" fill="#A5D6A7" opacity="0.5"/>
</g>
<g clip-path="url(#badgeClip)">
  <rect class="shine" x="-10" y="-10" width="60" height="140" fill="url(#shineGrad)" transform="rotate(25)"/>
</g>
</svg>`;

const TREE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%" role="img">
<title>Premium Eco Tree Badge</title>
<defs><style>
.c1{animation:breathe 5s ease-in-out infinite;transform-origin:44px 56px}
.c2{animation:breathe 6s ease-in-out infinite .6s;transform-origin:76px 52px}
.c3{animation:breathe 7s ease-in-out infinite 1.2s;transform-origin:60px 42px}
.f1{animation:drift 4.5s ease-in-out infinite}
.f2{animation:drift 5.5s ease-in-out infinite .9s}
.f3{animation:drift 4s ease-in-out infinite 1.5s}
.f4{animation:drift 6s ease-in-out infinite .3s}
.p1{animation:pulse 5s ease-in-out infinite;transform-origin:center}
.p2{animation:pulse 6s ease-in-out infinite 1.5s;transform-origin:center}
.p3{animation:pulse 4.5s ease-in-out infinite .8s;transform-origin:center}
.arc{animation:arcfade 6s ease-in-out infinite;transform-origin:60px 60px}
@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes pulse{0%,100%{opacity:.35;transform:scale(.85)}50%{opacity:.9;transform:scale(1.1)}}
@keyframes arcfade{0%,100%{opacity:.25}50%{opacity:.6}}
</style></defs>
<g id="background">
  <circle cx="60" cy="60" r="60" fill="#FFF3E0"/>
  <circle cx="60" cy="60" r="56" fill="#FFE0B2"/>
</g>
<g id="decorative_ring">
  <circle cx="60" cy="60" r="54" fill="none" stroke="#FFCC80" stroke-width="1.5"/>
  <circle cx="60" cy="60" r="50" fill="none" stroke="#FFB74D" stroke-width=".5" stroke-dasharray="3 5"/>
</g>
<g id="accent_elements">
  <path class="arc" d="M22 66 Q60 20 98 66 Q78 24 60 18 Q42 24 22 66Z" fill="#FFCC80"/>
  <path class="arc" d="M30 72 Q60 32 90 72 Q72 36 60 30 Q48 36 30 72Z" fill="#FFE0B2" style="animation-delay:.8s"/>
  <circle class="p1" cx="22" cy="36" r="2.2" fill="#81C784"/>
  <circle class="p2" cx="97" cy="42" r="2.8" fill="#FFB74D"/>
  <circle class="p3" cx="83" cy="18" r="1.8" fill="#4CAF50"/>
  <circle class="p1" cx="34" cy="84" r="2" fill="#FFB74D" style="animation-delay:1s"/>
  <circle class="p2" cx="91" cy="76" r="1.6" fill="#81C784" style="animation-delay:.4s"/>
  <circle class="p3" cx="46" cy="21" r="2" fill="#FFCC80" style="animation-delay:1.8s"/>
  <circle class="p1" cx="16" cy="60" r="1.4" fill="#4CAF50" style="animation-delay:.6s"/>
  <circle class="p2" cx="104" cy="60" r="1.4" fill="#FFB74D" style="animation-delay:1.3s"/>
</g>
<g id="tree">
  <g id="ground">
    <ellipse cx="60" cy="93" rx="14" ry="2.5" fill="#FFCC80"/>
    <ellipse cx="60" cy="93" rx="9" ry="1.5" fill="#FFB74D"/>
  </g>
  <g id="trunk">
    <path d="M57 91 C57 94.5 63 94.5 63 91 L61 51 Q60 49.5 59 51 Z" fill="#795548"/>
    <path d="M60 49.5 Q60.8 50 61 51 L63 91 C63 94.5 60 94.5 60 94.5 Z" fill="#5D4037"/>
    <path d="M57.5 62 Q54 64 52 68" fill="none" stroke="#6D4C41" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M62 58 Q66 60 68 65" fill="none" stroke="#6D4C41" stroke-width="1" stroke-linecap="round"/>
  </g>
  <g id="canopy">
    <circle class="c1" cx="44" cy="56" r="17" fill="#1B5E20"/>
    <circle class="c2" cx="76" cy="52" r="16" fill="#2E7D32"/>
    <circle class="c3" cx="60" cy="42" r="23" fill="#388E3C"/>
    <circle cx="56" cy="35" r="5" fill="#43A047"/>
    <circle cx="72" cy="40" r="4" fill="#2E7D32"/>
    <circle cx="46" cy="46" r="4.5" fill="#1B5E20"/>
  </g>
</g>
<g id="floating_leaves">
  <g class="f1"><g transform="translate(30,39) rotate(-40)">
    <path d="M0,8 C-6,4 -5,-5 0,-11 C5,-5 6,4 0,8Z" fill="#66BB6A"/>
    <path d="M0,8 C-1,1 -0.5,-5 0,-11" fill="none" stroke="#388E3C" stroke-width="0.8" stroke-linecap="round"/>
  </g></g>
  <g class="f2"><g transform="translate(89,31) rotate(35)">
    <path d="M0,9 C-5,4 -4,-6 0,-12 C4,-6 5,4 0,9Z" fill="#4CAF50"/>
    <path d="M0,9 C0.5,2 0.3,-5 0,-12" fill="none" stroke="#2E7D32" stroke-width="0.8" stroke-linecap="round"/>
  </g></g>
  <g class="f3"><g transform="translate(23,56) rotate(-55)">
    <path d="M0,6 C-3.5,2.5 -3,-4 0,-8 C3,-4 3.5,2.5 0,6Z" fill="#388E3C"/>
    <path d="M0,6 C-0.3,1 -0.2,-3 0,-8" fill="none" stroke="#1B5E20" stroke-width="0.7" stroke-linecap="round"/>
  </g></g>
  <g class="f4"><g transform="translate(95,53) rotate(45)">
    <path d="M0,7 C-4,3 -3.5,-4 0,-9 C3.5,-4 4,3 0,7Z" fill="#81C784"/>
    <path d="M0,7 C0.4,1.5 0.2,-3 0,-9" fill="none" stroke="#4CAF50" stroke-width="0.7" stroke-linecap="round"/>
  </g></g>
</g>
</svg>`;

interface SvgProps {
  className?: string;
}

export function GlobeSvg({ className }: SvgProps) {
  return (
    <div
      className={className}
      style={{ width: '100%', height: '100%' }}
      dangerouslySetInnerHTML={{ __html: GLOBE_SVG }}
    />
  );
}

export function SproutSvg({ className }: SvgProps) {
  return (
    <div
      className={className}
      style={{ width: '100%', height: '100%' }}
      dangerouslySetInnerHTML={{ __html: SPROUT_SVG }}
    />
  );
}

export function TreeSvg({ className }: SvgProps) {
  return (
    <div
      className={className}
      style={{ width: '100%', height: '100%' }}
      dangerouslySetInnerHTML={{ __html: TREE_SVG }}
    />
  );
}
