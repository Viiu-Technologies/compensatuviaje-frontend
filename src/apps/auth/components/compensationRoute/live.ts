// Parte animada de "La ruta de tu compensación": un bucle que mueve el paquete
// por la cinta y, según dónde está, la aguja de la báscula, la lupa, la
// compuerta, el troquel y el bloque nuevo del riel. Solo escribe atributos.
import { translateAlong } from '../../../../shared/iso/iso-kit.ts';
import { needleAt } from './art.ts';
import { describe, DWELL, LAST_DWELL, readoutOf, STEPS, type Trip } from './model.ts';
import {
  BOX_TOP, CLEAT, DIE_REST, DIE_STRIKE, GANTRY_X, GATE_LIFT, GATE_LOW, GATE_T, GATE_X, LOUPE_DROP, NEW_BLOCK_FROM, NEW_BLOCK_X, P,
  PALLET, PRESS_X, slotOf, STATION_X, WEIGH,
} from './view.ts';

const HALF = PALLET.w / 2;
const STROKE = DIE_REST - DIE_STRIKE;
/** Altura mínima de la hoja para que pase el paquete, con 1 unidad de holgura. */
const GATE_CLEAR = BOX_TOP + 1 - GATE_LOW;
/** Tramo de x en el que el palé cruzaría el plano de la compuerta. */
const GATE_ZONE: [number, number] = [GATE_X - GATE_T / 2 - HALF - 0.6, GATE_X + GATE_T / 2 + HALF + 0.6];
/** Desde aquí el palé ya no se superpone en pantalla con la hoja de la compuerta. */
const GATE_CLOSE_X = 81;
/** Golpe de la prensa: baja, espera sobre la tapa y sube (segundos). */
const DOWN = 0.32;
const DWELL_DOWN = 0.16;
const UP = 0.42;
const STRIKE = DOWN + DWELL_DOWN + UP;
/** Velocidad máxima de la cinta, en unidades por segundo. */
const MAX_SPEED = 120;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const follow = (value: number, target: number, dt: number, tau: number) => {
  const next = value + (target - value) * (1 - Math.exp(-dt / tau));
  return Math.abs(target - next) < 0.01 ? target : next;
};
const nearest = (x: number) =>
  STATION_X.reduce((best, sx, i) => (Math.abs(sx - x) < Math.abs(STATION_X[best] - x) ? i : best), 0);
/** Fracción del palé sobre el tramo que pesa. */
const loadAt = (x: number) => clamp((Math.min(x + HALF, WEIGH[1]) - Math.max(x - HALF, WEIGH[0])) / (HALF * 2), 0, 1);
/** Perfil del golpe de la prensa en función de su edad, 0..1 de carrera. */
const strikeAt = (age: number) => {
  if (age <= 0 || age >= STRIKE) return 0;
  if (age < DOWN) return smooth(age / DOWN);
  if (age < DOWN + DWELL_DOWN) return 1;
  return 1 - smooth((age - DOWN - DWELL_DOWN) / UP);
};

/** Pose de reposo en una etapa: lo que se ve sin animación (y con movimiento reducido). */
export function restPose(step: number) {
  const x = STATION_X[step];
  return {
    x,
    belt: ((x % CLEAT) + CLEAT) % CLEAT,
    load: loadAt(x),
    drop: step === 1 ? LOUPE_DROP : 0,
    scanning: step === 1,
    lift: step === 2 ? GATE_LIFT : 0,
    paid: step >= 2,
    stroke: 0,
    seal: step === 3 ? 1 : 0,
    block: step === 3 ? 0 : NEW_BLOCK_FROM - NEW_BLOCK_X,
  };
}

