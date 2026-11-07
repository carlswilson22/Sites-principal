/**
 * server/src/database/db.js
 * Gerenciador de conexão SQLite isolada por instalação utilizando Node 22 native DatabaseSync.
 */
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SCHEMA_SQL } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretório de dados exclusivo da loja
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = process.env.DATABASE_PATH || path.join(DATA_DIR, 'merchant.db');

let dbInstance = null;

/**
 * Obtém ou inicializa a instância do banco de dados SQLite.
 * @returns {DatabaseSync}
 */
export function getDb() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_FILE);
    // Inicializa o esquema de tabelas e índices
    dbInstance.exec(SCHEMA_SQL);
  }
  return dbInstance;
}

/**
 * Fecha a conexão com o banco de dados (útil em testes ou shutdown gracioso).
 */
export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
