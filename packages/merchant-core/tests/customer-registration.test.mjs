import test from 'node:test';
import assert from 'node:assert/strict';
import { customerAccountsKey, registerDemoCustomer, loginDemoCustomer } from '../src/services/demoCustomerAccounts.js';
import { readDemoSession, isStaffUser } from '../src/services/demoConfig.js';

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
const details = overrides => ({ name: 'Cliente de teste', email: 'cliente@example.test', password: 'SenhaTeste@2026', confirmPassword: 'SenhaTeste@2026', ...overrides });

test('cadastro normaliza dados, limita o perfil a cliente e não guarda senha aberta', async () => {
  const saved = storage();
  const user = await registerDemoCustomer('autoelite', details({ name: ' Cliente de teste ', email: ' CLIENTE@EXAMPLE.TEST ', role: 'proprietario' }), saved);
  assert.equal(user.name, 'Cliente de teste');
  assert.equal(user.email, 'cliente@example.test');
  assert.equal(user.role, 'cliente');
  assert.equal(isStaffUser(user), false);
  const raw = saved.getItem(customerAccountsKey('autoelite'));
  const [record] = JSON.parse(raw);
  assert.equal(raw.includes('SenhaTeste@2026'), false);
  assert.match(record.passwordHash, /^[a-f0-9]{64}$/);
  assert.equal('passwordHash' in user, false);
  assert.equal('salt' in user, false);
  assert.deepEqual(await loginDemoCustomer('autoelite', ' CLIENTE@EXAMPLE.TEST ', 'SenhaTeste@2026', saved), user);
  await assert.rejects(loginDemoCustomer('autoelite', user.email, 'Senha errada', saved), /inválidos/);
  await assert.rejects(loginDemoCustomer('drivenow', user.email, 'SenhaTeste@2026', saved), /inválidos/);
});

test('cadastro valida nome, e-mail, senha, confirmação e endereços já reservados', async () => {
  const saved = storage();
  for (const values of [
    { name: ' ' }, { name: 'a'.repeat(101) }, { email: 'invalido' },
    { password: 'curta', confirmPassword: 'curta' }, { confirmPassword: 'OutraSenha' },
    ...['cliente', 'atendente', 'gerente', 'proprietario'].map(name => ({ email: `${name}@demo.invalid` })),
  ]) await assert.rejects(registerDemoCustomer('autoelite', details(values), saved));
  assert.equal(saved.getItem(customerAccountsKey('autoelite')), null);
});

test('e-mail duplicado não sobrescreve conta e senhas iguais usam hashes diferentes', async () => {
  const saved = storage();
  await registerDemoCustomer('autoelite', details(), saved);
  const before = saved.getItem(customerAccountsKey('autoelite'));
  await assert.rejects(registerDemoCustomer('autoelite', details({ email: ' CLIENTE@EXAMPLE.TEST ' }), saved), /já possui/);
  assert.equal(saved.getItem(customerAccountsKey('autoelite')), before);
  await registerDemoCustomer('autoelite', details({ email: 'outro@example.test' }), saved);
  const [first, second] = JSON.parse(saved.getItem(customerAccountsKey('autoelite')));
  assert.notEqual(first.passwordHash, second.passwordHash);
  assert.notEqual(first.id, second.id);
});

test('sessão local restaura somente identidade cadastrada da mesma loja, sem promover cargo', async () => {
  const saved = storage();
  const user = await registerDemoCustomer('apexluxury', details(), saved);
  const session = { storeKey: 'apexluxury', user, expiresAt: 5000 };
  const restore = data => readDemoSession(JSON.stringify(data), 'apexluxury', 1000, saved);
  assert.deepEqual(restore(session), user);
  assert.equal(restore({ ...session, user: { ...user, role: 'proprietario' } }), null);
  assert.equal(restore({ ...session, user: { ...user, id: 'local-desconhecido' } }), null);
  assert.equal(readDemoSession(JSON.stringify(session), 'drivenow', 1000, saved), null);
  assert.equal(readDemoSession(JSON.stringify(session), 'apexluxury', 5000, saved), null);
});

test('dados corrompidos e falha de gravação não apagam contas ou produzem cadastro falso', async () => {
  const saved = storage();
  const key = customerAccountsKey('autoelite');
  saved.setItem(key, '{invalid');
  await assert.rejects(registerDemoCustomer('autoelite', details(), saved), /ler as contas/);
  assert.equal(saved.getItem(key), '{invalid');
  const blocked = { getItem: () => null, setItem: () => { throw new Error('quota'); } };
  await assert.rejects(registerDemoCustomer('autoelite', details(), blocked), /salvar sua conta/);
});

test('envios simultâneos com o mesmo e-mail criam apenas uma conta', async () => {
  const saved = storage();
  const results = await Promise.allSettled([
    registerDemoCustomer('autoelite', details(), saved),
    registerDemoCustomer('autoelite', details(), saved),
  ]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(JSON.parse(saved.getItem(customerAccountsKey('autoelite'))).length, 1);
});
