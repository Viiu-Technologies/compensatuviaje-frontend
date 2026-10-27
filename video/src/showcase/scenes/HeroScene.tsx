// Hero de la landing (el mismo guion que el scroll de la web, ahora por frame):
// cielo y Andes → el avión cruza el wordmark y abre la bruma → arco
// Santiago → Lima con la huella → noche → titular + calculadora que se llena
// sola y da el resultado real.
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import Mountains from '../../../../src/apps/public/components/heroScroll/Mountains';
import Plane from '../../../../src/apps/public/components/heroScroll/Plane';
import { MIST_ELLIPSES } from '../../../../src/apps/public/components/heroScroll/CloudWordmark';
import { HERO_COLORS, MOUNTAIN_SPREAD } from '../../../../src/apps/public/components/heroScroll/heroScrollConfig';
import { isPortrait } from '../../formats';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../theme/fonts';
import { backOut, draw, easeInOut, fmt, prog, quad, quadAngle, rise, type Pt } from '../anim';
import { FLIGHT } from '../data';
import { HERO } from '../timing';
import { CalculatorCard } from './CalculatorCard';

const ON_DARK = '#F5F8F4';
const ON_DARK_SOFT = 'rgba(245, 248, 244, 0.74)';

export const HeroScene: React.FC = () => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const portrait = isPortrait(W, H);

  // ── Wordmark ──
  const F = portrait ? 172 : 196; // tamaño de letra
  const lines = portrait ? ['CompensaTu', 'Viaje'] : ['CompensaTuViaje'];
  const textW = portrait ? 5.3 * F : 7.65 * F;
  const textH = lines.length * 0.95 * F;
  const Y0 = H * (portrait ? 0.33 : 0.38); // centro del wordmark

  const wmIn = prog(f, HERO.wordmarkIn);
  const wmUp = prog(f, HERO.wordmarkUp, easeInOut);
  const wmY = interpolate(wmUp, [0, 1], [Y0, H * (portrait ? 0.13 : 0.15)]);
  const wmScale = interpolate(wmUp, [0, 1], [1, portrait ? 0.5 : 0.42]);
  const extras = prog(f, HERO.extrasIn) * (1 - prog(f, HERO.extrasOut));

  // ── Cruce del avión ──
  const cross = prog(f, HERO.crossing, (t) => t);
  const crossEase = easeInOut(cross);
  const planeX = interpolate(crossEase, [0, 1], [-260, W + 260]);
  const planeY = Y0 + F * 0.06 - Math.sin(cross * Math.PI) * 18;
  const crossing = f >= HERO.crossing[0] && f <= HERO.crossing[1];
  const trailOut = prog(f, HERO.trailOut);

  // La bruma cubre el wordmark y se abre a medida que pasa el avión.
  const mistBox = { x: W / 2 - textW * 0.6, y: Y0 - textH * 1.05, w: textW * 1.2, h: textH * 2.1 };
  const mistOpen = (cx: number) => {
    const ex = mistBox.x + (cx / 1000) * mistBox.w;
    return prog(planeX - ex, [-60, 180]);
  };

  // ── Montañas: suben, se abren y pasan a la noche ──
  const up = prog(f, HERO.mountainsUp);
  const open = prog(f, HERO.mountainsOpen, easeInOut);
  const night = prog(f, HERO.darken, easeInOut);
  const mtnVars = {
    // En vertical las montañas van más bajas: la lectura va debajo del arco.
    '--mtn-rise': `${((1 - up) * H * 0.35 + (portrait ? H * 0.1 : 0)).toFixed(1)}px`,
    '--night': night.toFixed(3),
    ...Object.fromEntries(MOUNTAIN_SPREAD.map((s, i) => [`--open-${i}`, `${(open * s * W).toFixed(1)}px`])),
  } as React.CSSProperties;

  // ── Arco Santiago → Lima ──
  const A: Pt = { x: W * (portrait ? 0.15 : 0.2), y: H * (portrait ? 0.48 : 0.6) };
  const B: Pt = { x: W * (portrait ? 0.85 : 0.8), y: A.y };
  const C: Pt = { x: W / 2, y: H * (portrait ? 0.14 : 0.12) };
  const arcD = `M${A.x} ${A.y} Q${C.x} ${C.y} ${B.x} ${B.y}`;
  const arcT = prog(f, HERO.arc, easeInOut);
  const onArc = quad(A, C, B, arcT);
  const routeOut = 1 - prog(f, HERO.routeOut);
  const scl = prog(f, HERO.scl, backOut(2));
  const lim = prog(f, HERO.lim, backOut(2));
  const arcPlane = f >= HERO.arc[0] && f < HERO.arc[1] + 14 ? Math.min(prog(f, [HERO.arc[0], HERO.arc[0] + 8]), 1 - prog(f, [HERO.arc[1], HERO.arc[1] + 14])) : 0;

  // ── Lectura ──
  const readIn = prog(f, HERO.readoutIn);
  const kg = FLIGHT.kg * prog(f, HERO.countUp, (t) => 1 - (1 - t) ** 3);

  const label = (p: Pt, code: string, city: string, t: number, align: 'start' | 'end') => (
    <div
      style={{
        position: 'absolute',
        left: align === 'start' ? p.x - 8 : undefined,
        right: align === 'end' ? W - p.x - 8 : undefined,
        top: p.y + 26,
        textAlign: align === 'start' ? 'left' : 'right',
        zIndex: 4,
        fontFamily: FONT_MONO,
        color: HERO_COLORS.ink,
        opacity: t * routeOut,
        transform: `translateY(${(1 - t) * 8}px)`,
      }}
    >
      <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: '0.04em' }}>{code}</div>
      <div style={{ fontSize: 20, color: '#40605C' }}>{city}</div>
    </div>
  );

  return (
    <AbsoluteFill className="sv-root sv-hero hs" style={{ opacity: prog(f, HERO.skyIn) }}>
      {/* Cielo de día y de noche */}
      <AbsoluteFill className="hs-sky" />
      <AbsoluteFill className="hs-night" style={{ opacity: night }} />

      <div style={mtnVars}>
        <Mountains />
      </div>

      {/* Wordmark con su bruma */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: wmY,
          transform: `translateY(-50%) scale(${wmScale})`,
          transformOrigin: '50% 50%',
          zIndex: 2,
          opacity: wmIn * routeOut,
          filter: wmIn < 1 ? `blur(${(1 - wmIn) * 12}px)` : undefined,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '100%',
            marginBottom: 46,
            fontFamily: FONT_MONO,
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#40605C',
            opacity: extras,
          }}
        >
          Huella de carbono · medible y trazable
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            fontSize: F,
            fontWeight: 600,
            lineHeight: 0.95,
            letterSpacing: '-0.035em',
            color: HERO_COLORS.ink,
          }}
        >
          {lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </h1>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '100%',
            width: portrait ? 820 : 900,
            marginTop: 48,
            transform: 'translateX(-50%)',
            fontFamily: FONT_BODY,
            fontSize: 28,
            lineHeight: 1.5,
            color: '#40605C',
            opacity: extras,
          }}
        >
          Calcula y compensa las emisiones de tus vuelos con factores oficiales {FLIGHT.methodology}.
        </div>
      </div>

      {/* Las montañas de la web van en z-index 1: todo lo de encima sube de capa. */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible', zIndex: 3 }}>
        <defs>
          <filter id="sv-mist" x="-20%" y="-60%" width="140%" height="220%">
            <feTurbulence type="fractalNoise" baseFrequency="0.011 0.028" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="70" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id="sv-soft" x="-10%" y="-200%" width="120%" height="500%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <mask id="sv-arc-reveal" maskUnits="userSpaceOnUse">
            <path d={arcD} pathLength={1} fill="none" stroke="#fff" strokeWidth="24" strokeLinecap="round" style={draw(arcT)} />
          </mask>
        </defs>

        {/* Bruma: viewBox 1000 × 400 estirado sobre el wordmark, como en la web */}
        <g opacity={wmIn * (1 - wmUp)}>
          <svg x={mistBox.x} y={mistBox.y} width={mistBox.w} height={mistBox.h} viewBox="0 0 1000 400" preserveAspectRatio="none" overflow="visible">
            <g filter="url(#sv-mist)">
              {MIST_ELLIPSES.map((e, i) => {
                const o = mistOpen(e.cx);
                return (
                  <ellipse
                    key={i}
                    cx={e.cx}
                    cy={e.cy + (i % 2 ? 1 : -1) * o * 60}
                    rx={e.rx * (1 - 0.35 * o)}
                    ry={e.ry * (1 - 0.4 * o)}
                    fill="#ffffff"
                    opacity={e.o * (1 - 0.9 * o)}
                  />
                );
              })}
            </g>
          </svg>
        </g>

        {/* Estela del cruce */}
        {cross > 0 && (
          <path
            d={`M-40 ${planeY + 4} L${Math.max(-40, planeX - 90)} ${planeY + 4}`}
            stroke="#ffffff"
            strokeWidth="12"
            strokeLinecap="round"
            filter="url(#sv-soft)"
            opacity={0.95 * (1 - trailOut)}
          />
        )}
        {crossing && (
          <g transform={`translate(${planeX} ${planeY}) rotate(${-4 * Math.cos(cross * Math.PI)})`}>
            <g transform="scale(1.5)">
              <Plane />
            </g>
          </g>
        )}

        {/* Arco: halo blanco y punteado verde que se revela con el avión */}
        <g opacity={routeOut}>
          <path d={arcD} fill="none" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" filter="url(#sv-soft)" opacity={0.8} mask="url(#sv-arc-reveal)" />
          <path d={arcD} fill="none" stroke={HERO_COLORS.route} strokeWidth="4" strokeLinecap="round" strokeDasharray="0.5 14" mask="url(#sv-arc-reveal)" />
          {[{ p: A, t: scl }, { p: B, t: lim }].map(({ p, t }, i) => (
            <g key={i} transform={`translate(${p.x} ${p.y}) scale(${t})`}>
              <circle r="15" fill="#ffffff" opacity="0.75" />
              <circle r="8" fill={HERO_COLORS.ink} />
            </g>
          ))}
          {arcPlane > 0 && (
            <g transform={`translate(${onArc.x} ${onArc.y}) rotate(${quadAngle(A, C, B, arcT)})`} opacity={arcPlane}>
              <g transform="scale(0.85)">
                <Plane />
              </g>
            </g>
          )}
        </g>
      </svg>

      {label(A, FLIGHT.from.code, `${FLIGHT.from.city}, ${FLIGHT.from.country}`, scl, 'start')}
      {label(B, FLIGHT.to.code, `${FLIGHT.to.city}, ${FLIGHT.to.country}`, lim, 'end')}

      {/* Lectura: la huella del vuelo */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: H * (portrait ? 0.58 : 0.47),
          textAlign: 'center',
          zIndex: 4,
          color: HERO_COLORS.ink,
          opacity: readIn * routeOut,
          transform: `translateY(${(1 - readIn) * 18}px)`,
        }}
      >
        <div style={{ fontFamily: FONT_MONO, fontSize: 20, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#40605C' }}>
          Tu vuelo emite
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 18, margin: '10px 0 14px' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: portrait ? 132 : 138, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {fmt.kg(kg)}
          </span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 38, fontWeight: 500, color: '#40605C' }}>kg CO₂e</span>
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 21, color: '#40605C' }}>
          {FLIGHT.from.city} → {FLIGHT.to.city} · ida y vuelta · {FLIGHT.cabinLabel.toLowerCase()} · {FLIGHT.methodology}
        </div>
      </div>

      <LandingCopy portrait={portrait} />
      <CalculatorCard portrait={portrait} />
    </AbsoluteFill>
  );
};

