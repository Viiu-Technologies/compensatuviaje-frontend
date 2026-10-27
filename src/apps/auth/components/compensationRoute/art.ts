// El SVG estático de "La ruta de tu compensación", en orden de pintado (atrás →
// adelante, abajo → arriba). Las piezas que se mueven se dibujan en su pose de
// reposo dentro de un <g data-part> que la parte animada traslada.
import * as k from '../../../../shared/iso/iso-kit.ts';
import type { Plan, Point3 } from '../../../../shared/iso/iso-kit.ts';
import { COPY } from './copy.ts';
import {
  ACTUATOR_TOP, ARM, ARM_TOP, ARM_Z, BEAM_TOP, BEAM_Z, BELT_FROM, BELT_HALF, BELT_TO, BELT_TOP, BELT_Z, BLOCK_X, BOX, BOX_TOP,
  DISPENSER, DISPENSER_TOP, CAMERA, CAMERA_Z, CLEAT, COLUMN_TOP, CUBE, DIAL_H, DIAL_R, DIAL_TOP, DIAL_Z, DIE_H, DIE_R, DIE_REST, FOOT_H, FRAME_Z, GANTRY_X,
  GATE_BAR_TOP, GATE_H, GATE_LOW, GATE_POST_TOP, GATE_ROD, GATE_T, GATE_X, GUARD_W, HEIGHT, HOUSING_R, HOUSING_Z, LEDGER, LEDGER_TOP,
  LEG_X, LENS_R, LENS_Z, LOUPE_AT, LOUPE_R, LOUPE_Z, NEEDLE_LOAD, NEW_BLOCK_X, P, PALLET, PALLET_TOP, PLATE, PLATE_H, POST_Y, PRESS_BASE,
  PRESS_BASE_TOP, PRESS_COLUMN, PRESS_X, RAIL_W, RAM_LEN, RAM_R, SCALE_AT, SCALE_BASE, STATION_X, STRIP, STRIP_TOP, TERMINAL,
  TERMINAL_TOP, TERMINAL_Z, TICK, WEIGH, WIDTH,
} from './view.ts';

const at = (point: Point3) => k.iso(point, P);
const S = (paths: k.SolidPaths, style?: Parameters<typeof k.solidSvg>[1]) => k.solidSvg(paths, style);
const L = (d: string, style?: Parameters<typeof k.lineSvg>[1]) => k.lineSvg(d, style);
const D = (points: Array<[number, number]>, style?: Parameters<typeof k.dotsSvg>[1]) => k.dotsSvg(points, style);
const depth = ([x, y]: [number, number]) => k.depthOf([x, y, 0], P);
const byDepth = (points: Array<[number, number]>) => [...points].sort((a, b) => depth(a) - depth(b));
const halo = (plan: Plan, z: number, blur = 3) =>
  `<path class="iso-halo" d="${k.haloOf(k.insetPlan(plan, 1.5), z, 0.1, P)}" style="filter:blur(${blur}px)"/>`;
/** Cuatro tornillos en las esquinas de la cara superior de una placa. */
const screws = (plan: Plan, z: number, inset = 2.2, size = 0.42) => D(k.corners(plan, inset).map(([x, y]) => at([x, y, z])), { size });
/** Contorno cerrado en una cara vertical de normal y (ranuras, ventanas). */
const slotOnFaceY = (y: number, x0: number, x1: number, z0: number, z1: number) =>
  k.pathOf([at([x0, y, z0]), at([x1, y, z0]), at([x1, y, z1]), at([x0, y, z1])], true);

// ───────────────────────── Banco ─────────────────────────

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: 'lo' }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: 'mid' }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: 'mid' }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: 'lo' }));
  const corners = k.corners(PLATE, 10);
  out.push(L(corners.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(''), { tone: 'lo' }));
  out.push(D(corners.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));

  // Placa de datos en la esquina trasera izquierda: tres renglones grabados.
  const label: Plan = { x: PLATE.x + 8, y: PLATE.y + 5, w: 40, d: 9, r: 1 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: 'lo', crease: 'none' }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.4), 0.8, P, 3), { tone: 'faint' }));
  [[22, 0], [16, 2.4], [19, 4.8]].forEach(([length, dy]) => {
    out.push(L(k.lineOnTop([label.x + 5, label.y + 2.4 + dy], [label.x + 5 + length, label.y + 2.4 + dy], 0.8, P), { tone: 'lo', free: true }));
  });
  out.push(D([at([label.x + 2.4, label.y + label.d / 2, 0.8]), at([label.x + label.w - 2.4, label.y + label.d / 2, 0.8])], { size: 0.45 }));
  return out.join('');
}

