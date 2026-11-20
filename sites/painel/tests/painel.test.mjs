/**
 * Painel da loja: sobe a API de verdade (pacote Premium, dados de demonstração) e o painel já compilado
 * (npm run build -w painel), e opera como proprietário, gerente e atendente.
 */
import test, { before, after } from 'node:test';
import assert from 'node:assert';
import net from 'node:net';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const freePort = () => new Promise(resolve => { const s = net.createServer().listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); }); });
const children = [];
const start = (args, env) => { const c = spawn(process.execPath, ['--no-warnings', ...args], { env: { ...process.env, ...env }, stdio: 'ignore', cwd: ROOT }); children.push(c); return c; };
async function until(url) {
  for (let i = 0; i < 60; i += 1) { try { if ((await fetch(url)).status < 500) return; } catch { /* subindo */ } await new Promise(r => setTimeout(r, 250)); }
  throw new Error(`Não subiu: ${url}`);
}
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

let API, PANEL, api, tmp, owner, manager, attendant;
const PASSWORD = 'Admin@123456';

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'painel-'));
  const [apiPort, panelPort] = [await freePort(), await freePort()];
  API = `http://127.0.0.1:${apiPort}`; PANEL = `http://127.0.0.1:${panelPort}`;
  api = start(['server/src/index.js'], { PORT: String(apiPort), MERCHANT_TIER: '3', DATABASE_PATH: path.join(tmp, 'm.db'), DATA_DIR: tmp, MEDIA_DIR: path.join(tmp, 'media'), SEED_DEMO: 'true', NODE_ENV: 'development', STORE_NAME: 'Loja Teste', STORE_CITY: 'Brasília', STORE_UF: 'DF' });
  await until(`${API}/api/health`);
  start(['sites/painel/dist/server/entry.mjs'], { PORT: String(panelPort), HOST: '127.0.0.1', API_URL: API, PANEL_URL: PANEL, NODE_ENV: 'production' });
  await until(`${PANEL}/entrar`);
  owner = await login('proprietario@lojaexemplo.com.br');
  manager = await login('gerente@lojaexemplo.com.br');
  attendant = await login('atendente@lojaexemplo.com.br');
});
after(() => { for (const c of children) c.kill(); });

const cookieOf = (res, name) => (res.headers.getSetCookie().find(l => l.startsWith(`${name}=`)) || '').split(';')[0];
const flashOf = res => decodeURIComponent(cookieOf(res, 'flash').slice(6));
async function login(email, password = PASSWORD) {
  const res = await post('/acoes/entrar', { email, password });
  return cookieOf(res, 'painel_session');
}
const post = (route, fields, cookie, headers = {}) => fetch(PANEL + route, {
  method: 'POST', redirect: 'manual',
  headers: { Origin: PANEL, 'Content-Type': 'application/x-www-form-urlencoded', ...(cookie ? { Cookie: cookie } : {}), ...headers },
  body: new URLSearchParams(fields).toString()
});
const get = async (route, cookie) => { const res = await fetch(PANEL + route, { redirect: 'manual', headers: cookie ? { Cookie: cookie } : {} }); return { res, text: await res.text() }; };
const asStaff = async (email, password = PASSWORD) => {
  const res = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  return { Authorization: `Bearer ${(await res.json()).token}`, 'Content-Type': 'application/json' };
};
let ownerApi;
const apiJson = async (method, route, body, headers) => { ownerApi ||= await asStaff('proprietario@lojaexemplo.com.br'); const res = await fetch(API + route, { method, headers: headers || ownerApi, body: body && JSON.stringify(body) }); return { status: res.status, data: await res.json().catch(() => null) }; };
const vehicleFields = (extra = {}) => ({ title: 'Honda Civic Teste', year: '2021', price: '89.900,00', km: '42.000', transmission: 'Automático', fuel: 'Flex', category: 'sedan', doors: '4', features: 'Ar-condicionado\nCâmera de ré', status: 'disponivel', ownership_type: 'proprio', is_published: 'on', ...extra });

