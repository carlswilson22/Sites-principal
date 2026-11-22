import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire, Module } from 'node:module';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { transformSync } from 'esbuild';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { modelsList } from '../../../sites/portal/src/data/modelsData.js';

for (const base of ['/Sites-principal/', '/outro-caminho/', '/']) {
  test(`portal abre e alterna painéis sem sair da origem (${base})`, async () => {
    const dom = new JSDOM('<div id="root"></div>', { url: `http://192.168.1.20:5173${base}` });
    const saved = { window: globalThis.window, document: globalThis.document, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;

    const filename = fileURLToPath(new URL('../../../sites/portal/src/components/MerchantAccess.jsx', import.meta.url));
    const compiled = transformSync(readFileSync(filename, 'utf8'), {
      loader: 'jsx', format: 'cjs', define: { 'import.meta.env.BASE_URL': JSON.stringify(base) },
    }).code;
    const componentModule = new Module(filename);
    componentModule.filename = filename;
    componentModule.require = createRequire(filename);
    componentModule._compile(compiled, filename);
    const root = createRoot(document.getElementById('root'));

    try {
      await act(async () => root.render(React.createElement(componentModule.exports.MerchantAccess, { models: modelsList })));
      assert.equal(document.querySelector('iframe'), null, 'nenhum painel abre antes de ser escolhido');
      const buttons = [...document.querySelectorAll('[aria-label="Escolha o painel do modelo"] button')];
      assert.equal(buttons.length, 3);

      for (const [index, model] of modelsList.entries()) {
        await act(async () => buttons[index].click());
        const frame = document.querySelector('iframe');
        assert.equal(document.querySelectorAll('iframe').length, 1, 'a troca mantém apenas um painel');
        assert.equal(frame.getAttribute('src'), `${base}${model.path}#painel-lojista`);
        assert.equal(frame.src, `http://192.168.1.20:5173${base}${model.path}#painel-lojista`);
        assert.equal(frame.title, `Painel do lojista: ${model.title}`);
        assert.equal(buttons[index].getAttribute('aria-pressed'), 'true');
        assert.equal(buttons.filter(button => button.getAttribute('aria-pressed') === 'true').length, 1);
      }

      await act(async () => [...document.querySelectorAll('button')].find(button => button.textContent.includes('Fechar painel')).click());
      assert.equal(document.querySelector('iframe'), null);
      assert.equal(document.activeElement, buttons[2], 'ao fechar, o foco volta à escolha anterior');
      assert(buttons.every(button => button.getAttribute('aria-pressed') === 'false'));
    } finally {
      await act(async () => root.unmount());
      dom.window.close();
      Object.assign(globalThis, saved);
    }
  });
}
