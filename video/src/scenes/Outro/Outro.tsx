// 26-30 s: zoom out que deja la landing completa como una pantalla flotante
// sobre el teal de marca, con logo, URL y tagline. 29-30 s en reposo.
import React from 'react';
import { Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Shot } from '../../camera/Camera';
import { BRAND } from '../../data/example';
import { isPortrait, SAFE, typeUnit } from '../../formats';
import { FONT_BODY, FONT_DISPLAY } from '../../theme/fonts';
import { C, EASE_OUT } from '../../theme/palette';
import { T } from '../../timing';
import { STAGE_WIDTH } from '../../ui/Stage';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Caja de pantalla donde queda la landing al final. El texto ocupa el resto. */
const landingBox = (width: number, height: number) =>
  isPortrait(width, height)
    ? { x: SAFE, y: SAFE, w: width - SAFE * 2, h: height * 0.58 - SAFE }
    : { x: SAFE, y: 90, w: width * 0.5 - SAFE, h: height - 180 };

export const outroShot = (width: number, height: number, stageHeight: number): Shot => {
  const box = landingBox(width, height);
  return {
    cx: STAGE_WIDTH / 2,
    cy: stageHeight / 2,
    scale: Math.min(box.w / STAGE_WIDTH, box.h / stageHeight),
    sx: box.x + box.w / 2,
    sy: box.y + box.h / 2,
  };
};

/** 0-1: el lienzo claro se retira y la landing se convierte en "pantalla". */
export const useOutroFrame = (frame: number) =>
  interpolate(frame, T.outroFrameIn, [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });

export const OUTRO_TEXT_FROM = T.outroTextIn[0];

export const Outro: React.FC = () => {
  const frame = useCurrentFrame(); // local: 0 = T.outroTextIn[0]
  const { width, height } = useVideoConfig();
  const u = typeUnit(width, height);
  const portrait = isPortrait(width, height);
  const span = T.outroTextIn[1] - T.outroTextIn[0];

  // Logo, URL y tagline entran en cascada y quedan quietos antes de T.rest.
  const enter = (i: number) =>
    interpolate(frame, [i * 8, i * 8 + span - 16], [0, 1], { ...clamp, easing: Easing.bezier(...EASE_OUT) });
  const style = (i: number): React.CSSProperties => ({
    opacity: enter(i),
    transform: `translateY(${(1 - enter(i)) * 18 * u}px)`,
  });

  return (
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: portrait ? 'center' : 'flex-start',
        ...(portrait
          ? { top: height * 0.6, bottom: SAFE, left: SAFE, right: SAFE }
          : { top: SAFE, bottom: SAFE, left: width * 0.5 + 80, right: SAFE }),
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: portrait ? 'center' : 'flex-start',
          gap: 28 * u,
          textAlign: portrait ? 'center' : 'left',
        }}
      >
        <Img
          src={staticFile('brand/logo-horizontal-white.svg')}
          style={{ height: 78 * u, width: 'auto', ...style(0) }}
        />
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: 58 * u,
            letterSpacing: '-0.01em',
            lineHeight: 1,
            color: C.canvas,
            ...style(1),
          }}
        >
          {BRAND.url}
        </div>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 500,
            fontSize: 30 * u,
            letterSpacing: '0.01em',
            color: 'rgba(247, 250, 248, 0.68)',
            ...style(2),
          }}
        >
          {BRAND.tagline}
        </div>
      </div>
    </div>
  );
};
