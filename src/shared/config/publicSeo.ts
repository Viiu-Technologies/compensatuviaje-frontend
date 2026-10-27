// Título y descripción de cada página pública, en un solo lugar.
//
// Lo usan dos consumidores:
//   · las páginas, con useSeo(PUBLIC_SEO['/ruta']), para el <head> en el navegador;
//   · el build (plugin publicSeoPages en vite.config.ts), que escribe un HTML por
//     ruta con estas etiquetas. WhatsApp, LinkedIn y Slack no ejecutan
//     JavaScript: sin eso, todas las páginas se compartían con el título y la
//     descripción del landing.
//
// Sin dependencias del navegador: también se importa desde Node al construir.
import { LEGAL, LEGAL_ROUTES } from './legal';

export interface PageSeo {
  title: string;
  description: string;
  path: string;
}

export const DEFAULT_DESCRIPTION =
  'Calcula y compensa la huella de carbono de tus viajes con proyectos verificados. Certificado digital verificable para personas y empresas.';

export const PUBLIC_SEO = {
  '/': {
    title: `${LEGAL.brand} | Calcula y compensa la huella de carbono de tus viajes`,
    description: DEFAULT_DESCRIPTION,
    path: '/',
  },
  '/calculadora': {
    title: 'Calculadora de Huella de Carbono de Vuelos',
    description: 'Calcula gratis las emisiones de CO₂ de tu vuelo con factores DEFRA y compénsalas con proyectos verificados.',
    path: '/calculadora',
  },
  '/contacto': {
    title: 'Contacto y Soporte',
    description: 'Escríbenos para consultas de personas, empresas, aliados o prensa sobre compensación de huella de carbono.',
    path: '/contacto',
  },
  '/aliados': {
    title: 'Sé un Aliado: publica tu proyecto ambiental',
    description: 'Publica tu proyecto de reforestación, energía o conservación y recibe financiamiento de viajeros y empresas que compensan su huella.',
    path: '/aliados',
  },
  '/pagos': {
    title: 'Métodos de Pago y Seguridad',
    description: 'Paga tu compensación de carbono con Webpay (Transbank). No almacenamos los datos de tu tarjeta.',
    path: '/pagos',
  },
  [LEGAL_ROUTES.terms]: {
    title: 'Términos y Condiciones',
    description: `Condiciones de uso de ${LEGAL.brand}: cálculo de huella de carbono, compra de compensaciones, certificados, retracto y reclamos.`,
    path: LEGAL_ROUTES.terms,
  },
  [LEGAL_ROUTES.privacy]: {
    title: 'Política de Privacidad',
    description: `Cómo ${LEGAL.brand} trata tus datos personales: qué recolectamos, para qué, con quién los compartimos y cómo ejercer tus derechos.`,
    path: LEGAL_ROUTES.privacy,
  },
  [LEGAL_ROUTES.refunds]: {
    title: 'Reembolsos y Derecho de Retracto',
    description: `Política de reembolsos de ${LEGAL.brand}: cuándo procede una devolución y por qué las compensaciones no admiten retracto.`,
    path: LEGAL_ROUTES.refunds,
  },
  [LEGAL_ROUTES.cookies]: {
    title: 'Política de Cookies',
    description: `Qué cookies y almacenamiento local usa ${LEGAL.brand} y cómo controlarlos.`,
    path: LEGAL_ROUTES.cookies,
  },
} satisfies Record<string, PageSeo>;

/** Título completo tal como lo arma useSeo: con la marca al final si no la lleva. */
export const fullTitle = (title: string) => (title.includes(LEGAL.brand) ? title : `${title} | ${LEGAL.brand}`);
