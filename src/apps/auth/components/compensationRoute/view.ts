// Disposición del mundo de "La ruta de tu compensación" (unidades ≈ 1 px; x, y
// en el piso, z hacia arriba) y la cámara. La usan el generador del SVG y la
// parte animada, así que las dos dibujan exactamente lo mismo.
//
// Una cinta transportadora corre a lo largo de x sobre un banco. El paquete
// avanza de izquierda a derecha por cuatro estaciones: báscula, pórtico de
// inspección, compuerta de pago y prensa de sellado.
import { boxCorners, fitProjection, type Plan, type Point3 } from '../../../../shared/iso/iso-kit.ts';

export const WIDTH = 600;
export const HEIGHT = 330;

// ── Banco ──
export const PLATE: Plan = { x: -152, y: -60, w: 304, d: 118, r: 8 };
export const PLATE_H = 10;
export const FOOT_H = 5;

// ── Cinta: correa entre dos largueros, a ras de su cara superior ──
export const BELT_FROM = -124;
export const BELT_TO = 124;
export const BELT_HALF = 13;
export const RAIL_W = 4;
export const FRAME_Z = 7;
export const BELT_TOP = 16;
export const BELT_Z = 12;
/** Patas de la cinta, en pares bajo los largueros. */
export const LEG_X = [-108, -54, 0, 54, 108];
/** Tapas de los tambores en los extremos. */
export const GUARD_W = 14;
export const GUARD_Z = 4;
export const GUARD_TOP = 21;
/** Paso de los tacos de la correa: la correa avanza con el paquete. */
export const CLEAT = 8;

// ── Estaciones: x del centro del paquete cuando se detiene en cada una ──
export const STATION_X = [-84, -28, 28, 84];

// ── Paquete sobre su palé ──
export const PALLET: Plan = { x: -13, y: -11, w: 26, d: 22, r: 1.5 };
export const PALLET_TOP = BELT_TOP + 3;
export const BOX: Plan = { x: -10, y: -8, w: 20, d: 16, r: 1 };
export const BOX_TOP = PALLET_TOP + 14;
export const TRAVEL: [number, number] = [STATION_X[0], STATION_X[3]];

// ── 1 · Báscula: tramo de cinta sobre celdas de carga y un reloj en columna ──
/** Tramo que pesa: entre las dos juntas del larguero delantero. */
export const WEIGH: [number, number] = [STATION_X[0] - 15, STATION_X[0] + 15];
export const SCALE_AT: [number, number] = [STATION_X[0] - 6, -40];
export const SCALE_BASE: Plan = { x: SCALE_AT[0] - 9, y: SCALE_AT[1] - 9, w: 18, d: 18, r: 2.5 };
export const COLUMN_TOP = 40;
export const DIAL_R = 8;
export const DIAL_Z = COLUMN_TOP + 4;
export const DIAL_H = 4.4;
export const DIAL_TOP = DIAL_Z + DIAL_H;
/** Vuelta de la aguja con el paquete entero sobre el tramo. */
export const NEEDLE_LOAD = 0.62;

// ── 2 · Pórtico de inspección: cámara cenital y lupa que baja ──
export const GANTRY_X = STATION_X[1];
export const POST_Y = 27;
export const BEAM_Z = 62;
export const BEAM_TOP = 69;
export const CAMERA: Plan = { x: GANTRY_X - 6, y: -13, w: 12, d: 12, r: 2 };
export const CAMERA_Z = 50;
export const LENS_R = 3.2;
export const LENS_Z = 45;
export const LOUPE_AT: [number, number] = [GANTRY_X + 1, 8];
export const LOUPE_R = 5.6;
export const LOUPE_Z = 45;
export const LOUPE_DROP = 4;

// ── 3 · Compuerta de guillotina y terminal de pago ──
export const GATE_X = 44;
export const GATE_T = 2.4;
export const GATE_LOW = BELT_TOP + 0.5;
export const GATE_H = 14;
export const GATE_LIFT = 20;
export const GATE_POST_TOP = 54;
export const GATE_BAR_TOP = 59;
export const ACTUATOR_TOP = 76;
/** Vástago que cuelga la compuerta: siempre entra en el travesaño (cerrada,
 *  su punta queda en 55 > 54) y nunca asoma sobre el cilindro (abierta, 75 < 76). */
export const GATE_ROD = 24.5;
export const TERMINAL: Plan = { x: STATION_X[2] - 7, y: 28, w: 14, d: 10, r: 2 };
export const TERMINAL_Z = 22;
export const TERMINAL_TOP = 27;

// ── 4 · Prensa de sellado y riel de bloques encadenados ──
export const PRESS_X = STATION_X[3];
export const PRESS_BASE: Plan = { x: PRESS_X - 12, y: -48, w: 24, d: 18, r: 2.5 };
export const PRESS_BASE_TOP = 10;
export const PRESS_COLUMN: Plan = { x: PRESS_X - 6, y: -44, w: 12, d: 10, r: 2 };
export const ARM_Z = 66;
export const ARM_TOP = 74;
export const ARM: Plan = { x: PRESS_X - 8, y: -44, w: 16, d: 52, r: 2.5 };
export const HOUSING_R = 6;
export const HOUSING_Z = 52;
export const RAM_R = 3;
export const RAM_LEN = 16;
export const DIE_R = 5;
export const DIE_H = 3;
/** Cara inferior del troquel en reposo y al sellar (toca la tapa del paquete). */
export const DIE_REST = 46;
export const DIE_STRIKE = BOX_TOP + 0.4;
export const LEDGER: Plan = { x: 62, y: 30, w: 46, d: 6, r: 1 };
/** Dispensador al final del riel: de él sale el bloque de cada certificado nuevo. */
export const DISPENSER: Plan = { x: 104, y: 27, w: 12, d: 12, r: 2 };
export const DISPENSER_TOP = 14;
export const LEDGER_TOP = 3;
export const CUBE = 5;
/** Bloques ya registrados, a lo largo del riel. */
export const BLOCK_X = [67, 74, 81, 88];
/** Lugar del bloque nuevo y de dónde sale (dentro del dispensador). */
export const NEW_BLOCK_X = 95;
export const NEW_BLOCK_FROM = 110;

// ── Regla delantera: una muesca mayor por estación ──
export const STRIP: Plan = { x: -130, y: 44, w: 260, d: 8, r: 1 };
export const STRIP_TOP = 0.6;
export const TICK = 14;

const fitPoints: Point3[] = [
  ...boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
  [GANTRY_X, -POST_Y - 4, BEAM_TOP],
  [GANTRY_X, POST_Y + 4, BEAM_TOP],
  [GATE_X, 0, ACTUATOR_TOP],
  [PRESS_X, ARM.y, ARM_TOP],
  [PRESS_X, ARM.y + ARM.d, ARM_TOP],
];

export const P = fitProjection(fitPoints, WIDTH, HEIGHT, { pad: 18, azimuth: 54, elevation: 30 });

/**
 * Hueco de pintado del paquete: siempre el mismo. Todo lo que el paquete pasa
 * por debajo (viga, cámara, lupa, hoja de la compuerta, troquel) está más alto
 * que su tapa, y en esta cámara lo más alto queda delante donde se cruzan; los
 * postes delanteros y el terminal solo se le superponen mientras están delante.
 * Se comprobó cuadro a cuadro en tools/anatomy/compensation-route/shots/gate.png:
 * cambiar de hueco al pasar una estación dibujaba el paquete sobre la hoja.
 */
export const slotOf = (_x: number) => 0;
