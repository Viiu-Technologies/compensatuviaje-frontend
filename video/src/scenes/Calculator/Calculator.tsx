// 7-15 s: zoom a la calculadora y llenado en cascada (8 frames entre campos):
// origen → destino → cabina → pasajeros.
import { Easing, interpolate } from 'remotion';
import { EXAMPLE } from '../../data/example';
import { EASE_OUT } from '../../theme/palette';
import { T } from '../../timing';
import type { FieldFill } from '../../ui/AirportCard';
import type { FormFill } from '../../ui/CalculatorCard';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = Easing.bezier(...EASE_OUT);

/** Frame en que empieza a llenarse el campo i. */
const fieldStart = (i: number) => T.fillStart + i * T.fillStagger;

// El campo se "enciende" un poco antes de escribirse y se apaga al terminar,
// como el :focus-within de la tarjeta real.
const activeAt = (frame: number, start: number) =>
  interpolate(frame, [start - 4, start, start + 18, start + 30], [0, 1, 1, 0], clamp);

const airportFill = (frame: number, start: number): FieldFill => {
  const letterCount = EXAMPLE.origin.code.length;
  return {
    letters: interpolate(frame, [start, start + letterCount * T.letterFrames], [0, letterCount], clamp),
    meta: interpolate(frame, [start + 6, start + 18], [0, 1], { ...clamp, easing: ease }),
    active: activeAt(frame, start),
  };
};

const valueFill = (frame: number, start: number) =>
  interpolate(frame, [start, start + 10], [0, 1], { ...clamp, easing: ease });

export const useFormFill = (frame: number): FormFill => ({
  origin: airportFill(frame, fieldStart(0)),
  destination: airportFill(frame, fieldStart(1)),
  cabin: valueFill(frame, fieldStart(2)),
  cabinActive: activeAt(frame, fieldStart(2)),
  passengers: valueFill(frame, fieldStart(3)),
  passengersActive: activeAt(frame, fieldStart(3)),
});
