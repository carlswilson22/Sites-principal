/**
 * server/src/routes/util.js
 * Funções compartilhadas pelas rotas.
 */
import { getDb } from '../database/db.js';

export function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
  return true;
}

export function parseJson(value, fallback = null) {
  if (value == null || value === '') return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

export function audit(user, action, entity, entityId, details, ip) {
  try {
    getDb().prepare(`
      INSERT INTO audit_logs (user_id, user_name, user_role, action, entity, entity_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user?.id ?? null, user?.name || 'Sistema', user?.role || 'sistema', action, entity, String(entityId ?? ''),
      typeof details === 'object' ? JSON.stringify(details) : String(details || ''), ip || null);
  } catch (error) {
    console.error('[Audit Error]', error.message);
  }
}


/** Senha: tamanho mínimo, com letra e número. Máximo de 128 para evitar abuso do hash. */
export function validatePassword(password, min = 8) {
  const value = String(password || '');
  if (value.length < min || value.length > 128) return `A senha deve ter de ${min} a 128 caracteres.`;
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'A senha deve ter letras e números.';
  return null;
}

export const isEmail = value => typeof value === 'string' && value.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** Dias em estoque: dias informados na entrada + dias desde o cadastro (o campo gravado não é atualizado todo dia). */
export const daysInStockSql = (alias = '') => {
  const prefix = alias ? `${alias}.` : '';
  return `(${prefix}days_in_stock + MAX(0, CAST(julianday('now') - julianday(${prefix}created_at) AS INTEGER)))`;
};
export function effectiveDaysInStock(row) {
  const since = Math.max(0, Math.floor((Date.now() - Date.parse(String(row.created_at).replace(' ', 'T') + (String(row.created_at).includes('Z') ? '' : 'Z'))) / 86400000));
  return Number(row.days_in_stock || 0) + (Number.isFinite(since) ? since : 0);
}

export { slugify } from '../services/slug.js';
