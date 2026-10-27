import React, { createContext, useContext } from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Range } from '../timing';

/**
 * Un plano de cámara: el punto (cx, cy) del escenario se ve en el punto
 * (sx, sy) de la pantalla, con zoom `scale`. Es lo mismo que un
 * transform-origin sobre el elemento enfocado, pero permite además decidir
 * dónde queda en pantalla (el outro deja la landing a un lado del texto).
 */
export type Shot = { cx: number; cy: number; scale: number; sx: number; sy: number };

export type CameraMove = { range: Range; to: Shot };

export type Rect = { x: number; y: number; w: number; h: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// El zoom se interpola en escala logarítmica: de 1 a 2 se siente igual de
// rápido que de 2 a 4, que es como el ojo percibe un acercamiento.
export const mixShots = (a: Shot, b: Shot, t: number): Shot => ({
  cx: lerp(a.cx, b.cx, t),
  cy: lerp(a.cy, b.cy, t),
  sx: lerp(a.sx, b.sx, t),
  sy: lerp(a.sy, b.sy, t),
  scale: Math.exp(lerp(Math.log(a.scale), Math.log(b.scale), t)),
});

/** Plano que encuadra `rect` centrado en pantalla, con `pad` px de escenario alrededor. */
export const frameRect = (
  rect: Rect,
  screen: { width: number; height: number },
  pad: { x: number; y: number },
): Shot => ({
  cx: rect.x + rect.w / 2,
  cy: rect.y + rect.h / 2,
  scale: Math.min(screen.width / (rect.w + pad.x * 2), screen.height / (rect.h + pad.y * 2)),
  sx: screen.width / 2,
  sy: screen.height / 2,
});

/**
 * Plano actual según los movimientos. Cada movimiento es un spring con
 * damping 200 (sin rebote) estirado para terminar justo en range[1]. Fuera de
 * los movimientos la cámara está quieta.
 */
export const useCameraShot = (base: Shot, moves: CameraMove[]): Shot => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return moves.reduce((shot, move) => {
    const [start, end] = move.range;
    const t = spring({
      frame: Math.max(0, frame - start),
      fps,
      config: { damping: 200 },
      durationInFrames: end - start,
    });
    return mixShots(shot, move.to, t);
  }, base);
};

// Escala actual de la cámara, para que el rack focus mantenga el desenfoque
// en 12 px de pantalla aunque el contenido esté ampliado.
const CameraScaleContext = createContext(1);
export const useCameraScale = () => useContext(CameraScaleContext);

type CameraProps = {
  shot: Shot;
  /** Desenfoque de todo el contenido, en px de pantalla. */
  blur?: number;
  opacity?: number;
  /** Capa bajo el contenido que se mueve con la cámara pero nunca se desenfoca
      (un plano de color enorme: desenfocarlo costaría mucho y no se notaría). */
  backdrop?: React.ReactNode;
  children: React.ReactNode;
};

export const Camera: React.FC<CameraProps> = ({ shot, blur = 0, opacity = 1, backdrop, children }) => {
  const transform = `translate(${shot.sx - shot.cx * shot.scale}px, ${shot.sy - shot.cy * shot.scale}px) scale(${shot.scale})`;
  const layer: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    transformOrigin: '0 0',
    transform,
  };

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {backdrop ? <div style={layer}>{backdrop}</div> : null}
      <div
        style={{
          ...layer,
          opacity,
          // El filtro va dentro del transform, así que se divide por la escala
          // para que el desenfoque en pantalla sea el pedido.
          filter: blur > 0.01 ? `blur(${blur / shot.scale}px)` : undefined,
        }}
      >
        <CameraScaleContext.Provider value={shot.scale}>{children}</CameraScaleContext.Provider>
      </div>
    </AbsoluteFill>
  );
};
