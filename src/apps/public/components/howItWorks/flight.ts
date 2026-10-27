// Vuelo que cuentan las tres figuras de "Cómo funciona".
//
// Es el último cálculo de la calculadora del hero (mismos km, factor, kg y
// aporte que devolvió el backend). Mientras no hay cálculo, un ejemplo
// SCL → LIM hecho con la misma tabla DEFRA 2025 que usa el backend, y marcado
// como ejemplo.
import { useSyncExternalStore } from 'react';
import { CABIN_LABEL, factorOf, haulOf, HAUL_LABEL, type Cabin } from '../factorBench/model.ts';
import { POPULAR_AIRPORTS, type EstimateResponse } from '../../services/publicApi';

export interface Place {
  code: string;
  lat: number;
  lon: number;
}

export interface Flight {
  from: Place;
  to: Place;
  /** Distancia de ida, en km. */
  km: number;
  cabin: Cabin;
  pax: number;
  roundTrip: boolean;
  /** kg CO₂e por km y pasajero. */
  factor: number;
  kg: number;
  /** Aporte mínimo para compensar, en CLP; null si no hay proyectos con stock. */
  priceCLP: number | null;
  methodology: string;
  /** true: datos de ejemplo (todavía no hay un cálculo). */
  example: boolean;
}

const place = (code: string): Place => {
  const airport = POPULAR_AIRPORTS.find((a) => a.code === code);
  return { code, lat: airport?.lat ?? NaN, lon: airport?.lon ?? NaN };
};

const EXAMPLE_KM = 2461.89; // SCL → LIM, la misma distancia que calcula el backend
const EXAMPLE: Flight = {
  from: place('SCL'),
  to: place('LIM'),
  km: EXAMPLE_KM,
  cabin: 'economy',
  pax: 1,
  roundTrip: false,
  factor: factorOf(EXAMPLE_KM, 'economy'),
  kg: EXAMPLE_KM * factorOf(EXAMPLE_KM, 'economy'),
  priceCLP: null,
  methodology: 'DEFRA 2025',
  example: true,
};

let current: Flight = EXAMPLE;
const listeners = new Set<() => void>();

export function setFlight(next: Flight | null) {
  current = next ?? EXAMPLE;
  listeners.forEach((notify) => notify());
}

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => listeners.delete(notify);
};

export const useFlight = () => useSyncExternalStore(subscribe, () => current, () => EXAMPLE);

/** Vuelo a partir de una respuesta de la calculadora. La cabina va aparte: la respuesta no la trae. */
export function flightFromEstimate(estimate: EstimateResponse, cabin: Cabin): Flight | null {
  const { meta, emissions } = estimate;
  if (!meta || !emissions) return null;
  return {
    from: place(meta.route.origin.code),
    to: place(meta.route.destination.code),
    km: meta.distanceKmOneWay,
    cabin,
    pax: emissions.passengers,
    roundTrip: meta.tripType === 'round_trip',
    factor: emissions.factorUsed,
    kg: emissions.kgCO2e,
    priceCLP: estimate.pricing?.fromTotalCLP ?? null,
    methodology: emissions.methodology ?? 'DEFRA 2025',
    example: false,
  };
}

/** Clave que cambia cuando cambia el vuelo: las figuras repiten su animación. */
export const flightKey = (f: Flight) =>
  [f.from.code, f.to.code, f.cabin, f.pax, f.roundTrip, f.kg.toFixed(2), f.example].join('|');

