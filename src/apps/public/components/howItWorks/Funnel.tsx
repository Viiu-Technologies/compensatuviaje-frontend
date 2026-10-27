import React, { useEffect, useId, useRef, useState } from 'react';
import { HiInformationCircle } from 'react-icons/hi';
import { flightKey, fmt, useFlight } from './flight';
import { countUp, useFigureTimeline } from './useFigureTimeline';

/**
 * Paso 2 · "Calcula con datos oficiales": las cuatro entradas de la cuenta
 * (distancia, pasajeros, cabina y factor DEFRA) caen a un embudo y sale el
 * resultado en kg CO₂e, con los mismos números que devolvió la calculadora.
 */

const MOUTH = { x: 180, y: 108 };
// Ancho aproximado de un chip según su texto (mono a 10,5 px ≈ 6,3 px por carácter).
const chipWidth = (text: string) => Math.round(text.length * 6.3 + 22);

const Funnel: React.FC = () => {
  const flight = useFlight();
  const ref = useRef<HTMLDivElement>(null);
  const kgRef = useRef<SVGTSpanElement>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoId = useId();

  const inputs = [
    // Ida y vuelta duplica la distancia: así las entradas cuadran con el resultado.
    flight.roundTrip ? `2 × ${fmt.km(flight)}` : fmt.km(flight),
    fmt.pax(flight),
    fmt.cabin(flight),
    `Factor ${fmt.factor(flight)}`,
  ];
  // Dos filas de dos, centradas sobre la boca del embudo.
  const chips = inputs.map((text, i) => {
    const w = chipWidth(text);
    const row = Math.floor(i / 2);
    const left = i % 2 === 0;
    return { text, w, x: left ? 176 - w : 184, y: 18 + row * 32 };
  });

  const factorChip = chips[3];

  useFigureTimeline(ref, flightKey(flight), (root, tl) => {
    const nodes = [...root.querySelectorAll<SVGGElement>('.hw-chip')];
    tl.from(nodes, { y: -10, autoAlpha: 0, stagger: 0.07, duration: 0.35 }, 0);
    // Cada entrada cae a la boca del embudo y desaparece…
    nodes.forEach((node, i) => {
      const box = chips[i];
      tl.to(
        node,
        {
          x: MOUTH.x - (box.x + box.w / 2),
          y: MOUTH.y - (box.y + 11),
          scale: 0.3,
          autoAlpha: 0,
          transformOrigin: '50% 50%',
          duration: 0.45,
          ease: 'power2.in',
        },
        0.55 + i * 0.12,
      );
    });
    // …el embudo procesa…
    tl.fromTo(root.querySelector('.hw-funnel__flow'), { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.5, ease: 'power1.inOut' }, 1.1);
    // …y sale el resultado.
    tl.from(root.querySelector('.hw-result'), { y: -14, scale: 0.7, autoAlpha: 0, transformOrigin: '50% 50%', ease: 'back.out(1.8)', duration: 0.5 }, 1.5);
    countUp(tl, kgRef.current, flight.kg, (v) => fmt.kgNumber(v), 1.55);
    // Las entradas vuelven a su lugar: quedan a la vista como leyenda.
    tl.to(nodes, { x: 0, y: 0, scale: 1, autoAlpha: 1, stagger: 0.05, duration: 0.35, ease: 'power2.out' }, 2.2);
  });

  // Cerrar la explicación con Escape o al hacer clic fuera.
  useEffect(() => {
    if (!infoOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setInfoOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.querySelector('.hw-info')?.contains(e.target as Node)) setInfoOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [infoOpen]);

  return (
    <div ref={ref} className="hw-figure hw-funnel">
      <svg className="hw-svg" viewBox="0 0 360 228" aria-hidden="true" focusable="false">
        {chips.map((chip) => (
          <g key={chip.text} className="hw-chip">
            <rect x={chip.x} y={chip.y} width={chip.w} height="22" rx="11" />
            <text x={chip.x + chip.w / 2} y={chip.y + 14.5} textAnchor="middle">
              {chip.text}
            </text>
          </g>
        ))}

        {/* Embudo */}
        <path className="hw-funnel__body" d="M108 96 L252 96 L198 150 L198 170 L162 170 L162 150 Z" />
        <path className="hw-funnel__rim" d="M104 92 L256 92 L256 100 L104 100 Z" />
        <rect className="hw-funnel__flow" x="174" y="104" width="12" height="66" rx="6" />
        <path className="hw-funnel__shine" d="M122 104 L160 104 L176 120" />

        {/* Resultado */}
        <g className="hw-result">
          <rect x="104" y="180" width="152" height="34" rx="17" />
          <text x="180" y="202" textAnchor="middle">
            <tspan ref={kgRef} className="hw-result__number">
              {fmt.kgNumber(flight.kg)}
            </tspan>
            <tspan className="hw-result__unit"> kg CO₂e</tspan>
          </text>
        </g>
      </svg>

      {/* El botón va pegado al chip del factor: explica justo ese número. */}
      <div
        className="hw-info"
        style={{ left: `${((factorChip.x + factorChip.w + 5) / 360) * 100}%`, top: `${((factorChip.y + 11) / 228) * 100}%` }}
      >
        <button
          type="button"
          className="hw-info__btn"
          aria-expanded={infoOpen}
          aria-controls={infoId}
          aria-label="¿Qué es el factor de emisión?"
          title="¿Qué es el factor de emisión?"
          onClick={() => setInfoOpen((open) => !open)}
        >
          <HiInformationCircle aria-hidden="true" />
        </button>
        <div id={infoId} className="hw-info__panel" hidden={!infoOpen}>
          Son los kg de CO₂e que emite cada pasajero por kilómetro según {flight.methodology}, para un tramo{' '}
          {fmt.haul(flight)} en clase {fmt.cabin(flight).toLowerCase()}. Los publica el gobierno del Reino Unido y
          los usa el GHG Protocol.
        </div>
      </div>
    </div>
  );
};

export default Funnel;
