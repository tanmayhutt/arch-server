import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Local console development: run the platform service on port 4000.
    proxy: { '/api/platform': 'http://127.0.0.1:4000', '/api/public': 'http://127.0.0.1:4000', '/api/guest': 'http://127.0.0.1:4000' },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
