import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Incluir todos los archivos JSX/TSX
      include: /\.(jsx?|tsx?)$/,
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-pdf': ['@react-pdf/renderer', 'file-saver'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})