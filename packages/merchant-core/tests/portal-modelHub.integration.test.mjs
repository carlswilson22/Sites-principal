import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSync } from 'esbuild';
import { JSDOM } from 'jsdom';

// Renderiza o portal real com a mesma substituição de BASE_URL usada pelo Vite.
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

async function renderPortal(code, url, { reducedMotion = false } = {}) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });
  dom.window.matchMedia = () => ({ matches: reducedMotion, addEventListener() {}, removeEventListener() {} });
  dom.window.eval(code);
  await waitFor(() => dom.window.document.querySelector('main'), `Portal não renderizou em ${url}`);
  return dom;
}

const models = [
  { id: 'auto-dealership', title: 'AutoElite Seminovos (Modelo 1)' },
  { id: 'luxury-dealership', title: 'DriveNow Multimarcas (Modelo 2)' },
  { id: 'popular-dealership', title: 'Enterprise Veículos' },
];

function panelLink(dialog) {
  return [...dialog.querySelectorAll('a')].find(link => link.textContent.includes('Fazer login no painel'));
}

for (const base of ['/', '/Sites-principal/']) {
  for (const origin of ['http://localhost:5173', 'http://192.168.1.5:5173', 'https://carlswilson22.github.io']) {
    test(`portal abre modal com site e painel de cada modelo em ${origin}${base}`, async () => {
      const code = bundlePortal(base);
      const mainUrl = new URL(base, origin).href;
      const home = await renderPortal(code, mainUrl);
      const document = home.window.document;
      try {
        assert.equal(document.querySelectorAll('.model-card').length, 3);
        assert.equal(document.querySelector('#painel-do-lojista'), null, 'O portal principal não deve exibir seção global de painel');
        assert.equal(document.querySelector('iframe'), null, 'O painel não deve carregar antes da seleção');
        for (const model of models) {
          const card = document.getElementById(`model-${model.id}`).closest('.model-card');
          const trigger = [...card.querySelectorAll('a, button')].find(item => item.textContent.includes('Ver demonstração'));
          assert.ok(trigger, `Cartão sem acesso à demonstração de ${model.title}`);
          trigger.focus();
          const currentUrl = home.window.location.href;
          trigger.click();
          const dialog = await waitFor(() => document.querySelector('[role="dialog"][aria-modal="true"]'), 'Modal da demonstração não abriu');
          assert.equal(home.window.location.href, currentUrl, 'Abrir o modal não deve navegar para outra página');
          assert.equal(document.querySelectorAll('[role="dialog"]').length, 1, 'Deve existir apenas um modal');
          assert.equal(document.querySelectorAll('.model-card').length, 3, 'Os cartões devem continuar no portal atrás do modal');
          assert.ok(document.getElementById(dialog.getAttribute('aria-labelledby')).textContent.includes(model.title));
          await waitFor(() => dialog.contains(document.activeElement), 'O foco inicial deve entrar no modal');
          assert.match(dialog.textContent, /Conhecer o site/);
          assert.match(dialog.textContent, /Painel do lojista/);
          const site = [...dialog.querySelectorAll('a')].find(item => item.textContent.includes('Acessar o site'));
          assert.equal(site?.href, `${mainUrl}${model.id}/`);
          const login = panelLink(dialog);
          assert.ok(login, 'Acesso ao painel ausente');
          assert.equal(login.href, `${mainUrl}${model.id}/#painel-lojista`, 'O painel deve abrir na página do modelo');
          assert.ok(!login.target || login.target === '_self', 'O painel deve abrir na mesma aba');
          assert.equal(dialog.querySelector('iframe'), null, 'O painel não deve abrir dentro do modal');
          dialog.querySelector('[aria-label="Fechar demonstração"]').click();
          await waitFor(() => !document.querySelector('[role="dialog"]'), 'Modal não fechou');
          await waitFor(() => document.activeElement === trigger, 'O foco deve voltar ao cartão depois de fechar');
        }
      } finally {
        home.window.close();
      }
    });
  }
}

