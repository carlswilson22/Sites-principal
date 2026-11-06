import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.BASE_PATH || '/sites-modelos/popular-dealership/',
  plugins: [react()],
  server: {
    port: 5176,
    host: true
  }
});