/**
 * server/src/cli/backup.js
 * Backup diário de UMA instalação: banco (VACUUM INTO, consistente) + fotos, cifrado e copiado para fora do servidor.
 * Retenção: 30 diários + 12 mensais. Resultado em backups/backup-status.json (lido pelo monitoramento).
 * Uso: node --env-file=.env server/src/cli/backup.js
 * Variáveis: BACKUP_DIR, BACKUP_PASSPHRASE (cifra), BACKUP_RCLONE_REMOTE (ex.: r2:bucket/cliente).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { assertProductionReady } from '../config.js';

assertProductionReady();
const { DATA_DIR, getDb } = await import('../database/db.js');
const { encryptFile } = await import('../services/backupCrypto.js');

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(DATA_DIR, 'backups');
const MEDIA_DIR = process.env.MEDIA_DIR || path.join(DATA_DIR, 'media');
const PASSPHRASE = process.env.BACKUP_PASSPHRASE || '';
const REMOTE = process.env.BACKUP_RCLONE_REMOTE || '';
const KEEP_DAILY = 30, KEEP_MONTHLY = 12;
const STATUS_FILE = path.join(BACKUP_DIR, 'backup-status.json');
const BACKUP_NAME = /^backup-.*\.tar(\.enc)?$/;

const stamp = (date = new Date()) => date.toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-');
// GNU tar (Linux/Git Bash) confunde "C:\pasta" com host remoto; --force-local resolve. BusyBox/bsdtar não usam a opção.
const GNU_TAR = /GNU tar/.test(spawnSync('tar', ['--version'], { encoding: 'utf8' }).stdout || '');
const toSlash = args => args.map(arg => arg.replaceAll('\\', '/'));
const run = (cmd, args) => spawnSync(cmd, cmd === 'tar' ? [...(GNU_TAR ? ['--force-local'] : []), ...toSlash(args)] : args, { encoding: 'utf8' });
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const backupsIn = dir => (fs.existsSync(dir) ? fs.readdirSync(dir).filter(name => BACKUP_NAME.test(name)).sort() : []);

function prune(dir, keep) {
  for (const name of backupsIn(dir).slice(0, -keep)) {
    fs.rmSync(path.join(dir, name), { force: true });
    fs.rmSync(path.join(dir, `${name}.sha256`), { force: true });
  }
}

const status = { at: new Date().toISOString(), ok: false, encrypted: Boolean(PASSPHRASE), offsite: { configured: Boolean(REMOTE), ok: false } };
function finish(code, extra = {}) {
  Object.assign(status, extra);
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
  console.log(JSON.stringify(status));
  process.exit(code);
}

try {
  const daily = path.join(BACKUP_DIR, 'daily'), monthly = path.join(BACKUP_DIR, 'monthly'), tmp = path.join(BACKUP_DIR, '.tmp');
  fs.rmSync(tmp, { recursive: true, force: true });
  for (const dir of [daily, monthly, tmp]) fs.mkdirSync(dir, { recursive: true });

  // 1. Banco consistente, mesmo com a loja em uso
  getDb().exec(`VACUUM INTO '${path.join(tmp, 'merchant.db').replace(/'/g, "''")}'`);

  // 2. Fotos
  const hasMedia = fs.existsSync(MEDIA_DIR) && fs.readdirSync(MEDIA_DIR).length > 0;
  if (hasMedia) {
    const tarMedia = run('tar', ['-czf', path.join(tmp, 'media.tar.gz'), '-C', MEDIA_DIR, '.']);
    if (tarMedia.status !== 0) throw new Error(`Falha ao compactar as fotos: ${tarMedia.stderr}`);
  }

  // 3. Pacote único, cifrado se houver frase
  const bundle = path.join(tmp, `backup-${stamp()}.tar`);
  const tar = run('tar', ['-cf', bundle, '-C', tmp, 'merchant.db', ...(hasMedia ? ['media.tar.gz'] : [])]);
  if (tar.status !== 0) throw new Error(`Falha ao montar o pacote: ${tar.stderr}`);
  let final = bundle;
  if (PASSPHRASE) { final = `${bundle}.enc`; await encryptFile(bundle, final, PASSPHRASE); fs.rmSync(bundle); }

  const target = path.join(daily, path.basename(final));
  fs.renameSync(final, target);
  const digest = sha256(target);
  fs.writeFileSync(`${target}.sha256`, `${digest}  ${path.basename(target)}\n`);
  fs.rmSync(tmp, { recursive: true, force: true });

  // 4. Cópia mensal e retenção
  const month = stamp().slice(0, 6);
  if (!backupsIn(monthly).some(item => item.startsWith(`backup-${month}`))) {
    fs.copyFileSync(target, path.join(monthly, path.basename(target)));
    fs.copyFileSync(`${target}.sha256`, path.join(monthly, `${path.basename(target)}.sha256`));
  }
  prune(daily, KEEP_DAILY);
  prune(monthly, KEEP_MONTHLY);
  Object.assign(status, { ok: true, file: path.basename(target), bytes: fs.statSync(target).size, sha256: digest });

  // 5. Cópia externa (outro provedor). Sem ela o backup não protege contra a perda do servidor.
  if (REMOTE) {
    const sync = run('rclone', ['sync', BACKUP_DIR, REMOTE, '--include', '{daily,monthly}/**', '--max-delete', '10']);
    status.offsite.ok = sync.status === 0;
    if (!status.offsite.ok) {
      status.offsite.error = String(sync.stderr || 'rclone indisponível ou falhou').slice(0, 300);
      finish(1, { ok: false });
    }
  }
  if (!REMOTE && process.env.NODE_ENV === 'production') finish(3, { warning: 'Backup externo não configurado (BACKUP_RCLONE_REMOTE).' });
  finish(0, REMOTE ? {} : { warning: 'Backup apenas local: configure BACKUP_RCLONE_REMOTE.' });
} catch (error) {
  finish(1, { ok: false, error: error.message });
}
