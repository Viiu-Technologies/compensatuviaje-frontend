import React from 'react';
import { HERO_COLORS } from './heroScrollConfig';

/**
 * Siluetas de los Andes en 4 capas (lejos → cerca).
 *
 * Cada capa es una cordillera continua partida en dos mitades por una de sus
 * hondonadas. Con el scroll las mitades se abren hacia los lados, como un
 * telón: despejan el centro para el número de la huella y, al final, enmarcan
 * la calculadora.
 *
 * En el corte cada mitad sigue bajando hasta el suelo con la inclinación de su
 * propia ladera. En reposo esa falda queda tapada por la otra mitad, así que
 * se ve exactamente la cordillera completa; al abrirse, lo que aparece son
 * flancos de montaña normales y no un corte recto. Cada mitad es su propio SVG
 * para moverla con transform, sin repintar.
 *
 * Cada mitad lleva su versión nocturna encima, invisible hasta la escena 4: se
 * cruza la opacidad en vez de animar el color.
 *
 * Las crestas se generan con una semilla fija: siempre salen iguales y no hay
 * que mantener a mano cientos de coordenadas.
 */

const VIEW_W = 2400;
const VIEW_H = 400;

// Generador pseudoaleatorio determinista (mulberry32).
const random = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Point = [number, number];
type Ridge = { d: string; peaks: Point[] };

/** Cresta en zigzag: pico, hondonada, pico… entre `top` (el más alto) y el pie. */
const ridgePoints = (seed: number, peaks: number, top: number): Point[] => {
  const rnd = random(seed);
  const step = VIEW_W / peaks;
  const points: Point[] = [];
  let x = -step * 0.3;
  for (let i = 0; i <= peaks; i++) {
    const tip: Point = [x + rnd() * step * 0.3, top + rnd() * (VIEW_H - top) * 0.35];
    const dip: Point = [tip[0] + step * (0.45 + rnd() * 0.2), top + (VIEW_H - top) * (0.45 + rnd() * 0.3)];
    points.push(tip, dip);
    x += step;
  }
  return points;
};

const fmt = (points: Point[]) => points.map(([px, py]) => `L${px.toFixed(0)} ${py.toFixed(0)}`).join(' ');

/**
 * Parte la cresta en la hondonada más cercana a `cutX`. Cada mitad prolonga
 * hasta el suelo la ladera que llega a esa hondonada (con un tope de largo,
 * para que ninguna falda quede tendida).
 */
const splitRidge = (points: Point[], peaks: number, cutX: number): { left: Ridge; right: Ridge } => {
  const step = VIEW_W / peaks;
  let k = 1; // las hondonadas son los índices impares
  for (let i = 1; i < points.length - 1; i += 2) {
    if (Math.abs(points[i][0] - cutX) < Math.abs(points[k][0] - cutX)) k = i;
  }
  const [dipX, dipY] = points[k];
  const drop = VIEW_H - dipY;
  const run = (dx: number, dy: number) => Math.min((drop * Math.abs(dx)) / Math.abs(dy), step * 1.1);
  const leftFoot = dipX + run(dipX - points[k - 1][0], dipY - points[k - 1][1]);
  const rightFoot = dipX - run(points[k + 1][0] - dipX, points[k + 1][1] - dipY);

  const left = points.slice(0, k + 1);
  const right = points.slice(k);
  return {
    left: {
      d: `M0 ${VIEW_H} L0 ${left[0][1].toFixed(0)} ${fmt(left)} L${leftFoot.toFixed(0)} ${VIEW_H} Z`,
      peaks: left.filter((_, i) => i % 2 === 0),
    },
    right: {
      d: `M${rightFoot.toFixed(0)} ${VIEW_H} ${fmt(right)} L${VIEW_W} ${VIEW_H} Z`,
      // `right` empieza en la hondonada: sus picos quedan en los índices impares
      peaks: right.filter((_, i) => i % 2 === 1),
    },
  };
};

/** Casquete nevado con borde inferior irregular. */
const snowCap = ([px, py]: Point) =>
  `M${px - 30} ${py + 24} L${px} ${py} L${px + 28} ${py + 22} L${px + 14} ${py + 17} L${px + 3} ${py + 26} L${px - 12} ${py + 18} Z`;

// Lejos → cerca: semilla, número de picos, altura del pico más alto (en el
// viewBox), alto de la capa en vh y cerca de dónde se parte (cada capa en un
// punto distinto, para que las aberturas no se alineen en el centro).
const LAYERS = [
  { seed: 11, peaks: 9, top: 30, height: 46, cut: VIEW_W / 2 - 120 },
  { seed: 23, peaks: 8, top: 70, height: 37, cut: VIEW_W / 2 + 160 },
  { seed: 37, peaks: 7, top: 110, height: 28, cut: VIEW_W / 2 - 60 },
  { seed: 53, peaks: 6, top: 150, height: 19, cut: VIEW_W / 2 + 90 },
].map((layer) => ({ ...layer, ...splitRidge(ridgePoints(layer.seed, layer.peaks, layer.top), layer.peaks, layer.cut) }));

/** Mezcla un color con blanco: la base de cada capa se aclara con la bruma. */
const hazed = (hex: string, amount: number) => {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);
  return `rgb(${r} ${g} ${b})`;
};

type Side = 'l' | 'r';

const Half: React.FC<{ layer: number; side: Side; ridge: Ridge }> = ({ layer, side, ridge }) => {
  const gradient = `hs-mtn-day-${layer}-${side}`;
  return (
    <svg
      className={`hs-mtn__half hs-mtn__half--${side}`}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMax slice"
      focusable="false"
    >
      <defs>
        {/* En coordenadas del viewBox (no de cada forma): las dos mitades
            tienen el mismo tono a la misma altura y no se nota la unión. */}
        <linearGradient id={gradient} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={VIEW_H}>
          <stop offset="0" stopColor={HERO_COLORS.mountains[layer]} />
          {/* La capa cercana no lleva bruma: su pie empalma con la sección oscura de abajo. */}
          <stop offset="1" stopColor={hazed(HERO_COLORS.mountains[layer], layer === 3 ? 0 : 0.28)} />
        </linearGradient>
      </defs>
      <g className="hs-mtn__day">
        <path d={ridge.d} fill={`url(#${gradient})`} />
        {layer === 0 && (
          <g className="hs-mtn__snow" fill="#ffffff" opacity="0.9">
            {ridge.peaks.map((tip) => (
              <path key={tip[0]} d={snowCap(tip)} />
            ))}
          </g>
        )}
      </g>
      <path className="hs-mtn__night" d={ridge.d} fill={HERO_COLORS.mountainsNight[layer]} />
    </svg>
  );
};

const Mountains: React.FC = () => (
  <div className="hs-mountains" aria-hidden="true">
    {LAYERS.map((layer, i) => (
      <div key={layer.seed} className={`hs-mtn hs-mtn--${i}`} style={{ height: `${layer.height}vh` }}>
        <Half layer={i} side="l" ridge={layer.left} />
        <Half layer={i} side="r" ridge={layer.right} />
      </div>
    ))}
  </div>
);

export default Mountains;
