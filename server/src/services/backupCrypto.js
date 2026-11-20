/**
 * server/src/services/backupCrypto.js
 * Criptografia dos backups antes de saírem do servidor (AES-256-GCM, chave derivada de uma frase com scrypt).
 * Formato: "UPB1" + salt(16) + iv(12) + dados cifrados + etiqueta de autenticação(16).
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';

const MAGIC = Buffer.from('UPB1');
const HEADER = 32;
const deriveKey = (passphrase, salt) => crypto.scryptSync(passphrase, salt, 32);

export async function encryptFile(source, target, passphrase) {
  if (!passphrase || passphrase.length < 16) throw new Error('BACKUP_PASSPHRASE deve ter ao menos 16 caracteres.');
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveKey(passphrase, salt), iv);
  const out = fs.createWriteStream(target);
  out.write(Buffer.concat([MAGIC, salt, iv]));
  await pipeline(fs.createReadStream(source), cipher, out, { end: false });
  await new Promise((resolve, reject) => { out.on('error', reject); out.end(cipher.getAuthTag(), resolve); });
}

export async function decryptFile(source, target, passphrase) {
  const size = fs.statSync(source).size;
  if (size < HEADER + 16) throw new Error('Arquivo de backup inválido (pequeno demais).');
  const fd = fs.openSync(source, 'r');
  const header = Buffer.alloc(HEADER), tag = Buffer.alloc(16);
  fs.readSync(fd, header, 0, HEADER, 0);
  fs.readSync(fd, tag, 0, 16, size - 16);
  fs.closeSync(fd);
  if (!header.subarray(0, 4).equals(MAGIC)) throw new Error('Arquivo de backup inválido (cabeçalho desconhecido).');
  const decipher = crypto.createDecipheriv('aes-256-gcm', deriveKey(passphrase, header.subarray(4, 20)), header.subarray(20, 32));
  decipher.setAuthTag(tag);
  try {
    await pipeline(fs.createReadStream(source, { start: HEADER, end: size - 17 }), decipher, fs.createWriteStream(target));
  } catch {
    fs.rmSync(target, { force: true });
    throw new Error('Não foi possível decifrar o backup: frase incorreta ou arquivo adulterado.');
  }
}
