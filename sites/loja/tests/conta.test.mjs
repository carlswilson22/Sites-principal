/**
 * Site da loja, recursos do Expert: conta do cliente, favoritos, serviços, Troca Fácil e recuperação de senha.
 * Sobe duas instalações de verdade: Expert (tier 2) e Basic (tier 1), para conferir o que aparece em cada pacote.
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

async function environment(tier) {
  const [apiPort, sitePort] = [await freePort(), await freePort()];
  const API = `http://127.0.0.1:${apiPort}`, SITE = `http://127.0.0.1:${sitePort}`;
  start(['server/src/index.js'], { PORT: String(apiPort), MERCHANT_TIER: String(tier), DATABASE_PATH: ':memory:', SEED_DEMO: 'true', NODE_ENV: 'development', STORE_NAME: 'Loja Teste', STORE_CITY: 'Brasília', STORE_UF: 'DF', SITE_URL: SITE });
  await until(`${API}/api/health`);
  const login = await (await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'proprietario@lojaexemplo.com.br', password: 'Admin@123456' }) })).json();
  const owner = { Authorization: `Bearer ${login.token}`, 'Content-Type': 'application/json' };
  await fetch(`${API}/api/settings`, { method: 'PUT', headers: owner, body: JSON.stringify({ store: {
    whatsapp: '5561999990000', phone: '(61) 3333-0000', address: 'SIA Trecho 3', hours: { seg: '09:00 às 18:00' },
    services: [{ title: 'Financiamento facilitado', text: 'Trabalhamos com as principais financeiras.' }, { title: 'Documentação', text: 'Cuidamos da transferência.' }]
  } }) });
  start(['sites/loja/dist/server/entry.mjs'], { PORT: String(sitePort), HOST: '127.0.0.1', API_URL: API, SITE_URL: SITE, LOJA_CACHE_MS: '0', NODE_ENV: 'production' });
  await until(`${SITE}/robots.txt`);
  return { API, SITE, owner };
}

let expert, basic;
before(async () => { [expert, basic] = [await environment(2), await environment(1)]; });
after(() => { for (const c of children) c.kill(); });

const form = (env, route, fields, cookie, extra = {}) => fetch(env.SITE + route, {
  method: 'POST', redirect: 'manual',
  headers: { Origin: env.SITE, 'Content-Type': 'application/x-www-form-urlencoded', ...(cookie ? { Cookie: cookie } : {}), ...extra },
  body: new URLSearchParams(fields).toString()
});
const page = async (env, route, cookie) => { const res = await fetch(env.SITE + route, { redirect: 'manual', headers: cookie ? { Cookie: cookie } : {} }); return { res, text: await res.text() }; };
const cookiesOf = res => res.headers.getSetCookie().map(line => line.split(';')[0]).join('; ');
const sessionOf = res => res.headers.getSetCookie().find(line => line.startsWith('customer_session='));
const flashOf = res => decodeURIComponent((res.headers.getSetCookie().find(line => line.startsWith('flash=')) || '').split(';')[0].slice(6));
const carSlug = async (env, title) => (await (await fetch(`${env.API}/api/vehicles`)).json()).find(v => v.title === title);

test('Serviços: lista da loja, simulador sem veículo e Troca Fácil; menu com Serviços e Entrar', async () => {
  const { res, text } = await page(expert, '/servicos');
  assert.strictEqual(res.status, 200);
  assert.match(text, /Financiamento facilitado/);
  assert.match(text, /Cuidamos da transferência/);
  assert.match(text, /Valor do veículo \(R\$\)/);
  assert.match(text, /Troca Fácil/);
  assert.match(text, /Não calcula valor e não é uma oferta|não calcula valor e não é uma oferta/i);
  assert.match(text, /href="\/servicos"/);
  assert.match(text, /href="\/conta\/entrar\?voltar=/);

  const sim = (body, headers = { Origin: expert.SITE }) => fetch(`${expert.SITE}/simular`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const ok = await sim({ price: 50000, down: 10000, months: 36, rate: 0 });
  assert.strictEqual(ok.status, 200);
  assert.ok((await ok.json()).installment > 1000);
  assert.strictEqual((await sim({ price: 10, down: 0, months: 36, rate: 0 })).status, 400);
  assert.strictEqual((await sim({ price: 50000, down: 60000, months: 36, rate: 0 })).status, 400);
});

test('Conta: cria, entra, recusa senha errada e mostra mensagens por cookie curto (nunca pela URL)', async () => {
  const weak = await form(expert, '/conta/criar', { name: 'Ana Cliente', email: 'ana@exemplo.com', password: '123', consent: 'on', voltar: '/estoque' });
  assert.strictEqual(weak.status, 303);
  assert.match(weak.headers.get('location'), /^\/conta\/entrar/);
  assert.match(flashOf(weak), /^erro\|.*senha/i);
  const shown = await page(expert, weak.headers.get('location'), cookiesOf(weak));
  assert.match(shown.text, /role="alert"/);
  assert.match(shown.text, /senha/i);
  assert.match(shown.res.headers.get('cache-control'), /no-store/, 'página com mensagem pessoal não fica em cache');

  const noConsent = await form(expert, '/conta/criar', { name: 'Ana Cliente', email: 'ana@exemplo.com', password: 'Senha1234', voltar: '/' });
  assert.match(flashOf(noConsent), /aviso de privacidade/);

  const created = await form(expert, '/conta/criar', { name: 'Ana Cliente', email: 'ana@exemplo.com', password: 'Senha1234', consent: 'on', voltar: '/estoque' });
  assert.strictEqual(created.status, 303);
  assert.strictEqual(created.headers.get('location'), '/estoque');
  const cookie = sessionOf(created);
  assert.ok(cookie && /HttpOnly/i.test(cookie) && /SameSite=Lax/i.test(cookie), 'sessão HttpOnly');
  assert.ok(!/Secure/i.test(cookie), 'site de teste é http');

  const wrong = await form(expert, '/conta/login', { email: 'ana@exemplo.com', password: 'errada123', voltar: '/' });
  assert.match(flashOf(wrong), /E-mail ou senha inválidos/);
  assert.ok(!sessionOf(wrong), 'senha errada não cria sessão');

  const ok = await form(expert, '/conta/login', { email: 'ana@exemplo.com', password: 'Senha1234', voltar: '/favoritos' });
  assert.strictEqual(ok.headers.get('location'), '/favoritos');
  assert.ok(sessionOf(ok));

  const evil = await form(expert, '/conta/login', { email: 'ana@exemplo.com', password: 'Senha1234', voltar: 'https://evil.example/x' });
  assert.strictEqual(evil.headers.get('location'), '/', 'destino externo vira a página inicial');
  assert.strictEqual((await form(expert, '/conta/login', { email: 'a@a.com', password: 'x' }, null, { Origin: 'https://evil.example' })).status, 403);
});

test('Favoritos: exige login, salva, lista, mostra o estado no anúncio e remove', async () => {
  const car = await carSlug(expert, 'Sedan Urbano Confort');
  const anon = await form(expert, '/favoritar', { vehicle_id: car.id, acao: 'salvar', voltar: `/veiculo/${car.slug}` });
  assert.match(anon.headers.get('location'), /^\/conta\/entrar\?voltar=/);
  assert.strictEqual((await page(expert, '/favoritos')).res.status, 302, 'sem login, /favoritos leva à entrada');

  const login = await form(expert, '/conta/login', { email: 'ana@exemplo.com', password: 'Senha1234', voltar: '/' });
  const session = sessionOf(login).split(';')[0];

  const before = await page(expert, `/veiculo/${car.slug}`, session);
  assert.match(before.text, /Salvar nos favoritos/);
  assert.match(before.text, />Sair</);
  assert.match(before.text, /href="\/favoritos"/);
  assert.match(before.res.headers.get('cache-control'), /private, no-store/);

  assert.strictEqual((await form(expert, '/favoritar', { vehicle_id: car.id, acao: 'salvar', voltar: `/veiculo/${car.slug}` }, session)).status, 303);
  const list = await page(expert, '/favoritos', session);
  assert.strictEqual(list.res.status, 200);
  assert.match(list.text, /Sedan Urbano Confort/);
  assert.match((await page(expert, `/veiculo/${car.slug}`, session)).text, /Remover dos favoritos/);

  await form(expert, '/favoritar', { vehicle_id: car.id, acao: 'remover', voltar: '/favoritos' }, session);
  assert.match((await page(expert, '/favoritos', session)).text, /ainda não salvou nenhum carro/);
  assert.strictEqual((await form(expert, '/favoritar', { vehicle_id: car.id, acao: 'salvar' }, session, { Origin: 'https://evil.example' })).status, 403);

  // Sair apaga a sessão no navegador e na API
  const out = await form(expert, '/conta/sair', { voltar: '/' }, session);
  assert.match(out.headers.getSetCookie().find(l => l.startsWith('customer_session=')), /Max-Age=0/);
  const me = await (await fetch(`${expert.API}/api/customers/me`, { headers: { Cookie: session } })).json();
  assert.ok(!me.customer, 'sessão encerrada também na API');
});

test('Anúncio: perguntas rápidas só com fatos da loja', async () => {
  const car = await carSlug(expert, 'Sedan Urbano Confort');
  const { text } = await page(expert, `/veiculo/${car.slug}`);
  assert.match(text, /Perguntas rápidas/);
  assert.match(text, /Este carro está disponível\?/);
  assert.match(text, /Dá para financiar\?/);
  assert.match(text, /aprovação depende da análise de crédito/);
  assert.match(text, /A loja aceita meu carro na troca\?/);
  assert.match(text, /Qual o horário de atendimento\?/);
  assert.match(text, /Segunda: 09:00 às 18:00/);
  assert.match(text, /Onde fica a loja\?/);
});

test('Troca Fácil: registra o usado como contato quente, valida e ignora robôs', async () => {
  const car = await carSlug(expert, 'Sedan Urbano Confort');
  const prefilled = await page(expert, `/servicos?veiculo=${car.slug}`);
  assert.match(prefilled.text, /Interesse em: <strong>Sedan Urbano Confort/);

  const base = { name: 'Beto Trocas', phone: '61977776666', model: 'Gol 1.0', year: '2017', km: '85.000', brand: 'VW', consent: 'on', notes: 'Único dono' };
  const ok = await form(expert, '/enviar-troca', { ...base, interest_vehicle_id: String(car.id) });
  assert.strictEqual(ok.headers.get('location'), '/servicos?enviado=troca#troca');
  assert.match((await page(expert, '/servicos?enviado=troca')).text, /Recebemos os dados do seu carro/);
  const leads = await (await fetch(`${expert.API}/api/leads`, { headers: expert.owner })).json();
  const mine = (Array.isArray(leads) ? leads : leads.leads).find(l => l.name === 'Beto Trocas');
  assert.ok(mine && mine.source === 'avaliacao_troca' && mine.temperature === 'quente');

  const badYear = await form(expert, '/enviar-troca', { ...base, name: 'Ano Ruim', year: '17' });
  assert.match(flashOf(badYear), /modelo e ano/i);
  const noConsent = await form(expert, '/enviar-troca', { ...base, name: 'Sem Aceite', consent: '' });
  assert.match(flashOf(noConsent), /aviso de privacidade/);
  await form(expert, '/enviar-troca', { ...base, name: 'Robo Troca', site: 'spam' });
  const after = await (await fetch(`${expert.API}/api/leads`, { headers: expert.owner })).json();
  assert.ok(!(Array.isArray(after) ? after : after.leads).some(l => l.name === 'Robo Troca'));
  assert.strictEqual((await form(expert, '/enviar-troca', base, null, { Origin: 'https://evil.example' })).status, 403);
});

test('Recuperar senha: resposta igual para e-mail existente e inexistente; link inválido é recusado', async () => {
  const known = await form(expert, '/conta/recuperar', { email: 'ana@exemplo.com' });
  const unknown = await form(expert, '/conta/recuperar', { email: 'ninguem@exemplo.com' });
  assert.strictEqual(flashOf(known), flashOf(unknown), 'não revela quem tem conta');
  assert.match(flashOf(known), /^ok\|Se o e-mail estiver cadastrado/);

  assert.match((await page(expert, '/redefinir-senha?token=curto')).text, /Este link não é válido/);
  const bad = await form(expert, '/conta/redefinir', { token: 'x'.repeat(30), password: 'NovaSenha123' });
  assert.match(bad.headers.get('location'), /^\/redefinir-senha\?token=/);
  assert.match(flashOf(bad), /Link inválido ou expirado/);
});

test('Pacote Basic: tem login de cliente, mas não mostra Serviços, Troca Fácil nem Favoritos', async () => {
  const home = (await page(basic, '/')).text;
  assert.match(home, /href="\/conta\/entrar/, 'cadastro e login fazem parte do Basic');
  assert.doesNotMatch(home, /href="\/servicos"/);
  assert.strictEqual((await page(basic, '/servicos')).res.status, 404);
  assert.strictEqual((await page(basic, '/conta/entrar')).res.status, 200);

  const car = await carSlug(basic, 'Sedan Urbano Confort');
  const created = await form(basic, '/conta/criar', { name: 'Caio Basic', email: 'caio@exemplo.com', password: 'Senha1234', consent: 'on', voltar: '/' });
  const session = sessionOf(created).split(';')[0];
  assert.strictEqual((await page(basic, '/favoritos', session)).res.status, 404);
  const { text } = await page(basic, `/veiculo/${car.slug}`, session);
  assert.doesNotMatch(text, /Salvar nos favoritos/);
  assert.doesNotMatch(text, /A loja aceita meu carro na troca/);
  assert.match(text, /Simule o financiamento/, 'o simulador faz parte do Basic');
});
