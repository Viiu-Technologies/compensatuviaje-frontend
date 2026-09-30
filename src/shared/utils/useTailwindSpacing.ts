import { useLayoutEffect } from 'react';

/**
 * Activa las utilidades de espaciado de Tailwind (p-*, m-*, space-y-*…)
 * mientras el componente está montado. Ver el reset `:where(html:not(.tw-spacing)) *`
 * en index.css: fuera de esta clase, el reset global las anula.
 *
 * Se aplica sobre <html> para cubrir también modales montados en document.body.
 * Lleva un contador por si dos vistas lo piden a la vez.
 */
let users = 0;

export function useTailwindSpacing() {
  useLayoutEffect(() => {
    users += 1;
    document.documentElement.classList.add('tw-spacing');
    return () => {
      users -= 1;
      if (users === 0) document.documentElement.classList.remove('tw-spacing');
    };
  }, []);
}
