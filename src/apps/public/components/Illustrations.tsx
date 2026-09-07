import React from 'react';

/**
 * PlanetDataSVG — Ilustración de Planeta Tierra rodeado de una red de datos ambientales.
 * Transmite tecnología, impacto global y monitoreo en tiempo real.
 */
export const PlanetDataSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: 'visible' }}
    {...props}
  >
    <defs>
      <radialGradient id="globe-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(8, 174, 6, 0.22)" />
        <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
      </radialGradient>
      <linearGradient id="globe-map" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#073D3D" />
        <stop offset="100%" stopColor="#08AE06" />
      </linearGradient>
      <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Resplandor exterior */}
    <circle cx="200" cy="200" r="160" fill="url(#globe-glow)" />

    {/* Esfera del planeta */}
    <circle cx="200" cy="200" r="110" fill="#ffffff" stroke="#073D3D" strokeWidth="2.5" />
    <circle cx="200" cy="200" r="105" fill="rgba(8, 174, 6, 0.04)" />

    {/* Continentes abstractos */}
    <path
      d="M140 160 C150 140, 180 135, 190 150 C200 165, 190 180, 170 190 C150 200, 130 180, 140 160 Z
         M230 180 C250 160, 280 170, 270 190 C260 210, 245 220, 230 200 Z
         M180 250 C190 230, 220 225, 230 240 C240 255, 230 270, 210 280 Z"
      fill="url(#globe-map)"
      opacity="0.85"
    />

    {/* Líneas de latitud/longitud */}
    <path d="M95 200 H305 M200 95 V305" stroke="rgba(7, 61, 61, 0.08)" strokeWidth="1.5" />
    <ellipse cx="200" cy="200" rx="104" ry="40" stroke="rgba(7, 61, 61, 0.08)" strokeWidth="1.5" fill="none" />
    <ellipse cx="200" cy="200" rx="40" ry="104" stroke="rgba(7, 61, 61, 0.08)" strokeWidth="1.5" fill="none" />

    {/* Órbitas de satélites / red de datos */}
    <ellipse
      cx="200"
      cy="200"
      rx="145"
      ry="55"
      stroke="#08AE06"
      strokeWidth="1.5"
      strokeDasharray="5 5"
      transform="rotate(-20 200 200)"
      filter="url(#glow-effect)"
      opacity="0.9"
    />
    <ellipse
      cx="200"
      cy="200"
      rx="155"
      ry="65"
      stroke="#073D3D"
      strokeWidth="1.2"
      strokeDasharray="4 4"
      transform="rotate(35 200 200)"
    />

    {/* Conexiones de datos / Nodos */}
    <g stroke="#08AE06" strokeWidth="1" opacity="0.6">
      <line x1="60" y1="150" x2="120" y2="120" />
      <line x1="120" y1="120" x2="200" y2="70" />
      <line x1="200" y1="70" x2="280" y2="120" />
      <line x1="280" y1="120" x2="340" y2="150" />
      <line x1="340" y1="250" x2="280" y2="280" />
      <line x1="280" y1="280" x2="200" y2="330" />
      <line x1="200" y1="330" x2="120" y2="280" />
      <line x1="120" y1="280" x2="60" y2="250" />
    </g>

    {/* Puntos de red (Nodos) */}
    <g fill="#08AE06">
      <circle cx="60" cy="150" r="5" filter="url(#glow-effect)" />
      <circle cx="60" cy="150" r="2" fill="#ffffff" />

      <circle cx="120" cy="120" r="4" />
      <circle cx="200" cy="70" r="6" filter="url(#glow-effect)" />
      <circle cx="200" cy="70" r="2.5" fill="#ffffff" />

      <circle cx="280" cy="120" r="4" />
      <circle cx="340" cy="150" r="5" filter="url(#glow-effect)" />
      <circle cx="340" cy="150" r="2" fill="#ffffff" />

      <circle cx="340" cy="250" r="4" />
      <circle cx="280" cy="280" r="5" filter="url(#glow-effect)" />
      <circle cx="280" cy="280" r="2" fill="#ffffff" />

      <circle cx="200" cy="330" r="6" filter="url(#glow-effect)" />
      <circle cx="200" cy="330" r="2.5" fill="#ffffff" />

      <circle cx="120" cy="280" r="4" />
      <circle cx="60" cy="250" r="5" filter="url(#glow-effect)" />
      <circle cx="60" cy="250" r="2" fill="#ffffff" />
    </g>
  </svg>
);

