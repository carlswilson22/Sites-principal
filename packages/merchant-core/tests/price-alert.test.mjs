import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePriceAlert } from '../../../sites/popular-dealership/src/utils/priceAlert.js';

test('interesse de preço exige contato válido e valor positivo dentro do anúncio', () => {
  const form = { name: ' Cliente ', phone: '(61) 90000-0000', targetPrice: 73625.50 };
  assert.deepEqual(validatePriceAlert(form, 77500), { name: 'Cliente', phone: '(61) 90000-0000', targetPrice: 73625.50 });
  for (const targetPrice of [0, -1, NaN, Infinity, 80000]) assert.throws(() => validatePriceAlert({ ...form, targetPrice }, 77500));
  assert.throws(() => validatePriceAlert({ ...form, name: ' ' }, 77500));
  assert.throws(() => validatePriceAlert({ ...form, phone: '123' }, 77500));
});
