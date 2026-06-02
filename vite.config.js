import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/E_Receipt/',
  css: {
    postcss: './postcss.config.js',
  },
})
