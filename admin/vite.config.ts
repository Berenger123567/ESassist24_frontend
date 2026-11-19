import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Les chemins OpenAPI contiennent déjà le préfixe /api/v1.
// En développement, la console passe par le mock Prism lancé par `npm run mock`.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4010',
        changeOrigin: true,
      },
    },
  },
})
