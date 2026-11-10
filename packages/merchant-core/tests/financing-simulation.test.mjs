import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMonthlyPayment, clampDownPayment, financingPriceBounds, validVehiclePrice } from '../src/utils/financingSimulation.js';

test('entrada continua dentro dos limites ao aumentar ou reduzir o preço', () => {
  assert.equal(clampDownPayment(30000, 200000, 0.2), 40000);
  assert.equal(clampDownPayment(80000, 50000, 0.2), 40000);
  assert.equal(clampDownPayment(80000, 50000), 40000);
  assert.equal(clampDownPayment(-100, 50000), 0);
  assert.equal(clampDownPayment(NaN, 50000, 0.2), 10000);
});

test('preços do catálogo ficam dentro do slider, incluindo veículos abaixo de 500 mil', () => {
  const vehicles = [{ id: 'car-a', preco: 79990.55 }, { id: 'car-b', preco: 135000 }];
  const bounds = financingPriceBounds(vehicles, vehicles[0], 2500000);
  assert(bounds.minimum <= vehicles[0].preco);
  assert(bounds.maximum >= vehicles[1].preco);
  assert(bounds.maximum < 500000);
  const expensive = { id: 'car-c', preco: 6300000 };
  assert(financingPriceBounds(vehicles, expensive).maximum >= expensive.preco);
  assert(financingPriceBounds([], null, 2500000).maximum >= 2500000);
});

test('parcelas respeitam a tabela Price e valores inválidos não produzem NaN', () => {
  assert.equal(calculateMonthlyPayment(10000, 0, 10), 1000);
  assert.equal(calculateMonthlyPayment(70000, 0.0125, 48), 1948.15);
  for (const args of [[0, 0.0125, 48], [Infinity, 0.0125, 48], [10000, 0.0125, 0], [10000, NaN, 48], [10000, -0.1, 48]]) {
    assert.equal(calculateMonthlyPayment(...args), 0);
  }
  for (const preco of [undefined, NaN, Infinity, -1, 0, 1e300]) assert.equal(validVehiclePrice({ preco }, 95000), 95000);
  assert.equal(validVehiclePrice({ preco: '79990.55' }), 79990.55);
});
