// ============================================
// legal.ts - Datos del titular del sitio
// ============================================
// Fuente única para páginas legales, footer y JSON-LD. La Ley 19.496 exige
// que el proveedor se identifique (razón social, RUT, domicilio) antes de
// vender en línea, así que estos valores deben estar completos antes de
// desplegar.
//
// PENDIENTE: reemplazar todo lo que está entre [CORCHETES] con los datos reales.

export const LEGAL = {
  brand: 'CompensaTuViaje',
  legalName: '[RAZÓN SOCIAL SpA]',
  rut: '[RUT 76.xxx.xxx-x]',
  address: '[Dirección, Comuna, Región], Chile',
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

export const LEGAL_ROUTES = {
  terms: '/terminos',
  privacy: '/privacidad',
  refunds: '/reembolsos',
  cookies: '/cookies',
} as const;
