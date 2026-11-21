import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire, Module } from 'node:module';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { transformSync } from 'esbuild';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

test('transição troca ferramentas sem duplicar conteúdo e respeita acesso e movimento reduzido', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/', pretendToBeVisual: true });
  const saved = {
    window: globalThis.window, document: globalThis.document,
    HTMLElement: globalThis.HTMLElement, SVGElement: globalThis.SVGElement,
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.SVGElement = dom.window.SVGElement;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let reducedMotion = false;
  window.matchMedia = () => ({ matches: reducedMotion });

  const filename = fileURLToPath(new URL('../src/components/layout/MerchantViewTransition.jsx', import.meta.url));
  const compiled = transformSync(readFileSync(filename, 'utf8'), { loader: 'jsx', format: 'cjs' }).code;
  const componentModule = new Module(filename);
  componentModule.filename = filename;
  componentModule.require = createRequire(filename);
  componentModule._compile(compiled, filename);
  const { MerchantViewTransition } = componentModule.exports;
  const root = createRoot(document.getElementById('root'));
  const render = async (active, role = 'proprietario') => act(async () => root.render(
    React.createElement(MerchantViewTransition, { active, tier: 3, role }, visible =>
      React.createElement('button', { id: 'tool-content' }, visible)),
  ));
  const pause = ms => act(async () => new Promise(resolve => setTimeout(resolve, ms)));
  const view = () => document.querySelector('[data-merchant-view]');
  const content = () => document.getElementById('tool-content');

  try {
    await render('dashboard');
    await render('inventory');
    assert.equal(view().dataset.phase, 'closing');
    assert.equal(content().textContent, 'dashboard', 'ferramenta anterior permanece durante a saída');
    assert.equal(view().getAttribute('aria-hidden'), 'true');
    assert(view().hasAttribute('inert'), 'ferramenta em saída não deve aceitar interação');

    await render('leads');
    await pause(360);
    assert.equal(content().textContent, 'leads', 'último clique determina a próxima ferramenta');
    assert.equal(document.querySelectorAll('#tool-content').length, 1);
    await pause(80);
    assert.equal(view().dataset.phase, 'entering', 'conteúdo continua recortado durante a abertura');
    await pause(330);
    assert.equal(view().dataset.phase, 'open');
    assert(!view().hasAttribute('inert'));

    await render('dashboard');
    await render('leads');
    assert.equal(content().textContent, 'leads');
    assert.equal(view().dataset.phase, 'entering', 'voltar rapidamente reverte o fechamento');

    reducedMotion = true;
    await render('audit_lgpd');
    assert.equal(content().textContent, 'audit_lgpd', 'movimento reduzido troca sem esperar');
    assert.equal(view().dataset.phase, 'open');
    reducedMotion = false;
    await render('dashboard', 'gerente');
    assert.equal(content().textContent, 'dashboard', 'perda de permissão remove imediatamente conteúdo restrito');
    assert.equal(document.querySelectorAll('#tool-content').length, 1);
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    Object.assign(globalThis, saved);
  }
});
