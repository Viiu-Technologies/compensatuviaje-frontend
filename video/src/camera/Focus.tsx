import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { FOCUS_FADE, FOCUS_STEPS } from '../timing';
import { useCameraScale } from './Camera';

const BLUR_PX = 12; //       desenfoque en pantalla de lo que no está en foco
const DIM_OPACITY = 0.4; //  opacidad de lo que no está en foco

/** 0 = nítido, 1 = desenfocado del todo. */
export const defocusAt = (id: string, frame: number) => {
  const target = (sharp: string[] | null) => (sharp === null || sharp.includes(id) ? 0 : 1);

  return FOCUS_STEPS.slice(1).reduce((value, step) => {
    const t = interpolate(frame, [step.at, step.at + FOCUS_FADE], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.65, 0, 0.35, 1),
    });
    return value + (target(step.sharp) - value) * t;
  }, target(FOCUS_STEPS[0].sharp));
};

type FocusProps = {
  id: string;
  className?: string;
  style?: React.CSSProperties;
  as?: 'div' | 'nav' | 'header' | 'section';
  children?: React.ReactNode;
};

/**
 * Pieza de la UI que participa en el rack focus. Se renderiza como el propio
 * elemento (recibe su className), así no añade cajas que alteren el layout de
 * la landing.
 */
export const Focus: React.FC<FocusProps> = ({ id, className, style, as = 'div', children }) => {
  const frame = useCurrentFrame();
  const scale = useCameraScale();
  const d = defocusAt(id, frame);
  const Tag = as;

  return (
    <Tag
      className={className}
      data-focus={id}
      style={{
        ...style,
        filter: d > 0.001 ? `blur(${(BLUR_PX * d) / scale}px)` : style?.filter,
        opacity: (style?.opacity === undefined ? 1 : Number(style.opacity)) * (1 - (1 - DIM_OPACITY) * d),
      }}
    >
      {children}
    </Tag>
  );
};
