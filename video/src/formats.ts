// Formatos de exportación. El mismo componente se registra una vez por formato;
// la cámara y los textos se adaptan leyendo width/height de useVideoConfig().

export const FORMATS = [
  { id: 'Launch-16x9', width: 1920, height: 1080 }, // X / LinkedIn horizontal
  { id: 'Launch-4x5', width: 1080, height: 1350 }, //  LinkedIn feed vertical
] as const;

// Margen seguro para texto (px de salida).
export const SAFE = 120;

// Unidad tipográfica: 1 en 1080 px de lado corto. Mantiene el tamaño visual
// de los textos igual en los dos formatos.
export const typeUnit = (width: number, height: number) => Math.min(width, height) / 1080;

export const isPortrait = (width: number, height: number) => height > width;
