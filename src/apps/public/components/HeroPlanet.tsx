import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

/* ============================================================================
   HeroPlanet — Planeta Tierra ilustrado en SVG, animado con GSAP.

   - Océano teal + continentes verdes reconocibles (América al centro)
   - Nubes con la forma de la marca derivando sobre el planeta (clip circular)
   - Anillo orbital con nodos de datos: chip CO₂, hoja y satélite
   - Rotación de órbita, deriva de nubes, glow atmosférico pulsante
   - gsap.context() para cleanup total; respeta prefers-reduced-motion
   ========================================================================== */

const GREEN = '#08AE06';
const GREEN_DARK = '#0B8A4A';
const TEAL = '#073D3D';

/* Mini nube con la silueta de la marca (para la deriva sobre el planeta) */
const Cloud = ({ className, opacity = 0.92 }: { className?: string; opacity?: number }) => (
  <g className={className} fill="#ffffff" opacity={opacity}>
    <circle cx="0" cy="0" r="10" />
    <circle cx="13" cy="-7" r="12" />
    <circle cx="26" cy="-1" r="8" />
    <rect x="-10" y="-6" width="44" height="16" rx="8" />
  </g>
);

export default function HeroPlanet() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // Órbita de datos girando; los chips contra-rotan para quedar derechos
      gsap.to('.hp-orbit', {
        rotation: 360,
        svgOrigin: '240 240',
        duration: 52,
        ease: 'none',
        repeat: -1,
      });
      gsap.to('.hp-node', {
        rotation: -360,
        transformOrigin: '50% 50%',
        duration: 52,
        ease: 'none',
        repeat: -1,
      });

      // Nubes derivando sobre el planeta (recortadas por el clip circular)
      gsap.fromTo('.hp-cloud--a', { x: -190 }, { x: 210, duration: 38, ease: 'none', repeat: -1 });
      gsap.fromTo('.hp-cloud--b', { x: -260 }, { x: 190, duration: 52, ease: 'none', repeat: -1 });
      gsap.fromTo('.hp-cloud--c', { x: -120 }, { x: 240, duration: 44, ease: 'none', repeat: -1 });

      // Atmósfera que respira
      gsap.to('.hp-atmo', {
        opacity: 0.55,
        scale: 1.03,
        svgOrigin: '240 240',
        duration: 3.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      // Flotación suave de todo el planeta
      gsap.to('.hp-float', {
        y: -12,
        duration: 5.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      // Parallax al mouse (quickTo evita crear tweens por evento)
      const svg = wrapper.querySelector('.hp-svg');
      if (svg) {
        const xTo = gsap.quickTo(svg, 'x', { duration: 0.8, ease: 'power3.out' });
        const yTo = gsap.quickTo(svg, 'y', { duration: 0.8, ease: 'power3.out' });
        const onMove = (e: MouseEvent) => {
          const rect = wrapper.getBoundingClientRect();
          const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
          const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
          xTo(dx * 16);
          yTo(dy * 16);
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        return () => window.removeEventListener('mousemove', onMove);
      }
    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className="hero-planet" aria-hidden="true">
      <svg viewBox="0 0 480 480" className="hp-svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="hpOcean" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#1D9B84" />
            <stop offset="55%" stopColor="#0C6158" />
            <stop offset="100%" stopColor={TEAL} />
          </radialGradient>
          <radialGradient id="hpAtmo" cx="50%" cy="50%" r="50%">
            <stop offset="62%" stopColor={GREEN} stopOpacity="0" />
            <stop offset="82%" stopColor={GREEN} stopOpacity="0.16" />
            <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hpShade" cx="32%" cy="28%" r="90%">
            <stop offset="55%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#01201F" stopOpacity="0.55" />
          </radialGradient>
          <clipPath id="hpClip">
            <circle cx="240" cy="240" r="150" />
          </clipPath>
        </defs>

        <g className="hp-float">
          {/* Atmósfera / glow */}
          <circle className="hp-atmo" cx="240" cy="240" r="196" fill="url(#hpAtmo)" />

          {/* Anillo orbital decorativo */}
          <circle
            cx="240" cy="240" r="188"
            fill="none" stroke={TEAL} strokeOpacity="0.18"
            strokeWidth="1.2" strokeDasharray="3 7"
          />

          {/* ── Planeta ── */}
          <circle cx="240" cy="240" r="150" fill="url(#hpOcean)" />

          <g clipPath="url(#hpClip)">
            {/* Meridianos sutiles */}
            <g fill="none" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1.4">
              <ellipse cx="240" cy="240" rx="150" ry="150" />
              <ellipse cx="240" cy="240" rx="96" ry="150" />
              <ellipse cx="240" cy="240" rx="40" ry="150" />
              <path d="M 90 240 H 390" />
              <path d="M 104 172 H 376" />
              <path d="M 104 308 H 376" />
            </g>

            {/* Continentes — América reconocible, África al borde */}
            <g fill={GREEN}>
              {/* Norteamérica */}
              <path d="M150 155 C138 138 148 118 170 112 C182 96 214 92 232 104 C252 100 268 112 264 128 C276 140 268 158 250 160 C244 172 224 178 208 172 C192 180 172 176 164 166 C154 164 146 161 150 155 Z" />
              {/* Centroamérica */}
              <path d="M216 176 C228 186 242 200 254 216 L242 224 C228 208 214 192 208 184 Z" />
              {/* Sudamérica */}
              <path d="M252 220 C272 210 292 222 294 244 C296 270 284 302 266 324 C258 334 246 332 242 320 C234 294 232 260 240 236 C243 226 247 222 252 220 Z" />
              {/* Groenlandia */}
              <path d="M262 94 C272 84 290 88 292 102 C294 112 282 120 270 116 C261 112 257 100 262 94 Z" />
              {/* África / Europa (asoman por el borde) */}
              <path d="M352 150 C372 140 392 148 398 166 C404 190 398 220 386 248 C376 268 356 268 348 248 C338 218 336 178 352 150 Z" />
            </g>
            {/* Sombra de relieve de los continentes */}
            <g fill={GREEN_DARK} opacity="0.35" transform="translate(3 4)">
              <path d="M252 220 C272 210 292 222 294 244 C296 270 284 302 266 324 C258 334 246 332 242 320 C234 294 232 260 240 236 C243 226 247 222 252 220 Z" />
              <path d="M150 155 C138 138 148 118 170 112 C182 96 214 92 232 104 C252 100 268 112 264 128 C276 140 268 158 250 160 C244 172 224 178 208 172 C192 180 172 176 164 166 C154 164 146 161 150 155 Z" />
            </g>

            {/* Nubes de marca a la deriva */}
            <g transform="translate(150 195)"><Cloud className="hp-cloud--a" /></g>
            <g transform="translate(210 145) scale(0.8)"><Cloud className="hp-cloud--b" opacity={0.8} /></g>
            <g transform="translate(160 300) scale(1.15)"><Cloud className="hp-cloud--c" opacity={0.85} /></g>

            {/* Sombreado esférico + brillo */}
            <circle cx="240" cy="240" r="150" fill="url(#hpShade)" />
            <ellipse cx="185" cy="165" rx="95" ry="60" fill="#ffffff" opacity="0.10" transform="rotate(-28 185 165)" />
          </g>

          {/* Borde del planeta */}
          <circle cx="240" cy="240" r="150" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1.5" />

          {/* ── Órbita con nodos de datos ── */}
          <g className="hp-orbit">
            {/* Chip CO₂ ↓ */}
            <g className="hp-node" transform="translate(240 52)">
              <rect x="-34" y="-16" width="68" height="32" rx="16" fill="#ffffff" stroke={TEAL} strokeOpacity="0.12" />
              <text x="-6" y="5.5" textAnchor="middle" fill={TEAL} fontSize="14" fontWeight="700" fontFamily="Inter, sans-serif">CO₂</text>
              <path d="M18 -5 V 6 M 13 2 L 18 7 L 23 2" stroke={GREEN} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
            {/* Hoja */}
            <g className="hp-node" transform="translate(413 330)">
              <circle r="17" fill={GREEN} />
              <path d="M-5 8 C-7 0 -3 -7 8 -8 C9 1 4 6 -3 7" fill="none" stroke="#ffffff" strokeWidth="1.9" strokeLinecap="round" />
              <path d="M-5 8 C-3 3 0 -1 4 -4" fill="none" stroke="#ffffff" strokeWidth="1.9" strokeLinecap="round" />
            </g>
            {/* Satélite pequeño */}
            <g className="hp-node" transform="translate(72 336)">
              <circle r="6" fill={TEAL} />
              <circle r="2.4" fill="#ffffff" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
