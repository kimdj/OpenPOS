import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// O proxy encaminha /api e /users para o Express (porta 3000) durante o
// desenvolvimento. Isso faz o navegador enxergar tudo como "mesma origem",
// então os cookies de sessão do Passport funcionam sem configuração extra
// de CORS no back-end.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
