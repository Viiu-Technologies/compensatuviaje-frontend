/**
 * Formats a number as Chilean Pesos (CLP).
 * Always uses the es-CL locale (dots as thousands separators, no decimals).
 *
 * Example: formatCLP(641156) → "$ 641.156 CLP"
 */
export function formatCLP(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

/**
 * Formats a CLP price per ton.
 * Example: formatCLPPerTon(390000) → "$ 390.000 CLP / ton"
 */
export function formatCLPPerTon(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${formatCLP(value)} / ton`;
}