/**
 * ForestSVG — Bosque tecnológico con troncos geométricos de circuitos.
 * Transmite reforestación certificada y automatización verde.
 */
export const ForestSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: 'visible' }}
    {...props}
  >
    <defs>
      <radialGradient id="forest-glow" cx="50%" cy="60%" r="50%">
        <stop offset="0%" stopColor="rgba(8, 174, 6, 0.15)" />
        <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
      </radialGradient>
      <filter id="forest-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <circle cx="200" cy="220" r="160" fill="url(#forest-glow)" />

    {/* Suelo */}
    <path d="M50 320 Q200 300 350 320" stroke="#073D3D" strokeWidth="3" strokeLinecap="round" />
    <path d="M80 328 Q200 315 320 328" stroke="rgba(7, 61, 61, 0.2)" strokeWidth="1.5" strokeLinecap="round" />

    {/* Árbol Principal (Centro) */}
    <g className="tree-center">
      {/* Tronco */}
      <path d="M200 310 V180 M200 230 L160 190 M200 210 L240 170" stroke="#073D3D" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M200 310 V180 M200 230 L160 190 M200 210 L240 170" stroke="#08AE06" strokeWidth="2" strokeLinecap="round" filter="url(#forest-glow-filter)" />
      {/* Hojas / Copa de red */}
      <circle cx="200" cy="180" r="32" fill="rgba(8, 174, 6, 0.12)" stroke="#08AE06" strokeWidth="1.5" />
      <circle cx="160" cy="190" r="24" fill="rgba(8, 174, 6, 0.12)" stroke="#08AE06" strokeWidth="1.5" />
      <circle cx="240" cy="170" r="26" fill="rgba(8, 174, 6, 0.12)" stroke="#08AE06" strokeWidth="1.5" />
      {/* Nodos de datos en las copas */}
      <circle cx="200" cy="155" r="4.5" fill="#08AE06" filter="url(#forest-glow-filter)" />
      <circle cx="140" cy="185" r="3.5" fill="#08AE06" />
      <circle cx="260" cy="165" r="4" fill="#08AE06" />
    </g>

    {/* Árbol Izquierdo */}
    <g className="tree-left">
      <path d="M120 312 V220 M120 260 L95 235 M120 250 L140 230" stroke="#073D3D" strokeWidth="4" strokeLinecap="round" />
      <path d="M120 312 V220 M120 260 L95 235 M120 250 L140 230" stroke="#08AE06" strokeWidth="1.5" strokeLinecap="round" filter="url(#forest-glow-filter)" />
      <circle cx="120" cy="220" r="22" fill="rgba(8, 174, 6, 0.08)" stroke="#073D3D" strokeWidth="1" />
      <circle cx="95" cy="235" r="16" fill="rgba(8, 174, 6, 0.08)" stroke="#073D3D" strokeWidth="1" />
      <circle cx="120" cy="220" r="3" fill="#08AE06" />
    </g>

    {/* Árbol Derecho */}
    <g className="tree-right">
      <path d="M280 312 V210 M280 250 L255 225 M280 240 L305 215" stroke="#073D3D" strokeWidth="4" strokeLinecap="round" />
      <path d="M280 312 V210 M280 250 L255 225 M280 240 L305 215" stroke="#08AE06" strokeWidth="1.5" strokeLinecap="round" filter="url(#forest-glow-filter)" />
      <circle cx="280" cy="210" r="24" fill="rgba(8, 174, 6, 0.08)" stroke="#073D3D" strokeWidth="1" />
      <circle cx="305" cy="215" r="18" fill="rgba(8, 174, 6, 0.08)" stroke="#073D3D" strokeWidth="1" />
      <circle cx="280" cy="210" r="3" fill="#08AE06" />
    </g>
  </svg>
);

/**
 * CircuitLeafSVG — Hoja con pistas de circuito impreso.
 * Transmite biotecnología, inteligencia artificial y monitoreo de CO2.
 */
