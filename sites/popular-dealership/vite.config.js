import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.BASE_PATH || '/Sites-principal/popular-dealership/',
  define: { 'import.meta.env.VITE_MERCHANT_DEMO': JSON.stringify(process.env.VITE_MERCHANT_DEMO || 'true') },
  plugins: [react()],
  server: {
    port: 5176,
    host: true
  }
});
