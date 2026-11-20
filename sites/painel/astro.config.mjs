import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Painel da loja: renderizado no servidor, sempre atrás de login. A verificação de origem dos formulários
// é feita em src/lib/forms.ts (atrás do proxy o Node vê http e o navegador https).
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  security: { checkOrigin: false },
  server: { host: true, port: Number(process.env.PORT || 4400) },
  devToolbar: { enabled: false }
});
