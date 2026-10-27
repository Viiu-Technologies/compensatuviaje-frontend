// "Cómo funciona": las tres figuras de la web (mapa, embudo y certificado) con
// el mismo vuelo, armándose una tras otra. Mismas clases y colores que
// howItWorks/HowItWorks.css; los tiempos son los de sus timelines (s × 30).
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { isPortrait } from '../../formats';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../theme/fonts';
import { backOut, draw, easeInOut, fmt, hash, prog, quad, quadAngle, rise, type Pt } from '../anim';
import { FLIGHT, LAND_PATH, MAP_H, MAP_W, project } from '../data';
import { FADE, HOW } from '../timing';

const STEPS = [
  { num: '01', title: 'Ingresa tu viaje', body: 'Origen, destino, cabina y pasajeros.' },
  { num: '02', title: 'Calcula con datos oficiales', body: `Factores ${FLIGHT.methodology}, los mismos del GHG Protocol.` },
  { num: '03', title: 'Compensa con proyectos verificados', body: 'Evaluados por Veritas AI antes de recibir tu aporte.' },
];

export const HowItWorksScene: React.FC = () => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const portrait = isPortrait(W, H);
  const title = (i: number) => prog(f, [HOW.titleIn[0] + i * 5, HOW.titleIn[1] + i * 5]);
  const figures = [RouteMapFig, FunnelFig, CertificateFig];

  return (
    <AbsoluteFill
      className="sv-root"
      style={{
        opacity: prog(f, [0, FADE]),
        background: '#F7FAF8',
        padding: portrait ? '80px 70px' : '90px 120px',
        fontFamily: FONT_BODY,
        color: '#0E3B36',
      }}
    >
      <div style={{ ...rise(title(0)), display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT_MONO, fontSize: 20, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1F8A4C' }}>
        <span style={{ width: 36, height: 2, background: '#1F8A4C' }} />
        Cómo funciona
      </div>
      <h2 style={{ ...rise(title(1)), margin: '22px 0 0', fontFamily: FONT_DISPLAY, fontSize: portrait ? 62 : 66, fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.025em' }}>
        La forma más transparente
        <br />
        de compensar tu impacto.
      </h2>

      <div
        style={{
          display: 'flex',
          flexDirection: portrait ? 'column' : 'row',
          gap: portrait ? 26 : 40,
          marginTop: portrait ? 44 : 56,
          alignItems: 'stretch',
        }}
      >
        {STEPS.map((step, i) => {
          const Fig = figures[i];
          const t = prog(f, HOW.cardIn(i));
          return (
            <div
              key={step.num}
              style={{
                ...rise(t, 30),
                flex: portrait ? undefined : 1,
                display: 'flex',
                flexDirection: portrait ? 'row' : 'column',
                gap: portrait ? 28 : 0,
                alignItems: portrait ? 'center' : undefined,
                background: '#ffffff',
                borderRadius: 26,
                border: '1px solid rgba(14, 59, 54, 0.08)',
                boxShadow: '0 30px 60px -40px rgba(14, 59, 54, 0.35)',
                overflow: 'hidden',
              }}
            >
              <div style={{ width: portrait ? 450 : '100%', aspectRatio: '360 / 228', background: '#F3F7F5', flexShrink: 0 }}>
                <Fig t={f - HOW.figureAt(i)} />
              </div>
              <div style={{ padding: portrait ? '0 28px 0 0' : '26px 30px 30px' }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 18, color: '#7E9491' }}>{step.num}</div>
                <div style={{ marginTop: 8, fontFamily: FONT_DISPLAY, fontSize: 31, fontWeight: 600, lineHeight: 1.15 }}>{step.title}</div>
                <div style={{ marginTop: 10, fontSize: 21, lineHeight: 1.45, color: '#40605C' }}>{step.body}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Segundos de la web → frames.
const s = (sec: number) => sec * 30;

/** Pulso de los pines (en la web es una animación CSS de 2,4 s). */
const pulse = (t: number, delay: number) => {
  const p = (((t - delay) % 72) + 72) % 72 / 72;
  return t < delay ? { scale: 1, opacity: 0 } : { scale: 1 + 3 * p, opacity: 0.8 * (1 - p) };
};

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg className="hw-svg" viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
    {children}
  </svg>
);

// ── Paso 1 · mapa ──
const GRID_LON = [-90, -75, -60, -45, -30];
const GRID_LAT = [-10, -25, -40, -55];

const RouteMapFig: React.FC<{ t: number }> = ({ t }) => {
  const [ax, ay] = project(FLIGHT.from.lat, FLIGHT.from.lon);
  const [bx, by] = project(FLIGHT.to.lat, FLIGHT.to.lon);
  const a: Pt = { x: ax, y: ay };
  const b: Pt = { x: bx, y: by };
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) [nx, ny] = [-nx, -ny];
  const bend = Math.min(48, len * 0.35);
  const c: Pt = { x: (a.x + b.x) / 2 + nx * bend, y: (a.y + b.y) / 2 + ny * bend };
  const route = `M${a.x} ${a.y} Q${c.x} ${c.y} ${b.x} ${b.y}`;

  const pinFrom = prog(t, [0, s(0.4)], backOut(2.2));
  const fly = prog(t, [s(0.25), s(1.45)], easeInOut);
  const pinTo = prog(t, [s(1.3), s(1.7)], backOut(2.2));
  const plane = quad(a, c, b, fly);
  const chips = (i: number) => prog(t, [s(1.45 + i * 0.08), s(1.8 + i * 0.08)]);

  const pin = (p: Pt, k: number, code: string, right: boolean, delay: number) => {
    const ps = pulse(t, delay);
    return (
      <g className="hw-pin" transform={`translate(${p.x} ${p.y}) scale(${k}) translate(${-p.x} ${-p.y})`}>
        <circle cx={p.x} cy={p.y} r="5" fill="none" stroke="#1F8A4C" strokeWidth="1.2" opacity={ps.opacity} transform={`translate(${p.x} ${p.y}) scale(${ps.scale}) translate(${-p.x} ${-p.y})`} />
        <circle className="hw-pin__dot" cx={p.x} cy={p.y} r="4.2" />
        <text className="hw-pin__label" x={p.x + (right ? 9 : -9)} y={p.y + 3.5} textAnchor={right ? 'start' : 'end'}>
          {code}
        </text>
      </g>
    );
  };

  return (
    <div className="hw-figure" style={{ height: '100%' }}>
      <SVG>
        <defs>
          <mask id="sv-hw-route" maskUnits="userSpaceOnUse">
            <path d={route} pathLength={1} fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" style={draw(fly)} />
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
        <path className="hw-route" d={route} mask="url(#sv-hw-route)" />
        {pin(a, pinFrom, FLIGHT.from.code, a.x >= b.x, s(0.4))}
        {pin(b, pinTo, FLIGHT.to.code, b.x >= a.x, s(1.7) + 36)}
        {fly > 0 && (
          <g transform={`translate(${plane.x} ${plane.y}) rotate(${quadAngle(a, c, b, Math.min(fly, 0.999))})`} opacity={prog(t, [s(0.25), s(0.4)])}>
            <g className="hw-plane">
              <path d="M-9 0 L7 -1.2 C9 -1.2 10.5 -0.6 10.5 0 C10.5 0.6 9 1.2 7 1.2 Z" />
              <path d="M1 -0.8 L-3 -8 L-0.6 -8 L5 -0.8 Z M1 0.8 L-3 8 L-0.6 8 L5 0.8 Z" />
              <path d="M-7 -0.6 L-9.5 -4 L-8 -4 L-5 -0.6 Z M-7 0.6 L-9.5 4 L-8 4 L-5 0.6 Z" />
            </g>
          </g>
        )}
        {/* Píldoras de cabina y pasajeros */}
        {[`${FLIGHT.cabinLabel}`, `${FLIGHT.pax} pasajero`].map((text, i) => {
          const w = text.length * 6.2 + 20;
          const x = 12 + (i ? 12 + (FLIGHT.cabinLabel.length * 6.2 + 20) : 0);
          const k = chips(i);
          return (
            <g key={text} opacity={k} transform={`translate(0 ${(1 - k) * 8})`}>
              <rect x={x} y={MAP_H - 34} width={w} height="22" rx="11" fill="#0E3B36" />
              <text x={x + w / 2} y={MAP_H - 19.5} textAnchor="middle" fill="#fff" style={{ font: `600 10.5px ${FONT_BODY}` }}>
                {text}
              </text>
            </g>
          );
        })}
      </SVG>
    </div>
  );
};

// ── Paso 2 · embudo ──
const MOUTH = { x: 180, y: 108 };
const chipWidth = (text: string) => Math.round(text.length * 6.3 + 22);

const FunnelFig: React.FC<{ t: number }> = ({ t }) => {
  const inputs = [`2 × ${fmt.km(FLIGHT.kmOneWay)} km`, `${FLIGHT.pax} pasajero`, FLIGHT.cabinLabel, `Factor ${fmt.factor(FLIGHT.factor)}`];
  const chips = inputs.map((text, i) => {
    const w = chipWidth(text);
    return { text, w, x: i % 2 === 0 ? 176 - w : 184, y: 18 + Math.floor(i / 2) * 32 };
  });
  const flow = prog(t, [s(1.1), s(1.6)], easeInOut);
  const result = prog(t, [s(1.5), s(2)], backOut(1.8));
  const kg = FLIGHT.kg * prog(t, [s(1.55), s(2.55)], (x) => 1 - (1 - x) ** 3);

  return (
    <div className="hw-figure" style={{ height: '100%' }}>
      <SVG>
        {chips.map((chip, i) => {
          const enter = prog(t, [s(i * 0.07), s(i * 0.07 + 0.35)]);
          const fall = prog(t, [s(0.55 + i * 0.12), s(1 + i * 0.12)], (x) => x * x);
          const back = prog(t, [s(2.2 + i * 0.05), s(2.55 + i * 0.05)]);
          const k = fall * (1 - back);
          const cx = chip.x + chip.w / 2;
          const cy = chip.y + 11;
          const tx = (MOUTH.x - cx) * k;
          const ty = (MOUTH.y - cy) * k + (1 - enter) * -10;
          const sc = 1 - 0.7 * k;
          return (
            <g key={chip.text} className="hw-chip" opacity={enter * (1 - k)} transform={`translate(${tx} ${ty}) translate(${cx} ${cy}) scale(${sc}) translate(${-cx} ${-cy})`}>
              <rect x={chip.x} y={chip.y} width={chip.w} height="22" rx="11" />
              <text x={cx} y={chip.y + 14.5} textAnchor="middle">
                {chip.text}
              </text>
            </g>
          );
        })}
        <path className="hw-funnel__body" d="M108 96 L252 96 L198 150 L198 170 L162 170 L162 150 Z" />
        <path className="hw-funnel__rim" d="M104 92 L256 92 L256 100 L104 100 Z" />
        <rect className="hw-funnel__flow" x="174" y="104" width="12" height={66 * flow} rx="6" />
        <path className="hw-funnel__shine" d="M122 104 L160 104 L176 120" />
        <g className="hw-result" opacity={Math.min(1, result)} transform={`translate(180 197) scale(${0.7 + 0.3 * result}) translate(-180 -197) translate(0 ${(1 - result) * -14})`}>
          <rect x="104" y="180" width="152" height="34" rx="17" />
          <text x="180" y="202" textAnchor="middle">
            <tspan className="hw-result__number">{fmt.kg(kg)}</tspan>
            <tspan className="hw-result__unit"> kg CO₂e</tspan>
          </text>
        </g>
      </SVG>
    </div>
  );
};

// ── Paso 3 · certificado ──
const TREES: Array<[number, number, number]> = [
  [92, 112, 22],
  [106, 114, 28],
  [121, 112, 20],
  [134, 115, 25],
];
const PANELS = [176, 206, 236];

const CertificateFig: React.FC<{ t: number }> = ({ t }) => {
  const card = prog(t, [0, s(0.5)]);
  const sun = prog(t, [s(0.4), s(0.8)]);
  const kg = FLIGHT.kg * prog(t, [s(0.7), s(1.7)], (x) => 1 - (1 - x) ** 3);
  const status = prog(t, [s(1.3), s(1.65)]);
  const seal = prog(t, [s(1.5), s(1.95)], backOut(2));
  const sealIn = prog(t, [s(1.5), s(1.7)]);

  return (
    <div className="hw-figure" style={{ height: '100%' }}>
      <SVG>
        <g className="hw-cert" opacity={card} transform={`translate(0 ${(1 - card) * 16})`}>
          <rect className="hw-cert__card" x="62" y="22" width="236" height="188" rx="14" />
          <text className="hw-cert__eyebrow" x="80" y="44">
            CERTIFICADO DE COMPENSACIÓN
          </text>
          <rect className="hw-cert__sky" x="78" y="54" width="204" height="70" rx="8" />
          <circle className="hw-cert__sun" cx="258" cy="70" r={7 * sun} />
          <path className="hw-cert__hill" d="M78 110 C110 92 150 98 180 106 C210 114 240 100 282 104 L282 116 C282 120 279 124 274 124 L86 124 C81 124 78 120 78 116 Z" />
          {TREES.map(([x, base, h], i) => {
            const k = prog(t, [s(0.35 + i * 0.08), s(0.75 + i * 0.08)], backOut(1.6));
            return (
              <path
                key={x}
                className="hw-cert__tree"
                d={`M${x} ${base - h} L${x + h * 0.38} ${base} L${x - h * 0.38} ${base} Z`}
                transform={`translate(0 ${base}) scale(1 ${Math.max(0, k)}) translate(0 ${-base})`}
              />
            );
          })}
          {PANELS.map((x, i) => {
            const k = prog(t, [s(0.5 + i * 0.08), s(0.85 + i * 0.08)]);
            return (
              <g key={x} className="hw-cert__panel" opacity={k} transform={`translate(0 ${(1 - k) * 6})`}>
                <path d={`M${x} 92 L${x + 24} 88 L${x + 28} 104 L${x + 4} 108 Z`} />
                <path className="hw-cert__panel-grid" d={`M${x + 2} 100 L${x + 26} 96 M${x + 12} 90 L${x + 16} 106`} />
                <line className="hw-cert__panel-leg" x1={x + 14} y1="106" x2={x + 14} y2="116" />
              </g>
            );
          })}
          <text className="hw-cert__caption" x="80" y="146">
            CO₂ A COMPENSAR
          </text>
          <text className="hw-cert__kg" x="80" y="172">
            <tspan>{fmt.kg(kg)}</tspan>
            <tspan className="hw-cert__unit"> kg CO₂e</tspan>
          </text>
          <g className="hw-cert__status" opacity={status} transform={`translate(${(1 - status) * -8} 0)`}>
            <rect x="80" y="182" width="132" height="20" rx="10" />
            <circle cx="92" cy="192" r="4" />
            <text x="101" y="196">
              Listo para compensar
            </text>
          </g>
        </g>
        <g className="hw-seal" opacity={sealIn} transform={`translate(292 30) rotate(${-18 * (1 - seal)}) scale(${1.5 - 0.5 * seal})`}>
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
        {/* Destellos al caer el sello */}
        {t > s(1.75) && t < s(2.4) &&
          [0, 1, 2, 3, 4, 5].map((i) => {
            const k = prog(t, [s(1.75), s(2.4)]);
            const ang = (i / 6) * Math.PI * 2 + hash(i) * 0.5;
            const r = 30 + k * 16;
            return <circle key={i} cx={292 + Math.cos(ang) * r} cy={30 + Math.sin(ang) * r} r={2 * (1 - k)} fill="#5EE08A" />;
          })}
      </SVG>
    </div>
  );
};
