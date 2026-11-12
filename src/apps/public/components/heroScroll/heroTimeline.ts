import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { gsap, ScrollTrigger } from '../../hooks/useGsapReveal';
import { registerSectionScroller, scrollToY, setScrollFeel } from '../../hooks/smoothScroll';
import { setHeaderTheme } from '../../hooks/useHeaderTheme';
import { computeGeometry, fractionAtTop, fractionAtX, lerpPoint, pathFrom, type Rect } from './heroGeometry';
import { FLIGHT_EASE, HEADER_HEIGHT, HERO_COLORS, HERO_SCRIPT, MOUNTAIN_SPREAD, SCRUB, type Span } from './heroScrollConfig';

gsap.registerPlugin(MotionPathPlugin, DrawSVGPlugin);

/**
 * Animación del hero. Se ejecuta dentro de un gsap.matchMedia del componente:
 * todo tween, ScrollTrigger y gsap.set creado aquí se revierte solo al
 * desmontar o al cambiar de breakpoint. Lo que no es de GSAP (clases, eventos,
 * registros) se deshace en la función que devuelve.
 *
 * La historia es un solo vuelo y una sola línea:
 *
 *   1 · El avión espera en el origen.
 *   2 · Despega y sube; la ruta se dibuja detrás de él, con una estela corta.
 *       Atraviesa el wordmark, la bruma se abre a su paso y el wordmark sube.
 *   3 · Baja hacia el destino mientras el número cuenta la huella acumulada.
 *   4 · Llega. Cae la noche, la ruta se enciende y se acomoda bajo el titular,
 *       y la calculadora se abre desde el punto de destino.
 *
 * Antes eran tres caminos distintos (una estela desde arriba, un arco que
 * nacía en el origen cuando el avión ya estaba en el centro, y otro arco para
 * la calculadora): el avión quedaba detenido mientras se cambiaba de uno a otro.
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

const all = <T extends Element = HTMLElement>(root: Element, selector: string) => [...root.querySelectorAll<T>(selector)];

const setPathD = (root: Element, selector: string, d: string | null) => {
  root.querySelectorAll(selector).forEach((el) => el.setAttribute('d', d ?? ''));
};

type MotionOptions = {
  mobile: boolean;
  /** Avance del contador (0-1); el componente lo pinta con el dato real. */
  onCount: (progress: number) => void;
};

