import test from 'node:test';
import assert from 'node:assert/strict';
import { storeSync } from '../src/services/storeSync.js';
import { generateContractDocument } from '../src/utils/contracts.js';
import { maskCPF } from '../src/utils/masking.js';

test('CRM e contratos persistem por loja e sincronizam eventos', () => {
  const values = new Map();
  const events = new EventTarget();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  globalThis.window = {
    localStorage,
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
  };
  globalThis.CustomEvent = class extends Event {
    constructor(type, options) { super(type); this.detail = options.detail; }
  };
  const updates = [];
  const unsubscribe = storeSync.subscribe('drivenow', value => updates.push(value));
  const [client] = storeSync.saveRecord('drivenow', 'clients', {
    name: 'Cliente', phone: '11987654321', cpfMasked: maskCPF('12345678901'),
  });
  assert.equal(storeSync.getRecords('drivenow', 'clients')[0].name, 'Cliente');
  assert.deepEqual(storeSync.getRecords('autoelite', 'clients'), []);
  assert.equal(updates[0].type, 'CLIENTS_UPDATED');
  assert(!values.get('store_clients_drivenow').includes('12345678901'));
  storeSync.saveRecord('drivenow', 'clients', { ...client, name: 'Atualizado' });
  assert.equal(storeSync.getRecords('drivenow', 'clients').length, 1);
  const storage = new Event('storage');
  Object.assign(storage, { key: 'store_contracts_drivenow', newValue: '[{"id":"other-tab"}]', storageArea: localStorage });
  events.dispatchEvent(storage);
  assert.equal(updates.at(-1).contracts[0].id, 'other-tab');
  unsubscribe();
  const count = updates.length;
  events.dispatchEvent(storage);
  assert.equal(updates.length, count);
  values.set('store_clients_drivenow', '{}');
  assert.throws(() => storeSync.saveRecord('drivenow', 'clients', { name: 'Novo' }));
  assert.equal(values.get('store_clients_drivenow'), '{}');
  assert.throws(() => storeSync.getRecords('drivenow', 'unknown'));
});

test('documentos escapam texto livre e respeitam o sinal informado, incluindo zero', () => {
  const input = {
    type: 'recibo_sinal',
    dealership: { nome: 'DriveNow & Cia' },
    client: { name: '<img src=x onerror=alert(1)>', cpfMasked: '***.456.789-**' },
    vehicle: { title: '<script>alert(1)</script>', price: 50000 },
    terms: { signalValue: 1234.56 },
  };
  const document = generateContractDocument(input);
  assert(document.html.includes('1.234,56'));
  assert(document.html.includes('&lt;img'));
  assert(!document.html.includes('<script>'));
  assert(document.html.includes('DriveNow &amp; Cia'));
  assert.notEqual(document.code, generateContractDocument(input).code);
  assert(generateContractDocument({ ...input, terms: { signalValue: 0 } }).html.includes('R$ 0,00'));
});
