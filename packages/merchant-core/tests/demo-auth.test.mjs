import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoUser, createDemoCustomer, demoRoles, isDemoMode, readDemoSession, isStaffUser } from '../src/services/demoConfig.js';

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
