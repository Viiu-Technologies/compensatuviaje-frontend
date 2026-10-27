import { useLayoutEffect, type RefObject } from 'react';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { gsap } from '../../hooks/useGsapReveal';

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

/**
 * Animación de una figura de "Cómo funciona": se arma pausada (el marcado ya
 * muestra el estado final) y corre la primera vez que la figura está a la
 * vista. Si cambia `key` (otro vuelo en la calculadora) se rearma y corre de
 * nuevo al verse. Con prefers-reduced-motion no se arma: queda el estado final.
 */
export function useFigureTimeline<T extends Element>(
  ref: RefObject<T | null>,
  key: string,
  build: (root: T, tl: gsap.core.Timeline) => void,
) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia(root);
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out', duration: 0.45 } });
      build(root, tl);
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries[entries.length - 1]?.isIntersecting) return;
          io.disconnect();
          tl.play();
        },
        { threshold: 0.35 },
      );
      io.observe(root);
      return () => io.disconnect();
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/** Contador: escribe en `el` el valor de 0 a `to` con `format`. */
export function countUp(tl: gsap.core.Timeline, el: Element | null, to: number, format: (v: number) => string, at: number) {
  if (!el) return;
  const counter = { v: 0 };
  // Al arrancar la animación el número parte en 0 (antes muestra el valor final).
  tl.call(() => { el.textContent = format(0); }, [], 0);
  tl.to(counter, { v: to, duration: 0.8, ease: 'power2.out', onUpdate: () => { el.textContent = format(counter.v); } }, at);
}
