/**
 * server/tests/test_lote9_provisionamento.mjs
 * Provisionamento de instalação, backup cifrado com retenção e teste de restauração.
 * Roda os comandos de verdade (processos filhos), em pasta temporária.
 */
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const CLI = name => fileURLToPath(new URL(`../src/cli/${name}.js`, import.meta.url));
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'prov-'));
const client = 'auto-teste';
const dir = path.join(out, client);

function cleanEnv(extra = {}) {
  const env = { ...process.env };
  for (const key of ['DATABASE_PATH', 'DATA_DIR', 'MEDIA_DIR', 'BACKUP_DIR', 'MERCHANT_TIER', 'DATA_ENCRYPTION_KEY', 'NODE_ENV', 'ADMIN_API_KEY', 'STORE_NAME', 'STORE_CNPJ', 'CORS_ORIGINS']) delete env[key];
  return { ...env, ...extra };
}
const node = (script, args = [], env = {}) => spawnSync(process.execPath, ['--no-warnings', CLI(script), ...args], { encoding: 'utf8', env: cleanEnv(env) });
const provisionArgs = (overrides = {}) => {
  const base = {
    client, tier: '2', name: 'Auto Teste', cnpj: '12.345.678/0001-90', city: 'Brasília', uf: 'DF',
    'owner-name': 'João Teste', 'owner-email': 'joao@autoteste.com.br', origin: 'https://www.autoteste.com.br', port: '3150', out, ...overrides
  };
  return Object.entries(base).flatMap(([key, value]) => (value === null ? [] : [`--${key}`, String(value)]));
};
const readEnv = () => Object.fromEntries(fs.readFileSync(path.join(dir, '.env'), 'utf8').split('\n').filter(line => /^[A-Z_]+=/.test(line)).map(line => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]));
const hostEnv = () => ({ ...readEnv(), DATA_DIR: path.join(dir, 'data'), MEDIA_DIR: path.join(dir, 'data', 'media'), BACKUP_DIR: path.join(dir, 'backups') });

test('Provisionamento cria a instalação completa, com chaves exclusivas e proprietário com senha provisória', () => {
  const result = node('provision', provisionArgs({ addons: 'ai', quota: null }).concat(['--quota', 'ai_month=500']));
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /Senha provisória: \S+/);

  const env = readEnv();
  assert.match(env.DATA_ENCRYPTION_KEY, /^[0-9a-f]{64}$/);
  assert.ok(env.ADMIN_API_KEY.length >= 32 && env.BACKUP_PASSPHRASE.length >= 16);
  assert.strictEqual(env.MERCHANT_TIER, '2');
  assert.strictEqual(env.CORS_ORIGINS, 'https://www.autoteste.com.br');
  assert.strictEqual(env.STORE_CNPJ, '12.345.678/0001-90');
  const compose = fs.readFileSync(path.join(dir, 'docker-compose.yml'), 'utf8');
  assert.ok(compose.includes('127.0.0.1:3150:3001'));
  assert.ok(compose.includes('127.0.0.1:5150:4400') && compose.includes('PANEL_URL: https://painel.autoteste.com.br'), 'painel junto da API');
  assert.ok(compose.includes('127.0.0.1:4150:4321') && compose.includes('API_URL: http://api:3001') && compose.includes('SITE_URL: https://www.autoteste.com.br'), 'site junto da API');
  assert.ok(fs.existsSync(path.join(dir, 'backups', '.instalada-em')));

  const db = new DatabaseSync(path.join(dir, 'data', 'merchant.db'), { readOnly: true });
  const owner = db.prepare("SELECT role, tier, must_change_password, password_hash FROM users WHERE email = 'joao@autoteste.com.br'").get();
  assert.deepStrictEqual([owner.role, owner.tier, owner.must_change_password], ['proprietario', 2, 1]);
  assert.ok(!result.stdout.includes(owner.password_hash));
  assert.strictEqual(JSON.parse(db.prepare("SELECT value FROM store_settings WHERE key = 'store'").get().value).email, 'joao@autoteste.com.br');
  assert.deepStrictEqual(JSON.parse(db.prepare("SELECT value FROM store_settings WHERE key = 'addons'").get().value), ['ai']);
  assert.strictEqual(JSON.parse(db.prepare("SELECT value FROM store_settings WHERE key = 'quotas'").get().value).ai_month, 500);
  assert.strictEqual(db.prepare('SELECT COUNT(*) AS n FROM vehicles').get().n, 0, 'sem dados fictícios');
  db.close();
});

test('Provisionamento recusa pasta existente e dados inválidos, sem deixar lixo', () => {
  assert.strictEqual(node('provision', provisionArgs()).status, 1, 'pasta já existe');
  assert.strictEqual(node('provision', provisionArgs({ client: 'outro-cliente', tier: '9' })).status, 1);
  assert.strictEqual(node('provision', provisionArgs({ client: 'Maiuscula' })).status, 1);
  assert.strictEqual(node('provision', provisionArgs({ client: 'sem-cnpj', cnpj: '123' })).status, 1);
  assert.strictEqual(node('provision', provisionArgs({ client: 'sem-https', origin: 'http://x.com' })).status, 1);
  const bad = node('provision', provisionArgs({ client: 'modulo-ruim', addons: 'inexistente' }));
  assert.strictEqual(bad.status, 1);
  assert.ok(!fs.existsSync(path.join(out, 'modulo-ruim')), 'pasta removida após falha');
});

