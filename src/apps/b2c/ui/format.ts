/**
 * Formatos del área B2C, siempre en es-CL: coma decimal y punto de miles.
 * Antes se mezclaban toFixed ("1.30 t", "1300.00 t"), números sin separador
 * ("65000") y abreviaturas en inglés ("6050.0k").
 */

const toNum = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? n : Number(n) || 0);

/** 1.234 */
export const fmtInt = (n: unknown) => Math.round(toNum(n)).toLocaleString('es-CL');

/** Número con hasta `max` decimales: 6,4 · 1.210,5 */
export const fmtNum = (n: unknown, max = 1, min = 0) =>
  toNum(n).toLocaleString('es-CL', { maximumFractionDigits: max, minimumFractionDigits: min });

/** Toneladas con unidad: "6,4 t". Bajo 0,1 t muestra dos decimales para no redondear a 0. */
export const fmtTons = (t: unknown) => {
  const v = toNum(t);
  return `${fmtNum(v, v !== 0 && Math.abs(v) < 0.1 ? 2 : 1)} t`;
};

/** Kilos a texto legible: bajo 1 t en kg ("380 kg"), desde 1 t en toneladas ("1,2 t"). */
export const fmtKgAuto = (kg: unknown) => {
  const v = toNum(kg);
  return Math.abs(v) >= 1000 ? fmtTons(v / 1000) : `${fmtInt(v)} kg`;
};

/** $18.500 */
export const fmtCLP = (n: unknown) =>
  toNum(n).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

/** 61 % */
export const fmtPercent = (n: unknown, max = 0) => `${fmtNum(n, max)} %`;

/** "31 ago 2026" (corta) o "31 de agosto de 2026" (larga). */
export const fmtDate = (d: string | Date | null | undefined, style: 'short' | 'long' = 'short') => {
  if (!d) return '—';
  const date = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T12:00:00`) : new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return style === 'long'
    ? date.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
    : date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
};

/** Nombre para saludar: "Camila" en vez de "CAMILA ROJAS". */
export const firstName = (nombre?: string | null, email?: string | null) => {
  const base = (nombre || '').trim() || (email || '').split('@')[0] || '';
  const first = base.split(/\s+/)[0] || '';
  return first ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : '';
};