/** Regla delantera: una muesca cada 14, mayor bajo cada estación, con tantos puntos como su número. */
function ruler() {
  const out = [S(k.slabOf(STRIP, 0, STRIP_TOP, P, 3), { tone: 'lo', crease: 'none' })];
  const edge = STRIP.y;
  const minor: string[] = [];
  const major: string[] = [];
  for (let x = STRIP.x + 4; x <= STRIP.x + STRIP.w - 4; x += TICK) {
    const isStation = STATION_X.some((sx) => Math.abs(sx - x) < 0.01);
    (isStation ? major : minor).push(k.lineOnTop([x, edge], [x, edge + (isStation ? 4.4 : 2.2)], STRIP_TOP, P));
  }
  out.push(L(minor.join(''), { tone: 'lo' }), L(major.join(''), { tone: 'mid' }));
  const pips: Array<[number, number]> = [];
  STATION_X.forEach((sx, index) => {
    for (let n = 0; n <= index; n++) pips.push(at([sx + (n - index / 2) * 1.7, edge + 6.2, STRIP_TOP]));
  });
  out.push(D(pips, { size: 0.42, tone: 'mid' }));
  out.push(D([at([STRIP.x + 2, STRIP.y + STRIP.d / 2, STRIP_TOP]), at([STRIP.x + STRIP.w - 2, STRIP.y + STRIP.d / 2, STRIP_TOP])], { size: 0.42 }));
  return out.join('');
}

// ───────────────────── Detrás de la cinta ─────────────────────

/** Pata de la cinta bajo un larguero: zapata atornillada y montante. */
function leg(x: number, y: number) {
  const pad: Plan = { x: x - 4, y: y - 3.5, w: 8, d: 7, r: 1 };
  const post: Plan = { x: x - 2.5, y: y - 2, w: 5, d: 4, r: 0.6 };
  return [
    S(k.slabOf(pad, 0, 1.2, P, 3), { tone: 'lo' }),
    D([at([pad.x + 1.4, y, 1.2]), at([pad.x + pad.w - 1.4, y, 1.2])], { size: 0.4 }),
    S(k.slabOf(post, 1.2, FRAME_Z - 1.2, P, 2), { tone: 'mid' }),
  ].join('');
}

/** 1 · Báscula: base, columna con abrazadera y reloj cara arriba. */
export const needleAt = (load: number) => {
  const angle = load * NEEDLE_LOAD * Math.PI * 2;
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  const [cx, cy] = SCALE_AT;
  return k.lineOnTop([cx - s * 2, cy + c * 2], [cx + s * (DIAL_R - 2.2), cy - c * (DIAL_R - 2.2)], DIAL_TOP + 0.2, P);
};
function scale(load: number) {
  const [cx, cy] = SCALE_AT;
  const out = [halo(SCALE_BASE, 0)];
  out.push(S(k.slabOf(SCALE_BASE, 0, 5, P, 4, 0.6), { tone: 'mid', inner: L(k.sideSeam(SCALE_BASE, 1.6, P, 4), { tone: 'faint' }) }));
  out.push(screws(SCALE_BASE, 5));
  out.push(S(k.cylinder(cx, cy, 4.4, 5, 2.4, P, 28), { tone: 'mid' }));
  out.push(S(k.cylinder(cx, cy, 2.4, 7.4, COLUMN_TOP - 7.4, P, 20), {
    tone: 'mid',
    crease: 'none',
    inner: L(k.sideArc(cx, cy, 2.4, 20, P, 16), { tone: 'faint' }),
  }));
  // Abrazadera con tornillo de mariposa que sostiene el reloj.
  out.push(S(k.cylinder(cx, cy, 4, COLUMN_TOP, DIAL_Z - COLUMN_TOP, P, 28), { tone: 'mid', inner: L(k.sideArc(cx, cy, 4, COLUMN_TOP + 2, P, 20), { tone: 'faint' }) }));
  const thumb: Plan = { x: cx + 3, y: cy - 1.2, w: 4.4, d: 2.4, r: 0.6 };
  out.push(S(k.slabOf(thumb, COLUMN_TOP + 1, 2, P, 2), { tone: 'mid' }));
  out.push(S(k.cylinder(thumb.x + thumb.w + 1.4, cy, 1.8, COLUMN_TOP + 0.4, 3.2, P, 16), { tone: 'mid' }));
  out.push(L(k.knurl(thumb.x + thumb.w + 1.4, cy, 1.8, COLUMN_TOP + 0.4, COLUMN_TOP + 3.6, 14, P, 0.3), { tone: 'lo' }));
  // Reloj.
  out.push(S(k.cylinder(cx, cy, DIAL_R, DIAL_Z, DIAL_H, P, 56, 0.6), { tone: 'hi', crease: 'lo' }));
  out.push(L(k.knurl(cx, cy, DIAL_R, DIAL_TOP - 2, DIAL_TOP, 60, P, 0.25), { tone: 'lo' }));
  out.push(L(k.sideArc(cx, cy, DIAL_R, DIAL_TOP - 2, P, 40), { tone: 'faint' }));
  out.push(L(k.ring(cx, cy, DIAL_R - 1.4, DIAL_TOP, P, 56), { tone: 'lo' }));
  const ticks = k.radialTicks(cx, cy, DIAL_R - 1.4, 40, 5, DIAL_TOP, [0.8, 1.6], P);
  out.push(L(ticks.minor, { tone: 'lo' }), L(ticks.major, { tone: 'mid' }));
  out.push(`<path data-part="needle" class="iso-line" data-tone="hi" data-free="start" d="${needleAt(load)}" style="stroke-width:1"/>`);
  out.push(L(k.ring(cx, cy, 0.9, DIAL_TOP + 0.2, P, 12), { tone: 'mid' }));
  return out.join('');
}