test('Backup cifrado, com retenção de 30 diários, e restauração comprovada', async () => {
  const env = hostEnv();
  // Dados reais para a prova: um cliente com CPF criptografado pela chave da instalação e uma foto
  process.env.DATA_ENCRYPTION_KEY = env.DATA_ENCRYPTION_KEY;
  const { encryptSensitive } = await import('../src/security/crypto.js');
  const db = new DatabaseSync(path.join(dir, 'data', 'merchant.db'));
  db.prepare('INSERT INTO clients (name, cpf_encrypted, phone) VALUES (?, ?, ?)').run('Cliente Backup', encryptSensitive('52998224725'), '61999990000');
  db.close();
  fs.mkdirSync(path.join(env.MEDIA_DIR, 'vehicles', '1'), { recursive: true });
  fs.writeFileSync(path.join(env.MEDIA_DIR, 'vehicles', '1', 'foto.jpg'), Buffer.alloc(2048, 7));

  // 35 backups antigos: depois do novo, devem sobrar 30
  const daily = path.join(env.BACKUP_DIR, 'daily');
  fs.mkdirSync(daily, { recursive: true });
  for (let i = 0; i < 35; i += 1) fs.writeFileSync(path.join(daily, `backup-${1990 + i}0101-000000.tar.enc`), 'x');

  const backup = node('backup', [], { ...env, NODE_ENV: 'development' });
  assert.strictEqual(backup.status, 0, backup.stdout + backup.stderr);
  const status = JSON.parse(fs.readFileSync(path.join(env.BACKUP_DIR, 'backup-status.json'), 'utf8'));
  assert.strictEqual(status.ok, true);
  assert.strictEqual(status.encrypted, true);
  assert.strictEqual(status.offsite.configured, false);
  assert.ok(status.warning.includes('apenas local'));
  const files = fs.readdirSync(daily).filter(name => name.endsWith('.enc'));
  assert.strictEqual(files.length, 30, 'retenção de 30 diários');
  assert.ok(fs.readdirSync(path.join(env.BACKUP_DIR, 'monthly')).some(name => name.endsWith('.enc')), 'cópia mensal criada');
  assert.ok(!fs.readFileSync(path.join(daily, status.file)).includes('Cliente Backup'), 'conteúdo cifrado');

  // Em produção, sem cópia externa o comando avisa com código próprio (3)
  assert.strictEqual(node('backup', [], { ...env, NODE_ENV: 'production' }).status, 3);

  const restore = node('restore-test', [path.join(daily, status.file), '--extract-to', path.join(out, 'restaurado')], env);
  assert.strictEqual(restore.status, 0, restore.stdout + restore.stderr);
  const report = JSON.parse(fs.readFileSync(path.join(env.BACKUP_DIR, 'restore-test-status.json'), 'utf8'));
  assert.strictEqual(report.ok, true);
  assert.strictEqual(report.counts.users, 1);
  assert.strictEqual(report.counts.clients, 1);
  assert.strictEqual(report.sensitiveDataReadable, true);
  assert.strictEqual(report.mediaFiles, 1);
  assert.ok(fs.existsSync(path.join(out, 'restaurado', 'merchant.db')));
  assert.ok(fs.existsSync(path.join(out, 'restaurado', 'media', 'vehicles', '1', 'foto.jpg')));

  // Sem informar o arquivo, usa o mais recente
  assert.strictEqual(node('restore-test', [], env).status, 0);
});

test('Restauração falha de forma clara com frase errada, chave errada ou arquivo adulterado', () => {
  const env = hostEnv();
  const daily = path.join(env.BACKUP_DIR, 'daily');
  const latest = fs.readdirSync(daily).filter(name => name.endsWith('.enc')).sort().at(-1);
  const file = path.join(daily, latest);

  const wrongPass = node('restore-test', [file], { ...env, BACKUP_PASSPHRASE: 'frase-errada-com-mais-de-16' });
  assert.strictEqual(wrongPass.status, 1);
  assert.match(wrongPass.stderr, /frase incorreta/);

  const wrongKey = node('restore-test', [file], { ...env, DATA_ENCRYPTION_KEY: 'a'.repeat(64) });
  assert.strictEqual(wrongKey.status, 1);
  assert.match(wrongKey.stderr, /DATA_ENCRYPTION_KEY/);

  const copy = path.join(out, 'adulterado.tar.enc');
  const bytes = fs.readFileSync(file);
  bytes[100] ^= 0xff;
  fs.writeFileSync(copy, bytes);
  const tampered = node('restore-test', [copy], env);
  assert.strictEqual(tampered.status, 1, 'arquivo adulterado não restaura');
});
