import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.BASE_PATH || '/Sites-principal/auto-dealership/',
  define: { 'import.meta.env.VITE_MERCHANT_DEMO': JSON.stringify(process.env.VITE_MERCHANT_DEMO || 'true') },
  plugins: [react()],
  server: {
    port: 5174,
    host: true
  }
});