/** Poste de pórtico con su zapata atornillada; `seam` es la junta de la camisa. */
function gantryPost(y: number) {
  const foot: Plan = { x: GANTRY_X - 6, y: y - 5, w: 12, d: 10, r: 1.5 };
  const post: Plan = { x: GANTRY_X - 3, y: y - 3, w: 6, d: 6, r: 1 };
  return [
    S(k.slabOf(foot, 0, 1.5, P, 3, 0.4), { tone: 'lo' }),
    D([at([foot.x + 1.8, foot.y + 1.8, 1.5]), at([foot.x + foot.w - 1.8, foot.y + foot.d - 1.8, 1.5]), at([foot.x + 1.8, foot.y + foot.d - 1.8, 1.5]), at([foot.x + foot.w - 1.8, foot.y + 1.8, 1.5])], { size: 0.4 }),
    S(k.slabOf(post, 1.5, BEAM_Z - 1.5, P, 2, 0.4), { tone: 'mid', inner: L(k.sideSeam(post, 12, P, 2), { tone: 'faint' }) }),
  ].join('');
}

/** Poste de la compuerta: la cara que mira a la cinta lleva la guía de la hoja. */
function gatePost(y0: number, guide: boolean) {
  const post: Plan = { x: GATE_X - 3, y: y0, w: 6, d: 4, r: 0.8 };
  const out = [S(k.slabOf(post, 0, GATE_POST_TOP, P, 2, 0.4), { tone: 'mid', inner: L(k.sideSeam(post, 4, P, 2), { tone: 'faint' }) })];
  if (guide) out.push(L(slotOnFaceY(post.y + post.d, GATE_X - GATE_T / 2 - 0.5, GATE_X + GATE_T / 2 + 0.5, GATE_LOW - 0.5, GATE_POST_TOP - 2.5), { tone: 'lo' }));
  return out.join('');
}

/** Riel de bloques encadenados: cada certificado registrado es un bloque. */
function linkOn(x0: number, x1: number, y: number) {
  const plan: Plan = { x: x0, y: y - 0.8, w: x1 - x0, d: 1.6, r: 0.7 };
  return [
    S(k.slabOf(plan, LEDGER_TOP + CUBE, 0.6, P, 2), { tone: 'lo', crease: 'none' }),
    D([at([x0 + 0.8, y, LEDGER_TOP + CUBE + 0.6]), at([x1 - 0.8, y, LEDGER_TOP + CUBE + 0.6])], { size: 0.38, tone: 'mid' }),
  ].join('');
}
function cube(x: number, tone: k.Tone) {
  const y = LEDGER.y + LEDGER.d / 2;
  const plan: Plan = { x: x - CUBE / 2, y: y - CUBE / 2, w: CUBE, d: CUBE, r: 0.6 };
  return [
    S(k.slabOf(plan, LEDGER_TOP, CUBE, P, 2, 0.3), { tone, crease: tone === 'hi' ? 'lo' : 'faint' }),
    L(k.planOutline(k.insetPlan(plan, 1), LEDGER_TOP + CUBE, P, 2), { tone: 'faint' }),
  ].join('');
}
export function ledger() {
  const y = LEDGER.y + LEDGER.d / 2;
  const out = [S(k.slabOf(LEDGER, 0, LEDGER_TOP, P, 3, 0.4), { tone: 'mid' })];
  const stop: Plan = { x: LEDGER.x, y: LEDGER.y - 1, w: 3, d: LEDGER.d + 2, r: 0.8 };
  out.push(S(k.slabOf(stop, 0, LEDGER_TOP + 4, P, 2), { tone: 'mid' }));
  out.push(D([at([stop.x + 1.5, y - 2, LEDGER_TOP + 4]), at([stop.x + 1.5, y + 2, LEDGER_TOP + 4])], { size: 0.4 }));
  BLOCK_X.forEach((x, index) => {
    out.push(cube(x, 'mid'));
    if (index > 0) out.push(linkOn(BLOCK_X[index - 1], x, y));
  });
  return out.join('');
}
/** El bloque nuevo y su eslabón, en su lugar; la parte animada lo trae desde la prensa. */
const newBlock = () => {
  const y = LEDGER.y + LEDGER.d / 2;
  return cube(NEW_BLOCK_X, 'hi') + linkOn(BLOCK_X[BLOCK_X.length - 1], NEW_BLOCK_X, y);
};

