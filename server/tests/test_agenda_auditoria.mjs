process.env.DATABASE_PATH = ':memory:';
process.env.MERCHANT_TIER = '1';

import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/app.js';
import { runSeed } from '../src/database/seed.js';
import { loadConfig } from '../src/config.js';

let server, base, owner, manager, attendant;
const request = (method, path, body, headers = {}) => fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
async function login(email) {
  const response = await request('POST', '/api/auth/login', { email, password: 'Admin@123456' });
  return { Authorization: `Bearer ${(await response.json()).token}` };
}
before(async () => {
  await runSeed(1);
  server = createServer({ ...loadConfig({}), corsOrigins: [], isProduction: false, trustProxy: false });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  owner = await login('proprietario@lojaexemplo.com.br');
  manager = await login('gerente@lojaexemplo.com.br');
  attendant = await login('atendente@lojaexemplo.com.br');
});
after(() => server.close());

test('equipe organiza lembretes; visitante não acessa e dados inválidos são rejeitados', async () => {
  assert.equal((await request('GET', '/api/reminders')).status, 401);
  assert.equal((await request('POST', '/api/reminders', { title: '', due_at: 'inválida', completed: false }, attendant)).status, 400);
  const created = await request('POST', '/api/reminders', { title: 'Revisar documentação', due_at: '2027-04-12T13:00:00.000Z', completed: false }, attendant);
  assert.equal(created.status, 201);
  const item = await created.json();
  const updated = await request('PUT', `/api/reminders/${item.id}`, { title: 'Confirmar documentação', due_at: item.due_at, completed: true }, manager);
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).completed, 1);
  assert.equal((await (await request('GET', '/api/reminders', undefined, owner)).json())[0].title, 'Confirmar documentação');
  assert.equal((await request('DELETE', `/api/reminders/${item.id}`, undefined, attendant)).status, 200);
  assert.equal((await request('DELETE', `/api/reminders/${item.id}`, undefined, attendant)).status, 404);
});

test('auditoria e LGPD funcionam nos três modelos somente para o proprietário', async () => {
  for (const tier of ['1', '2', '3']) {
    process.env.MERCHANT_TIER = tier;
    assert.equal((await request('GET', '/api/tier3/audit', undefined, owner)).status, 200);
    assert.equal((await request('GET', '/api/tier3/lgpd/export/1', undefined, owner)).status, 200);
    assert.equal((await request('GET', '/api/tier3/audit', undefined, manager)).status, 403);
    assert.equal((await request('GET', '/api/tier3/lgpd/export/1', undefined, attendant)).status, 403);
  }
  process.env.MERCHANT_TIER = '1';
});
