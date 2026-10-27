// Metodología de /calculadora: el minijuego de los anillos DEFRA. Se arma la
// figura, el avión vuela de Santiago a Madrid en primera (estela, destello en
// cada anillo, los asientos saltan), aterriza con 5.018 kg y baja de cabina con
// ↓ hasta económica: misión cumplida.
//
// La geometría es la de factorRings/FactorRings.tsx (mismo viewBox y mismas
// clases de FactorRings.css); los factores salen de factorBench/model.ts.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { HiCheck } from 'react-icons/hi';
import { isPortrait } from '../../formats';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../theme/fonts';
import { backOut, bounceOut, draw, easeInOut, fmt, hash, prog, rise } from '../anim';
import { EMISSION_FACTORS, STOPS, factorOf, haulOf, type Cabin, type Haul } from '../data';
import { FADE, METHOD } from '../timing';

const CABINS: Cabin[] = ['economy', 'premium_economy', 'business', 'first'];
const CABIN_SHORT: Record<Cabin, string> = { economy: 'Eco', premium_economy: 'Prem', business: 'Bus', first: '1ª' };
const CABIN_NAME: Record<Cabin, string> = { economy: 'económica', premium_economy: 'premium', business: 'business', first: 'primera' };
const HAULS: Haul[] = ['Domestic', 'Short-haul', 'Long-haul'];
const HAUL_NAME: Record<Haul, string> = { Domestic: 'doméstico', 'Short-haul': 'corto', 'Long-haul': 'largo' };

// ── Geometría de FactorRings (viewBox 0 90 720 350) ──
const O = { x: 70, y: 300 };
const RING_RX = [170, 360, 600];
const RY = 0.36;
const BAND_X: Record<Haul, number> = { Domestic: 155, 'Short-haul': 335, 'Long-haul': 550 };
const COL_X = [-39, -13, 13, 39];
const COL_W = 16;
const DEPTH = 6;
const SCALE = 340;
const LINE_Y = O.y + 44;
const SEGMENTS: Array<[number, number, number, number]> = [
  [100, 500, 90, O.x + RING_RX[0]],
  [500, 3700, O.x + RING_RX[0], O.x + RING_RX[1]],
  [3700, 16000, O.x + RING_RX[1], O.x + RING_RX[2]],
];
const X_MAX = SEGMENTS[2][3];
const kmToX = (km: number) => {
  const k = Math.min(16000, Math.max(100, km));
  for (const [a, b, x0, x1] of SEGMENTS) if (k <= b) return x0 + (Math.log(k / a) / Math.log(b / a)) * (x1 - x0);
  return X_MAX;
};
const xToKm = (x: number) => {
  for (const [a, b, x0, x1] of SEGMENTS) if (x <= x1) return a * (b / a) ** ((x - x0) / (x1 - x0));
  return 16000;
};

const MAD = STOPS.find((s) => s.code === 'MAD')!;
const X0 = kmToX(100);
const X1 = kmToX(MAD.km);
/** Posición del avión en cada frame del vuelo. */
const planeX = (f: number) => X0 + (X1 - X0) * prog(f, METHOD.fly, easeInOut);
/** Frame en que el avión cruza cada borde de anillo (500 y 3.700 km). */
const CROSSINGS = [1, 2].map((i) => {
  const edge = SEGMENTS[i][2];
  for (let f = METHOD.fly[0]; f <= METHOD.fly[1]; f++) if (planeX(f) >= edge) return { f, x: edge, haul: HAULS[i] };
  return { f: Infinity, x: edge, haul: HAULS[i] };
});

const cabinAt = (f: number): Cabin => {
  const [a, b, c] = METHOD.cabinSteps;
  return f >= c ? 'economy' : f >= b ? 'premium_economy' : f >= a ? 'business' : 'first';
};