// ── Textos ──
const nf = (value: number, digits = 0) =>
  value.toLocaleString('es-CL', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmt = {
  km: (f: Flight) => `${nf(f.km)} km`,
  kg: (f: Flight) => `${nf(f.kg, 2)} kg CO₂e`,
  kgNumber: (value: number) => nf(value, 2),
  factor: (f: Flight) => nf(f.factor, 5),
  cabin: (f: Flight) => CABIN_LABEL[f.cabin][0].toUpperCase() + CABIN_LABEL[f.cabin].slice(1),
  pax: (f: Flight) => `${f.pax} ${f.pax === 1 ? 'pasajero' : 'pasajeros'}`,
  haul: (f: Flight) => HAUL_LABEL[haulOf(f.km)],
  clp: (value: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value),
};

/** Las cuatro entradas de la cuenta, tal como caen al embudo. */
export const formula = (f: Flight) => {
  const terms = [fmt.km(f), `× ${fmt.factor(f)}`];
  if (f.pax > 1) terms.push(`× ${f.pax}`);
  if (f.roundTrip) terms.push('× 2 (ida y vuelta)');
  return `${terms.join(' ')} = ${fmt.kg(f)}`;
};

// ── Mapa del paso 1: equirectangular sobre el cono sur ──
export const MAP_W = 360;
export const MAP_H = 228;
const LON: [number, number] = [-102, -18];
const LAT: [number, number] = [2, -57];

export const project = (lat: number, lon: number): [number, number] => [
  ((lon - LON[0]) / (LON[1] - LON[0])) * MAP_W,
  ((LAT[0] - lat) / (LAT[0] - LAT[1])) * MAP_H,
];

/** Costa de Sudamérica de norte a sur por el Pacífico y de vuelta por el Atlántico: [longitud, latitud]. */
const COAST: Array<[number, number]> = [
  [-80, 1], [-81.1, -4.5], [-79.6, -7.5], [-78.2, -10], [-77.4, -12.1], [-76.1, -14], [-74.2, -16], [-71.4, -17.6],
  [-70.3, -18.5], [-70.1, -21.5], [-70.5, -24.5], [-70.9, -27.5], [-71.5, -30], [-71.6, -33], [-72.2, -35.2],
  [-73.2, -37.3], [-73.5, -40], [-73.9, -42], [-74.6, -45.5], [-75.5, -48], [-75.3, -50.5], [-74.5, -52.5],
  [-71.5, -54], [-68.5, -55.3], [-67.3, -55.9], [-65.3, -54.7], [-68.3, -52.4], [-69, -51.6], [-68.9, -50.3],
  [-67.7, -49], [-65.9, -47.8], [-67.5, -46.2], [-65.7, -45], [-64.4, -42.5], [-65.1, -42.1], [-65, -40.8],
  [-62.3, -40.6], [-62.2, -38.9], [-58.5, -38.6], [-56.8, -37.3], [-57.2, -35.8], [-58.4, -34.2], [-56.9, -34.6],
  [-54.9, -34.9], [-53.4, -33.7], [-52.1, -32.2], [-50.6, -30.6], [-48.6, -28.2], [-48.5, -26], [-46.3, -24],
  [-44.7, -23.2], [-42, -22.9], [-41, -21.7], [-39.7, -19.5], [-39.1, -17.6], [-38.9, -13.5], [-37.2, -11],
  [-35.3, -9], [-34.9, -7.2], [-35.3, -5.5], [-37, -4.6], [-41, -2.9], [-44.5, -2.3], [-48.5, -1.2], [-50, 1],
];

export const LAND_PATH =
  COAST.map(([lon, lat], i) => {
    const [x, y] = project(lat, lon);
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ') + ` L${project(2, -50)[0].toFixed(1)} -4 L${project(2, -80)[0].toFixed(1)} -4 Z`;

const MARGIN = 14;
export interface MapPoint {
  x: number;
  y: number;
  /** true: el aeropuerto queda fuera del mapa y el punto está en el borde, en su dirección. */
  off: boolean;
}

/**
 * Punto del aeropuerto en el mapa. Si queda fuera (Madrid, Miami…), se lleva al
 * borde siguiendo la línea desde `anchor`, para indicar hacia dónde va el vuelo.
 */
export function mapPoint(p: Place, anchor: Place): MapPoint {
  const [x, y] = project(p.lat, p.lon);
  const inside = x >= MARGIN && x <= MAP_W - MARGIN && y >= MARGIN && y <= MAP_H - MARGIN;
  if (inside || Number.isNaN(x)) return { x, y, off: false };
  const [ax, ay] = project(anchor.lat, anchor.lon);
  const tx = x > ax ? (MAP_W - MARGIN - ax) / (x - ax) : x < ax ? (MARGIN - ax) / (x - ax) : Infinity;
  const ty = y > ay ? (MAP_H - MARGIN - ay) / (y - ay) : y < ay ? (MARGIN - ay) / (y - ay) : Infinity;
  const t = Math.min(tx, ty, 1);
  return { x: ax + (x - ax) * t, y: ay + (y - ay) * t, off: true };
}
