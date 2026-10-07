import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vitest/config'

/** Rotas do app que precisam servir o SPA, não um arquivo estático. */
const SPA_ROUTES = ['/roadmap', '/topico', '/sinais', '/lab']

/**
 * O projeto tem HTMLs soltos na raiz (ex.: `roadmap.html`), e o servidor de
 * dev do Vite resolve arquivos estáticos ANTES do fallback de SPA. Sem isto,
 * abrir `/roadmap` direto na barra de endereços entrega `roadmap.html` em vez
 * da aplicação. Este middleware devolve a precedência às rotas do app; os
 * arquivos continuam acessíveis pelo nome completo (`/roadmap.html`).
 */
function spaRoutePriority(): Plugin {
  return {
    name: 'spa-route-priority',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = (req.url ?? '').split('?')[0]
        if (SPA_ROUTES.some((r) => path === r || path.startsWith(`${r}/`))) {
          req.url = '/index.html'
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [spaRoutePriority(), react(), tailwindcss()],
  server: {
    // Proxy do backend: com isto o frontend chama '/api/...' no mesmo origin,
    // então não existe CORS para configurar de nenhum lado.
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${process.env.API_PORT ?? 8787}`,
        changeOrigin: false,
      },
    },
  },
  test: {
    environment: 'node',
  },
})
