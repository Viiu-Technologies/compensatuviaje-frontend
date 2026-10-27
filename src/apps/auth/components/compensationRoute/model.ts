// Modelo de "La ruta de tu compensación": las cuatro etapas reales del flujo
// B2C, en el orden en que las vive el usuario después de iniciar sesión:
//   calculadora (/b2c/calculator) → proyectos (/b2c/projects) → pago Webpay
//   (PaymentResultPage) → certificado (/b2c/certificates, registrable en Polygon
//   desde /b2c/nft-certificates).
// Nada de lo que muestra la figura es una cifra inventada: solo etapas y, si el
// usuario llega con un vuelo en la URL, su ruta.
import { METHODOLOGY } from '../../../public/components/factorBench/model.ts';

export interface Step {
  /** Texto corto del lector de la tarjeta. */
  short: string;
  /** Texto para lectores de pantalla. */
  describe: string;
}

export const STEPS: Step[] = [
  {
    short: `medición ${METHODOLOGY}`,
    describe: `Medición: la huella del vuelo se calcula con los factores ${METHODOLOGY} según el GHG Protocol.`,
  },
  {
    short: 'proyecto verificado',
    describe: 'Proyecto verificado: eliges un proyecto que Veritas AI evaluó y una persona revisó antes de publicarlo.',
  },
  {
    short: 'pago con Webpay',
    describe: 'Pago: la compensación se paga con Webpay.',
  },
  {
    short: 'certificado verificable',
    describe: 'Certificado: recibes un certificado digital que puedes registrar en Polygon.',
  },
];

export interface Trip {
  origin: string;
  destination: string;
  passengers: number;
  roundTrip: boolean;
}

const IATA = /^[A-Z]{3}$/;

/**
 * El vuelo que trae la URL de destino del login (la calculadora pública
 * redirige a /b2c/calculator?origin=…&destination=…). Solo se acepta si los
 * códigos parecen IATA: el texto termina en la tarjeta.
 */
export function tripOf(search: string | undefined | null): Trip | null {
  if (!search) return null;
  const params = new URLSearchParams(search);
  const origin = (params.get('origin') || '').toUpperCase();
  const destination = (params.get('destination') || '').toUpperCase();
  if (!IATA.test(origin) || !IATA.test(destination) || origin === destination) return null;
  const passengers = Math.max(1, Math.min(50, parseInt(params.get('passengers') || '1', 10) || 1));
  return { origin, destination, passengers, roundTrip: params.get('roundTrip') === 'true' };
}

export const routeOf = (trip: Trip) => `${trip.origin}→${trip.destination}`;

/** Texto del lector: etapa donde está el paquete y, si se conoce, la ruta. */
export function readoutOf(step: number, trip: Trip | null) {
  const lead = trip ? `${routeOf(trip)} · ` : '';
  return `${lead}${step + 1}/${STEPS.length} · ${STEPS[step].short}`;
}

export function describe(step: number, trip: Trip | null) {
  const flight = trip
    ? `Tu vuelo ${trip.origin} a ${trip.destination}, ${trip.passengers} ${trip.passengers === 1 ? 'pasajero' : 'pasajeros'}${trip.roundTrip ? ', ida y vuelta' : ''}. `
    : '';
  return `${flight}Etapa ${step + 1} de ${STEPS.length}. ${STEPS[step].describe}`;
}

/** Recorrido automático: cada etapa se muestra este tiempo, en segundos. */
export const DWELL = 2.8;
/** En la última etapa el paquete espera más: ahí se sella y se registra. */
export const LAST_DWELL = 4.2;
