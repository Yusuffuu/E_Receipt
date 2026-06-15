import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // base: '/E_Receipt/',
  // Ensure public assets are copied
  publicDir: 'public',
})
