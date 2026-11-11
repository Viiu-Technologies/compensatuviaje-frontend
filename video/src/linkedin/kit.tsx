// Piezas comunes de los videos de LinkedIn (4:5, 1080 × 1350): escenas con
// fundido, titulares que entran palabra por palabra, cabecera de cada paso,
// la planilla de vuelos y el cierre con logo.
import React from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { LuArrowRight, LuFileSpreadsheet } from 'react-icons/lu';
import Mountains from '../../../src/apps/public/components/heroScroll/Mountains';
import { HERO_COLORS, MOUNTAIN_SPREAD } from '../../../src/apps/public/components/heroScroll/heroScrollConfig';
import Plane from '../../../src/apps/public/components/heroScroll/Plane';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../theme/fonts';
import { C } from '../theme/palette';
import { draw, easeInOut, prog, quad, quadAngle, rise, type Pt } from '../showcase/anim';
import { fmt, MONTH, ROWS, URL } from './data';
import '../showcase/showcase.css';

/** Margen lateral seguro (px). */
export const SIDE = 84;
/** Frames del fundido de entrada de cada escena. */
export const FADE = 14;

export const INK = HERO_COLORS.ink;
export const INK_SOFT = C.inkSoft;
export const ON_DARK = '#F5F8F4';
export const ON_DARK_SOFT = 'rgba(245, 248, 244, 0.74)';
export const GREEN = HERO_COLORS.route;
export const GREEN_ON_DARK = HERO_COLORS.routeOnDark;
export const DAY_BG = 'linear-gradient(180deg, #F5F8F4 0%, #E7EFEA 52%, #D6E4DD 100%)';
export const CANVAS_BG = C.canvas;
export const NIGHT_BG = C.teal950;

/** Opacidad de algo que entra en `a` y sale en `b` (los dos tramos de 12 frames). */
export const inOut = (f: number, a: number, b: number, len = 12) => prog(f, [a, a + len]) * (1 - prog(f, [b, b + len]));

/**
 * Escena con fondo propio. Entra con un fundido ENCIMA de la anterior, que
 * sigue entera debajo hasta que termina: por eso las escenas se pisan unos
 * frames. La primera escena va con `fade={0}`: el frame 0 es la miniatura.
 */
export const Scene: React.FC<{ name: string; from: number; dur: number; bg: string; fade?: number; children: React.ReactNode }> = ({
  name,
  from,
  dur,
  bg,
  fade = FADE,
  children,
}) => (
  <Sequence name={name} from={from} durationInFrames={dur}>
    <FadeIn bg={bg} fade={fade}>
      {children}
    </FadeIn>
  </Sequence>
);

const FadeIn: React.FC<{ bg: string; fade: number; children: React.ReactNode }> = ({ bg, fade, children }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill className="sv-root" style={{ background: bg, opacity: fade ? prog(f, [0, fade]) : 1 }}>
      {children}
    </AbsoluteFill>
  );
};

/**
 * Titular que entra palabra por palabra. Lo que va entre *asteriscos* sale en
 * el color de acento.
 */
