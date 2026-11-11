import test from 'node:test';
import assert from 'node:assert/strict';
import { hasVehicle360, selectHomeVehicles, vehicleCardFacts } from '../src/utils/storeExperience.js';
import { dealershipInfo as auto } from '../../../sites/auto-dealership/src/data/dealershipInfo.js';
import { dealershipInfo as luxury } from '../../../sites/luxury-dealership/src/data/dealershipInfo.js';
import { dealershipInfo as popular } from '../../../sites/popular-dealership/src/data/dealershipInfo.js';

test('360 é incluído somente no modelo 3 e permite configuração por loja', () => {
  assert.equal(hasVehicle360(auto), false);
  assert.equal(hasVehicle360(luxury), false);
  assert.equal(hasVehicle360(popular), true);
  assert.equal(hasVehicle360({}), false);
  assert.equal(hasVehicle360({ ...auto, features: { vehicle360: true } }), true);
});

test('cards apresentam três informações sem transmissão abreviada nem garantias inventadas', () => {
  const facts = vehicleCardFacts({ cambio: 'Automático 6m', combustivel: 'Flex', motor: '1.0 Turbo', potencia: '120 cv' });
  assert.deepEqual(facts.map(item => item.value), ['Flex', '1.0 Turbo', '120 cv']);
  assert.deepEqual(vehicleCardFacts({}).map(item => item.value), Array(3).fill('Não informado'));
});

test('seleção inicial completa seis veículos sem depender da quantidade de destaques', () => {
  const vehicles = Array.from({ length: 8 }, (_, index) => ({ id: index + 1, destaque: index === 2 || index === 4 }));
  const original = structuredClone(vehicles);
  assert.deepEqual(selectHomeVehicles(vehicles).map(vehicle => vehicle.id), [3, 5, 1, 2, 4, 6]);
  assert.deepEqual(selectHomeVehicles(vehicles.map(vehicle => ({ ...vehicle, destaque: false }))).map(vehicle => vehicle.id), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(vehicles, original);
});

test('seleção inicial omite vendidos e ocultos e respeita estoques menores', () => {
  const vehicles = [{ id: 1, destaque: true, status: 'vendido' }, { id: 2, destaque: true, is_published: 0 }, { id: 3 }, { id: 4, destaque: true }, { id: 5, is_published: '0' }];
  assert.deepEqual(selectHomeVehicles(vehicles).map(vehicle => vehicle.id), [4, 3]);
  assert.deepEqual(selectHomeVehicles(), []);
});
