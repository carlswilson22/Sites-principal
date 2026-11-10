import test from 'node:test';
import assert from 'node:assert/strict';
import { storeSync } from '../src/services/storeSync.js';

function storageHarness() {
  const values = new Map();
  const events = [];
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  globalThis.window = { dispatchEvent: event => events.push(event.detail) };
  globalThis.CustomEvent = class {
    constructor(type, options) { this.type = type; this.detail = options.detail; }
  };
  return { values, events };
}

test('falha de quota não publica mudanças nem remove dados anteriores', () => {
  const { values, events } = storageHarness();
  const existing = JSON.stringify([{ id: 7, nome: 'Original', preco: 10000 }]);
  values.set('store_vehicles_drivenow', existing);
  localStorage.setItem = () => { throw new DOMException('Quota', 'QuotaExceededError'); };
  assert.throws(() => storeSync.saveVehicle('drivenow', { id: 7, title: 'Alterado' }), /Não foi possível salvar/);
  assert.throws(() => storeSync.deleteVehicle('drivenow', 7), /Não foi possível salvar/);
  assert.equal(values.get('store_vehicles_drivenow'), existing);
  assert.deepEqual(events, []);
});

test('dados inválidos bloqueiam mutações sem sobrescrever o armazenamento', () => {
  const { values, events } = storageHarness();
  const fallback = [{ id: 1, nome: 'Demonstração' }];
  for (const invalid of ['{', '{}', '[null]', '[42]']) {
    values.set('store_vehicles_drivenow', invalid);
    assert.equal(storeSync.getVehicles('drivenow', fallback)[0].nome, 'Demonstração');
    assert.throws(() => storeSync.saveVehicle('drivenow', { nome: 'Novo' }, fallback));
    assert.throws(() => storeSync.deleteVehicle('drivenow', 1, fallback));
    assert.equal(values.get('store_vehicles_drivenow'), invalid);
  }
  assert.deepEqual(events, []);
});

test('edição preserva ID e fotos duráveis após nova leitura, com isolamento por loja', () => {
  const { events } = storageHarness();
  storeSync.saveVehicle('drivenow', { id: 'car-1', nome: 'Inicial', preco: 20000 });
  const stored = storeSync.getVehicles('drivenow')[0];
  const photo = 'data:image/jpeg;base64,dGVzdGU=';
  storeSync.saveVehicle('drivenow', { ...stored, title: 'Editado', cover_photo: photo, photos: [photo] });
  const reloaded = storeSync.getVehicles('drivenow');
  assert.equal(reloaded.length, 1);
  assert.equal(reloaded[0].id, 'car-1');
  assert.equal(reloaded[0].nome, 'Editado');
  assert.equal(reloaded[0].imagemPrincipal, photo);
  assert.deepEqual(reloaded[0].imagens, [photo]);
  assert.deepEqual(storeSync.getVehicles('autoelite'), []);
  assert.equal(events.length, 2);
  storeSync.deleteVehicle('drivenow', 'car-1');
  assert.deepEqual(storeSync.getVehicles('drivenow'), []);
});
