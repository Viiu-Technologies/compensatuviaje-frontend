// Ayudas de animación por frame. Todo es función pura del frame: lo que en la
// web hace GSAP aquí se recalcula en cada cuadro.
import { Easing, interpolate } from 'remotion';
import { EASE_IN_OUT, EASE_OUT } from '../theme/palette';

export type Span = readonly [number, number];

export const easeOut = Easing.bezier(...EASE_OUT);
export const easeInOut = Easing.bezier(...EASE_IN_OUT);
/** back.out de GSAP: se pasa un poco y vuelve. */
export const backOut = (s = 1.7) => (t: number) => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2;

/** 0 → 1 dentro del tramo, fijo fuera de él. */
export const prog = (frame: number, [a, b]: Span, easing: (t: number) => number = easeOut) =>
  interpolate(frame, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

/** Rebote al caer (bounce.out de GSAP). */
export const bounceOut = (t: number) => {
  const n = 7.5625;
  const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
};

/** Entrada típica: sube un poco y se enfoca. */
export const rise = (t: number, dy = 16) => ({
  opacity: t,
  transform: `translateY(${((1 - t) * dy).toFixed(2)}px)`,
  filter: t < 1 ? `blur(${((1 - t) * 6).toFixed(2)}px)` : undefined,
});

/**
 * Trazo que se dibuja (DrawSVG). El path debe llevar pathLength={1}.
 * `from: 'middle'` dibuja desde el centro hacia los extremos.
 */
export const draw = (t: number, from: 'start' | 'middle' = 'start') => ({
  strokeDasharray: `${t} 2`,
  strokeDashoffset: from === 'start' ? 0 : -(1 - t) / 2,
  // Un trazo de largo 0 con remate redondo igual pinta un punto.
  visibility: t > 0.001 ? ('visible' as const) : ('hidden' as const),
});

// ── Curvas para mover cosas por un camino ──
export type Pt = { x: number; y: number };

export const quad = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({
  x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t ** 2 * b.x,
  y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t ** 2 * b.y,
});

/** Ángulo (grados) de la tangente de una cuadrática. */
export const quadAngle = (a: Pt, c: Pt, b: Pt, t: number) => {
  const dx = 2 * (1 - t) * (c.x - a.x) + 2 * t * (b.x - c.x);
  const dy = 2 * (1 - t) * (c.y - a.y) + 2 * t * (b.y - c.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

export const cubic = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u ** 3 * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t ** 3 * p3.x,
    y: u ** 3 * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t ** 3 * p3.y,
  };
};

/** Pseudoaleatorio determinista: el mismo frame siempre da lo mismo. */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const nf = (value: number, digits: number) =>
  value.toLocaleString('es-CL', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmt = {
  kg: (v: number) => nf(v, 2),
  km: (v: number) => nf(v, 0),
  factor: (v: number) => nf(v, 5),
  clp: (v: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(v),
};
