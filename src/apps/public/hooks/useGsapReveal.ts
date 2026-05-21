import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * useGsapReveal — corre un setup GSAP dentro de un gsap.context() para cleanup
 * automático cuando el componente desmonta. Respeta prefers-reduced-motion via
 * gsap.matchMedia (patrón del skill /gsap).
 *
 * El callback recibe el root element (puede usarlo como scope para selectors).
 */
export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(
  setup: (root: T) => void | (() => void),
  deps: React.DependencyList = [],
) {
  const scopeRef = useRef<T | null>(null);

  useEffect(() => {
    const root = scopeRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motionOK: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const { motionOK } = context.conditions as { motionOK: boolean };
          if (!motionOK) {
            gsap.set(root.querySelectorAll('.ctv-reveal, .hero-line__inner, [class*="reveal"]'), {
              autoAlpha: 1,
              y: 0,
              yPercent: 0,
              x: 0,
              scale: 1,
              clipPath: 'none',
            });
            return;
          }
          setup(root);
        },
      );
    }, root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scopeRef;
}