test('Sem login, nada abre: páginas e ações levam à entrada', async () => {
  for (const route of ['/', '/estoque', '/contatos', '/configuracoes', '/equipe', '/estoque/novo']) {
    const { res } = await get(route);
    assert.strictEqual(res.status, 302, route);
    assert.strictEqual(res.headers.get('location'), '/entrar');
  }
  const before = (await apiJson('GET', '/api/vehicles')).data.length;
  const action = await post('/acoes/veiculo-salvar', vehicleFields({ title: 'Sem Login' }));
  assert.strictEqual(action.headers.get('location'), '/entrar');
  assert.strictEqual((await apiJson('GET', '/api/vehicles')).data.length, before, 'nada foi criado');

  const entrar = await get('/entrar');
  assert.strictEqual(entrar.res.status, 200);
  assert.match(entrar.text, /Loja Teste/);
  assert.match(entrar.res.headers.get('content-security-policy'), /script-src 'self'/);
  assert.match(entrar.res.headers.get('x-robots-tag'), /noindex/);
  assert.match(entrar.res.headers.get('cache-control'), /no-store/);
});

test('Entrar: senha errada não abre, certa cria sessão HttpOnly, origem de fora é recusada', async () => {
  const wrong = await post('/acoes/entrar', { email: 'proprietario@lojaexemplo.com.br', password: 'errada' });
  assert.strictEqual(wrong.headers.get('location'), '/entrar');
  assert.match(flashOf(wrong), /E-mail ou senha inválidos/);
  assert.ok(!cookieOf(wrong, 'painel_session'));

  const ok = await post('/acoes/entrar', { email: 'proprietario@lojaexemplo.com.br', password: PASSWORD });
  assert.strictEqual(ok.headers.get('location'), '/');
  const raw = ok.headers.getSetCookie().find(l => l.startsWith('painel_session='));
  assert.ok(/HttpOnly/i.test(raw) && /SameSite=Lax/i.test(raw));

  assert.strictEqual((await post('/acoes/entrar', { email: 'x@x.com', password: 'y' }, null, { Origin: 'https://evil.example' })).status, 403);

  const home = await get('/', owner);
  assert.strictEqual(home.res.status, 200);
  assert.match(home.text, /veículos disponíveis/);
  assert.match(home.text, /contatos novos para responder/);
});

test('Permissões por cargo: o atendente não vê nem acessa configurações, equipe e importação', async () => {
  const home = (await get('/', attendant)).text;
  assert.doesNotMatch(home, /href="\/configuracoes"/);
  assert.doesNotMatch(home, /href="\/equipe"/);
  assert.match(home, /href="\/estoque"/);
  assert.strictEqual((await get('/configuracoes', attendant)).res.status, 403);
  assert.strictEqual((await get('/equipe', attendant)).res.status, 403);
  assert.strictEqual((await get('/estoque/importar', attendant)).res.status, 403);
  const ownerHome = (await get('/', owner)).text;
  assert.match(ownerHome, /href="\/configuracoes"/);
  assert.match(ownerHome, /href="\/equipe"/);
  assert.strictEqual((await get('/configuracoes', owner)).res.status, 200);

  const config = await post('/acoes/config', { secao: 'comissao', percentual: '5' }, attendant);
  assert.match(flashOf(config), /permissão/i, 'a API também recusa');
});

