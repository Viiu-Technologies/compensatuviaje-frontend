import React from 'react';

/**
 * BlockchainESGSVG — Ilustración bio-criptográfica de alta fidelidad.
 * Combina la inmutabilidad y seguridad de la tecnología blockchain (bloques isométricos,
 * nodos criptográficos y hashes) con el impacto ecológico ESG (hojas nativas vivas,
 * pistas de bio-circuito y certificación de carbono verificada en Polygon).
 */
export const BlockchainESGSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: 'visible' }}
    {...props}
  >
    <defs>
      {/* Resplandor ambiental bio-criptográfico */}
      <radialGradient id="bio-crypto-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(8, 174, 6, 0.28)" />
        <stop offset="60%" stopColor="rgba(124, 58, 237, 0.12)" />
        <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
      </radialGradient>

      {/* Gradientes para cubos isométricos de blockchain */}
      <linearGradient id="cube-top-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#E4F6E0" stopOpacity="0.85" />
      </linearGradient>

      <linearGradient id="cube-left-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#073D3D" />
        <stop offset="100%" stopColor="#032525" />
      </linearGradient>

      <linearGradient id="cube-right-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0A5252" />
        <stop offset="100%" stopColor="#073D3D" />
      </linearGradient>

      {/* Gradientes ecológicos ESG para hojas */}
      <linearGradient id="esg-leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3ED32B" />
        <stop offset="100%" stopColor="#046302" />
      </linearGradient>

      <linearGradient id="polygon-crypto-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8247E5" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>

      {/* Filtro de brillo luminoso */}
      <filter id="esg-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Fondo de resplandor ambiental */}
    <circle cx="200" cy="200" r="175" fill="url(#bio-crypto-glow)" />

    {/* Anillos concéntricos de consenso distribuido */}
    <circle
      cx="200"
      cy="200"
      r="140"
      stroke="#08AE06"
      strokeWidth="1.2"
      strokeDasharray="4 6"
      opacity="0.4"
    />
    <circle
      cx="200"
      cy="200"
      r="160"
      stroke="#8247E5"
      strokeWidth="1"
      strokeDasharray="8 8"
      opacity="0.3"
    />

    {/* Líneas de enlace de hash criptográfico entre bloques */}
    <path
      d="M 200 85 L 120 185 M 200 85 L 280 185 M 120 185 L 200 270 M 280 185 L 200 270"
      stroke="#08AE06"
      strokeWidth="1.8"
      strokeDasharray="5 5"
      opacity="0.75"
      filter="url(#esg-glow)"
    />

    {/* ── BLOQUE BLOCKCHAIN 1: Superior (Nodo de Registro / Bloque Genesis) ── */}
    <g transform="translate(200, 85)">
      {/* Cara Superior */}
      <polygon points="0,-26 38,-6 0,14 -38,-6" fill="url(#cube-top-grad)" stroke="#073D3D" strokeWidth="1.5" />
      {/* Cara Izquierda */}
      <polygon points="-38,-6 0,14 0,54 -38,34" fill="url(#cube-left-grad)" stroke="#073D3D" strokeWidth="1.5" />
      {/* Cara Derecha */}
      <polygon points="0,14 38,-6 38,34 0,54" fill="url(#cube-right-grad)" stroke="#073D3D" strokeWidth="1.5" />

      {/* Sello de bloque en la cara superior */}
      <circle cx="0" cy="-6" r="8" fill="#8247E5" opacity="0.85" />
      <text x="0" y="-3" fontSize="6.5" fontWeight="bold" fill="#ffffff" textAnchor="middle" fontFamily="monospace">GEN</text>
    </g>

    {/* ── BLOQUE BLOCKCHAIN 2: Lateral Izquierdo (Smart Contract / Retiro) ── */}
    <g transform="translate(115, 185)">
      <polygon points="0,-24 35,-6 0,12 -35,-6" fill="url(#cube-top-grad)" stroke="#073D3D" strokeWidth="1.5" />
      <polygon points="-35,-6 0,12 0,48 -35,30" fill="url(#cube-left-grad)" stroke="#073D3D" strokeWidth="1.5" />
      <polygon points="0,12 35,-6 35,30 0,48" fill="url(#cube-right-grad)" stroke="#073D3D" strokeWidth="1.5" />

      {/* Pistas de circuito en la cara */}
      <path d="M -22 10 H -10 V 28 H 0" stroke="#3ED32B" strokeWidth="1.5" fill="none" opacity="0.8" />
      <circle cx="-22" cy="10" r="2.5" fill="#3ED32B" />
    </g>

    {/* ── BLOQUE BLOCKCHAIN 3: Lateral Derecho (Certificado ESG / Inmutable) ── */}
    <g transform="translate(285, 185)">
      <polygon points="0,-24 35,-6 0,12 -35,-6" fill="url(#cube-top-grad)" stroke="#073D3D" strokeWidth="1.5" />
      <polygon points="-35,-6 0,12 0,48 -35,30" fill="url(#cube-left-grad)" stroke="#073D3D" strokeWidth="1.5" />
      <polygon points="0,12 35,-6 35,30 0,48" fill="url(#cube-right-grad)" stroke="#073D3D" strokeWidth="1.5" />

      {/* Pistas de validación */}
      <path d="M 22 10 H 10 V 28 H 0" stroke="#8247E5" strokeWidth="1.5" fill="none" opacity="0.8" />
      <circle cx="22" cy="10" r="2.5" fill="#8247E5" />
    </g>

    {/* ── ELEMENTOS VIVOS ESG: Hojas y ramas botánicas entrelazando la cadena ── */}
    {/* Rama principal bio-digital que sube desde el bloque inferior */}
    <path
      d="M 200 270 C 180 230, 160 210, 200 170 C 230 140, 210 110, 200 85"
      stroke="#046302"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M 200 270 C 180 230, 160 210, 200 170 C 230 140, 210 110, 200 85"
      stroke="#3ED32B"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      filter="url(#esg-glow)"
    />

    {/* Hoja ESG 1: Izquierda (brotando hacia el nodo izquierdo) */}
    <g transform="translate(165, 195) rotate(-35)">
      <path
        d="M 0 0 C -15 -18, -35 -15, -42 0 C -35 15, -15 18, 0 0 Z"
        fill="url(#esg-leaf-grad)"
        stroke="#073D3D"
        strokeWidth="1.2"
      />
      <path d="M 0 0 L -38 0" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
      <circle cx="-42" cy="0" r="3" fill="#3ED32B" filter="url(#esg-glow)" />
    </g>

    {/* Hoja ESG 2: Derecha (brotando hacia el bloque derecho) */}
    <g transform="translate(235, 155) rotate(40)">
      <path
        d="M 0 0 C 15 -18, 35 -15, 42 0 C 35 15, 15 18, 0 0 Z"
        fill="url(#esg-leaf-grad)"
        stroke="#073D3D"
        strokeWidth="1.2"
      />
      <path d="M 0 0 L 38 0" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
      <circle cx="42" cy="0" r="3" fill="#3ED32B" filter="url(#esg-glow)" />
    </g>

    {/* Hoja ESG 3: Superior (brote nuevo apical) */}
    <g transform="translate(200, 115) rotate(-10)">
      <path
        d="M 0 0 C -10 -15, -25 -12, -30 0 C -25 12, -10 15, 0 0 Z"
        fill="url(#esg-leaf-grad)"
        stroke="#073D3D"
        strokeWidth="1"
      />
      <circle cx="-30" cy="0" r="2.5" fill="#3ED32B" />
    </g>

    {/* ── SELLO CENTRAL DE VERIFICACIÓN / TOKEN AUDITADO ── */}
    <g transform="translate(200, 200)">
      {/* Escudo / Disco hexagonal de auditoría */}
      <circle cx="0" cy="0" r="36" fill="#ffffff" stroke="#073D3D" strokeWidth="2.5" />
      <circle cx="0" cy="0" r="32" fill="url(#cube-top-grad)" stroke="#08AE06" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Ícono de Escudo + Checkmark ESG */}
      <path
        d="M -14 -8 L 0 -16 L 14 -8 V 6 C 14 14, 0 20, 0 20 C 0 20, -14 14, -14 6 Z"
        fill="url(#polygon-crypto-grad)"
        stroke="#ffffff"
        strokeWidth="1.5"
      />
      <path
        d="M -5 3 L -1 7 L 7 -2"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>

    {/* ── BLOQUE BLOCKCHAIN 4: Inferior (Base de Consenso / Raíces) ── */}
    <g transform="translate(200, 295)">
      <polygon points="0,-26 42,-6 0,14 -42,-6" fill="url(#cube-top-grad)" stroke="#073D3D" strokeWidth="1.5" />
      <polygon points="-42,-6 0,14 0,52 -42,32" fill="url(#cube-left-grad)" stroke="#073D3D" strokeWidth="1.5" />
      <polygon points="0,14 42,-6 42,32 0,52" fill="url(#cube-right-grad)" stroke="#073D3D" strokeWidth="1.5" />

      {/* Hash grabado en la piedra base */}
      <text x="0" y="3" fontSize="8" fontWeight="bold" fill="#073D3D" textAnchor="middle" fontFamily="monospace">
        BLOCK #84920
      </text>
      <text x="-21" y="24" fontSize="6" fill="#A9C7C3" textAnchor="middle" fontFamily="monospace">
        0x71C...4A9B
      </text>
      <text x="21" y="24" fontSize="6" fill="#3ED32B" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">
        POLYGON
      </text>
    </g>

    {/* ── BADGES FLOTANTES DE VERIFICACIÓN ESG ── */}
    {/* Badge Flotante Izquierdo: Toneladas Verificadas */}
    <g transform="translate(55, 125)">
      <rect x="0" y="0" width="85" height="24" rx="12" fill="#ffffff" stroke="#08AE06" strokeWidth="1.5" opacity="0.95" />
      <circle cx="12" cy="12" r="5" fill="#08AE06" filter="url(#esg-glow)" />
      <text x="48" y="16" fontSize="9" fontWeight="bold" fill="#073D3D" textAnchor="middle" fontFamily="sans-serif">
        1.0 tCO₂e RETIRED
      </text>
    </g>

    {/* Badge Flotante Derecho: Estándar Certificado */}
    <g transform="translate(265, 125)">
      <rect x="0" y="0" width="80" height="24" rx="12" fill="#ffffff" stroke="#8247E5" strokeWidth="1.5" opacity="0.95" />
      <circle cx="12" cy="12" r="5" fill="#8247E5" />
      <text x="46" y="16" fontSize="9" fontWeight="bold" fill="#073D3D" textAnchor="middle" fontFamily="sans-serif">
        VCS / GOLD STD
      </text>
    </g>
  </svg>
);

export default BlockchainESGSVG;
