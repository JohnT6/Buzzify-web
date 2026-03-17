import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5090',
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'http://localhost:5090',
        changeOrigin: true,
        secure: false,
      },
      '/audio': {
        target: 'http://localhost:5090',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
