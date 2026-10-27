import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { gsap, ScrollTrigger } from '../../hooks/useGsapReveal';
import { registerSectionScroller, scrollToY, setScrollFeel } from '../../hooks/smoothScroll';
import { setHeaderTheme } from '../../hooks/useHeaderTheme';
import { computeGeometry, fractionAtTop, fractionAtX, type Rect } from './heroGeometry';
import { HEADER_HEIGHT, HERO_SCRIPT, MOUNTAIN_SPREAD, SCRUB, type Span } from './heroScrollConfig';

gsap.registerPlugin(MotionPathPlugin, DrawSVGPlugin);

/**
 * Animación del hero. Se ejecuta dentro de un gsap.matchMedia del componente:
 * todo tween, ScrollTrigger y gsap.set creado aquí se revierte solo al
 * desmontar o al cambiar de breakpoint. Lo que no es de GSAP (clases, eventos,
 * registros) se deshace en la función que devuelve.
 */

const at = (span: Span) => span[0];
const len = (span: Span) => span[1] - span[0];

/** Rect de `el` relativo a `origin`, en px. */
const relRect = (el: Element, origin: DOMRect): Rect => {
  const r = el.getBoundingClientRect();
  return { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height };
};

/** Inversa numérica de una curva de easing: en qué tiempo alcanza `value`. */
const invertEase = (ease: (t: number) => number, value: number) => {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (ease(mid) < value) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

const q = <T extends Element = HTMLElement>(root: Element, selector: string) => {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`HeroScroll: falta ${selector}`);
  return el;
};

const setPathD = (root: Element, selector: string, d: string | null) => {
  root.querySelectorAll(selector).forEach((el) => el.setAttribute('d', d ?? ''));
};

type MotionOptions = {
  mobile: boolean;
  /** Avance del contador (0-1); el componente lo pinta con el dato real. */
  onCount: (progress: number) => void;
};

