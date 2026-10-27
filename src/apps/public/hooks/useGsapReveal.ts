import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Entradas de las secciones ───────────────────────────────────────────────
// El contenido es visible por defecto: la animación es una mejora, no un
// requisito. Solo se oculta lo que todavía está bajo el pliegue cuando la
// sección se monta, y entra rápido (≈0,5 s) al llegar al 85 % de la pantalla.
//
// Antes los títulos entraban letra por letra (con un retraso por letra) y las
// secciones arrancaban ocultas por CSS: al bajar rápido, o si el disparo llegaba
// tarde, quedaban bloques vacíos y títulos a medio armar.

/** Punto de disparo: la parte superior de la sección al 85 % de la pantalla. */
const REVEAL_AT = 0.85;

type Cleanup = () => void;
// Limpiezas de lo que crea sectionTimeline fuera de GSAP, mientras corre un setup.
let cleanups: Cleanup[] | null = null;

/**
 * Entrada de los elementos que coinciden con `selector` dentro de `root`, para
 * ponerla en la línea de tiempo de la sección:
 *   tl.add(reveal(root, '.ft-title'), 0.05)
 * `title`: si el título está partido en líneas (`.hero-line__inner`), suben
 * línea por línea; si no, entra entero. Siempre con fundido: no todas las
 * páginas tienen la máscara `.hero-line` (overflow hidden) y, sin ella, una
 * línea desplazada se vería sobre el contenido de abajo. `text`: el párrafo
 * entra entero.
 */
export function reveal(root: Element, selector: string, kind: 'title' | 'text' = 'title') {
  const matches = [...root.querySelectorAll<HTMLElement>(selector)];
  if (kind === 'title') {
    const lines = matches.flatMap((el) => [...el.querySelectorAll<HTMLElement>('.hero-line__inner')]);
    if (lines.length) {
      return gsap.from(lines, { yPercent: 40, autoAlpha: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' });
    }
    return gsap.from(matches, { y: 16, autoAlpha: 0, duration: 0.5, ease: 'power2.out' });
  }
  return gsap.from(matches, { y: 10, autoAlpha: 0, duration: 0.45, ease: 'power2.out' });
}

/**
 * useGsapReveal — ejecuta un setup GSAP dentro de un gsap.matchMedia() con
 * scope (mismo mecanismo de cleanup que gsap.context: todo tween/ScrollTrigger
 * creado dentro se revierte automáticamente al desmontar, sin animaciones
 * duplicadas en StrictMode).
 *
 * Con prefers-reduced-motion no se ejecuta: el contenido ya está visible.
 *
 * El callback recibe el root element; los selectores de texto dentro de los
 * tweens se resuelven scoped al root.
 */
export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(
  setup: (root: T) => void,
  deps: React.DependencyList = [],
) {
  const scopeRef = useRef<T | null>(null);

  useLayoutEffect(() => {
    const root = scopeRef.current;
    if (!root) return;

    // matchMedia con scope: selectors scoped + cleanup total en revert()
    const mm = gsap.matchMedia(root);
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Lo que no es de GSAP (los observers de sectionTimeline) se deshace aparte.
      const list: Cleanup[] = [];
      cleanups = list;
      try {
        setup(root);
      } finally {
        cleanups = null;
      }
      return () => list.forEach((fn) => fn());
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scopeRef;
}

/**
 * sectionTimeline — timeline estándar para secciones bajo el pliegue: se
 * dispara una sola vez cuando la sección llega al 85 % de la pantalla.
 *
 * El disparo es un IntersectionObserver y no un ScrollTrigger: el navegador
 * calcula la intersección en cada cuadro, así que no se atrasa cuando cambia el
 * alto de lo que hay arriba (secciones diferidas que se montan, imágenes que
 * cargan). Con ScrollTrigger, saltar por encima de secciones aún sin montar
 * dejaba posiciones viejas y la entrada llegaba tarde.
 *
 * Si al montarse la sección ya pasó ese punto (se montó en pantalla, se llegó
 * por un ancla o se bajó rápido), la timeline se completa al instante: nunca
 * se esconde algo que el usuario ya está viendo.
 *
 * Pasar `scrollTrigger: undefined` en `vars` la convierte en una entrada al
 * cargar (para el hero de una página).
 */
export function sectionTimeline(root: HTMLElement, vars: gsap.TimelineVars = {}) {
  const onLoad = 'scrollTrigger' in vars;
  const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.5 }, paused: !onLoad, ...vars });
  if (onLoad) return tl;

  const observer = new IntersectionObserver(
    (entries) => {
      // Un mismo aviso puede traer el estado inicial y el cambio: vale el último.
      const entry = entries[entries.length - 1];
      // Entra al cruzar la línea del 85 %, o si se pasó de largo hacia abajo.
      if (!entry || (!entry.isIntersecting && entry.boundingClientRect.top > 0)) return;
      observer.disconnect();
      tl.play();
    },
    { rootMargin: `0px 0px -${Math.round((1 - REVEAL_AT) * 100)}% 0px` },
  );
  cleanups?.push(() => observer.disconnect());

  // Después de que el componente agregue sus tweens (mismo tick, antes de pintar).
  queueMicrotask(() => {
    if (root.getBoundingClientRect().top < window.innerHeight * REVEAL_AT) tl.progress(1);
    else observer.observe(root);
  });
  return tl;
}

/**
 * Recalcula las posiciones de los ScrollTrigger cuando cambia el alto de la
 * página (imágenes que terminan de cargar, secciones diferidas, el pin del
 * hero). Sin esto los disparos quedaban donde estaba el contenido al montarse
 * y llegaban tarde.
 */
export function useScrollTriggerAutoRefresh() {
  useEffect(() => {
    let height = document.body.offsetHeight;
    let timer = 0;
    const observer = new ResizeObserver(() => {
      const next = document.body.offsetHeight;
      if (Math.abs(next - height) < 2) return;
      height = next;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    });
    observer.observe(document.body);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);
}

export { gsap, ScrollTrigger };
