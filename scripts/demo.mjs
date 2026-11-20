/**
 * scripts/demo.mjs — sobe uma loja de demonstração completa no seu computador: API, site público e painel,
 * com dados fictícios, fotos de exemplo geradas aqui mesmo, um 360° que gira, contatos e uma conta de cliente.
 *
 * Uso:  npm run demo                      (pacote Premium, cor vermelha)
 *       npm run demo -- --tier 2          (1 = Basic, 2 = Expert, 3 = Premium)
 *       npm run demo -- --color "#0f6cbd" --name "Minha Loja" --open
 *
 * Os dados vivem só na memória: ao parar (Ctrl+C) tudo some, e na próxima vez começa do zero.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const arg = (name, fallback) => { const i = argv.indexOf(`--${name}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback; };
const TIER = Number(arg('tier', '3'));
const COLOR = arg('color', '#c8102e');
const STORE = arg('name', 'Auto Silva Veículos');
if (![1, 2, 3].includes(TIER)) { console.error('--tier deve ser 1, 2 ou 3.'); process.exit(1); }
if (!/^#[0-9a-f]{6}$/i.test(COLOR)) { console.error('--color deve ser #RRGGBB.'); process.exit(1); }

const freePort = preferred => new Promise(resolve => {
  const probe = net.createServer();
  probe.once('error', () => { const any = net.createServer().listen(0, () => { const { port } = any.address(); any.close(() => resolve(port)); }); });
  probe.listen(preferred, () => probe.close(() => resolve(preferred)));
});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const children = [];
const run = (args, env) => { const c = spawn(process.execPath, ['--no-warnings', ...args], { cwd: ROOT, env: { ...process.env, ...env }, stdio: ['ignore', 'ignore', 'inherit'] }); children.push(c); return c; };
function stopAll() { for (const c of children) { try { c.kill(); } catch { /* já parou */ } } }
process.on('SIGINT', () => { console.log('\nParando a demonstração…'); stopAll(); process.exit(0); });
process.on('SIGTERM', () => { stopAll(); process.exit(0); });
process.on('exit', stopAll);

// ---------- compilar o que faltar ----------
for (const app of ['loja', 'painel']) {
  if (!fs.existsSync(path.join(ROOT, 'sites', app, 'dist', 'server', 'entry.mjs')) || argv.includes('--rebuild')) {
    console.log(`Compilando ${app}… (só na primeira vez)`);
    const result = spawnSync('npm', ['run', `build:${app}`], { cwd: ROOT, stdio: 'inherit', shell: true });
    if (result.status !== 0) { console.error(`Não foi possível compilar ${app}.`); process.exit(1); }
  }
}

// ---------- imagens de exemplo (PNG gerado sem dependências) ----------
const crcTable = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = buffer => { let c = -1; for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const chunk = (type, data) => { const out = Buffer.alloc(12 + data.length); out.writeUInt32BE(data.length, 0); out.write(type, 4, 'ascii'); data.copy(out, 8); out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length); return out; };
function png(width, height, pixel) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 3 + 1)] = 0;
    for (let x = 0; x < width; x += 1) { const [r, g, b] = pixel(x, y); const at = y * (width * 3 + 1) + 1 + x * 3; raw[at] = r; raw[at + 1] = g; raw[at + 2] = b; }
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0))]);
}
const hex = value => [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((v, i) => Math.round(v * (1 - t) + b[i] * t));
/** Carro estilizado visto de lado; "angle" (0–1) estreita o carro para dar a ideia de giro nos quadros do 360°. */
function carImage(body, sky, angle = 0) {
  const W = 800, H = 600, car = hex(body), top = hex(sky);
  const squash = 0.55 + 0.45 * Math.abs(Math.cos(angle * Math.PI * 2));
  const cx = 400, cy = 380, halfW = 260 * squash, bodyH = 80;
  return png(W, H, (x, y) => {
    if (y > 470) return mix([60, 64, 68], [40, 43, 46], (y - 470) / 130);
    let color = mix(top, [235, 238, 240], y / 470);
    const dx = (x - cx) / halfW;
    if (y > cy - bodyH && y < cy + bodyH * 0.45 && Math.abs(dx) < 1) color = car;
    const cabinTop = cy - bodyH - 70;
    if (y > cabinTop && y <= cy - bodyH && Math.abs(dx) < 0.55 - (cy - bodyH - y) / 260) color = mix(car, [255, 255, 255], 0.12);
    if (y > cabinTop + 12 && y < cy - bodyH - 4 && Math.abs(dx) < 0.5 - (cy - bodyH - y) / 260) color = [28, 36, 44];
    for (const wx of [-0.55, 0.55]) if ((x - (cx + wx * halfW)) ** 2 + (y - (cy + bodyH * 0.45)) ** 2 < 46 ** 2 * squash * squash + 400) color = (x - (cx + wx * halfW)) ** 2 + (y - (cy + bodyH * 0.45)) ** 2 < 20 ** 2 ? [150, 156, 160] : [18, 20, 22];
    return color;
  });
}

// ---------- subir a API ----------
const ports = { api: await freePort(3500), site: await freePort(4500), painel: await freePort(4600) };
const URL_API = `http://127.0.0.1:${ports.api}`, URL_SITE = `http://127.0.0.1:${ports.site}`, URL_PAINEL = `http://127.0.0.1:${ports.painel}`;
console.log('Subindo a API da loja…');
run(['server/src/index.js'], {
  PORT: String(ports.api), MERCHANT_TIER: String(TIER), DATABASE_PATH: ':memory:', SEED_DEMO: 'true', NODE_ENV: 'development',
  MEDIA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'demo-media-')), DATA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'demo-data-')),
  STORE_NAME: STORE, STORE_CNPJ: '12.345.678/0001-90', STORE_CITY: 'Brasília', STORE_UF: 'DF', SITE_URL: URL_SITE, CORS_ORIGINS: URL_SITE, ADMIN_API_KEY: 'demo-admin-key-1234567890'
});
for (let i = 0; i < 80; i += 1) { try { if ((await fetch(`${URL_API}/api/health`)).ok) break; } catch { /* subindo */ } await sleep(250); }

