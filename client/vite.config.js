import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5055',
        changeOrigin: true,
      },
      '/files': {
        target: 'http://localhost:5055',
        changeOrigin: true,
      },
    },
  },
});