export function setupHeroMotion(root: HTMLElement, { mobile, onCount }: MotionOptions) {
  const script = HERO_SCRIPT[mobile ? 'mobile' : 'desktop'];
  root.classList.add('hs--motion');

  const stage = q(root, '.hs-stage');
  const flight = q<SVGSVGElement>(root, '.hs-flight');
  const land = q(root, '.hs-land');
  const trail = q<SVGPathElement>(root, '.hs-trail');
  const arc = q<SVGPathElement>(root, '.hs-arc');
  const plane = q<SVGGElement>(root, '.hs-plane');
  const planeBody = q<SVGGElement>(root, '.hs-plane__body');
  const wordmark = q(root, '.hs-wm');
  const title = q(root, '.hs-wm__title');

  // ── Geometría con el layout final (con hs--motion ya aplicado) ──
  const stageBox = stage.getBoundingClientRect();
  const size = { w: stageBox.width, h: stageBox.height };
  const titleRect = relRect(title, stageBox);
  const cardRect = mobile ? null : relRect(q(root, '.hs-card'), stageBox);
  const copyRect = mobile ? null : relRect(q(root, '.hs-land__copy'), stageBox);
  const geo = computeGeometry(size, titleRect, cardRect, mobile, copyRect);

  flight.setAttribute('viewBox', `0 0 ${size.w} ${size.h}`);
  setPathD(root, '.hs-trail', geo.crossing);
  setPathD(root, '.hs-arc, .hs-arc-halo, .hs-arc-mask', geo.arc);
  setPathD(root, '.hs-land-arc, .hs-land-mask', geo.landing);
  const apexAt = fractionAtTop(arc);
  const apexPct = `${(apexAt * 100).toFixed(2)}%`;
  const PLANE_END = 0.94; // el avión se detiene justo antes del punto de LIM

  const k = mobile ? 0.6 : 1; // escala del avión según la pantalla

  // ── Estado inicial (escena 1) ──
  gsap.set([trail, '.hs-arc-mask', '.hs-arc-halo', '.hs-land-mask'], { drawSVG: '0% 0%' });
  gsap.set('.hs-dot--from', { x: geo.from.x, y: geo.from.y, scale: 0, transformOrigin: '50% 50%' });
  gsap.set('.hs-dot--to', { x: geo.to.x, y: geo.to.y, scale: 0, transformOrigin: '50% 50%' });
  // SCL alineada a la izquierda de su punto y LIM a la derecha: así nunca se
  // salen de la pantalla, aunque los puntos estén cerca del borde.
  const EDGE = 12;
  gsap.set('.hs-label--from', { x: Math.max(EDGE, geo.from.x - 14), y: geo.from.y + 16, autoAlpha: 0 });
  gsap.set('.hs-label--to', { x: Math.min(size.w - EDGE, geo.to.x + 14), y: geo.to.y + 16, xPercent: -100, autoAlpha: 0 });
  gsap.set('.hs-readout', { autoAlpha: 0 });
  gsap.set('.hs-land-dot', { autoAlpha: 0 });
  if (geo.landingFrom) gsap.set('.hs-land-dot', { attr: { cx: geo.landingFrom.x, cy: geo.landingFrom.y } });
  gsap.set(plane, {
    transformOrigin: '50% 50%',
    motionPath: { path: trail, autoRotate: true, start: 0, end: 0 },
  });
  gsap.set(planeBody, { transformOrigin: '50% 50%', scale: 0.35 * k, opacity: 0.45 });

  const pinDistance = () => (window.innerHeight * script.pinVh) / 100;

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: mobile ? stage : root,
      pin: mobile ? stage : root,
      start: 'top top',
      end: () => `+=${pinDistance()}`,
      scrub: SCRUB,
      anticipatePin: 1,
      // Dentro del pin la rueda va más lenta: bajar rápido no se salta la animación.
      onToggle: (self) => setScrollFeel(self.isActive ? 'slow' : 'normal'),
      onUpdate: (self) => {
        // La escena 4 (escritorio) recibe clics recién cuando la card ya llegó.
        if (script.cardIn) root.classList.toggle('hs--landed', self.progress >= script.cardIn[0]);
      },
    },
  });
  // La línea de tiempo dura exactamente 1: los tramos del guion son fracciones del pin.
  tl.set({}, {}, 1);

  // ── Montañas: bajan con parallax y se abren hacia los lados como un telón,
  // más rápido las cercanas ──
  root.querySelectorAll<HTMLElement>('.hs-mtn').forEach((layer, i) => {
    tl.to(layer, { yPercent: [2, 5, 9, 14][i] ?? 6, duration: 1 }, 0);
    // En reposo las dos mitades forman la cordillera completa (ver Mountains.tsx).
    const spread = size.w * (MOUNTAIN_SPREAD[i] ?? 0.1);
    const halves = { duration: len(script.mountainsOpen), ease: 'power1.inOut' };
    tl.to(layer.querySelector('.hs-mtn__half--l'), { x: -spread, ...halves }, at(script.mountainsOpen));
    tl.to(layer.querySelector('.hs-mtn__half--r'), { x: spread, ...halves }, at(script.mountainsOpen));
  });

  // ── Escena 1: el avión asoma arriba a la izquierda ──
  tl.to(planeBody, { scale: 0.55 * k, opacity: 0.9, duration: len(script.approach) }, at(script.approach));

  // ── Escena 2: cruza el wordmark dejando la estela ──
  const crossEase = 'power1.in';
  tl.to(
    plane,
    { motionPath: { path: trail, autoRotate: true }, ease: crossEase, duration: len(script.crossing) },
    at(script.crossing),
  );
  tl.to(trail, { drawSVG: '0% 100%', ease: crossEase, duration: len(script.crossing) }, at(script.crossing));
  tl.to(
    planeBody,
    { scale: 0.85 * k, opacity: 1, duration: script.crossing[1] - script.approach[1] },
    script.approach[1],
  );
  tl.to(['.hs-eyebrow', '.hs-sub'], { autoAlpha: 0, y: -12, duration: len(script.introOut) }, at(script.introOut));

  // La bruma se abre detrás del avión: cada elipse cuando el avión pasa por su x.
  const mistBox = relRect(q(root, '.hs-mist'), stageBox);
  const easeFn = gsap.parseEase(crossEase);
  const ellipses = [...root.querySelectorAll<SVGEllipseElement>('.hs-mist__e')].filter(
    (el) => !(mobile && el.classList.contains('hs-mist__e--desktop')),
  );
  ellipses.forEach((el, i) => {
    const x = mistBox.x + (Number(el.dataset.cx) / 1000) * mistBox.w;
    if (x > size.w * 0.5) return; // a la derecha del centro: se van al subir el wordmark
    const t = at(script.crossing) + len(script.crossing) * invertEase(easeFn, fractionAtX(trail, x));
    tl.to(el, { y: i % 2 ? 80 : -80, opacity: 0.1, duration: 0.09, ease: 'power1.out' }, t);
  });

  // ── Escena 3: el wordmark sube, la estela se vuelve ruta ──
  const fontSize = parseFloat(getComputedStyle(title).fontSize);
  const targetSize = mobile ? 30 : 44;
  const targetY = size.h * (mobile ? 0.15 : 0.17);
  tl.to(
    wordmark,
    {
      y: targetY - (titleRect.y + titleRect.h / 2),
      scale: targetSize / fontSize,
      opacity: 0.35,
      duration: len(script.wordmarkUp),
      ease: 'power2.inOut',
    },
    at(script.wordmarkUp),
  );
  tl.to(ellipses, { opacity: 0, duration: len(script.wordmarkUp) * 0.6 }, at(script.wordmarkUp));

  tl.to(trail, { opacity: 0, duration: len(script.trailToArc) }, at(script.trailToArc));
  tl.to(['.hs-arc-mask', '.hs-arc-halo'], { drawSVG: `0% ${apexPct}`, duration: len(script.trailToArc) }, at(script.trailToArc));
  tl.to('.hs-dot--from', { scale: 1, duration: 0.03, ease: 'back.out(2)' }, at(script.trailToArc));
  tl.to('.hs-label--from', { autoAlpha: 1, duration: 0.04 }, at(script.trailToArc) + 0.02);

  tl.to(
    plane,
    { motionPath: { path: arc, autoRotate: true, start: apexAt, end: PLANE_END }, duration: len(script.planeToDest) },
    at(script.planeToDest),
  );
  tl.to(
    ['.hs-arc-mask', '.hs-arc-halo'],
    { drawSVG: `0% ${PLANE_END * 100}%`, duration: len(script.planeToDest) },
    at(script.planeToDest),
  );
  tl.to('.hs-dot--to', { scale: 1, duration: 0.03, ease: 'back.out(2)' }, script.planeToDest[1] - 0.03);
  tl.to('.hs-label--to', { autoAlpha: 1, duration: 0.04 }, script.planeToDest[1] - 0.02);

  tl.fromTo('.hs-readout', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: len(script.readoutIn) }, at(script.readoutIn));
  const counter = { p: 0 };
  tl.to(
    counter,
    { p: 1, duration: len(script.countUp), ease: 'power2.out', onUpdate: () => onCount(counter.p) },
    at(script.countUp),
  );

  // ── Escena 4: cae la noche, se va la ruta y aparece la calculadora ──
  tl.to(['.hs-night', '.hs-mtn__night'], { opacity: 1, duration: len(script.darken) }, at(script.darken));
  // Los casquetes asoman fuera de la silueta: de noche se apagan.
  tl.to('.hs-mtn__snow', { opacity: 0, duration: len(script.darken) }, at(script.darken));
  tl.to(
    ['.hs-readout', '.hs-label', wordmark, '.hs-dot', '.hs-arc', '.hs-arc-halo'],
    { autoAlpha: 0, duration: len(script.routeOut) },
    at(script.routeOut),
  );
  // El avión aterriza en LIM y desaparece.
  tl.to(
    plane,
    { motionPath: { path: arc, autoRotate: true, start: PLANE_END, end: 1 }, duration: len(script.routeOut) },
    at(script.routeOut),
  );
  tl.to(planeBody, { opacity: 0, scale: 0.5 * k, duration: len(script.routeOut) }, at(script.routeOut));

  if (script.landingArc) {
    tl.to('.hs-land-mask', { drawSVG: '0% 100%', duration: len(script.landingArc), ease: 'power1.inOut' }, at(script.landingArc));
    tl.to('.hs-land-dot', { autoAlpha: 1, duration: 0.03 }, at(script.landingArc));
  }
  if (script.landingIn) {
    tl.from('.hs-land__copy > *', { autoAlpha: 0, y: 24, stagger: 0.012, duration: len(script.landingIn) - 0.04 }, at(script.landingIn));
  }
  if (script.cardIn) {
    tl.from('.hs-card', { autoAlpha: 0, y: 32, scale: 0.98, duration: len(script.cardIn), ease: 'power2.out' }, at(script.cardIn));
  }

  // ── Header sobre la escena oscura ──
  const main = tl.scrollTrigger!;
  let darkStage = false;
  let darkLand = false;
  const paintHeader = () => setHeaderTheme(darkStage || darkLand ? 'dark' : 'light');

  // Lo pinneado (todo el hero en escritorio, solo el cielo en móvil) queda
  // quieto durante el pin y después sube entero: el header está encima de él
  // hasta que su borde inferior pasa por debajo del header. El rango se toma
  // del pin principal: un trigger sobre el mismo elemento pinneado empezaría
  // después del pin (ScrollTrigger le suma el espacio que el pin reserva).
  const pinned = mobile ? stage : root;
  ScrollTrigger.create({
    start: () => main.start,
    end: () => main.end + pinned.offsetHeight - HEADER_HEIGHT,
    onUpdate: (self) => {
      darkStage = self.scroll() - main.start >= (main.end - main.start) * script.darkHeaderAt;
      paintHeader();
    },
    onToggle: (self) => {
      if (!self.isActive) darkStage = false;
      paintHeader();
    },
  });
  if (mobile) {
    // En móvil la calculadora va debajo del cielo, en el flujo normal.
    ScrollTrigger.create({
      trigger: land,
      start: `top top+=${HEADER_HEIGHT}`,
      end: `bottom top+=${HEADER_HEIGHT}`,
      onToggle: (self) => {
        darkLand = self.isActive;
        paintHeader();
      },
    });
  }

  // ── "Calcula tu huella" y el foco por teclado llevan a la escena 4 ──
  const goToCalculator = (behavior: ScrollBehavior) => {
    if (mobile) scrollToY(land.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT, behavior);
    else scrollToY(main.end, behavior);
  };
  const unregister = registerSectionScroller('calculadora', goToCalculator);

  // Si el foco entra a la calculadora mientras aún no se ve (Tab), se salta a ella.
  const onFocusIn = () => {
    if (!mobile && main.progress < 0.99) goToCalculator('auto');
  };
  land.addEventListener('focusin', onFocusIn);

  if (main.isActive) setScrollFeel('slow');

  return () => {
    unregister();
    setScrollFeel('normal');
    land.removeEventListener('focusin', onFocusIn);
    root.classList.remove('hs--motion', 'hs--landed');
    setHeaderTheme('light');
  };
}

