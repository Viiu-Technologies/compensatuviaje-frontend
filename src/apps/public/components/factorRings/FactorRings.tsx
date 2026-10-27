import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { HiCheck, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { gsap } from '../../hooks/useGsapReveal';
import {
  CABIN_LABEL,
  EMISSION_FACTORS,
  HAULS,
  HAUL_LABEL,
  METHODOLOGY,
  ROUTES,
  factorOf,
  haulOf,
  type Cabin,
  type Haul,
} from '../factorBench/model.ts';
import { POPULAR_AIRPORTS } from '../../services/publicApi';
import { useFlight } from '../howItWorks/flight';
import './FactorRings.css';

gsap.registerPlugin(DrawSVGPlugin);

/**
 * FactorRings — un simulador para descubrir por qué el factor de emisión
 * cambia según cómo viajas.
 *
 * Santiago a la izquierda y tres anillos de distancia (doméstico < 500 km,
 * corto hasta 3.700 km, largo más allá). En cada anillo, los cuatro asientos de
 * cabina sobre una columna cuya altura es su factor DEFRA 2025: los mismos
 * números que usa el backend.
 *
 * El avión se vuela con ← → (con inercia), la cabina se cambia con ↑ ↓ y Enter
 * aterriza en la parada más cercana. Tres misiones opcionales llevan a
 * descubrir las tres reglas de la tabla.
 */

const CABINS: Cabin[] = ['economy', 'premium_economy', 'business', 'first'];
const CABIN_SHORT: Record<Cabin, string> = { economy: 'Eco', premium_economy: 'Prem', business: 'Bus', first: '1ª' };
const cabinName = (c: Cabin) => CABIN_LABEL[c][0].toUpperCase() + CABIN_LABEL[c].slice(1);

// ── Geometría (viewBox 0 90 720 350) ──
const O = { x: 70, y: 300 };
const RING_RX = [170, 360, 600];
const RY = 0.36;
const BAND_X: Record<Haul, number> = { Domestic: 155, 'Short-haul': 335, 'Long-haul': 550 };
const COL_X = [-39, -13, 13, 39];
const COL_W = 16;
const DEPTH = 6;
const SCALE = 340; // px por (kg CO₂e/km)
const LINE_Y = O.y + 44;

// La línea de vuelo usa una escala logarítmica por tramos que hace coincidir
// los cortes de 500 y 3.700 km con los bordes de los anillos.
const SEGMENTS: Array<[number, number, number, number]> = [
  [100, 500, 90, O.x + RING_RX[0]],
  [500, 3700, O.x + RING_RX[0], O.x + RING_RX[1]],
  [3700, 16000, O.x + RING_RX[1], O.x + RING_RX[2]],
];
const X_MIN = SEGMENTS[0][2];
const X_MAX = SEGMENTS[2][3];
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const kmToX = (km: number) => {
  const k = clamp(km, 100, 16000);
  for (const [a, b, x0, x1] of SEGMENTS) if (k <= b) return x0 + (Math.log(k / a) / Math.log(b / a)) * (x1 - x0);
  return X_MAX;
};
const xToKm = (x: number) => {
  const v = clamp(x, X_MIN, X_MAX);
  for (const [a, b, x0, x1] of SEGMENTS) if (v <= x1) return a * (b / a) ** ((v - x0) / (x1 - x0));
  return 16000;
};

// Vuelo con inercia, en px de la línea por segundo.
const ACCEL = 520;
const MAX_SPEED = 230;

const BAND_NOTE: Record<Haul, string> = {
  Domestic: 'En vuelos domésticos la cabina no cambia nada, y es donde más se emite por km: el despegue pesa más.',
  'Short-haul': 'Hasta 3.700 km solo se separa la económica; premium, business y primera pesan igual.',
  'Long-haul': 'En vuelos largos la cabina sí importa: primera emite 4 veces más que económica.',
};

// ── Paradas: ciudades a su distancia real desde Santiago ──
const CITY: Record<string, string> = { CCP: 'Concepción', EZE: 'Buenos Aires', LIM: 'Lima', MIA: 'Miami', MAD: 'Madrid' };
type Stop = { code: string; name: string; km: number; own?: boolean };
const BASE_STOPS: Stop[] = ROUTES.map((r) => {
  const code = r.code.split('→')[1];
  return { code, name: CITY[code] ?? code, km: r.km };
});
const cityOf = (code: string) => POPULAR_AIRPORTS.find((a) => a.code === code)?.city ?? code;

// ── Misiones ──
type MissionId = 'domestic' | 'short' | 'long';
const MISSIONS: Array<{ id: MissionId; task: string; rule: string }> = [
  {
    id: 'domestic',
    task: 'Vuela a Concepción y prueba las cuatro cabinas.',
    rule: 'En vuelos domésticos la cabina no cambia la huella: los cuatro asientos emiten lo mismo.',
  },
  {
    id: 'short',
    task: 'Vuela a Lima y encuentra la cabina que emite menos.',
    rule: 'Hasta 3.700 km solo la económica emite menos; premium, business y primera pesan igual.',
  },
  {
    id: 'long',
    task: 'Llega a Madrid emitiendo menos de 1.300 kg de CO₂e.',
    rule: 'En vuelos largos la cabina pesa mucho: solo en económica se baja de 1.300 kg.',
  },
];
const STORAGE_KEY = 'ctv-factor-missions';
const readProgress = (): Record<MissionId, boolean> => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return { domestic: !!saved.domestic, short: !!saved.short, long: !!saved.long };
  } catch {
    return { domestic: false, short: false, long: false };
  }
};

