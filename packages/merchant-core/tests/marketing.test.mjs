import test from 'node:test';
import assert from 'node:assert/strict';
import { marketingAttribution } from '../src/utils/marketing.js';

test('campanha acompanha a sessão e uma nova UTM substitui a origem', () => {
  const previous = { window: globalThis.window, sessionStorage: globalThis.sessionStorage, document: globalThis.document };
  const data = new Map();
  globalThis.window = { location: { search: '?utm_source=Instagram&utm_campaign=ofertas' } };
  globalThis.document = { referrer: '' };
  globalThis.sessionStorage = { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) };
  try {
    assert.equal(marketingAttribution().marketing_campaign, 'ofertas');
    window.location.search = '';
    assert.equal(marketingAttribution().marketing_source, 'Instagram');
    window.location.search = '?utm_source=Google&utm_campaign=busca';
    assert.equal(marketingAttribution().marketing_source, 'Google');
    window.location.search = '';
    assert.equal(marketingAttribution().marketing_campaign, 'busca');
  } finally { Object.assign(globalThis, previous); }
});
