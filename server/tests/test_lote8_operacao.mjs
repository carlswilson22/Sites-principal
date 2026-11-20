/**
 * server/tests/test_lote8_operacao.mjs
 * Aviso de novo contato por e-mail, aviso de franquia e importação de estoque.
 */
process.env.DATABASE_PATH = ':memory:';
process.env.MERCHANT_TIER = '2';
process.env.ADMIN_API_KEY = 'chave-do-fornecedor-1234567890';

import test, { before, after } from 'node:test';
import assert from 'node:assert';
import { createServer } from '../src/app.js';
import { runSeed } from '../src/database/seed.js';
import { getDb } from '../src/database/db.js';
import { loadConfig } from '../src/config.js';
import { setEmailSender } from '../src/services/emailAdapter.js';
import { recordUsage } from '../src/services/usage.js';
import { notifyQuota } from '../src/services/notifications.js';
import { parseBrazilianNumber, parseStockFile } from '../src/services/stockImport.js';

let server, base, owner, manager, attendant;
const sent = [];
const settings = { ...loadConfig({}), corsOrigins: [], isProduction: false, trustProxy: false };

before(async () => {
  await runSeed(2);
  setEmailSender(async message => { sent.push(message); return { sent: true, status: 'enviado' }; });
  server = createServer(settings);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  owner = await login('proprietario@lojaexemplo.com.br');
  manager = await login('gerente@lojaexemplo.com.br');
  attendant = await login('atendente@lojaexemplo.com.br');
});
after(() => { server.close(); setEmailSender(null); });

const call = (method, route, body, headers = {}) => fetch(base + route, {
  method, headers: { 'Content-Type': 'application/json', ...headers }, body: body === undefined ? undefined : JSON.stringify(body)
});
async function login(email) {
  const res = await call('POST', '/api/auth/login', { email, password: 'Admin@123456' });
  return { Authorization: `Bearer ${(await res.json()).token}` };
}
const tick = () => new Promise(resolve => setTimeout(resolve, 50));
const lastAudit = action => getDb().prepare('SELECT details FROM audit_logs WHERE action = ? ORDER BY id DESC LIMIT 1').get(action);

test('Novo contato: sem destinatário não envia; com e-mail da loja avisa, sem derrubar o contato', async () => {
  const body = { name: 'Cliente Teste', phone: '61999998888', consent: true, message: 'Quero ver o carro', source: 'site_formulario' };
  sent.length = 0;
  const first = await call('POST', '/api/leads', body);
  assert.strictEqual(first.status, 201);
  await tick();
  assert.strictEqual(sent.length, 0);
  assert.strictEqual(JSON.parse(lastAudit('LEAD_AVISO').details).status, 'sem_destinatario');

  await call('PUT', '/api/settings', { store: { email: 'vendas@loja.com.br' } }, owner);
  const second = await call('POST', '/api/leads', { ...body, vehicle_id: 1 });
  assert.strictEqual(second.status, 201);
  await tick();
  assert.strictEqual(sent.length, 1);
  assert.strictEqual(sent[0].to, 'vendas@loja.com.br');
  assert.ok(sent[0].text.includes('Cliente Teste') && sent[0].text.includes('61999998888') && sent[0].text.includes('Veículo de interesse'));
  assert.ok(!JSON.stringify(lastAudit('LEAD_AVISO')).includes('61999998888'), 'trilha sem dado pessoal');

  // Falha no envio não impede o registro do contato
  setEmailSender(async () => { throw new Error('provedor fora do ar'); });
  assert.strictEqual((await call('POST', '/api/leads', body)).status, 201);
  setEmailSender(async message => { sent.push(message); return { sent: true, status: 'enviado' }; });
});

test('Franquia: avisa uma vez a 80% e uma vez ao esgotar, no mês', async () => {
  await call('PUT', '/api/settings', { quotas: { ai_month: 10 } }, { ...owner, 'X-Admin-Key': process.env.ADMIN_API_KEY });
  sent.length = 0;
  for (let i = 0; i < 7; i += 1) recordUsage('ai', 1);
  assert.deepStrictEqual((await notifyQuota('ai')).skipped, true, 'a 70% não avisa');
  recordUsage('ai', 1);
  await tick();
  const atencao = sent.filter(m => m.subject.includes('80%'));
  assert.ok(atencao.length >= 1, 'aviso de 80%');
  assert.ok(atencao.some(m => m.to === 'proprietario@lojaexemplo.com.br'));
  const total = sent.length;
  recordUsage('ai', 1);
  await tick();
  assert.strictEqual(sent.length, total, 'não repete o mesmo nível no mês');
  recordUsage('ai', 3);
  await tick();
  assert.ok(sent.some(m => m.subject.includes('esgotada')), 'aviso de franquia esgotada');
});