/** Dispensador del riel: de su cara trasera sale el bloque nuevo. */
function dispenser() {
  const out = [halo(DISPENSER, 0)];
  out.push(S(k.slabOf(DISPENSER, 0, DISPENSER_TOP, P, 4, 0.6), { tone: 'mid', inner: L(k.sideSeam(DISPENSER, DISPENSER_TOP - 3, P, 4), { tone: 'faint' }) }));
  out.push(screws(DISPENSER, DISPENSER_TOP, 2));
  out.push(L(k.planOutline(k.insetPlan(DISPENSER, 3), DISPENSER_TOP, P, 3), { tone: 'lo' }));
  return out.join('');
}

/** 4 · Base y columna de la prensa (el brazo va delante de la cinta). */
function pressBack() {
  const out = [halo(PRESS_BASE, 0)];
  out.push(S(k.slabOf(PRESS_BASE, 0, PRESS_BASE_TOP, P, 4, 0.6), { tone: 'mid', inner: L(k.sideSeam(PRESS_BASE, 2.4, P, 4), { tone: 'faint' }) }));
  out.push(screws(PRESS_BASE, PRESS_BASE_TOP));
  out.push(S(k.slabOf(PRESS_COLUMN, PRESS_BASE_TOP, ARM_Z - PRESS_BASE_TOP, P, 3, 0.5), {
    tone: 'mid',
    inner: L(k.sideSeam(PRESS_COLUMN, PRESS_BASE_TOP + 6, P, 3) + k.sideSeam(PRESS_COLUMN, ARM_Z - 8, P, 3), { tone: 'faint' }),
  }));
  return out.join('');
}

/** Motorreductor detrás del tambor derecho: caja, motor con aletas y tapa. */
function motor() {
  const box: Plan = { x: BELT_TO, y: -BELT_HALF - RAIL_W - 2 - 15, w: 13, d: 15, r: 2 };
  const cx = box.x + box.w / 2;
  const cy = box.y + box.d / 2;
  return [
    halo(box, 0),
    S(k.slabOf(box, 0, 16, P, 4, 0.5), { tone: 'mid', inner: L(k.sideSeam(box, 5, P, 4), { tone: 'faint' }) }),
    screws(box, 16, 1.8),
    S(k.cylinder(cx, cy, 5, 16, 13, P, 32), { tone: 'mid', inner: L(k.sideArc(cx, cy, 5, 18, P, 24) + k.sideArc(cx, cy, 5, 27, P, 24), { tone: 'faint' }) }),
    L(k.knurl(cx, cy, 5, 18, 27, 26, P, 0), { tone: 'lo' }),
    S(k.cylinder(cx, cy, 3.4, 29, 2, P, 24), { tone: 'mid' }),
    D([at([cx, cy, 31])], { size: 0.5, tone: 'mid' }),
  ].join('');
}

// ───────────────────────── Cinta ─────────────────────────

const RAIL_BACK: Plan = { x: BELT_FROM, y: -BELT_HALF - RAIL_W, w: BELT_TO - BELT_FROM, d: RAIL_W, r: 1 };
const RAIL_FRONT: Plan = { x: BELT_FROM, y: BELT_HALF, w: BELT_TO - BELT_FROM, d: RAIL_W, r: 1 };
const BELT: Plan = { x: BELT_FROM, y: -BELT_HALF, w: BELT_TO - BELT_FROM, d: BELT_HALF * 2, r: 0.5 };

function railScrews(plan: Plan) {
  const out: Array<[number, number]> = [];
  for (let x = plan.x + 9; x < plan.x + plan.w - 4; x += 27) out.push(at([x, plan.y + plan.d / 2, BELT_TOP]));
  return D(out, { size: 0.38, tone: 'lo' });
}

/** Tacos de la correa: líneas de borde a borde que avanzan con el paquete. */
export const cleatsPath = () => {
  const lines: string[] = [];
  for (let x = BELT_FROM - CLEAT; x <= BELT_TO; x += CLEAT) lines.push(k.lineOnTop([x, -BELT_HALF], [x, BELT_HALF], BELT_TOP, P));
  return lines.join('');
};
const beltClip = () => k.pathOf(
  [at([BELT_FROM, -BELT_HALF, BELT_TOP]), at([BELT_TO, -BELT_HALF, BELT_TOP]), at([BELT_TO, BELT_HALF, BELT_TOP]), at([BELT_FROM, BELT_HALF, BELT_TOP])],
  true,
);

