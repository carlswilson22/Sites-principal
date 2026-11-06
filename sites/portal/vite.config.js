import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.BASE_PATH || '/Sites-principal/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
