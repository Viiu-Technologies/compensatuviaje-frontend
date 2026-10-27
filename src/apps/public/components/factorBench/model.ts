// Modelo de la figura "Mesa de factores": la misma cuenta que hace el backend
// (emissionCalculatorService.calculate) para un pasajero, solo ida.
//
//   kg CO₂e = km × factor(tipo de vuelo, cabina)
//
// Las tablas son copia de backend/src/modules/shared/calculator/constants/
// calculatorConstants.js (DEFRA 2025). Si cambian allá, cambian aquí.

export type Cabin = 'economy' | 'premium_economy' | 'business' | 'first';
export type Haul = 'Domestic' | 'Short-haul' | 'Long-haul';

export const METHODOLOGY = 'DEFRA 2025';

export const EMISSION_FACTORS: Record<Haul, Record<Cabin, number>> = {
  Domestic: { economy: 0.22928, premium_economy: 0.22928, business: 0.22928, first: 0.22928 },
  'Short-haul': { economy: 0.12576, premium_economy: 0.18863, business: 0.18863, first: 0.18863 },
  'Long-haul': { economy: 0.11704, premium_economy: 0.18726, business: 0.3394, first: 0.46814 },
};

export const DISTANCE_THRESHOLDS = { DOMESTIC_MAX: 500, SHORT_HAUL_MAX: 3700 };

/** Igual que haulTypeClassifier.getHaulType: se clasifica por la distancia de ida. */
export function haulOf(km: number): Haul {
  if (km < DISTANCE_THRESHOLDS.DOMESTIC_MAX) return 'Domestic';
  if (km < DISTANCE_THRESHOLDS.SHORT_HAUL_MAX) return 'Short-haul';
  return 'Long-haul';
}

export const factorOf = (km: number, cabin: Cabin) => EMISSION_FACTORS[haulOf(km)][cabin];
export const kgOf = (km: number, cabin: Cabin) => km * factorOf(km, cabin);

export const HAULS: Haul[] = ['Domestic', 'Short-haul', 'Long-haul'];
export const HAUL_LABEL: Record<Haul, string> = { Domestic: 'doméstico', 'Short-haul': 'corto', 'Long-haul': 'largo' };

/** Pistas de la mesa, de atrás hacia adelante: la más alta queda al fondo. */
export const CABINS: Cabin[] = ['first', 'business', 'premium_economy', 'economy'];
export const CABIN_LABEL: Record<Cabin, string> = {
  first: 'primera',
  business: 'business',
  premium_economy: 'premium',
  economy: 'económica',
};

// ── Regla de distancias: logarítmica de 100 a 16.000 km ──
export const KM_MIN = 100;
export const KM_MAX = 16000;
const SPAN = Math.log10(KM_MAX / KM_MIN);
export const shareOfKm = (km: number) => Math.log10(km / KM_MIN) / SPAN;
export const kmOfShare = (share: number) => KM_MIN * 10 ** (share * SPAN);

// ── Rutas reales desde Santiago, con las coordenadas del seed de aeropuertos ──
const AIRPORTS = {
  SCL: [-33.393, -70.7858],
  CCP: [-36.7727, -73.0631],
  EZE: [-34.8222, -58.5358],
  LIM: [-12.0219, -77.1143],
  MIA: [25.7959, -80.287],
  MAD: [40.4936, -3.5668],
} as const;

/** distanceCalculator.calculateHaversine, R = 6371 km. */
function haversine([lat1, lon1]: readonly number[], [lat2, lon2]: readonly number[]) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface Route { code: string; km: number }
export const ROUTES: Route[] = (['CCP', 'EZE', 'LIM', 'MIA', 'MAD'] as const).map((code) => ({
  code: `SCL→${code}`,
  km: haversine(AIRPORTS.SCL, AIRPORTS[code]),
}));

const routeKm = (code: string) => ROUTES.find((route) => route.code === `SCL→${code}`)!.km;

/** Recorrido automático: cada parada es [km, pista]. */
export const TOUR: Array<[number, number]> = [
  [routeKm('CCP'), 3],
  [routeKm('EZE'), 3],
  [routeKm('MAD'), 3],
  [routeKm('MAD'), 2],
  [routeKm('MAD'), 1],
  [routeKm('MAD'), 0],
  [routeKm('LIM'), 1],
];

const number = (value: number, digits: number) =>
  value.toLocaleString('es-CL', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Texto del lector: se calcula de dónde están las piezas, no del objetivo. */
export function readoutOf(km: number, cabin: Cabin) {
  const route = ROUTES.find((r) => Math.abs(Math.log(r.km / km)) < 0.012);
  const factor = factorOf(km, cabin);
  const lead = route ? `${route.code} · ` : '';
  return `${lead}${number(km, 0)} km × ${number(factor, 3)} = ${number(km * factor, 0)} kg CO₂e`;
}

export function describe(km: number, cabin: Cabin) {
  const haul = haulOf(km);
  return `${number(km, 0)} km, tramo ${HAUL_LABEL[haul]}, cabina ${CABIN_LABEL[cabin]}: factor ${number(factorOf(km, cabin), 5)} kg por km, ${number(kgOf(km, cabin), 0)} kg de CO₂e por pasajero`;
}
