import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * useGsapReveal — ejecuta un setup GSAP dentro de un gsap.matchMedia() con
 * scope (mismo mecanismo de cleanup que gsap.context: todo tween/ScrollTrigger
 * creado dentro se revierte automáticamente al desmontar, sin animaciones
 * duplicadas en StrictMode). Respeta prefers-reduced-motion.
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
      setup(root);
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      // Sin animación: deja todo visible y en reposo
      gsap.set(
        root.querySelectorAll('.ctv-reveal, .hero-line__inner, [class*="reveal"]'),
        { autoAlpha: 1, y: 0, yPercent: 0, x: 0, scale: 1, clipPath: 'none' },
      );
    });

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scopeRef;
}

/**
 * sectionTimeline — timeline estándar para secciones bajo el fold: se dispara
 * una sola vez cuando la sección entra al viewport (ScrollTrigger), en vez de
 * animar al montar como antes.
 */
export function sectionTimeline(root: HTMLElement, vars: gsap.TimelineVars = {}) {
  return gsap.timeline({
    defaults: { ease: 'power3.out', duration: 0.8 },
    scrollTrigger: {
      trigger: root,
      start: 'top 78%',
      once: true,
    },
    ...vars,
  });
}

export { gsap, ScrollTrigger };
