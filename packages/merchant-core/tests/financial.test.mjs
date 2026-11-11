import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeVehicleFinancial, validateExpense } from '../src/utils/financial.js';
import { storeSync } from '../src/services/storeSync.js';

test('resultado aguarda aquisição e não transforma o preço anunciado em lucro', () => {
  const summary = summarizeVehicleFinancial({ id: 1, price: 50000 }, [{ vehicle_id: 1, category: 'mecanica', amount: 1000 }]);
  assert.equal(summary.totalCost, 1000);
  assert.equal(summary.hasPurchase, false);
  assert.equal(summary.profit, null);
  assert.equal(summary.marginPct, null);
});

test('custos somam em centavos apenas o veículo selecionado, incluindo IDs string', () => {
  const records = [
    { vehicle_id: '7', category: 'compra', amount: 10000.10 },
    { vehicle_id: 7, category: 'mecanica', amount: 0.20 },
    { vehicle_id: 'outro', category: 'compra', amount: 90000 },
    { vehicle_id: 7, category: 'mecanica', amount: 'inválido' },
  ];
  const summary = summarizeVehicleFinancial({ id: 7, price: 12000.30 }, records);
  assert.equal(summary.totalCost, 10000.30);
  assert.equal(summary.acquisition, 10000.10);
  assert.equal(summary.operatingCosts, 0.20);
  assert.equal(summary.profit, 2000);
  assert.equal(summary.expenses.length, 2);
});

test('vendido exige valor efetivo confirmado para rotular resultado realizado', () => {
  const vehicle = { id: 'a', status: 'vendido', price: 30000 };
  const records = [{ vehicle_id: 'a', category: 'compra', amount: 20000 }];
  const estimate = summarizeVehicleFinancial(vehicle, records);
  assert.equal(estimate.hasConfirmedSale, false);
  assert.equal(estimate.profit, 10000);
  const realized = summarizeVehicleFinancial({ ...vehicle, actual_sale_price: 27000 }, records);
  assert.equal(realized.hasConfirmedSale, true);
  assert.equal(realized.profit, 7000);
  assert.equal(summarizeVehicleFinancial({ ...vehicle, status: 'disponivel', actual_sale_price: 27000 }, records).hasConfirmedSale, false);
});

test('lançamento valida valor, veículo, categoria e data sem alterar a entrada', () => {
  const input = { category: 'compra', description: ' Aquisição ', amount: '1234.56', expense_date: '2026-11-10' };
  assert.deepEqual(validateExpense(input, 'carro-1'), { vehicle_id: 'carro-1', category: 'compra', description: 'Aquisição', amount: 1234.56, expense_date: '2026-11-10' });
  assert.equal(input.description, ' Aquisição ');
  for (const amount of [-2, 0, '', 'abc', Infinity]) assert.throws(() => validateExpense({ ...input, amount }, 'a'));
  assert.throws(() => validateExpense(input, ''));
  assert.throws(() => validateExpense({ ...input, category: 'fake' }, 'a'));
  assert.throws(() => validateExpense({ ...input, expense_date: '2026-02-30' }, 'a'));
});

test('gastos persistem por loja, mantêm ID na edição e preservam dados se o storage falhar', t => {
  const previous = { window: globalThis.window, localStorage: globalThis.localStorage, CustomEvent: globalThis.CustomEvent };
  t.after(() => Object.assign(globalThis, previous));
  const values = new Map();
  const events = [];
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  globalThis.window = { dispatchEvent: event => events.push(event.detail) };
  globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
  const [purchase] = storeSync.saveRecord('loja-a', 'expenses', validateExpense({ category: 'compra', description: 'Aquisição', amount: 10000, expense_date: '2026-11-10' }, 'carro-1'));
  assert.equal(events[0].type, 'EXPENSES_UPDATED');
  assert.deepEqual(storeSync.getRecords('loja-b', 'expenses'), []);
  storeSync.saveRecord('loja-a', 'expenses', { ...purchase, amount: 11000 });
  const reread = storeSync.getRecords('loja-a', 'expenses');
  assert.equal(reread.length, 1);
  assert.equal(reread[0].id, purchase.id);
  assert.equal(reread[0].amount, 11000);
  const before = values.get('store_expenses_loja-a');
  const eventCount = events.length;
  localStorage.setItem = () => { throw new Error('Quota'); };
  assert.throws(() => storeSync.deleteRecord('loja-a', 'expenses', purchase.id));
  assert.equal(values.get('store_expenses_loja-a'), before);
  assert.equal(events.length, eventCount);
  localStorage.setItem = (key, value) => values.set(key, value);
  assert.deepEqual(storeSync.deleteRecord('loja-a', 'expenses', purchase.id), []);
});
