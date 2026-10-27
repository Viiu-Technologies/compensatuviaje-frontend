// Todos los frames del video viven aquí. 30 fps · 900 frames · 30 s.
// Los rangos son [inicio, fin] en frames absolutos del video.

export const FPS = 30;
export const DURATION = 900;

export type Range = readonly [number, number];

export const SCENES = {
  intro: { from: 0, duration: 90 }, //        0-3 s
  landing: { from: 90, duration: 120 }, //    3-7 s
  calculator: { from: 210, duration: 240 }, // 7-15 s
  result: { from: 450, duration: 180 }, //    15-21 s
  compensate: { from: 630, duration: 150 }, // 21-26 s
  outro: { from: 780, duration: 120 }, //     26-30 s
} as const;

// ── Los 3 movimientos de cámara (spring, damping 200, sin rebote) ──
export const CAMERA = {
  m1ZoomForm: [225, 270] as Range, //   landing → ruta + parámetros
  m2ZoomResult: [450, 498] as Range, // ruta → panel de impacto
  m3ZoomOut: [780, 840] as Range, //    panel → landing completa
};

// ── Rack focus: qué queda nítido a partir de cada frame ──
// null = todo nítido. Cada cambio dura FOCUS_FADE frames.
// 'panel' contiene a 'metric', 'context' y 'action': cuando el panel entero
// está desenfocado sus columnas se marcan nítidas para no sumar dos blurs.
export const FOCUS_FADE = 20;
const PANEL_COLUMNS = ['metric', 'context', 'action'];
export const FOCUS_STEPS: { at: number; sharp: string[] | null }[] = [
  { at: 0, sharp: null },
  { at: CAMERA.m1ZoomForm[0], sharp: ['route', 'config', ...PANEL_COLUMNS] },
  { at: CAMERA.m2ZoomResult[0], sharp: ['panel', 'metric'] },
  { at: 630, sharp: ['panel', 'action'] }, // rack focus sin mover la cámara
  { at: CAMERA.m3ZoomOut[0], sharp: null },
];

export const T = {
  // Intro (0-90)
  introGlobeIn: [0, 45] as Range,
  introTextIn: [10, 40] as Range,
  introTextOut: [90, 120] as Range,
  introGlobeOut: [95, 140] as Range,

  // Entrada de la landing (90-210)
  bgToCanvas: [100, 160] as Range,
  landingIn: [105, 165] as Range,
  landingCaption: [140, 205] as Range,

  // Llenado en cascada (210-450)
  fillStart: 280,
  fillStagger: 8, //    frames entre un campo y el siguiente
  letterFrames: 3, //   frames por letra del código IATA

  // Resultado (450-630)
  countUp: [470, 545] as Range,
  numberPulse: [548, 572] as Range,
  resultMetaIn: [560, 590] as Range,
  resultCaption: [575, 625] as Range,

  // Compensar (630-780)
  ctaAccent: [630, 650] as Range,
  ctaPress: [672, 684] as Range,
  actionOut: [688, 700] as Range, // precio y botón salen…
  doneIn: [698, 722] as Range, //    …y después entra "Huella compensada"
  compensateCaption: [700, 775] as Range,

  // Outro (780-900): 870-900 en reposo total
  outroFrameIn: [790, 830] as Range,
  outroTextIn: [820, 860] as Range,
  rest: 870,
};

// Duración de los fades de entrada/salida de los textos superpuestos.
export const CAPTION_FADE = 12;
