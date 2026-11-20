/**
 * server/tests/test_lote6_m2.mjs
 * M1 restante (migrações, política central, módulos) e M2 (catálogo, mídia, contas, configuração, consumo).
 */
process.env.DATABASE_PATH = ':memory:';
process.env.MERCHANT_TIER = '3';
process.env.ADMIN_API_KEY = 'chave-do-fornecedor-1234567890';

import test, { before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { createServer } from '../src/app.js';
import { runSeed } from '../src/database/seed.js';
import { getDb, runMigrations } from '../src/database/db.js';
import { SCHEMA_SQL } from '../src/database/schema.js';
import { loadConfig } from '../src/config.js';
import { POLICY, findPolicy } from '../src/policy.js';
import { setEmailSender } from '../src/services/emailAdapter.js';
import { recordUsage, usageSummary } from '../src/services/usage.js';

const CLI = fileURLToPath(new URL('../src/cli/create-owner.js', import.meta.url));
let server, base;
const settings = { ...loadConfig({}), corsOrigins: ['https://loja.exemplo.com.br'], isProduction: false, trustProxy: false };

before(async () => {
  await runSeed(3);
  server = createServer(settings);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const call = (method, route, body, headers = {}) => fetch(base + route, {
  method, headers: { 'Content-Type': 'application/json', ...headers }, body: body === undefined ? undefined : JSON.stringify(body)
});
async function staff(email) {
  const res = await call('POST', '/api/auth/login', { email, password: 'Admin@123456' });
  return { Authorization: `Bearer ${(await res.json()).token}` };
}
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 1)]);

