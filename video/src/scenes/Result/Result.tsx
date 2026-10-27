// 15-21 s: count-up de los kg de CO₂e, un único pulso de brillo y el detalle
// (km, toneladas, árboles, precio).
import React from 'react';
import { Easing, interpolate } from 'remotion';
import { EXAMPLE } from '../../data/example';
import { EASE_OUT } from '../../theme/palette';
import { T } from '../../timing';
import { Caption } from '../../ui/Caption';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const useResultView = (frame: number) => {
  const count = interpolate(frame, T.countUp, [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const [p0, p1] = T.numberPulse;

  return {
    kg: frame < T.countUp[0] ? null : EXAMPLE.kgCO2e * count,
    pulse: interpolate(frame, [p0, p0 + 8, p1], [0, 1, 0], { ...clamp, easing: Easing.inOut(Easing.sin) }),
    meta: interpolate(frame, T.resultMetaIn, [0, 1], { ...clamp, easing: Easing.bezier(...EASE_OUT) }),
  };
};

export const ResultCaption: React.FC = () => <Caption text={`Factores oficiales ${EXAMPLE.methodology}.`} />;