export const MethodScene: React.FC = () => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const portrait = isPortrait(W, H);

  const x = planeX(f);
  const km = xToKm(x);
  const haul = haulOf(km);
  const cabin = cabinAt(f);
  const factor = factorOf(km, cabin);
  const kg = km * factor;
  const landed = f >= METHOD.fly[1];
  const done = f >= METHOD.missionDone;
  const title = (i: number) => prog(f, [METHOD.titleIn[0] + i * 5, METHOD.titleIn[1] + i * 5]);

  const svgW = portrait ? 900 : 1060;

  return (
    <AbsoluteFill
      className="sv-root"
      style={{
        opacity: prog(f, [0, FADE]),
        background: '#F7FAF8',
        fontFamily: FONT_BODY,
        color: '#0E3B36',
        flexDirection: portrait ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: portrait ? 26 : 50,
        padding: portrait ? '70px 70px' : '0 110px',
      }}
    >
      <div style={{ width: portrait ? '100%' : 540, display: 'flex', flexDirection: 'column', gap: portrait ? 22 : 30 }}>
        <div style={{ ...rise(title(0)), display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT_MONO, fontSize: 20, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1F8A4C' }}>
          <span style={{ width: 36, height: 2, background: '#1F8A4C' }} />
          Metodología · DEFRA 2025
        </div>
        <h2 style={{ ...rise(title(1)), margin: 0, fontFamily: FONT_DISPLAY, fontSize: portrait ? 60 : 64, fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.025em' }}>
          El factor cambia según cómo viajas.
        </h2>
        <Mission f={f} done={done} />
        {!portrait && <Readout t={prog(f, METHOD.missionIn)} km={km} factor={factor} kg={kg} cabin={cabin} haul={haul} landed={landed} done={done} />}
        {!portrait && <Keys f={f} />}
      </div>

      {/* La figura va en su tarjeta, como en la web: el relleno de los anillos se corta en su borde. */}
      <div
        style={{
          ...rise(prog(f, [10, 30]), 20),
          flexShrink: 0,
          padding: 18,
          borderRadius: 30,
          background: '#F3F7F5',
          border: '1px solid rgba(14, 59, 54, 0.08)',
        }}
      >
      <svg viewBox="0 90 720 350" width={svgW} height={(svgW * 350) / 720} style={{ display: 'block' }}>
        <defs>
          <clipPath id="sv-fr-clip">
            <rect y="90" width="720" height="350" />
          </clipPath>
          <linearGradient id="fr-trail" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#5EE08A" stopOpacity="0" />
            <stop offset="1" stopColor="#1F8A4C" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        <g clipPath="url(#sv-fr-clip)">
          {[...RING_RX].reverse().map((rx, i) => {
            const ring = 2 - i;
            const t = prog(f, [METHOD.rings[0] + ring * 6, METHOD.rings[0] + ring * 6 + 21]);
            // El anillo es punteado: se revela con una máscara que se dibuja.
            return (
              <g key={rx}>
                <mask id={`sv-ring-${ring}`} maskUnits="userSpaceOnUse">
                  <ellipse cx={O.x} cy={O.y} rx={rx} ry={rx * RY} pathLength={1} fill="none" stroke="#fff" strokeWidth="8" style={draw(t)} />
                </mask>
                <ellipse className={`fr-ring fr-ring--${ring}`} cx={O.x} cy={O.y} rx={rx} ry={rx * RY} style={{ stroke: 'none', opacity: t }} />
                <ellipse className="fr-ring" cx={O.x} cy={O.y} rx={rx} ry={rx * RY} style={{ fill: 'none' }} mask={`url(#sv-ring-${ring})`} />
              </g>
            );
          })}
        </g>

        <circle className="fr-origin" cx={O.x} cy={O.y} r="5" opacity={prog(f, METHOD.rings)} />
        <text className="fr-origin__label" x={O.x} y={O.y - 14} textAnchor="middle" opacity={prog(f, METHOD.rings)}>
          Santiago
        </text>

        {HAULS.map((h, bi) => {
          const at = METHOD.band(bi);
          const cross = CROSSINGS.find((c) => c.haul === h);
          return (
            <g key={h} className={`fr-band ${h === haul && f >= METHOD.planeIn[0] ? 'fr-band--on' : ''}`}>
              {CABINS.map((c, i) => {
                const grow = prog(f, [at + i * 1.5, at + i * 1.5 + 12], backOut(1.4));
                const bounceP = cross ? prog(f, [cross.f + i * 1.2, cross.f + i * 1.2 + 15], (t) => t) : 1;
                const seatY = bounceP > 0 && bounceP < 1 ? -8 * (1 - bounceOut(bounceP)) : 0;
                return (
                  <g key={c} className={c === cabin && h === haul && f >= METHOD.planeIn[0] ? 'fr-pick' : undefined}>
                    <g transform={`translate(0 ${O.y}) scale(1 ${Math.max(0, grow)}) translate(0 ${-O.y})`}>
                      <Column haul={h} cabin={c} index={i} seatY={seatY} />
                    </g>
                  </g>
                );
              })}
              <g opacity={prog(f, [at, at + 10])}>
                {CABINS.map((c, i) => (
                  <text key={c} className="fr-col__label" x={BAND_X[h] + COL_X[i]} y={O.y + 16} textAnchor="middle">
                    {CABIN_SHORT[c]}
                  </text>
                ))}
                <text x={BAND_X[h]} y={O.y + 104} textAnchor="middle" className="fr-band-label__km">
                  {h === 'Domestic' ? '< 500 km' : h === 'Short-haul' ? '500 – 3.700 km' : '> 3.700 km'}
                </text>
                <text x={BAND_X[h]} y={O.y + 119} textAnchor="middle" className="fr-band-label__name">
                  tramo {HAUL_NAME[h]}
                </text>
              </g>
            </g>
          );
        })}

        {/* Línea de vuelo, estela y destellos */}
        <line className="fr-line" x1={O.x} x2={X_MAX} y1={LINE_Y} y2={LINE_Y} opacity={prog(f, METHOD.stops)} />
        <rect className="fr-trail" x={O.x} y={LINE_Y - 1.5} width={Math.max(0, f >= METHOD.fly[0] ? x - O.x : 0)} height="3" rx="1.5" />
        {CROSSINGS.map((c) => {
          const t = prog(f, [c.f, c.f + 18], (v) => 1 - (1 - v) ** 2);
          return t > 0 && t < 1 ? (
            <g key={c.x}>
              <circle className="fr-flash" cx={c.x} cy={LINE_Y} r={9 * (0.3 + 2.7 * t)} opacity={0.9 * (1 - t)} />
              <circle cx={c.x} cy={LINE_Y} r={4 * (1 - t)} fill="#5EE08A" />
            </g>
          ) : null;
        })}

        {STOPS.map((s, i) => {
          const sx = kmToX(s.km);
          const t = prog(f, [METHOD.stops[0] + i * 3, METHOD.stops[0] + i * 3 + 10]);
          return (
            <g key={s.code} className={`fr-stop ${landed && s.code === 'MAD' ? 'fr-stop--on' : ''}`} opacity={t} transform={`translate(0 ${(1 - t) * 6})`}>
              <circle cx={sx} cy={LINE_Y} r="4" />
              <text className="fr-stop__name" x={sx} y={LINE_Y + 19} textAnchor="middle">
                {s.name}
              </text>
              <text className="fr-stop__code" x={sx} y={LINE_Y + 31} textAnchor="middle">
                {s.code}
              </text>
            </g>
          );
        })}

        {/* Chispas: una cada 2 frames mientras vuela, viven 21 frames */}
        <g className="fr-sparks">
          {Array.from({ length: 11 }, (_, k) => {
            const born = Math.floor(f / 2) * 2 - k * 2;
            if (born < METHOD.fly[0] + 4 || born > METHOD.fly[1] - 6) return null;
            const p = (f - born) / 21;
            if (p < 0 || p > 1) return null;
            const sx = planeX(born) - 14;
            return (
              <circle
                key={born}
                cx={sx - (8 + hash(born) * 10) * p}
                cy={LINE_Y + (hash(born + 1) - 0.5) * 6}
                r={2.2 - 1.6 * p}
                opacity={0.95 * (1 - p)}
              />
            );
          })}
        </g>

        <g opacity={prog(f, METHOD.planeIn)} transform={`translate(${f >= METHOD.fly[0] ? x : X0} ${LINE_Y}) scale(1.35)`}>
          <g className="fr-plane">
            <path d="M-13 0 L9 -1.6 C12 -1.6 14 -0.8 14 0 C14 0.8 12 1.6 9 1.6 Z" />
            <path d="M1 -1 L-4 -10 L-1 -10 L6 -1 Z M1 1 L-4 10 L-1 10 L6 1 Z" />
            <path d="M-10 -0.8 L-13 -5 L-11 -5 L-7 -0.8 Z M-10 0.8 L-13 5 L-11 5 L-7 0.8 Z" />
          </g>
        </g>
        {/* Al aterrizar, un pulso en Madrid */}
        {(() => {
          const t = prog(f, [METHOD.fly[1], METHOD.fly[1] + 20]);
          return t > 0 && t < 1 ? <circle cx={X1} cy={LINE_Y} r={6 + 18 * t} fill="none" stroke="#1F8A4C" strokeWidth="1.5" opacity={1 - t} /> : null;
        })()}
      </svg>
      </div>

      {portrait && <Readout t={prog(f, METHOD.missionIn)} km={km} factor={factor} kg={kg} cabin={cabin} haul={haul} landed={landed} done={done} />}
      {portrait && <Keys f={f} />}
    </AbsoluteFill>
  );
};

const Column: React.FC<{ haul: Haul; cabin: Cabin; index: number; seatY: number }> = ({ haul, cabin, index, seatY }) => {
  const h = EMISSION_FACTORS[haul][cabin] * SCALE;
  const x = BAND_X[haul] + COL_X[index] - COL_W / 2;
  const top = O.y - h;
  return (
    <g className="fr-col">
      <rect className="fr-col__front" x={x} y={top} width={COL_W} height={h} />
      <path className="fr-col__side" d={`M${x + COL_W} ${top} l${DEPTH} ${-DEPTH} v${h} l${-DEPTH} ${DEPTH} Z`} />
      <path className="fr-col__top" d={`M${x} ${top} l${DEPTH} ${-DEPTH} h${COL_W} l${-DEPTH} ${DEPTH} Z`} />
      <g transform={`translate(${x + 1} ${top - DEPTH / 2 + seatY})`}>
        <g className="fr-col__seat">
          <rect x="2" y="-5" width="12" height="4" rx="1.6" />
          <path d="M2.4 -4.6 L0.6 -15 Q0.4 -16.4 1.8 -16.6 L4 -16.8 Q5.4 -16.9 5.6 -15.6 L6.8 -4.6 Z" />
          <rect x="0" y="-20.5" width="5.6" height="3.4" rx="1.4" transform="rotate(-8 2.8 -18.8)" />
        </g>
      </g>
    </g>
  );
};

const Mission: React.FC<{ f: number; done: boolean }> = ({ f, done }) => {
  const t = prog(f, METHOD.missionIn);
  const pop = prog(f, [METHOD.missionDone, METHOD.missionDone + 10], backOut(2.4));
  return (
    <div
      style={{
        ...rise(t),
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '16px 20px',
        borderRadius: 18,
        background: done ? '#E4F6E0' : '#ffffff',
        border: `1px solid ${done ? 'rgba(31,138,76,0.35)' : 'rgba(14, 59, 54, 0.08)'}`,
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map((i) => {
          const ok = i < 2 || done;
          return (
            <span
              key={i}
              style={{
                width: 34,
                height: 34,
                borderRadius: 99,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT_MONO,
                fontSize: 16,
                color: ok ? '#fff' : '#0E3B36',
                background: ok ? '#1F8A4C' : 'transparent',
                border: `1.5px solid ${ok ? '#1F8A4C' : '#0E3B36'}`,
                transform: i === 2 && done ? `scale(${pop})` : undefined,
              }}
            >
              {ok ? <HiCheck size={18} /> : 3}
            </span>
          );
        })}
      </div>
      <div style={{ fontSize: 21, lineHeight: 1.4, color: '#40605C' }}>
        {done ? (
          <>
            <strong style={{ color: '#0E3B36' }}>¡Misión cumplida!</strong> En vuelos largos la cabina pesa mucho: solo en
            económica se baja de 1.300 kg.
          </>
        ) : (
          <>
            <strong style={{ color: '#0E3B36' }}>Misión 3:</strong> llega a Madrid emitiendo menos de 1.300 kg de CO₂e.
          </>
        )}
      </div>
    </div>
  );
};

const Readout: React.FC<{ t: number; km: number; factor: number; kg: number; cabin: Cabin; haul: Haul; landed: boolean; done: boolean }> = ({
  t,
  km,
  factor,
  kg,
  cabin,
  haul,
  landed,
  done,
}) => (
  <div style={{ fontFamily: FONT_MONO, color: '#0E3B36', textAlign: 'left', width: '100%', ...rise(t) }}>
    <div style={{ fontSize: 25, fontWeight: 500, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
      {fmt.km(km)} km × {fmt.factor(factor)} ={' '}
      <span style={{ color: done ? '#1F8A4C' : kg > 1300 ? '#B4492F' : '#0E3B36' }}>{fmt.kg(kg)} kg CO₂e</span>
    </div>
    <div style={{ marginTop: 8, fontSize: 17, color: '#7E9491', whiteSpace: 'nowrap' }}>
      {landed ? 'Santiago → Madrid' : `tramo ${HAUL_NAME[haul]}`} · {CABIN_NAME[cabin]} · por pasajero, solo ida
    </div>
  </div>
);

/** Teclas del juego; se iluminan cuando "se aprietan". */
const Keys: React.FC<{ f: number }> = ({ f }) => {
  const near = (at: number, span = 5) => f >= at - 1 && f <= at + span;
  const keys = [
    { k: '←', on: false },
    { k: '→', on: f >= METHOD.fly[0] && f < METHOD.fly[1] - 10 },
    { k: '↑', on: false },
    { k: '↓', on: METHOD.cabinSteps.some((at) => near(at)) },
    { k: 'Enter', on: near(METHOD.fly[1] - 4, 6) },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, opacity: prog(f, METHOD.missionIn) }}>
      {keys.map(({ k, on }) => (
        <span
          key={k}
          style={{
            minWidth: 46,
            height: 46,
            flexShrink: 0,
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            fontFamily: FONT_MONO,
            fontSize: 20,
            color: on ? '#fff' : '#0E3B36',
            background: on ? '#1F8A4C' : '#ffffff',
            border: `1px solid ${on ? '#1F8A4C' : 'rgba(14, 59, 54, 0.16)'}`,
            boxShadow: on ? 'none' : '0 3px 0 rgba(14, 59, 54, 0.12)',
            transform: on ? 'translateY(2px)' : undefined,
          }}
        >
          {k}
        </span>
      ))}
      <span style={{ marginLeft: 8, fontFamily: FONT_MONO, fontSize: 16, color: '#7E9491', whiteSpace: 'nowrap' }}>volar · cabina · aterrizar</span>
    </div>
  );
};
