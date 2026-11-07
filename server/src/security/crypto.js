/**
 * server/src/security/crypto.js
 * Utilitários criptográficos nativos do Node 22 para segurança de dados,
 * conformidade com LGPD e proteção de credenciais.
 */
import crypto from 'node:crypto';

// Chave padrão para desenvolvimento/demonstração (em produção vem de process.env.DATA_ENCRYPTION_KEY)
const DEFAULT_KEY_HEX = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const ENCRYPTION_KEY = Buffer.from(process.env.DATA_ENCRYPTION_KEY || DEFAULT_KEY_HEX, 'hex');
const ALGORITHM = 'aes-256-gcm';

/**
 * Gera hash seguro de senha utilizando scrypt nativo (NIST-compliant).
 * @param {string} password 
 * @returns {Promise<string>} Salt + Key em formato hex unificado
 */
export async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt.toString('hex')}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verifica se a senha em texto plano corresponde ao hash scrypt armazenado.
 * @param {string} password 
 * @param {string} storedHash 
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, storedHash) {
  return new Promise((resolve, reject) => {
    if (!storedHash || !storedHash.includes(':')) return resolve(false);
    const [saltHex, keyHex] = storedHash.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const expectedKey = Buffer.from(keyHex, 'hex');

    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(crypto.timingSafeEqual(expectedKey, derivedKey));
    });
  });
}

/**
 * Criptografa campo sensível (CPF, dados bancários) em repouso com AES-256-GCM.
 * @param {string} plaintext 
 * @returns {string} iv:tag:ciphertext
 */
export function encryptSensitive(plaintext) {
  if (!plaintext) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(String(plaintext), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decriptografa campo sensível protegido com AES-256-GCM.
 * @param {string} encryptedData iv:tag:ciphertext
 * @returns {string} Texto original
 */
export function decryptSensitive(encryptedData) {
  if (!encryptedData || typeof encryptedData !== 'string' || !encryptedData.includes(':')) {
    return encryptedData;
  }
  try {
    const [ivHex, tagHex, contentHex] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(contentHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return '[DADO_CORROMPIDO_OU_CHAVE_INVALIDA]';
  }
}

/**
 * Mascara CPF para exibição na tela protegendo a privacidade (LGPD).
 * Exemplo: 123.456.789-01 -> ***.456.789-**
 */
export function maskCPF(cpf) {
  if (!cpf) return '';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return '***.***.***-**';
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
}

/**
 * Mascara dados bancários para proteção em tela.
 * Exemplo: Conta 12345-6 -> *****-6
 */
export function maskBankData(accountNumber) {
  if (!accountNumber) return '';
  const clean = String(accountNumber).trim();
  if (clean.length <= 4) return '****';
  return `****-${clean.slice(-3)}`;
}

/**
 * Sanitiza objetos de logs para garantir que dados PII não vazem em stdout.
 */
export function sanitizeLogData(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const sensitiveKeys = ['password', 'senha', 'cpf', 'token', 'authTag', 'creditCard', 'banco'];
  const sanitized = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[CONFIDENCIAL_REMOVIDO]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