/** El avión se detiene justo antes del punto de destino; el resto es el aterrizaje. */
const PLANE_END = 0.94;
/** Largo de la estela que sigue al avión, en fracción de la ruta. */
const TAIL = 0.14;
/** La ruta punteada se dibuja un poco detrás del avión: primero estela, después ruta. */
const ROUTE_LAG = 0.02;
/** Tamaño desde el que se abre la calculadora, respecto del final. */
const CARD_FROM = 0.3;

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
  const dotFrom = q<SVGGElement>(root, '.hs-dot--from');
  const dotTo = q<SVGGElement>(root, '.hs-dot--to');
  // La ruta: el punteado, su máscara (lo que se "dibuja") y el halo.
  const routeDrawn = all<SVGPathElement>(root, '.hs-arc-mask, .hs-arc-halo');
  const routePaths = all<SVGPathElement>(root, '.hs-arc, .hs-arc-mask, .hs-arc-halo');

  // ── Geometría con el layout final (con hs--motion ya aplicado) ──
  const stageBox = stage.getBoundingClientRect();
  const size = { w: stageBox.width, h: stageBox.height };
  const titleRect = relRect(title, stageBox);
  const card = mobile ? null : q(root, '.hs-card');
  const cardRect = card ? relRect(card, stageBox) : null;
  const copyRect = mobile ? null : relRect(q(root, '.hs-land__copy'), stageBox);
  const geo = computeGeometry(size, titleRect, cardRect, mobile, copyRect);

  flight.setAttribute('viewBox', `0 0 ${size.w} ${size.h}`);
  setPathD(root, '.hs-trail, .hs-arc, .hs-arc-halo, .hs-arc-mask', geo.arc);
  const apexAt = fractionAtTop(arc);

  // En qué momento del guion pasa el avión por la fracción `f` de la ruta.
  const flightEase = gsap.parseEase(FLIGHT_EASE);
  const timeAt = (f: number) =>
    at(script.flight) + len(script.flight) * invertEase(flightEase, Math.min(1, f / PLANE_END));
  const tApex = timeAt(apexAt);

  const k = mobile ? 0.6 : 1; // escala del avión según la pantalla

  // ── Estado inicial: el avión, chico, sobre el punto de origen ──
  gsap.set([...routeDrawn, trail], { drawSVG: '0% 0%' });
  gsap.set(dotFrom, { x: geo.from.x, y: geo.from.y, scale: 0, transformOrigin: '50% 50%' });
  gsap.set(dotTo, { x: geo.to.x, y: geo.to.y, scale: 0, transformOrigin: '50% 50%' });
  // El origen alineado a la izquierda de su punto y el destino a la derecha: así
  // nunca se salen de la pantalla, aunque los puntos estén cerca del borde.
  const EDGE = 12;
  gsap.set('.hs-label--from', { x: Math.max(EDGE, geo.from.x - 14), y: geo.from.y + 16, autoAlpha: 0 });
  gsap.set('.hs-label--to', { x: Math.min(size.w - EDGE, geo.to.x + 14), y: geo.to.y + 16, xPercent: -100, autoAlpha: 0 });
  gsap.set('.hs-readout', { autoAlpha: 0 });
  // El arco de aterrizaje aparte ya no se usa con animación: es la misma ruta.
  gsap.set('.hs-land-dot', { autoAlpha: 0 });
  // El camino va como texto y no como elemento: la ruta cambia de forma al
  // final y el avión no debe seguir ese cambio.
  gsap.set(plane, {
    transformOrigin: '50% 50%',
    motionPath: { path: geo.arc, autoRotate: true, start: 0, end: 0 },
  });
  gsap.set(planeBody, { transformOrigin: '50% 50%', scale: 0.32 * k, opacity: 0.55 });

  const pinDistance = () => (window.innerHeight * script.pinVh) / 100;
  // La calculadora recibe clics cuando ya terminó de abrirse.
  const landedAt = script.lineSettle ? at(script.lineSettle) + len(script.lineSettle) * 0.7 : 2;

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
      onUpdate: (self) => root.classList.toggle('hs--landed', self.progress >= landedAt),
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

  // ── 1 · El origen ──
  tl.to(dotFrom, { scale: 1, duration: 0.03, ease: 'back.out(2)' }, at(script.originIn));
  tl.to('.hs-label--from', { autoAlpha: 1, duration: len(script.originIn) }, at(script.originIn));
  tl.to(planeBody, { opacity: 1, duration: len(script.originIn) }, at(script.originIn));

  // ── 2 y 3 · El vuelo: un solo movimiento de origen a destino ──
  const whole = { ease: FLIGHT_EASE, duration: len(script.flight) };
  tl.to(plane, { motionPath: { path: geo.arc, autoRotate: true, start: 0, end: PLANE_END }, ...whole }, at(script.flight));
  // La estela: un tramo corto y difuminado que va pegado al avión.
  tl.to(trail, { drawSVG: `${(PLANE_END - TAIL) * 100}% ${PLANE_END * 100}%`, ...whole }, at(script.flight));
  // La ruta se dibuja apenas detrás: lo que fue estela queda como ruta.
  tl.to(routeDrawn, { drawSVG: `0% ${PLANE_END * 100}%`, ...whole }, at(script.flight) + ROUTE_LAG);
  // Se acerca al subir y se aleja al bajar: el punto más cercano es la cima.
  tl.to(planeBody, { scale: 0.9 * k, ease: 'sine.inOut', duration: tApex - at(script.flight) }, at(script.flight));
  tl.to(planeBody, { scale: 0.62 * k, ease: 'sine.inOut', duration: script.flight[1] - tApex }, tApex);

  tl.to(['.hs-eyebrow', '.hs-sub'], { autoAlpha: 0, y: -12, duration: len(script.introOut) }, at(script.introOut));

  // La bruma se abre al paso del avión: cada elipse cuando él cruza su x, y
  // solo las que tiene delante (las que están más a la izquierda de donde entra
  // a la bruma se van después, con el wordmark).
  const mistBox = relRect(q(root, '.hs-mist'), stageBox);
  const arcLength = arc.getTotalLength();
  const ellipses = all<SVGEllipseElement>(root, '.hs-mist__e').filter(
    (el) => !(mobile && el.classList.contains('hs-mist__e--desktop')),
  );
  ellipses.forEach((el, i) => {
    const x = mistBox.x + (Number(el.dataset.cx) / 1000) * mistBox.w;
    if (x > size.w * 0.5) return; // a la derecha del centro: se van al subir el wordmark
    const fraction = fractionAtX(arc, x);
    const y = arc.getPointAtLength(arcLength * fraction).y;
    if (y < mistBox.y || y > mistBox.y + mistBox.h) return; // ahí el avión todavía vuela por debajo
    tl.to(el, { y: i % 2 ? 80 : -80, opacity: 0.1, duration: 0.09, ease: 'power1.out' }, timeAt(fraction));
  });

  // El wordmark sube cuando el avión ya está dentro de él, llegando a la cima.
  const wordmarkAt = timeAt(apexAt * 0.85);
  const fontSize = parseFloat(getComputedStyle(title).fontSize);
  const targetSize = mobile ? 30 : 44;
  const targetY = size.h * (mobile ? 0.15 : 0.17);
  tl.to(
    wordmark,
    {
      y: targetY - (titleRect.y + titleRect.h / 2),
      scale: targetSize / fontSize,
      opacity: 0.35,
      duration: script.wordmarkUp,
      ease: 'power2.inOut',
    },
    wordmarkAt,
  );
  tl.to(ellipses, { opacity: 0, duration: script.wordmarkUp * 0.6 }, wordmarkAt);

  // El número aparece pasada la cima y cuenta con el vuelo entero: muestra la
  // huella acumulada, así que llega al total justo al aterrizar.
  tl.fromTo('.hs-readout', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: script.readoutIn }, tApex);
  const counter = { p: 0 };
  tl.to(counter, { p: 1, ...whole, onUpdate: () => onCount(counter.p) }, at(script.flight));

  tl.to(dotTo, { scale: 1, duration: 0.03, ease: 'back.out(2)' }, script.flight[1] - 0.03);
  tl.to('.hs-label--to', { autoAlpha: 1, duration: 0.04 }, script.flight[1] - 0.02);

  // ── 4 · Llega al destino y desaparece en él ──
  const landing = len(script.touchdown);
  tl.to(plane, { motionPath: { path: geo.arc, autoRotate: true, start: PLANE_END, end: 1 }, duration: landing }, at(script.touchdown));
  tl.to(planeBody, { opacity: 0, scale: 0.3 * k, duration: landing, ease: 'power1.in' }, at(script.touchdown));
  tl.to(trail, { drawSVG: '100% 100%', duration: landing }, at(script.touchdown));
  tl.to(routeDrawn, { drawSVG: '0% 100%', duration: landing - ROUTE_LAG }, at(script.touchdown) + ROUTE_LAG);

  // Cae la noche. Mientras el cielo se oscurece, la ruta se enciende: siempre
  // queda algo nítido que seguir con la vista.
  const dusk = { duration: len(script.darken), ease: 'power1.inOut' };
  tl.to(['.hs-night', '.hs-mtn__night'], { opacity: 1, ...dusk }, at(script.darken));
  // Los casquetes asoman fuera de la silueta: de noche se apagan.
  tl.to('.hs-mtn__snow', { opacity: 0, ...dusk }, at(script.darken));
  tl.to('.hs-stars', { opacity: 1, duration: len(script.darken) * 0.6 }, at(script.darken) + len(script.darken) * 0.4);
  tl.to(['.hs-readout', '.hs-label', wordmark], { autoAlpha: 0, duration: len(script.routeOut) }, at(script.routeOut));
  // El halo blanco sirve sobre el cielo claro; de noche se veía como un tubo
  // grueso, así que se apaga y queda solo el punteado.
  tl.to('.hs-arc-halo', { opacity: 0, duration: len(script.darken) * 0.4 }, at(script.darken));

  if (script.lineSettle && geo.settlePts && card && cardRect) {
    // Escritorio: la ruta se queda y cambia de color.
    tl.to(arc, { stroke: HERO_COLORS.routeOnDark, ...dusk }, at(script.darken));
    tl.to(all(root, '.hs-dot__core'), { fill: HERO_COLORS.routeOnDark, ...dusk }, at(script.darken));

    // La misma línea se acomoda bajo el titular. Se interpola punto a punto
    // entre el arco del vuelo y su forma de reposo, y los dos puntos (origen y
    // destino) viajan con sus extremos.
    const settlePts = geo.settlePts;
    const settle = { m: 0 };
    const paintLine = () => {
      const pts = geo.arcPts.map((p, i) => lerpPoint(p, settlePts[i], settle.m));
      const d = pathFrom(pts);
      routePaths.forEach((path) => path.setAttribute('d', d));
      // La ruta ya está dibujada entera. El guion la midió con su largo de
      // vuelo; al cambiar de forma cambia de largo y esa medida dejaría un
      // tramo sin dibujar.
      if (settle.m > 0) routeDrawn.forEach((path) => { path.style.strokeDasharray = 'none'; });
      gsap.set(dotFrom, { x: pts[0].x, y: pts[0].y });
      gsap.set(dotTo, { x: pts[6].x, y: pts[6].y });
    };
    const unfold = { duration: len(script.lineSettle), ease: 'power2.inOut' };
    tl.to(settle, { m: 1, ...unfold, onUpdate: paintLine }, at(script.lineSettle));

    // La calculadora se abre desde el punto de destino, al mismo ritmo con el
    // que el extremo de la ruta se corre hacia su costado.
    gsap.set(card, { transformOrigin: `${geo.to.x - cardRect.x}px ${geo.to.y - cardRect.y}px` });
    tl.fromTo(card, { autoAlpha: 0, scale: CARD_FROM }, { autoAlpha: 1, scale: 1, ...unfold }, at(script.lineSettle));
  } else {
    // Móvil: la calculadora va debajo, así que la ruta se va con el cielo.
    tl.to([...routePaths, dotFrom, dotTo], { autoAlpha: 0, duration: len(script.routeOut) }, at(script.routeOut));
  }

  if (script.landingIn) {
    tl.from('.hs-land__copy > *', { autoAlpha: 0, y: 24, stagger: 0.012, duration: len(script.landingIn) - 0.04 }, at(script.landingIn));
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

  // ── "Calcula tu huella" y el foco por teclado llevan a la escena final ──
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
    // La forma y el trazo de la ruta se escribieron a mano, fuera de GSAP.
    setPathD(root, '.hs-trail, .hs-arc, .hs-arc-halo, .hs-arc-mask', null);
    routeDrawn.forEach((path) => path.style.removeProperty('stroke-dasharray'));
    setHeaderTheme('light');
  };
}

/**
 * prefers-reduced-motion: sin pin ni scrub. Se muestra directo la escena final
 * (cielo de noche, montañas y calculadora) con la ruta ya en su forma de reposo.
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
