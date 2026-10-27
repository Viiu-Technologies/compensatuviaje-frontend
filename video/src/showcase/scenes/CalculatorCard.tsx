// Calculadora compacta del hero: se llena sola (Santiago → Lima, ida y vuelta,
// económica, 1 pasajero), se aprieta "Calcular huella" y aparece el resultado
// real con el aporte para compensar.
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { FaPlane } from 'react-icons/fa';
import { HiArrowRight, HiChevronDown, HiUser } from 'react-icons/hi';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../theme/fonts';
import { backOut, easeInOut, fmt, prog, rise, type Span } from '../anim';
import { FLIGHT } from '../data';
import { HERO } from '../timing';

const INK = '#0E3B36';
const SOFT = '#40605C';
const MUTE = '#7E9491';
const GREEN = '#1F8A4C';
const LINE = 'rgba(14, 59, 54, 0.12)';

/** Texto que se escribe letra por letra, con cursor mientras escribe. */
const typed = (f: number, [a, b]: Span, text: string) => {
  const n = Math.round(interpolate(f, [a, b], [0, text.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return { text: text.slice(0, n), caret: f >= a - 4 && f <= b + 6 && Math.floor(f / 8) % 2 === 0, done: f > b };
};

const Field: React.FC<{ label: string; active: boolean; children: React.ReactNode; grow?: number }> = ({ label, active, children, grow = 1 }) => (
  <div
    style={{
      flex: grow,
      padding: '14px 18px 16px',
      border: `1.5px solid ${active ? GREEN : LINE}`,
      boxShadow: active ? '0 0 0 4px rgba(31, 138, 76, 0.12)' : undefined,
      borderRadius: 16,
      background: '#ffffff',
      minWidth: 0,
    }}
  >
    <div style={{ fontFamily: FONT_MONO, fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTE }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, height: 36 }}>{children}</div>
  </div>
);

export const CalculatorCard: React.FC<{ portrait: boolean }> = ({ portrait }) => {
  const f = useCurrentFrame();
  const cardIn = prog(f, HERO.cardIn);
  if (cardIn <= 0) return null;

  const origin = typed(f, HERO.typeOrigin, FLIGHT.from.city);
  const dest = typed(f, HERO.typeDest, FLIGHT.to.city);
  const chip = (done: boolean, at: number) => prog(f, [at, at + 8], backOut(2.2)) * (done ? 1 : 0);
  const roundTrip = prog(f, [HERO.roundTrip, HERO.roundTrip + 8], easeInOut);
  const cabinOn = f >= HERO.cabin;
  const pressed = f >= HERO.press[0] && f < HERO.press[1];
  const loading = f >= HERO.loading[0] && f < HERO.loading[1];
  const result = prog(f, HERO.resultIn, easeInOut);
  const kg = FLIGHT.kg * prog(f, HERO.resultCount, (t) => 1 - (1 - t) ** 3);
  const glow = prog(f, HERO.ctaGlow);
  const active = (span: Span) => f >= span[0] - 6 && f <= span[1] + 4;

  return (
    <div
      style={{
        position: 'absolute',
        ...(portrait ? { left: 90, right: 90, top: 470 } : { right: 130, width: 700, top: '50%', marginTop: -330 }),
        ...rise(cardIn, 40),
        zIndex: 5,
        padding: 34,
        borderRadius: 30,
        background: '#F7FAF8',
        boxShadow: '0 40px 90px -30px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.08)',
        fontFamily: FONT_BODY,
        color: INK,
      }}
    >
      {/* Encabezado: título y "Solo ida / Ida y vuelta" */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 600, letterSpacing: '-0.01em' }}>Calcula tu vuelo</div>
        <div style={{ position: 'relative', display: 'flex', padding: 4, borderRadius: 999, background: '#E6EFEA', fontSize: 17, fontWeight: 600 }}>
          <div
            style={{
              position: 'absolute',
              top: 4,
              bottom: 4,
              left: interpolate(roundTrip, [0, 1], [4, 108]),
              width: interpolate(roundTrip, [0, 1], [104, 132]),
              borderRadius: 999,
              background: INK,
            }}
          />
          <span style={{ position: 'relative', width: 104, padding: '8px 0', textAlign: 'center', color: roundTrip < 0.5 ? '#fff' : SOFT }}>Solo ida</span>
          <span style={{ position: 'relative', width: 132, padding: '8px 0', textAlign: 'center', color: roundTrip >= 0.5 ? '#fff' : SOFT }}>Ida y vuelta</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14 }}>
        <Field label="Origen" active={active(HERO.typeOrigin)}>
          <FaPlane size={18} color={MUTE} style={{ transform: 'rotate(-30deg)', flexShrink: 0 }} />
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {origin.text || <span style={{ color: '#B5C4BF', fontWeight: 500 }}>{origin.caret ? '' : '¿Desde dónde?'}</span>}
            {origin.caret && <span style={{ color: GREEN }}>|</span>}
          </span>
          <Code t={chip(origin.done, HERO.typeOrigin[1])} code={FLIGHT.from.code} />
        </Field>
        <Field label="Destino" active={active(HERO.typeDest)}>
          <FaPlane size={18} color={MUTE} style={{ transform: 'rotate(30deg)', flexShrink: 0 }} />
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {dest.text || <span style={{ color: '#B5C4BF', fontWeight: 500 }}>{dest.caret ? '' : '¿A dónde?'}</span>}
            {dest.caret && <span style={{ color: GREEN }}>|</span>}
          </span>
          <Code t={chip(dest.done, HERO.typeDest[1])} code={FLIGHT.to.code} />
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
        <Field label="Cabina" active={f >= HERO.cabin - 6 && f <= HERO.cabin + 8} grow={1.6}>
          <span style={{ flex: 1, fontSize: 24, fontWeight: 600, color: cabinOn ? INK : SOFT }}>{FLIGHT.cabinLabel}</span>
          <HiChevronDown size={22} color={MUTE} />
        </Field>
        <Field label="Pasajeros" active={false}>
          <HiUser size={20} color={MUTE} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 26, fontWeight: 500 }}>{FLIGHT.pax}</span>
        </Field>
      </div>

      {/* Botón */}
      <div
        style={{
          marginTop: 20,
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          borderRadius: 999,
          background: f >= HERO.press[0] ? GREEN : INK,
          color: '#fff',
          fontSize: 22,
          fontWeight: 600,
          transform: `scale(${pressed ? 0.97 : 1})`,
        }}
      >
        {loading ? (
          [0, 1, 2].map((i) => (
            <span
              key={i}
              style={{ width: 11, height: 11, borderRadius: 99, background: '#fff', transform: `translateY(${-Math.max(0, Math.sin((f - i * 4) / 2.6)) * 9}px)` }}
            />
          ))
        ) : (
          <>
            Calcular huella <HiArrowRight size={22} />
          </>
        )}
      </div>

      {/* Resultado */}
      <div style={{ height: result * 224, overflow: 'hidden' }}>
        <div style={{ paddingTop: 26, opacity: result }}>
          <div style={{ height: 1, background: LINE, marginBottom: 22 }} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 72, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: INK }}>
              {fmt.kg(kg)}
            </span>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 500, color: SOFT }}>kg CO₂e</span>
          </div>
          <div style={{ marginTop: 10, fontFamily: FONT_MONO, fontSize: 18, color: SOFT }}>
            {fmt.km(FLIGHT.kmTotal)} km · factor {fmt.factor(FLIGHT.factor)} · {FLIGHT.methodology}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
            <span style={{ fontSize: 22, color: SOFT }}>
              Compensa desde <strong style={{ color: INK, fontFamily: FONT_MONO, fontWeight: 600 }}>{fmt.clp(FLIGHT.priceFromCLP)}</strong>
            </span>
            <span
              style={{
                padding: '14px 28px',
                borderRadius: 999,
                background: GREEN,
                color: '#fff',
                fontSize: 20,
                fontWeight: 600,
                boxShadow: `0 0 0 ${glow * 8}px rgba(94, 224, 138, ${0.35 * (1 - glow)}), 0 10px 24px -10px rgba(31,138,76,0.6)`,
              }}
            >
              Compensar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Code: React.FC<{ t: number; code: string }> = ({ t, code }) =>
  t > 0 ? (
    <span
      style={{
        marginLeft: 'auto',
        padding: '4px 10px',
        borderRadius: 8,
        background: '#E4F6E0',
        fontFamily: FONT_MONO,
        fontSize: 17,
        fontWeight: 600,
        color: GREEN,
        transform: `scale(${t})`,
      }}
    >
      {code}
    </span>
  ) : null;
