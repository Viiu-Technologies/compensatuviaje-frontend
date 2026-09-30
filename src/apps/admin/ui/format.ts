/**
 * Formatos numéricos y de fecha del admin, siempre en es-CL.
 *
 * Antes convivían toLocaleString('es-CL'), toFixed (punto decimal) y
 * toLocaleString() sin idioma, y abreviaturas en inglés ("1.3K", "$18.4M").
 */

const toNum = (n: number | null | undefined) => (typeof n === 'number' && Number.isFinite(n) ? n : 0);

/** 1284 -> "1.284" */
export const formatInt = (n: number | null | undefined) =>
  Math.round(toNum(n)).toLocaleString('es-CL');

/** 61.4 -> "61,4 %" */
export const formatPercent = (n: number | null | undefined, decimals = 1) =>
  `${toNum(n).toLocaleString('es-CL', { maximumFractionDigits: decimals })} %`;

/** 18450000 -> "$18.450.000" */
export const formatCLP = (n: number | null | undefined) =>
  toNum(n).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

/** 18450000 -> "$18,5 M"; para ejes de gráficos, donde el monto completo no cabe. */
export const formatCLPCompact = (n: number | null | undefined) => {
  const v = toNum(n);
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toLocaleString('es-CL', { maximumFractionDigits: 1 })} M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toLocaleString('es-CL', { maximumFractionDigits: 0 })} mil`;
  return `$${v.toLocaleString('es-CL')}`;
};

/** kg -> toneladas con una decimal: 516900 -> "516,9" (la unidad va aparte). */
export const kgToTonnes = (kg: number | null | undefined, decimals = 1) =>
  (toNum(kg) / 1000).toLocaleString('es-CL', { maximumFractionDigits: decimals, minimumFractionDigits: 0 });

/**
 * Las series llegan como "2026-09-01". new Date("2026-09-01") es medianoche
 * UTC, que en Chile cae el día anterior; se ancla al mediodía local.
 */
export const parseDay = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);

/** "2026-09-01" -> "1 sept" */
export const formatDayShort = (value: string) =>
  parseDay(value).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }).replace('.', '');

/** "2026-09-01" -> "1 de septiembre de 2026" */
export const formatDayLong = (value: string) =>
  parseDay(value).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

/** Fecha -> "18:34" (24 horas; es-CL usa "p. m." por defecto) */
export const formatTime = (date: Date) =>
  date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/**
 * Suma acumulada: [0, 1, 0, 2] -> [0, 1, 1, 3]. Para conteos diarios chicos
 * (registros) la serie diaria es un diente de sierra que no dice nada; el
 * acumulado muestra el ritmo de crecimiento.
 */
export const cumulative = (values: number[]) => {
  let acc = 0;
  return values.map((v) => (acc += v || 0));
};

/** "Hace 5 min", "Hace 3 h", "Hace 2 d" */
export const timeAgo = (value: string) => {
  const diffMin = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (!Number.isFinite(diffMin)) return '';
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `Hace ${h} h`;
  return `Hace ${Math.floor(h / 24)} d`;
};
