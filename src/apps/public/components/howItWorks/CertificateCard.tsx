import React, { useRef } from 'react';
import { flightKey, fmt, useFlight } from './flight';
import { countUp, useFigureTimeline } from './useFigureTimeline';

/**
 * Paso 3 · "Compensa con proyectos verificados": el certificado de tu vuelo
 * con un proyecto evaluado por Veritas AI. Queda "listo para compensar": el
 * sello en blockchain llega al pagar, así que aquí no se muestra un hash.
 */

const TREES: Array<[number, number, number]> = [
  // x, base y, alto
  [92, 112, 22],
  [106, 114, 28],
  [121, 112, 20],
  [134, 115, 25],
];

const PANELS = [176, 206, 236];

const CertificateCard: React.FC = () => {
  const flight = useFlight();
  const ref = useRef<HTMLDivElement>(null);
  const kgRef = useRef<SVGTSpanElement>(null);

  useFigureTimeline(ref, flightKey(flight), (root, tl) => {
    const q = (s: string) => root.querySelector(s);
    tl.from(q('.hw-cert'), { y: 16, autoAlpha: 0, duration: 0.5 }, 0)
      .from(root.querySelectorAll('.hw-cert__tree'), { scaleY: 0, transformOrigin: '50% 100%', stagger: 0.08, duration: 0.4, ease: 'back.out(1.6)' }, 0.35)
      .from(root.querySelectorAll('.hw-cert__panel'), { autoAlpha: 0, y: 6, stagger: 0.08, duration: 0.35 }, 0.5)
      .from(q('.hw-cert__sun'), { scale: 0, transformOrigin: '50% 50%', duration: 0.4 }, 0.4);
    countUp(tl, kgRef.current, flight.kg, (v) => fmt.kgNumber(v), 0.7);
    tl.from(q('.hw-cert__status'), { autoAlpha: 0, x: -8, duration: 0.35 }, 1.3)
      // El sello de Veritas cae como un timbre.
      .from(q('.hw-seal'), { scale: 1.5, rotation: -18, autoAlpha: 0, transformOrigin: '50% 50%', duration: 0.45, ease: 'back.out(2)' }, 1.5);
  });

  return (
    <div ref={ref} className="hw-figure hw-certificate">
      <svg className="hw-svg" viewBox="0 0 360 228" aria-hidden="true" focusable="false">
        <g className="hw-cert">
          <rect className="hw-cert__card" x="62" y="22" width="236" height="188" rx="14" />
          <text className="hw-cert__eyebrow" x="80" y="44">
            CERTIFICADO DE COMPENSACIÓN
          </text>

          {/* Proyecto: bosque y energía solar */}
          <g className="hw-cert__scene">
            <rect className="hw-cert__sky" x="78" y="54" width="204" height="70" rx="8" />
            <circle className="hw-cert__sun" cx="258" cy="70" r="7" />
            <path className="hw-cert__hill" d="M78 110 C110 92 150 98 180 106 C210 114 240 100 282 104 L282 116 C282 120 279 124 274 124 L86 124 C81 124 78 120 78 116 Z" />
            {TREES.map(([x, base, h]) => (
              <path key={x} className="hw-cert__tree" d={`M${x} ${base - h} L${x + h * 0.38} ${base} L${x - h * 0.38} ${base} Z`} />
            ))}
            {PANELS.map((x) => (
              <g key={x} className="hw-cert__panel">
                <path d={`M${x} 92 L${x + 24} 88 L${x + 28} 104 L${x + 4} 108 Z`} />
                <path className="hw-cert__panel-grid" d={`M${x + 2} 100 L${x + 26} 96 M${x + 12} 90 L${x + 16} 106`} />
                <line className="hw-cert__panel-leg" x1={x + 14} y1="106" x2={x + 14} y2="116" />
              </g>
            ))}
          </g>

          <text className="hw-cert__caption" x="80" y="146">
            CO₂ A COMPENSAR
          </text>
          <text className="hw-cert__kg" x="80" y="172">
            <tspan ref={kgRef}>{fmt.kgNumber(flight.kg)}</tspan>
            <tspan className="hw-cert__unit"> kg CO₂e</tspan>
          </text>

          <g className="hw-cert__status">
            <rect x="80" y="182" width="132" height="20" rx="10" />
            <circle cx="92" cy="192" r="4" />
            <text x="101" y="196">
              Listo para compensar
            </text>
          </g>
        </g>

        {/* Sello: los proyectos los evalúa Veritas AI antes de publicarse */}
        <g className="hw-seal" transform="translate(292 30)">
          <circle className="hw-seal__outer" r="27" />
          <circle className="hw-seal__inner" r="22" />
          <path className="hw-seal__check" d="M-6 -7 L-1.5 -2.5 L7 -11" />
          <text className="hw-seal__text" y="5" textAnchor="middle">
            EVALUADO
          </text>
          <text className="hw-seal__text" y="12" textAnchor="middle">
            VERITAS AI
          </text>
        </g>
      </svg>
    </div>
  );
};

export default CertificateCard;