/** Escena 4: el titular de la web sobre la noche. */
const LandingCopy: React.FC<{ portrait: boolean }> = ({ portrait }) => {
  const f = useCurrentFrame();
  const t = (i: number) => prog(f, [HERO.copyIn[0] + i * 6, HERO.copyIn[1] + i * 6]);
  return (
    <div
      style={{
        position: 'absolute',
        ...(portrait ? { left: 90, right: 90, top: 120 } : { left: 130, width: 760, top: 0, bottom: 0 }),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 30,
        zIndex: 5,
        textAlign: portrait ? 'center' : 'left',
      }}
    >
      <div style={{ ...rise(t(0)), fontFamily: FONT_MONO, fontSize: 21, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5EE08A' }}>
        Calculadora · {FLIGHT.methodology} &amp; GHG Protocol
      </div>
      <h2
        style={{
          ...rise(t(1)),
          margin: 0,
          fontFamily: FONT_DISPLAY,
          fontSize: portrait ? 70 : 78,
          fontWeight: 600,
          lineHeight: 1.04,
          letterSpacing: '-0.025em',
          color: ON_DARK,
          textWrap: 'balance',
        }}
      >
        Compensa la huella de cada viaje, <em>medible</em> y trazable.
      </h2>
      {!portrait && (
        <p style={{ ...rise(t(2)), margin: 0, fontFamily: FONT_BODY, fontSize: 27, lineHeight: 1.5, color: ON_DARK_SOFT }}>
          Factores oficiales, proyectos evaluados antes de recibir tu aporte y un certificado que puedes verificar en
          blockchain.
        </p>
      )}
    </div>
  );
};
