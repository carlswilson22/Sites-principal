import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSelectionIds, selectedVehicles } from '../../../sites/popular-dealership/src/utils/vehicleSelection.js';

test('seleções ignoram dados inválidos e unificam IDs numéricos duplicados', () => {
  assert.deepEqual(normalizeSelectionIds({ invalid: true }, [1, 2]), ['1', '2']);
  assert.deepEqual(normalizeSelectionIds([1, '1', null, {}, [], '', ' ', 2, Infinity, NaN]), ['1', '2']);
  assert.deepEqual(normalizeSelectionIds([]), []);
});

test('favoritos e comparação contam somente veículos disponíveis no catálogo atual', () => {
  const vehicles = [{ id: 1 }, { id: '2' }, { id: 3 }];
  assert.deepEqual(selectedVehicles(['1', 2, 2, 99], vehicles), vehicles.slice(0, 2));
  assert.deepEqual(selectedVehicles(['1', 2], vehicles.slice(1)), [vehicles[1]]);
});
