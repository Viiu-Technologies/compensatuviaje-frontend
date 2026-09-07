import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Indica si el sistema pide movimiento reducido.
 *
 * La regla global de index.css neutraliza animaciones y transiciones CSS, pero
 * no alcanza al movimiento gobernado por JavaScript: rotaciones de Three.js,
 * timelines de GSAP o contadores animados siguen corriendo. Este hook permite
 * que esos componentes tambien la respeten.
 *
 * Se suscribe al cambio para reaccionar si el usuario ajusta la preferencia
 * con la pagina abierta.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mql = window.matchMedia(QUERY);
    const onChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);

    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return prefersReduced;
}

export default usePrefersReducedMotion;
