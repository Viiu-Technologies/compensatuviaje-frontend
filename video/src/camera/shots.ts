// Los planos se calculan a partir del layout medido de la landing, así sirven
// igual para 16:9 y 4:5: cada plano dice "encuadra este elemento".
import { isPortrait } from '../formats';
import { outroShot } from '../scenes/Outro/Outro';
import { STAGE_WIDTH, type StageLayout } from '../ui/Stage';
import { frameRect, type Shot } from './Camera';

/** Evita que el plano muestre lo que queda fuera del escenario, si cabe. */
const keepInsideStage = (shot: Shot, width: number, height: number, stageHeight: number): Shot => {
  const halfW = width / 2 / shot.scale;
  const halfH = height / 2 / shot.scale;
  const fit = (c: number, half: number, size: number) =>
    half * 2 >= size ? size / 2 : Math.min(Math.max(c, half), size - half);
  return { ...shot, cx: fit(shot.cx, halfW, STAGE_WIDTH), cy: fit(shot.cy, halfH, stageHeight) };
};

// La entrada de la landing escala de 0.96 a 1: el plano base necesita ese
// margen para que los bordes del escenario no asomen a los lados.
const withMinScale = (shot: Shot, width: number): Shot => ({
  ...shot,
  scale: Math.max(shot.scale, width / (STAGE_WIDTH * 0.95)),
});

export const buildShots = (layout: StageLayout, width: number, height: number) => {
  const screen = { width, height };
  const portrait = isPortrait(width, height);

  return {
    // Plano base (3-7 s): la landing con la calculadora al centro.
    landing: keepInsideStage(withMinScale(frameRect(layout.calculator, screen, { x: 90, y: 140 }), width), width, height, layout.height),
    // M1: tarjetas de aeropuerto + cabina y pasajeros.
    form: frameRect(layout.form, screen, portrait ? { x: 50, y: 60 } : { x: 170, y: 90 }),
    // M2: panel de impacto completo (número a la izquierda, CTA a la derecha).
    result: frameRect(layout.impact, screen, portrait ? { x: 20, y: 40 } : { x: 24, y: 40 }),
    // M3: la landing completa como pantalla flotante.
    outro: outroShot(width, height, layout.height),
  };
};

// Solo para el primer render, antes de medir (delayRender evita que se capture).
export const PLACEHOLDER_LAYOUT: StageLayout = {
  height: 1600,
  calculator: { x: 400, y: 700, w: 1120, h: 760 },
  form: { x: 448, y: 830, w: 1024, h: 290 },
  impact: { x: 448, y: 1220, w: 1024, h: 200 },
};
