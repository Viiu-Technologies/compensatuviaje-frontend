// Mismas familias que index.html del front. loadFont() registra la @font-face
// con el nombre real ("Outfit", "Inter"), así que las variables --ctv-font-*
// de tokens.css las resuelven sin cambios.
import { loadFont as loadOutfit } from '@remotion/google-fonts/Outfit';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadGeistMono } from '@remotion/google-fonts/GeistMono';

// Outfit no tiene cursiva: el <em>medible</em> del hero es una oblicua
// sintetizada por el navegador, igual que en la web.
const outfit = loadOutfit('normal', { weights: ['600', '700', '800'], subsets: ['latin'] });
const inter = loadInter('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin'] });
// Datos (km, kg, factores): la misma mono que --ctv-font-mono en la web.
const geistMono = loadGeistMono('normal', { weights: ['400', '500', '600'], subsets: ['latin'] });

export const FONT_DISPLAY = outfit.fontFamily;
export const FONT_BODY = inter.fontFamily;
export const FONT_MONO = geistMono.fontFamily;

// La cámara mide el layout cuando las fuentes ya están: con la fuente de
// respaldo los saltos de línea (y por tanto las alturas) son otros.
export const fontsReady = Promise.all([
  outfit.waitUntilDone(),
  inter.waitUntilDone(),
  geistMono.waitUntilDone(),
]);
