// Mide una página del build de PRODUCCIÓN con Lighthouse y reporta la mediana.
//
//   pnpm run build
//   node tools/lighthouse-prod.mjs [ruta=/] [corridas=3] [--desktop]
//
// No midan sobre `pnpm dev` (localhost:5199/3000): el servidor de desarrollo
// sirve cientos de módulos sin empaquetar ni minificar y los números salen
// varias veces peores que en producción. Una sola corrida tampoco sirve: en un
// equipo con otros procesos el bloqueo total varía 2-3x entre corridas.
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const desktop = args.includes('--desktop');
const [route = '/', runsArg = '3'] = args.filter((a) => !a.startsWith('--'));
const runs = Math.max(1, Number(runsArg) || 3);
const PORT = 4173;
const url = `http://localhost:${PORT}${route}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const preview = spawn('pnpm', ['exec', 'vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' });
const tmp = mkdtempSync(join(tmpdir(), 'ctv-lh-'));
try {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(url)).ok) break; } catch {}
    await sleep(500);
  }
  const results = [];
  for (let i = 1; i <= runs; i++) {
    const out = join(tmp, `run${i}.json`);
    execFileSync('npx', ['-y', 'lighthouse@13.4.1', url, '--quiet', '--chrome-flags=--headless=new', '--only-categories=performance,accessibility,seo,best-practices', '--output=json', `--output-path=${out}`, ...(desktop ? ['--preset=desktop'] : [])], { shell: true, stdio: 'ignore' });
    const r = JSON.parse(readFileSync(out, 'utf8'));
    const a = r.audits;
    results.push({
      perf: Math.round(r.categories.performance.score * 100),
      a11y: Math.round(r.categories.accessibility.score * 100),
      seo: Math.round(r.categories.seo.score * 100),
      bp: Math.round(r.categories['best-practices'].score * 100),
      fcp: a['first-contentful-paint'].numericValue,
      lcp: a['largest-contentful-paint'].numericValue,
      tbt: a['total-blocking-time'].numericValue,
      cls: a['cumulative-layout-shift'].numericValue,
      kb: a['total-byte-weight'].numericValue / 1024,
    });
    const x = results.at(-1);
    console.log(`corrida ${i}: rendimiento ${x.perf} · FCP ${(x.fcp / 1000).toFixed(1)} s · LCP ${(x.lcp / 1000).toFixed(1)} s · TBT ${Math.round(x.tbt)} ms · CLS ${x.cls.toFixed(3)}`);
  }
  const m = (k) => median(results.map((r) => r[k]));
  console.log(`\nMEDIANA de ${runs} (${desktop ? 'escritorio' : 'móvil'}, ${route})`);
  console.log(`  rendimiento ${m('perf')} · accesibilidad ${m('a11y')} · buenas prácticas ${m('bp')} · SEO ${m('seo')}`);
  console.log(`  FCP ${(m('fcp') / 1000).toFixed(1)} s · LCP ${(m('lcp') / 1000).toFixed(1)} s · TBT ${Math.round(m('tbt'))} ms · CLS ${m('cls').toFixed(3)} · peso ${Math.round(m('kb'))} KB`);
} finally {
  // En Windows, matar el proceso de pnpm deja vivo el vite que lanzó.
  if (process.platform === 'win32') {
    try { execFileSync('taskkill', ['/pid', String(preview.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
  } else {
    preview.kill();
  }
  rmSync(tmp, { recursive: true, force: true });
}
