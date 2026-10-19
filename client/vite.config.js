import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
});