const call = async (method, route, body, headers = {}) => {
  const res = await fetch(URL_API + route, { method, headers: { 'Content-Type': 'application/json', ...headers }, body: body && JSON.stringify(body) });
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => null) };
};
const login = await call('POST', '/api/auth/login', { email: 'proprietario@lojaexemplo.com.br', password: 'Admin@123456' });
const auth = { Authorization: `Bearer ${login.data.token}` };

console.log('Cadastrando a loja, os carros e as fotos…');
await call('PUT', '/api/settings', {
  store: {
    whatsapp: '5561999990000', phone: '(61) 3333-0000', email: 'vendas@autosilva.com.br', address: 'SIA Trecho 3, Lote 10 - Guará',
    about: `A ${STORE} é uma loja de seminovos em Brasília desde 2011.\nAtendimento direto com o dono e carros com procedência conhecida.`,
    hours: { seg: '09:00 às 18:00', ter: '09:00 às 18:00', qua: '09:00 às 18:00', qui: '09:00 às 18:00', sex: '09:00 às 18:00', sab: '09:00 às 13:00', dom: 'Fechado' },
    services: [
      { title: 'Financiamento facilitado', text: 'Simulamos com as condições da loja e ajudamos você a escolher o prazo que cabe no bolso.' },
      { title: 'Documentação', text: 'Cuidamos da transferência e da documentação do seu carro.' },
      { title: 'Garantia', text: 'Todos os carros têm garantia legal. Pergunte sobre a garantia contratual de cada um.' }
    ]
  },
  theme: { primary: COLOR },
  simulator: { rates: [{ name: 'Condição A', monthlyRatePercent: 1.49 }, { name: 'Condição B', monthlyRatePercent: 1.65 }] },
  commission: { ratePercent: 1.5 }
}, auth);

