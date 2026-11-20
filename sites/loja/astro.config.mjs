import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Site público renderizado no servidor a cada visita: o estoque aparece e some na hora em que a loja o altera.
// A verificação de origem dos formulários é feita pelo próprio site (src/lib/security.ts), porque atrás do
// proxy (Caddy) o endereço visto pelo Node é http e o do navegador é https.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  security: { checkOrigin: false },
  server: { host: true, port: Number(process.env.PORT || 4321) },
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'auto' }
});
