import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // During development, requests starting with /api are forwarded to the Express server
  server: { port: 3000, proxy: { '/api': 'http://localhost:5000' } },
});
