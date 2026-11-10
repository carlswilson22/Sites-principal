import { createServer } from 'vite';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import net from 'node:net';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const models = ['auto-dealership', 'luxury-dealership', 'popular-dealership'];
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const portArgument = args.find(argument => argument.startsWith('--port='));
const port = Number(portArgument?.slice(7) ?? (portIndex >= 0 ? args[portIndex + 1] : 5173));
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Informe uma porta válida com --port.');
const baseSegment = (process.env.BASE_PATH || 'Sites-principal').replace(/^\/+|\/+$/g, '');
const base = baseSegment ? `/${baseSegment}/` : '/';
const servers = [];
let closing;

async function siteStyles(directory) {
  const { default: config } = await import(pathToFileURL(path.join(directory, 'tailwind.config.js')));
  const patterns = Array.isArray(config.content) ? config.content : config.content.files;
  const content = patterns.map(pattern => path.resolve(directory, pattern).replaceAll('\\', '/'));
  return { postcss: { plugins: [tailwindcss({ ...config, content }), autoprefixer()] } };
}

async function availableInternalPort() {
  const probe = net.createServer();
  await new Promise((resolve, reject) => {
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', resolve);
  });
  const available = probe.address().port;
  await new Promise((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));
  return available;
}

function closeAll() {
  closing ||= Promise.allSettled([...servers].reverse().map(server => server.close()));
  return closing;
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    closeAll().then(() => process.exit(0));
  });
}

try {
  const proxy = {};
  for (const model of models) {
    const modelBase = `${base}${model}/`;
    const directory = path.join(root, 'sites', model);
    const server = await createServer({
      configFile: path.join(directory, 'vite.config.js'),
      root: directory,
      base: modelBase,
      css: await siteStyles(directory),
      server: {
        host: '127.0.0.1', port: await availableInternalPort(), strictPort: true, open: false,
        hmr: { clientPort: port, path: '__hmr' },
      },
    });
    servers.push(server);
    await server.listen();
    const address = server.httpServer.address();
    proxy[modelBase.slice(0, -1)] = { target: `http://127.0.0.1:${address.port}`, ws: true, changeOrigin: true };
  }

  const directory = path.join(root, 'sites', 'portal');
  const portal = await createServer({
    configFile: path.join(directory, 'vite.config.js'),
    root: directory,
    base,
    css: await siteStyles(directory),
    plugins: [{
      name: 'model-root-redirect',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          const url = new URL(request.url, 'http://localhost');
          if (!models.some(model => url.pathname === `${base}${model}`)) return next();
          response.writeHead(307, { Location: `${url.pathname}/${url.search}` });
          response.end();
        });
      },
    }],
    server: { host: '0.0.0.0', port, strictPort: true, open: false, proxy },
  });
  servers.push(portal);
  await portal.listen();
  console.log('\nPortal e três modelos disponíveis no mesmo endereço:');
  portal.printUrls();
  console.log('Use os cartões do portal para abrir cada modelo. Ctrl+C encerra todos os servidores.\n');
} catch (error) {
  await closeAll();
  console.error(error.message);
  process.exitCode = 1;
}
