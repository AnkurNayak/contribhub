import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { seoPrerender } from './scripts/seo-prerender.ts'

export default defineConfig({
  // Set VITE_BASE=/repo-name/ when deploying to a GitHub Pages project site.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss(), seoPrerender()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  test: {
    environment: 'node',
  },
})
