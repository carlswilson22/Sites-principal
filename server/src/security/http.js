/**
 * server/src/security/http.js
 * Utilitários HTTP de segurança: IP do cliente, CORS e leitura limitada do corpo.
 */
import crypto from 'node:crypto';

/** IP do cliente. X-Forwarded-For só é aceito quando TRUST_PROXY=true (atrás do Caddy). */
export function clientIp(req, trustProxy = false) {
  if (trustProxy) {
    const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (forwarded) return forwarded;
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/** Retorna a origem se permitida, ou null. Sem lista configurada, só localhost fora de produção. */
export function allowedOrigin(origin, { corsOrigins = [], isProduction = false } = {}) {
  if (!origin) return null;
  if (corsOrigins.includes(origin)) return origin;
  if (!isProduction && !corsOrigins.length && LOCAL_ORIGIN.test(origin)) return origin;
  return null;
}

export class BodyTooLargeError extends Error {}
export class InvalidJsonError extends Error {}

export async function readJsonBody(req, maxBytes) {
  const declared = Number(req.headers['content-length'] || 0);
  if (declared > maxBytes) throw new BodyTooLargeError();
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new BodyTooLargeError();
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { throw new InvalidJsonError(); }
}

export const hashToken = token => crypto.createHash('sha256').update(String(token)).digest('hex');
export const newToken = () => crypto.randomBytes(32).toString('hex');
