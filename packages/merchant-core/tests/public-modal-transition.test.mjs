import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire, Module } from 'node:module';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { transformSync } from 'esbuild';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useDialog } from '../src/components/common/useDialog.js';

const filename = fileURLToPath(new URL('../src/components/common/ModalTransition.jsx', import.meta.url));
const compiled = transformSync(readFileSync(filename, 'utf8'), { loader: 'jsx', format: 'cjs' }).code;
const module = new Module(filename);
module.filename = filename;
module.paths = Module._nodeModulePaths(fileURLToPath(new URL('../../../..', import.meta.url)));
module.require = createRequire(import.meta.url);
module._compile(compiled, filename);
const { ModalTransition } = module.exports;
const PublicModalTransition = props => React.createElement(ModalTransition, { kind: 'public', ...props });

test('mantém o modal na saída, cancela a saída ao reabrir e respeita movimento reduzido', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
  const saved = { window: globalThis.window, document: globalThis.document, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let reducedMotion = false;
  window.matchMedia = () => ({ matches: reducedMotion });
  const root = createRoot(document.getElementById('root'));
  let clicks = 0;
  const render = open => root.render(React.createElement(PublicModalTransition, { open }, open && React.createElement('div', { role: 'dialog' }, React.createElement('button', { onClick: () => clicks++ }, 'Fechar'))));
  try {
    await act(async () => render(true));
    assert.equal(document.querySelector('[data-public-modal]').dataset.phase, 'open');
    await act(async () => render(false));
    assert.equal(document.querySelector('[data-public-modal]').dataset.phase, 'closing');
    document.querySelector('button').click();
    assert.equal(clicks, 0);
    await act(async () => render(true));
    await act(async () => new Promise(resolve => setTimeout(resolve, 270)));
    assert.equal(document.querySelector('[data-public-modal]').dataset.phase, 'open');
    await act(async () => render(false));
    await act(async () => new Promise(resolve => setTimeout(resolve, 270)));
    assert.equal(document.querySelector('[data-public-modal]'), null);
    reducedMotion = true;
    await act(async () => render(true));
    await act(async () => render(false));
    assert.equal(document.querySelector('[data-public-modal]'), null);
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    Object.assign(globalThis, saved);
  }
});

test('restaura o foco ao botão de origem quando um diálogo substitui outro', async () => {
  const dom = new JSDOM('<button id="origin">Abrir</button><div id="root"></div>', { url: 'http://localhost/' });
  const saved = { window: globalThis.window, document: globalThis.document, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = () => ({ matches: false });
  const root = createRoot(document.getElementById('root'));
  function Dialog({ label }) {
    const ref = useDialog(() => {});
    return React.createElement('div', { ref, role: 'dialog', tabIndex: -1 }, React.createElement('button', null, label));
  }
  const render = (first, second) => root.render(React.createElement(React.Fragment, null,
    React.createElement(PublicModalTransition, { open: first }, first && React.createElement(Dialog, { label: 'Primeiro' })),
    React.createElement(PublicModalTransition, { open: second }, second && React.createElement(Dialog, { label: 'Segundo' }))));
  try {
    document.getElementById('origin').focus();
    await act(async () => render(true, false));
    assert.equal(document.activeElement.textContent, 'Primeiro');
    await act(async () => render(false, true));
    assert.equal(document.activeElement.textContent, 'Segundo');
    await act(async () => new Promise(resolve => setTimeout(resolve, 270)));
    await act(async () => render(false, false));
    await act(async () => new Promise(resolve => setTimeout(resolve, 270)));
    assert.equal(document.activeElement.id, 'origin');
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    Object.assign(globalThis, saved);
  }
});
