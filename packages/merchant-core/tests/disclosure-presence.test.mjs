import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useDisclosurePresence } from '../src/components/common/useDisclosurePresence.js';

test('conteúdo permanece durante o fechamento, aceita reabertura e respeita movimento reduzido', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
  const previous = { window: globalThis.window, document: globalThis.document, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let reducedMotion = false;
  window.matchMedia = () => ({ matches: reducedMotion });
  const root = createRoot(document.getElementById('root'));
  function Disclosure({ open }) {
    const present = useDisclosurePresence(open, 40);
    return React.createElement('div', { 'data-present': present, 'data-open': open });
  }
  const render = open => root.render(React.createElement(Disclosure, { open }));
  const presence = () => document.querySelector('[data-present]').dataset.present;
  try {
    await act(async () => render(false));
    assert.equal(presence(), 'false');
    await act(async () => render(true));
    assert.equal(presence(), 'true');
    await act(async () => render(false));
    assert.equal(presence(), 'true');
    await act(async () => render(true));
    await act(async () => new Promise(resolve => setTimeout(resolve, 60)));
    assert.equal(presence(), 'true');
    await act(async () => render(false));
    await act(async () => new Promise(resolve => setTimeout(resolve, 60)));
    assert.equal(presence(), 'false');
    reducedMotion = true;
    await act(async () => render(true));
    await act(async () => render(false));
    assert.equal(presence(), 'false');
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    Object.assign(globalThis, previous);
  }
});
