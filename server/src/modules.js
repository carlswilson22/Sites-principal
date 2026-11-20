/**
 * server/src/modules.js
 * Pacotes e módulos avulsos.
 *   - O pacote (Basic, Expert ou Premium) vem do tier e tem conteúdo fixo e padronizado.
 *   - Qualquer módulo fora do pacote pode ser contratado AVULSO (store_settings.addons),
 *     sobre qualquer pacote. Só a empresa fornecedora altera os avulsos.
 */
import { getDb } from './database/db.js';
import { getStoreTier } from './middlewares/tierGate.js';

const BASIC = ['dashboard', 'inventory', 'leads', 'financing', 'contracts', 'users', 'settings', 'customers'];
const EXPERT = [...BASIC, 'clients', 'fipe', 'financial', 'analytics', 'trade_in', 'services', 'favorites'];
const PREMIUM = [...EXPERT, 'consignments', 'contracts_adv', 'financial_full', 'market_pricing', 'funnel', 'stories', 'audit_lgpd',
  'compare', 'tco', 'dossier', 'viewer360', 'price_alert', 'virtual_consultant'];

export const PACKAGES = { 1: { id: 'basic', name: 'Basic', modules: BASIC }, 2: { id: 'expert', name: 'Expert', modules: EXPERT }, 3: { id: 'premium', name: 'Premium', modules: PREMIUM } };
export const TIER_MODULES = { 1: BASIC, 2: EXPERT, 3: PREMIUM };

// A IA não faz parte de nenhum pacote: só quem contrata o avulso a recebe.
export const ADDON_ONLY_MODULES = ['ai'];
export const ALL_MODULES = [...PREMIUM, ...ADDON_ONLY_MODULES];
// Módulos essenciais ficam sempre ativos (sem eles a loja perde o painel ou o acesso).
export const CORE_MODULES = ['dashboard', 'inventory', 'leads', 'users', 'settings', 'customers'];

export function readSetting(key, fallback = null) {
  const row = getDb().prepare('SELECT value FROM store_settings WHERE key = ?').get(key);
  if (!row) return fallback;
  try { return JSON.parse(row.value); } catch { return fallback; }
}

export function writeSetting(key, value) {
  getDb().prepare(`
    INSERT INTO store_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `).run(key, JSON.stringify(value));
}

export function deleteSetting(key) {
  getDb().prepare('DELETE FROM store_settings WHERE key = ?').run(key);
}

export const currentPackage = () => PACKAGES[getStoreTier()];

/** Módulos avulsos contratados (apenas os que existem). */
export function addonModules() {
  const addons = readSetting('addons', []);
  return Array.isArray(addons) ? addons.filter(name => ALL_MODULES.includes(name)) : [];
}

export function enabledModules() {
  return [...new Set([...CORE_MODULES, ...currentPackage().modules, ...addonModules()])];
}

export const isModuleEnabled = name => enabledModules().includes(name);
