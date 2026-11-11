import test from 'node:test';
import assert from 'node:assert/strict';
import { storeSync } from '../src/services/storeSync.js';

function mockStorage(entries) {
  const values = new Map(entries);
  const events = [];
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  globalThis.window = { dispatchEvent: event => events.push(event.detail) };
  globalThis.CustomEvent = class { constructor(type, options) { this.detail = options.detail; } };
  return { values, events };
}

test('despesas persistem e são excluídas somente da loja selecionada', () => {
  const { events } = mockStorage();
  const [expense] = storeSync.saveRecord('drivenow', 'expenses', { vehicle_id: 1, amount: 123.45 });
  assert.equal(storeSync.getRecords('drivenow', 'expenses')[0].amount, 123.45);
  assert.deepEqual(storeSync.getRecords('apexluxury', 'expenses'), []);
  assert.equal(events[0].type, 'EXPENSES_UPDATED');
  storeSync.deleteRecord('drivenow', 'expenses', expense.id);
  assert.deepEqual(storeSync.getRecords('drivenow', 'expenses'), []);
});

test('falhas de storage preservam despesas e histórico de contatos', () => {
  const original = JSON.stringify([{ id: 1, status: 'novo', history: [] }]);
  const { values, events } = mockStorage([['store_leads_drivenow', original], ['store_expenses_drivenow', '[{"id":2,"amount":100}]']]);
  localStorage.setItem = () => { throw new Error('Quota'); };
  assert.throws(() => storeSync.updateLead('drivenow', 1, { status: 'ganho' }));
  assert.throws(() => storeSync.deleteRecord('drivenow', 'expenses', 2));
  assert.equal(values.get('store_leads_drivenow'), original);
  assert.equal(events.length, 0);
});

test('contatos inválidos e removidos não são sobrescritos', () => {
  const { values } = mockStorage([['store_leads_drivenow', '{invalid']]);
  assert.throws(() => storeSync.addLead('drivenow', { name: 'Teste' }));
  assert.equal(values.get('store_leads_drivenow'), '{invalid');
  values.set('store_leads_drivenow', '[]');
  assert.throws(() => storeSync.updateLead('drivenow', 123, { status: 'ganho' }));
  assert.equal(values.get('store_leads_drivenow'), '[]');
});