export const CircuitLeafSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: 'visible' }}
    {...props}
  >
    <defs>
      <radialGradient id="leaf-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(8, 174, 6, 0.2)" />
        <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
      </radialGradient>
      <filter id="leaf-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <circle cx="200" cy="200" r="150" fill="url(#leaf-glow)" />

    {/* Contorno de la Hoja */}
    <path
      d="M200 60 C120 120, 100 240, 200 340 C300 240, 280 120, 200 60 Z"
      stroke="#073D3D"
      strokeWidth="3.5"
      fill="#ffffff"
      fillOpacity="0.85"
      strokeLinejoin="round"
    />

    {/* Nervadura Central (Pista del bus de circuito) */}
    <path d="M200 60 V340" stroke="#073D3D" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M200 80 V320" stroke="#08AE06" strokeWidth="2.0" strokeLinecap="round" filter="url(#leaf-glow-filter)" />

    {/* Pistas del circuito de la hoja (Nervaduras laterales) */}
    <g stroke="#073D3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Lado izquierdo */}
      <path d="M200 120 L150 160 H120" />
      <path d="M200 180 L140 220 H115" />
      <path d="M200 240 L160 270 H135" />

      {/* Lado derecho */}
      <path d="M200 140 L250 180 H280" />
      <path d="M200 200 L260 240 H285" />
      <path d="M200 260 L240 290 H265" />
    </g>

    {/* Pistas de microchip (luminosas) */}
    <g stroke="#08AE06" strokeWidth="1.2" strokeLinecap="round" filter="url(#leaf-glow-filter)">
      <path d="M200 120 L150 160 H120" />
      <path d="M200 180 L140 220 H115" />
      <path d="M200 240 L160 270 H135" />
      <path d="M200 140 L250 180 H280" />
      <path d="M200 200 L260 240 H285" />
    </g>

    {/* Pines / Nodos de soldadura */}
    <g fill="#08AE06">
      <circle cx="120" cy="160" r="4.5" filter="url(#leaf-glow-filter)" />
      <circle cx="120" cy="160" r="2.0" fill="#ffffff" />

      <circle cx="115" cy="220" r="4" />
      <circle cx="135" cy="270" r="4" />

      <circle cx="280" cy="180" r="4.5" filter="url(#leaf-glow-filter)" />
      <circle cx="280" cy="180" r="2.0" fill="#ffffff" />

      <circle cx="285" cy="240" r="4" />
      <circle cx="265" cy="290" r="4" />
    </g>
  </svg>
);

/**
 * StepTripInputSVG: Ilustración moderna de ruta de vuelo y selección de viaje.
 * Paso 01: Ingresa tu viaje.
 */
export const StepTripInputSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 320 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: 'visible' }}
    {...props}
  >
    <defs>
      <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#073D3D" />
        <stop offset="50%" stopColor="#08AE06" />
        <stop offset="100%" stopColor="#073D3D" />
      </linearGradient>
      <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Fondo de tarjeta estilo ticket de vuelo */}
    <rect x="20" y="25" width="280" height="170" rx="18" fill="#ffffff" stroke="rgba(7, 61, 61, 0.12)" strokeWidth="1.5" />
    
    {/* Cabecera del ticket */}
    <rect x="20" y="25" width="280" height="42" rx="18" fill="rgba(7, 61, 61, 0.04)" />
    <circle cx="44" cy="46" r="4" fill="#08AE06" />
    <rect x="58" y="42" width="70" height="8" rx="4" fill="rgba(7, 61, 61, 0.2)" />
    <rect x="220" y="38" width="60" height="16" rx="8" fill="rgba(8, 174, 6, 0.15)" />

    {/* Nodos de Ruta: Origen y Destino */}
    <circle cx="65" cy="125" r="14" fill="#073D3D" />
    <circle cx="65" cy="125" r="5" fill="#ffffff" />

    <circle cx="255" cy="125" r="14" fill="#08AE06" filter="url(#route-glow)" />
    <circle cx="255" cy="125" r="5" fill="#ffffff" />

    {/* Arco parabólico de vuelo */}
    <path
      d="M 65 125 Q 160 55 255 125"
      stroke="url(#route-gradient)"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeDasharray="6 4"
    />

    {/* Avión volando sobre el arco */}
    <g transform="translate(150, 78) rotate(5)">
      <circle cx="10" cy="10" r="15" fill="#ffffff" stroke="#073D3D" strokeWidth="1.5" />
      <path
        d="M 10 3 L 14 12 L 20 13 L 13 15 L 14 19 L 10 17 L 6 19 L 7 15 L 0 13 L 6 12 Z"
        fill="#08AE06"
      />
    </g>

    {/* Etiquetas inferiores */}
    <rect x="45" y="155" width="40" height="10" rx="5" fill="rgba(7, 61, 61, 0.25)" />
    <rect x="235" y="155" width="40" height="10" rx="5" fill="rgba(8, 174, 6, 0.35)" />
    <rect x="110" y="155" width="100" height="8" rx="4" fill="rgba(7, 61, 61, 0.12)" />
  </svg>
);

