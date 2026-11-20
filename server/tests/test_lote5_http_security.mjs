/**
 * server/tests/test_lote5_http_security.mjs
 * Testes de segurança pela camada HTTP real (M1 da arquitetura).
 */
process.env.DATABASE_PATH = ':memory:';
process.env.MERCHANT_TIER = '3';

import test, { before, after } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import { createServer } from '../src/app.js';
import { runSeed } from '../src/database/seed.js';
import { getDb } from '../src/database/db.js';
import { loadConfig, assertProductionReady } from '../src/config.js';

let server, base;
const settings = { ...loadConfig({}), corsOrigins: ['https://loja.exemplo.com.br'], maxBodyBytes: 2000, isProduction: false, trustProxy: false };

before(async () => {
  await runSeed(3);
  server = createServer(settings);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const call = (path, options = {}) => fetch(base + path, options);
const json = (method, path, body, headers = {}) => call(path, { method, headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

async function login(email) {
  const res = await json('POST', '/api/auth/login', { email, password: 'Admin@123456' });
  assert.strictEqual(res.status, 200);
  return (await res.json()).token;
}

test('CORS: só reflete origens da lista', async () => {
  const ok = await call('/api/health', { headers: { Origin: 'https://loja.exemplo.com.br' } });
  assert.strictEqual(ok.headers.get('access-control-allow-origin'), 'https://loja.exemplo.com.br');
  const bad = await call('/api/health', { headers: { Origin: 'https://malicioso.example' } });
  assert.strictEqual(bad.headers.get('access-control-allow-origin'), null);
  assert.strictEqual(ok.headers.get('x-content-type-options'), 'nosniff');
});

test('Corpo grande demais é recusado com 413', async () => {
  const res = await json('POST', '/api/leads', { name: 'x'.repeat(5000) });
  assert.strictEqual(res.status, 413);
});

test('Token de sessão não é guardado em texto aberto', async () => {
  const token = await login('gerente@lojaexemplo.com.br');
  const rows = getDb().prepare('SELECT id, token_hash FROM sessions').all();
  assert.ok(rows.length > 0);
  assert.ok(rows.every(row => row.id !== token && row.token_hash !== token), 'o banco não pode conter o token puro');
  const me = await call('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  assert.strictEqual(me.status, 200);
});

test('Sessão expirada é recusada e logout revoga o acesso', async () => {
  const token = await login('atendente@lojaexemplo.com.br');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  getDb().prepare('UPDATE sessions SET expires_at = ? WHERE token_hash = ?').run(new Date(Date.now() - 1000).toISOString(), hash);
  assert.strictEqual((await call('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })).status, 401);

  const fresh = await login('atendente@lojaexemplo.com.br');
  await json('POST', '/api/auth/logout', {}, { Authorization: `Bearer ${fresh}` });
  assert.strictEqual((await call('/api/auth/me', { headers: { Authorization: `Bearer ${fresh}` } })).status, 401);
});

test('Cookie de sessão: HttpOnly e SameSite; Secure apenas em produção', async () => {
  const dev = await json('POST', '/api/auth/login', { email: 'proprietario@lojaexemplo.com.br', password: 'Admin@123456' });
  const cookie = dev.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.doesNotMatch(cookie, /Secure/);

  const prod = createServer({ ...settings, isProduction: true, corsOrigins: ['https://loja.exemplo.com.br'] });
  await new Promise(resolve => prod.listen(0, '127.0.0.1', resolve));
  const res = await fetch(`http://127.0.0.1:${prod.address().port}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'proprietario@lojaexemplo.com.br', password: 'Admin@123456' })
  });
  assert.match(res.headers.get('set-cookie'), /Secure/);
  assert.ok(res.headers.get('strict-transport-security'));
  prod.close();
});

test('Rotas sensíveis exigem login', async () => {
  for (const path of ['/api/fipe/lookup?brand=a&model=b', '/api/vehicles/1/costs', '/api/tier3/instagram/status', '/api/clients', '/api/leads']) {
    assert.strictEqual((await call(path)).status, 401, `${path} deveria exigir login`);
  }
});

test('Exportação LGPD de titular é exclusiva do proprietário', async () => {
  const atendente = await login('atendente@lojaexemplo.com.br');
  assert.strictEqual((await call('/api/tier3/lgpd/export/1', { headers: { Authorization: `Bearer ${atendente}` } })).status, 403);
  const owner = await login('proprietario@lojaexemplo.com.br');
  assert.strictEqual((await call('/api/tier3/lgpd/export/1', { headers: { Authorization: `Bearer ${owner}` } })).status, 200);
});

test('Lead público: valida dados, exige consentimento e limita envios', async () => {
  const valid = { name: 'Ana Souza', phone: '(61) 99999-0000', source: 'site_formulario', consent: true };
  assert.strictEqual((await json('POST', '/api/leads', { ...valid, consent: false })).status, 400);
  assert.strictEqual((await json('POST', '/api/leads', { ...valid, phone: '123' })).status, 400);
  assert.strictEqual((await json('POST', '/api/leads', { ...valid, source: 'inventada' })).status, 400);
  assert.strictEqual((await json('POST', '/api/leads', { ...valid, vehicle_id: 99999 })).status, 400);
  assert.strictEqual((await json('POST', '/api/leads', valid)).status, 201);

  let blocked = false;
  for (let i = 0; i < 12 && !blocked; i++) blocked = (await json('POST', '/api/leads', valid)).status === 429;
  assert.ok(blocked, 'o envio em excesso deve ser limitado');
});

test('X-Forwarded-For só vale com TRUST_PROXY', async () => {
  // Sem proxy confiável, trocar o cabeçalho não escapa do limite de login.
  let blocked = false;
  for (let i = 0; i < 8 && !blocked; i++) {
    const res = await json('POST', '/api/auth/login', { email: 'x@y.com', password: 'errada' }, { 'X-Forwarded-For': `10.0.0.${i}` });
    blocked = res.status === 429;
  }
  assert.ok(blocked, 'o limite não pode ser burlado por cabeçalho forjado');
});

test('Produção recusa iniciar sem chave, origens e dados da loja', () => {
  assert.throws(() => assertProductionReady({ NODE_ENV: 'production' }), /DATA_ENCRYPTION_KEY/);
  const key = 'a'.repeat(64);
  assert.throws(() => assertProductionReady({ NODE_ENV: 'production', DATA_ENCRYPTION_KEY: key }), /CORS_ORIGINS/);
  assert.throws(() => assertProductionReady({ NODE_ENV: 'production', DATA_ENCRYPTION_KEY: key, CORS_ORIGINS: 'https://a.com' }), /STORE_NAME/);
  assert.doesNotThrow(() => assertProductionReady({ NODE_ENV: 'production', DATA_ENCRYPTION_KEY: key, CORS_ORIGINS: 'https://a.com', STORE_NAME: 'Loja', STORE_CNPJ: '1' }));
  assert.doesNotThrow(() => assertProductionReady({}));
});

test('Seed de demonstração não roda em produção, salvo SEED_DEMO=true', () => {
  assert.strictEqual(loadConfig({ NODE_ENV: 'production' }).seedDemo, false);
  assert.strictEqual(loadConfig({ NODE_ENV: 'production', SEED_DEMO: 'true' }).seedDemo, true);
  assert.strictEqual(loadConfig({}).seedDemo, true);
});

test('Sem dados reais, funil e métricas respondem "sem dados" (nada inventado)', async () => {
  const owner = await login('proprietario@lojaexemplo.com.br');
  const headers = { Authorization: `Bearer ${owner}` };
  const analytics = await (await call('/api/dashboard/analytics', { headers })).json();
  assert.strictEqual(analytics.hasData, false);
  assert.strictEqual(analytics.metrics.pageViews.current, 0);
  const funnel = await (await call('/api/tier3/funnel', { headers })).json();
  assert.ok(funnel.funnelSteps.every(step => !['Visitas ao Site', 'Veículos Visualizados'].includes(step.step)));
  const financial = await (await call('/api/tier3/financial/full', { headers })).json();
  assert.strictEqual(financial.bankReport.financialHealthIndex, undefined);
  assert.notStrictEqual(financial.bankReport.last12MonthsGrossRevenue, 580000);
});

test('Descrição por IA sem chave não afirma perícia, laudo nem crédito', async () => {
  const { generateVehicleDescription } = await import('../src/services/aiDescriptionAdapter.js');
  const text = await generateVehicleDescription({ title: 'Carro Teste', year: '2022', km: 30000, fuel: 'Flex' });
  assert.doesNotMatch(text.toLowerCase(), /pericia|perícia|laudo|pré-aprova|pre-aprova|garantia|procedência|aprovad/);
  assert.match(text, /30\.000 km/);
});

test('FIPE sem correspondência não inventa valor', async () => {
  const { lookupFipe } = await import('../src/services/fipeAdapter.js');
  const result = await lookupFipe({ brand: 'marca-que-nao-existe', model: 'x', year: '2000' });
  assert.strictEqual(result.fipePrice, null);
  assert.strictEqual(result.isManualFallback, true);
});
