import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    // The API runs on artisan serve; proxying keeps the browser same-origin so
    // Sanctum's cookie auth works without extra CORS configuration in dev.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split the heaviest third-party code so the initial route stays small.
        manualChunks(id: string) {
          if (id.includes('node_modules/@tabler/icons-react')) return 'icons'
          if (id.includes('node_modules/@tanstack')) return 'query'
          if (/node_modules\/(react|react-dom|react-router)/.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
})