/** Tapa de tambor: caja sobre el banco con el rodamiento en la cara delantera. */
function guard(x: number) {
  const plan: Plan = { x, y: -BELT_HALF - RAIL_W - 2, w: GUARD_W + 2, d: (BELT_HALF + RAIL_W + 2) * 2, r: 3 };
  const cx = plan.x + plan.w / 2;
  const front = plan.y + plan.d;
  const out = [S(k.slabOf(plan, 0, BELT_TOP + 5, P, 4, 0.6), { tone: 'mid', inner: L(k.sideSeam(plan, BELT_TOP + 2, P, 4), { tone: 'faint' }) })];
  out.push(screws(plan, BELT_TOP + 5, 2.4));
  out.push(L(k.sideRing([cx, front, 10], 3.4, 'y', P, 28), { tone: 'lo' }));
  out.push(L(k.sideRing([cx, front, 10], 1.6, 'y', P, 20), { tone: 'mid' }));
  out.push(D([at([cx, front, 10])], { size: 0.5, tone: 'mid' }));
  return out.join('');
}

function conveyor(beltShift: number) {
  const out: string[] = [];
  out.push(S(k.slabOf(RAIL_BACK, FRAME_Z, BELT_TOP - FRAME_Z, P, 3, 0.4), { tone: 'mid' }), railScrews(RAIL_BACK));
  out.push(S(k.slabOf(BELT, BELT_Z, BELT_TOP - BELT_Z, P, 2), { tone: 'lo', crease: 'none' }));
  out.push(`<clipPath id="ctv-belt-clip"><path d="${beltClip()}"/></clipPath>`);
  out.push(`<g clip-path="url(#ctv-belt-clip)"><g data-part="cleats" transform="${k.translateAlong(P, [beltShift, 0, 0])}">${L(cleatsPath(), { tone: 'faint' })}</g></g>`);
  for (const x of LEG_X) out.push(leg(x, BELT_HALF + RAIL_W / 2));
  // Celdas de carga bajo el tramo que pesa.
  for (const x of [WEIGH[0] + 4, WEIGH[1] - 4]) {
    const y = BELT_HALF + RAIL_W / 2;
    out.push(S(k.cylinder(x, y, 2.3, 0, FRAME_Z, P, 20), { tone: 'mid', inner: L(k.sideArc(x, y, 2.3, 2.4, P, 14), { tone: 'faint' }) }));
  }
  // Larguero delantero: dos juntas marcan el tramo de la báscula.
  const joints = WEIGH.map((x) => k.segment([x, BELT_HALF + RAIL_W, FRAME_Z], [x, BELT_HALF + RAIL_W, BELT_TOP], P)).join('');
  out.push(S(k.slabOf(RAIL_FRONT, FRAME_Z, BELT_TOP - FRAME_Z, P, 3, 0.4), { tone: 'mid', inner: L(joints, { tone: 'lo' }) }), railScrews(RAIL_FRONT));
  out.push(guard(BELT_FROM - GUARD_W));
  out.push(guard(BELT_TO - 2));
  return out.join('');
}

// ───────────────────────── Paquete ─────────────────────────

function parcel(seal: number) {
  const out = [halo(PALLET, BELT_TOP, 2)];
  out.push(S(k.slabOf(PALLET, BELT_TOP, PALLET_TOP - BELT_TOP, P, 3, 0.4), { tone: 'mid', inner: L(k.sideSeam(PALLET, BELT_TOP + 1.5, P, 3), { tone: 'faint' }) }));
  out.push(screws(PALLET, PALLET_TOP, 1.4, 0.38));
  const strap = k.segment([0, BOX.y + BOX.d, PALLET_TOP], [0, BOX.y + BOX.d, BOX_TOP], P);
  out.push(S(k.slabOf(BOX, PALLET_TOP, BOX_TOP - PALLET_TOP, P, 2, 0.5), { tone: 'hi', crease: 'lo', lit: true, inner: L(strap, { tone: 'lo' }) }));
  out.push(L(k.lineOnTop([0, BOX.y], [0, BOX.y + BOX.d], BOX_TOP, P), { tone: 'lo' }));
  // Etiqueta con la ruta: tres renglones impresos.
  const label: Plan = { x: 2.6, y: -5.6, w: 6.4, d: 5.6, r: 0.5 };
  out.push(S(k.slabOf(label, BOX_TOP, 0.4, P, 2), { tone: 'mid', crease: 'none' }));
  [[4.2, 0], [3, 1.6], [3.6, 3.2]].forEach(([length, dy]) => {
    out.push(L(k.lineOnTop([label.x + 1, label.y + 1.2 + dy], [label.x + 1 + length, label.y + 1.2 + dy], BOX_TOP + 0.4, P), { tone: 'lo', free: true }));
  });
  // Sello de la prensa: aparece cuando el troquel toca la tapa.
  const sealAt: [number, number] = [-5, 0];
  out.push(`<g data-part="seal" opacity="${seal}">${[
    S(k.cylinder(sealAt[0], sealAt[1], 2.6, BOX_TOP, 0.5, P, 24), { tone: 'hi', crease: 'lo' }),
    L(k.ring(sealAt[0], sealAt[1], 1.6, BOX_TOP + 0.5, P, 20), { tone: 'mid' }),
    D([at([sealAt[0], sealAt[1], BOX_TOP + 0.5])], { size: 0.45, tone: 'hi' }),
  ].join('')}</g>`);
  return out.join('');
}

