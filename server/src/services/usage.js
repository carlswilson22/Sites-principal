/**
 * server/src/services/usage.js
 * Consumo de recursos com franquia (IA, consulta de placa).
 * Regra aprovada: ao esgotar a franquia o sistema CONTINUA funcionando e o excedente é registrado para cobrança.
 */
import { getDb } from '../database/db.js';
import { readSetting } from '../modules.js';

const monthStart = (now = new Date()) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

export function recordUsage(kind, units = 1, userId = null, now = new Date()) {
  getDb().prepare('INSERT INTO usage_events (kind, units, created_by, created_at) VALUES (?, ?, ?, ?)')
    .run(kind, units, userId, now.toISOString());
  // Aviso de franquia (80% e excedido): assíncrono e à prova de falha, nunca atrapalha o uso.
  import('./notifications.js').then(module => module.notifyQuota(kind, now)).catch(() => {});
}

export function usageSummary(now = new Date()) {
  const quotas = readSetting('quotas', {}) || {};
  const rows = getDb().prepare('SELECT kind, COALESCE(SUM(units), 0) AS used FROM usage_events WHERE created_at >= ? GROUP BY kind').all(monthStart(now));
  const used = Object.fromEntries(rows.map(row => [row.kind, row.used]));
  const kinds = [...new Set([...Object.keys(used), ...Object.keys(quotas).map(key => key.replace(/_month$/, ''))])];
  return kinds.map(kind => {
    const quota = Number(quotas[`${kind}_month`] ?? 0);
    const total = used[kind] || 0;
    return {
      kind,
      used: total,
      quota,
      overage: quota > 0 ? Math.max(0, total - quota) : total,
      level: quota > 0 && total >= quota ? 'excedido' : quota > 0 && total >= quota * 0.8 ? 'atencao' : 'normal'
    };
  });
}
