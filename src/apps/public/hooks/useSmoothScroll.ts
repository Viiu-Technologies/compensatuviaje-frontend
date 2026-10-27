import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger } from './useGsapReveal';
import { scaleWheel, setScrollFeel, setSmoothScroller } from './smoothScroll';

/**
 * Scroll suave con Lenis mientras la página que lo usa está montada (la
 * landing). Lenis mueve el scroll nativo, así que ScrollTrigger sigue
 * funcionando: solo hay que avisarle en cada cuadro y compartir el reloj de
 * GSAP para que pin y scrub vayan en el mismo tick.
 *
 * Con prefers-reduced-motion no se activa: el scroll queda nativo.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // lerp y la escala de la rueda cambian dentro del hero: ver setScrollFeel.
    const lenis = new Lenis({ autoRaf: false, lerp: 0.11, virtualScroll: scaleWheel });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // Sin esto GSAP "recupera" cuadros perdidos y el scroll da saltos.
    gsap.ticker.lagSmoothing(0);
    setSmoothScroller(lenis);
    setScrollFeel('normal');

    return () => {
      setSmoothScroller(null);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // valores por defecto de GSAP
      lenis.destroy();
    };
  }, []);
}
