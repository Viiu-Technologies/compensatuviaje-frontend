// Convierte a WebP las imágenes que el sitio carga, junto a cada original:
//   node tools/images-to-webp.mjs
// No convierte: íconos de la app (manifest, apple-touch-icon), favicon, la
// imagen para redes sociales (og:image) ni el logo que usa jsPDF en los
// certificados: esos consumidores no siempre aceptan WebP.
import { statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const PUBLIC = join(process.cwd(), 'public');

/** [ruta en public, modo]. lossless: mapas de normales y alturas (son datos, no fotos). */
const JOBS = [
  // Fotos de contenido
  ['images/atacama_solar_park.jpg', 'photo'],
  ['images/realistic_eco_seedling.png', 'photo'],
  ['images/realistic_forest_canopy.png', 'photo'],
  ['images/brand/new-brand/targetas-compensa.jpeg', 'photo'],
  // Texturas del globo
  ['textures/earth-daymap-2k.jpg', 'photo'],
  ['textures/earth-nightmap-2k.jpg', 'photo'],
  ['textures/earth-clouds-2k.jpg', 'photo'],
  // Texturas del bosque
  ['textures/ground/grass.jpg', 'photo'],
  ['textures/ground/dirt_color.jpg', 'photo'],
  ['textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_Color.jpg', 'photo'],
  ['textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_Roughness.jpg', 'photo'],
  ['textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_NormalGL.jpg', 'lossless'],
  ['textures/tree/leaves/oak.png', 'alpha'],
  ['textures/tree/leaves/pine.png', 'alpha'],
  ['textures/tree/leaves/ash.png', 'alpha'],
  ['textures/tree/leaves/aspen.png', 'alpha'],
  // Materiales de las tarjetas 3D
  ...['material-evidence', 'material-evidence-card45'].flatMap((dir) =>
    ['cardfront', 'cardedge'].flatMap((face) =>
      ['albedo', 'ao', 'roughness', 'normal', 'height'].map((map) => [`${dir}/${face}_${map}.png`, map === 'normal' || map === 'height' ? 'lossless' : 'photo']),
    ),
  ),
];

const OPTIONS = {
  photo: { quality: 82, effort: 6 },
  alpha: { quality: 85, alphaQuality: 90, effort: 6 },
  lossless: { lossless: true, effort: 6 },
};

// Un JPG ya perdió información: guardarlo sin pérdida solo lo agranda (el
// mapa de normales de la corteza pasaba de 243 KB a 1,1 MB). Se codifica con
// alta calidad.
OPTIONS.fromJpeg = { quality: 92, effort: 6 };

let before = 0;
let after = 0;
const converted = [];
for (const [rel, requested] of JOBS) {
  const src = join(PUBLIC, rel);
  let size;
  try { size = statSync(src).size; } catch { continue; } // no todas las carpetas tienen todas las caras
  const mode = requested === 'lossless' && /\.jpe?g$/i.test(rel) ? 'fromJpeg' : requested;
  const out = src.replace(/\.(png|jpe?g)$/i, '.webp');
  await sharp(src).webp(OPTIONS[mode]).toFile(out);
  const next = statSync(out).size;
  // Solo vale la pena si ahorra al menos un 10 %: muchos JPG ya comprimidos
  // salen más pesados en WebP.
  const keep = next < size * 0.9;
  if (keep) converted.push(rel); else unlinkSync(out);
  before += size;
  after += keep ? next : size;
  console.log(`${String(Math.round(size / 1024)).padStart(6)} KB → ${String(Math.round(next / 1024)).padStart(5)} KB  ${mode.padEnd(8)} ${keep ? 'WebP    ' : 'original'} ${rel}`);
}
console.log(`total servido ${Math.round(before / 1024)} KB → ${Math.round(after / 1024)} KB`);
// Lista para actualizar las referencias en el código.
writeFileSync(join(process.cwd(), 'tools', 'webp-converted.json'), JSON.stringify(converted, null, 2));
