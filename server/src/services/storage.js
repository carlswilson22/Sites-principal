/**
 * server/src/services/storage.js
 * StorageAdapter: hoje grava no disco do servidor; trocar por Cloudflare R2 sem mexer nas rotas.
 */
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from '../database/db.js';

const ROOT = path.join(process.env.MEDIA_DIR || DATA_DIR, 'media');

function resolveKey(key) {
  const target = path.resolve(ROOT, key);
  if (!target.startsWith(path.resolve(ROOT) + path.sep)) throw new Error('Caminho inválido.');
  return target;
}

export const localStorageAdapter = {
  put(key, buffer) {
    const target = resolveKey(key);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, buffer);
  },
  get(key) {
    const target = resolveKey(key);
    return fs.existsSync(target) ? fs.readFileSync(target) : null;
  },
  delete(key) {
    try { fs.rmSync(resolveKey(key), { force: true }); } catch { /* já removido */ }
  }
};

export const storage = localStorageAdapter;

/** Reconhece o formato real pelo conteúdo, não pelo que o cliente declarou. */
export function detectImage(buffer) {
  if (buffer.length > 12 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { ext: 'jpg', type: 'image/jpeg' };
  if (buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: 'png', type: 'image/png' };
  if (buffer.length > 12 && buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return { ext: 'webp', type: 'image/webp' };
  return null;
}
