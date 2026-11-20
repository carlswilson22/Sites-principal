/**
 * Site da loja, recursos do Premium: 360°, dossiê, TCO, comparador, alerta de preço e consultor virtual.
 * Sobe uma instalação Premium (tier 3) e uma Expert (tier 2) para conferir o que muda entre elas.
 */
import test, { before, after } from 'node:test';
import assert from 'node:assert';
import net from 'node:net';
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

async function environment(tier) {
  const [apiPort, sitePort] = [await freePort(), await freePort()];
  const API = `http://127.0.0.1:${apiPort}`, SITE = `http://127.0.0.1:${sitePort}`;
  start(['server/src/index.js'], { PORT: String(apiPort), MERCHANT_TIER: String(tier), DATABASE_PATH: ':memory:', SEED_DEMO: 'true', NODE_ENV: 'development', STORE_NAME: 'Loja Teste', STORE_CITY: 'Brasília', STORE_UF: 'DF', SITE_URL: SITE });
  await until(`${API}/api/health`);
  const login = await (await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'proprietario@lojaexemplo.com.br', password: 'Admin@123456' }) })).json();
  const owner = { Authorization: `Bearer ${login.token}`, 'Content-Type': 'application/json' };
  const call = (method, route, body) => fetch(API + route, { method, headers: owner, body: body && JSON.stringify(body) });
  await call('PUT', '/api/settings', { store: { whatsapp: '5561999990000', address: 'SIA Trecho 3' } });

  const list = await (await fetch(`${API}/api/vehicles`)).json();
  const sedan = list.find(v => v.title === 'Sedan Urbano Confort');
  await call('PUT', `/api/vehicles/${sedan.id}`, { dossier: { leilao: false, sinistros: [], proprietarios: 1, dataUltimaRevisao: '03/2026' } });
  for (let i = 0; i < 9; i += 1) await call('POST', `/api/vehicles/${sedan.id}/media`, { kind: 'frame360', data: PNG });
  // Mais um carro publicado, para testar o limite de 3 na comparação
  await call('POST', '/api/vehicles', { title: 'Quarto Carro', year: '2020', price: 50000, km: 90000, transmission: 'Manual', category: 'hatch' });

  start(['sites/loja/dist/server/entry.mjs'], { PORT: String(sitePort), HOST: '127.0.0.1', API_URL: API, SITE_URL: SITE, LOJA_CACHE_MS: '0', NODE_ENV: 'production' });
  await until(`${SITE}/robots.txt`);
  return { API, SITE, owner };
}

let premium, expert;
before(async () => { [premium, expert] = [await environment(3), await environment(2)]; });
after(() => { for (const c of children) c.kill(); });

const form = (env, route, fields, cookie, extra = {}) => fetch(env.SITE + route, {
  method: 'POST', redirect: 'manual',
  headers: { Origin: env.SITE, 'Content-Type': 'application/x-www-form-urlencoded', ...(cookie ? { Cookie: cookie } : {}), ...extra },
  body: new URLSearchParams(fields).toString()
});
const page = async (env, route, cookie) => { const res = await fetch(env.SITE + route, { redirect: 'manual', headers: cookie ? { Cookie: cookie } : {} }); return { res, text: await res.text() }; };
const cookieOf = (res, name) => (res.headers.getSetCookie().find(l => l.startsWith(`${name}=`)) || '').split(';')[0];
const flashOf = res => decodeURIComponent(cookieOf(res, 'flash').slice(6));
const car = async (env, title) => (await (await fetch(`${env.API}/api/vehicles`)).json()).find(v => v.title === title);

test('Anúncio Premium: 360°, dossiê informado pela loja e custo de manutenção', async () => {
  const sedan = await car(premium, 'Sedan Urbano Confort');
  const { res, text } = await page(premium, `/veiculo/${sedan.slug}`);
  assert.strictEqual(res.status, 200);
  assert.match(text, /Veja o carro em 360°/);
  assert.match(text, /data-v360/);
  assert.match(text, /Girar o veículo/);
  assert.match(text, /Dossiê do veículo/);
  assert.match(text, /Sem registro informado/, 'leilão informado como falso');
  assert.match(text, /03\/2026/);
  assert.match(text, /Não informado/, 'campo ausente nunca vira "limpo"');
  assert.match(text, /Informações cadastradas pela loja, sem consulta automática/);
  assert.match(text, /Quanto custa manter este carro/);
  assert.match(text, /data-city="12.8"/);
  assert.match(text, /Quero uma condição melhor/);
  assert.match(text, /Comparar com outros carros/);
  assert.doesNotMatch(text, /Preço do combustível \(R\$\/litro\)<input[^>]*value=/, 'combustível não vem preenchido: o visitante informa');
});

test('Anúncio Expert não mostra nada do Premium', async () => {
  const sedan = await car(expert, 'Sedan Urbano Confort');
  const { text } = await page(expert, `/veiculo/${sedan.slug}`);
  for (const absent of [/data-v360/, /Dossiê do veículo/, /Quanto custa manter/, /Comparar com outros carros/, /Quero uma condição melhor/]) assert.doesNotMatch(text, absent);
  assert.strictEqual((await page(expert, '/comparar')).res.status, 404);
  assert.strictEqual((await page(expert, '/consultor')).res.status, 404);
  assert.doesNotMatch((await page(expert, '/')).text, /href="\/consultor"/);
});

