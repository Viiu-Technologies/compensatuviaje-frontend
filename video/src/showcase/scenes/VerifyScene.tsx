// Verificación: el flujo de la web (certificado → huella → bloque en la cadena
// → registro público en Polygon) armándose pieza por pieza, con los estándares
// que respaldan el cálculo. Mismo dibujo y clases que
// verificationFlow/VerificationFlow.tsx; los tiempos son los de su timeline.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { HiCheckCircle } from 'react-icons/hi';
import { isPortrait } from '../../formats';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../theme/fonts';
import { backOut, cubic, draw, prog, rise, type Pt } from '../anim';
import { STANDARDS } from '../data';
import { FADE, VERIFY, VERIFY_AT } from '../timing';

const SKEW = -16;

type Cube = { x: number; y: number; s: number; tone: 'core' | 'side' };
const CORE: Cube = { x: 528, y: 292, s: 38, tone: 'core' };
const SATELLITES: Cube[] = [
  { x: 528, y: 204, s: 27, tone: 'side' },
  { x: 452, y: 292, s: 27, tone: 'side' },
  { x: 604, y: 280, s: 27, tone: 'side' },
  { x: 478, y: 374, s: 27, tone: 'side' },
  { x: 578, y: 372, s: 27, tone: 'side' },
];

const face = (points: Array<[number, number]>) => points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ');

/** `k`: avance con rebote (0 → 1, puede pasarse); entra desde `from` de su tamaño. */
const CubeShape: React.FC<{ cube: Cube; k: number; from: number }> = ({ cube, k, from }) => {
  const { x, y, s } = cube;
  const w = s * 0.866;
  const scale = from + (1 - from) * k;
  return (
    <g className={`vf-cube vf-cube--${cube.tone}`} opacity={Math.min(1, Math.max(0, k))} transform={`translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`}>
      <polygon className="vf-cube__top" points={face([[x, y - s], [x + w, y - s / 2], [x, y], [x - w, y - s / 2]])} />
      <polygon className="vf-cube__left" points={face([[x - w, y - s / 2], [x, y], [x, y + s], [x - w, y + s / 2]])} />
      <polygon className="vf-cube__right" points={face([[x, y], [x + w, y - s / 2], [x + w, y + s / 2], [x, y + s]])} />
    </g>
  );
};

// Conexiones: [inicio, control 1, control 2, fin] de cada cúbica.
const LINKS: Array<[Pt, Pt, Pt, Pt]> = [
  [{ x: 128, y: 226 }, { x: 128, y: 296 }, { x: 196, y: 326 }, { x: 252, y: 322 }],
  [{ x: 394, y: 286 }, { x: 404, y: 286 }, { x: 412, y: 300 }, { x: 426, y: 300 }],
  [{ x: 628, y: 290 }, { x: 664, y: 302 }, { x: 668, y: 372 }, { x: 628, y: 418 }],
];
const linkD = ([a, b, c, d]: [Pt, Pt, Pt, Pt]) => `M${a.x} ${a.y} C ${b.x} ${b.y}, ${c.x} ${c.y}, ${d.x} ${d.y}`;

const Check: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g className="vf-check" transform={`translate(${x} ${y})`}>
    <circle r="8.5" />
    <path d="M-3.6 0.2 L-1 2.8 L3.8 -2.4" />
  </g>
);

