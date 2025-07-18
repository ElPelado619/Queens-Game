import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  base: 'https://elpalado619.github.io/Queens-Game/',
  root: '.',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')  // Points to root index.html
    }
  },
  server: {
    port: 3000,
    open: true
  }
})