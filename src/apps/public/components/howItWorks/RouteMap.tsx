import React, { useRef } from 'react';
import { HiPencil } from 'react-icons/hi';
import { scrollToSection } from '../DeferredSection';
import { flightKey, fmt, LAND_PATH, MAP_H, MAP_W, mapPoint, project, useFlight } from './flight';
import { useFigureTimeline } from './useFigureTimeline';

/**
 * Paso 1 · "Ingresa tu viaje": el vuelo sobre un mapa plano del cono sur. Los
 * pines laten en origen y destino; el avión recorre la ruta punteada. Si un
 * aeropuerto queda fuera del mapa, su pin va al borde, en su dirección.
 *
 * Las píldoras de cabina y pasajeros llevan a la calculadora: ahí se cambian.
 */

const GRID_LON = [-90, -75, -60, -45, -30];
const GRID_LAT = [-10, -25, -40, -55];

const Plane: React.FC = () => (
  <g className="hw-plane">
    <path d="M-9 0 L7 -1.2 C9 -1.2 10.5 -0.6 10.5 0 C10.5 0.6 9 1.2 7 1.2 Z" />
    <path d="M1 -0.8 L-3 -8 L-0.6 -8 L5 -0.8 Z M1 0.8 L-3 8 L-0.6 8 L5 0.8 Z" />
    <path d="M-7 -0.6 L-9.5 -4 L-8 -4 L-5 -0.6 Z M-7 0.6 L-9.5 4 L-8 4 L-5 0.6 Z" />
  </g>
);

const RouteMap: React.FC = () => {
  const flight = useFlight();
  const ref = useRef<HTMLDivElement>(null);

  const a = mapPoint(flight.from, flight.to);
  const b = mapPoint(flight.to, flight.from);
  // Arco hacia arriba: punto de control sobre la perpendicular al tramo.
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) [nx, ny] = [-nx, -ny];
  const bend = Math.min(48, len * 0.35);
  const c = { x: (a.x + b.x) / 2 + nx * bend, y: (a.y + b.y) / 2 + ny * bend };
  const route = `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  // En reposo el avión queda en el destino, mirando según la tangente final.
  const heading = (Math.atan2(b.y - c.y, b.x - c.x) * 180) / Math.PI;

  useFigureTimeline(ref, flightKey(flight), (root, tl) => {
    const q = (s: string) => root.querySelector(s);
    tl.from(q('.hw-pin--from'), { scale: 0, transformOrigin: '50% 50%', ease: 'back.out(2.2)', duration: 0.4 }, 0)
      .from(q('.hw-route-mask'), { drawSVG: '0% 0%', duration: 1.2, ease: 'power1.inOut' }, 0.25)
      .fromTo(
        q('.hw-plane'),
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          motionPath: { path: q('.hw-route-mask') as SVGPathElement, align: q('.hw-route-mask') as SVGPathElement, alignOrigin: [0.5, 0.5], autoRotate: true },
          duration: 1.2,
          ease: 'power1.inOut',
        },
        0.25,
      )
      .from(q('.hw-pin--to'), { scale: 0, transformOrigin: '50% 50%', ease: 'back.out(2.2)', duration: 0.4 }, 1.3)
      .from(root.querySelectorAll('.hw-map-chip'), { y: 8, autoAlpha: 0, stagger: 0.08, duration: 0.35 }, 1.45);
  });

  const toCalculator = () => scrollToSection('calculadora');
  const labelOf = (point: typeof a, code: string, other: typeof a) => {
    // La etiqueta va del lado contrario al otro pin, para no tapar la ruta.
    const right = point.x >= other.x;
    return { x: point.x + (right ? 9 : -9), anchor: (right ? 'start' : 'end') as 'start' | 'end', text: point.off ? (right ? `${code} →` : `← ${code}`) : code };
  };
  const la = labelOf(a, flight.from.code, b);
  const lb = labelOf(b, flight.to.code, a);

  return (
    <div ref={ref} className="hw-figure hw-map">
      <svg className="hw-svg" viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true" focusable="false">
        <defs>
          <mask id="hw-route-reveal" maskUnits="userSpaceOnUse">
            <path className="hw-route-mask" d={route} fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
          </mask>
        </defs>
        <rect className="hw-sea" width={MAP_W} height={MAP_H} />
        <g className="hw-grid">
          {GRID_LON.map((lon) => {
            const [x] = project(0, lon);
            return <line key={lon} x1={x} x2={x} y1="0" y2={MAP_H} />;
          })}
          {GRID_LAT.map((lat) => {
            const [, y] = project(lat, 0);
            return <line key={lat} x1="0" x2={MAP_W} y1={y} y2={y} />;
          })}
        </g>
        <path className="hw-land" d={LAND_PATH} />

        <path className="hw-route" d={route} mask="url(#hw-route-reveal)" />

        {[{ p: a, cls: 'hw-pin--from', l: la }, { p: b, cls: 'hw-pin--to', l: lb }].map(({ p, cls, l }) => (
          <g key={cls} className={`hw-pin ${cls}`}>
            {!p.off && <circle className="hw-pin__pulse" cx={p.x} cy={p.y} r="5" />}
            <circle className="hw-pin__dot" cx={p.x} cy={p.y} r="4.2" />
            <text className="hw-pin__label" x={l.x} y={p.y + 3.5} textAnchor={l.anchor}>
              {l.text}
            </text>
          </g>
        ))}

        <g transform={`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${heading.toFixed(1)})`}>
          <Plane />
        </g>
      </svg>

      <div className="hw-map-chips">
        <button type="button" className="hw-map-chip" onClick={toCalculator} aria-label={`Cabina: ${fmt.cabin(flight)}. Cambiar en la calculadora`}>
          {fmt.cabin(flight)}
          <HiPencil aria-hidden="true" />
        </button>
        <button type="button" className="hw-map-chip" onClick={toCalculator} aria-label={`${fmt.pax(flight)}. Cambiar en la calculadora`}>
          {fmt.pax(flight)}
          <HiPencil aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default RouteMap;
