/**
 * heroScrollConfig — todos los tiempos del hero con scroll en un solo lugar.
 *
 * La línea de tiempo dura 1 y va atada al scroll del pin (scrub): 0 es el
 * primer píxel del pin y 1 el último. Cada escena dice en qué tramo ocurre.
 * Para alargar una escena basta con mover sus `start`/`end`; para que todo el
 * recorrido sea más lento, sube `pinVh` (cuánto scroll dura el pin).
 *
 * Escritorio y móvil tienen su propio guion: en móvil la calculadora va debajo
 * del hero (no cabe junto al titular), así que el pin termina oscureciendo el
 * cielo para empalmar con ella.
 */

export type Span = readonly [start: number, end: number];

export type HeroScript = {
  /** Scroll que dura el pin, en vh (100 = una pantalla). */
  pinVh: number;
  /** Escena 1: el avión aparece y se acerca al wordmark. */
  approach: Span;
  /** Las montañas se abren hacia los lados (despejan el centro para el número
      y, al final, enmarcan la calculadora). */
  mountainsOpen: Span;
  /** Escena 2: cruza el wordmark, la bruma se abre y deja la estela. */
  crossing: Span;
  /** Eyebrow y subtítulo se desvanecen. */
  introOut: Span;
  /** Escena 3: el wordmark sube y se achica. */
  wordmarkUp: Span;
  /** Escena 3: la estela se vuelve la mitad izquierda del arco SCL → LIM. */
  trailToArc: Span;
  /** Escena 3: el avión avanza por la mitad derecha hacia LIM. Debe empezar
      donde termina trailToArc: las dos dibujan el mismo trazo. */
  planeToDest: Span;
  /** Escena 3: aparece el número y sube el contador. */
  readoutIn: Span;
  countUp: Span;
  /** Escena 4: el cielo y las montañas pasan a oscuro. */
  darken: Span;
  /** Escena 4: se van el número, el arco y el wordmark. */
  routeOut: Span;
  /** Escena 4: arco punteado de fondo que aterriza en la card (solo escritorio). */
  landingArc: Span | null;
  /** Escena 4: titular y calculadora (solo escritorio; en móvil van debajo). */
  landingIn: Span | null;
  cardIn: Span | null;
  /** Desde aquí el header pasa a su versión sobre fondo oscuro. */
  darkHeaderAt: number;
};

export const HERO_SCRIPT: { desktop: HeroScript; mobile: HeroScript } = {
  desktop: {
    pinVh: 150,
    approach: [0, 0.1],
    mountainsOpen: [0.08, 0.8],
    crossing: [0.06, 0.42],
    introOut: [0.12, 0.24],
    wordmarkUp: [0.42, 0.56],
    trailToArc: [0.42, 0.52],
    planeToDest: [0.52, 0.72],
    readoutIn: [0.5, 0.58],
    countUp: [0.52, 0.7],
    darken: [0.74, 0.86],
    routeOut: [0.74, 0.82],
    landingArc: [0.8, 0.96],
    landingIn: [0.82, 0.92],
    cardIn: [0.86, 0.98],
    darkHeaderAt: 0.8,
  },
  mobile: {
    pinVh: 100,
    approach: [0, 0.08],
    mountainsOpen: [0.06, 0.84],
    crossing: [0.05, 0.4],
    introOut: [0.1, 0.22],
    wordmarkUp: [0.4, 0.55],
    trailToArc: [0.4, 0.5],
    planeToDest: [0.5, 0.74],
    readoutIn: [0.5, 0.58],
    countUp: [0.52, 0.74],
    darken: [0.84, 1],
    routeOut: [0.84, 0.94],
    landingArc: null,
    landingIn: null,
    cardIn: null,
    darkHeaderAt: 0.92,
  },
};

/**
 * Cuánto se abre cada capa de montañas, lejos → cerca, en fracción del ancho
 * de la pantalla por mitad (0.38 = cada mitad sale un 38 % hacia su lado).
 * Las cercanas se abren más: eso da la profundidad.
 */
export const MOUNTAIN_SPREAD = [0.14, 0.2, 0.28, 0.38] as const;

/**
 * Suavizado del scrub en segundos: cuánto tarda la animación en alcanzar al
 * scroll. Más alto = más pausado si alguien baja rápido. Además, dentro del pin
 * la rueda avanza menos (setScrollFeel en hooks/smoothScroll.ts).
 */
export const SCRUB = 1;

/** Alto del header fijo, para calcular cuándo está encima de la escena oscura. */
export { HEADER_HEIGHT } from '../../hooks/useHeaderTheme';

export const MOBILE_QUERY = '(max-width: 767.98px)';

/** Colores del hero (fuera de tokens.css: son propios de esta ilustración). */
export const HERO_COLORS = {
  skyTop: '#F5F8F4',
  skyBottom: '#D6E4DD',
  nightTop: '#0B2F2B',
  nightBottom: '#0E3B36',
  ink: '#0E3B36',
  route: '#1F8A4C',
  routeOnDark: '#5EE08A',
  // Lejos → cerca. Cada capa tiene su par oscuro para la escena 4.
  mountains: ['#C9D9D1', '#9DB8AD', '#4F7D70', '#123F39'],
  mountainsNight: ['#1E4F48', '#17433D', '#113831', '#0A2A26'],
} as const;
