import assert from 'node:assert/strict';

const urls = process.argv.slice(2);
if (!urls.length) urls.push('http://localhost:5173/Sites-principal/');
const models = ['auto-dealership', 'luxury-dealership', 'popular-dealership'];

async function checkHmr(url) {
  const clientResponse = await fetch(new URL('@vite/client', url));
  assert(clientResponse.ok, `Cliente Vite indisponível: ${url}`);
  const client = await clientResponse.text();
  const token = client.match(/const wsToken = "([^"]+)"/)?.[1];
  const websocketUrl = new URL('__hmr', url);
  websocketUrl.protocol = websocketUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  if (token) websocketUrl.searchParams.set('token', token);
  await new Promise((resolve, reject) => {
    const websocket = new WebSocket(websocketUrl, 'vite-hmr');
    const timeout = setTimeout(() => { websocket.close(); reject(new Error(`HMR sem resposta: ${url}`)); }, 10000);
    websocket.addEventListener('error', () => { clearTimeout(timeout); reject(new Error(`Falha no HMR: ${url}`)); }, { once: true });
    websocket.addEventListener('message', event => {
      if (JSON.parse(event.data).type !== 'connected') return;
      clearTimeout(timeout);
      websocket.close();
      resolve();
    });
  });
}

for (const input of urls) {
  const base = new URL(input.endsWith('/') ? input : `${input}/`);
  for (const model of ['', ...models]) {
    const url = model ? new URL(`${model}/`, base) : base;
    const response = await fetch(url, { headers: { Accept: 'text/html' } });
    const html = await response.text();
    assert(response.ok && html.includes(`${url.pathname}src/main.jsx`), `Página incorreta em ${url}`);
    const stylesheet = await fetch(new URL('src/index.css', url));
    const css = await stylesheet.text();
    assert(stylesheet.ok && css.includes('.text-white') && !css.includes('Internal Server Error'), `Estilos indisponíveis: ${url}`);
    if (model) {
      const withoutSlash = await fetch(url.href.slice(0, -1), { headers: { Accept: 'text/html' } });
      assert(withoutSlash.ok && (await withoutSlash.text()).includes(`${url.pathname}src/main.jsx`), `Modelo sem barra final incorreto: ${url}`);
      const app = await fetch(new URL('src/App.jsx', url));
      assert(app.ok && (await app.text()).includes('MerchantEntry'), `Aplicação do modelo não encontrada: ${url}`);
      const photo = await fetch(new URL('images/FotoChevroletTracker.jpg', url));
      assert(photo.ok && photo.headers.get('content-type')?.startsWith('image/'), `Foto indisponível: ${url}`);
      await checkHmr(url);
    }
    console.log(`OK: ${url}${model ? ' (página, aplicação, foto e HMR)' : ''}`);
  }
}