test('Estoque: cadastra com números brasileiros, edita, valida e marca como vendido', async () => {
  const created = await post('/acoes/veiculo-salvar', vehicleFields(), owner);
  assert.match(created.headers.get('location'), /^\/estoque\/\d+$/);
  const id = Number(created.headers.get('location').split('/').pop());
  const saved = (await apiJson('GET', `/api/vehicles/${id}`)).data;
  assert.strictEqual(saved.price, 89900);
  assert.strictEqual(saved.km, 42000);
  assert.deepStrictEqual(saved.features, ['Ar-condicionado', 'Câmera de ré']);
  assert.ok(saved.slug, 'ganhou endereço próprio');

  assert.match((await get('/estoque', owner)).text, /Honda Civic Teste/);
  assert.match((await get('/estoque?q=civic', owner)).text, /Honda Civic Teste/);
  assert.doesNotMatch((await get('/estoque?q=zzzzz', owner)).text, /Honda Civic Teste/);
  const edit = await get(`/estoque/${id}`, owner);
  assert.match(edit.text, /value="Honda Civic Teste"/);
  assert.match(edit.text, /Marcar como vendido/);

  const update = await post('/acoes/veiculo-salvar', vehicleFields({ id: String(id), price: '84.500' }), owner);
  assert.strictEqual(update.headers.get('location'), `/estoque/${id}`);
  assert.strictEqual((await apiJson('GET', `/api/vehicles/${id}`)).data.price, 84500);

  const bad = await post('/acoes/veiculo-salvar', vehicleFields({ id: String(id), price: 'abc' }), owner);
  assert.match(flashOf(bad), /Preço inválido/);
  assert.strictEqual((await apiJson('GET', `/api/vehicles/${id}`)).data.price, 84500, 'preço não mudou');
  assert.match(flashOf(await post('/acoes/veiculo-salvar', vehicleFields({ title: '' }), owner)), /título/i);

  assert.match(flashOf(await post('/acoes/veiculo-vender', { id: String(id), sale_price: '' }, owner)), /valor pelo qual/i);
  const sold = await post('/acoes/veiculo-vender', { id: String(id), sale_price: '82.000' }, owner);
  assert.strictEqual(sold.headers.get('location'), '/estoque');
  const after = (await apiJson('GET', `/api/vehicles/${id}`)).data;
  assert.strictEqual(after.status, 'vendido');
  assert.strictEqual(after.sale_price, 82000);
  assert.strictEqual((await fetch(`${API}/api/vehicles/${after.slug}`)).status, 404, 'saiu do site público');
  assert.match((await get(`/estoque/${id}`, owner)).text, /Vendido por/);

  await post('/acoes/veiculo-reabrir', { id: String(id) }, owner);
  assert.strictEqual((await apiJson('GET', `/api/vehicles/${id}`)).data.status, 'disponivel');
});

test('Excluir: atendente não consegue; gerente precisa confirmar', async () => {
  const id = Number((await post('/acoes/veiculo-salvar', vehicleFields({ title: 'Para Excluir' }), owner)).headers.get('location').split('/').pop());
  assert.match(flashOf(await post('/acoes/veiculo-excluir', { id: String(id), confirmo: 'on' }, attendant)), /permissão/i);
  assert.strictEqual((await apiJson('GET', `/api/vehicles/${id}`)).status, 200);
  assert.match(flashOf(await post('/acoes/veiculo-excluir', { id: String(id) }, manager)), /confirmação/i);
  assert.strictEqual((await apiJson('GET', `/api/vehicles/${id}`)).status, 200);
  assert.strictEqual((await post('/acoes/veiculo-excluir', { id: String(id), confirmo: 'on' }, manager)).headers.get('location'), '/estoque');
  assert.strictEqual((await apiJson('GET', `/api/vehicles/${id}`)).status, 404);
});

