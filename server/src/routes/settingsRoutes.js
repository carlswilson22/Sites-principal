/**
 * server/src/routes/settingsRoutes.js
 * Configuração da loja (PN-18). Módulos e franquias só podem ser alterados pela empresa
 * (chave ADMIN_API_KEY), nunca pelo proprietário da loja, senão ele liberaria módulos sozinho.
 */
import crypto from 'node:crypto';
import { authenticate } from '../middlewares/authMiddleware.js';
import { config } from '../config.js';
import { ALL_MODULES, addonModules, currentPackage, deleteSetting, enabledModules, readSetting, writeSetting } from '../modules.js';
import { audit, sendJson } from './util.js';
import { clientIp } from '../security/http.js';
import { getDb } from '../database/db.js';
import { vehicleUsage } from '../services/vehicleLimit.js';

const CONSENT_VERSION = '1';
const text = (value, max) => typeof value === 'string' && value.length <= max;

function adminKeyValid(req) {
  const expected = process.env.ADMIN_API_KEY || '';
  const given = String(req.headers['x-admin-key'] || '');
  if (expected.length < 16 || given.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

function publicSettings() {
  const store = { name: config.store.name, cnpj: config.store.cnpj, city: config.store.city, uf: config.store.uf, ...(readSetting('store', {}) || {}) };
  return {
    store,
    theme: readSetting('theme', {}) || {},
    package: { id: currentPackage().id, name: currentPackage().name },
    modules: enabledModules(),
    addons: addonModules(),
    simulator: readSetting('simulator', { rates: [{ name: 'Taxa padrão', monthlyRatePercent: 1.49 }] }),
    consent: { version: CONSENT_VERSION }
  };
}

function validate(body, { allowProvider }) {
  const errors = [];
  const out = {};
  const known = ['store', 'theme', 'simulator', 'commission', 'addons', 'quotas'];
  for (const key of Object.keys(body || {})) if (!known.includes(key)) errors.push(`Campo desconhecido: ${key}`);

  if (body?.store !== undefined) {
    const allowed = ['name', 'cnpj', 'whatsapp', 'phone', 'email', 'address', 'city', 'uf', 'hours', 'about', 'services'];
    const store = body.store;
    if (!store || typeof store !== 'object') errors.push('store inválido.');
    else {
      for (const [key, value] of Object.entries(store)) {
        if (!allowed.includes(key)) errors.push(`store.${key} desconhecido.`);
        else if (key === 'services') {
          const valid = Array.isArray(value) && value.length <= 8 && value.every(item => item && text(item.title, 60) && item.title.trim() && text(item.text, 400));
          if (!valid) errors.push('store.services deve ser uma lista de até 8 serviços, cada um com título (até 60) e texto (até 400 caracteres).');
        }
        else if (key === 'hours' ? (typeof value !== 'object' || value === null) : !text(value, key === 'about' ? 2000 : 200)) errors.push(`store.${key} inválido.`);
      }
      if (store.whatsapp && !/^\d{10,15}$/.test(store.whatsapp)) errors.push('store.whatsapp deve ter só números, com DDI e DDD.');
      out.store = store;
    }
  }
  if (body?.theme !== undefined) {
    const theme = body.theme;
    if (theme.primary && !/^#[0-9a-fA-F]{6}$/.test(theme.primary)) errors.push('theme.primary deve ser uma cor #RRGGBB.');
    if (theme.logoUrl && !/^(https:\/\/|\/media\/)/.test(theme.logoUrl)) errors.push('theme.logoUrl deve ser https ou /media/.');
    out.theme = { primary: theme.primary, secondary: theme.secondary, logoUrl: theme.logoUrl, name: theme.name };
  }
  if (body?.simulator !== undefined) {
    const rates = body.simulator?.rates;
    if (!Array.isArray(rates) || !rates.length || rates.length > 6 || rates.some(rate => !text(rate?.name, 60) || !(rate.monthlyRatePercent >= 0 && rate.monthlyRatePercent <= 10))) {
      errors.push('simulator.rates: de 1 a 6 taxas com nome e percentual mensal de 0 a 10.');
    } else out.simulator = { rates: rates.map(rate => ({ name: rate.name, monthlyRatePercent: Number(rate.monthlyRatePercent) })) };
  }
  if (body?.commission !== undefined) {
    const rate = body.commission?.ratePercent;
    if (rate === null) out.commission = null;
    else if (typeof rate !== 'number' || !(rate >= 0 && rate <= 100)) errors.push('commission.ratePercent deve ser um número de 0 a 100 (percentual sobre o valor da venda).');
    else out.commission = { ratePercent: rate };
  }
  if (body?.addons !== undefined || body?.quotas !== undefined) {
    if (!allowProvider) errors.push('Módulos avulsos e franquias só podem ser alterados pela empresa fornecedora.');
    else {
      if (body.addons !== undefined) {
        if (!Array.isArray(body.addons) || body.addons.some(name => !ALL_MODULES.includes(name))) errors.push('addons contém módulo desconhecido.');
        else out.addons = [...new Set(body.addons)];
      }
      if (body.quotas !== undefined) {
        if (Object.values(body.quotas || {}).some(value => !Number.isInteger(value) || value < 0)) errors.push('quotas devem ser inteiros maiores ou iguais a zero.');
        else out.quotas = body.quotas;
      }
    }
  }
  return { errors, out };
}

export async function handleSettingsRoutes(req, res, pathname, body) {
  if (pathname === '/api/settings/public' && req.method === 'GET') return sendJson(res, 200, publicSettings());

  if (pathname === '/api/settings' && req.method === 'GET') {
    return sendJson(res, 200, { ...publicSettings(), quotas: readSetting('quotas', {}), commission: readSetting('commission', null), vehicleUsage: vehicleUsage(getDb()), allModules: ALL_MODULES });
  }

  if (pathname === '/api/settings' && req.method === 'PUT') {
    const auth = authenticate(req);
    const { errors, out } = validate(body, { allowProvider: adminKeyValid(req) });
    if (errors.length) return sendJson(res, 400, { error: errors.join(' '), errors });
    for (const [key, value] of Object.entries(out)) {
      if (value === null) deleteSetting(key); else writeSetting(key, value);
    }
    audit(auth.user, 'CONFIGURACAO_ALTERADA', 'store_settings', '', { campos: Object.keys(out) }, clientIp(req, req.trustProxy));
    return sendJson(res, 200, { message: 'Configurações salvas.', ...publicSettings() });
  }
  return false;
}
