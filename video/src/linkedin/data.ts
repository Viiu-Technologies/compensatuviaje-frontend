// Datos de los videos 1 y 2 de LinkedIn.
//
// Todas las cifras salen de POST /api/public/calculator/estimate en producción
// (2026-10-30), el mismo endpoint de la calculadora de la web. Para cambiar una
// ruta, vuelve a consultarlo y reemplaza el valor.
import { FLIGHT } from '../showcase/data';

export { FLIGHT };

// ── Video 2: planilla de ejemplo de una empresa (un mes) ──
// Todas ida y vuelta. No es un cliente real: en pantalla dice "ejemplo".
export type Row = { from: string; to: string; cabin: string; pax: number; kg: number };

export const MONTH = 'octubre';

export const ROWS: Row[] = [
  { from: 'SCL', to: 'LIM', cabin: 'Económica', pax: 2, kg: 1238.43 },
  { from: 'CCP', to: 'SCL', cabin: 'Económica', pax: 3, kg: 590.32 },
  { from: 'SCL', to: 'GRU', cabin: 'Económica', pax: 1, kg: 657.49 },
  { from: 'SCL', to: 'BOG', cabin: 'Económica', pax: 1, kg: 995.0 },
  { from: 'SCL', to: 'MAD', cabin: 'Económica', pax: 1, kg: 2509.26 },
];

export const TOTAL_KG = ROWS.reduce((s, r) => s + r.kg, 0); // 5.990,50 kg

// Proyectos genéricos a propósito: los nombres reales están por confirmar.
export const PROJECTS = [
  { key: 'trees', name: 'Reforestación', tag: 'Bosque nativo' },
  { key: 'sun', name: 'Energía solar', tag: 'Energía limpia' },
  { key: 'water', name: 'Agua y humedales', tag: 'Conservación' },
] as const;

/** Índice del proyecto que se "elige" en el video 2. */
export const CHOSEN = 0;

export const URL = 'compensatuviaje.com';

const nf = (v: number, digits: number) =>
  v.toLocaleString('es-CL', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmt = {
  kg: (v: number) => nf(v, 2),
  ton: (v: number) => nf(v, 2),
  int: (v: number) => nf(v, 0),
  factor: (v: number) => nf(v, 5),
};
