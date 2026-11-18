import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Config aparte de vite.config.ts: ese archivo arma las páginas SEO del build
// y no hace falta cargarlo para correr tests.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    // Las fechas y los formatos es-CL no deben depender de la zona del equipo
    env: { TZ: 'America/Santiago' },
  },
})
