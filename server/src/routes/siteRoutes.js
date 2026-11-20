/**
 * server/src/routes/siteRoutes.js
 * Rotas públicas do site: métricas de acesso, avaliação de troca e resumo de consumo.
 */
import { getDb } from '../database/db.js';
import { checkRateLimit } from '../security/rateLimiter.js';
import { clientIp } from '../security/http.js';
import { sendJson } from './util.js';
import { usageSummary } from '../services/usage.js';

const EVENT_TYPES = ['page_view', 'vehicle_view', 'whatsapp_click'];
const CONSENT_VERSION = '1';

export async function handleSiteRoutes(req, res, pathname, body) {
  const db = getDb();

  // Métricas: nenhum dado pessoal (sem IP, sem nome, sem telefone)
  if (pathname === '/api/track' && req.method === 'POST') {
    const limit = checkRateLimit(`track_${clientIp(req, req.trustProxy)}`, 120, 60 * 1000);
    if (!limit.allowed) return sendJson(res, 429, { error: 'Muitos eventos.' });
    const { type, page, vehicle_id: vehicleId } = body || {};
    if (!EVENT_TYPES.includes(type)) return sendJson(res, 400, { error: 'Tipo de evento inválido.' });
    const vehicle = vehicleId != null ? Number(vehicleId) : null;
    if (vehicle !== null && !Number.isInteger(vehicle)) return sendJson(res, 400, { error: 'vehicle_id inválido.' });
    db.prepare('INSERT INTO access_events (type, page, vehicle_id, created_at) VALUES (?, ?, ?, ?)')
      .run(type, page ? String(page).slice(0, 40) : null, vehicle, new Date().toISOString());
    res.writeHead(204);
    res.end();
    return true;
  }

  // Avaliação do usado na troca (SP-13): registra lead, sem calcular oferta
  if (pathname === '/api/trade-ins' && req.method === 'POST') {
    const limit = checkRateLimit(`tradein_${clientIp(req, req.trustProxy)}`, 5, 60 * 60 * 1000);
    if (!limit.allowed) return sendJson(res, 429, { error: 'Muitos envios. Tente mais tarde.', retryAfterSeconds: limit.retryAfterSeconds });
    const { name, phone, email, vehicle, notes, interest_vehicle_id: interestId, consent } = body || {};
    const digits = String(phone || '').replace(/\D/g, '');
    if (String(name || '').trim().length < 2) return sendJson(res, 400, { error: 'Informe seu nome.' });
    if (digits.length < 10 || digits.length > 15) return sendJson(res, 400, { error: 'Informe um telefone com DDD.' });
    if (!vehicle || typeof vehicle !== 'object' || !String(vehicle.model || '').trim() || !/^\d{4}$/.test(String(vehicle.year || ''))) {
      return sendJson(res, 400, { error: 'Informe modelo e ano do veículo usado.' });
    }
    if (consent !== true) return sendJson(res, 400, { error: 'É necessário aceitar o aviso de privacidade.' });
    const data = JSON.stringify({ brand: vehicle.brand, model: vehicle.model, year: vehicle.year, km: vehicle.km, armored: Boolean(vehicle.armored) });
    if (data.length > 2000) return sendJson(res, 400, { error: 'Dados do veículo grandes demais.' });

    const lead = db.prepare(`INSERT INTO leads (vehicle_id, name, phone, email, source, temperature, status, message, consent_lgpd, consent_version, consent_at)
      VALUES (?, ?, ?, ?, 'avaliacao_troca', 'quente', 'novo', ?, 1, ?, ?)`)
      .run(Number.isInteger(interestId) ? interestId : null, String(name).trim(), String(phone).trim(), email ? String(email).trim() : null,
        notes ? String(notes).slice(0, 1000) : null, CONSENT_VERSION, new Date().toISOString());
    db.prepare('INSERT INTO trade_in_requests (lead_id, vehicle_data, notes) VALUES (?, ?, ?)').run(lead.lastInsertRowid, data, notes ? String(notes).slice(0, 1000) : null);
    return sendJson(res, 201, { id: lead.lastInsertRowid, message: 'Avaliação registrada. A loja entrará em contato.' });
  }

  if (pathname === '/api/usage' && req.method === 'GET') {
    return sendJson(res, 200, { month: new Date().toISOString().slice(0, 7), items: usageSummary() });
  }
  return false;
}