// ---------- M1: migrações ----------
test('Migração: banco criado antes do runner é atualizado, com backup e sem perder dados', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mig-'));
  const file = path.join(dir, 'legado.db');
  const legacy = new DatabaseSync(file);
  legacy.exec(SCHEMA_SQL);
  legacy.prepare("INSERT INTO users (name, email, password_hash, role) VALUES ('Dono', 'dono@x.com', 'h', 'proprietario')").run();
  legacy.prepare("INSERT INTO vehicles (title, year, color, price) VALUES ('Carro Antigo', '2020', 'Preto', 50000)").run();

  const applied = runMigrations(legacy, { backupDir: path.join(dir, 'backups') });
  assert.deepStrictEqual(applied, [1, 2, 3, 4]);
  assert.strictEqual(legacy.prepare('SELECT title FROM vehicles').get().title, 'Carro Antigo');
  assert.ok(legacy.prepare("SELECT 1 FROM pragma_table_info('vehicles') WHERE name = 'slug'").get(), 'coluna nova criada');
  assert.deepStrictEqual(runMigrations(legacy, { backupDir: path.join(dir, 'backups') }), [], 'segunda execução não repete');
  assert.ok(fs.readdirSync(path.join(dir, 'backups')).some(name => name.startsWith('pre-migracao-')), 'backup criado');
  legacy.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

test('Migração com erro é desfeita por completo', async () => {
  const { migrations } = await import('../src/database/migrations/index.js');
  const db = new DatabaseSync(':memory:');
  migrations.push({ id: 99, name: 'quebrada', sql: 'CREATE TABLE ok_antes (id INTEGER); INSERT INTO tabela_inexistente VALUES (1);' });
  try {
    assert.throws(() => runMigrations(db), /Migração 99/);
    assert.strictEqual(db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'ok_antes'").get(), undefined, 'nada da migração quebrada pode ficar');
    assert.strictEqual(db.prepare('SELECT COUNT(*) AS n FROM schema_migrations WHERE id = 99').get().n, 0);
  } finally { migrations.pop(); db.close(); }
});

// ---------- M1: política central ----------
test('Política: rota fora da tabela não existe (negar por padrão)', async () => {
  assert.strictEqual((await call('GET', '/api/rota-inventada')).status, 404);
  assert.strictEqual((await call('DELETE', '/api/vehicles')).status, 404);
  assert.strictEqual(findPolicy('GET', '/api/segredo'), null);
});

test('Política: cargos aplicados antes de qualquer handler', async () => {
  const atendente = await staff('atendente@lojaexemplo.com.br');
  const gerente = await staff('gerente@lojaexemplo.com.br');
  assert.strictEqual((await call('GET', '/api/users', undefined, atendente)).status, 403);
  assert.strictEqual((await call('GET', '/api/users', undefined, gerente)).status, 403, 'só o proprietário gerencia a equipe');
  assert.strictEqual((await call('DELETE', '/api/vehicles/1', undefined, atendente)).status, 403);
  assert.strictEqual((await call('GET', '/api/tier3/financial/full', undefined, gerente)).status, 403, 'DRE é só do proprietário');
  assert.strictEqual((await call('GET', '/api/tier3/audit', undefined, gerente)).status, 403);
  assert.strictEqual((await call('GET', '/api/dashboard/analytics', undefined, atendente)).status, 403);
  assert.strictEqual((await call('GET', '/api/dashboard/analytics', undefined, gerente)).status, 200);
  assert.strictEqual((await call('GET', '/api/users')).status, 401);
});

test('Política: toda rota sensível exige login (nenhuma "staff" responde sem sessão)', async () => {
  const samples = POLICY.filter(([, , rule]) => rule.access === 'staff').map(([method, pattern]) => [method, pattern.source]);
  for (const [method, source] of samples) {
    const route = source.replace(/\\\//g, '/').replace(/^\^|\$$/g, '').replace(/\(\\d\+\)|\\d\+/g, '1').replace(/\(\/\[\\w-\]\+\)\?/, '').replace(/\(([^)|]+)\|[^)]+\)/, '$1').replace(/\(\/alerts\)\?/, '').replace(/\(\/\[\\w-\]\+\)/, '');
    const res = await call(method, route, method === 'GET' ? undefined : {});
    assert.ok([401, 404].includes(res.status), `${method} ${route} respondeu ${res.status} sem login`);
    assert.notStrictEqual(res.status, 200);
  }
});

// ---------- Pacotes e módulos avulsos ----------
test('Pacotes: Basic, Expert e Premium têm conteúdo fixo e a IA não está em nenhum', async () => {
  const { PACKAGES, TIER_MODULES } = await import('../src/modules.js');
  assert.deepStrictEqual(Object.values(PACKAGES).map(pkg => pkg.name), ['Basic', 'Expert', 'Premium']);
  for (const modules of Object.values(TIER_MODULES)) assert.ok(!modules.includes('ai'), 'IA é sempre avulsa');
  assert.ok(TIER_MODULES[2].every(name => TIER_MODULES[3].includes(name)) && TIER_MODULES[1].every(name => TIER_MODULES[2].includes(name)), 'pacotes cumulativos');
  assert.ok(!TIER_MODULES[1].includes('compare') && !TIER_MODULES[1].includes('tco') && !TIER_MODULES[1].includes('viewer360'));
  assert.ok(!TIER_MODULES[1].includes('favorites') && TIER_MODULES[2].includes('favorites'), 'Favoritos começa no Expert');
  assert.ok(!TIER_MODULES[2].includes('compare') && !TIER_MODULES[2].includes('tco') && !TIER_MODULES[2].includes('price_alert'), 'Comparador, TCO e alerta continuam só no Premium');
  assert.ok(TIER_MODULES[3].includes('compare') && TIER_MODULES[3].includes('tco') && TIER_MODULES[3].includes('viewer360'));
});

test('Avulsos: o pacote define o padrão, a empresa vende módulos extras e a loja não libera nada sozinha', async () => {
  const owner = await staff('proprietario@lojaexemplo.com.br');
  const admin = { ...owner, 'X-Admin-Key': process.env.ADMIN_API_KEY };
  const pub = async () => (await call('GET', '/api/settings/public')).json();

  const premium = await pub();
  assert.strictEqual(premium.package.name, 'Premium');
  assert.ok(premium.modules.includes('stories'));
  assert.ok(!premium.modules.includes('ai'), 'IA não vem em nenhum pacote');
  assert.strictEqual((await call('POST', '/api/ai/description', { title: 'X', year: '2022' }, owner)).status, 404, 'IA bloqueada sem o avulso');

  // O proprietário da loja NÃO contrata avulsos sozinho.
  assert.strictEqual((await call('PUT', '/api/settings', { addons: ['ai'] }, owner)).status, 400);
  assert.strictEqual((await call('PUT', '/api/settings', { addons: ['ai'] }, { ...owner, 'X-Admin-Key': 'chave-errada-chave-errada' })).status, 400);
  assert.strictEqual((await call('PUT', '/api/settings', { addons: ['modulo-inexistente'] }, admin)).status, 400);

  // A empresa vende a IA avulsa.
  assert.strictEqual((await call('PUT', '/api/settings', { addons: ['ai'] }, admin)).status, 200);
  assert.ok((await pub()).modules.includes('ai'));
  assert.strictEqual((await call('POST', '/api/ai/description', { title: 'X', year: '2022' }, owner)).status, 200);
  await call('PUT', '/api/settings', { addons: [] }, admin);
  assert.strictEqual((await call('POST', '/api/ai/description', { title: 'X', year: '2022' }, owner)).status, 404, 'remover o avulso bloqueia de novo');
});

test('Avulsos: cliente Basic compra comparador, 360° e TCO e recebe só isso', async () => {
  const owner = await staff('proprietario@lojaexemplo.com.br');
  const admin = { ...owner, 'X-Admin-Key': process.env.ADMIN_API_KEY };
  process.env.MERCHANT_TIER = '1';
  try {
    const basic = await (await call('GET', '/api/settings/public')).json();
    assert.strictEqual(basic.package.name, 'Basic');
    for (const name of ['compare', 'viewer360', 'tco', 'clients', 'stories', 'favorites']) assert.ok(!basic.modules.includes(name), `${name} não faz parte do Basic`);
    assert.strictEqual((await call('GET', '/api/clients', undefined, owner)).status, 404);

    await call('PUT', '/api/settings', { addons: ['compare', 'viewer360', 'tco', 'clients'] }, admin);
    const comprado = await (await call('GET', '/api/settings/public')).json();
    for (const name of ['compare', 'viewer360', 'tco', 'clients']) assert.ok(comprado.modules.includes(name), `${name} contratado avulso`);
    assert.ok(!comprado.modules.includes('stories'), 'o que não foi comprado continua fora');
    assert.deepStrictEqual(comprado.addons.sort(), ['clients', 'compare', 'tco', 'viewer360']);
    assert.strictEqual((await call('GET', '/api/clients', undefined, owner)).status, 200, 'módulo avulso de gestão funciona no Basic');
    assert.strictEqual((await call('GET', '/api/tier3/stories/templates', undefined, owner)).status, 404);
  } finally {
    process.env.MERCHANT_TIER = '3';
    await call('PUT', '/api/settings', { addons: [] }, admin);
  }
});

test('Módulos essenciais nunca saem e a configuração de franquia segue só com a empresa', async () => {
  const owner = await staff('proprietario@lojaexemplo.com.br');
  const admin = { ...owner, 'X-Admin-Key': process.env.ADMIN_API_KEY };
  process.env.MERCHANT_TIER = '1';
  try {
    const modules = (await (await call('GET', '/api/settings/public')).json()).modules;
    for (const name of ['dashboard', 'inventory', 'leads', 'users', 'settings', 'customers']) assert.ok(modules.includes(name));
  } finally { process.env.MERCHANT_TIER = '3'; }
  assert.strictEqual((await call('PUT', '/api/settings', { quotas: { ai_month: 3 } }, owner)).status, 400);
  assert.strictEqual((await call('PUT', '/api/settings', { quotas: { ai_month: -1 } }, admin)).status, 400);
  assert.strictEqual((await call('PUT', '/api/settings', { quotas: { ai_month: 3 }, addons: ['ai'] }, admin)).status, 200);
});

test('Configuração da loja: validação e persistência', async () => {
  const owner = await staff('proprietario@lojaexemplo.com.br');
  assert.strictEqual((await call('PUT', '/api/settings', { store: { whatsapp: '(61) 9999' } }, owner)).status, 400);
  assert.strictEqual((await call('PUT', '/api/settings', { theme: { primary: 'vermelho' } }, owner)).status, 400);
  assert.strictEqual((await call('PUT', '/api/settings', { theme: { logoUrl: 'javascript:alert(1)' } }, owner)).status, 400);
  assert.strictEqual((await call('PUT', '/api/settings', { campo: 1 }, owner)).status, 400);
  const ok = await call('PUT', '/api/settings', {
    store: { name: 'Loja Piloto', whatsapp: '5561999990000', city: 'Brasília', uf: 'DF' },
    theme: { primary: '#0a84ff' }, simulator: { rates: [{ name: 'Taxa A', monthlyRatePercent: 1.5 }] }
  }, owner);
  assert.strictEqual(ok.status, 200);
  const pub = await (await call('GET', '/api/settings/public')).json();
  assert.strictEqual(pub.store.name, 'Loja Piloto');
  assert.strictEqual(pub.simulator.rates[0].monthlyRatePercent, 1.5);
  const log = getDb().prepare("SELECT 1 FROM audit_logs WHERE action = 'CONFIGURACAO_ALTERADA'").get();
  assert.ok(log, 'alteração auditada');
});

// ---------- M2: usuários da equipe ----------
test('Equipe: criar, trocar cargo, desativar e proteger o último proprietário', async () => {
  const owner = await staff('proprietario@lojaexemplo.com.br');
  assert.strictEqual((await call('POST', '/api/users', { name: 'Novo', email: 'novo@loja.com', password: 'curta', role: 'atendente' }, owner)).status, 400);
  assert.strictEqual((await call('POST', '/api/users', { name: 'Novo', email: 'novo@loja.com', password: 'SenhaForte123', role: 'diretor' }, owner)).status, 400);
  const created = await call('POST', '/api/users', { name: 'Novo', email: 'novo@loja.com', password: 'SenhaForte123', role: 'atendente' }, owner);
  assert.strictEqual(created.status, 201);
  const id = (await created.json()).id;
  assert.strictEqual((await call('POST', '/api/users', { name: 'Dup', email: 'novo@loja.com', password: 'SenhaForte123', role: 'atendente' }, owner)).status, 409);

  const list = await (await call('GET', '/api/users', undefined, owner)).json();
  assert.ok(list.every(user => user.password_hash === undefined), 'nunca expõe hash');

  const novoLogin = await call('POST', '/api/auth/login', { email: 'novo@loja.com', password: 'SenhaForte123' });
  assert.strictEqual(novoLogin.status, 200);
  const novoToken = { Authorization: `Bearer ${(await novoLogin.json()).token}` };
  assert.strictEqual((await call('GET', '/api/auth/me', undefined, novoToken)).status, 200);

  assert.strictEqual((await call('PATCH', `/api/users/${id}`, { active: false }, owner)).status, 200);
  assert.strictEqual((await call('GET', '/api/auth/me', undefined, novoToken)).status, 401, 'desativar revoga a sessão aberta');
  assert.strictEqual((await call('POST', '/api/auth/login', { email: 'novo@loja.com', password: 'SenhaForte123' })).status, 401);

  const me = (await (await call('GET', '/api/auth/me', undefined, owner)).json()).user;
  assert.strictEqual((await call('PATCH', `/api/users/${me.id}`, { active: false }, owner)).status, 400, 'não desativa a si mesmo');
  assert.strictEqual((await call('PATCH', `/api/users/${me.id}`, { role: 'gerente' }, owner)).status, 400);
});

// ---------- M2: catálogo ----------
test('Estoque: cadastro completo, slug, validação e lista pública sem dados internos', async () => {
  const gerente = await staff('gerente@lojaexemplo.com.br');
  assert.strictEqual((await call('POST', '/api/vehicles', { title: 'X', year: 'abc', price: 1000 }, gerente)).status, 400);
  assert.strictEqual((await call('POST', '/api/vehicles', { title: 'X', year: '2022', price: -5 }, gerente)).status, 400);
  assert.strictEqual((await call('POST', '/api/vehicles', { title: 'X', year: '2022', price: 1000, status: 'inventado' }, gerente)).status, 400);

  const res = await call('POST', '/api/vehicles', {
    title: 'Chevrolet Tracker', version: '1.2 Turbo Premier', brand: 'Chevrolet', year: '2023/2023', km: 22400, price: 116900, original_price: 122900,
    highlight: true, tags: ['Oportunidade'], features: ['Teto solar'], notes: 'NEGOCIAR ATÉ 110 MIL', fipe_reference_price: 99999,
    report_data: { status: 'Aprovado', codigo: 'ABC' }, dossier: { proprietarios: 1 }, spec_sheet: { portaMalas: '393 L' }
  }, gerente);
  assert.strictEqual(res.status, 201);
  const { id, slug } = await res.json();
  assert.match(slug, /^chevrolet-tracker-1-2-turbo-premier-2023-\d+$/);

  const publicView = await (await call('GET', `/api/vehicles/${slug}`)).json();
  assert.strictEqual(publicView.title, 'Chevrolet Tracker');
  assert.deepStrictEqual(publicView.features, ['Teto solar']);
  for (const hidden of ['notes', 'fipe_reference_price', 'days_in_stock', 'ownership_type', 'is_published']) {
    assert.strictEqual(publicView[hidden], undefined, `${hidden} não pode vazar no site`);
  }
  assert.strictEqual(publicView.report_data.source, 'informado_pela_loja', 'laudo nunca aparece como consulta oficial');

  const internal = await (await call('GET', `/api/vehicles/${id}`, undefined, gerente)).json();
  assert.strictEqual(internal.notes, 'NEGOCIAR ATÉ 110 MIL');

  // Não publicado e vendido somem do público
  await call('PUT', `/api/vehicles/${id}`, { is_published: false }, gerente);
  assert.strictEqual((await call('GET', `/api/vehicles/${slug}`)).status, 404);
  assert.ok(!(await (await call('GET', '/api/vehicles')).json()).some(v => v.id === id));
  assert.ok((await (await call('GET', '/api/vehicles', undefined, gerente)).json()).some(v => v.id === id));
  await call('PUT', `/api/vehicles/${id}`, { is_published: true, status: 'vendido' }, gerente);
  assert.strictEqual((await call('GET', `/api/vehicles/${id}`)).status, 404);

  // Lista pública também não traz campos internos
  const list = await (await call('GET', '/api/vehicles')).json();
  assert.ok(list.length > 0);
  assert.ok(list.every(v => v.notes === undefined && v.fipe_reference_price === undefined && v.status !== 'vendido'));
});

test('Estoque: alterar o título atualiza o slug', async () => {
  const gerente = await staff('gerente@lojaexemplo.com.br');
  const { id } = await (await call('POST', '/api/vehicles', { title: 'Modelo A', year: '2021', price: 40000 }, gerente)).json();
  await call('PUT', `/api/vehicles/${id}`, { title: 'Modelo B' }, gerente);
  const view = await (await call('GET', `/api/vehicles/${id}`, undefined, gerente)).json();
  assert.match(view.slug, /^modelo-b-2021-/);
});

// ---------- M2: mídia ----------
test('Mídia: upload validado pelo conteúdo, capa, ordem, entrega pública e remoção', async () => {
  const gerente = await staff('gerente@lojaexemplo.com.br');
  const { id } = await (await call('POST', '/api/vehicles', { title: 'Com Foto', year: '2022', price: 50000 }, gerente)).json();

  assert.strictEqual((await call('POST', `/api/vehicles/${id}/media`, { data: Buffer.from('<?php evil ?>').toString('base64') }, gerente)).status, 400, 'não aceita arquivo que não é imagem');
  assert.strictEqual((await call('POST', `/api/vehicles/${id}/media`, { data: PNG.toString('base64'), kind: 'video' }, gerente)).status, 400);
  assert.strictEqual((await call('POST', `/api/vehicles/${id}/media`, { data: PNG.toString('base64') })).status, 401);

  const first = await call('POST', `/api/vehicles/${id}/media`, { data: PNG.toString('base64') }, gerente);
  assert.strictEqual(first.status, 201);
  const one = await first.json();
  assert.strictEqual(one.is_cover, 1, 'a primeira foto vira capa');
  const second = await (await call('POST', `/api/vehicles/${id}/media`, { data: `data:image/png;base64,${PNG.toString('base64')}` }, gerente)).json();
  assert.strictEqual(second.is_cover, 0);

  const file = await fetch(base + one.url);
  assert.strictEqual(file.status, 200);
  assert.strictEqual(file.headers.get('content-type'), 'image/png');
  assert.deepStrictEqual(Buffer.from(await file.arrayBuffer()), PNG);
  assert.strictEqual((await fetch(base + '/media/vehicles/1/../../etc/passwd')).status, 404);
  assert.strictEqual((await fetch(base + `/media/vehicles/${id}/00000000-0000-0000-0000-000000000000.png`)).status, 404);

  await call('PATCH', `/api/vehicles/${id}/media/${second.id}`, { is_cover: true }, gerente);
  const view = await (await call('GET', `/api/vehicles/${id}`, undefined, gerente)).json();
  assert.strictEqual(view.photos.find(photo => photo.id === second.id).is_cover, 1);
  assert.strictEqual(view.photos.filter(photo => photo.is_cover).length, 1, 'uma única capa');

  // 360°: kind separado, não conta no limite das fotos
  assert.strictEqual((await call('POST', `/api/vehicles/${id}/media`, { data: PNG.toString('base64'), kind: 'frame360' }, gerente)).status, 201);
  assert.strictEqual((await (await call('GET', `/api/vehicles/${id}`)).json()).frames360.length, 1);

  // Remover a capa promove outra foto
  await call('DELETE', `/api/vehicles/${id}/media/${second.id}`, undefined, gerente);
  assert.strictEqual((await fetch(base + second.url)).status, 404, 'arquivo removido do disco');
  const after = await (await call('GET', `/api/vehicles/${id}`)).json();
  assert.strictEqual(after.photos.length, 1);
  assert.strictEqual(after.photos[0].is_cover, 1);
});

test('Mídia: limite de 20 fotos e tamanho máximo', async () => {
  const gerente = await staff('gerente@lojaexemplo.com.br');
  const { id } = await (await call('POST', '/api/vehicles', { title: 'Limite', year: '2022', price: 50000 }, gerente)).json();
  for (let i = 0; i < 20; i++) assert.strictEqual((await call('POST', `/api/vehicles/${id}/media`, { data: PNG.toString('base64') }, gerente)).status, 201);
  assert.strictEqual((await call('POST', `/api/vehicles/${id}/media`, { data: PNG.toString('base64') }, gerente)).status, 400);
  const { id: other } = await (await call('POST', '/api/vehicles', { title: 'Grande', year: '2022', price: 50000 }, gerente)).json();
  // Imagem de 8,5 MB cabe no limite do corpo, mas passa do máximo da imagem: a rota responde 413.
  const heavy = Buffer.concat([PNG, Buffer.alloc(Math.round(8.5 * 1024 * 1024))]);
  assert.strictEqual((await call('POST', `/api/vehicles/${other}/media`, { data: heavy.toString('base64') }, gerente)).status, 413);
  // Corpo acima do limite total é recusado antes de ser lido (a conexão pode ser encerrada).
  const huge = Buffer.concat([PNG, Buffer.alloc(10 * 1024 * 1024)]);
  const outcome = await call('POST', `/api/vehicles/${other}/media`, { data: huge.toString('base64') }, gerente).then(res => res.status, () => 'conexao_encerrada');
  assert.ok(outcome === 413 || outcome === 'conexao_encerrada', `esperava recusa, veio ${outcome}`);
  assert.strictEqual((await (await call('GET', `/api/vehicles/${other}`, undefined, gerente)).json()).photos.length, 0, 'nada foi gravado');
});

// ---------- M2: contas de clientes ----------
test('Cliente do site: cadastro, login, favoritos e isolamento do painel', async () => {
  const consent = { consent: true };
  assert.strictEqual((await call('POST', '/api/customers/register', { name: 'Ana', email: 'ana@exemplo.com', password: 'abc12345' })).status, 400, 'exige consentimento');
  assert.strictEqual((await call('POST', '/api/customers/register', { name: 'Ana', email: 'ana@exemplo.com', password: 'curta1', ...consent })).status, 400);
  const reg = await call('POST', '/api/customers/register', { name: 'Ana', email: 'ana@exemplo.com', password: 'abc12345', ...consent });
  assert.strictEqual(reg.status, 201);
  const cookie = reg.headers.get('set-cookie').split(';')[0];
  assert.match(reg.headers.get('set-cookie'), /HttpOnly/);
  const customer = { Cookie: cookie };

  assert.strictEqual((await call('POST', '/api/customers/register', { name: 'Ana 2', email: 'ana@exemplo.com', password: 'abc12345', ...consent })).status, 409);
  assert.strictEqual((await call('POST', '/api/customers/register', { name: 'Fake', email: 'proprietario@lojaexemplo.com.br', password: 'abc12345', ...consent })).status, 409, 'e-mail da equipe não vira cliente');

  const me = await (await call('GET', '/api/customers/me', undefined, customer)).json();
  assert.strictEqual(me.customer.email, 'ana@exemplo.com');
  // Cliente nunca acessa o painel nem a política da equipe
  assert.strictEqual((await call('GET', '/api/leads', undefined, customer)).status, 401);
  assert.strictEqual((await call('GET', '/api/users', undefined, customer)).status, 401);
  assert.strictEqual((await call('GET', '/api/customers/favorites')).status, 401);

  const vehicle = (await (await call('GET', '/api/vehicles')).json())[0];
  assert.strictEqual((await call('PUT', `/api/customers/favorites/${vehicle.id}`, undefined, customer)).status, 200);
  assert.strictEqual((await call('PUT', `/api/customers/favorites/99999`, undefined, customer)).status, 404);
  assert.strictEqual((await (await call('GET', '/api/customers/favorites', undefined, customer)).json()).length, 1);
  await call('DELETE', `/api/customers/favorites/${vehicle.id}`, undefined, customer);
  assert.strictEqual((await (await call('GET', '/api/customers/favorites', undefined, customer)).json()).length, 0);

  const alert = await call('POST', '/api/price-alerts', { vehicle_id: vehicle.id, desired_price: 50000, consent: true }, customer);
  assert.strictEqual(alert.status, 201);
  const lead = getDb().prepare("SELECT message, consent_version FROM leads WHERE email = 'ana@exemplo.com'").get();
  assert.match(lead.message, /condição de preço/);
  assert.strictEqual(lead.consent_version, '1');

  assert.strictEqual((await call('POST', '/api/customers/login', { email: 'ana@exemplo.com', password: 'errada123' })).status, 401);
  assert.strictEqual((await call('POST', '/api/customers/login', { email: 'ana@exemplo.com', password: 'abc12345' })).status, 200);
  await call('POST', '/api/customers/logout', {}, customer);
  assert.strictEqual((await call('GET', '/api/customers/favorites', undefined, customer)).status, 401, 'logout revoga');
});

test('Cliente: senha guardada só como hash e sessão só como hash', () => {
  const db = getDb();
  const row = db.prepare("SELECT password_hash FROM customers WHERE email = 'ana@exemplo.com'").get();
  assert.ok(row.password_hash.includes(':') && !row.password_hash.includes('abc12345'));
  assert.ok(db.prepare('SELECT token_hash FROM customer_sessions').all().every(session => session.token_hash.length === 64));
});

// ---------- M2: recuperação de senha ----------
test('Recuperação de senha: link único, expira, revoga sessões e não revela contas', async () => {
  const sent = [];
  setEmailSender(async message => { sent.push(message); return { sent: true, status: 'enviado' }; });
  try {
    const owner = await staff('proprietario@lojaexemplo.com.br');
    await call('POST', '/api/users', { name: 'Recupera', email: 'recupera@loja.com', password: 'SenhaForte123', role: 'gerente' }, owner);
    const generic = await (await call('POST', '/api/auth/recover', { email: 'naoexiste@x.com' })).json();
    const real = await (await call('POST', '/api/auth/recover', { email: 'recupera@loja.com' })).json();
    assert.deepStrictEqual(real, generic, 'mesma resposta exista ou não a conta');
    assert.strictEqual(sent.length, 1);
    assert.strictEqual(sent[0].to, 'recupera@loja.com');
    const token = sent[0].text.match(/token=([a-f0-9]+)/)[1];
    assert.ok(!getDb().prepare('SELECT token_hash FROM password_resets').all().some(row => row.token_hash === token), 'token não fica em texto aberto');

    const loginAntes = await call('POST', '/api/auth/login', { email: 'recupera@loja.com', password: 'SenhaForte123' });
    const before = { Authorization: `Bearer ${(await loginAntes.json()).token}` };
    assert.strictEqual((await call('POST', '/api/auth/reset', { token, password: 'fraca' })).status, 400);
    assert.strictEqual((await call('POST', '/api/auth/reset', { token: 'invalido', password: 'NovaSenha123' })).status, 400);
    assert.strictEqual((await call('POST', '/api/auth/reset', { token, password: 'NovaSenha123' })).status, 200);
    assert.strictEqual((await call('POST', '/api/auth/reset', { token, password: 'OutraSenha123' })).status, 400, 'link de uso único');
    assert.strictEqual((await call('GET', '/api/auth/me', undefined, before)).status, 401, 'sessões antigas revogadas');
    assert.strictEqual((await call('POST', '/api/auth/login', { email: 'recupera@loja.com', password: 'NovaSenha123' })).status, 200);

    sent.length = 0;
    await call('POST', '/api/auth/recover', { email: 'ana@exemplo.com' });
    const customerToken = sent[0].text.match(/token=([a-f0-9]+)/)[1];
    getDb().prepare("UPDATE password_resets SET expires_at = ? WHERE token_hash IS NOT NULL AND used_at IS NULL").run(new Date(Date.now() - 1000).toISOString());
    assert.strictEqual((await call('POST', '/api/auth/reset', { token: customerToken, password: 'NovaSenha123' })).status, 400, 'link expirado');
  } finally { setEmailSender(null); }
});

test('E-mail sem provedor informa "nao_configurado" e não finge envio', async () => {
  const { sendEmail } = await import('../src/services/emailAdapter.js');
  delete process.env.RESEND_API_KEY;
  const result = await sendEmail({ to: 'a@b.com', subject: 's', text: 't' });
  assert.deepStrictEqual(result, { sent: false, status: 'nao_configurado' });
});

// ---------- M2: troca, métricas e consumo ----------
test('Avaliação de troca registra lead e exige dados e consentimento', async () => {
  const body = { name: 'Beto', phone: '(61) 98888-0000', vehicle: { brand: 'VW', model: 'Gol', year: '2015', km: 90000 }, consent: true };
  assert.strictEqual((await call('POST', '/api/trade-ins', { ...body, consent: false })).status, 400);
  assert.strictEqual((await call('POST', '/api/trade-ins', { ...body, vehicle: { model: '' } })).status, 400);
  assert.strictEqual((await call('POST', '/api/trade-ins', body)).status, 201);
  const lead = getDb().prepare("SELECT source, temperature FROM leads WHERE name = 'Beto'").get();
  assert.strictEqual(lead.source, 'avaliacao_troca');
});

test('Métricas de acesso: registradas no servidor, sem dado pessoal, e lidas por gerente', async () => {
  const vehicle = (await (await call('GET', '/api/vehicles')).json())[0];
  assert.strictEqual((await call('POST', '/api/track', { type: 'invalido' })).status, 400);
  for (const type of ['page_view', 'page_view', 'vehicle_view', 'whatsapp_click']) {
    assert.strictEqual((await call('POST', '/api/track', { type, page: 'home', vehicle_id: type === 'page_view' ? undefined : vehicle.id })).status, 204);
  }
  const gerente = await staff('gerente@lojaexemplo.com.br');
  const data = await (await call('GET', '/api/dashboard/analytics?days=7', undefined, gerente)).json();
  assert.strictEqual(data.hasData, true);
  assert.strictEqual(data.metrics.pageViews.current, 2);
  assert.strictEqual(data.metrics.whatsappClicks.current, 1);
  assert.strictEqual(data.topVehicles[0].id, vehicle.id);
  const columns = getDb().prepare("SELECT name FROM pragma_table_info('access_events')").all().map(c => c.name);
  assert.ok(!columns.some(name => /ip|phone|name|email/.test(name)), 'a tabela de eventos não guarda dado pessoal');
});

test('Franquia: consumo contado, aviso aos 80% e excedente sem bloquear', async () => {
  const gerente = await staff('gerente@lojaexemplo.com.br');
  getDb().prepare('DELETE FROM usage_events').run();
  const now = new Date();
  // quota de IA = 3 (definida no teste de módulos); já houve 0 usos
  const before = usageSummary(now).find(item => item.kind === 'ai_calls') ?? usageSummary(now).find(item => item.kind === 'ai');
  assert.ok(before === undefined || before.used >= 0);

  for (let i = 0; i < 3; i++) {
    const res = await call('POST', '/api/ai/description', { title: 'Carro', year: '2022', km: 10000 }, gerente);
    assert.strictEqual(res.status, 200);
  }
  let item = (await (await call('GET', '/api/usage', undefined, gerente)).json()).items.find(entry => entry.kind === 'ai');
  assert.strictEqual(item.used, 3);
  assert.strictEqual(item.quota, 3);
  assert.strictEqual(item.level, 'excedido');

  // Continua funcionando além da franquia e registra o excedente para cobrança
  const over = await call('POST', '/api/ai/description', { title: 'Carro', year: '2022' }, gerente);
  assert.strictEqual(over.status, 200, 'o sistema continua funcionando');
  item = (await (await call('GET', '/api/usage', undefined, gerente)).json()).items.find(entry => entry.kind === 'ai');
  assert.strictEqual(item.used, 4);
  assert.strictEqual(item.overage, 1);

  recordUsage('plate', 8);
  const plate = usageSummary().find(entry => entry.kind === 'plate');
  assert.strictEqual(plate.used, 8);
  const atendente = await staff('atendente@lojaexemplo.com.br');
  assert.strictEqual((await call('GET', '/api/usage', undefined, atendente)).status, 403);
});

test('Franquia: nível de atenção aos 80%', () => {
  const db = getDb();
  db.prepare("INSERT OR REPLACE INTO store_settings (key, value) VALUES ('quotas', ?)").run(JSON.stringify({ ai_month: 10, plate_month: 10 }));
  db.prepare("DELETE FROM usage_events WHERE kind IN ('ai','plate')").run();
  recordUsage('ai', 8);
  assert.strictEqual(usageSummary().find(item => item.kind === 'ai').level, 'atencao');
  recordUsage('ai', 2);
  assert.strictEqual(usageSummary().find(item => item.kind === 'ai').level, 'excedido');
});

// ---------- Primeiro acesso ----------
test('Primeiro acesso: senha provisória bloqueia o painel até ser trocada', async () => {
  const { hashPassword } = await import('../src/security/crypto.js');
  getDb().prepare("INSERT INTO users (name, email, password_hash, role, tier, active, must_change_password) VALUES ('Novo Dono', 'novodono@loja.com', ?, 'proprietario', 3, 1, 1)")
    .run(await hashPassword('Provisoria123x'));
  const login = await call('POST', '/api/auth/login', { email: 'novodono@loja.com', password: 'Provisoria123x' });
  const data = await login.json();
  assert.strictEqual(data.user.mustChangePassword, true);
  const auth = { Authorization: `Bearer ${data.token}` };

  assert.strictEqual((await call('GET', '/api/leads', undefined, auth)).status, 403, 'painel bloqueado');
  assert.strictEqual((await call('GET', '/api/users', undefined, auth)).status, 403);
  assert.strictEqual((await call('GET', '/api/auth/me', undefined, auth)).status, 200);

  assert.strictEqual((await call('POST', '/api/auth/change-password', { current_password: 'errada', new_password: 'NovaSenhaForte1' }, auth)).status, 400);
  assert.strictEqual((await call('POST', '/api/auth/change-password', { current_password: 'Provisoria123x', new_password: 'curta' }, auth)).status, 400);
  assert.strictEqual((await call('POST', '/api/auth/change-password', { current_password: 'Provisoria123x', new_password: 'Provisoria123x' }, auth)).status, 400);
  assert.strictEqual((await call('POST', '/api/auth/change-password', { current_password: 'Provisoria123x', new_password: 'NovaSenhaForte1' }, auth)).status, 200);

  assert.strictEqual((await call('GET', '/api/leads', undefined, auth)).status, 200, 'liberado após a troca');
  assert.strictEqual((await call('POST', '/api/auth/login', { email: 'novodono@loja.com', password: 'Provisoria123x' })).status, 401);
  assert.strictEqual((await call('POST', '/api/auth/login', { email: 'novodono@loja.com', password: 'NovaSenhaForte1' })).status, 200);
});

test('Comando create-owner cria o proprietário inicial com senha provisória que funciona', async () => {
  const { spawnSync } = await import('node:child_process');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'owner-'));
  try {
    const env = { ...process.env, DATABASE_PATH: path.join(dir, 'm.db'), DATA_DIR: dir, NODE_ENV: 'development' };
    const run = spawnSync(process.execPath, [CLI, 'Dono Inicial', 'dono.inicial@loja.com'], { env, encoding: 'utf8' });
    assert.strictEqual(run.status, 0, run.stderr);
    const password = run.stdout.match(/Senha provisória \(mostrada só agora\): (\S+)/)[1];
    assert.ok(password.length >= 12 && /\d/.test(password) && /[A-Za-z]/.test(password));
    const db = new DatabaseSync(path.join(dir, 'm.db'));
    const user = db.prepare("SELECT role, must_change_password, password_hash FROM users WHERE email = 'dono.inicial@loja.com'").get();
    assert.strictEqual(user.role, 'proprietario');
    assert.strictEqual(user.must_change_password, 1);
    assert.ok(!user.password_hash.includes(password));
    db.close();
    const again = spawnSync(process.execPath, [CLI, 'Outro', 'dono.inicial@loja.com'], { env, encoding: 'utf8' });
    assert.notStrictEqual(again.status, 0, 'não duplica e-mail');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
