// Datos del video v2. El vuelo es el mismo del ejemplo de la v1 (respuesta
// real de POST /api/public/calculator/estimate, ver ../data/example.ts),
// contado como Santiago → Lima: la distancia y el factor son los mismos en los
// dos sentidos, así que la huella también.
//
// Los factores y las distancias de la metodología salen del mismo módulo que
// usa la web (factorBench/model.ts), que copia la tabla DEFRA 2025 del backend.
import { EXAMPLE } from '../data/example';
import { EMISSION_FACTORS, ROUTES, factorOf, haulOf, type Cabin, type Haul } from '../../../src/apps/public/components/factorBench/model';

export { EMISSION_FACTORS, factorOf, haulOf, type Cabin, type Haul };

export const FLIGHT = {
  from: { code: 'SCL', city: 'Santiago', country: 'Chile', lat: -33.393, lon: -70.786 },
  to: { code: 'LIM', city: 'Lima', country: 'Perú', lat: -12.022, lon: -77.114 },
  kmOneWay: EXAMPLE.distanceKmTotal / 2,
  kmTotal: EXAMPLE.distanceKmTotal,
  factor: factorOf(EXAMPLE.distanceKmTotal / 2, 'economy'),
  kg: EXAMPLE.kgCO2e,
  cabinLabel: 'Económica',
  pax: 1,
  roundTrip: true,
  priceFromCLP: EXAMPLE.priceFromCLP,
  methodology: EXAMPLE.methodology,
};

/** Paradas del minijuego: ciudades a su distancia real desde Santiago. */
const CITY: Record<string, string> = { CCP: 'Concepción', EZE: 'Buenos Aires', LIM: 'Lima', MIA: 'Miami', MAD: 'Madrid' };
export const STOPS = ROUTES.map((r) => {
  const code = r.code.split('→')[1];
  return { code, name: CITY[code] ?? code, km: r.km };
});

export const STANDARDS = [
  { name: 'DEFRA 2025', category: 'Factores de emisión', scope: 'UK Gov GHG Reporting' },
  { name: 'GHG Protocol', category: 'Estándar global', scope: 'Scope 3 · Cat. 6' },
  { name: 'Veritas AI', category: 'Verificación de proyectos', scope: 'IA + revisión humana' },
  { name: 'Polygon PoS', category: 'Trazabilidad inmutable', scope: 'Registro público' },
];

// ── Mapa plano del cono sur (copia de howItWorks/flight.ts: ese módulo trae
// la API de la web y no se puede importar aquí) ──
export const MAP_W = 360;
export const MAP_H = 228;
const LON: [number, number] = [-102, -18];
const LAT: [number, number] = [2, -57];

export const project = (lat: number, lon: number): [number, number] => [
  ((lon - LON[0]) / (LON[1] - LON[0])) * MAP_W,
  ((LAT[0] - lat) / (LAT[0] - LAT[1])) * MAP_H,
];

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
