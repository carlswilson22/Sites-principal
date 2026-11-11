import test from 'node:test';
import assert from 'node:assert/strict';
import { hasVehicle360, vehicleCardFacts } from '../src/utils/storeExperience.js';
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
