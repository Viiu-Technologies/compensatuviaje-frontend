// Copia de los valores de src/apps/public/components/landing/tokens.css que se
// usan fuera del CSS importado (overlays, fondos de escena, WebGL).

export const C = {
  teal950: '#012120', // fondo de intro y outro
  canvas: '#F7FAF8', //  lienzo de la landing
  ink: '#073D3D',
  inkSoft: '#40605C',
  inkMute: '#7E9491',
  brandSoft: '#E4F6E0',
  accentContrast: '#046302',
  // Único acento del video: número de CO₂, CTA y check de "compensada".
  // #079705 en vez de #08AE06: este último da 2.97:1 sobre blanco.
  accent: '#079705',
};

export const EASE_OUT = [0.22, 1, 0.36, 1] as const; // --ctv-ease-out
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const; // --ctv-ease-in-out