/**
 * StepCalculationSVG: Ilustración analítica y precisa de cálculo con datos oficiales.
 * Paso 02: Calcula con datos oficiales.
 */
export const StepCalculationSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 320 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: 'visible' }}
    {...props}
  >
    <defs>
      <linearGradient id="calc-bar-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#08AE06" />
        <stop offset="100%" stopColor="#073D3D" />
      </linearGradient>
    </defs>

    {/* Fondo de tarjeta analítica */}
    <rect x="20" y="25" width="280" height="170" rx="18" fill="#ffffff" stroke="rgba(7, 61, 61, 0.12)" strokeWidth="1.5" />

    {/* Tacómetro / Barra de medición */}
    <rect x="45" y="55" width="230" height="14" rx="7" fill="rgba(7, 61, 61, 0.08)" />
    <rect x="45" y="55" width="165" height="14" rx="7" fill="url(#calc-bar-grad)" />

    {/* Indicador de factor DEFRA */}
    <circle cx="210" cy="62" r="11" fill="#073D3D" stroke="#ffffff" strokeWidth="2.5" />
    <circle cx="210" cy="62" r="4" fill="#08AE06" />

    {/* Bloques de datos métricos (distancia, factor, total) */}
    <rect x="45" y="90" width="65" height="42" rx="10" fill="rgba(7, 61, 61, 0.04)" stroke="rgba(7, 61, 61, 0.08)" />
    <circle cx="58" cy="103" r="4" fill="#08AE06" />
    <rect x="68" y="100" width="30" height="6" rx="3" fill="rgba(7, 61, 61, 0.25)" />
    <rect x="55" y="116" width="45" height="8" rx="4" fill="#073D3D" />

    <text x="122" y="115" fontSize="16" fontWeight="bold" fill="#073D3D" textAnchor="middle">×</text>

    <rect x="135" y="90" width="65" height="42" rx="10" fill="rgba(7, 61, 61, 0.04)" stroke="rgba(7, 61, 61, 0.08)" />
    <circle cx="148" cy="103" r="4" fill="#073D3D" />
    <rect x="158" y="100" width="30" height="6" rx="3" fill="rgba(7, 61, 61, 0.25)" />
    <rect x="145" y="116" width="45" height="8" rx="4" fill="#08AE06" />

    <text x="212" y="115" fontSize="16" fontWeight="bold" fill="#073D3D" textAnchor="middle">=</text>

    <rect x="225" y="85" width="50" height="52" rx="10" fill="rgba(8, 174, 6, 0.12)" stroke="rgba(8, 174, 6, 0.3)" />
    <rect x="233" y="98" width="34" height="8" rx="4" fill="#046302" />
    <rect x="233" y="114" width="24" height="6" rx="3" fill="rgba(7, 61, 61, 0.3)" />

    {/* Sello de validación inferior */}
    <rect x="45" y="152" width="230" height="24" rx="8" fill="rgba(7, 61, 61, 0.03)" />
    <circle cx="60" cy="164" r="5" fill="#08AE06" />
    <rect x="74" y="161" width="110" height="6" rx="3" fill="rgba(7, 61, 61, 0.3)" />
    <rect x="210" y="158" width="55" height="12" rx="6" fill="rgba(8, 174, 6, 0.2)" />
  </svg>
);

