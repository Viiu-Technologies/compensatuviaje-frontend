import React, { useLayoutEffect, useRef } from 'react';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { gsap } from '../../hooks/useGsapReveal';
import './VerificationFlow.css';

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

/**
 * VerificationFlow — cómo se verifica un certificado, en cuatro piezas unidas:
 * el certificado → su huella (hash) → el bloque en la cadena → el registro
 * público en Polygon.
 *
 * Al entrar en pantalla se arma una vez, pieza por pieza; después queda viva
 * con pulsos que recorren las conexiones. Con prefers-reduced-motion se ve el
 * estado final, quieto.
 *
 * Sin búsqueda es un esquema con datos de ejemplo (y lo dice). Con un
 * certificado verificado muestra los datos reales: kg, token, red y
 * transacción; si no se encontró, el recorrido se detiene en el certificado.
 */

export type FlowData =
  | { status: 'demo' }
  | { status: 'valid'; kg: number; tokenId: string; network: string; txHash: string }
  | { status: 'invalid' };

const short = (hash: string, head = 6, tail = 4) =>
  hash.length > head + tail + 1 ? `${hash.slice(0, head)}…${hash.slice(-tail)}` : hash;

// Las tarjetas se inclinan como en una vista axonométrica: suben hacia la derecha.
const SKEW = -16;

// ── Cubos isométricos ──
type Cube = { x: number; y: number; s: number; tone: 'core' | 'side' };
const CORE: Cube = { x: 528, y: 292, s: 38, tone: 'core' };
const SATELLITES: Cube[] = [
  { x: 528, y: 204, s: 27, tone: 'side' },
  { x: 452, y: 292, s: 27, tone: 'side' },
  { x: 604, y: 280, s: 27, tone: 'side' },
  { x: 478, y: 374, s: 27, tone: 'side' },
  { x: 578, y: 372, s: 27, tone: 'side' },
];

const face = (points: Array<[number, number]>) => points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ');

const CubeShape: React.FC<{ cube: Cube; className?: string }> = ({ cube, className }) => {
  const { x, y, s } = cube;
  const w = s * 0.866;
  return (
    <g className={`vf-cube vf-cube--${cube.tone} ${className ?? ''}`}>
      <polygon className="vf-cube__top" points={face([[x, y - s], [x + w, y - s / 2], [x, y], [x - w, y - s / 2]])} />
      <polygon className="vf-cube__left" points={face([[x - w, y - s / 2], [x, y], [x, y + s], [x - w, y + s / 2]])} />
      <polygon className="vf-cube__right" points={face([[x, y], [x + w, y - s / 2], [x + w, y + s / 2], [x, y + s]])} />
    </g>
  );
};

// ── Conexiones entre piezas ──
const LINKS = [
  'M128 226 C 128 296, 196 326, 252 322', // certificado → huella
  'M394 286 C 404 286, 412 300, 426 300', // huella → cadena
  'M628 290 C 664 302, 668 372, 628 418', // cadena → registro
];

const Check: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g className="vf-check" transform={`translate(${x} ${y})`}>
    <circle r="8.5" />
    <path d="M-3.6 0.2 L-1 2.8 L3.8 -2.4" />
  </g>
);

