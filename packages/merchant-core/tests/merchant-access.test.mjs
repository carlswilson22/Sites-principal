import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessMerchantRoute } from '../src/utils/merchantAccess.js';

test('financiamento está disponível ao atendente, gerente e proprietário nas três edições', () => {
  for (const tier of [1, 2, 3]) for (const role of ['atendente', 'gerente', 'proprietario']) assert.equal(canAccessMerchantRoute('financing', tier, role), true);
  assert.equal(canAccessMerchantRoute('financing', 0, 'atendente'), false);
  assert.equal(canAccessMerchantRoute('financing', 3, 'desconhecido'), false);
});

test('liberar simulador mantém as restrições financeiras e administrativas', () => {
  for (const tier of [1, 2, 3]) {
    assert.equal(canAccessMerchantRoute('financial', tier, 'atendente'), false);
    assert.equal(canAccessMerchantRoute('financial_full', tier, 'gerente'), false);
    assert.equal(canAccessMerchantRoute('contracts', tier, 'atendente'), false);
  }
  assert.equal(canAccessMerchantRoute('financial_full', 3, 'proprietario'), true);
  assert.equal(canAccessMerchantRoute('financial_full', 2, 'proprietario'), false);
  assert.equal(canAccessMerchantRoute('inexistente', 3, 'proprietario'), false);
});
