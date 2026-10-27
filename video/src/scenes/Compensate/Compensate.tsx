// 21-26 s: rack focus al CTA (sin mover la cámara), pulsación y estado
// "Huella compensada".
import React from 'react';
import { Easing, interpolate } from 'remotion';
import { EASE_OUT } from '../../theme/palette';
import { T } from '../../timing';
import { Caption } from '../../ui/Caption';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const useCompensateView = (frame: number) => {
  const [press0, press1] = T.ctaPress;
  return {
    ctaAccent: interpolate(frame, T.ctaAccent, [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) }),
    // Baja rápido (4 f) y vuelve con suavidad, sin pasarse de 1.
    ctaScale: interpolate(frame, [press0, press0 + 4, press1], [1, 0.97, 1], {
      ...clamp,
      easing: Easing.inOut(Easing.quad),
    }),
    actionOut: interpolate(frame, T.actionOut, [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }),
    done: interpolate(frame, T.doneIn, [0, 1], { ...clamp, easing: Easing.bezier(...EASE_OUT) }),
  };
};

export const CompensateCaption: React.FC = () => <Caption text="Compénsala con un clic." />;