/**
 * StepCompensationSVG: Ilustración de certificado digital inmutable y proyecto verificado.
 * Paso 03: Compensa con proyectos verificados.
 */
export const StepCompensationSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 320 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: 'visible' }}
    {...props}
  >
    {/* Fondo de Certificado Digital */}
    <rect x="35" y="25" width="250" height="170" rx="18" fill="#ffffff" stroke="rgba(7, 61, 61, 0.12)" strokeWidth="1.5" />

    {/* Borde interior decorativo */}
    <rect x="45" y="35" width="230" height="150" rx="12" fill="rgba(8, 174, 6, 0.02)" stroke="rgba(8, 174, 6, 0.2)" strokeDasharray="4 3" />

    {/* Escudo / Sello de verificación central */}
    <circle cx="160" cy="85" r="32" fill="#E4F6E0" stroke="#08AE06" strokeWidth="2" />
    <path
      d="M150 85 L157 92 L172 77"
      stroke="#046302"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Líneas de certificado y firmas */}
    <rect x="90" y="130" width="140" height="8" rx="4" fill="#073D3D" />
    <rect x="110" y="146" width="100" height="6" rx="3" fill="rgba(7, 61, 61, 0.3)" />

    {/* Chip inferior de Trazabilidad Blockchain */}
    <rect x="75" y="162" width="170" height="14" rx="7" fill="rgba(7, 61, 61, 0.06)" />
    <circle cx="86" cy="169" r="3" fill="#08AE06" />
    <rect x="96" y="166" width="120" height="6" rx="3" fill="rgba(7, 61, 61, 0.25)" />
  </svg>
);

/**
 * MetricsSVG — Panel de métricas ambientales y dashboard.
 * Transmite datos auditables, compensaciones y gráficos.
 */
export const MetricsSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: 'visible' }}
    {...props}
  >
    <defs>
      <radialGradient id="metrics-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(8, 174, 6, 0.16)" />
        <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
      </radialGradient>
      <linearGradient id="chart-grad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#073D3D" opacity="0.1" />
        <stop offset="100%" stopColor="#08AE06" opacity="0.4" />
      </linearGradient>
      <filter id="metrics-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <circle cx="200" cy="200" r="160" fill="url(#metrics-glow)" />

    {/* Fondo de Tarjeta Dashboard */}
    <rect
      x="60"
      y="80"
      width="280"
      height="240"
      rx="24"
      fill="#ffffff"
      stroke="rgba(7, 61, 61, 0.08)"
      strokeWidth="2"
    />

    {/* Línea del gráfico de área */}
    <path
      d="M80 270 Q130 220 180 230 T280 140 T320 120 V270 H80 Z"
      fill="url(#chart-grad)"
    />
    <path
      d="M80 270 Q130 220 180 230 T280 140 T320 120"
      stroke="#08AE06"
      strokeWidth="3.5"
      strokeLinecap="round"
      filter="url(#metrics-glow-filter)"
    />
    <path
      d="M80 270 Q130 220 180 230 T280 140 T320 120"
      stroke="#073D3D"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    {/* Puntos destacados en el gráfico */}
    <circle cx="180" cy="230" r="6" fill="#08AE06" filter="url(#metrics-glow-filter)" />
    <circle cx="180" cy="230" r="2.5" fill="#ffffff" />

    <circle cx="280" cy="140" r="6" fill="#08AE06" filter="url(#metrics-glow-filter)" />
    <circle cx="280" cy="140" r="2.5" fill="#ffffff" />

    {/* Ejes del gráfico */}
    <path d="M80 100 V270 H320" stroke="rgba(7, 61, 61, 0.15)" strokeWidth="1.5" strokeLinecap="round" />

    {/* Marcadores / Datos */}
    <g fill="rgba(7, 61, 61, 0.4)" fontSize="10" fontFamily="sans-serif" fontWeight="600">
      <text x="75" y="105" textAnchor="end">CO₂</text>
      <text x="315" y="285" textAnchor="middle">Mes</text>
    </g>
  </svg>
);