// ─────────────────── Delante de la cinta, por estación ───────────────────

/** 2 · Cámara cenital (Veritas AI), lupa que baja (revisión humana), poste delantero y viga. */
function inspectionFront(drop: number, scanning: boolean) {
  const out: string[] = [];
  const cx = GANTRY_X;
  const lensY = CAMERA.y + CAMERA.d / 2;
  out.push(S(k.slabOf(CAMERA, CAMERA_Z, BEAM_Z - CAMERA_Z, P, 3, 0.4), { tone: 'mid', inner: L(k.sideSeam(CAMERA, CAMERA_Z + 3, P, 3), { tone: 'faint' }) }));
  out.push(`<g data-part="scan-lamp" class="iso-dots" data-tone="${scanning ? 'hi' : 'lo'}"><circle cx="${at([CAMERA.x + CAMERA.w - 2.6, CAMERA.y + CAMERA.d, CAMERA_Z + 7])[0].toFixed(1)}" cy="${at([CAMERA.x + CAMERA.w - 2.6, CAMERA.y + CAMERA.d, CAMERA_Z + 7])[1].toFixed(1)}" r="0.8"/></g>`);
  out.push(S(k.cylinder(cx, lensY, LENS_R + 0.8, LENS_Z + 2.4, CAMERA_Z - LENS_Z - 2.4, P, 24), { tone: 'mid' }));
  out.push(S(k.cylinder(cx, lensY, LENS_R, LENS_Z, 2.4, P, 24), { tone: 'mid', inner: L(k.sideArc(cx, lensY, LENS_R, LENS_Z + 1, P, 16), { tone: 'faint' }) }));

  // Lupa: carro en el poste, brazo y aro con su cristal.
  const [lx, ly] = LOUPE_AT;
  const carriage: Plan = { x: cx - 4, y: POST_Y - 3 - 3, w: 8, d: 3, r: 0.6 };
  const arm: Plan = { x: lx - 1.6, y: ly + LOUPE_R - 0.6, w: 3.2, d: carriage.y - (ly + LOUPE_R - 0.6), r: 0.6 };
  out.push(`<g data-part="loupe" transform="${k.translateAlong(P, [0, 0, -drop])}">${[
    S(k.slabOf(carriage, LOUPE_Z - 3, 10, P, 2), { tone: 'mid' }),
    S(k.slabOf(arm, LOUPE_Z + 0.8, 1.6, P, 2), { tone: 'mid' }),
    S(k.cylinder(lx, ly, LOUPE_R, LOUPE_Z, 2.4, P, 40, 0.4), { tone: 'mid', inner: L(k.sideArc(lx, ly, LOUPE_R, LOUPE_Z + 1.2, P, 24), { tone: 'faint' }) }),
    S(k.cylinder(lx, ly, LOUPE_R - 1.3, LOUPE_Z + 2.4, 0.3, P, 36), { tone: 'hi', crease: 'none' }),
    L(k.lineOnTop([lx - 2.2, ly - 1.8], [lx + 0.4, ly - 3.2], LOUPE_Z + 2.7, P), { tone: 'hi', free: true }),
  ].join('')}</g>`);

  out.push(gantryPost(POST_Y));
  const beam: Plan = { x: cx - 4, y: -POST_Y - 4, w: 8, d: POST_Y * 2 + 8, r: 1.5 };
  out.push(S(k.slabOf(beam, BEAM_Z, BEAM_TOP - BEAM_Z, P, 3, 0.5), { tone: 'mid', inner: L(k.sideSeam(beam, BEAM_Z + 3, P, 3), { tone: 'faint' }) }));
  out.push(L(k.planOutline({ x: cx - 0.8, y: -POST_Y + 4, w: 1.6, d: POST_Y * 2 - 8, r: 0.8 }, BEAM_TOP, P, 3), { tone: 'lo' }));
  out.push(D([[-POST_Y], [POST_Y]].map(([y]) => at([cx, y, BEAM_TOP])), { size: 0.45 }));
  return out.join('');
}

