import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  base: 'https://elpalado619.github.io/Queens-Game/',
  root: '.',  // Project root (where index.html is)
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})