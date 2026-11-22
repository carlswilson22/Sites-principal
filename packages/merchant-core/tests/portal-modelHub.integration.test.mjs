import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSync } from 'esbuild';
import { JSDOM } from 'jsdom';

// Render the real portal in a DOM, using the same BASE_URL replacement as Vite.
// JSDOM does not implement document navigation, so follow each link by opening
// a new document at its resolved URL, just as a reload or a shared link would.
const bundles = new Map();
function bundlePortal(base) {
  if (bundles.has(base)) return bundles.get(base);
  const code = buildSync({
    stdin: {
      contents: `import React from 'react';
        import { createRoot } from 'react-dom/client';
        import App from './sites/portal/src/App.jsx';
        createRoot(document.getElementById('root')).render(React.createElement(App));`,
      resolveDir: process.cwd(),
      loader: 'jsx',
      sourcefile: 'portal-integration.jsx',
    },
    bundle: true,
    platform: 'browser',
    format: 'iife',
    define: {
      'import.meta.env.BASE_URL': JSON.stringify(base),
      'process.env.NODE_ENV': '"production"',
    },
    write: false,
    logLevel: 'silent',
  }).outputFiles[0].text;
  bundles.set(base, code);
  return code;
}

async function waitFor(predicate, message) {
  const deadline = Date.now() + 2000;
  while (Date.now() < deadline) {
    const value = predicate();
    if (value) return value;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.fail(message);
}

async function renderPortal(code, url) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });
  dom.window.eval(code);
  await waitFor(() => dom.window.document.querySelector('main'), `Portal não renderizou em ${url}`);
  return dom;
}

const models = [
  { id: 'auto-dealership', title: 'AutoElite Seminovos (Modelo 1)' },
  { id: 'luxury-dealership', title: 'DriveNow Multimarcas (Modelo 2)' },
  { id: 'popular-dealership', title: 'Enterprise Veículos' },
];

for (const base of ['/', '/Sites-principal/']) {
  for (const origin of ['http://localhost:5173', 'http://192.168.1.5:5173', 'https://carlswilson22.github.io']) {
    test(`portal → hub → site/painel em ${origin}${base}`, async () => {
      const code = bundlePortal(base);
      const mainUrl = new URL(base, origin).href;
      const home = await renderPortal(code, mainUrl);
      try {
        const links = [...home.window.document.querySelectorAll('.model-card a')];
        assert.equal(links.length, 3);
        assert.equal(home.window.document.querySelector('#painel-do-lojista'), null, 'O portal principal não deve exibir uma seção global de painel');
        assert.equal(home.window.document.querySelector('a[href="#painel-do-lojista"]'), null, 'O portal principal não deve ter atalho global para o painel');
        assert.equal(home.window.document.querySelector('iframe'), null, 'O painel só deve abrir após selecionar um modelo');
        for (const model of models) {
          const link = links.find(item => new URL(item.href).searchParams.get('modelo') === model.id);
          assert.ok(link, `Cartão sem link do hub de ${model.title}`);
          assert.equal(link.href, `${mainUrl}?modelo=${model.id}`);

          const hub = await renderPortal(code, link.href);
          try {
            const document = hub.window.document;
            assert.equal(document.querySelector('h1')?.textContent, model.title);
            const site = [...document.querySelectorAll('a')].find(item => item.textContent.includes('Acessar o site'));
            assert.equal(site?.href, `${mainUrl}${model.id}/`);
            assert.ok(document.querySelector('#demo-site-title'), 'Opção de acesso ao site ausente');
            assert.ok(document.querySelector('#demo-panel-title'), 'Opção de acesso ao painel ausente');
            const back = [...document.querySelectorAll('a')].find(item => item.textContent.includes('Voltar aos modelos'));
            assert.equal(back?.href, mainUrl);
            const open = [...document.querySelectorAll('button')].find(item => item.textContent.includes('Fazer login no painel'));
            assert.ok(open, 'Acesso ao painel ausente');
            assert.equal(open.getAttribute('aria-expanded'), 'false');
            assert.equal(document.querySelector('#model-merchant-panel'), null);
            open.click();
            const iframe = await waitFor(() => document.querySelector('#model-merchant-panel iframe'), 'Painel não abriu');
            assert.equal(open.getAttribute('aria-expanded'), 'true');
            assert.equal(iframe.src, `${mainUrl}${model.id}/#painel-lojista`);
            open.click();
            const reopened = await waitFor(() => {
              const next = document.querySelector('#model-merchant-panel iframe');
              return next && next !== iframe && next;
            }, 'Novo clique não reiniciou o painel');
            assert.equal(reopened.src, `${mainUrl}${model.id}/#painel-lojista`);
            const close = [...document.querySelectorAll('button')].find(item => item.textContent.includes('Fechar painel'));
            assert.ok(close, 'Fechamento do painel ausente');
            close.click();
            await waitFor(() => !document.querySelector('#model-merchant-panel'), 'Painel não fechou');
            assert.equal(open.getAttribute('aria-expanded'), 'false');
            assert.equal(document.activeElement, open, 'Foco deve voltar ao botão do painel');
          } finally {
            hub.window.close();
          }
        }
      } finally {
        home.window.close();
      }

      const invalid = await renderPortal(code, `${mainUrl}?modelo=inexistente`);
      try {
        assert.equal(invalid.window.document.querySelectorAll('.model-card a').length, 3);
        assert.equal(invalid.window.document.querySelector('#model-merchant-panel'), null);
      } finally {
        invalid.window.close();
      }
    });
  }
}