export function mountCompensationRoute(stage: HTMLElement, readout: HTMLElement | null, trip: Trip | null, startStep = 0) {
  const svg = stage.querySelector('svg')!;
  const part = <T extends Element>(name: string) => svg.querySelector<T>(`[data-part="${name}"]`)!;
  const parcel = part<SVGGElement>('parcel');
  const cleats = part<SVGGElement>('cleats');
  const needle = part<SVGPathElement>('needle');
  const loupe = part<SVGGElement>('loupe');
  const scanLamp = part<SVGGElement>('scan-lamp');
  const gate = part<SVGGElement>('gate');
  const payLamp = part<SVGGElement>('pay-lamp');
  const ram = part<SVGGElement>('ram');
  const seal = part<SVGGElement>('seal');
  const block = part<SVGGElement>('block');
  const slots = [...svg.querySelectorAll<SVGGElement>('[data-slot]')];
  const still = matchMedia('(prefers-reduced-motion: reduce)');

  const rest = restPose(startStep);
  const s = {
    x: rest.x,
    target: startStep,
    needle: { at: rest.load, rate: 0 },
    drop: rest.drop,
    lift: rest.lift,
    seal: rest.seal,
    block: rest.block,
    /** Edad del golpe en curso; NaN si no hay golpe. */
    strike: NaN,
    stamped: startStep === 3,
  };
  let frame = 0, last = 0, clock = startStep * DWELL, visible = false, touring = !still.matches, idle = 0;
  let slot = -1, said = '', described = '', drawn = '';

  // Recorrido automático: 1 → 2 → 3 → 4 y de vuelta al inicio.
  const tourLength = DWELL * (STEPS.length - 1) + LAST_DWELL;
  const tourAt = (t: number) => {
    const phase = t % tourLength;
    return Math.min(STEPS.length - 1, Math.floor(phase / DWELL));
  };

  function draw() {
    const stroke = strikeAt(s.strike) * STROKE;
    const key = [s.x, s.needle.at, s.drop, s.lift, stroke, s.seal, s.block].map((v) => v.toFixed(2)).join('|');
    if (key !== drawn) {
      drawn = key;
      parcel.setAttribute('transform', translateAlong(P, [s.x, 0, 0]));
      const belt = ((s.x % CLEAT) + CLEAT) % CLEAT;
      cleats.setAttribute('transform', translateAlong(P, [belt, 0, 0]));
      const behind = slotOf(s.x);
      if (behind !== slot) { slots[behind].appendChild(parcel); slot = behind; }
      needle.setAttribute('d', needleAt(s.needle.at));
      loupe.setAttribute('transform', translateAlong(P, [0, 0, -s.drop]));
      gate.setAttribute('transform', translateAlong(P, [0, 0, s.lift]));
      ram.setAttribute('transform', translateAlong(P, [0, 0, -stroke]));
      seal.setAttribute('opacity', s.seal.toFixed(2));
      block.setAttribute('transform', translateAlong(P, [s.block, 0, 0]));
    }
    scanLamp.setAttribute('data-tone', Math.abs(s.x - GANTRY_X) < 1 ? 'hi' : 'lo');
    payLamp.setAttribute('data-tone', s.x >= STATION_X[2] - 1 ? 'hi' : 'lo');
    const text = readoutOf(nearest(s.x), trip);
    if (readout && text !== said) { readout.textContent = text; said = text; }
  }

  // El texto accesible cambia cuando cambia la elección, no en cada cuadro.
  function announce() {
    const text = describe(s.target, trip);
    if (text !== described) {
      stage.setAttribute('aria-valuetext', text);
      stage.setAttribute('aria-valuenow', String(s.target + 1));
      described = text;
    }
  }

  function tick(now: number) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    const calm = still.matches;
    if (touring) {
      clock += dt;
      s.target = tourAt(clock);
    }
    const goal = STATION_X[s.target];

    // Paquete: la cinta acelera y frena con suavidad, con tope de velocidad; no
    // se mueve mientras el troquel está abajo y espera a que suba la compuerta.
    const striking = !Number.isNaN(s.strike);
    if (calm) s.x = goal;
    else if (!striking) {
      const want = follow(s.x, goal, dt, 0.42);
      s.x += clamp(want - s.x, -MAX_SPEED * dt, MAX_SPEED * dt);
      if (s.lift < GATE_CLEAR) {
        const [a, b] = GATE_ZONE;
        if (goal > s.x && s.x <= a) s.x = Math.min(s.x, a);
        if (goal < s.x && s.x >= b) s.x = Math.max(s.x, b);
      }
      // A 0,3 unidades (0,3 px) encaja: la cola exponencial tardaría segundos en llegar.
      if (Math.abs(goal - s.x) < 0.3) s.x = goal;
    }

    // Báscula: la aguja sigue la carga con un resorte que se pasa una vez.
    const load = loadAt(s.x);
    if (calm) { s.needle.at = load; s.needle.rate = 0; }
    else {
      for (let i = 0; i < 4; i++) {
        s.needle.rate += ((load - s.needle.at) * 160 - s.needle.rate * 14) * (dt / 4);
        s.needle.at += s.needle.rate * (dt / 4);
      }
      if (Math.abs(load - s.needle.at) < 5e-4 && Math.abs(s.needle.rate) < 5e-4) { s.needle.at = load; s.needle.rate = 0; }
    }

    // Pórtico: la lupa baja cuando el paquete está debajo.
    const inspecting = Math.abs(s.x - GANTRY_X) < 1;
    s.drop = calm ? (inspecting ? LOUPE_DROP : 0) : follow(s.drop, inspecting ? LOUPE_DROP : 0, dt, 0.3);

    // Compuerta: sube cuando el paquete llega a pagar o tiene que cruzarla.
    // No baja hasta que el palé sale de su silueta en pantalla (x > 80): la hoja
    // se pinta delante del paquete, y bajando detrás de él lo taparía.
    const nearGate = s.x > STATION_X[2] - 16 && s.x < GATE_CLOSE_X && (s.target >= 2 || s.x > STATION_X[2] - 1);
    s.lift = calm ? (nearGate ? GATE_LIFT : 0) : follow(s.lift, nearGate ? GATE_LIFT : 0, dt, 0.18);

    // Prensa: un golpe al llegar a la cuarta estación; el sello aparece al tocar la tapa.
    const atPress = Math.abs(s.x - PRESS_X) < 0.05;
    if (atPress && !s.stamped && Number.isNaN(s.strike)) s.strike = calm ? STRIKE : 0;
    if (!Number.isNaN(s.strike)) {
      s.strike += dt;
      if (s.strike >= DOWN) s.stamped = true;
      if (s.strike >= STRIKE) s.strike = NaN;
    }
    if (s.x < PRESS_X - 14) s.stamped = false;
    const sealTo = s.stamped ? 1 : 0;
    s.seal = calm ? sealTo : follow(s.seal, sealTo, dt, 0.12);
    // El bloque nuevo sale de la prensa después del sello y vuelve si el paquete se va.
    const blockTo = s.stamped && (Number.isNaN(s.strike) || s.strike > DOWN + 0.2) ? 0 : NEW_BLOCK_FROM - NEW_BLOCK_X;
    s.block = calm ? blockTo : follow(s.block, blockTo, dt, 0.45);

    draw();
    const settled = !touring && s.x === goal && s.needle.rate === 0 && s.needle.at === load
      && Number.isNaN(s.strike) && s.drop === (inspecting ? LOUPE_DROP : 0) && s.lift === (nearGate ? GATE_LIFT : 0)
      && s.seal === sealTo && s.block === blockTo;
    frame = visible && !settled ? requestAnimationFrame(tick) : 0;
  }

  const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
  const steer = (step: number) => {
    touring = false;
    s.target = clamp(step, 0, STEPS.length - 1);
    announce();
    clearTimeout(idle);
    idle = window.setTimeout(() => { touring = !still.matches; clock = s.target * DWELL; run(); }, 3600);
    run();
  };

  const io = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible) run();
  }, { rootMargin: '120px 0px' });
  io.observe(stage);

  const fromPointer = (event: PointerEvent) => {
    const box = svg.getBoundingClientRect();
    const f = clamp(((event.clientX - box.left) / box.width - 0.16) / 0.68, 0, 1);
    steer(Math.round(f * (STEPS.length - 1)));
  };
  const onMove = (event: PointerEvent) => { if (event.pointerType === 'mouse') fromPointer(event); };
  const onDown = (event: PointerEvent) => fromPointer(event);
  const onKey = (event: KeyboardEvent) => {
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = s.target + 1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = s.target - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = STEPS.length - 1;
    if (next === null) return;
    event.preventDefault();
    steer(next);
  };
  const onStill = () => { touring = !still.matches; run(); };

  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('keydown', onKey);
  still.addEventListener('change', onStill);
  announce();
  draw();

  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(idle);
    io.disconnect();
    stage.removeEventListener('pointermove', onMove);
    stage.removeEventListener('pointerdown', onDown);
    stage.removeEventListener('keydown', onKey);
    still.removeEventListener('change', onStill);
  };
}