test('Escape fecha o modal, libera o portal e devolve o foco ao cartão', async () => {
  const dom = await renderPortal(bundlePortal('/'), 'http://localhost:5173/');
  try {
    const document = dom.window.document;
    const trigger = [...document.querySelector('.model-card').querySelectorAll('a, button')].find(item => item.textContent.includes('Ver demonstração'));
    trigger.focus();
    trigger.click();
    const dialog = await waitFor(() => document.querySelector('[role="dialog"]'), 'Modal não abriu');
    await waitFor(() => dialog.contains(document.activeElement), 'O foco inicial deve entrar no modal');
    document.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await waitFor(() => !document.querySelector('[role="dialog"]'), 'Escape não fechou o modal');
    await waitFor(() => document.activeElement === trigger, 'O foco deve voltar ao cartão');
  } finally {
    dom.window.close();
  }
});

test('Tab e Shift+Tab mantêm o foco no modal das opções', async () => {
  const dom = await renderPortal(bundlePortal('/'), 'http://localhost:5173/');
  try {
    const document = dom.window.document;
    const trigger = [...document.querySelector('.model-card').querySelectorAll('a, button')].find(item => item.textContent.includes('Ver demonstração'));
    trigger.click();
    const dialog = await waitFor(() => document.querySelector('[role="dialog"]'), 'Modal não abriu');
    await waitFor(() => dialog.contains(document.activeElement), 'O foco inicial deve entrar no modal');
    const focusable = [...dialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
    assert.ok(focusable.length >= 2, 'São necessárias opções acessíveis no modal');
    const first = focusable[0];
    const last = focusable.at(-1);
    last.focus();
    last.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    assert.ok(document.activeElement === first, 'Tab deve retornar à primeira opção');
    first.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    assert.ok(document.activeElement === last, 'Shift+Tab deve retornar à última opção');
  } finally {
    dom.window.close();
  }
});

test('clique no fundo fecha; clique no conteúdo mantém o modal e o portal volta a ser interativo', async () => {
  const dom = await renderPortal(bundlePortal('/'), 'http://localhost:5173/');
  try {
    const document = dom.window.document;
    const portal = document.getElementById('portal-content');
    const previousOverflow = document.body.style.overflow;
    const trigger = [...document.querySelector('.model-card').querySelectorAll('a, button')].find(item => item.textContent.includes('Ver demonstração'));
    trigger.focus();
    trigger.click();
    const dialog = await waitFor(() => document.querySelector('[role="dialog"]'), 'Modal não abriu');
    await waitFor(() => portal.hasAttribute('inert'), 'O portal deveria ficar inativo enquanto o modal está aberto');
    assert.equal(portal.getAttribute('aria-hidden'), 'true');
    assert.equal(document.body.style.overflow, 'hidden');
    dialog.dispatchEvent(new dom.window.MouseEvent('mousedown', { bubbles: true }));
    assert.equal(dialog.parentElement.dataset.closing, 'false', 'Clique dentro do modal não deve fechá-lo');
    dialog.parentElement.dispatchEvent(new dom.window.MouseEvent('mousedown', { bubbles: true }));
    await waitFor(() => !document.querySelector('[role="dialog"]'), 'Clique no fundo não fechou o modal');
    await waitFor(() => !portal.hasAttribute('inert'), 'O portal deve voltar a ser interativo');
    assert.equal(portal.hasAttribute('aria-hidden'), false);
    assert.equal(document.body.style.overflow, previousOverflow);
    await waitFor(() => document.activeElement === trigger, 'O foco deve voltar ao cartão');
  } finally {
    dom.window.close();
  }
});

test('movimento reduzido remove o modal sem iniciar animação de saída', async () => {
  const dom = await renderPortal(bundlePortal('/'), 'http://localhost:5173/', { reducedMotion: true });
  try {
    const document = dom.window.document;
    const trigger = [...document.querySelector('.model-card').querySelectorAll('a, button')].find(item => item.textContent.includes('Ver demonstração'));
    trigger.focus();
    trigger.click();
    const dialog = await waitFor(() => document.querySelector('[role="dialog"]'), 'Modal não abriu');
    await waitFor(() => dialog.contains(document.activeElement), 'O foco inicial deve entrar no modal');
    dialog.querySelector('[aria-label="Fechar demonstração"]').click();
    await new Promise(resolve => setTimeout(resolve, 50));
    assert.ok(!document.querySelector('[role="dialog"]'), 'Movimento reduzido deve fechar sem aguardar a animação');
    await waitFor(() => document.activeElement === trigger, 'O foco deve voltar ao cartão');
    assert.equal(dialog.isConnected, false);
  } finally {
    dom.window.close();
  }
});

test('navegação do histórico seleciona o modelo correto e devolve o foco ao seu cartão', async () => {
  const dom = await renderPortal(bundlePortal('/'), 'http://localhost:5173/', { reducedMotion: true });
  try {
    const document = dom.window.document;
    const firstCard = document.getElementById('model-auto-dealership').closest('.model-card');
    const firstTrigger = [...firstCard.querySelectorAll('a, button')].find(item => item.textContent.includes('Ver demonstração'));
    firstTrigger.focus();
    firstTrigger.click();
    let dialog = await waitFor(() => document.querySelector('[role="dialog"]'), 'Primeiro modal não abriu');
    await waitFor(() => dialog.contains(document.activeElement), 'Foco não entrou no primeiro modal');
    dialog.querySelector('[aria-label="Fechar demonstração"]').click();
    await waitFor(() => document.activeElement === firstTrigger, 'Primeiro foco não voltou ao cartão');
    dom.window.history.pushState(null, '', '?modelo=luxury-dealership');
    dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate'));
    dialog = await waitFor(() => document.querySelector('[role="dialog"]'), 'Navegação no histórico não abriu o modal');
    assert.ok(dialog.textContent.includes('DriveNow Multimarcas (Modelo 2)'));
    await waitFor(() => dialog.contains(document.activeElement), 'Foco não entrou no segundo modal');
    dialog.querySelector('[aria-label="Fechar demonstração"]').click();
    const secondCard = document.getElementById('model-luxury-dealership').closest('.model-card');
    await waitFor(() => secondCard.contains(document.activeElement), 'O foco deve retornar ao cartão do segundo modelo');
  } finally {
    dom.window.close();
  }
});

test('links antigos para modelo abrem o modal sobre o portal; seleção inválida é ignorada', async () => {
  const code = bundlePortal('/Sites-principal/');
  const base = 'https://carlswilson22.github.io/Sites-principal/';
  for (const model of models) {
    const dom = await renderPortal(code, `${base}?modelo=${model.id}&origem=teste#escolhas`);
    try {
      const document = dom.window.document;
      assert.equal(document.querySelectorAll('.model-card').length, 3);
      const dialog = await waitFor(() => document.querySelector('[role="dialog"]'), 'Link antigo não abriu o modal');
      assert.ok(dialog.textContent.includes(model.title));
      const login = panelLink(dialog);
      assert.equal(login?.href, `${base}${model.id}/#painel-lojista`, 'O link antigo deve apresentar o painel correto');
      assert.ok(!login.target || login.target === '_self', 'O painel deve abrir na mesma aba');
      assert.equal(dialog.querySelector('iframe'), null, 'O link antigo não deve embutir o painel no modal');
      dialog.querySelector('[aria-label="Fechar demonstração"]').click();
      await waitFor(() => !document.querySelector('[role="dialog"]'), 'Modal não fechou');
      const remainingUrl = new URL(dom.window.location.href);
      assert.equal(remainingUrl.searchParams.has('modelo'), false, 'Fechar o modal não deve reabri-lo ao atualizar');
      assert.equal(remainingUrl.searchParams.get('origem'), 'teste');
      assert.equal(remainingUrl.hash, '#escolhas');
      const card = document.getElementById(`model-${model.id}`).closest('.model-card');
      await waitFor(() => card.contains(document.activeElement), 'O foco deve retornar ao cartão do modelo');
    } finally {
      dom.window.close();
    }
  }
  const invalid = await renderPortal(code, `${base}?modelo=inexistente`);
  try {
    assert.equal(invalid.window.document.querySelectorAll('.model-card').length, 3);
    assert.equal(invalid.window.document.querySelector('[role="dialog"]'), null);
    assert.equal(invalid.window.document.querySelector('iframe'), null);
  } finally {
    invalid.window.close();
  }
});
