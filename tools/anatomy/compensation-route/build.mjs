// Arma las páginas de verificación de "La ruta de tu compensación":
//   node --experimental-strip-types tools/anatomy/compensation-route/build.mjs
// Escribe compensation-route.html (oscuro) y compensation-route-light.html (claro) junto a este archivo.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { pageHtml } from '../../../src/shared/iso/iso-kit.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const bundle = await build({ entryPoints: [join(HERE, 'entry.ts')], bundle: true, format: 'esm', write: false, target: 'es2020' });
const script = bundle.outputFiles[0].text;

for (const theme of ['dark', 'light']) {
  const file = theme === 'light' ? 'compensation-route-light.html' : 'compensation-route.html';
  writeFileSync(join(HERE, file), pageHtml({ title: 'La ruta de tu compensación', theme, body: '', script }).replace('lang="en"', 'lang="es"'));
  console.log('wrote', file);
}
