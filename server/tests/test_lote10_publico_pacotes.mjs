/**
 * server/tests/test_lote10_publico_pacotes.mjs
 * A API pública só entrega o que o pacote da loja inclui: dossiê, quadros do 360° e custos do TCO.
 */
process.env.DATABASE_PATH = ':memory:';
process.env.MERCHANT_TIER = '3';
process.env.ADMIN_API_KEY = 'chave-do-fornecedor-1234567890';

import test, { before, after } from 'node:test';
import assert from 'node:assert';
import { createServer } from '../src/app.js';
import { runSeed } from '../src/database/seed.js';
import { getDb } from '../src/database/db.js';
import { loadConfig } from '../src/config.js';

let server, base, owner, car;
const settings = { ...loadConfig({}), corsOrigins: [], isProduction: false, trustProxy: false };

before(async () => {
  await runSeed(3);
  server = createServer(settings);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  const res = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'proprietario@lojaexemplo.com.br', password: 'Admin@123456' }) });
  owner = { Authorization: `Bearer ${(await res.json()).token}`, 'Content-Type': 'application/json' };
  const created = await (await fetch(`${base}/api/vehicles`, { method: 'POST', headers: owner, body: JSON.stringify({ title: 'Carro Premium', year: '2022', price: 90000, dossier: { leilao: false, sinistros: [], proprietarios: 1 } }) })).json();
  car = created;
  getDb().prepare('INSERT INTO vehicle_costs (vehicle_id, city_consumption, road_consumption, tank_capacity, avg_maintenance, annual_insurance) VALUES (?, 11, 14, 50, 700, 2500)').run(car.id);
  // Um quadro de 360° (PNG mínimo válido)
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64').toString('base64');
  await fetch(`${base}/api/vehicles/${car.id}/media`, { method: 'POST', headers: owner, body: JSON.stringify({ kind: 'frame360', data: png }) });
});
after(() => { server.close(); process.env.MERCHANT_TIER = '3'; });

const detail = async headers => (await fetch(`${base}/api/vehicles/${car.slug}`, { headers })).json();

test('Premium entrega dossiê, quadros 360° e custos para o site público', async () => {
  const data = await detail();
  assert.strictEqual(data.dossier.proprietarios, 1);
  assert.strictEqual(data.dossier.source, 'informado_pela_loja');
  assert.strictEqual(data.frames360.length, 1);
  assert.strictEqual(data.costs.annual_insurance, 2500);
});

test('Expert não entrega dossiê, 360° nem custos, mesmo gravados; a equipe continua vendo tudo', async () => {
  process.env.MERCHANT_TIER = '2';
  try {
    const data = await detail();
    assert.ok(!('dossier' in data) || data.dossier == null, 'dossiê fora do pacote');
    assert.deepStrictEqual(data.frames360, []);
    assert.ok(!('costs' in data));
    const list = await (await fetch(`${base}/api/vehicles`)).json();
    assert.ok(list.every(item => !item.dossier), 'listagem pública também não vaza o dossiê');

    const staff = await detail(owner);
    assert.strictEqual(staff.dossier.proprietarios, 1, 'equipe vê o dossiê');
    assert.strictEqual(staff.frames360.length, 1);
  } finally { process.env.MERCHANT_TIER = '3'; }
});

test('Módulo avulso libera o recurso em pacote menor', async () => {
  process.env.MERCHANT_TIER = '2';
  try {
    const set = await fetch(`${base}/api/settings`, { method: 'PUT', headers: { ...owner, 'X-Admin-Key': process.env.ADMIN_API_KEY }, body: JSON.stringify({ addons: ['tco'] }) });
    assert.strictEqual(set.status, 200);
    const data = await detail();
    assert.strictEqual(data.costs.annual_insurance, 2500, 'TCO contratado como avulso');
    assert.ok(!data.dossier, 'dossiê continua fora');
  } finally {
    await fetch(`${base}/api/settings`, { method: 'PUT', headers: { ...owner, 'X-Admin-Key': process.env.ADMIN_API_KEY }, body: JSON.stringify({ addons: [] }) });
    process.env.MERCHANT_TIER = '3';
  }
});
