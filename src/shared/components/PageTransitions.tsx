import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import './PageTransitions.css';

/**
 * Transición entre páginas públicas con la View Transitions API: la página
 * actual se funde con la siguiente en vez de cortar en seco.
 *
 * La app usa <BrowserRouter>, que no tiene el `viewTransition` de los enlaces
 * del router de datos. En su lugar, este componente escucha los clics en
 * enlaces internos, cancela la navegación normal y la repite dentro de
 * `document.startViewTransition`. El navegador congela la página actual, se
 * navega, se espera a que la nueva termine de cargar (las páginas son lazy) y
 * recién entonces se hace el fundido: nunca se anima hacia el spinner.
 *
 * No actúa (el enlace navega como siempre) cuando:
 * · el navegador no tiene la API o el usuario pidió menos movimiento;
 * · el clic es con otra tecla, con modificadores o abre otra pestaña;
 * · el enlace solo cambia el ancla o los parámetros de la misma página, o
 *   apunta a una sección de otra (/#proyectos);
 * · el origen o el destino es un área privada o de acceso (paneles, login,
 *   registro): ahí los enlaces llevan estado (`state`) o deben ser instantáneos;
 * · el enlace lleva `data-no-transition`.
 *
 * Se monta una sola vez, dentro del Router.
 */

/** Áreas donde la navegación queda como estaba. */
const EXCLUDED = /^\/(admin|b2b|b2c|partner|dashboard|onboarding|company|login|register|auth|forgot-password|reset-password)(\/|$)/;

/** Máximo que se espera a la página nueva antes de mostrar lo que haya. */
const MAX_WAIT_MS = 2500;

// Con temporizador y no con requestAnimationFrame: mientras el navegador tiene
// la página congelada esperando el cambio, no dibuja cuadros, y un rAF no
// llegaría nunca (la transición se aborta sola a los 4 s).
const tick = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/** Resuelve cuando ya no está el spinner de carga de ruta (ver PageLoader en App.tsx). */
async function routeReady() {
  const deadline = performance.now() + MAX_WAIT_MS;
  await tick(0);
  while (document.querySelector('[data-route-loading]') && performance.now() < deadline) {
    await tick(30);
  }
  // Un respiro más: los efectos de la página nueva (subir al inicio) ya corrieron.
  await tick(30);
}

const PageTransitions = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof document.startViewTransition !== 'function') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (reducedMotion.matches) return;
      const link = e.target instanceof Element ? e.target.closest('a') : null;
      if (!link || link.target === '_blank' || link.hasAttribute('download') || link.hasAttribute('data-no-transition')) return;
      const href = link.getAttribute('href');
      if (!href) return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      // Enlaces a una sección de otra página (/#proyectos): el Header ya los
      // resuelve con su propio desplazamiento.
      if (url.hash) return;
      if (EXCLUDED.test(url.pathname) || EXCLUDED.test(window.location.pathname)) return;

      // El <Link> de React Router no navega si el evento ya fue cancelado; sus
      // otros onClick (cerrar el menú, etc.) siguen corriendo.
      e.preventDefault();
      const to = url.pathname + url.search;
      document.startViewTransition(async () => {
        flushSync(() => navigate(to));
        await routeReady();
      });
    };

    // En captura: antes de que React procese el clic.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [navigate]);

  return null;
};

export default PageTransitions;