/**
 * prefers-reduced-motion: sin pin ni scrub. Se muestra directo la escena 4
 * (cielo de noche, montañas y calculadora) con el arco punteado ya trazado.
 */
export function setupHeroReduced(root: HTMLElement, { mobile }: { mobile: boolean }) {
  root.classList.add('hs--reduced');
  const flight = q<SVGSVGElement>(root, '.hs-flight');
  const land = q(root, '.hs-land');
  const card = q(root, '.hs-card');

  const box = root.getBoundingClientRect();
  if (!mobile) {
    const geo = computeGeometry(
      { w: box.width, h: box.height },
      relRect(q(root, '.hs-wm__title'), box),
      relRect(card, box),
      false,
      relRect(q(root, '.hs-land__copy'), box),
    );
    flight.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    setPathD(root, '.hs-land-arc, .hs-land-mask', geo.landing);
    if (geo.landingFrom) gsap.set('.hs-land-dot', { attr: { cx: geo.landingFrom.x, cy: geo.landingFrom.y } });
  }

  ScrollTrigger.create({
    trigger: land,
    start: `top top+=${HEADER_HEIGHT}`,
    end: `bottom top+=${HEADER_HEIGHT}`,
    onToggle: (self) => setHeaderTheme(self.isActive ? 'dark' : 'light'),
  });

  const unregister = registerSectionScroller('calculadora', (behavior) =>
    scrollToY(card.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT - 16, behavior),
  );

  return () => {
    unregister();
    root.classList.remove('hs--reduced');
    setPathD(root, '.hs-land-arc, .hs-land-mask', null);
    setHeaderTheme('light');
  };
}
