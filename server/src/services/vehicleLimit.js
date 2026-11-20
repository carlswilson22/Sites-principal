/**
 * server/src/services/vehicleLimit.js
 * Limite de veículos publicados do pacote (Basic 40, Expert 100, Premium 250) mais blocos extras de 50 contratados.
 * O sistema NÃO bloqueia ao passar do limite: informa o excedente, que é cobrado por bloco (contrato, item 5.3).
 */
import { getStoreTier } from '../middlewares/tierGate.js';
import { readSetting } from '../modules.js';

export const PACKAGE_VEHICLE_LIMIT = { 1: 40, 2: 100, 3: 250 };
export const EXTRA_BLOCK = 50;

export function vehicleUsage(db) {
  const published = db.prepare("SELECT COUNT(*) AS n FROM vehicles WHERE is_published = 1 AND status != 'vendido'").get().n;
  const blocks = Number((readSetting('quotas', {}) || {}).vehicle_blocks || 0);
  const limit = PACKAGE_VEHICLE_LIMIT[getStoreTier()] + blocks * EXTRA_BLOCK;
  const over = Math.max(0, published - limit);
  return { published, limit, over, extraBlocksNeeded: Math.ceil(over / EXTRA_BLOCK) };
}
