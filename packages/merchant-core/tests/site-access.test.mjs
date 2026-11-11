import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessSitePage, customerPages } from '../src/utils/siteAccess.js';
import { canAccessMerchantRoute, merchantPermissions } from '../src/utils/merchantAccess.js';

test('visitante navega pelo catálogo e precisa entrar para usar ferramentas pessoais', () => {
  for (const page of ['home', 'estoque', 'destaques', 'sobre-contato', 'servicos', 'concierge', 'comparador']) assert.equal(canAccessSitePage(page, null), true);
  for (const page of Object.keys(customerPages)) {
    assert.equal(canAccessSitePage(page, null), false);
    assert.equal(canAccessSitePage(page, { role: 'desconhecido' }), false);
    assert.equal(canAccessSitePage(page, { role: 'cliente' }), true);
  }
});

test('cliente não acessa painel ou módulos internos em nenhuma edição', () => {
  assert.equal(canAccessSitePage('painel-lojista', { role: 'cliente' }), false);
  assert.equal(canAccessSitePage('painel-lojista', null), false);
  for (const role of ['atendente', 'gerente', 'proprietario']) assert.equal(canAccessSitePage('painel-lojista', { role }), true);
  for (const tier of [1, 2, 3]) for (const route of Object.keys(merchantPermissions)) assert.equal(canAccessMerchantRoute(route, tier, 'cliente'), false);
});
