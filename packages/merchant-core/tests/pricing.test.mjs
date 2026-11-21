import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePricing } from '../src/utils/pricing.js';

test('proposta usa a referência, os custos e inclusive margem zero', () => {
  assert.deepEqual(calculatePricing({ fipePrice: 100000, prepCost: 2000, targetMarginPct: 0 }), {
    fipePrice: 100000, prepCost: 2000, targetMarginPct: 0, maxPurchasePrice: 98000,
    suggestedSalePrice: 100000, expectedProfit: 0, purchaseToFipePct: 98,
  });
  assert.equal(calculatePricing({ fipePrice: 100000, prepCost: 2000, targetMarginPct: 10 }).maxPurchasePrice, 88000);
});

test('proposta rejeita valores e percentuais inválidos', () => {
  for (const input of [
    { fipePrice: 0 }, { fipePrice: -1 }, { fipePrice: 100, prepCost: -1 },
    { fipePrice: 100, targetMarginPct: 101 }, { fipePrice: 100, targetMarginPct: NaN },
  ]) assert.throws(() => calculatePricing(input));
});
