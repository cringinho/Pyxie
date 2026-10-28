import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Painel novo (/dashboard). Build separado do site para não misturar os pacotes:
// roda depois do build principal, que limpa public/dist.
export default defineConfig({
  plugins: [react()],
  base: '/dist/dashboard/',
  build: {
    outDir: path.resolve(__dirname, '../public/dist/dashboard'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'dashboard.html'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
    },
  },
});
