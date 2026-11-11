// Video 1 de LinkedIn: teaser "Tu vuelo tiene huella". 4:5 · 30 fps · 21 s.
//
// 0-6,5 s    un avión cruza los Andes dejando su estela; "Tu vuelo tiene
//            huella." y luego "¿Cuánto CO₂ deja tu próximo vuelo?"
// 6,3-15 s   mapa: Santiago → Lima y su huella real (619,22 kg CO₂e)
// 15-18 s    "Medirlo es el primer paso."
// 17,7-21 s  logo + "Muy pronto." (o la URL, con ending="live")
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { LAND_PATH, project } from '../showcase/data';
import { backOut, draw, easeInOut, prog, quad, quadAngle, rise, type Pt } from '../showcase/anim';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../theme/fonts';
import { FLIGHT, fmt } from './data';
import { Andes, Closing, DAY_BG, GREEN, GREEN_ON_DARK, INK, INK_SOFT, Kicker, NIGHT_BG, ON_DARK, PlaneAt, Scene, SIDE, Words } from './kit';

export type TeaserProps = { ending: 'soon' | 'live' };

const SHOT = {
  hook: { from: 0, dur: 200 },
  route: { from: 190, dur: 270 },
  step: { from: 450, dur: 90 },
  close: { from: 530, dur: 100 },
} as const;

export const TEASER_DURATION = SHOT.close.from + SHOT.close.dur; // 630

export const Teaser: React.FC<TeaserProps> = ({ ending }) => (
  <AbsoluteFill style={{ background: NIGHT_BG }}>
    <Scene name="Gancho" {...SHOT.hook} bg={DAY_BG} fade={0}>
      <Hook />
    </Scene>
    <Scene name="Santiago → Lima" {...SHOT.route} bg={DAY_BG}>
      <Route />
    </Scene>
    <Scene name="Primer paso" {...SHOT.step} bg={NIGHT_BG}>
      <AbsoluteFill style={{ justifyContent: 'center', padding: `0 ${SIDE}px`, textAlign: 'center' }}>
        <Words text="Medirlo es el *primer paso.*" start={4} stagger={4} accent={GREEN_ON_DARK} style={{ fontSize: 112, color: ON_DARK }} />
      </AbsoluteFill>
    </Scene>
    <Scene name="Cierre" {...SHOT.close} bg={NIGHT_BG}>
      {ending === 'soon' ? (
        <Closing line="Muy pronto." sub="Sigue la página para verlo primero." showUrl={false} />
      ) : (
        <Closing line="Calcula el tuyo." cta="Calcula tu huella" />
      )}
    </Scene>
  </AbsoluteFill>
);

