/**
 * Geometría del vuelo en coordenadas del escenario (px, origen arriba a la
 * izquierda). Se recalcula cuando cambia el ancho de la ventana.
 *
 * Todo el hero es una sola línea:
 *
 *   vuelo      SCL ──► cima (atraviesa el wordmark) ──► LIM
 *   reposo     la misma línea se acomoda bajo el titular y termina en el
 *              costado de la calculadora (solo escritorio)
 *
 * Las dos formas tienen la misma estructura (dos cúbicas, siete puntos), así
 * que pasar de una a otra es interpolar punto a punto: no hay un segundo
 * camino que aparezca de la nada.
 */

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };

/** M p0 · C p1 p2 p3 · C p4 p5 p6 */
export type LinePoints = readonly [Point, Point, Point, Point, Point, Point, Point];

export type HeroGeometry = {
  /** Arco del vuelo SCL → LIM. */
  arc: string;
  arcPts: LinePoints;
  from: Point;
  to: Point;
  /** La línea en reposo, bajo el titular y hasta la card; null si la card no está junto al titular. */
  settlePts: LinePoints | null;
  /** Lo mismo como `d`, para la versión sin animación. */
  landing: string | null;
  landingFrom: Point | null;
};

const f = (n: number) => n.toFixed(1);
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const pathFrom = (p: readonly Point[]) =>
  `M${f(p[0].x)} ${f(p[0].y)} ` +
  `C${f(p[1].x)} ${f(p[1].y)} ${f(p[2].x)} ${f(p[2].y)} ${f(p[3].x)} ${f(p[3].y)} ` +
  `C${f(p[4].x)} ${f(p[4].y)} ${f(p[5].x)} ${f(p[5].y)} ${f(p[6].x)} ${f(p[6].y)}`;

export const lerpPoint = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

/**
 * `copy`: bloque del titular de la escena final. La línea en reposo pasa por
 * debajo de él.
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

  // En móvil los extremos van casi al borde: el número ocupa casi todo el ancho
  // y el arco no debe cruzarlo.
  const from: Point = mobile ? { x: w * 0.07, y: h * 0.84 } : { x: w * 0.13, y: h * 0.8 };
  // En escritorio el destino cae dentro de la calculadora: al final, ella se
  // abre desde ese punto.
  const to: Point = mobile
    ? { x: w * 0.93, y: h * 0.78 }
    : card
      ? { x: clamp(w * 0.83, card.x + card.w * 0.25, card.x + card.w * 0.8), y: card.y + card.h * 0.72 }
      : { x: w * 0.83, y: h * 0.68 };

  // Arco en dos cúbicas unidas en la cima con tangente horizontal: el avión
  // pasa por el centro del wordmark en vuelo nivelado.
  const spanL = apex.x - from.x;
  const spanR = to.x - apex.x;
  const arcPts: LinePoints = [
    from,
    { x: from.x + spanL * 0.3, y: from.y - (from.y - apex.y) * 0.62 },
    { x: apex.x - spanL * 0.55, y: apex.y },
    apex,
    { x: apex.x + spanR * 0.55, y: apex.y },
    { x: to.x - spanR * 0.3, y: to.y - (to.y - apex.y) * 0.62 },
    to,
  ];

  let settlePts: LinePoints | null = null;
  let landingFrom: Point | null = null;
  if (card) {
    // Corre bajo el texto (por debajo de los chips) y sube recién junto a la
    // card, para llegar a su costado a la altura del resultado.
    const low = Math.min(h * 0.97, Math.max(h * 0.88, copy ? copy.y + copy.h + h * 0.08 : 0));
    landingFrom = { x: w * 0.03, y: Math.min(h * 0.97, low + h * 0.02) };
    const end: Point = { x: card.x - 6, y: to.y };
    const mid: Point = { x: landingFrom.x + (end.x - landingFrom.x) * 0.55, y: low };
    settlePts = [
      landingFrom,
      { x: landingFrom.x + (mid.x - landingFrom.x) * 0.4, y: low },
      { x: mid.x - (mid.x - landingFrom.x) * 0.3, y: low },
      mid,
      { x: mid.x + (end.x - mid.x) * 0.45, y: low },
      { x: end.x - w * 0.05, y: low },
      end,
    ];
  }

  return {
    arc: pathFrom(arcPts),
    arcPts,
    from,
    to,
    settlePts,
    landing: settlePts ? pathFrom(settlePts) : null,
    landingFrom,
  };
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
