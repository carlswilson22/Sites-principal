/**
 * server/src/database/db.js
 * Conexão SQLite isolada por instalação (node:sqlite) e execução de migrações.
 */
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { migrations } from './migrations/index.js';
import { backfillSlugs } from '../services/slug.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_FILE = process.env.DATABASE_PATH || path.join(DATA_DIR, 'merchant.db');

let dbInstance = null;

/** Aplica as migrações pendentes. Faz backup consistente do arquivo antes de alterar um banco existente. */
export function runMigrations(db, { backupDir = path.join(DATA_DIR, 'backups') } = {}) {
  db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)');
  const done = new Set(db.prepare('SELECT id FROM schema_migrations').all().map(row => row.id));
  const pending = migrations.filter(migration => !done.has(migration.id));
  if (!pending.length) return [];

  const hasData = Boolean(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get());
  const onDisk = Boolean(db.prepare('PRAGMA database_list').all().find(entry => entry.name === 'main')?.file);
  if (onDisk && hasData) {
    fs.mkdirSync(backupDir, { recursive: true });
    const target = path.join(backupDir, `pre-migracao-${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
    db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
  }

  for (const migration of pending) {
    db.exec('BEGIN');
    try {
      db.exec(migration.sql);
      db.prepare('INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)').run(migration.id, migration.name, new Date().toISOString());
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw new Error(`Migração ${migration.id} (${migration.name}) falhou e foi desfeita: ${error.message}`);
    }
  }
  return pending.map(migration => migration.id);
}

export function getDb() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_FILE);
    runMigrations(dbInstance);
  }
  return dbInstance;
}

export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
