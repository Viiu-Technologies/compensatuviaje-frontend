/**
 * Geometría del vuelo en coordenadas del escenario (px, origen arriba a la
 * izquierda). Se recalcula cuando cambia el ancho de la ventana.
 *
 *   cruce   P0 ──────────► cima        (escena 2, atraviesa el wordmark)
 *   arco    SCL ──► cima ──► LIM        (escena 3)
 *
 * El cruce termina en la cima del arco con la misma tangente (horizontal): así
 * la estela "se convierte" en la mitad izquierda del arco y el avión sigue por
 * la derecha sin saltos.
 */

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };

export type HeroGeometry = {
  crossing: string;
  arc: string;
  from: Point;
  to: Point;
  /** Arco de la escena 4 hacia la card; null si la card no está junto al titular. */
  landing: string | null;
  landingFrom: Point | null;
};

const f = (n: number) => n.toFixed(1);

/**
 * `copy`: bloque del titular de la escena 4. El arco de aterrizaje pasa por
 * debajo de él (antes cruzaba el titular y el párrafo).
 */
export const computeGeometry = (
  stage: { w: number; h: number },
  wordmark: Rect,
  card: Rect | null,
  mobile: boolean,
  copy: Rect | null = null,
): HeroGeometry => {
  const { w, h } = stage;
  const apex: Point = { x: w * 0.5, y: wordmark.y + wordmark.h * 0.5 };

  const p0: Point = mobile ? { x: w * 0.06, y: h * 0.19 } : { x: w * 0.05, y: h * 0.2 };
  // En móvil los extremos van casi al borde: el número ocupa casi todo el ancho
  // y el arco no debe cruzarlo.
  const from: Point = mobile ? { x: w * 0.07, y: h * 0.84 } : { x: w * 0.13, y: h * 0.8 };
  const to: Point = mobile ? { x: w * 0.93, y: h * 0.78 } : { x: w * 0.83, y: h * 0.68 };

  // Cruce: baja suave desde arriba a la izquierda y entra horizontal al centro.
  const crossing = [
    `M${f(p0.x)} ${f(p0.y)}`,
    `C${f(w * 0.2)} ${f(p0.y + (apex.y - p0.y) * 0.15)} ${f(w * 0.26)} ${f(apex.y)} ${f(apex.x)} ${f(apex.y)}`,
  ].join(' ');

  // Arco en dos cúbicas unidas en la cima con tangente horizontal.
  const spanL = apex.x - from.x;
  const spanR = to.x - apex.x;
  const arc = [
    `M${f(from.x)} ${f(from.y)}`,
    `C${f(from.x + spanL * 0.18)} ${f(from.y - (from.y - apex.y) * 0.7)} ${f(apex.x - spanL * 0.55)} ${f(apex.y)} ${f(apex.x)} ${f(apex.y)}`,
    `C${f(apex.x + spanR * 0.55)} ${f(apex.y)} ${f(to.x - spanR * 0.18)} ${f(to.y - (to.y - apex.y) * 0.7)} ${f(to.x)} ${f(to.y)}`,
  ].join(' ');

  // Las dos mitades no miden lo mismo si los extremos están a distinta
  // altura: la fracción del largo en la que cae la cima se mide en el DOM
  // (fractionAtTop).

  let landing: string | null = null;
  let landingFrom: Point | null = null;
  if (card) {
    // Corre bajo el texto (por debajo de los chips) y sube recién junto a la
    // card, para aterrizar en su costado a la altura del resultado.
    const low = Math.min(h * 0.97, Math.max(h * 0.88, copy ? copy.y + copy.h + h * 0.08 : 0));
    landingFrom = { x: w * 0.03, y: Math.min(h * 0.97, low + h * 0.02) };
    const end: Point = { x: card.x - 6, y: card.y + card.h * 0.72 };
    landing = [
      `M${f(landingFrom.x)} ${f(landingFrom.y)}`,
      `C${f(w * 0.3)} ${f(low)} ${f(end.x - w * 0.1)} ${f(low)} ${f(end.x)} ${f(end.y)}`,
    ].join(' ');
  }

  return { crossing, arc, from, to, landing, landingFrom };
};

/**
 * Fracción del largo de `path` en la que su x llega por primera vez a `x`.
 * Sirve para abrir cada elipse de bruma justo cuando el avión pasa por ella.
 */
export const fractionAtX = (path: SVGPathElement, x: number, samples = 160) => {
  const total = path.getTotalLength();
  for (let i = 0; i <= samples; i++) {
    const p = path.getPointAtLength((total * i) / samples);
    if (p.x >= x) return i / samples;
  }
  return 1;
};

/** Fracción del largo de `path` en la que está el punto más alto (menor y). */
export const fractionAtTop = (path: SVGPathElement, samples = 200) => {
  const total = path.getTotalLength();
  let best = 0;
  let bestY = Infinity;
  for (let i = 0; i <= samples; i++) {
    const p = path.getPointAtLength((total * i) / samples);
    if (p.y < bestY) {
      bestY = p.y;
      best = i / samples;
    }
  }
  return best;
};
