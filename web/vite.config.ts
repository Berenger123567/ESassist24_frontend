import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Le contrat OpenAPI contient déjà le préfixe /api/v1.
// En développement, on proxifie vers le mock Prism lancé par `npm run mock`.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4010',
        changeOrigin: true,
      },
    },
  },
})
