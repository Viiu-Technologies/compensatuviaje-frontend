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
  /** El punto de origen y su etiqueta aparecen; el avión espera en él. */
  originIn: Span;
  /** Las montañas se abren hacia los lados (despejan el centro para el número
      y, al final, enmarcan la calculadora). */
  mountainsOpen: Span;
  /**
   * El vuelo completo, origen → destino, en un solo movimiento: despega, sube
   * atravesando el wordmark y la bruma, y baja al destino. La ruta se dibuja
   * detrás del avión. Lo que depende de por dónde va el avión (la bruma que se
   * abre, el wordmark que sube, el número que aparece) no tiene tramo propio:
   * la línea de tiempo calcula su momento a partir de este.
   */
  flight: Span;
  /** Eyebrow y subtítulo se desvanecen. */
  introOut: Span;
  /** Cuánto dura la subida del wordmark; empieza cuando el avión entra en él. */
  wordmarkUp: number;
  /** Cuánto tarda en aparecer el número; empieza cuando el avión pasa la cima. */
  readoutIn: number;
  /** El avión llega al destino y desaparece en él. */
  touchdown: Span;
  /** Se van el número, las etiquetas y el wordmark (en móvil, también la ruta). */
  routeOut: Span;
  /** El cielo y las montañas pasan a la noche; la ruta se enciende. */
  darken: Span;
  /** La ruta se acomoda bajo el titular y la calculadora se abre desde el
      destino (solo escritorio; en móvil la calculadora va debajo). */
  lineSettle: Span | null;
  /** Entra el titular de la escena final (solo escritorio). */
  landingIn: Span | null;
  /** Desde aquí el header pasa a su versión sobre fondo oscuro. */
  darkHeaderAt: number;
};

export const HERO_SCRIPT: { desktop: HeroScript; mobile: HeroScript } = {
  desktop: {
    pinVh: 170,
    originIn: [0, 0.05],
    mountainsOpen: [0.06, 0.8],
    flight: [0.03, 0.66],
    introOut: [0.1, 0.22],
    wordmarkUp: 0.13,
    readoutIn: 0.07,
    touchdown: [0.66, 0.72],
    routeOut: [0.67, 0.75],
    darken: [0.68, 0.86],
    lineSettle: [0.72, 0.92],
    landingIn: [0.82, 0.96],
    darkHeaderAt: 0.78,
  },
  mobile: {
    pinVh: 110,
    originIn: [0, 0.05],
    mountainsOpen: [0.06, 0.84],
    flight: [0.03, 0.74],
    introOut: [0.1, 0.22],
    wordmarkUp: 0.14,
    readoutIn: 0.08,
    touchdown: [0.74, 0.8],
    routeOut: [0.84, 0.94],
    darken: [0.84, 1],
    lineSettle: null,
    landingIn: null,
    darkHeaderAt: 0.92,
  },
};

/** Curva del vuelo: arranca y llega despacio (despegue y aproximación). */
export const FLIGHT_EASE = 'sine.inOut';

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
