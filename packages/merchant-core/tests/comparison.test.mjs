import test from 'node:test';
import assert from 'node:assert/strict';
import { comparisonNumber, comparisonSelection, comparisonSummary, vehicleModelYear } from '../../../sites/popular-dealership/src/utils/comparison.js';

test('seleção de comparação mantém no máximo três anúncios disponíveis sem IDs duplicados', () => {
  const cars = [{ id: 1 }, { id: '2' }, { id: 3, status: 'vendido' }, { id: 4, is_published: false }, { id: 5 }, { id: 6 }];
  assert.deepEqual(comparisonSelection([2, '2', 99, 3, 4, 1, 5, 6], cars), ['2', '1', '5']);
  assert.deepEqual(comparisonSelection([99, null, ''], cars), []);
});

test('resumo compara os preços, a quilometragem e o ano modelo corretos', () => {
  const cars = [{ id: 1, preco: 185000, km: 12000, ano: '2023/2024' }, { id: 2, preco: 105000, km: 5000, ano: '2022/2023' }];
  const result = comparisonSummary(cars);
  assert.equal(result.price.vehicles[0].id, 2);
  assert.equal(result.mileage.value, 5000);
  assert.equal(result.year.vehicles[0].id, 1);
  assert.equal(result.year.value, 2024);
  assert.equal(result.priceRange, 80000);
});

test('resumo reconhece empates e quilometragem zero sem recomendar um vencedor inventado', () => {
  const cars = [{ id: 1, preco: 100000, km: 0, ano: 2024 }, { id: 2, preco: 100000, km: 0, ano: 2024 }];
  const result = comparisonSummary(cars);
  assert.equal(result.price.tied, true);
  assert.equal(result.price.vehicles.length, 2);
  assert.equal(result.mileage.value, 0);
  assert.equal(result.mileage.tied, true);
  assert.equal(result.priceRange, 0);
});

test('dados ausentes ou inválidos não viram preço zero, baixa quilometragem ou ano recente', () => {
  const result = comparisonSummary([{ id: 1, preco: 100000, km: 1000, ano: '2024' }, { id: 2 }]);
  assert.equal(result.price, null);
  assert.equal(result.mileage, null);
  assert.equal(result.year, null);
  assert.equal(result.priceRange, null);
  for (const invalid of [null, undefined, '', ' ', [], {}, true, Infinity, -1]) assert.equal(comparisonNumber(invalid, true), null);
  assert.equal(comparisonNumber(0), null);
  assert.equal(comparisonNumber('0', true), 0);
  assert.equal(vehicleModelYear({ ano: 'Não informado' }), null);
  assert.equal(vehicleModelYear({ year: '2020/2021' }), 2021);
  assert.equal(comparisonSummary([{ preco: 100000, km: 1000, ano: '2024' }]).price, null);
});
