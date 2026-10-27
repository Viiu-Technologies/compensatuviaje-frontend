import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { PUBLIC_SEO, fullTitle } from './src/shared/config/publicSeo'
import { LEGAL } from './src/shared/config/legal'

const escapeAttr = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Un HTML por página pública, con su título, descripción, canónica y etiquetas
 * Open Graph. WhatsApp, LinkedIn y Slack no ejecutan JavaScript: sin esto todas
 * las páginas se compartían con el título del landing. El contenido sigue
 * siendo la SPA; solo cambia el <head>. Vercel sirve dist/<ruta>/index.html
 * antes de aplicar las reescrituras de vercel.json.
 */
function publicSeoPages(): Plugin {
  let outDir = 'dist'
  return {
    name: 'ctv-public-seo-pages',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const base = readFileSync(resolve(outDir, 'index.html'), 'utf8')
      for (const page of Object.values(PUBLIC_SEO)) {
        // La raíz no se toca: su index.html es también el respaldo de toda ruta
        // sin archivo propio (vercel.json reescribe todo a él). Con una canónica
        // a "/" cualquier página no listada diría ser el landing.
        if (page.path === '/') continue
        const title = escapeAttr(fullTitle(page.title))
        const description = escapeAttr(page.description)
        const url = escapeAttr(LEGAL.site + page.path)
        const html = base
          .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
          .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
          .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
          .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
          .replace('</title>', `</title>\n    <link rel="canonical" href="${url}" />`)
        const dir = resolve(outDir, page.path.replace(/^\//, ''))
        mkdirSync(dir, { recursive: true })
        writeFileSync(resolve(dir, 'index.html'), html)
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Incluir todos los archivos JSX/TSX
      include: /\.(jsx?|tsx?)$/,
    }),
    tailwindcss(),
    publicSeoPages(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Función y no lista: con la forma de lista, Rollup mete en cada grupo
        // también las dependencias compartidas de la librería. Una utilidad que
        // recharts comparte con @react-three/fiber terminaba en vendor-charts, y
        // el globo 3D del landing descargaba el paquete entero de gráficos.
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return undefined;
          // use-sync-external-store y react-is los usan recharts y el 3D
          // (zustand en @react-three/fiber): si no tienen grupo propio, Rollup
          // los mete en vendor-charts y el globo descarga los gráficos.
          if (/\/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom|use-sync-external-store|react-is)\//.test(id)) return 'vendor-react';
          if (/\/node_modules\/(clsx|eventemitter3|tiny-invariant)\//.test(id)) return 'vendor-utils';
          if (/\/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) return 'vendor-motion';
          if (/\/node_modules\/(recharts|victory-vendor|d3-[a-z-]+|@reduxjs\/toolkit|redux|immer|reselect|decimal\.js-light)\//.test(id)) return 'vendor-charts';
          return undefined;
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    allowedHosts: ['karima-pseudocommissural-discoverably.ngrok-free.dev'],
  },
})