export const VerifyScene: React.FC = () => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const portrait = isPortrait(W, H);
  const title = (i: number) => prog(f, [VERIFY.titleIn[0] + i * 5, VERIFY.titleIn[1] + i * 5]);
  const flowW = portrait ? 760 : 860;

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
        gap: portrait ? 18 : 70,
        padding: portrait ? '70px 70px' : '0 120px',
      }}
    >
      <div style={{ width: portrait ? '100%' : 660, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <div style={{ ...rise(title(0)), display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT_MONO, fontSize: 20, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1F8A4C' }}>
          <span style={{ width: 36, height: 2, background: '#1F8A4C' }} />
          Verificación blockchain
        </div>
        <h2 style={{ ...rise(title(1)), margin: 0, fontFamily: FONT_DISPLAY, fontSize: portrait ? 60 : 66, fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.025em' }}>
          Verifica tu certificado
          <br />
          en blockchain.
        </h2>
        {!portrait && (
          <p style={{ ...rise(title(2)), margin: 0, fontSize: 26, lineHeight: 1.5, color: '#40605C' }}>
            Cada compensación queda en un registro público: cualquiera puede comprobarla, sin pedirnos permiso.
          </p>
        )}
        {!portrait && <Standards f={f} />}
      </div>

      <svg viewBox="0 0 690 580" width={flowW} height={(flowW * 580) / 690} style={{ overflow: 'visible', flexShrink: 0 }}>
        <Flow t={f - VERIFY_AT} />
      </svg>

      {portrait && <Standards f={f} />}
    </AbsoluteFill>
  );
};

/** Los cuatro estándares de la franja de la landing. */
const Standards: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%' }}>
    {STANDARDS.map((st, i) => {
      const t = prog(f, [VERIFY.standard(i), VERIFY.standard(i) + 16]);
      return (
        <div
          key={st.name}
          style={{
            ...rise(t, 14),
            padding: '16px 18px',
            borderRadius: 16,
            background: '#ffffff',
            border: '1px solid rgba(14, 59, 54, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600 }}>{st.name}</span>
            <HiCheckCircle size={24} color="#1F8A4C" style={{ transform: `scale(${prog(f, [VERIFY.standard(i) + 8, VERIFY.standard(i) + 18], backOut(2.4))})` }} />
          </div>
          <div style={{ marginTop: 6, fontFamily: FONT_MONO, fontSize: 15, color: '#1F8A4C' }}>{st.category}</div>
          <div style={{ marginTop: 2, fontSize: 16, color: '#7E9491' }}>{st.scope}</div>
        </div>
      );
    })}
  </div>
);

const s = (sec: number) => sec * 30;

const Flow: React.FC<{ t: number }> = ({ t }) => {
  const p = (a: number, b: number, e?: (x: number) => number) => prog(t, [s(a), s(b)], e);
  const cert = p(0, 0.5);
  const certPill = p(0.35, 0.85, backOut(2));
  const link = [p(0.7, 1.25), p(2.2, 2.75), p(3.5, 4.05)];
  const fp = p(1.05, 1.55);
  const scan = p(1.25, 2.05);
  const hashIn = p(1.9, 2.3);
  const glow = t < s(3.45) ? p(3.1, 3.45) : 1 - p(3.45, 3.8);
  const registry = p(3.85, 4.35);
  const regPill = p(4.2, 4.7, backOut(2));
  const tx = p(4.45, 4.85);

  // Pulsos que recorren las conexiones al terminar de armarse (cada 4 s).
  const pulse = (i: number) => {
    const local = t - s(4.9) - s(i * 1.1);
    if (local < 0) return null;
    const q = (local % s(4)) / s(1.6);
    if (q > 1) return null;
    const pt = cubic(...LINKS[i], q);
    const o = Math.min(1, q / 0.125) * (q > 0.84 ? 1 - (q - 0.84) / 0.16 : 1);
    return <circle key={i} className="vf-pulse" cx={pt.x} cy={pt.y} r="3.4" style={{ opacity: o }} />;
  };

  const card = (k: number) => ({ opacity: k, transform: `translate(0 ${(1 - k) * 14})` });

  return (
    <g className="sv-root">
      <defs>
        <filter id="vf-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#0E3B36" floodOpacity="0.12" />
        </filter>
        <radialGradient id="vf-glow">
          <stop offset="0" stopColor="#5EE08A" stopOpacity="0.9" />
          <stop offset="1" stopColor="#5EE08A" stopOpacity="0" />
        </radialGradient>
        <clipPath id="vf-fp-clip">
          <circle cx="70" cy="58" r="34" />
        </clipPath>
      </defs>

      <g className="vf-links">
        {LINKS.map((l, i) => (
          <path key={i} className="vf-link" d={linkD(l)} pathLength={1} style={draw(link[i])} />
        ))}
        {LINKS.map((_, i) => pulse(i))}
      </g>

      {/* 1 · Certificado */}
      <g transform={card(cert).transform} opacity={cert}>
        <g className="vf-cert" transform={`translate(24 76) skewY(${SKEW})`}>
          <rect className="vf-card" width="196" height="176" rx="16" filter="url(#vf-shadow)" />
          <g transform="translate(24 30)">
            <path className="vf-leaf" d="M2 26 C2 10 12 0 28 0 C28 16 18 26 2 26 Z" />
            <path className="vf-leaf__vein" d="M3 25 L20 8" />
          </g>
          <text className="vf-title" x="62" y="40">Certificado de</text>
          <text className="vf-title" x="62" y="58">compensación</text>
          <text className="vf-meta" x="24" y="88">Vuelo compensado</text>
          <rect className="vf-line" x="24" y="98" width="148" height="6" rx="3" />
          <rect className="vf-line" x="24" y="112" width="112" height="6" rx="3" />
          <g className="vf-pill" opacity={Math.min(1, certPill)} transform={`translate(72 144) scale(${0.6 + 0.4 * certPill}) translate(-72 -144)`}>
            <rect className="vf-pill__bg" x="24" y="130" width="96" height="28" rx="14" />
            <Check x={42} y={144} />
            <text className="vf-pill__text" x="58" y="148.5">Válido</text>
          </g>
        </g>
      </g>

      {/* 2 · Huella (hash) */}
      <g transform={`translate(0 ${(1 - fp) * 12})`} opacity={fp}>
        <g className="vf-fp" transform={`translate(254 256) skewY(${SKEW})`}>
          <rect className="vf-card" width="140" height="150" rx="16" filter="url(#vf-shadow)" />
          <circle className="vf-fp__disc" cx="70" cy="58" r="36" />
          <g transform="translate(70 58)">
            {[8, 13, 18, 23, 28].map((r, i) => (
              <path
                key={r}
                className="vf-fp__ridge"
                pathLength={1}
                style={draw(p(1.2 + i * 0.05, 1.65 + i * 0.05), 'middle')}
                d={`M${-r} ${4 + i} C${-r} ${-r * 1.1}, ${r} ${-r * 1.1}, ${r} ${4 + i} S ${r * 0.4} ${r * 0.9 + 4}, ${r * 0.1} ${r}`}
              />
            ))}
          </g>
          <g clipPath="url(#vf-fp-clip)">
            <rect className="vf-fp__scan" x="34" y="56" width="72" height="3" rx="1.5" style={{ opacity: scan > 0 && scan < 1 ? 1 - scan : 0 }} transform={`translate(0 ${-34 + 68 * scan})`} />
          </g>
          <text className="vf-fp__hash" x="70" y="126" textAnchor="middle" opacity={hashIn}>
            a3f5e7c9…4d2b
          </text>
        </g>
      </g>

      {/* 3 · Bloque en la cadena */}
      <g className="vf-chain">
        {SATELLITES.map((c, i) => (
          <path key={i} className="vf-chain__spoke" d={`M${CORE.x} ${CORE.y} L${c.x} ${c.y}`} pathLength={1} style={draw(p(2.6 + i * 0.04, 2.9 + i * 0.04))} />
        ))}
        <circle cx={CORE.x} cy={CORE.y} r="70" fill="url(#vf-glow)" opacity={0.55 * glow} />
        {SATELLITES.map((c, i) => (
          <CubeShape key={i} cube={c} from={0.4} k={p(2.6 + i * 0.07, 3.05 + i * 0.07, backOut(1.7))} />
        ))}
        <CubeShape cube={CORE} from={0.7} k={p(2.75, 3.25, backOut(1.8))} />
        <g className="vf-cube__glyph" opacity={p(3, 3.3)} transform={`translate(${CORE.x + 17} ${CORE.y + 9}) skewY(-30)`}>
          <rect x="-9" y="-4" width="10" height="8" rx="4" />
          <rect x="-1" y="-4" width="10" height="8" rx="4" />
        </g>
      </g>

      {/* 4 · Registro público */}
      <g transform={`translate(0 ${(1 - registry) * 14})`} opacity={registry}>
        <g className="vf-registry" transform={`translate(486 462) skewY(${SKEW})`}>
          <rect className="vf-card" width="186" height="138" rx="16" filter="url(#vf-shadow)" />
          <g className="vf-dots">
            <circle cx="20" cy="18" r="2.6" />
            <circle cx="29" cy="18" r="2.6" />
            <circle cx="38" cy="18" r="2.6" />
          </g>
          <g className="vf-link-icon" transform="translate(22 44)">
            <rect x="-6" y="-4" width="9" height="8" rx="4" />
            <rect x="1" y="-4" width="9" height="8" rx="4" />
          </g>
          <text className="vf-title" x="40" y="49">Registro público</text>
          <g className="vf-pill" opacity={Math.min(1, regPill)} transform={`translate(79 78) scale(${0.6 + 0.4 * regPill}) translate(-79 -78)`}>
            <rect className="vf-pill__bg" x="20" y="64" width="118" height="28" rx="14" />
            <Check x={38} y={78} />
            <text className="vf-pill__text" x="54" y="82.5">Confirmado</text>
          </g>
          <text className="vf-registry__meta" x="20" y="112">Red: Polygon</text>
          <text className="vf-registry__meta" x={20 - (1 - tx) * 6} y="127" opacity={tx}>
            Tx: 0x8f3a…7e2c
          </text>
          <path className="vf-external" d="M160 106 L168 98 M162 98 L168 98 L168 104 M166 108 L166 112 L154 112 L154 100 L158 100" />
        </g>
      </g>
    </g>
  );
};