export const Words: React.FC<{
  text: string;
  start: number;
  stagger?: number;
  accent?: string;
  style?: React.CSSProperties;
}> = ({ text, start, stagger = 3, accent = GREEN, style }) => {
  const f = useCurrentFrame();
  let on = false;
  const words = text.split(' ').map((raw) => {
    const opens = raw.startsWith('*');
    const closes = raw.endsWith('*');
    if (opens) on = true;
    const w = { word: raw.replace(/\*/g, ''), accent: on };
    if (closes) on = false;
    return w;
  });
  return (
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.04, textWrap: 'balance', ...style }}>
      {words.map(({ word, accent: a }, i) => {
        const t = prog(f, [start + i * stagger, start + i * stagger + 16]);
        return (
          <React.Fragment key={i}>
            <span style={{ display: 'inline-block', color: a ? accent : undefined, ...rise(t, 26) }}>{word}</span>{' '}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** Rótulo en mono, en mayúsculas. */
export const Kicker: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = INK_SOFT,
  style,
}) => (
  <div style={{ fontFamily: FONT_MONO, fontSize: 25, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color, ...style }}>
    {children}
  </div>
);

/** Andes de la web al pie del cuadro, quietos y de día. */
export const Andes: React.FC<{ rise?: number }> = ({ rise: r = 1 }) => {
  const { height: H } = useVideoConfig();
  const vars = {
    '--mtn-rise': `${((1 - r) * H * 0.35 + H * 0.12).toFixed(1)}px`,
    '--night': '0',
    ...Object.fromEntries(MOUNTAIN_SPREAD.map((_, i) => [`--open-${i}`, '0px'])),
  } as React.CSSProperties;
  return (
    <AbsoluteFill className="sv-hero hs">
      <div style={vars}>
        <Mountains />
      </div>
    </AbsoluteFill>
  );
};

/** El avión de la web. Apunta a +x; `light` lo pinta en claro para fondos oscuros. */
export const PlaneAt: React.FC<{ x: number; y: number; angle?: number; scale?: number; light?: boolean; opacity?: number }> = ({
  x,
  y,
  angle = 0,
  scale = 1,
  light,
  opacity = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`} opacity={opacity}>
    <g transform={`scale(${scale})`} style={light ? { filter: 'invert(1) brightness(1.6)' } : undefined}>
      <Plane />
    </g>
  </g>
);

/** Cabecera de un paso: número, rótulo, título y bajada. */
export const StepHeader: React.FC<{ n: number; title: string; text: string; start?: number }> = ({ n, title, text, start = 4 }) => {
  const f = useCurrentFrame();
  const t = (i: number) => prog(f, [start + i * 6, start + i * 6 + 22]);
  return (
    <div style={{ position: 'absolute', left: SIDE, right: SIDE, top: 96 }}>
      <div style={{ ...rise(t(0)), display: 'flex', alignItems: 'center', gap: 20 }}>
        <span
          style={{
            width: 58,
            height: 58,
            borderRadius: 999,
            background: GREEN,
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            fontFamily: FONT_DISPLAY,
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          {n}
        </span>
        <Kicker>Paso {n} de 3</Kicker>
      </div>
      <div style={{ ...rise(t(1)), marginTop: 26, fontFamily: FONT_DISPLAY, fontSize: 96, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1, color: INK }}>
        {title}
      </div>
      <div style={{ ...rise(t(2)), marginTop: 22, fontFamily: FONT_BODY, fontSize: 38, lineHeight: 1.35, color: INK_SOFT, maxWidth: 900 }}>
        {text}
      </div>
    </div>
  );
};

/** Pastilla verde de llamado a la acción, como el botón de la web. */
export const Cta: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 14,
      padding: '24px 44px',
      borderRadius: 999,
      background: GREEN,
      color: '#fff',
      fontFamily: FONT_BODY,
      fontSize: 34,
      fontWeight: 600,
      ...style,
    }}
  >
    {children} <LuArrowRight size={34} />
  </span>
);

/**
 * Planilla de vuelos de la empresa de ejemplo.
 * `kg[i] === null` muestra "¿?" (todavía sin medir).
 */
export const FlightTable: React.FC<{
  rowT: number[];
  kg: (number | null)[];
  unknownPulse?: number;
  totalT?: number;
  total?: number;
}> = ({ rowT, kg, unknownPulse = 0, totalT = 0, total = 0 }) => {
  const cols = '300px 230px 110px 1fr';
  const cell: React.CSSProperties = { display: 'flex', alignItems: 'center' };
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 30,
        boxShadow: '0 30px 60px -30px rgba(7, 61, 61, 0.35), 0 0 0 1px rgba(7, 61, 61, 0.06)',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '26px 32px 22px', fontFamily: FONT_BODY, fontSize: 28, fontWeight: 600, color: INK }}>
        <LuFileSpreadsheet size={34} color={GREEN} />
        vuelos-{MONTH}.xlsx
        <span style={{ marginLeft: 'auto', fontFamily: FONT_MONO, fontSize: 21, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.inkMute }}>
          Ejemplo
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: cols,
          padding: '16px 32px',
          background: '#EEF5F1',
          fontFamily: FONT_MONO,
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: INK_SOFT,
        }}
      >
        <span>Ruta · ida y vuelta</span>
        <span>Cabina</span>
        <span>Pas.</span>
        <span style={{ textAlign: 'right' }}>kg CO₂e</span>
      </div>
      {ROWS.map((r, i) => {
        const v = kg[i];
        return (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: cols,
              padding: '0 32px',
              height: 78,
              borderTop: i ? '1px solid #E3ECE7' : undefined,
              ...rise(rowT[i] ?? 0, 18),
            }}
          >
            <span style={{ ...cell, fontFamily: FONT_MONO, fontSize: 32, fontWeight: 500, color: INK }}>
              {r.from} <span style={{ color: GREEN, margin: '0 12px' }}>⇄</span> {r.to}
            </span>
            <span style={{ ...cell, fontFamily: FONT_BODY, fontSize: 29, color: INK_SOFT }}>{r.cabin}</span>
            <span style={{ ...cell, fontFamily: FONT_MONO, fontSize: 30, color: INK }}>{r.pax}</span>
            <span
              style={{
                ...cell,
                justifyContent: 'flex-end',
                fontFamily: FONT_MONO,
                fontSize: 32,
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
                color: v === null ? GREEN : INK,
                transform: v === null ? `scale(${1 + 0.18 * unknownPulse})` : undefined,
                transformOrigin: '100% 50%',
              }}
            >
              {v === null ? '¿?' : fmt.kg(v)}
            </span>
          </div>
        );
      })}
      {/* El total abre su espacio al aparecer: oculto, la tarjeta termina en la última fila */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 96 * totalT,
          overflow: 'hidden',
          padding: '0 32px',
          background: C.brandSoft,
          opacity: totalT,
        }}
      >
        <span style={{ fontFamily: FONT_BODY, fontSize: 30, fontWeight: 600, color: INK, whiteSpace: 'nowrap' }}>Total de {MONTH}</span>
        <span style={{ marginLeft: 'auto', fontFamily: FONT_MONO, fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', color: C.accentContrast, fontVariantNumeric: 'tabular-nums' }}>
          {fmt.kg(total)}
        </span>
        <span style={{ marginLeft: 12, fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 500, color: INK_SOFT }}>kg CO₂e</span>
      </div>
    </div>
  );
};

/**
 * Cierre sobre el teal de marca: un vuelo traza el arco punteado y aparecen el
 * logo, la frase y, si se pide, el botón con la URL. Al final queda quieto.
 */
export const Closing: React.FC<{ line: string; sub?: string; cta?: string; showUrl?: boolean }> = ({ line, sub, cta, showUrl = true }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const A: Pt = { x: -120, y: H * 0.3 };
  const B: Pt = { x: W + 120, y: A.y };
  const Cc: Pt = { x: W / 2, y: H * 0.02 };
  const arcD = `M${A.x} ${A.y} Q${Cc.x} ${Cc.y} ${B.x} ${B.y}`;
  const t = prog(f, [6, 66], easeInOut);
  const p = quad(A, Cc, B, t);

  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <mask id="li-closing-arc" maskUnits="userSpaceOnUse">
            <path d={arcD} pathLength={1} fill="none" stroke="#fff" strokeWidth="20" style={draw(t)} />
          </mask>
        </defs>
        <path d={arcD} fill="none" stroke={GREEN_ON_DARK} strokeWidth="4" strokeLinecap="round" strokeDasharray="0.5 14" opacity="0.7" mask="url(#li-closing-arc)" />
        {t > 0 && t < 1 && <PlaneAt x={p.x} y={p.y} angle={quadAngle(A, Cc, B, t)} scale={0.9} light />}
      </svg>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 46, padding: `160px ${SIDE}px 0`, textAlign: 'center' }}>
        <Img src={staticFile('brand/logo-horizontal-white.svg')} style={{ height: 100, width: 'auto', ...rise(prog(f, [14, 42]), 20) }} />
        <div style={{ ...rise(prog(f, [24, 52]), 20), fontFamily: FONT_DISPLAY, fontSize: 92, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.04, color: ON_DARK, textWrap: 'balance' }}>
          {line}
        </div>
        {sub && (
          <div style={{ ...rise(prog(f, [32, 58]), 16), fontFamily: FONT_BODY, fontSize: 36, lineHeight: 1.4, color: ON_DARK_SOFT, maxWidth: 820 }}>{sub}</div>
        )}
        {(cta || showUrl) && (
          <div style={{ ...rise(prog(f, [40, 66]), 20), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
            {cta && <Cta>{cta}</Cta>}
            {showUrl && <span style={{ fontFamily: FONT_MONO, fontSize: 36, color: 'rgba(245, 248, 244, 0.85)' }}>{URL}</span>}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
