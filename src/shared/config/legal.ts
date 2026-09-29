// ============================================
// legal.ts - Datos del titular del sitio
// ============================================
// Fuente única para páginas legales, footer y JSON-LD. La Ley 19.496 exige
// que el proveedor se identifique (razón social, RUT, domicilio) antes de
// vender en línea, así que estos valores deben estar completos antes de
// desplegar.
//
// PENDIENTE: completar legalName, rut y address. Mientras estén vacíos, los
// textos los omiten y usan el nombre de marca (ver OWNER_NAME / ownerLine).

export const LEGAL = {
  brand: 'CompensaTuViaje',
  legalName: '' as string, // p. ej. 'CompensaTuViaje SpA'
  rut: '' as string, // p. ej. '76.123.456-7'
  address: '' as string, // p. ej. 'Av. Providencia 1234, Providencia, Región Metropolitana, Chile'
  site: 'https://compensatuviaje.com',

  // Correos del dominio propio. Mientras no existan, cae al Gmail actual.
  emails: {
    contact: 'compensatuviaje@gmail.com', // PENDIENTE: contacto@compensatuviaje.com
    support: 'compensatuviaje@gmail.com', // PENDIENTE: soporte@compensatuviaje.com
    privacy: 'compensatuviaje@gmail.com', // PENDIENTE: privacidad@compensatuviaje.com
  },

  // Fecha de la última revisión de los textos legales (se muestra en cada página).
  lastUpdated: '26 de septiembre de 2026',
} as const;

/** Nombre del titular: la razón social si está definida, si no la marca. */
export const OWNER_NAME = LEGAL.legalName || LEGAL.brand;

/** "Razón social · RUT x · Dirección", omitiendo lo que esté vacío. */
export const ownerLine = (): string =>
  [LEGAL.legalName, LEGAL.rut && `RUT ${LEGAL.rut}`, LEGAL.address].filter(Boolean).join(' · ');

export const LEGAL_ROUTES = {
  terms: '/terminos',
  privacy: '/privacidad',
  refunds: '/reembolsos',
  cookies: '/cookies',
} as const;