test('Números e CSV no formato brasileiro', () => {
  assert.strictEqual(parseBrazilianNumber('R$ 89.900,00'), 89900);
  assert.strictEqual(parseBrazilianNumber('42.000 km'), 42000);
  assert.strictEqual(parseBrazilianNumber('89900'), 89900);
  assert.strictEqual(parseBrazilianNumber('1.234,5'), 1234.5);
  assert.ok(Number.isNaN(parseBrazilianNumber('abc')));

  const csv = '﻿Título *;Versão;Categoria;Ano *;Km;Câmbio;Preço (R$) *;Tipo;Situação;Opcionais\r\n' +
    'Honda Civic (EXEMPLO);2.0;sedan;2021;1;Manual;100;próprio;disponível;x\r\n' +
    '"Fiat Argo, Drive";1.3 Flex;hatch;2022/2023;31.500;Manual;"68.900,00";próprio;disponível;"Ar; Direção; Multimídia"\r\n' +
    'VW Amarok;V6;picape;2020;80000;Automático;219900;consignado;reservado;\r\n' +
    ';;;;;;;;;\r\n';
  const parsed = parseStockFile(csv);
  assert.strictEqual(parsed.errors.length, 0);
  assert.strictEqual(parsed.valid.length, 2, 'linha de exemplo e linha vazia são ignoradas');
  const argo = parsed.valid[0].values;
  assert.strictEqual(argo.title, 'Fiat Argo, Drive');
  assert.strictEqual(argo.price, 68900);
  assert.strictEqual(argo.km, 31500);
  assert.deepStrictEqual(JSON.parse(argo.features), ['Ar', 'Direção', 'Multimídia']);
  assert.strictEqual(parsed.valid[1].values.category, 'pickup');
  assert.strictEqual(parsed.valid[1].values.ownership_type, 'consignado');

  assert.ok(parseStockFile('Nome;Valor\r\nA;1').fatal.includes('Colunas obrigatórias'));
  const bad = parseStockFile('Título;Ano;Preço\r\nCarro;20x1;1000\r\nOutro;2020;abc\r\n');
  assert.strictEqual(bad.errors.length, 2);
});

test('Importação por API: permissões, conferência, tudo ou nada e limite do pacote', async () => {
  const csv = 'Título;Ano;Preço;Km\r\nImportado Um;2021;50.000,00;10.000\r\nImportado Dois;2022;60000;5000\r\n';
  assert.strictEqual((await call('POST', '/api/vehicles/import', { csv }, attendant)).status, 403, 'atendente não importa');
  assert.strictEqual((await call('POST', '/api/vehicles/import', {}, manager)).status, 400);

  const count = () => getDb().prepare('SELECT COUNT(*) AS n FROM vehicles').get().n;
  const before = count();
  const dry = await (await call('POST', '/api/vehicles/import', { csv, dry_run: true }, manager)).json();
  assert.strictEqual(dry.valid, 2);
  assert.strictEqual(count(), before, 'conferência não grava');

  const broken = await call('POST', '/api/vehicles/import', { csv: csv + 'Ruim;ano;abc\r\n' }, manager);
  assert.strictEqual(broken.status, 422);
  assert.strictEqual(count(), before, 'com erro, nada é gravado');

  const ok = await call('POST', '/api/vehicles/import', { csv }, manager);
  assert.strictEqual(ok.status, 201);
  const result = await ok.json();
  assert.strictEqual(result.imported, 2);
  assert.strictEqual(count(), before + 2);
  const created = getDb().prepare("SELECT slug, price FROM vehicles WHERE title = 'Importado Um'").get();
  assert.strictEqual(created.price, 50000);
  assert.ok(created.slug.startsWith('importado-um-2021-'));
  assert.strictEqual(result.vehicles.limit, 100, 'Expert: 100 veículos');

  const settingsInfo = await (await call('GET', '/api/settings', undefined, owner)).json();
  assert.ok(settingsInfo.vehicleUsage.published >= 2);
});