test('Fotos: envia, define capa, reordena e exclui', async () => {
  const id = Number((await post('/acoes/veiculo-salvar', vehicleFields({ title: 'Com Fotos' }), owner)).headers.get('location').split('/').pop());
  const upload = (kind = 'photo') => fetch(`${PANEL}/acoes/foto`, { method: 'POST', headers: { Origin: PANEL, 'Content-Type': 'application/json', Cookie: owner }, body: JSON.stringify({ vehicle_id: id, kind, data: `data:image/png;base64,${PNG}` }) });
  assert.deepStrictEqual(await (await upload()).json(), { ok: true });
  assert.deepStrictEqual(await (await upload()).json(), { ok: true });
  const anon = await fetch(`${PANEL}/acoes/foto`, { method: 'POST', headers: { Origin: PANEL, 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicle_id: id, data: PNG }) });
  assert.strictEqual(anon.status, 401);
  const foreign = await fetch(`${PANEL}/acoes/foto`, { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json', Cookie: owner }, body: JSON.stringify({ vehicle_id: id, data: PNG }) });
  assert.strictEqual(foreign.status, 403);
  const invalid = await fetch(`${PANEL}/acoes/foto`, { method: 'POST', headers: { Origin: PANEL, 'Content-Type': 'application/json', Cookie: owner }, body: JSON.stringify({ vehicle_id: id, kind: 'photo', data: 'bm90IGFuIGltYWdl' }) });
  assert.strictEqual(invalid.status, 400);

  let photos = (await apiJson('GET', `/api/vehicles/${id}`)).data.photos;
  assert.strictEqual(photos.length, 2);
  assert.strictEqual(photos[0].is_cover, 1);
  const [first, second] = photos;

  await post('/acoes/foto-acao', { vehicle_id: String(id), media_id: String(second.id), op: 'capa' }, owner);
  photos = (await apiJson('GET', `/api/vehicles/${id}`)).data.photos;
  assert.strictEqual(photos.find(p => p.id === second.id).is_cover, 1);

  await post('/acoes/foto-acao', { vehicle_id: String(id), media_id: String(first.id), op: 'descer', kind: 'photo' }, owner);
  photos = (await apiJson('GET', `/api/vehicles/${id}`)).data.photos;
  assert.deepStrictEqual(photos.map(p => p.id), [second.id, first.id], 'ordem trocada');

  const page = (await get(`/estoque/${id}`, owner)).text;
  assert.match(page, /Visualizador 360°/);
  assert.match(page, /data-upload/);
  await post('/acoes/foto-acao', { vehicle_id: String(id), media_id: String(first.id), op: 'excluir' }, owner);
  assert.strictEqual((await apiJson('GET', `/api/vehicles/${id}`)).data.photos.length, 1);

  assert.strictEqual((await fetch(`${PANEL}/media/..%2f..%2fetc%2fpasswd`, { headers: { Cookie: owner }, redirect: 'manual' })).status, 404);
  assert.strictEqual((await fetch(`${PANEL}/media/vehicles/1/x.jpg`, { redirect: 'manual' })).status, 302, 'sem login, nem as fotos do painel abrem');
});

test('Importação: confere sem gravar, mostra as linhas com erro e importa tudo ou nada', async () => {
  const count = async () => (await apiJson('GET', '/api/vehicles?limit=200')).data.length;
  const good = 'Título;Ano;Preço\r\nImportado A;2021;50.000,00\r\nImportado B;2022;60000\r\n';
  const before = await count();

  const check = await post('/estoque/importar', { modo: 'conferir', csv: good }, owner);
  const html = await check.text();
  assert.strictEqual(check.status, 200);
  assert.match(html, /<strong>2<\/strong> linhas válidas/);
  assert.match(html, /Importar 2 veículos/);
  assert.strictEqual(await count(), before, 'conferir não grava');

  const broken = await (await post('/estoque/importar', { modo: 'importar', csv: good + 'Ruim;ano;abc\r\n' }, owner)).text();
  assert.match(broken, /<td>4<\/td>/, 'aponta a linha 4');
  assert.match(broken, /Nada foi cadastrado/);
  assert.strictEqual(await count(), before, 'com erro, nada entra');

  const imported = await post('/estoque/importar', { modo: 'importar', csv: good }, owner);
  assert.strictEqual(imported.status, 303);
  assert.strictEqual(imported.headers.get('location'), '/estoque');
  assert.match(flashOf(imported), /2 veículos importados/);
  assert.strictEqual(await count(), before + 2);

  const model = await fetch(`${PANEL}/estoque/modelo.csv`, { headers: { Cookie: owner } });
  assert.match(model.headers.get('content-disposition'), /modelo-estoque\.csv/);
  assert.ok((await model.text()).includes('"Título *";"Versão"'));
});

test('Contatos: lista, mostra WhatsApp, filtra e registra atendimento com anotação', async () => {
  const created = await fetch(`${API}/api/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Maria Interessada', phone: '(61) 98888-7777', consent: true, message: 'Posso ver amanhã?', source: 'site_formulario' }) });
  assert.strictEqual(created.status, 201);
  const { id } = await created.json();

  const list = (await get('/contatos', attendant)).text;
  assert.match(list, /Maria Interessada/);
  assert.match(list, /wa\.me\/5561988887777/);
  assert.match(list, /Posso ver amanhã\?/);
  assert.match((await get('/contatos?status=novo', attendant)).text, /Maria Interessada/);
  assert.doesNotMatch((await get('/contatos?status=ganho', attendant)).text, /Maria Interessada/);
  assert.doesNotMatch((await get('/contatos?q=zzzz', attendant)).text, /Maria Interessada/);

  const update = await post('/acoes/contato', { id: String(id), status: 'em_atendimento', temperature: 'quente', note: 'Liguei às 10h', voltar: '/contatos' }, attendant);
  assert.strictEqual(update.headers.get('location'), '/contatos');
  assert.match(flashOf(update), /Contato atualizado/);
  const leads = (await apiJson('GET', '/api/leads')).data;
  const lead = leads.find(l => l.id === id);
  assert.strictEqual(lead.status, 'em_atendimento');
  assert.strictEqual(lead.temperature, 'quente');
  assert.strictEqual(post('/acoes/contato', { id: String(id), voltar: 'https://evil.example' }, attendant) instanceof Promise, true);
  assert.strictEqual((await post('/acoes/contato', { id: String(id), status: 'ganho', voltar: 'https://evil.example' }, attendant)).headers.get('location'), '/contatos', 'destino externo vira /contatos');
});

test('Configurações: cada seção salva sem apagar as outras e a API valida', async () => {
  const pub = async () => (await (await fetch(`${API}/api/settings/public`)).json());

  const loja = await post('/acoes/config', { secao: 'loja', name: 'Auto Silva', cnpj: '12.345.678/0001-90', whatsapp: '(61) 99999-0000', phone: '(61) 3333-0000', email: 'vendas@autosilva.com.br', address: 'SIA Trecho 3', city: 'Brasília', uf: 'df', about: 'Seminovos selecionados.' }, owner);
  assert.match(flashOf(loja), /Configurações salvas/);
  let settings = await pub();
  assert.strictEqual(settings.store.whatsapp, '5561999990000', 'ganhou o 55');
  assert.strictEqual(settings.store.uf, 'DF');

  await post('/acoes/config', { secao: 'horarios', seg: '09:00 às 18:00', sab: '09:00 às 13:00', dom: '' }, owner);
  settings = await pub();
  assert.strictEqual(settings.store.hours.seg, '09:00 às 18:00');
  assert.ok(!('dom' in settings.store.hours), 'dia em branco não vai para o site');
  assert.strictEqual(settings.store.about, 'Seminovos selecionados.', 'salvar horários não apaga o resto');

  const services = { secao: 'servicos', titulo_0: 'Financiamento', texto_0: 'Simulamos com as condições da loja.', titulo_1: 'Documentação', texto_1: 'Cuidamos da transferência.' };
  await post('/acoes/config', services, owner);
  assert.deepStrictEqual((await pub()).store.services.map(s => s.title), ['Financiamento', 'Documentação']);

  assert.match(flashOf(await post('/acoes/config', { secao: 'tema', primary: 'vermelho', logoUrl: '' }, owner)), /cor|primary/i);
  assert.match(flashOf(await post('/acoes/config', { secao: 'tema', primary: '#c8102e', logoUrl: '' }, owner)), /salvas/);
  assert.strictEqual((await pub()).theme.primary, '#c8102e');

  assert.match(flashOf(await post('/acoes/config', { secao: 'simulador', nome_0: 'Condição A', taxa_0: 'abc' }, owner)), /taxa mensal/);
  assert.match(flashOf(await post('/acoes/config', { secao: 'simulador', nome_0: 'Condição A', taxa_0: '1,49', nome_1: 'Condição B', taxa_1: '1,65' }, owner)), /salvas/);
  assert.deepStrictEqual((await pub()).simulator.rates.map(r => r.monthlyRatePercent), [1.49, 1.65]);
  assert.match(flashOf(await post('/acoes/config', { secao: 'simulador', nome_0: 'Alta', taxa_0: '25' }, owner)), /0 a 10/);

  assert.match(flashOf(await post('/acoes/config', { secao: 'comissao', percentual: '150' }, owner)), /0 a 100/);
  await post('/acoes/config', { secao: 'comissao', percentual: '1,5' }, owner);
  assert.strictEqual((await apiJson('GET', '/api/settings')).data.commission.ratePercent, 1.5);

  const page = (await get('/configuracoes', owner)).text;
  assert.match(page, /value="Auto Silva"/);
  assert.match(page, /value="09:00 às 18:00"/);
  assert.match(page, /Comissão da equipe/);
  assert.match((await get('/', owner)).text, /Informe o horário|veículos publicados|disponíveis/);
});

test('Equipe e primeiro acesso: senha provisória obriga a troca antes de qualquer outra tela', async () => {
  assert.match(flashOf(await post('/acoes/equipe-criar', { name: 'Novo Atendente', email: 'novo@loja.com', role: 'atendente', password: 'curta' }, owner)), /senha/i);
  const created = await post('/acoes/equipe-criar', { name: 'Novo Atendente', email: 'novo@loja.com', role: 'atendente', password: 'Provisoria123' }, owner);
  assert.match(flashOf(created), /adicionada/);
  assert.match(flashOf(await post('/acoes/equipe-criar', { name: 'Repetido', email: 'novo@loja.com', role: 'atendente', password: 'Provisoria123' }, owner)), /já existe/i);
  assert.match((await get('/equipe', owner)).text, /novo@loja\.com/);

  const session = await login('novo@loja.com', 'Provisoria123');
  assert.ok(session, 'entra com a senha provisória');
  const home = await get('/', session);
  assert.strictEqual(home.res.status, 302);
  assert.strictEqual(home.res.headers.get('location'), '/senha');
  assert.strictEqual((await get('/estoque', session)).res.headers.get('location'), '/senha');
  const form = await get('/senha', session);
  assert.strictEqual(form.res.status, 200);
  assert.match(form.text, /Crie a sua senha/);
  assert.doesNotMatch(form.text, /href="\/estoque"/, 'sem menu até trocar');

  assert.match(flashOf(await post('/acoes/senha', { atual: 'Provisoria123', nova: 'NovaSenha456', confirmar: 'diferente' }, session)), /confirmação/);
  assert.match(flashOf(await post('/acoes/senha', { atual: 'errada', nova: 'NovaSenha456', confirmar: 'NovaSenha456' }, session)), /atual|incorreta|inválida/i);
  const changed = await post('/acoes/senha', { atual: 'Provisoria123', nova: 'NovaSenha456', confirmar: 'NovaSenha456' }, session);
  assert.strictEqual(changed.headers.get('location'), '/');
  assert.strictEqual((await get('/estoque', session)).res.status, 200, 'agora acessa');

  // O proprietário não pode desativar a própria conta; redefinir a senha de alguém exige nova troca
  const people = (await apiJson('GET', '/api/users')).data;
  const novo = people.find(p => p.email === 'novo@loja.com');
  await post('/acoes/equipe-alterar', { id: String(novo.id), role: 'atendente', ativo: '1', password: 'OutraProvisoria1' }, owner);
  const again = await login('novo@loja.com', 'OutraProvisoria1');
  assert.strictEqual((await get('/', again)).res.headers.get('location'), '/senha');
  const me = people.find(p => p.email === 'proprietario@lojaexemplo.com.br');
  assert.match(flashOf(await post('/acoes/equipe-alterar', { id: String(me.id), ativo: '0' }, owner)), /própria conta/);

  await post('/acoes/equipe-alterar', { id: String(novo.id), ativo: '0' }, owner);
  assert.ok(!(await login('novo@loja.com', 'OutraProvisoria1')), 'desativado não entra');
});

test('Sair encerra a sessão também na API; texto malicioso é escapado; API fora do ar mostra aviso', async () => {
  const tmpSession = await login('gerente@lojaexemplo.com.br');
  const out = await post('/acoes/sair', {}, tmpSession);
  assert.strictEqual(out.headers.get('location'), '/entrar');
  assert.match(out.headers.getSetCookie().find(l => l.startsWith('painel_session=')), /Max-Age=0/);
  assert.strictEqual((await get('/', tmpSession)).res.status, 302, 'sessão antiga não vale mais');

  const evil = '<img src=x onerror=alert(1)>';
  const id = Number((await post('/acoes/veiculo-salvar', vehicleFields({ title: evil }), owner)).headers.get('location').split('/').pop());
  for (const route of ['/estoque', `/estoque/${id}`]) {
    const text = (await get(route, owner)).text;
    // Dentro de atributos entre aspas o '<' é inerte; o que importa é não haver marcação ativa fora deles.
    assert.ok(!text.replace(/="[^"]*"/g, '=""').includes('<img src=x onerror'), `${route} escapa o título`);
    assert.ok(text.includes('&lt;img src=x onerror=alert(1)&gt;'));
  }

  api.kill();
  await new Promise(resolve => setTimeout(resolve, 600));
  const down = await get('/estoque', owner);
  assert.strictEqual(down.res.status, 503);
  assert.match(down.text, /Não foi possível falar com o servidor da loja/);
});
