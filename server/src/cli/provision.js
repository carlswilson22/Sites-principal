/**
 * server/src/cli/provision.js
 * Cria UMA instalação nova de cliente, pronta para subir em Docker:
 *   pasta própria, .env com chaves exclusivas, banco migrado, configuração da loja, proprietário com senha provisória,
 *   docker-compose do cliente e marca de instalação (para o calendário de testes de restauração).
 *
 * Uso:
 *   node server/src/cli/provision.js --client auto-silva --tier 2 --name "Auto Silva" --cnpj 12.345.678/0001-90 \
 *     --city Brasília --uf DF --owner-name "João Silva" --owner-email joao@autosilva.com.br \
 *     --origin https://www.autosilva.com.br --port 3101 [--panel-origin https://painel.loja.com.br] [--out ./clientes] [--addons ai,fipe] [--quota ai_month=500] [--leads-email vendas@...]
 *
 * As chaves aparecem UMA vez na tela: guarde-as no cofre de senhas da empresa. Sem a DATA_ENCRYPTION_KEY,
 * os dados sensíveis de um backup não podem ser abertos.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const arg = name => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined; };
const fail = message => { console.error(`Erro: ${message}`); process.exit(1); };

const client = arg('client');
const tier = Number(arg('tier'));
const name = arg('name');
const cnpjDigits = String(arg('cnpj') || '').replace(/\D/g, '');
const city = arg('city') || '';
const uf = (arg('uf') || '').toUpperCase();
const ownerName = arg('owner-name');
const ownerEmail = (arg('owner-email') || '').toLowerCase();
const origin = arg('origin');
const panelOrigin = arg('panel-origin') || (/^https:\/\/[a-z0-9.-]+/i.test(origin || '') ? `https://painel.${new URL(origin).host.replace(/^www\./, '')}` : '');
const port = Number(arg('port') || 3101);
const outBase = path.resolve(arg('out') || './clientes');
const leadsEmail = (arg('leads-email') || ownerEmail).toLowerCase();
const addons = (arg('addons') || '').split(',').map(item => item.trim()).filter(Boolean);
const quotas = Object.fromEntries(argv.flatMap((item, i) => (item === '--quota' ? [argv[i + 1].split('=')] : [])).map(([k, v]) => [k, Number(v)]));

if (!/^[a-z0-9][a-z0-9-]{2,40}$/.test(client || '')) fail('--client deve ter de 3 a 41 caracteres: letras minúsculas, números e hífen.');
if (![1, 2, 3].includes(tier)) fail('--tier deve ser 1 (Basic), 2 (Expert) ou 3 (Premium).');
if (!name || name.length > 120) fail('--name é obrigatório.');
if (cnpjDigits.length !== 14) fail('--cnpj deve ter 14 dígitos.');
if (!ownerName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) fail('--owner-name e --owner-email são obrigatórios (e-mail válido).');
if (!/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(origin || '')) fail('--origin deve ser o endereço https do site, sem barra final. Ex.: https://www.loja.com.br');
if (!Number.isInteger(port) || port < 1024 || port > 63535) fail('--port inválida.');
if (!/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(panelOrigin)) fail('--panel-origin deve ser o endereço https do painel, sem barra final. Ex.: https://painel.loja.com.br');
if (Object.values(quotas).some(value => !Number.isInteger(value) || value < 0)) fail('--quota deve ser chave=número inteiro. Ex.: ai_month=500');

const dir = path.join(outBase, client);
if (fs.existsSync(dir) && fs.readdirSync(dir).length) fail(`A pasta ${dir} já existe e não está vazia. Nada foi alterado.`);

// Chaves exclusivas desta instalação
const encryptionKey = crypto.randomBytes(32).toString('hex');
const adminKey = crypto.randomBytes(24).toString('hex');
const backupPassphrase = crypto.randomBytes(24).toString('base64url');

for (const sub of ['data', 'data/media', 'backups']) fs.mkdirSync(path.join(dir, sub), { recursive: true });
const cnpj = cnpjDigits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

const env = [
  '# Instalação de um cliente. NUNCA versionar nem enviar ao cliente.',
  'NODE_ENV=production', 'PORT=3001', `MERCHANT_TIER=${tier}`, 'TRUST_PROXY=true',
  `CORS_ORIGINS=${origin}`, `SITE_URL=${origin}`,
  `STORE_NAME=${name}`, `STORE_CNPJ=${cnpj}`, `STORE_CITY=${city}`, `STORE_UF=${uf}`,
  `DATA_ENCRYPTION_KEY=${encryptionKey}`, `ADMIN_API_KEY=${adminKey}`,
  'DATA_DIR=/data', 'MEDIA_DIR=/data/media', 'BACKUP_DIR=/backups',
  `BACKUP_PASSPHRASE=${backupPassphrase}`, '# BACKUP_RCLONE_REMOTE=r2:bucket-da-empresa/' + client,
  '# RESEND_API_KEY=', '# EMAIL_FROM=', '# GEMINI_API_KEY=', '# PROVIDER_EMAIL=', ''
].join('\n');
fs.writeFileSync(path.join(dir, '.env'), env, { mode: 0o600 });

const compose = `# Instalação de ${name}. Subir: docker compose up -d
services:
  api:
    image: up-merchant-server:latest
    container_name: loja-${client}-api
    restart: unless-stopped
    env_file: .env
    ports: ["127.0.0.1:${port}:3001"]
    volumes: ["./data:/data", "./backups:/backups"]
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3001/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 30s
      timeout: 5s
      retries: 3
  site:
    image: up-merchant-site:latest
    container_name: loja-${client}-site
    restart: unless-stopped
    depends_on: [api]
    environment:
      API_URL: http://api:3001
      SITE_URL: ${origin}
      PORT: "4321"
      HOST: 0.0.0.0
    ports: ["127.0.0.1:${port + 1000}:4321"]
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:4321/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 30s
      timeout: 5s
      retries: 3
  painel:
    image: up-merchant-painel:latest
    container_name: loja-${client}-painel
    restart: unless-stopped
    depends_on: [api]
    environment:
      API_URL: http://api:3001
      PANEL_URL: ${panelOrigin}
      SITE_URL: ${origin}
      PORT: "4400"
      HOST: 0.0.0.0
    ports: ["127.0.0.1:${port + 2000}:4400"]
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:4400/entrar').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 30s
      timeout: 5s
      retries: 3
  backup:
    image: up-merchant-server:latest
    container_name: loja-${client}-backup
    restart: unless-stopped
    env_file: .env
    volumes: ["./data:/data", "./backups:/backups"]
    entrypoint: ["sh", "/app/deploy/backup-loop.sh"]
`;
fs.writeFileSync(path.join(dir, 'docker-compose.yml'), compose);
fs.writeFileSync(path.join(dir, 'backups', '.instalada-em'), `${Math.floor(Date.now() / 1000)}\n`);

// Banco migrado e configurado, usando o mesmo código do servidor
Object.assign(process.env, {
  NODE_ENV: 'production', MERCHANT_TIER: String(tier), DATA_ENCRYPTION_KEY: encryptionKey, CORS_ORIGINS: origin,
  STORE_NAME: name, STORE_CNPJ: cnpj, DATA_DIR: path.join(dir, 'data'), MEDIA_DIR: path.join(dir, 'data', 'media')
});
const { getDb } = await import('../database/db.js');
const { hashPassword } = await import('../security/crypto.js');
const { ALL_MODULES, writeSetting } = await import('../modules.js');
const unknown = addons.filter(item => !ALL_MODULES.includes(item));
if (unknown.length) { fs.rmSync(dir, { recursive: true, force: true }); fail(`Módulo(s) desconhecido(s): ${unknown.join(', ')}. Válidos: ${ALL_MODULES.join(', ')}`); }

const db = getDb();
writeSetting('store', { name, cnpj, city, uf, email: leadsEmail });
if (addons.length) writeSetting('addons', addons);
if (Object.keys(quotas).length) writeSetting('quotas', quotas);
const password = `${crypto.randomBytes(9).toString('base64url')}a1`;
db.prepare('INSERT INTO users (name, email, password_hash, role, tier, active, must_change_password) VALUES (?, ?, ?, ?, ?, 1, 1)')
  .run(ownerName.trim(), ownerEmail, await hashPassword(password), 'proprietario', tier);
db.close();

console.log(`\nInstalação criada em ${dir}`);
console.log(`  Pacote: ${['', 'Basic', 'Expert', 'Premium'][tier]} | porta local: ${port} | módulos avulsos: ${addons.join(', ') || 'nenhum'}`);
console.log(`  Avisos de novo contato vão para: ${leadsEmail}`);
console.log(`  Painel: ${panelOrigin} (porta local ${port + 2000}) | Site: ${origin} (porta local ${port + 1000})`);
console.log('\nGUARDE NO COFRE DE SENHAS DA EMPRESA (aparecem só agora):');
console.log(`  DATA_ENCRYPTION_KEY = ${encryptionKey}`);
console.log(`  ADMIN_API_KEY       = ${adminKey}`);
console.log(`  BACKUP_PASSPHRASE   = ${backupPassphrase}`);
console.log(`\nProprietário: ${ownerEmail}\n  Senha provisória: ${password}  (troca obrigatória no primeiro acesso)`);
console.log('\nPróximos passos: configurar BACKUP_RCLONE_REMOTE, RESEND_API_KEY e EMAIL_FROM no .env; subir com docker compose up -d;');
console.log('apontar o domínio no Caddy; testar o backup (node server/src/cli/backup.js) e a restauração (restore-test.js).');
