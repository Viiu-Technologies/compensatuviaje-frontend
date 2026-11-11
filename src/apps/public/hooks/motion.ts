import { gsap, ScrollTrigger } from './useGsapReveal';

// ── Primitivas de movimiento del landing ────────────────────────────────────
// Cada sección elige un movimiento propio en vez de repetir "sube y aparece".
// Todas se llaman dentro de useGsapReveal: así los selectores quedan acotados a
// la sección, se limpian al desmontar y no corren con prefers-reduced-motion
// (el contenido ya es visible y los fondos quedan en su estado final).

export type Side = 'left' | 'right';

/**
 * Entrada lateral, para la línea de tiempo de la sección:
 *   tl.add(enterFrom('.cs-form', 'left'), 0.2)
 * Con `rotationY` en `vars` la pieza gira hacia el frente mientras entra.
 */
export function enterFrom(targets: gsap.TweenTarget, side: Side, vars: gsap.TweenVars = {}) {
  const dir = side === 'left' ? -1 : 1;
  return gsap.from(targets, {
    x: 48 * dir,
    autoAlpha: 0,
    duration: 0.7,
    ease: 'power3.out',
    transformPerspective: 900,
    ...vars,
  });
}

/**
 * Ata una propiedad al paso de la sección por la pantalla (de que asoma por
 * abajo a que sale por arriba). Sirve para fondos que evolucionan con el scroll.
 */
export function scrubThrough(
  target: gsap.TweenTarget,
  trigger: Element,
  from: gsap.TweenVars,
  to: gsap.TweenVars,
) {
  return gsap.fromTo(target, from, {
    ...to,
    ease: 'none',
    scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

/** Desplazamiento vertical más lento que el scroll (capas de fondo). */
export function parallax(target: gsap.TweenTarget, trigger: Element, distance: number) {
  return scrubThrough(target, trigger, { y: -distance }, { y: distance });
}

/**
 * Placa de fondo que se abre con el scroll: llega como una tarjeta de esquinas
 * redondeadas y termina a sangre cuando la sección ocupa la pantalla. El
 * contenido debe quedar dentro del recorte inicial (el relleno de la sección
 * es mayor que los 40 px de margen).
 */
export function expandPlate(plate: gsap.TweenTarget, trigger: Element) {
  return gsap.fromTo(
    plate,
    { clipPath: 'inset(40px 3vw round 40px)' },
    {
      clipPath: 'inset(0px 0vw round 0px)',
      ease: 'none',
      scrollTrigger: { trigger, start: 'top 95%', end: 'top 40%', scrub: 0.4 },
    },
  );
}

/**
 * Cartillas apiladas. Las tarjetas son `position: sticky` (lo pone el CSS de
 * la sección, con un `top` escalonado): cada una queda fija y la siguiente la
 * cubre. Esto agrega la profundidad: por cada tarjeta que llega encima, las de
 * abajo se achican desde su borde superior y se apagan un poco, con la variable
 * `--stack-dim` (0 a 1) que el CSS usa para un velo.
 *
 * El avance se lee de la posición real de cada tarjeta en cada cuadro, no de
 * posiciones guardadas: un elemento sticky cambia de lugar al quedar fijo y un
 * ScrollTrigger por tarjeta mediría mal si se recalcula en ese momento.
 *
 * Devuelve la limpieza. Llamar dentro de un gsap.matchMedia con la misma
 * condición que activa el sticky en el CSS.
 */
export function stackCards(cards: HTMLElement[], list: Element) {
  const SHRINK = 0.045;
  const DIM = 0.5;
  const tops = cards.map((card) => parseFloat(getComputedStyle(card).top) || 0);

  const update = () => {
    const vh = window.innerHeight;
    // Cuánto llegó cada tarjeta: 0 al asomar por abajo, 1 al quedar fija.
    const arrived = cards.map((card, i) =>
      gsap.utils.clamp(0, 1, (vh - card.getBoundingClientRect().top) / (vh - tops[i])),
    );
    cards.forEach((card, i) => {
      let covered = 0;
      for (let j = i + 1; j < cards.length; j++) covered += arrived[j];
      gsap.set(card, { scale: 1 - SHRINK * covered, '--stack-dim': DIM * covered });
    });
  };

  const trigger = ScrollTrigger.create({
    trigger: list,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: update,
    onRefresh: update,
  });
  update();

  return () => {
    trigger.kill();
    gsap.set(cards, { clearProps: 'scale,--stack-dim' });
  };
}

/**
 * Tramo horizontal: mientras la sección cruza la pantalla, la fila de tarjetas
 * (`track`) se desliza de lado dentro de su ventana (`rail`).
 *
 * No usa el pin de ScrollTrigger: el CSS deja fijo el contenido con
 * `position: sticky` y le da a la sección un alto de 100vh + el recorrido, que
 * esta función publica en `--rail-travel`. Así el alto de la página no depende
 * de que el JS haya corrido y no hay saltos al montar secciones de arriba.
 *
 * `onProgress` recibe el avance (0 a 1). `withItems` recibe el tween del
 * recorrido, para atar animaciones al paso de cada tarjeta por la pantalla
 * (ScrollTrigger con `containerAnimation`); puede devolver su limpieza.
 * Devuelve la limpieza de todo.
 */
export function horizontalRail(
  section: HTMLElement,
  rail: HTMLElement,
  track: HTMLElement,
  onProgress?: (progress: number) => void,
  withItems?: (containerAnimation: gsap.core.Tween) => (() => void) | void,
) {
  const travel = () => Math.max(0, track.offsetWidth - rail.clientWidth);
  const publish = () => section.style.setProperty('--rail-travel', `${travel()}px`);
  publish();

  const tween = gsap.to(track, {
    x: () => -travel(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      invalidateOnRefresh: true,
      onRefreshInit: publish,
      onUpdate: (self) => onProgress?.(self.progress),
      onRefresh: (self) => onProgress?.(self.progress),
    },
  });

  // Las tarjetas llegan después (API, imágenes): el recorrido cambia con ellas.
  let last = travel();
  const observer = new ResizeObserver(() => {
    const next = travel();
    if (Math.abs(next - last) < 1) return;
    last = next;
    publish();
    ScrollTrigger.refresh();
  });
  observer.observe(track);
  observer.observe(rail);

  const stopItems = withItems?.(tween);

  return () => {
    if (typeof stopItems === 'function') stopItems();
    observer.disconnect();
    tween.scrollTrigger?.kill();
    tween.kill();
    gsap.set(track, { clearProps: 'transform' });
    section.style.removeProperty('--rail-travel');
  };
}
