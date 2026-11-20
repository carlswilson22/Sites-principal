/**
 * server/src/cli/restore-test.js
 * Prova que o backup restaura: confere a assinatura, decifra, abre o banco, roda a verificação de integridade
 * e confere se a chave de criptografia dos dados sensíveis ainda abre os dados. Opcionalmente extrai para uma pasta.
 * Uso: node --env-file=.env server/src/cli/restore-test.js [arquivo] [--extract-to pasta]
 * Sem arquivo, usa o backup diário mais recente.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

const { DATA_DIR } = await import('../database/db.js');
const { decryptFile } = await import('../services/backupCrypto.js');
const { decryptSensitive } = await import('../security/crypto.js');

const GNU_TAR = /GNU tar/.test(spawnSync('tar', ['--version'], { encoding: 'utf8' }).stdout || '');
const tar = args => spawnSync('tar', [...(GNU_TAR ? ['--force-local'] : []), ...args.map(arg => arg.replaceAll('\\', '/'))], { encoding: 'utf8' });
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(DATA_DIR, 'backups');
const args = process.argv.slice(2);
const extractIndex = args.indexOf('--extract-to');
const extractTo = extractIndex >= 0 ? args[extractIndex + 1] : null;
let file = args.find((item, i) => !item.startsWith('--') && args[i - 1] !== '--extract-to');
const report = { at: new Date().toISOString(), ok: false };
const REPORT_FILE = path.join(BACKUP_DIR, 'restore-test-status.json');
let db = null;
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'restore-test-'));

function save() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
}
function fail(message) {
  report.error = message;
  save();
  try { db?.close(); } catch { /* já fechado */ }
  try { fs.rmSync(work, { recursive: true, force: true }); } catch { /* em uso: o sistema limpa a pasta temporária depois */ }
  console.error(`FALHOU: ${message}`);
  process.exit(1);
}

try {
  if (!file) {
    const dir = path.join(BACKUP_DIR, 'daily');
    const list = fs.existsSync(dir) ? fs.readdirSync(dir).filter(name => /^backup-.*\.tar(\.enc)?$/.test(name)).sort() : [];
    if (!list.length) fail('Nenhum backup encontrado.');
    file = path.join(dir, list.at(-1));
  }
  report.file = path.basename(file);

  const sidecar = `${file}.sha256`;
  if (fs.existsSync(sidecar)) {
    const expected = fs.readFileSync(sidecar, 'utf8').split(/\s+/)[0];
    const actual = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    if (expected !== actual) fail('A assinatura (sha256) do arquivo não confere: backup corrompido.');
  }

  let tarFile = file;
  if (file.endsWith('.enc')) {
    if (!process.env.BACKUP_PASSPHRASE) fail('Backup cifrado: defina BACKUP_PASSPHRASE.');
    tarFile = path.join(work, 'backup.tar');
    try { await decryptFile(file, tarFile, process.env.BACKUP_PASSPHRASE); } catch (error) { fail(error.message); }
  }
  const out = path.join(work, 'out');
  fs.mkdirSync(out);
  const untar = tar(['-xf', tarFile, '-C', out]);
  if (untar.status !== 0) fail(`Não foi possível abrir o pacote: ${untar.stderr}`);

  const dbFile = path.join(out, 'merchant.db');
  if (!fs.existsSync(dbFile)) fail('O pacote não contém o banco de dados.');
  db = new DatabaseSync(dbFile, { readOnly: true });
  const integrity = db.prepare('PRAGMA integrity_check').get().integrity_check;
  if (integrity !== 'ok') fail(`Verificação de integridade do banco falhou: ${integrity}`);
  const count = table => { try { return db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n; } catch { return null; } };
  report.counts = { users: count('users'), vehicles: count('vehicles'), leads: count('leads'), clients: count('clients') };
  report.migrations = db.prepare('SELECT MAX(id) AS last FROM schema_migrations').get().last;

  // A chave de criptografia precisa existir fora do servidor: sem ela, CPF e dados bancários não abrem.
  const sample = db.prepare('SELECT cpf_encrypted FROM clients WHERE cpf_encrypted IS NOT NULL LIMIT 1').get();
  if (sample) {
    let opened = false;
    try {
      const plain = decryptSensitive(sample.cpf_encrypted);
      opened = Boolean(plain) && plain !== sample.cpf_encrypted && !String(plain).startsWith('[DADO_CORROMPIDO');
    } catch { opened = false; }
    if (!opened) fail('A DATA_ENCRYPTION_KEY atual não abre os dados sensíveis do backup.');
    report.sensitiveDataReadable = true;
  }
  db.close();

  const media = path.join(out, 'media.tar.gz');
  if (fs.existsSync(media)) {
    const list = tar(['-tzf', media]);
    if (list.status !== 0) fail('O arquivo de fotos do backup está corrompido.');
    report.mediaFiles = list.stdout.split('\n').filter(line => line && !line.endsWith('/')).length;
  }

  if (extractTo) {
    fs.mkdirSync(extractTo, { recursive: true });
    fs.copyFileSync(dbFile, path.join(extractTo, 'merchant.db'));
    if (fs.existsSync(media)) {
      fs.mkdirSync(path.join(extractTo, 'media'), { recursive: true });
      tar(['-xzf', media, '-C', path.join(extractTo, 'media')]);
    }
    report.extractedTo = extractTo;
  }
  report.ok = true;
  save();
  console.log(`OK: ${JSON.stringify(report)}`);
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
