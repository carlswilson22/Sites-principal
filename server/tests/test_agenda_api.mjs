process.env.DATABASE_PATH = ':memory:';
process.env.MERCHANT_TIER = '3';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/app.js';
import { runSeed } from '../src/database/seed.js';
import { setEmailSender } from '../src/services/emailAdapter.js';

test('contato público guarda campanha e pedido; equipe pode salvar e limpar próxima ação', async () => {
  await runSeed(3);
  setEmailSender(async () => ({ sent: true }));
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = (method, route, body, token) => fetch(base + route, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  try {
    const booking = { type: 'visita', starts_at: new Date(Date.now() + 86400000).toISOString() };
    const invalid = await call('POST', '/api/leads', { name: 'Pessoa Exemplo', phone: '61999990000', consent: true, simulation_data: { booking: { type: 'visita', starts_at: 'inválido' } } });
    assert.equal(invalid.status, 400);
    const created = await call('POST', '/api/leads', { name: 'Pessoa Exemplo', phone: '61999990000', consent: true, source: 'site_formulario', marketing_source: 'Instagram', marketing_campaign: 'novembro', simulation_data: { booking } });
    assert.equal(created.status, 201);
    const { id } = await created.json();
    assert.equal((await call('PATCH', `/api/leads/${id}/status`, { next_action: 'Ligar', next_action_at: booking.starts_at })).status, 401);
    const login = await call('POST', '/api/auth/login', { email: 'proprietario@lojaexemplo.com.br', password: 'Admin@123456' });
    const { token } = await login.json();
    assert.ok(token);
    assert.equal((await call('PATCH', `/api/leads/${id}/status`, { next_action: 'Ligar', next_action_at: booking.starts_at }, token)).status, 200);
    const leads = await (await call('GET', '/api/leads', undefined, token)).json();
    const lead = leads.find(item => item.id === id);
    assert.equal(lead.marketing_source, 'Instagram');
    assert.equal(lead.marketing_campaign, 'novembro');
    assert.equal(lead.next_action, 'Ligar');
    assert.deepEqual(JSON.parse(lead.simulation_data).booking, booking);
    assert.equal((await call('PATCH', `/api/leads/${id}/status`, { next_action: '', next_action_at: null }, token)).status, 200);
    assert.equal((await call('PATCH', `/api/leads/${id}/status`, { next_action: 'Ligar' }, token)).status, 400);
  } finally { server.close(); setEmailSender(); }
});