/** 3 · Hoja de guillotina con su vástago, poste delantero, travesaño, cilindro y terminal de pago. */
function paymentFront(lift: number, paid: boolean) {
  const out: string[] = [];
  const blade: Plan = { x: GATE_X - GATE_T / 2, y: -BELT_HALF - RAIL_W - 1, w: GATE_T, d: (BELT_HALF + RAIL_W + 1) * 2, r: 0.4 };
  const top = GATE_LOW + GATE_H;
  out.push(`<g data-part="gate" transform="${k.translateAlong(P, [0, 0, lift])}">${[
    S(k.cylinder(GATE_X, 0, 1.2, top, GATE_ROD, P, 16), { tone: 'mid', crease: 'none' }),
    S(k.slabOf(blade, GATE_LOW, GATE_H, P, 2, 0.3), { tone: 'mid', inner: L(k.sideSeam(blade, GATE_LOW + 2.4, P, 2), { tone: 'faint' }) }),
    D([at([GATE_X, -8, top]), at([GATE_X, 8, top])], { size: 0.4 }),
  ].join('')}</g>`);
  out.push(gatePost(BELT_HALF + RAIL_W + 0.5, false));
  const bar: Plan = { x: GATE_X - 3, y: -BELT_HALF - RAIL_W - 4.5, w: 6, d: (BELT_HALF + RAIL_W + 4.5) * 2, r: 1 };
  out.push(S(k.slabOf(bar, GATE_POST_TOP, GATE_BAR_TOP - GATE_POST_TOP, P, 3, 0.4), { tone: 'mid' }));
  out.push(D([at([GATE_X, bar.y + 2, GATE_BAR_TOP]), at([GATE_X, bar.y + bar.d - 2, GATE_BAR_TOP])], { size: 0.42 }));
  out.push(S(k.cylinder(GATE_X, 0, 4.4, GATE_BAR_TOP, 1.6, P, 28), { tone: 'mid' }));
  out.push(S(k.cylinder(GATE_X, 0, 3.4, GATE_BAR_TOP + 1.6, ACTUATOR_TOP - GATE_BAR_TOP - 3.2, P, 28), {
    tone: 'mid',
    crease: 'none',
    inner: L(k.sideArc(GATE_X, 0, 3.4, GATE_BAR_TOP + 6, P, 20) + k.sideArc(GATE_X, 0, 3.4, ACTUATOR_TOP - 5, P, 20), { tone: 'faint' }),
  }));
  out.push(S(k.cylinder(GATE_X, 0, 4.4, ACTUATOR_TOP - 1.6, 1.6, P, 28), { tone: 'mid' }));
  out.push(D([at([GATE_X, 0, ACTUATOR_TOP])], { size: 0.5, tone: 'mid' }));

  // Terminal de pago sobre su pedestal.
  const tx = TERMINAL.x + TERMINAL.w / 2;
  const ty = TERMINAL.y + TERMINAL.d / 2;
  out.push(halo(k.insetPlan(TERMINAL, -1), 0, 3));
  out.push(S(k.cylinder(tx, ty, 4.6, 0, 1.2, P, 28), { tone: 'lo' }));
  out.push(S(k.cylinder(tx, ty, 1.8, 1.2, TERMINAL_Z - 1.2, P, 16), { tone: 'mid', crease: 'none' }));
  out.push(S(k.slabOf(TERMINAL, TERMINAL_Z, TERMINAL_TOP - TERMINAL_Z, P, 4, 0.6), { tone: 'mid', inner: L(k.sideSeam(TERMINAL, TERMINAL_Z + 1.6, P, 4), { tone: 'faint' }) }));
  const screen: Plan = { x: TERMINAL.x + 1.6, y: TERMINAL.y + 1.4, w: 6, d: 4, r: 0.6 };
  out.push(S(k.slabOf(screen, TERMINAL_TOP, 0.25, P, 2), { tone: 'lo', crease: 'none' }));
  out.push(k.faceTextSvg(k.topMatrix([screen.x + screen.w / 2, screen.y + screen.d / 2 + 0.5], TERMINAL_TOP + 0.25, P, 'x'), 'Webpay', { size: 1.2, tone: 'mid', anchor: 'middle' }));
  out.push(D(k.dotGrid(TERMINAL.x + 9.4, TERMINAL.y + 2, 3, 3, 1.4, TERMINAL_TOP, P) as Array<[number, number]>, { size: 0.35, tone: 'mid' }));
  out.push(L(k.planOutline({ x: TERMINAL.x + 2, y: TERMINAL.y + TERMINAL.d - 2.4, w: 9, d: 0.9, r: 0.45 }, TERMINAL_TOP, P, 2), { tone: 'lo' }));
  out.push(S(k.cylinder(TERMINAL.x + TERMINAL.w - 1.8, TERMINAL.y + TERMINAL.d - 1.8, 0.9, TERMINAL_TOP, 0.8, P, 14), { tone: 'mid' }));
  const lamp = at([TERMINAL.x + TERMINAL.w - 1.8, TERMINAL.y + TERMINAL.d - 1.8, TERMINAL_TOP + 0.8]);
  out.push(`<g data-part="pay-lamp" class="iso-dots" data-tone="${paid ? 'hi' : 'lo'}"><circle cx="${lamp[0].toFixed(1)}" cy="${lamp[1].toFixed(1)}" r="0.7"/></g>`);
  return out.join('');
}

