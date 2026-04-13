import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import http from 'http'

// Shared HTTP agent with larger connection pool to prevent
// "internalConnectMultiple" errors under concurrent requests.
// Node.js default maxSockets is only 5 — too small for dev workloads.
const backendAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60_000,
})

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        proxyTimeout: 60_000,
        timeout: 60_000,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.agent = backendAgent
          })
        },
      },
    },
  },
})