test('Comparador: até 3 carros, destaca o menor preço e a menor quilometragem, e limpa', async () => {
  const [a, b, c, d] = await Promise.all(['Sedan Urbano Confort', 'Aventureiro Cross Pro', 'Quarto Carro'].map(t => car(premium, t)).concat([car(premium, 'Quarto Carro')]));
  const others = (await (await fetch(`${premium.API}/api/vehicles`)).json()).filter(v => ![a.id, b.id, c.id].includes(v.id));
  const add = (slug, cookie) => form(premium, '/comparar-acao', { slug, acao: 'adicionar', voltar: '/estoque' }, cookie);

  let cookie = '';
  for (const slug of [a.slug, b.slug, c.slug]) {
    const res = await add(slug, cookie);
    assert.strictEqual(res.status, 303);
    cookie = cookieOf(res, 'comparar');
  }
  assert.ok(cookie.includes(encodeURIComponent(a.slug)) && cookie.includes(encodeURIComponent(c.slug)));

  if (others.length) {
    const full = await add(others[0].slug, cookie);
    assert.match(flashOf(full), /Remova um para adicionar outro/);
    assert.ok(cookieOf(full, 'comparar').split('%2C').length <= 3, 'nunca passa de 3');
  }

  const view = await page(premium, '/comparar', cookie);
  assert.strictEqual(view.res.status, 200);
  for (const title of ['Sedan Urbano Confort', 'Aventureiro Cross Pro', 'Quarto Carro']) assert.ok(view.text.includes(title));
  assert.match(view.text, /\(menor\)/);
  assert.match(view.res.headers.get('cache-control'), /private, no-store/);
  assert.match(view.text, /href="\/comparar"[^>]*>Comparar \(3\)/, 'menu mostra a contagem');
  assert.match((await page(premium, '/estoque', cookie)).text, /Remover da comparação/);

  const removed = await form(premium, '/comparar-acao', { slug: a.slug, acao: 'remover', voltar: '/comparar' }, cookie);
  cookie = cookieOf(removed, 'comparar');
  assert.ok(!cookie.includes(encodeURIComponent(a.slug)));
  const cleared = await form(premium, '/comparar-acao', { acao: 'limpar', voltar: '/comparar' }, cookie);
  assert.match(cleared.headers.getSetCookie().find(l => l.startsWith('comparar=')), /Max-Age=0/);
  assert.match((await page(premium, '/comparar')).text, /Nenhum carro na comparação/);
  assert.strictEqual((await form(premium, '/comparar-acao', { slug: a.slug, acao: 'adicionar' }, null, { Origin: 'https://evil.example' })).status, 403);
});

test('Alerta de preço: exige conta e registra contato para a loja negociar', async () => {
  const sedan = await car(premium, 'Sedan Urbano Confort');
  const body = { vehicle_id: String(sedan.id), desired_price: '60000', consent: 'on', voltar: `/veiculo/${sedan.slug}` };

  const anon = await form(premium, '/alerta-preco', body);
  assert.match(anon.headers.get('location'), /^\/conta\/entrar\?voltar=/);

  const created = await form(premium, '/conta/criar', { name: 'Dora Cliente', email: 'dora@exemplo.com', password: 'Senha1234', consent: 'on', voltar: '/' });
  const session = cookieOf(created, 'customer_session');
  const ok = await form(premium, '/alerta-preco', body, session);
  assert.strictEqual(ok.headers.get('location'), `/veiculo/${sedan.slug}`);
  assert.match(flashOf(ok), /A loja entra em contato para negociar/);

  const leads = await (await fetch(`${premium.API}/api/leads`, { headers: premium.owner })).json();
  assert.ok((Array.isArray(leads) ? leads : leads.leads).some(l => l.email === 'dora@exemplo.com' && /condição de preço/.test(l.message || '')));

  const noConsent = await form(premium, '/alerta-preco', { ...body, consent: '' }, session);
  assert.match(flashOf(noConsent), /aviso de privacidade/);
});

test('Consultor virtual: sugere por regras, mostra o motivo e trata resultado vazio', async () => {
  assert.match((await page(premium, '/')).text, /href="\/consultor"/);
  const first = await page(premium, '/consultor');
  assert.match(first.text, /Consultor virtual/);
  assert.match(first.text, /regras simples/);
  assert.doesNotMatch(first.text, /opções para você/, 'sem perguntas respondidas, não sugere');

  const hit = await page(premium, '/consultor?orcamento=75000&uso=cidade&cambio=manual');
  assert.match(hit.text, /Sedan Urbano Confort/);
  assert.match(hit.text, /Cabe no orçamento: R\$\s?[\d.]+ abaixo do limite/);
  assert.match(hit.text, /Câmbio manual/);
  assert.doesNotMatch(hit.text, /Aventureiro Cross Pro/, 'acima do orçamento fica de fora');

  const auto = await page(premium, '/consultor?orcamento=125000&uso=familia&cambio=automatico');
  assert.doesNotMatch(auto.text, /Sedan Urbano Confort/, 'câmbio escolhido é filtro: manual não aparece para quem pediu automático');
  assert.match(auto.text, /Aventureiro Cross Pro/);

  const none = await page(premium, '/consultor?orcamento=1000');
  assert.match(none.text, /Nenhum carro do estoque cabe nesses critérios/);
  assert.match((await page(premium, '/sitemap.xml')).text, /\/consultor/);
  assert.match((await page(premium, '/privacidade')).text, /lista de carros que você escolheu comparar/);
});
