// Datos del ejemplo que se "escribe" en la calculadora.
// Salen de POST /api/public/calculator/estimate (producción, 2026-10-09):
// { origin: 'LIM', destination: 'SCL', cabinCode: 'economy', passengers: 1, roundTrip: true }
// Para cambiar de ruta, vuelve a consultar el endpoint y reemplaza los valores.

export type Airport = {
  code: string;
  city: string;
  country: string;
  name: string;
};

export const EXAMPLE = {
  origin: { code: 'LIM', city: 'Lima', country: 'Perú', name: 'Jorge Chávez' } as Airport,
  destination: { code: 'SCL', city: 'Santiago', country: 'Chile', name: 'Arturo Merino Benítez' } as Airport,
  cabinLabel: 'Clase Económica',
  passengers: 1,
  roundTrip: true,

  kgCO2e: 619.22,
  tonCO2e: 0.6192,
  distanceKmTotal: 4923.79,
  methodology: 'DEFRA 2025',
  trees: 0.6,
  priceFromCLP: 4428,

  // Estado "Huella compensada": proyecto genérico a propósito (no hay uno real que citar).
  projectLabel: 'Proyecto de reforestación verificado',
};

export const BRAND = {
  url: 'compensatuviaje.com',
  tagline: 'Viaja. Mide. Compensa.',
};

const nf = (opts: Intl.NumberFormatOptions) => new Intl.NumberFormat('es-CL', opts);

export const fmt = {
  kg: (n: number) => nf({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n),
  ton: (n: number) => nf({ maximumFractionDigits: 3 }).format(n),
  int: (n: number) => nf({ maximumFractionDigits: 0 }).format(Math.round(n)),
  dec: (n: number) => nf({ maximumFractionDigits: 1 }).format(n),
  clp: (n: number) =>
    nf({ style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n),
};