/** 4 · Vástago y troquel (se mueven), cilindro y brazo de la prensa. */
function pressFront(stroke: number) {
  const out: string[] = [];
  const rodBottom = DIE_REST + DIE_H;
  out.push(`<g data-part="ram" transform="${k.translateAlong(P, [0, 0, -stroke])}">${[
    S(k.cylinder(PRESS_X, 0, RAM_R, rodBottom, RAM_LEN, P, 24), { tone: 'mid', crease: 'none' }),
    S(k.cylinder(PRESS_X, 0, DIE_R, DIE_REST, DIE_H, P, 32, 0.4), { tone: 'mid', inner: L(k.sideArc(PRESS_X, 0, DIE_R, DIE_REST + 1, P, 20), { tone: 'faint' }) }),
  ].join('')}</g>`);
  out.push(S(k.cylinder(PRESS_X, 0, HOUSING_R, HOUSING_Z, ARM_Z - HOUSING_Z, P, 36), {
    tone: 'mid',
    inner: L(k.sideArc(PRESS_X, 0, HOUSING_R, HOUSING_Z + 2, P, 24) + k.sideArc(PRESS_X, 0, HOUSING_R, ARM_Z - 3, P, 24), { tone: 'faint' }),
  }));
  out.push(S(k.slabOf(ARM, ARM_Z, ARM_TOP - ARM_Z, P, 4, 0.6), { tone: 'mid', inner: L(k.sideSeam(ARM, ARM_Z + 3, P, 4), { tone: 'faint' }) }));
  out.push(screws(ARM, ARM_TOP, 2.6, 0.45));
  out.push(L(k.planOutline({ x: PRESS_X - 1, y: ARM.y + 8, w: 2, d: ARM.d - 20, r: 1 }, ARM_TOP, P, 3), { tone: 'lo' }));
  return out.join('');
}

// ───────────────────────── Figura ─────────────────────────

export interface Pose {
  /** Centro del paquete sobre la cinta. */
  x: number;
  /** Desplazamiento de los tacos de la correa (avanza con el paquete). */
  belt: number;
  /** Carga de la báscula, 0..1. */
  load: number;
  /** Cuánto baja la lupa, en unidades. */
  drop: number;
  scanning: boolean;
  /** Altura de la compuerta, en unidades. */
  lift: number;
  paid: boolean;
  /** Carrera del troquel hacia abajo, en unidades. */
  stroke: number;
  seal: number;
  /** Corrimiento del bloque nuevo desde su lugar en el riel. */
  block: number;
}

export const SLOTS = 3;

/** El SVG completo en la pose `pose`, con el paquete en el hueco `slot`. */
export function figureSvg(pose: Pose, slot: number) {
  const backs: Array<{ at: [number, number]; svg: string }> = [
    ...LEG_X.map((x) => ({ at: [x, -BELT_HALF - RAIL_W / 2] as [number, number], svg: leg(x, -BELT_HALF - RAIL_W / 2) })),
    { at: SCALE_AT, svg: scale(pose.load) },
    { at: [GANTRY_X, -POST_Y], svg: gantryPost(-POST_Y) },
    { at: [GATE_X, -BELT_HALF - RAIL_W - 2.5], svg: gatePost(-BELT_HALF - RAIL_W - 4.5, true) },
    { at: [PRESS_X, PRESS_BASE.y + PRESS_BASE.d], svg: pressBack() },
    { at: [BELT_TO + 6, -BELT_HALF - RAIL_W - 9], svg: motor() },
  ];
  backs.sort((a, b) => depth(a.at) - depth(b.at));

  const slotSvg = (index: number) =>
    `<g data-slot="${index}">${index === slot ? `<g data-part="parcel" transform="${k.translateAlong(P, [pose.x, 0, 0])}">${parcel(pose.seal)}</g>` : ''}</g>`;

  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: COPY.label,
    body: [
      base(),
      ruler(),
      ...backs.map((item) => item.svg),
      conveyor(pose.belt),
      slotSvg(0),
      inspectionFront(pose.drop, pose.scanning),
      slotSvg(1),
      paymentFront(pose.lift, pose.paid),
      slotSvg(2),
      pressFront(pose.stroke),
      // Delante de todo: el riel de bloques, el bloque nuevo y el dispensador
      // que lo tapa mientras está adentro.
      ledger(),
      `<g data-part="block" transform="${k.translateAlong(P, [pose.block, 0, 0])}">${newBlock()}</g>`,
      dispenser(),
    ],
  });
}

