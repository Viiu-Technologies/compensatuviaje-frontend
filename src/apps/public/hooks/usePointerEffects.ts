import { useEffect } from 'react';
import { gsap } from './useGsapReveal';
import '../components/landing/pointerEffects.css';

/**
 * Efectos que siguen al cursor en la landing. Se activan por atributo, así las
 * secciones (que se montan más tarde) no necesitan conectar nada:
 *
 * · `data-magnetic`: el botón se deja arrastrar un poco hacia el cursor y
 *   vuelve con un rebote al soltarlo. Solo en las llamadas a la acción.
 * · `data-spotlight`: la tarjeta recibe la posición del cursor en `--mx` y
 *   `--my`; su CSS dibuja con eso un foco de luz que lo sigue.
 *
 * Un solo listener en el documento. No se instala en pantallas táctiles ni con
 * prefers-reduced-motion: ahí los botones y las tarjetas quedan como siempre.
 */

const ENABLED = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
/** Cuánto del desplazamiento del cursor sigue el botón. */
const PULL = 0.28;

export function usePointerEffects() {
  useEffect(() => {
    const mq = window.matchMedia(ENABLED);
    if (!mq.matches) return;

    let held: HTMLElement | null = null;

    const release = () => {
      const el = held;
      if (!el) return;
      held = null;
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.45)',
        overwrite: true,
        onComplete: () => {
          // Devuelve el control al CSS (elevación al pasar el mouse, etc.).
          if (held === el) return;
          gsap.set(el, { clearProps: 'transform' });
          el.classList.remove('is-magnetic');
        },
      });
    };

    const onMove = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;

      const card = target?.closest<HTMLElement>('[data-spotlight]');
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      }

      const button = target?.closest<HTMLElement>('[data-magnetic]') ?? null;
      if (button !== held) {
        release();
        held = button;
        button?.classList.add('is-magnetic');
      }
      if (!button) return;
      // El rectángulo ya incluye el desplazamiento actual: se descuenta para
      // medir contra el centro en reposo.
      const rect = button.getBoundingClientRect();
      const restX = rect.left + rect.width / 2 - Number(gsap.getProperty(button, 'x'));
      const restY = rect.top + rect.height / 2 - Number(gsap.getProperty(button, 'y'));
      gsap.to(button, {
        x: (e.clientX - restX) * PULL,
        y: (e.clientY - restY) * PULL,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: true,
      });
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', release);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', release);
      if (held) {
        gsap.killTweensOf(held);
        gsap.set(held, { clearProps: 'transform' });
        held.classList.remove('is-magnetic');
      }
    };
  }, []);
}
