import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { isPortrait, SAFE, typeUnit } from '../formats';
import { FONT_DISPLAY } from '../theme/fonts';
import { C, EASE_OUT } from '../theme/palette';
import { CAPTION_FADE } from '../timing';

/**
 * Frase corta sobre la landing (máx. 6 palabras). Va dentro de una <Sequence>:
 * entra al inicio y sale al final de su duración. En 16:9 se ancla abajo a la
 * izquierda; en 4:5, abajo al centro. Siempre dentro del margen seguro.
 */
export const Caption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const u = typeUnit(width, height);
  const portrait = isPortrait(width, height);

  const enter = interpolate(frame, [0, CAPTION_FADE], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_OUT),
  });
  const exit = interpolate(frame, [durationInFrames - CAPTION_FADE, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  const t = enter - exit;

  return (
    <AbsoluteFill
      style={{
        padding: SAFE,
        justifyContent: 'flex-end',
        alignItems: portrait ? 'center' : 'flex-start',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 600,
          fontSize: 46 * u,
          letterSpacing: '-0.005em',
          lineHeight: 1.1,
          color: C.ink,
          padding: `${18 * u}px ${30 * u}px`,
          borderRadius: 999,
          // Cristal de la landing (--ctv-glass-bg) para leerse sobre la UI.
          background: 'rgba(255, 255, 255, 0.82)',
          border: '1px solid rgba(7, 61, 61, 0.10)',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 1px 2px rgba(7, 61, 61, 0.05), 0 24px 60px -32px rgba(7, 61, 61, 0.28)',
          opacity: t,
          filter: `blur(${(1 - t) * 6}px)`,
          transform: `translateY(${(1 - t) * 14 * u}px)`,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
