import type Lenis from 'lenis';

/**
 * Registro del scroll de la landing.
 *
 * · Lenis (scroll suave) solo vive mientras la landing está montada; fuera de
 *   ella `getSmoothScroller()` devuelve null y se usa el scroll nativo.
 * · Algunas anclas no se pueden alcanzar con scrollIntoView: la calculadora
 *   está dentro del hero pinneado y su posición real depende del ScrollTrigger.
 *   El hero registra aquí cómo llegar a ella.
 */

let lenis: Lenis | null = null;

export const setSmoothScroller = (instance: Lenis | null) => {
  lenis = instance;
};

export const getSmoothScroller = () => lenis;

/**
 * Sensación del scroll. 'slow' la usa el hero pinneado: cada gesto de rueda
 * avanza menos y el deslizamiento es más suave, así una bajada rápida no se
 * salta la animación. Solo afecta a la rueda; los saltos programados (el CTA
 * "Calcula tu huella", las anclas) van a su velocidad normal.
 */
const FEEL = {
  normal: { lerp: 0.11, wheelMultiplier: 1 },
  slow: { lerp: 0.06, wheelMultiplier: 0.45 },
} as const;

let wheelFactor: number = FEEL.normal.wheelMultiplier;

export const setScrollFeel = (feel: keyof typeof FEEL) => {
  wheelFactor = FEEL[feel].wheelMultiplier;
  // Lenis lee lerp en cada evento de rueda.
  if (lenis) lenis.options.lerp = FEEL[feel].lerp;
};

/** Para la opción `virtualScroll` de Lenis: escala cada gesto según la sensación actual. */
export const scaleWheel = (data: { deltaX: number; deltaY: number }) => {
  data.deltaX *= wheelFactor;
  data.deltaY *= wheelFactor;
  return true;
};

type SectionScroller = (behavior: ScrollBehavior) => void;
const scrollers = new Map<string, SectionScroller>();

/** Devuelve la función que deshace el registro (para el cleanup del efecto). */
export const registerSectionScroller = (id: string, fn: SectionScroller) => {
  scrollers.set(id, fn);
  return () => {
    if (scrollers.get(id) === fn) scrollers.delete(id);
  };
};

export const getSectionScroller = (id: string) => scrollers.get(id);

/** Lleva el scroll a `y` (px de documento) con Lenis si está activo. */
export const scrollToY = (y: number, behavior: ScrollBehavior = 'smooth') => {
  if (lenis && behavior === 'smooth') {
    lenis.scrollTo(y, { duration: 1.4 });
  } else {
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else window.scrollTo({ top: y, behavior });
  }
};
