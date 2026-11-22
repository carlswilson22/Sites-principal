import { test } from 'node:test';
import assert from 'node:assert/strict';
import { modelHubHref, findSelectedModel } from '../../../sites/portal/src/data/modelNavigation.js';
import { modelsList } from '../../../sites/portal/src/data/modelsData.js';

test('cada demonstração tem endereço próprio nas bases pública e local', () => {
  for (const base of ['/', '/Sites-principal/', '/outra-base/']) {
    for (const model of modelsList) {
      const url = new URL(modelHubHref(base, model.id), 'https://example.test');
      assert.equal(url.pathname, base);
      assert.equal(findSelectedModel(url.search, modelsList), model);
      // A vitrine continua tendo seu endereço direto separado do hub.
      assert.equal(new URL(`${base}${model.path}`, 'https://example.test').pathname, `${base}${model.path}`);
    }
  }
});

test('seleção desconhecida ou indisponível mantém o portal principal', () => {
  assert.equal(findSelectedModel('', modelsList), null);
  assert.equal(findSelectedModel('?modelo=desconhecido', modelsList), null);
  assert.equal(findSelectedModel('?modelo=auto-dealership', [{ ...modelsList[0], status: 'unavailable' }]), null);
});
