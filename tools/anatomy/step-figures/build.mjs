// Arma la página de verificación de las figuras de "Cómo funciona":
//   node tools/anatomy/step-figures/build.mjs
// Escribe step-figures.html junto a este archivo. ?t=segundos congela el reloj
// (por ejemplo ?t=12.8 es la vuelta de Lima al empezar); ?still usa la pose quieta.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const HERE = dirname(fileURLToPath(import.meta.url));
const bundle = await build({ entryPoints: [join(HERE, 'entry.ts')], bundle: true, format: 'esm', write: false, target: 'es2020' });
const css = (await build({ entryPoints: [join(HERE, '../../../src/shared/iso/iso.css')], bundle: true, write: false })).outputFiles[0].text;
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Figuras de Cómo funciona</title><style>${css}
body{margin:0;background:#eef4f2;font:14px system-ui}
main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;padding:24px;max-width:1200px;margin:0 auto}
.card{background:#fbfbfa;border-radius:16px;padding:8px 8px 12px;box-shadow:0 1px 3px #0001}
.card svg{width:100%;height:auto;display:block}
.card p{margin:6px 8px 0;font:12px ui-monospace,Consolas,monospace;color:#57575a}
</style></head><body class="iso" data-theme="light"><main></main><script type="module">${bundle.outputFiles[0].text}</script></body></html>`;
writeFileSync(join(HERE, 'step-figures.html'), html);
console.log('wrote step-figures.html');
