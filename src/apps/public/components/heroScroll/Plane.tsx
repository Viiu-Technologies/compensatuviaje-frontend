import React from 'react';

/**
 * Avión de línea en vista 3/4 desde abajo, estilo ilustración plana: silueta
 * en tinta, franja de ventanillas, cabina y tomas de aire en blanco. Las piezas
 * del lado lejano (ala, motor y estabilizador) van en un tono más claro para
 * dar profundidad.
 *
 * Apunta a +x y está centrado en el origen (unas 150 × 90 unidades): MotionPath
 * mueve y rota el <g> exterior según la tangente del camino; la escala y la
 * opacidad van en el interior para que las dos animaciones no se pisen.
 */

const INK = '#0E3B36';
const FAR = '#3D6A63'; // lado lejano, un paso más claro
const WHITE = '#FFFFFF';

// Ventanillas de la franja: x de cada una, con el hueco de la puerta sobre el ala.
const WINDOWS = [-41, -35.5, -30, -24.5, -19, -13.5, -8, 3, 8.5, 14, 19.5, 25];

const Plane: React.FC = () => (
  <g className="hs-plane">
    <g className="hs-plane__body">
      {/* ── Lado lejano: detrás del fuselaje ── */}
      <path fill={FAR} d="M-54 -7 L-76 -18.4 C-77.6 -19.4 -76.6 -21.6 -74.6 -21 L-63 -9.2 Z" />
      <path fill={FAR} d="M13 -8.5 L-33 -40 C-35.4 -42.4 -39.8 -43.2 -41.2 -40.8 L-5 -8.5 Z" />
      <g>
        <path fill={FAR} d="M-9 -24.5 L8 -24.5 C12.6 -24.5 14.6 -21.4 14.6 -18 C14.6 -14.6 12.6 -11.5 8 -11.5 L-9 -11.5 C-11 -11.5 -12 -14.6 -12 -18 C-12 -21.4 -11 -24.5 -9 -24.5 Z" />
        <path fill="none" stroke={WHITE} strokeWidth="1" strokeLinecap="round" opacity="0.5" d="M-7 -21.6 L8 -21.6" />
        <ellipse fill={WHITE} cx="14.2" cy="-18" rx="2.8" ry="6.4" />
        <ellipse fill={FAR} cx="15" cy="-18" rx="1.4" ry="4" />
      </g>

      {/* ── Deriva con su panel blanco ── */}
      <path fill={INK} d="M-43 -8.5 L-59.5 -35.5 C-61 -38 -64.8 -38.2 -66 -35.6 L-64.5 -7 Z" />
      <path fill={WHITE} d="M-54.5 -11 L-60.6 -26.5 L-62.6 -26.5 L-62.2 -11 Z" />

      {/* ── Fuselaje: cola levantada, nariz redondeada ── */}
      <path
        fill={INK}
        d="M-69 -4.5 C-67 -8.4 -61 -9.4 -51 -9.4 L38 -9.4 C54 -9.4 64.5 -5.2 67.5 0 C64.5 5.2 54.5 9.4 38 9.4 L-33 9.4 C-48 9.4 -60.5 4.4 -69 -4.5 Z"
      />
      {/* Franja de ventanillas */}
      <path
        fill={WHITE}
        d="M-44.5 -5 L31 -5 C33 -5 34.2 -3.8 34.2 -2.2 C34.2 -0.6 33 0.6 31 0.6 L-44.5 0.6 C-46.5 0.6 -47.7 -0.6 -47.7 -2.2 C-47.7 -3.8 -46.5 -5 -44.5 -5 Z"
      />
      {WINDOWS.map((x) => (
        <rect key={x} fill={INK} x={x} y="-3.9" width="2.7" height="3.4" rx="1.35" />
      ))}
      {/* Cabina */}
      <path fill={WHITE} d="M45.5 -6.4 C52 -7 58.4 -5.4 61.6 -2.6 L50.4 -2 C48 -1.9 46.2 -3.2 45.5 -6.4 Z" />
      {/* Reflejo del vientre */}
      <path fill="none" stroke={WHITE} strokeWidth="1.1" strokeLinecap="round" opacity="0.55" d="M-28 6.4 C-2 8 28 8 50 5.4" />

      {/* ── Lado cercano: delante del fuselaje ── */}
      <path fill={INK} d="M-45 5 L-73 23.4 C-74.6 25 -72.6 27.2 -70.4 26.2 L-60 7 Z" />
      <path fill={INK} d="M21 2.5 L-24 44.2 C-26 46.8 -31 47 -32.4 44.2 L-9 6 Z" />
      {/* Línea del borde de ataque, como en la ilustración de referencia */}
      <path fill="none" stroke={WHITE} strokeWidth="1" strokeLinecap="round" opacity="0.6" d="M16.6 7 L-20.6 41.4" />
      <g>
        <path fill={INK} d="M-8 16.5 L11 16.5 C16.4 16.5 19 20.2 19 24.5 C19 28.8 16.4 32.5 11 32.5 L-8 32.5 C-10.6 32.5 -11.8 28.8 -11.8 24.5 C-11.8 20.2 -10.6 16.5 -8 16.5 Z" />
        <path fill="none" stroke={WHITE} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" d="M-6 19.8 C0 19.2 6 19.2 12 19.8" />
        <ellipse fill={WHITE} cx="18.4" cy="24.5" rx="3.4" ry="8" />
        <ellipse fill={INK} cx="19.4" cy="24.5" rx="1.8" ry="5" />
      </g>
    </g>
  </g>
);

export default Plane;
