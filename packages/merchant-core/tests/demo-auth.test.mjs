import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoUser, demoRoles, isDemoMode } from '../src/services/demoConfig.js';

test('Demonstração exige ativação explícita pelo build', () => {
  assert.equal(isDemoMode, false);
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
