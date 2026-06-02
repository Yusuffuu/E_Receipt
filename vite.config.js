import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/E_Receipt/',
  publicDir: 'public', // This ensures public folder is copied to dist
})