const VerificationFlow: React.FC<{ data: FlowData }> = ({ data }) => {
  const root = useRef<SVGSVGElement>(null);

  const valid = data.status === 'valid';
  const invalid = data.status === 'invalid';
  const kgLabel = valid ? `${data.kg.toLocaleString('es-CL', { maximumFractionDigits: 2 })} kg CO₂e` : 'Vuelo compensado';
  const hashLabel = valid ? `Token #${data.tokenId}` : 'a3f5e7c9…4d2b';
  const networkLabel = valid ? data.network : 'Polygon';
  const txLabel = valid ? short(data.txHash) : '0x8f3a…7e2c';
  // La animación se rearma al cambiar el resultado de la búsqueda.
  const runKey = valid ? data.txHash : data.status;

  useLayoutEffect(() => {
    const svg = root.current;
    if (!svg) return;
    const mm = gsap.matchMedia(svg);

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out', duration: 0.5 } });

      // 1 · El certificado
      tl.from('.vf-cert', { y: 14, autoAlpha: 0 }, 0);
      tl.from('.vf-cert .vf-pill', { scale: 0.6, autoAlpha: 0, transformOrigin: '50% 50%', ease: 'back.out(2)' }, 0.35);
      if (!invalid) {
        // 2 · Su huella
        tl.from('.vf-link-0', { drawSVG: '0% 0%', duration: 0.55, ease: 'power1.inOut' }, 0.7);
        tl.from('.vf-fp', { y: 12, autoAlpha: 0 }, 1.05);
        tl.from('.vf-fp__ridge', { drawSVG: '50% 50%', stagger: 0.05, duration: 0.45 }, 1.2);
        tl.fromTo('.vf-fp__scan', { y: -34, autoAlpha: 1 }, { y: 34, autoAlpha: 0, duration: 0.8, ease: 'sine.inOut' }, 1.25);
        tl.from('.vf-fp__hash', { autoAlpha: 0, y: 4, duration: 0.4 }, 1.9);
        // 3 · El bloque en la cadena
        tl.from('.vf-link-1', { drawSVG: '0% 0%', duration: 0.55, ease: 'power1.inOut' }, 2.2);
        tl.from('.vf-chain__spoke', { drawSVG: '0% 0%', stagger: 0.04, duration: 0.3 }, 2.6);
        tl.from('.vf-cube--side', { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%', stagger: 0.07, duration: 0.45, ease: 'back.out(1.7)' }, 2.6);
        tl.from('.vf-cube--core', { autoAlpha: 0, scale: 0.7, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(1.8)' }, 2.75);
        tl.to('.vf-core-glow', { opacity: 0.55, duration: 0.35, yoyo: true, repeat: 1 }, 3.1);
        // 4 · El registro público
        tl.from('.vf-link-2', { drawSVG: '0% 0%', duration: 0.55, ease: 'power1.inOut' }, 3.5);
        tl.from('.vf-registry', { y: 14, autoAlpha: 0 }, 3.85);
        tl.from('.vf-registry .vf-pill', { scale: 0.6, autoAlpha: 0, transformOrigin: '50% 50%', ease: 'back.out(2)' }, 4.2);
        tl.from('.vf-registry__tx', { autoAlpha: 0, x: -6, duration: 0.4 }, 4.45);
      }

      // Después, pulsos que recorren las conexiones sin reiniciar nada.
      const pulses = invalid
        ? []
        : LINKS.map((_, i) => {
            const pulse = `.vf-pulse-${i}`;
            return gsap
              .timeline({ paused: true, repeat: -1, repeatDelay: 2.4, delay: i * 1.1 })
              .to(pulse, { motionPath: { path: `.vf-link-${i}`, align: `.vf-link-${i}`, alignOrigin: [0.5, 0.5] }, duration: 1.6, ease: 'none' }, 0)
              .to(pulse, { opacity: 1, duration: 0.2 }, 0)
              .to(pulse, { opacity: 0, duration: 0.25 }, 1.35);
          });
      tl.call(() => pulses.forEach((p) => p.play()), [], invalid ? 0.8 : 4.9);

      // Se arma al entrar en pantalla; los pulsos se pausan fuera de ella.
      let started = false;
      const io = new IntersectionObserver(
        (entries) => {
          const inView = entries[entries.length - 1]?.isIntersecting;
          if (inView && !started) {
            started = true;
            tl.play();
          }
          pulses.forEach((p) => (inView && tl.progress() === 1 ? p.resume() : p.pause()));
        },
        { threshold: 0.3 },
      );
      io.observe(svg);
      return () => io.disconnect();
    });

    return () => mm.revert();
  }, [runKey, invalid]);

  return (
    <figure className={`vf vf--${data.status}`}>
      <svg ref={root} className="vf__svg" viewBox="0 0 690 580" aria-hidden="true" focusable="false">
        <defs>
          <filter id="vf-shadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#0E3B36" floodOpacity="0.12" />
          </filter>
          <radialGradient id="vf-glow">
            <stop offset="0" stopColor="#5EE08A" stopOpacity="0.9" />
            <stop offset="1" stopColor="#5EE08A" stopOpacity="0" />
          </radialGradient>
          <clipPath id="vf-fp-clip">
            <circle cx="70" cy="58" r="34" />
          </clipPath>
        </defs>

        {/* Conexiones (debajo de las tarjetas) */}
        <g className="vf-links">
          {LINKS.map((d, i) => (
            <path key={i} className={`vf-link vf-link-${i}`} d={d} />
          ))}
          {LINKS.map((_, i) => (
            <circle key={i} className={`vf-pulse vf-pulse-${i}`} r="3.4" />
          ))}
        </g>

        {/* 1 · Certificado de compensación */}
        <g className="vf-cert" transform={`translate(24 76) skewY(${SKEW})`}>
          <rect className="vf-card" width="196" height="176" rx="16" filter="url(#vf-shadow)" />
          <g transform="translate(24 30)">
            <path className="vf-leaf" d="M2 26 C2 10 12 0 28 0 C28 16 18 26 2 26 Z" />
            <path className="vf-leaf__vein" d="M3 25 L20 8" />
          </g>
          <text className="vf-title" x="62" y="40">Certificado de</text>
          <text className="vf-title" x="62" y="58">compensación</text>
          <text className="vf-meta" x="24" y="88">{kgLabel}</text>
          <rect className="vf-line" x="24" y="98" width="148" height="6" rx="3" />
          <rect className="vf-line" x="24" y="112" width="112" height="6" rx="3" />
          <g className="vf-pill">
            <rect className={`vf-pill__bg ${invalid ? 'vf-pill__bg--muted' : ''}`} x="24" y="130" width={invalid ? 124 : 96} height="28" rx="14" />
            {!invalid && <Check x={42} y={144} />}
            <text className="vf-pill__text" x={invalid ? 40 : 58} y="148.5">
              {invalid ? 'Sin registro' : 'Válido'}
            </text>
          </g>
        </g>

        {/* 2 · Huella del certificado (su hash) */}
        <g className="vf-fp" transform={`translate(254 256) skewY(${SKEW})`}>
          <rect className="vf-card" width="140" height="150" rx="16" filter="url(#vf-shadow)" />
          <circle className="vf-fp__disc" cx="70" cy="58" r="36" />
          <g className="vf-fp__ridges" transform="translate(70 58)">
            {[8, 13, 18, 23, 28].map((r, i) => (
              <path
                key={r}
                className="vf-fp__ridge"
                d={`M${-r} ${4 + i} C${-r} ${-r * 1.1}, ${r} ${-r * 1.1}, ${r} ${4 + i} S ${r * 0.4} ${r * 0.9 + 4}, ${r * 0.1} ${r}`}
              />
            ))}
          </g>
          <g clipPath="url(#vf-fp-clip)">
            <rect className="vf-fp__scan" x="34" y="56" width="72" height="3" rx="1.5" />
          </g>
          <text className="vf-fp__hash" x="70" y="126" textAnchor="middle">
            {hashLabel}
          </text>
        </g>

        {/* 3 · El bloque en la cadena */}
        <g className="vf-chain">
          {SATELLITES.map((c, i) => (
            <path key={i} className="vf-chain__spoke" d={`M${CORE.x} ${CORE.y} L${c.x} ${c.y}`} />
          ))}
          <circle className="vf-core-glow" cx={CORE.x} cy={CORE.y} r="70" fill="url(#vf-glow)" opacity="0" />
          {SATELLITES.map((c, i) => (
            <CubeShape key={i} cube={c} />
          ))}
          <CubeShape cube={CORE} />
          {/* Eslabón sobre la cara derecha del bloque central */}
          <g className="vf-cube__glyph" transform={`translate(${CORE.x + 17} ${CORE.y + 9}) skewY(-30)`}>
            <rect x="-9" y="-4" width="10" height="8" rx="4" />
            <rect x="-1" y="-4" width="10" height="8" rx="4" />
          </g>
        </g>

        {/* 4 · Registro público */}
        <g className="vf-registry" transform={`translate(486 462) skewY(${SKEW})`}>
          <rect className="vf-card" width="186" height="138" rx="16" filter="url(#vf-shadow)" />
          <g className="vf-dots">
            <circle cx="20" cy="18" r="2.6" />
            <circle cx="29" cy="18" r="2.6" />
            <circle cx="38" cy="18" r="2.6" />
          </g>
          <g className="vf-link-icon" transform="translate(22 44)">
            <rect x="-6" y="-4" width="9" height="8" rx="4" />
            <rect x="1" y="-4" width="9" height="8" rx="4" />
          </g>
          <text className="vf-title" x="40" y="49">Registro público</text>
          <g className="vf-pill">
            <rect className="vf-pill__bg" x="20" y="64" width="118" height="28" rx="14" />
            <Check x={38} y={78} />
            <text className="vf-pill__text" x="54" y="82.5">
              Confirmado
            </text>
          </g>
          <text className="vf-registry__meta" x="20" y="112">
            Red: {networkLabel}
          </text>
          <text className="vf-registry__meta vf-registry__tx" x="20" y="127">
            Tx: {txLabel}
          </text>
          <path className="vf-external" d="M160 106 L168 98 M162 98 L168 98 L168 104 M166 108 L166 112 L154 112 L154 100 L158 100" />
        </g>
      </svg>
      <figcaption className="vf__caption">
        {valid
          ? `Tu certificado · Token #${data.tokenId} · registrado en ${data.network}`
          : invalid
            ? 'No encontramos ese certificado en el registro.'
            : 'Así se verifica un certificado · datos de ejemplo'}
      </figcaption>
    </figure>
  );
};

export default VerificationFlow;
