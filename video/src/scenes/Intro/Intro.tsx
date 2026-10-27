// 0-3 s: "Cada vuelo deja huella." sobre el planeta.
// 3-7 s: el texto se desenfoca y entra la landing ("Mídela en segundos.").
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SAFE, typeUnit } from '../../formats';
import { FONT_DISPLAY } from '../../theme/fonts';
import { C, EASE_OUT } from '../../theme/palette';
import { T, type Range } from '../../timing';
import { GlobeCanvas } from '../../ui/Globe';

const ease = Easing.bezier(...EASE_OUT);
const progress = (frame: number, range: Range, easing = ease) =>
  interpolate(frame, range, [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

export const INTRO_DURATION = T.introGlobeOut[1]; // la secuencia dura hasta que el planeta se va

/** Planeta como horizonte: solo asoma el casquete superior, sutil. Va debajo
    de la landing, que lo tapa al entrar. */
export const IntroPlanet: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const globeIn = progress(frame, T.introGlobeIn);
  const globeOut = progress(frame, T.introGlobeOut, Easing.in(Easing.cubic));

  return (
    <AbsoluteFill
      style={{
        opacity: 0.6 * globeIn * (1 - globeOut),
        filter: globeOut > 0 ? `blur(${12 * globeOut}px)` : undefined,
      }}
    >
      <GlobeCanvas
        width={width}
        height={height}
        tiltX={-0.9}
        spin0={-0.55}
        position={[0, -4.35, 0]}
        scale={2.2}
        camera={{ position: [0, 0, 6], fov: 35 }}
        atmosphere={false}
      />
    </AbsoluteFill>
  );
};

/** "Cada vuelo deja huella." Va encima de todo. */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const u = typeUnit(width, height);
  const textIn = progress(frame, T.introTextIn);
  const textOut = progress(frame, T.introTextOut, Easing.in(Easing.cubic));

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: SAFE,
        paddingBottom: SAFE + 120 * u,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: FONT_DISPLAY,
          fontWeight: 600,
          fontSize: 124 * u,
          lineHeight: 1.04,
          letterSpacing: '-0.015em',
          color: C.canvas,
          textAlign: 'center',
          textWrap: 'balance',
          opacity: textIn * (1 - textOut),
          filter: `blur(${(1 - textIn) * 10 + textOut * 16}px)`,
          transform: `translateY(${(1 - textIn) * 16 * u}px) scale(${1 + textOut * 0.03})`,
        }}
      >
        Cada vuelo deja huella.
      </h1>
    </AbsoluteFill>
  );
};

/** Entrada de la landing sobre el fondo teal (90-210). */
export const useLandingEntry = (frame: number) => {
  const plane = progress(frame, T.bgToCanvas, Easing.bezier(0.65, 0, 0.35, 1));
  const p = progress(frame, T.landingIn);
  return {
    plane, //                     lienzo claro detrás de la landing
    opacity: p,
    blur: (1 - p) * 16, //         px de pantalla
    scale: 0.96 + 0.04 * p, //     multiplica el zoom de la cámara
  };
};