/** El avión cruza dejando estela; dos preguntas, una tras otra. */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();

  const cross = prog(f, [0, 78], (t) => t);
  const x = interpolate(easeInOut(cross), [0, 1], [-200, W + 220]);
  const y = H * 0.24 - Math.sin(cross * Math.PI) * 16;
  const first = 1 - prog(f, [92, 104]);

  return (
    <AbsoluteFill>
      <Andes rise={0.7 + 0.3 * prog(f, [0, 40])} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, zIndex: 3, overflow: 'visible' }}>
        <defs>
          {/* En espacio de usuario: una línea horizontal tiene caja de alto 0 y
              un filtro relativo a ella no pintaría nada. */}
          <filter id="li-trail" filterUnits="userSpaceOnUse" x={-100} y={0} width={W + 200} height={H}>
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        {/* La estela es la "huella" */}
        <path d={`M-40 ${y + 8} L${Math.max(-40, x - 110)} ${y + 8}`} stroke="#9DB8AD" strokeWidth="16" strokeLinecap="round" filter="url(#li-trail)" opacity={0.75} />
        <path d={`M-40 ${y + 8} L${Math.max(-40, x - 110)} ${y + 8}`} stroke={GREEN} strokeWidth="4" strokeLinecap="round" strokeDasharray="1 16" />
        {cross < 1 && <PlaneAt x={x} y={y} angle={-4 * Math.cos(cross * Math.PI)} scale={1.7} />}
      </svg>

      <div style={{ position: 'absolute', left: SIDE, right: SIDE, top: H * 0.36, zIndex: 4, textAlign: 'center', color: INK }}>
        <div style={{ opacity: first, filter: first < 1 ? `blur(${(1 - first) * 10}px)` : undefined }}>
          {/* Empieza "antes" del frame 0: la reproducción automática ya abre con texto */}
          <Words text="Tu vuelo tiene *huella.*" start={-14} stagger={3} style={{ fontSize: 124 }} />
        </div>
        <div style={{ position: 'absolute', inset: 0 }}>
          <Words text="¿Cuánto CO₂ deja tu *próximo vuelo?*" start={104} stagger={4} style={{ fontSize: 104 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Mapa: recorte del cono sur alrededor de la ruta, a sangre arriba y a los
// lados; abajo se funde con el fondo antes de la lectura ──
const VB = { x: 55, y: 15, w: 180, h: 135 }; // unidades de LAND_PATH
const MAP = { x: -40, y: -40, w: 1200, h: 900 }; // px de salida (misma proporción)
const MAP_FADE = [680, 860]; // y donde el mapa se desvanece
const toScreen = ([mx, my]: [number, number]): Pt => ({
  x: MAP.x + ((mx - VB.x) / VB.w) * MAP.w,
  y: MAP.y + ((my - VB.y) / VB.h) * MAP.h,
});

/** Santiago → Lima: el avión dibuja el arco y la huella cuenta hasta el valor real. */
const Route: React.FC = () => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();

  const A = toScreen(project(FLIGHT.from.lat, FLIGHT.from.lon));
  const B = toScreen(project(FLIGHT.to.lat, FLIGHT.to.lon));
  const Cc: Pt = { x: (A.x + B.x) / 2 - 230, y: (A.y + B.y) / 2 + 30 }; // el arco sale al Pacífico
  const arcD = `M${A.x} ${A.y} Q${Cc.x} ${Cc.y} ${B.x} ${B.y}`;

  const mapIn = prog(f, [0, 30]);
  const scl = prog(f, [18, 30], backOut(2));
  const arcT = prog(f, [28, 108], easeInOut);
  const lim = prog(f, [100, 112], backOut(2));
  const onArc = quad(A, Cc, B, arcT);
  const flying = arcT > 0 && arcT < 1;
  const kg = FLIGHT.kg * prog(f, [46, 118], (t) => 1 - (1 - t) ** 3);

  const label = (p: Pt, code: string, city: string, t: number) => (
    <div style={{ position: 'absolute', left: p.x + 30, top: p.y - 30, zIndex: 4, fontFamily: FONT_MONO, color: INK, ...rise(t, 10) }}>
      <div style={{ fontSize: 34, fontWeight: 500, letterSpacing: '0.04em', lineHeight: 1.1 }}>{code}</div>
      <div style={{ fontSize: 24, color: INK_SOFT }}>{city}</div>
    </div>
  );

  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <mask id="li-route" maskUnits="userSpaceOnUse">
            <path d={arcD} pathLength={1} fill="none" stroke="#fff" strokeWidth="26" strokeLinecap="round" style={draw(arcT)} />
          </mask>
          <filter id="li-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <linearGradient id="li-map-fade-g" gradientUnits="userSpaceOnUse" x1="0" y1={MAP_FADE[0]} x2="0" y2={MAP_FADE[1]}>
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id="li-map-fade" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
            <rect width={W} height={H} fill="url(#li-map-fade-g)" />
          </mask>
        </defs>
        <g mask="url(#li-map-fade)">
          <g opacity={mapIn} transform={`translate(${W / 2} ${H * 0.3}) scale(${1.04 - 0.04 * mapIn}) translate(${-W / 2} ${-H * 0.3})`}>
            <svg x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} overflow="hidden">
              <path d={LAND_PATH} fill="#DCE9E2" stroke="#B9CFC4" strokeWidth="0.4" strokeLinejoin="round" />
            </svg>
          </g>
        </g>
        <path d={arcD} fill="none" stroke="#fff" strokeWidth="16" strokeLinecap="round" filter="url(#li-soft)" opacity={0.9} mask="url(#li-route)" />
        <path d={arcD} fill="none" stroke={GREEN} strokeWidth="5" strokeLinecap="round" strokeDasharray="0.5 16" mask="url(#li-route)" />
        {[{ p: A, t: scl }, { p: B, t: lim }].map(({ p, t }, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) scale(${t})`}>
            <circle r="18" fill="#fff" opacity="0.85" />
            <circle r="9" fill={INK} />
          </g>
        ))}
        {flying && <PlaneAt x={onArc.x} y={onArc.y} angle={quadAngle(A, Cc, B, arcT)} scale={0.95} />}
      </svg>

      <Kicker style={{ position: 'absolute', left: SIDE, top: 96, ...rise(prog(f, [8, 28])) }}>Un vuelo de ejemplo</Kicker>
      {label(A, FLIGHT.from.code, FLIGHT.from.city, scl)}
      {label(B, FLIGHT.to.code, FLIGHT.to.city, lim)}

      {/* Lectura */}
      <div style={{ position: 'absolute', left: SIDE, right: SIDE, top: 868, textAlign: 'center', color: INK, ...rise(prog(f, [36, 56]), 18) }}>
        <Kicker>Santiago ⇄ Lima emite</Kicker>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 18, margin: '14px 0 18px' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 168, fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {fmt.kg(kg)}
          </span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 48, fontWeight: 500, color: INK_SOFT }}>kg CO₂e</span>
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 34, color: INK_SOFT }}>Ida y vuelta · clase económica · 1 pasajero</div>
        <div style={{ ...rise(prog(f, [112, 132]), 10), marginTop: 14, fontFamily: FONT_MONO, fontSize: 26, color: INK_SOFT }}>
          {fmt.int(FLIGHT.kmTotal)} km · factor {fmt.factor(FLIGHT.factor)} · {FLIGHT.methodology}
        </div>
      </div>
    </AbsoluteFill>
  );
};
