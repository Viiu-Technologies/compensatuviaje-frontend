// Tiempos del video completo (v2). 30 fps · 1500 frames · 50 s.
//
// Cada escena es una <Sequence> con su propio reloj (frame 0 = su inicio). Las
// escenas se pisan unos frames: la nueva entra con un fundido ENCIMA de la
// anterior, que sigue entera debajo hasta que termina.
//
// El intro (planeta + "Cada vuelo deja huella.") es el mismo de la v1 y usa
// sus tiempos de ../timing.ts.

export const FPS = 30;
export const DURATION = 1500;

/** Frames que dura el fundido de entrada de cada escena. */
export const FADE = 20;

export const SHOW = {
  intro: { from: 0, duration: 140 }, //         0-4,7 s  planeta
  hero: { from: 95, duration: 560 }, //         3,2-21,8 s  hero + calculadora
  howItWorks: { from: 635, duration: 240 }, //  21,2-29,2 s
  method: { from: 855, duration: 260 }, //      28,5-37,2 s  minijuego DEFRA
  verify: { from: 1095, duration: 240 }, //     36,5-44,5 s  verificación + estándares
  outro: { from: 1315, duration: 185 }, //      43,8-50 s
} as const;

// ── Hero (frames locales de SHOW.hero) ──
export const HERO = {
  skyIn: [0, 45],
  mountainsUp: [5, 70],
  wordmarkIn: [25, 60],
  extrasIn: [35, 70], //      eyebrow y subtítulo
  crossing: [70, 160], //     el avión cruza el wordmark y abre la bruma
  extrasOut: [92, 115],
  mountainsOpen: [80, 300],
  wordmarkUp: [160, 195],
  trailOut: [160, 192],
  scl: [178, 192], //         aparece el punto de Santiago
  arc: [188, 262], //         el avión recorre el arco y lo va dibujando
  lim: [252, 266],
  readoutIn: [204, 224],
  countUp: [210, 262],
  darken: [300, 340],
  routeOut: [298, 322],
  // Escena 4: titular + calculadora sobre la noche
  copyIn: [335, 368],
  cardIn: [345, 382],
  typeOrigin: [388, 404],
  typeDest: [408, 424],
  roundTrip: 430,
  cabin: 440,
  press: [452, 462],
  loading: [462, 478],
  resultIn: [478, 500],
  resultCount: [482, 520],
  ctaGlow: [522, 540],
} as const;

// ── Cómo funciona ──
export const HOW = {
  titleIn: [8, 34],
  cardIn: (i: number) => [18 + i * 12, 46 + i * 12] as const,
  figureAt: (i: number) => 40 + i * 42, // inicio de la animación de cada figura
} as const;

// ── Metodología (minijuego) ──
export const METHOD = {
  titleIn: [6, 30],
  rings: [14, 46],
  band: (i: number) => 26 + i * 16, // columnas de cada anillo
  stops: [70, 90],
  planeIn: [82, 94],
  missionIn: [82, 100],
  fly: [100, 168], //   Santiago → Madrid en primera
  cabinSteps: [180, 190, 200], // ↓ ↓ ↓: primera → business → premium → económica
  missionDone: 210, //  queda ~1,7 s en pantalla antes de la verificación
} as const;

// ── Verificación (frames = segundos de la web × 30, desde VERIFY_AT) ──
export const VERIFY_AT = 24;
export const VERIFY = {
  titleIn: [6, 32],
  standard: (i: number) => 70 + i * 14,
} as const;

// ── Outro ──
export const OUTRO = {
  planeArc: [10, 70],
  logoIn: [24, 54],
  lineIn: [36, 66],
  urlIn: [48, 78],
  rest: 155, // desde aquí todo quieto
} as const;
