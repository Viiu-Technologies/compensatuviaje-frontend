import React from 'react';

/**
 * Estela, arco de la ruta y arco de aterrizaje. Los `d` de los caminos se
 * calculan en el hero a partir del tamaño real del escenario (heroGeometry) y
 * se escriben directo en el DOM; aquí solo está la estructura.
 *
 * La línea punteada no se puede "dibujar" con DrawSVG (ambos usan
 * stroke-dasharray), así que se revela con una máscara: lo que se dibuja es el
 * trazo blanco de la máscara.
 */
const RouteArc: React.FC = () => (
  <>
    <defs>
      <filter id="hs-soft" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="4" />
      </filter>
      <mask id="hs-arc-reveal" maskUnits="userSpaceOnUse">
        <path className="hs-arc-mask" fill="none" stroke="#ffffff" strokeWidth="16" strokeLinecap="round" />
      </mask>
      <mask id="hs-land-reveal" maskUnits="userSpaceOnUse">
        <path className="hs-land-mask" fill="none" stroke="#ffffff" strokeWidth="16" strokeLinecap="round" />
      </mask>
    </defs>

    {/* Estela del cruce: blanca y difuminada */}
    <path className="hs-trail" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" filter="url(#hs-soft)" />

    {/* Arco SCL → LIM: halo blanco debajo, punteado verde encima */}
    <path className="hs-arc-halo" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" filter="url(#hs-soft)" />
    <path
      className="hs-arc"
      fill="none"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="0.5 9"
      mask="url(#hs-arc-reveal)"
    />
    <g className="hs-dot hs-dot--from">
      <circle r="9" fill="#ffffff" opacity="0.75" />
      <circle r="5" className="hs-dot__core" />
    </g>
    <g className="hs-dot hs-dot--to">
      <circle r="9" fill="#ffffff" opacity="0.75" />
      <circle r="5" className="hs-dot__core" />
    </g>

    {/* Escena 4: arco punteado de fondo que aterriza en la calculadora */}
    <path
      className="hs-land-arc"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="0.5 8"
      mask="url(#hs-land-reveal)"
    />
    <circle className="hs-land-dot" cx="0" cy="0" r="4.5" />
  </>
);

export default RouteArc;
