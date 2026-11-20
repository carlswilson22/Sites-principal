/**
 * server/tests/test_lote7_premium.mjs
 * Revisão dos módulos do Premium: consignação, contratos avançados, financeiro, funil, LGPD, exportação.
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
import { encryptSensitive } from '../src/security/crypto.js';

let server, base, owner, manager, attendant;
const settings = { ...loadConfig({}), corsOrigins: [], isProduction: false, trustProxy: false };

before(async () => {
  await runSeed(3);
  server = createServer(settings);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  owner = await login('proprietario@lojaexemplo.com.br');
  manager = await login('gerente@lojaexemplo.com.br');
  attendant = await login('atendente@lojaexemplo.com.br');
});
after(() => server.close());

const call = (method, route, body, headers = {}) => fetch(base + route, {
  method, headers: { 'Content-Type': 'application/json', ...headers }, body: body === undefined ? undefined : JSON.stringify(body)
});
async function login(email) {
  const res = await call('POST', '/api/auth/login', { email, password: 'Admin@123456' });
  return { Authorization: `Bearer ${(await res.json()).token}` };
}
const newVehicle = async (extra = {}) => {
  const res = await call('POST', '/api/vehicles', { title: 'Carro Teste', year: '2021', price: 50000, ...extra }, owner);
  return (await res.json()).id;
};

const CPF = '529.982.247-25';
const consignment = (vehicle_id, extra = {}) => ({
  vehicle_id, owner_name: 'Maria Proprietária', owner_cpf: CPF, remuneration_type: 'percentual', remuneration_value: 6, ...extra
});

test('Consignação: validação, dados protegidos e encerramento', async () => {
  const id = await newVehicle();
  assert.strictEqual((await call('POST', '/api/tier3/consignments', consignment(id, { owner_cpf: '111.111.111-11' }), manager)).status, 400, 'CPF inválido');
  assert.strictEqual((await call('POST', '/api/tier3/consignments', consignment(id, { remuneration_value: 150 }), manager)).status, 400, 'percentual acima de 100');
  assert.strictEqual((await call('POST', '/api/tier3/consignments', consignment(id, { daily_storage_fee: -5 }), manager)).status, 400, 'valor negativo');
  assert.strictEqual((await call('POST', '/api/tier3/consignments', consignment(id, { contract_start: '2026-05-10', contract_end: '2026-05-01' }), manager)).status, 400, 'fim antes do início');
  assert.strictEqual((await call('POST', '/api/tier3/consignments', consignment(999999), manager)).status, 404, 'veículo inexistente');
  assert.strictEqual((await call('POST', '/api/tier3/consignments', consignment(id), attendant)).status, 403, 'atendente não cadastra');

  assert.strictEqual((await call('POST', '/api/tier3/consignments', consignment(String(id), { remuneration_value: '6', min_remuneration: '' }), manager)).status, 201, 'aceita o que o formulário envia (texto)');
  const list = await (await call('GET', '/api/tier3/consignments', undefined, manager)).json();
  const row = list.find(item => item.vehicle_id === id);
  assert.ok(row && row.owner_cpf_masked.includes('*'));
  assert.ok(!('owner_cpf_encrypted' in row) && !('owner_bank_data_encrypted' in row), 'dado criptografado não sai pela API');
  assert.strictEqual(row.settlementBasis, 'preco_anunciado_projecao');

  assert.strictEqual((await call('POST', '/api/tier3/consignments/status', { vehicle_id: id, status: 'liquidado' }, manager)).status, 200);
  assert.strictEqual((await call('POST', '/api/tier3/consignments/status', { vehicle_id: id, status: 'xyz' }, manager)).status, 400);
});

test('Venda grava preço e data; financeiro usa o valor vendido, sem inventar margem', async () => {
  const id = await newVehicle({ price: 60000 });
  await call('POST', '/api/financial/expenses', { vehicle_id: id, category: 'compra', description: 'Compra', amount: 50000 }, owner);
  assert.strictEqual((await call('POST', '/api/financial/expenses', { vehicle_id: id, category: 'inventada', amount: 10 }, owner)).status, 400);
  assert.strictEqual((await call('POST', '/api/financial/expenses', { vehicle_id: id, category: 'outros', amount: -10 }, owner)).status, 400);
  assert.strictEqual((await call('PUT', `/api/vehicles/${id}`, { status: 'vendido', sale_price: 0 }, owner)).status, 400);
  assert.strictEqual((await call('PUT', `/api/vehicles/${id}`, { status: 'vendido', sale_price: 55000 }, owner)).status, 200);

  const db = getDb();
  const row = db.prepare('SELECT sale_price, sold_at FROM vehicles WHERE id = ?').get(id);
  assert.strictEqual(row.sale_price, 55000);
  assert.ok(row.sold_at);

  const full = await (await call('GET', '/api/tier3/financial/full', undefined, owner)).json();
  assert.strictEqual(full.period, 'ultimos_12_meses');
  assert.strictEqual(full.commissionConfigured, false);
  assert.ok(full.sellersCommissions.every(seller => seller.commissionAmount === null), 'sem percentual configurado não há comissão');
  assert.ok(full.warnings.some(text => text.includes('comissão')));
  assert.ok(full.salesMetrics.totalSalesRevenue >= 55000);

  // Venda com prejuízo aparece como prejuízo
  const loss = await newVehicle({ price: 40000 });
  await call('POST', '/api/financial/expenses', { vehicle_id: loss, category: 'compra', description: 'Compra', amount: 45000 }, owner);
  const before = (await (await call('GET', '/api/tier3/financial/full', undefined, owner)).json()).salesMetrics.totalRealizedProfit;
  await call('PUT', `/api/vehicles/${loss}`, { status: 'vendido', sale_price: 40000 }, owner);
  const after = (await (await call('GET', '/api/tier3/financial/full', undefined, owner)).json()).salesMetrics.totalRealizedProfit;
  assert.strictEqual(Math.round(after - before), -5000, 'prejuízo de R$ 5.000 não pode virar zero');

  // O percentual de comissão é decisão da loja
  assert.strictEqual((await call('PUT', '/api/settings', { commission: { ratePercent: 150 } }, owner)).status, 400);
  assert.strictEqual((await call('PUT', '/api/settings', { commission: { ratePercent: 1.5 } }, owner)).status, 200);
  assert.strictEqual((await (await call('GET', '/api/tier3/financial/full', undefined, owner)).json()).commissionRatePercent, 1.5);
  assert.ok(!JSON.stringify(await (await call('GET', '/api/settings/public')).json()).includes('ratePercent'), 'comissão não é pública');
});

test('Contratos avançados: dados reais da loja, validações e aditivo vinculado', async () => {
  const db = getDb();
  const client = db.prepare('SELECT id FROM clients LIMIT 1').get();
  const vehicle = db.prepare('SELECT id FROM vehicles LIMIT 1').get();
  const base0 = { vehicle_id: vehicle.id, client_id: client.id };

  assert.strictEqual((await call('POST', '/api/tier3/contracts/advanced', { ...base0, type: 'qualquer' }, manager)).status, 400);
  assert.strictEqual((await call('POST', '/api/tier3/contracts/advanced', { ...base0, type: 'consignacao' }, manager)).status, 409, 'sem CNPJ cadastrado não emite');

  await call('PUT', '/api/settings', { store: { name: 'Loja Teste Ltda', cnpj: '11.222.333/0001-81', address: 'Rua A, 10 - Brasília/DF' } }, owner);
  const res = await call('POST', '/api/tier3/contracts/advanced', { ...base0, type: 'consignacao', terms: { remunerationType: 'percentual', remunerationValue: 5 } }, manager);
  assert.strictEqual(res.status, 201);
  const first = await res.json();
  assert.ok(first.html.includes('11.222.333/0001-81') && first.html.includes('Loja Teste Ltda'));
  assert.ok(!first.html.includes('00.123.456') && !first.html.includes('Auto-Dealership'), 'sem dados fictícios');

  assert.strictEqual((await call('POST', '/api/tier3/contracts/advanced', { ...base0, type: 'termo_aditivo' }, manager)).status, 400, 'aditivo exige contrato original');
  assert.strictEqual((await call('POST', '/api/tier3/contracts/advanced', { ...base0, type: 'termo_aditivo', parent_contract_id: first.id }, manager)).status, 400, 'aditivo exige a alteração');
  const addendum = await call('POST', '/api/tier3/contracts/advanced', { ...base0, type: 'termo_aditivo', parent_contract_id: first.id, terms: { amendmentReason: 'Prorrogação por 30 dias.' } }, manager);
  assert.strictEqual(addendum.status, 201);
  const second = await addendum.json();
  assert.notStrictEqual(second.code, first.code);
  assert.ok(second.html.includes(first.code));

  const injected = await (await call('POST', '/api/tier3/contracts/advanced', { ...base0, type: 'termo_aditivo', parent_contract_id: first.id, terms: { amendmentReason: '<script>alert(1)</script>' } }, manager)).json();
  assert.ok(!injected.html.includes('<script>alert'), 'texto do usuário é escapado');
});

test('Mercado, funil e exportação', async () => {
  assert.strictEqual((await call('POST', '/api/tier3/market-pricing', { fipePrice: -1 }, manager)).status, 400);
  assert.strictEqual((await call('POST', '/api/tier3/market-pricing', { fipePrice: 80000 }, manager)).status, 200);

  const old = await newVehicle({ price: 30000, days_in_stock: 95 });
  const funnel = await (await call('GET', '/api/tier3/funnel', undefined, manager)).json();
  const found = funnel.staleVehiclesAlert.vehicles.find(vehicle => vehicle.id === old);
  assert.ok(found && found.suggestedDiscountPercent === 7 && found.suggestedNewPrice === 27900);
  assert.ok(funnel.staleVehiclesAlert.rule.includes('regra fixa'));

  const exported = await (await call('GET', '/api/tier3/portals/export', undefined, manager)).json();
  assert.deepStrictEqual(exported.manifest.availablePortals, [], 'sem prometer adaptadores de portais');
  assert.ok(!JSON.stringify(exported).includes('adaptador_pronto'));
  const csv = await call('GET', '/api/tier3/portals/export?format=csv', undefined, manager);
  assert.ok((await csv.text()).startsWith('ID;Titulo'));
  assert.strictEqual((await call('GET', '/api/tier3/portals/export', undefined, attendant)).status, 403);
});

test('Instagram: não registra publicação sem veículo válido e nunca simula sucesso', async () => {
  assert.strictEqual((await call('POST', '/api/tier3/instagram/queue', { vehicle_id: 999999, imageUrl: 'https://x.exemplo.com/a.png' }, manager)).status, 400);
  assert.strictEqual((await call('POST', '/api/tier3/instagram/queue', { vehicle_id: 1, imageUrl: 'http://x/a.png' }, manager)).status, 400);
  const res = await (await call('POST', '/api/tier3/instagram/queue', { vehicle_id: 1, imageUrl: 'https://x.exemplo.com/a.png' }, manager)).json();
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.status, 'nao_configurado');
});

test('LGPD: exportação e anonimização cobrem contatos, conta no site e pedidos de troca', async () => {
  const db = getDb();
  db.prepare("INSERT INTO clients (name, cpf_encrypted, phone, email, address_encrypted, notes) VALUES ('Fulano Titular', ?, '61988887777', 'fulano@exemplo.com', ?, 'obs')")
    .run(encryptSensitive('52998224725'), encryptSensitive('Rua X'));
  const clientId = Number(db.prepare('SELECT last_insert_rowid() AS id').get().id);
  const lead = db.prepare("INSERT INTO leads (name, phone, email, source, message) VALUES ('Fulano Titular', '61988887777', 'fulano@exemplo.com', 'site_formulario', 'quero o carro')").run();
  db.prepare("INSERT INTO trade_in_requests (lead_id, vehicle_data, notes) VALUES (?, '{\"placa\":\"ABC1D23\"}', 'meu usado')").run(lead.lastInsertRowid);
  db.prepare("INSERT INTO customers (name, email, password_hash, phone) VALUES ('Fulano Titular', 'fulano@exemplo.com', 'h', '61988887777')").run();

  assert.strictEqual((await call('GET', `/api/tier3/lgpd/export/${clientId}`, undefined, manager)).status, 403, 'só o proprietário');
  const exported = await (await call('GET', `/api/tier3/lgpd/export/${clientId}`, undefined, owner)).json();
  assert.strictEqual(exported.contatos_comerciais.length, 1);
  assert.ok(exported.conta_no_site);
  assert.ok(!JSON.stringify(exported).includes('base legal registrada'), 'sem declaração de base legal inventada');

  const result = await (await call('POST', `/api/tier3/lgpd/anonymize/${clientId}`, undefined, owner)).json();
  assert.strictEqual(result.anonimizados.contatos, 1);
  assert.strictEqual(db.prepare('SELECT name FROM leads WHERE id = ?').get(lead.lastInsertRowid).name, 'Titular anonimizado');
  assert.strictEqual(db.prepare('SELECT message FROM leads WHERE id = ?').get(lead.lastInsertRowid).message, null);
  assert.strictEqual(db.prepare('SELECT notes FROM trade_in_requests WHERE lead_id = ?').get(lead.lastInsertRowid).notes, null);
  assert.strictEqual(db.prepare("SELECT active FROM customers WHERE name = 'Titular anonimizado'").get().active, 0);
  assert.strictEqual(db.prepare('SELECT name FROM clients WHERE id = ?').get(clientId).name, 'Titular anonimizado');
  assert.ok(result.mantidos.includes('art. 16'));

  const logs = await (await call('GET', '/api/tier3/audit?limit=5', undefined, owner)).json();
  assert.ok(logs.length <= 5 && logs[0].action === 'LGPD_ANONIMIZACAO_TITULAR');
});
