import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoAccount, createDemoUser, createDemoCustomer, demoRoles, isDemoMode, readDemoSession, isStaffUser, isStoreUser } from '../src/services/demoConfig.js';

test('Demonstração exige ativação explícita pelo build', () => {
  assert.equal(isDemoMode, false);
});

test('login de cliente não aceita credenciais da equipe e cliente não ganha perfil de funcionário', () => {
  const customer = createDemoCustomer('cliente@demo.invalid', 'Cliente@2026');
  assert.equal(customer.role, 'cliente');
  assert.equal(isStaffUser(customer), false);
  assert.throws(() => createDemoCustomer('proprietario@demo.invalid', 'Demonstracao@2026'));
  assert.throws(() => createDemoUser('cliente@demo.invalid', 'Cliente@2026'));
  assert.throws(() => createDemoCustomer('cliente@demo.invalid', 'errada'));
});

test('sessão demonstrativa exige identidade conhecida, loja correspondente e validade', () => {
  const user = createDemoCustomer('cliente@demo.invalid', 'Cliente@2026');
  const session = { storeKey: 'autoelite', user, expiresAt: 2000 };
  assert.equal(readDemoSession(JSON.stringify(session), 'autoelite', 1000)?.role, 'cliente');
  assert.equal(readDemoSession(JSON.stringify(session), 'drivenow', 1000), null);
  assert.equal(readDemoSession(JSON.stringify(session), 'autoelite', 2000), null);
  assert.equal(readDemoSession('{invalid', 'autoelite', 1000), null);
  assert.equal(readDemoSession(JSON.stringify({ ...session, user: { ...user, role: 'proprietario' } }), 'autoelite', 1000), null);
  assert.equal(readDemoSession(JSON.stringify(user), 'autoelite', 1000), null);
});
test('Acesso demonstrativo aceita apenas as três identidades fictícias conhecidas', () => {
  for (const role of demoRoles) {
    assert.equal(createDemoUser(`${role}@demo.invalid`, 'Demonstracao@2026').role, role);
  }
  for (const [email, password] of [
    ['proprietario@demo.invalid', 'errada'],
    ['proprietario@example.com', 'Demonstracao@2026'],
    ['admin@demo.invalid', 'Demonstracao@2026'],
    ['', ''],
  ]) assert.throws(() => createDemoUser(email, password));
});

test('login único identifica cliente e equipe pelas credenciais, sem selecionar cargo', () => {
  assert.equal(createDemoAccount('cliente@demo.invalid', 'Cliente@2026').role, 'cliente');
  for (const role of demoRoles) {
    assert.equal(createDemoAccount(`${role}@demo.invalid`, 'Demonstracao@2026').role, role);
  }
  for (const [email, password] of [
    ['cliente@demo.invalid', 'Demonstracao@2026'],
    ['atendente@demo.invalid', 'Cliente@2026'],
    ['gerente@outra-loja.invalid', 'Demonstracao@2026'],
    ['admin@demo.invalid', 'Demonstracao@2026'],
    ['', ''],
  ]) assert.throws(() => createDemoAccount(email, password), { message: 'E-mail ou senha inválidos.' });
});

test('perfis válidos da loja mantêm as permissões de cliente e equipe separadas', () => {
  for (const role of ['cliente', ...demoRoles]) assert.equal(isStoreUser({ role }), true);
  for (const role of [undefined, 'visitante', 'admin', 'Cliente']) assert.equal(isStoreUser({ role }), false);
  assert.equal(isStoreUser(null), false);
  assert.equal(isStaffUser(createDemoAccount('cliente@demo.invalid', 'Cliente@2026')), false);
});
