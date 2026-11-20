/**
 * Teste de ponta a ponta do site da loja: sobe a API de verdade (banco em memória, dados de demonstração)
 * e o site já compilado (npm run build -w loja), e navega como visitante.
 */
import test, { before, after } from 'node:test';
import assert from 'node:assert';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const freePort = () => new Promise(resolve => { const s = net.createServer().listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); }); });

let apiPort, sitePort, api, site, SITE, API, owner;
const children = [];

function start(args, env) {
  const child = spawn(process.execPath, ['--no-warnings', ...args], { env: { ...process.env, ...env }, stdio: 'ignore', cwd: ROOT });
  children.push(child);
  return child;
}
async function until(url, tries = 60) {
  for (let i = 0; i < tries; i += 1) {
    try { if ((await fetch(url)).status < 500) return; } catch { /* ainda subindo */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Não subiu: ${url}`);
}
const html = async (route, init) => { const res = await fetch(SITE + route, { redirect: 'manual', ...init }); return { res, text: await res.text() }; };
const asSite = { Origin: undefined };
const apiCall = (method, route, body, headers = {}) => fetch(API + route, { method, headers: { 'Content-Type': 'application/json', ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });

before(async () => {
  apiPort = await freePort(); sitePort = await freePort();
  API = `http://127.0.0.1:${apiPort}`; SITE = `http://127.0.0.1:${sitePort}`;
  api = start(['server/src/index.js'], {
    PORT: String(apiPort), MERCHANT_TIER: '2', DATABASE_PATH: ':memory:', SEED_DEMO: 'true', NODE_ENV: 'development',
    STORE_NAME: 'Loja Teste', STORE_CNPJ: '12.345.678/0001-90', STORE_CITY: 'Brasília', STORE_UF: 'DF', ADMIN_API_KEY: 'chave-do-fornecedor-1234567890'
  });
  await until(`${API}/api/health`);
  const login = await apiCall('POST', '/api/auth/login', { email: 'proprietario@lojaexemplo.com.br', password: 'Admin@123456' });
  owner = { Authorization: `Bearer ${(await login.json()).token}` };
  await apiCall('PUT', '/api/settings', {
    store: { whatsapp: '5561999990000', phone: '(61) 3333-0000', email: 'vendas@lojateste.com.br', address: 'SIA Trecho 3, Lote 10', about: 'Seminovos revisados.\nAtendimento direto com o dono.',
      hours: { seg: '09:00 às 18:00', sab: '09:00 às 13:00', dom: 'Fechado' } },
    theme: { primary: '#c8102e' }
  }, owner);
  site = start(['sites/loja/dist/server/entry.mjs'], {
    PORT: String(sitePort), HOST: '127.0.0.1', API_URL: API, SITE_URL: SITE, LOJA_CACHE_MS: '0', NODE_ENV: 'production'
  });
  await until(`${SITE}/robots.txt`);
});
after(() => { for (const child of children) child.kill(); });

test('Página inicial: loja, estoque, tema e dados estruturados', async () => {
  const { res, text } = await html('/');
  assert.strictEqual(res.status, 200);
  assert.match(text, /Seminovos em Brasília/);
  assert.match(text, /Sedan Urbano Confort|Aventureiro Cross Pro/);
  assert.match(text, /--accent:#c8102e/, 'cor da loja aplicada');
  assert.match(text, /<link rel="canonical" href="http:\/\/127\.0\.0\.1:\d+\/"/);
  assert.match(text, /"@type":"AutoDealer"/);
  assert.match(text, /wa\.me\/5561999990000/);
  assert.match(res.headers.get('content-security-policy'), /script-src 'self'/);
  assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
});

test('Estoque: busca sem acento, filtro de preço, ordenação e noindex nos filtros', async () => {
  const todos = (await html('/estoque')).text;
  assert.ok(todos.includes('Sedan Urbano Confort') && todos.includes('Aventureiro Cross Pro'));
  assert.doesNotMatch(todos, /name="robots"/, 'estoque sem filtro é indexável');

  const busca = (await html('/estoque?q=aventureiro')).text;
  assert.ok(busca.includes('Aventureiro Cross Pro') && !busca.includes('Sedan Urbano Confort'));
  assert.match(busca, /name="robots" content="noindex, follow"/);

  const barato = (await html('/estoque?ate=70000')).text;
  assert.ok(barato.includes('Sedan Urbano Confort') && !barato.includes('Aventureiro Cross Pro'), 'Sedan custa 68.900 e o SUV 89.900');
  const vazio = (await html('/estoque?q=zzzzzz')).text;
  assert.match(vazio, /Nenhum veículo encontrado/);

  const asc = (await html('/estoque?ordem=preco_asc')).text;
  assert.ok(asc.indexOf('Sedan Urbano Confort') < asc.indexOf('Aventureiro Cross Pro'));
  const desc = (await html('/estoque?ordem=preco_desc')).text;
  assert.ok(desc.indexOf('Aventureiro Cross Pro') < desc.indexOf('Sedan Urbano Confort'));
});

test('Veículo: endereço próprio, dados estruturados, simulador e contato', async () => {
  const list = await (await apiCall('GET', '/api/vehicles')).json();
  const car = list.find(v => v.title === 'Sedan Urbano Confort');
  const { res, text } = await html(`/veiculo/${car.slug}`);
  assert.strictEqual(res.status, 200);
  assert.match(text, /<h1>Sedan Urbano Confort<\/h1>/);
  assert.match(text, /"@type":"Car"/);
  assert.match(text, /"price":68900/);
  assert.match(text, /"priceCurrency":"BRL"/);
  assert.match(text, /Simule o financiamento/);
  assert.match(text, /Estimativa com as condições da loja/);
  assert.match(text, /Quero ser chamado/);
  assert.match(text, new RegExp(`<link rel="canonical" href="[^"]+/veiculo/${car.slug}"`));

  assert.strictEqual((await html('/veiculo/nao-existe-999')).res.status, 404);
  assert.strictEqual((await html('/veiculo/..%2f..%2fetc')).res.status, 404);
});

test('Veículo vendido sai do site, do estoque e do mapa do site na hora', async () => {
  const list = await (await apiCall('GET', '/api/vehicles')).json();
  const car = list.find(v => v.title === 'Aventureiro Cross Pro');
  assert.ok((await html('/sitemap.xml')).text.includes(`/veiculo/${car.slug}`));
  assert.strictEqual((await apiCall('PUT', `/api/vehicles/${car.id}`, { status: 'vendido', sale_price: 88000 }, owner)).status, 200);

  const page = await html(`/veiculo/${car.slug}`);
  assert.strictEqual(page.res.status, 404);
  assert.match(page.text, /não está mais no estoque/);
  assert.match(page.text, /noindex/);
  assert.ok(!(await html('/estoque')).text.includes('Aventureiro Cross Pro'));
  assert.ok(!(await html('/sitemap.xml')).text.includes(`/veiculo/${car.slug}`));
});

test('Formulário: registra o contato, protege contra envio de fora e contra robôs', async () => {
  const origin = { Origin: SITE, 'Content-Type': 'application/x-www-form-urlencoded' };
  const form = (extra = {}) => new URLSearchParams({ name: 'Maria Visitante', phone: '61988887777', message: 'Posso ver amanhã?', consent: 'on', source: 'site_formulario', voltar: '/contato', ...extra }).toString();

  const sent = await fetch(`${SITE}/enviar-contato`, { method: 'POST', headers: origin, body: form(), redirect: 'manual' });
  assert.strictEqual(sent.status, 303);
  assert.match(sent.headers.get('location'), /^\/contato\?enviado=1/);
  const leads = await (await apiCall('GET', '/api/leads', undefined, owner)).json();
  const list = Array.isArray(leads) ? leads : leads.leads;
  assert.ok(list.some(lead => lead.name === 'Maria Visitante' && lead.consent_lgpd === 1), 'contato chegou ao painel');

  const json = await fetch(`${SITE}/enviar-contato`, { method: 'POST', headers: { ...origin, Accept: 'application/json' }, body: form({ name: 'Joana Json' }) });
  assert.deepStrictEqual(await json.json(), { ok: true });

  const noConsent = await fetch(`${SITE}/enviar-contato`, { method: 'POST', headers: { ...origin, Accept: 'application/json' }, body: form({ consent: '' }) });
  assert.strictEqual(noConsent.status, 400);
  assert.match((await noConsent.json()).error, /aviso de privacidade/);

  const foreign = await fetch(`${SITE}/enviar-contato`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://site-malicioso.example' }, body: form() });
  assert.strictEqual(foreign.status, 403);
  const noOrigin = await fetch(`${SITE}/enviar-contato`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form() });
  assert.strictEqual(noOrigin.status, 403);

  const bot = await fetch(`${SITE}/enviar-contato`, { method: 'POST', headers: { ...origin, Accept: 'application/json' }, body: form({ name: 'Robo Spam', site: 'http://spam' }) });
  assert.strictEqual(bot.status, 200);
  const after = await (await apiCall('GET', '/api/leads', undefined, owner)).json();
  assert.ok(!(Array.isArray(after) ? after : after.leads).some(lead => lead.name === 'Robo Spam'), 'robô não registra contato');

  const evil = await fetch(`${SITE}/enviar-contato`, { method: 'POST', headers: origin, body: form({ voltar: 'https://evil.example/x' }), redirect: 'manual' });
  assert.ok(evil.headers.get('location').startsWith('/?') || evil.headers.get('location').startsWith('/'), 'redireciona só para dentro do site');
  assert.ok(!evil.headers.get('location').includes('evil.example'));
});

test('Simulador usa o preço do estoque e as taxas da loja, nunca valores do navegador', async () => {
  const list = await (await apiCall('GET', '/api/vehicles')).json();
  const car = list.find(v => v.title === 'Sedan Urbano Confort');
  const post = (body, headers = { Origin: SITE }) => fetch(`${SITE}/simular`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

  const ok = await post({ slug: car.slug, down: 10000, months: 48, rate: 0 });
  assert.strictEqual(ok.status, 200);
  const data = await ok.json();
  assert.ok(data.installment > 1000 && data.installment < 2000, `parcela plausível: ${data.installment}`);
  assert.strictEqual(data.months, 48);
  assert.strictEqual((await post({ slug: car.slug, down: 999999, months: 48, rate: 0 })).status, 400);
  assert.strictEqual((await post({ slug: car.slug, down: 0, months: 7, rate: 0 })).status, 400);
  assert.strictEqual((await post({ slug: 'nao-existe', down: 0, months: 48, rate: 0 })).status, 404);
  assert.strictEqual((await post({ slug: car.slug, down: 0, months: 48, rate: 0 }, {})).status, 403);
});

test('Sobre e contato, privacidade, robots e sitemap', async () => {
  const contato = (await html('/contato')).text;
  assert.match(contato, /Atendimento direto com o dono/);
  assert.match(contato, /SIA Trecho 3, Lote 10/);
  assert.match(contato, /Segunda/);
  assert.match(contato, /data-today="true"|data-today="false"/);
  assert.match(contato, /google\.com\/maps\/search/);

  const priv = (await html('/privacidade')).text;
  assert.match(priv, /12\.345\.678\/0001-90/);
  assert.match(priv, /não usa cookies de publicidade/);

  const robots = (await html('/robots.txt')).text;
  assert.match(robots, /Sitemap: http:\/\/127\.0\.0\.1:\d+\/sitemap\.xml/);
  const map = (await html('/sitemap.xml')).text;
  assert.match(map, /<urlset/);
  assert.match(map, /\/contato/);
});

test('Texto do estoque com código malicioso é escapado, inclusive nos dados estruturados', async () => {
  const created = await apiCall('POST', '/api/vehicles', { title: '<script>alert(1)</script> Teste', year: '2020', price: 50000, features: ['</script><img src=x onerror=alert(2)>'] }, owner);
  const { slug } = await created.json();
  const { text } = await html(`/veiculo/${slug}`);
  // Dentro de atributos entre aspas o '<' é inerte; o que importa é não haver marcação ativa fora deles.
  const outsideAttributes = text.replace(/="[^"]*"/g, '=""');
  assert.ok(!outsideAttributes.includes('<script>alert(1)'), 'título escapado');
  assert.ok(!outsideAttributes.includes('<img src=x'), 'opcional escapado');
  assert.ok(text.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'aparece como texto');
  const ld = [...text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.ok(ld.length >= 1);
  for (const block of ld) assert.doesNotThrow(() => JSON.parse(block[1]), 'JSON-LD continua válido');
});

test('Fotos e contagem: caminhos inválidos recusados, beacon aceito sem quebrar', async () => {
  assert.strictEqual((await fetch(`${SITE}/media/..%2f..%2fetc%2fpasswd`)).status, 404);
  assert.strictEqual((await fetch(`${SITE}/media/vehicles/1/arquivo.php`)).status, 404);
  assert.strictEqual((await fetch(`${SITE}/media/vehicles/1/00000000-0000-0000-0000-000000000000.jpg`)).status, 404);
  const beacon = await fetch(`${SITE}/t`, { method: 'POST', headers: { Origin: SITE, 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'whatsapp_click' }) });
  assert.strictEqual(beacon.status, 204);
});

test('Se a API sair do ar: páginas já vistas continuam, as novas mostram aviso de ajuste (503)', async () => {
  const warm = await html('/estoque');
  assert.strictEqual(warm.res.status, 200);
  api.kill();
  await new Promise(resolve => setTimeout(resolve, 600));
  const stale = await html('/estoque');
  assert.strictEqual(stale.res.status, 200, 'serve a última cópia');
  const fresh = await html('/veiculo/qualquer-outro-carro');
  assert.strictEqual(fresh.res.status, 503);
  assert.match(fresh.text, /Estamos ajustando o site/);
  assert.strictEqual(fresh.res.headers.get('retry-after'), '30');
});