const palette = [['#2b4a7a', '#7da0c8'], ['#7a2b2b', '#c88a8a'], ['#2b6a4a', '#8ac8a8'], ['#4a4a4a', '#b5b5b5'], ['#8a6a1f', '#d8c48a'], ['#3a2b6a', '#9a8ac8']];
const extra = [
  { title: 'Honda Civic EXL', version: '2.0 Flex Automático', brand: 'Honda', category: 'sedan', year: '2021/2022', km: 42000, transmission: 'Automático', fuel: 'Flex', color: 'Prata', doors: 4, engine: '2.0', power: '155 cv', price: 119900, original_price: 124900, highlight: true, features: ['Ar-condicionado', 'Direção elétrica', 'Central multimídia', 'Câmera de ré', 'Bancos em couro'], report_data: { status: 'Aprovado' } },
  { title: 'Toyota Corolla XEi', version: '2.0 Flex', brand: 'Toyota', category: 'sedan', year: '2020', km: 61000, transmission: 'Automático', fuel: 'Flex', color: 'Branco', doors: 4, price: 104900, features: ['Ar-condicionado', 'Piloto automático', 'Sensor de estacionamento'] },
  { title: 'Fiat Argo Drive', version: '1.3 Flex', brand: 'Fiat', category: 'hatch', year: '2022', km: 28000, transmission: 'Manual', fuel: 'Flex', color: 'Vermelho', doors: 4, price: 68900, features: ['Ar-condicionado', 'Direção elétrica'] },
  { title: 'Volkswagen T-Cross', version: '1.0 TSI Automático', brand: 'Volkswagen', category: 'suv', year: '2022/2023', km: 35000, transmission: 'Automático', fuel: 'Flex', color: 'Cinza', doors: 4, price: 118500, status: 'reservado', features: ['Central multimídia', 'Câmera de ré'] },
  { title: 'Chevrolet S10 LT', version: '2.8 Diesel 4x4', brand: 'Chevrolet', category: 'pickup', year: '2019', km: 88000, transmission: 'Automático', fuel: 'Diesel', color: 'Preto', doors: 4, price: 159900, features: ['Tração 4x4', 'Capota marítima'] }
];
for (const v of extra) await call('POST', '/api/vehicles', v, auth);
const vehicles = (await call('GET', '/api/vehicles?limit=200', undefined, auth)).data;
let n = 0;
for (const v of vehicles.filter(item => item.status !== 'vendido')) {
  const [body, sky] = palette[n % palette.length];
  for (let k = 0; k < 3; k += 1) {
    const image = carImage(k === 1 ? sky : body, k === 1 ? body : sky, k * 0.04);
    await call('POST', `/api/vehicles/${v.id}/media`, { kind: 'photo', data: image.toString('base64') }, auth);
  }
  n += 1;
}
if (TIER === 3) {
  const civic = vehicles.find(v => v.title === 'Honda Civic EXL');
  for (let k = 0; k < 24; k += 1) await call('POST', `/api/vehicles/${civic.id}/media`, { kind: 'frame360', data: carImage('#aab4be', '#6f8aa8', k / 24).toString('base64') }, auth);
  await call('PUT', `/api/vehicles/${civic.id}`, { dossier: { leilao: false, sinistros: [], recallPendente: false, quilometragemAutentica: true, proprietarios: 1, dataUltimaRevisao: '03/2026', cidadeRegistro: 'Brasília/DF' } }, auth);
  await call('POST', `/api/vehicles/${civic.id}/costs`, { city_consumption: 11.5, road_consumption: 14, tank_capacity: 50, avg_maintenance: 1100, annual_insurance: 3200 }, auth);
}
for (const [name, phone, message, vehicle] of [['Maria Souza', '(61) 98888-7777', 'Posso ver o carro amanhã às 10h?', vehicles[0].id], ['João Pereira', '(61) 97777-6666', 'Aceitam meu Gol 2017 na troca?', vehicles[1].id]]) {
  await call('POST', '/api/leads', { name, phone, message, consent: true, source: 'site_formulario', vehicle_id: vehicle });
}
await call('POST', '/api/customers/register', { name: 'Cliente Demo', email: 'cliente@exemplo.com', password: 'Senha1234', consent: true });

console.log('Subindo o site e o painel…');
run(['sites/loja/dist/server/entry.mjs'], { PORT: String(ports.site), HOST: '127.0.0.1', API_URL: URL_API, SITE_URL: URL_SITE, LOJA_CACHE_MS: '0', NODE_ENV: 'production' });
run(['sites/painel/dist/server/entry.mjs'], { PORT: String(ports.painel), HOST: '127.0.0.1', API_URL: URL_API, PANEL_URL: URL_PAINEL, SITE_URL: URL_SITE, NODE_ENV: 'production' });
for (const url of [`${URL_SITE}/robots.txt`, `${URL_PAINEL}/entrar`]) for (let i = 0; i < 80; i += 1) { try { if ((await fetch(url)).status < 500) break; } catch { /* subindo */ } await sleep(250); }

const pacote = ['', 'Basic', 'Expert', 'Premium'][TIER];
console.log(`
==============================================================
  ${STORE} — demonstração (pacote ${pacote})
==============================================================
  Site público   ${URL_SITE}
  Painel         ${URL_PAINEL}

  Entrar no painel (senha de todos: Admin@123456)
    proprietário  proprietario@lojaexemplo.com.br   (vê tudo)
    gerente       gerente@lojaexemplo.com.br
    atendente     atendente@lojaexemplo.com.br      (estoque e contatos)

  Conta de cliente no site: cliente@exemplo.com / Senha1234

  Experimente:
    - No painel, mude o preço de um carro ou marque um como vendido: o site reflete na hora.
    - No site, envie um contato: ele aparece no painel em Contatos.
    - Em Configurações, troque a cor principal e veja o site mudar.${TIER === 3 ? '\n    - No Honda Civic EXL do site: arraste o 360°, veja o dossiê e o custo de manutenção.' : ''}

  Os dados ficam só na memória. Pare com Ctrl+C.
==============================================================
`);
if (argv.includes('--open')) spawnSync('cmd', ['/c', 'start', '', URL_SITE], { stdio: 'ignore' });
await new Promise(() => {});