const nf = (value: number, digits: number) =>
  value.toLocaleString('es-CL', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const Column: React.FC<{ haul: Haul; cabin: Cabin; index: number }> = ({ haul, cabin, index }) => {
  const h = EMISSION_FACTORS[haul][cabin] * SCALE;
  const x = BAND_X[haul] + COL_X[index] - COL_W / 2;
  const top = O.y - h;
  return (
    <g className="fr-col" data-haul={haul} data-cabin={cabin}>
      <g className="fr-col__body">
        <rect className="fr-col__front" x={x} y={top} width={COL_W} height={h} />
        <path className="fr-col__side" d={`M${x + COL_W} ${top} l${DEPTH} ${-DEPTH} v${h} l${-DEPTH} ${DEPTH} Z`} />
        <path className="fr-col__top" d={`M${x} ${top} l${DEPTH} ${-DEPTH} h${COL_W} l${-DEPTH} ${DEPTH} Z`} />
        {/* Asiento de avión: cojín, respaldo inclinado y cabecero */}
        <g transform={`translate(${x + 1} ${top - DEPTH / 2})`}>
          {/* Grupo interno: el "salto" al cruzar un anillo anima este, no la posición. */}
          <g className="fr-col__seat">
            <rect x="2" y="-5" width="12" height="4" rx="1.6" />
            <path d="M2.4 -4.6 L0.6 -15 Q0.4 -16.4 1.8 -16.6 L4 -16.8 Q5.4 -16.9 5.6 -15.6 L6.8 -4.6 Z" />
            <rect x="0" y="-20.5" width="5.6" height="3.4" rx="1.4" transform="rotate(-8 2.8 -18.8)" />
          </g>
        </g>
      </g>
    </g>
  );
};

const FactorRings: React.FC = () => {
  const flight = useFlight();
  const hintId = useId();

  // Paradas: las de ejemplo y, si hay un cálculo arriba, "tu vuelo".
  const stops = useMemo<Stop[]>(() => {
    if (flight.example) return BASE_STOPS;
    const same = flight.from.code === 'SCL' ? BASE_STOPS.find((s) => s.code === flight.to.code) : undefined;
    if (same) return BASE_STOPS.map((s) => (s === same ? { ...s, km: flight.km, own: true } : s));
    const name = flight.from.code === 'SCL' ? cityOf(flight.to.code) : `${cityOf(flight.from.code)}→${cityOf(flight.to.code)}`;
    return [...BASE_STOPS, { code: flight.to.code, name, km: flight.km, own: true }].sort((a, b) => a.km - b.km);
  }, [flight]);

  const [cabin, setCabin] = useState<Cabin>(flight.example ? 'economy' : flight.cabin);
  const [haul, setHaul] = useState<Haul>('Domestic');
  const [landed, setLanded] = useState<Stop | null>(null);
  const [free, setFree] = useState(false);
  const [progress, setProgress] = useState(readProgress);
  const [justDone, setJustDone] = useState<MissionId | null>(null);
  const [announce, setAnnounce] = useState('');
  // Cabinas probadas en cada parada (para las misiones).
  const tried = useRef<Record<string, Set<Cabin>>>({});

  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGRectElement>(null);
  const sparksRef = useRef<SVGGElement>(null);
  const kmText = useRef<HTMLSpanElement>(null);
  const factorText = useRef<HTMLSpanElement>(null);
  const kgText = useRef<HTMLSpanElement>(null);

  const km = useRef(100);
  const velocity = useRef(0);
  const keys = useRef({ left: false, right: false });
  const frame = useRef(0);
  const last = useRef(0);
  const lastSpark = useRef(0);
  const sparkIndex = useRef(0);
  const cabinRef = useRef(cabin);
  cabinRef.current = cabin;
  const haulRef = useRef<Haul>('Domestic');
  const flyTween = useRef<gsap.core.Tween | null>(null);

  // ── Dibujo del avión, la estela y la lectura (fuera de React: cada cuadro) ──
  const paint = useCallback((facing = 1) => {
    const x = kmToX(km.current);
    planeRef.current?.setAttribute('transform', `translate(${x.toFixed(1)} ${LINE_Y}) scale(${facing} 1)`);
    trailRef.current?.setAttribute('width', Math.max(0, x - O.x).toFixed(1));
    // En pantallas angostas el dibujo es más ancho que el escenario: seguir al avión.
    const stage = stageRef.current;
    if (stage && stage.scrollWidth > stage.clientWidth + 1) {
      stage.scrollLeft = (x / 720) * stage.scrollWidth - stage.clientWidth / 2;
    }
    const factor = factorOf(km.current, cabinRef.current);
    if (kmText.current) kmText.current.textContent = `${nf(km.current, 0)} km`;
    if (factorText.current) factorText.current.textContent = nf(factor, 5);
    if (kgText.current) kgText.current.textContent = `${nf(km.current * factor, 2)} kg CO₂e`;

    const h = haulOf(km.current);
    if (h !== haulRef.current) {
      const outward = HAULS.indexOf(h) > HAULS.indexOf(haulRef.current);
      haulRef.current = h;
      setHaul(h);
      if (!reducedMotion()) {
        // Destello en el borde del anillo y los asientos del tramo "saltan".
        const edge = outward ? SEGMENTS[HAULS.indexOf(h)][2] : SEGMENTS[HAULS.indexOf(h) + 1][2];
        const flash = svgRef.current?.querySelector('.fr-flash');
        if (flash) {
          flash.setAttribute('cx', edge.toFixed(1));
          gsap.fromTo(flash, { scale: 0.3, opacity: 0.9, transformOrigin: '50% 50%' }, { scale: 3, opacity: 0, duration: 0.6, ease: 'power2.out' });
        }
        gsap.fromTo(
          svgRef.current?.querySelectorAll(`.fr-col[data-haul="${h}"] .fr-col__seat`) ?? [],
          { y: -8 },
          { y: 0, duration: 0.5, ease: 'bounce.out', stagger: 0.04 },
        );
      }
    }
  }, []);

  // Chispas que deja el avión al volar.
  const spark = useCallback((facing: number) => {
    const group = sparksRef.current;
    if (!group || reducedMotion()) return;
    const dots = group.children;
    const dot = dots[sparkIndex.current++ % dots.length] as SVGCircleElement;
    const x = kmToX(km.current) - 14 * facing;
    gsap.killTweensOf(dot);
    gsap.fromTo(
      dot,
      { attr: { cx: x, cy: LINE_Y + (Math.random() - 0.5) * 6, r: 2.2 }, opacity: 0.95 },
      { attr: { cx: x - (8 + Math.random() * 10) * facing, r: 0.6 }, opacity: 0, duration: 0.7, ease: 'power1.out' },
    );
  }, []);

  // ── Bucle de vuelo con inercia ──
  const loop = useCallback(
    (t: number) => {
      const dt = Math.min(0.05, (t - (last.current || t)) / 1000);
      last.current = t;
      const dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
      let v = velocity.current;
      if (dir) v = clamp(v + dir * ACCEL * dt, -MAX_SPEED, MAX_SPEED);
      else {
        v *= 0.86 ** (dt * 60);
        if (Math.abs(v) < 6) v = 0;
      }
      let x = kmToX(km.current) + v * dt;
      if (x <= X_MIN || x >= X_MAX) {
        x = clamp(x, X_MIN, X_MAX);
        v = 0;
      }
      velocity.current = v;
      km.current = xToKm(x);
      const facing = v < 0 ? -1 : 1;
      paint(facing);
      if (Math.abs(v) > 40 && t - lastSpark.current > 45) {
        lastSpark.current = t;
        spark(facing);
      }
      frame.current = v !== 0 || dir ? requestAnimationFrame(loop) : 0;
      if (!frame.current) last.current = 0;
    },
    [paint, spark],
  );

  const startFlying = useCallback(() => {
    flyTween.current?.kill();
    setLanded(null);
    if (!frame.current) frame.current = requestAnimationFrame(loop);
  }, [loop]);

  // ── Aterrizar en una parada (volando hasta ella) ──
  const land = useCallback(
    (stop: Stop) => {
      flyTween.current?.kill();
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      velocity.current = 0;
      const done = () => {
        km.current = stop.km;
        paint();
        setLanded(stop);
        setAnnounce(`Aterrizaste en ${stop.name}: ${nf(stop.km, 0)} km.`);
      };
      if (reducedMotion()) return done();
      const facing = stop.km >= km.current ? 1 : -1;
      const state = { x: kmToX(km.current) };
      flyTween.current = gsap.to(state, {
        x: kmToX(stop.km),
        duration: clamp(Math.abs(kmToX(stop.km) - state.x) / 260, 0.35, 1.3),
        ease: 'power2.inOut',
        onUpdate: () => {
          km.current = xToKm(state.x);
          paint(facing);
          if (performance.now() - lastSpark.current > 45) {
            lastSpark.current = performance.now();
            spark(facing);
          }
        },
        onComplete: done,
      });
    },
    [paint, spark],
  );

  const nearestStop = () => stops.reduce((best, s) => (Math.abs(kmToX(s.km) - kmToX(km.current)) < Math.abs(kmToX(best.km) - kmToX(km.current)) ? s : best));
  const neighbourStop = (dir: 1 | -1) => {
    const x = kmToX(km.current);
    const list = dir > 0 ? stops.filter((s) => kmToX(s.km) > x + 2) : stops.filter((s) => kmToX(s.km) < x - 2).reverse();
    return list[0];
  };

  const changeCabin = (step: number) => {
    setCabin((c) => CABINS[clamp(CABINS.indexOf(c) + step, 0, CABINS.length - 1)]);
  };

  // ── Teclado (solo con la figura enfocada) ──
  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowLeft') {
      e.preventDefault();
      const dir = k === 'ArrowRight' ? 1 : -1;
      if (reducedMotion()) {
        const next = neighbourStop(dir);
        if (next) land(next);
        return;
      }
      keys.current[dir > 0 ? 'right' : 'left'] = true;
      startFlying();
    } else if (k === 'ArrowUp' || k === 'ArrowDown') {
      e.preventDefault();
      changeCabin(k === 'ArrowUp' ? 1 : -1);
    } else if (k === 'Enter' || k === ' ') {
      e.preventDefault();
      land(nearestStop());
    }
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') keys.current.right = false;
    if (e.key === 'ArrowLeft') keys.current.left = false;
  };

  // Botones ◀ ▶ en pantalla: mantener presionado para volar.
  const hold = (dir: 'left' | 'right', on: boolean) => {
    if (reducedMotion()) {
      if (on) {
        const next = neighbourStop(dir === 'right' ? 1 : -1);
        if (next) land(next);
      }
      return;
    }
    keys.current[dir] = on;
    if (on) startFlying();
  };

  // ── Punto de partida: tu vuelo (si calculaste) o Santiago ──
  useLayoutEffect(() => {
    const own = stops.find((s) => s.own);
    km.current = own ? own.km : 100;
    haulRef.current = haulOf(km.current);
    setHaul(haulRef.current);
    if (!flight.example) setCabin(flight.cabin);
    setLanded(own ?? null);
    paint();
  }, [stops, flight, paint]);

  // La lectura sigue a la cabina aunque el avión esté quieto.
  useEffect(() => {
    paint();
  }, [cabin, paint]);

  // ── Misiones ──
  useEffect(() => {
    if (!landed) return;
    (tried.current[landed.code] ??= new Set()).add(cabin);
    const kg = landed.km * factorOf(landed.km, cabin);
    const reached: MissionId | null =
      landed.code === 'CCP' && tried.current.CCP.size === CABINS.length
        ? 'domestic'
        : landed.code === 'LIM' && cabin === 'economy' && tried.current.LIM.size >= 2
          ? 'short'
          : landed.code === 'MAD' && kg < 1300
            ? 'long'
            : null;
    if (!reached || progress[reached]) return;
    const next = { ...progress, [reached]: true };
    setProgress(next);
    setJustDone(reached);
    setAnnounce(`¡Misión cumplida! ${MISSIONS.find((m) => m.id === reached)!.rule}`);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* sin almacenamiento: el progreso dura la visita */
    }
  }, [landed, cabin, progress]);

  const current = MISSIONS.find((m) => !progress[m.id]) ?? null;
  const resetMissions = () => {
    const empty = { domestic: false, short: false, long: false };
    setProgress(empty);
    setJustDone(null);
    tried.current = {};
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nada que borrar */
    }
  };

  // ── Intro: anillos y asientos, de adentro hacia afuera ──
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const mm = gsap.matchMedia(svg);
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
      tl.from('.fr-ring', { drawSVG: '0% 0%', stagger: 0.2, duration: 0.7 }, 0);
      HAULS.forEach((h, i) => {
        const at = 0.5 + i * 0.6;
        tl.from(`.fr-col[data-haul="${h}"] .fr-col__body`, { scaleY: 0, transformOrigin: '50% 100%', stagger: 0.05, duration: 0.4, ease: 'back.out(1.4)' }, at);
        tl.from(`.fr-band-label[data-haul="${h}"]`, { autoAlpha: 0, y: 6, duration: 0.3 }, at);
      });
      tl.from('.fr-stop', { autoAlpha: 0, y: 6, stagger: 0.06, duration: 0.3 }, 1.9);
      tl.from('.fr-plane-wrap', { autoAlpha: 0, duration: 0.4 }, 2.1);
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries[entries.length - 1]?.isIntersecting) return;
          io.disconnect();
          tl.play();
        },
        { threshold: 0.35 },
      );
      io.observe(svg);
      return () => io.disconnect();
    });
    return () => mm.revert();
  }, []);

  useEffect(() => () => {
    cancelAnimationFrame(frame.current);
    flyTween.current?.kill();
  }, []);

  return (
    <figure className="fr">
      {/* Misiones */}
      <div className="fr__missions">
        <div className="fr__mission-steps" aria-label="Progreso de las misiones">
          {MISSIONS.map((m, i) => (
            <span key={m.id} className={`fr__step ${progress[m.id] ? 'fr__step--done' : ''} ${current?.id === m.id && !free ? 'fr__step--now' : ''}`}>
              {progress[m.id] ? <HiCheck aria-hidden="true" /> : i + 1}
              <span className="sr-only">{progress[m.id] ? ' (cumplida)' : ''}</span>
            </span>
          ))}
        </div>
        <p className="fr__mission-text">
          {free
            ? 'Modo libre: vuela a donde quieras y compara cabinas.'
            : justDone && progress[justDone] && (!current || justDone !== current.id)
              ? <><strong>¡Misión cumplida!</strong> {MISSIONS.find((m) => m.id === justDone)!.rule}{current ? <> Siguiente: {current.task}</> : null}</>
              : current
                ? <><strong>Misión {MISSIONS.indexOf(current) + 1}:</strong> {current.task}</>
                : <><strong>¡Las tres misiones listas!</strong> Ya conoces las tres reglas del factor.</>}
        </p>
        <div className="fr__mission-actions">
          <button type="button" className="fr__link" onClick={() => setFree((f) => !f)}>
            {free ? 'Volver a las misiones' : 'Explorar libre'}
          </button>
          {!current && (
            <button type="button" className="fr__link" onClick={resetMissions}>
              Repetir misiones
            </button>
          )}
        </div>
      </div>

      {/* Simulador: se controla con el teclado cuando está enfocado */}
      <div
        ref={stageRef}
        className="fr__stage"
        tabIndex={0}
        role="group"
        aria-label={`Simulador de vuelo con los factores ${METHODOLOGY}`}
        aria-describedby={hintId}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={() => {
          keys.current = { left: false, right: false };
        }}
      >
        <svg ref={svgRef} className="fr__svg" viewBox="0 90 720 350" aria-hidden="true" focusable="false">
          <defs>
            <clipPath id="fr-clip">
              <rect y="90" width="720" height="350" />
            </clipPath>
            <linearGradient id="fr-trail" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#5EE08A" stopOpacity="0" />
              <stop offset="1" stopColor="#1F8A4C" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <g clipPath="url(#fr-clip)">
            {[...RING_RX].reverse().map((rx, i) => (
              <ellipse key={rx} className={`fr-ring fr-ring--${2 - i}`} cx={O.x} cy={O.y} rx={rx} ry={rx * RY} />
            ))}
          </g>

          {/* Santiago */}
          <circle className="fr-origin" cx={O.x} cy={O.y} r="5" />
          <text className="fr-origin__label" x={O.x} y={O.y - 14} textAnchor="middle">
            Santiago
          </text>

          {HAULS.map((h) => (
            <g key={h} className={`fr-band ${h === haul ? 'fr-band--on' : ''}`}>
              {CABINS.map((c, i) => (
                <g key={c} className={c === cabin && h === haul ? 'fr-pick' : undefined}>
                  <Column haul={h} cabin={c} index={i} />
                </g>
              ))}
              {CABINS.map((c, i) => (
                <text key={c} className="fr-col__label" x={BAND_X[h] + COL_X[i]} y={O.y + 16} textAnchor="middle">
                  {CABIN_SHORT[c]}
                </text>
              ))}
              <g className="fr-band-label" data-haul={h}>
                <text x={BAND_X[h]} y={O.y + 104} textAnchor="middle" className="fr-band-label__km">
                  {h === 'Domestic' ? '< 500 km' : h === 'Short-haul' ? '500 – 3.700 km' : '> 3.700 km'}
                </text>
                <text x={BAND_X[h]} y={O.y + 119} textAnchor="middle" className="fr-band-label__name">
                  tramo {HAUL_LABEL[h]}
                </text>
              </g>
            </g>
          ))}

          {/* Línea de vuelo con sus paradas */}
          <line className="fr-line" x1={O.x} x2={X_MAX} y1={LINE_Y} y2={LINE_Y} />
          <rect ref={trailRef} className="fr-trail" x={O.x} y={LINE_Y - 1.5} width="0" height="3" rx="1.5" />
          <circle className="fr-flash" cx={X_MIN} cy={LINE_Y} r="9" opacity="0" />
          {stops.map((s) => {
            const x = kmToX(s.km);
            const on = landed?.code === s.code;
            return (
              <g
                key={s.code}
                className={`fr-stop ${on ? 'fr-stop--on' : ''} ${s.own ? 'fr-stop--own' : ''}`}
                onClick={() => land(s)}
              >
                <circle cx={x} cy={LINE_Y} r="4" />
                <text className="fr-stop__name" x={x} y={LINE_Y + 19} textAnchor="middle">
                  {s.name}
                </text>
                <text className="fr-stop__code" x={x} y={LINE_Y + 31} textAnchor="middle">
                  {s.own ? `tu vuelo · ${s.code}` : s.code}
                </text>
              </g>
            );
          })}

          <g ref={sparksRef} className="fr-sparks">
            {Array.from({ length: 16 }, (_, i) => (
              <circle key={i} r="0" cx="0" cy="0" opacity="0" />
            ))}
          </g>

          <g className="fr-plane-wrap">
            <g ref={planeRef} className="fr-plane">
              <path d="M-13 0 L9 -1.6 C12 -1.6 14 -0.8 14 0 C14 0.8 12 1.6 9 1.6 Z" />
              <path d="M1 -1 L-4 -10 L-1 -10 L6 -1 Z M1 1 L-4 10 L-1 10 L6 1 Z" />
              <path d="M-10 -0.8 L-13 -5 L-11 -5 L-7 -0.8 Z M-10 0.8 L-13 5 L-11 5 L-7 0.8 Z" />
            </g>
          </g>
        </svg>
      </div>
      <p id={hintId} className="fr__hint">
        ← → volar · ↑ ↓ cabina · Enter aterrizar
      </p>

      {/* Controles en pantalla (táctil y mouse) */}
      <div className="fr__controls">
        <div className="fr__pad">
          {(['left', 'right'] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              className="fr__pad-btn"
              aria-label={dir === 'left' ? 'Volar hacia Santiago' : 'Volar más lejos'}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                hold(dir, true);
              }}
              onPointerUp={() => hold(dir, false)}
              onPointerCancel={() => hold(dir, false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  const next = neighbourStop(dir === 'right' ? 1 : -1);
                  if (next) land(next);
                }
              }}
            >
              {dir === 'left' ? <HiChevronLeft aria-hidden="true" /> : <HiChevronRight aria-hidden="true" />}
            </button>
          ))}
          <button type="button" className="fr__land" onClick={() => land(nearestStop())}>
            Aterrizar
          </button>
        </div>
        <div className="fr__group" role="radiogroup" aria-label="Cabina">
          {CABINS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={c === cabin}
              tabIndex={c === cabin ? 0 : -1}
              className="fr__chip"
              onClick={() => setCabin(c)}
              onKeyDown={(e) => {
                const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
                if (!step) return;
                e.preventDefault();
                const next = CABINS[(CABINS.indexOf(cabin) + step + CABINS.length) % CABINS.length];
                setCabin(next);
                (e.currentTarget.parentElement?.children[CABINS.indexOf(next)] as HTMLElement | undefined)?.focus();
              }}
            >
              {cabinName(c)}
            </button>
          ))}
        </div>
      </div>

      {/* Lectura en vivo */}
      <figcaption className="fr__readout">
        <span className="fr__formula">
          <span ref={kmText} /> × <span ref={factorText} /> = <span ref={kgText} />
        </span>
        <span className="fr__per">
          {landed
            ? `Santiago → ${landed.name} · ${cabinName(cabin).toLowerCase()} · por pasajero, solo ida · ${METHODOLOGY}`
            : `tramo ${HAUL_LABEL[haul]} · ${cabinName(cabin).toLowerCase()} · por pasajero, solo ida · ${METHODOLOGY}`}
        </span>
        <span className="fr__note">{BAND_NOTE[haul]}</span>
        <span className="sr-only" aria-live="polite">
          {announce}
        </span>
      </figcaption>
    </figure>
  );
};

export default FactorRings;
