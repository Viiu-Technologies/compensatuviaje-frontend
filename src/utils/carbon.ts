/**
 * src/utils/carbon.ts
 * Helpers para la conversión entre Unidades Físicas (BD) y Métricas de Carbono (UI)
 *
 * REGLA ARQUITECTÓNICA:
 * - Estas funciones se usan EXCLUSIVAMENTE en la UI de compra en vivo (catálogo, checkout).
 * - Historial y Certificados NUNCA usan estos helpers: leen directamente el campo
 *   co2_kg_compensated congelado en la orden al momento de la compra.
 */

// B2B: Convierte las Toneladas que elige la empresa a Unidades Físicas (Ej: Árboles)
export const calculateUnitsFromTons = (tonsCO2: number, carbonCapturePerUnit: number): number => {
  if (!carbonCapturePerUnit || carbonCapturePerUnit <= 0) return 0;
  return Math.ceil((tonsCO2 * 1000) / carbonCapturePerUnit);
};

// B2C: Convierte los Kilos del vuelo a Unidades Físicas
export const calculateUnitsFromKg = (kgCO2: number, carbonCapturePerUnit: number): number => {
  if (!carbonCapturePerUnit || carbonCapturePerUnit <= 0) return 0;
  return Math.ceil(kgCO2 / carbonCapturePerUnit);
};

// UI B2B/B2C: Convierte el stock de unidades físicas a Toneladas disponibles para mostrar en la tarjeta
export const calculateTonsFromUnits = (units: number, carbonCapturePerUnit: number): number => {
  if (!carbonCapturePerUnit || carbonCapturePerUnit <= 0) return 0;
  const tons = (units * carbonCapturePerUnit) / 1000;
  // Redondear a 2 decimales para que la UI se vea limpia (ej. 1.50 t)
  return Math.round(tons * 100) / 100;
};
