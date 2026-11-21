/**
 * server/src/routes/leadRoutes.js
 * Endpoints do Módulo de Contatos e Leads (E6 - Nível 1)
 */
import { notifyNewLead } from '../services/notifications.js';
import { getDb } from '../database/db.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkRateLimit } from '../security/rateLimiter.js';
import { clientIp } from '../security/http.js';

const LEAD_SOURCES = ['site_formulario', 'site_whatsapp', 'simulador_financiamento', 'avaliacao_troca'];
const LEAD_TEMPERATURES = ['quente', 'morno', 'frio'];

export async function handleLeadRoutes(req, res, pathname, body) {
  const db = getDb();

  // 1. GET /api/leads - Listar contatos com busca e filtros
  if (pathname === '/api/leads' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const url = new URL(req.url, 'http://localhost');
    const search = url.searchParams.get('q') || '';
    const status = url.searchParams.get('status') || '';
    const temperature = url.searchParams.get('temperature') || '';

    let query = `
      SELECT l.*, v.title as vehicle_title, v.price as vehicle_price
      FROM leads l
      LEFT JOIN vehicles v ON v.id = l.vehicle_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (l.name LIKE ? OR l.phone LIKE ? OR l.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ` AND l.status = ?`;
      params.push(status);
    }
    if (temperature) {
      query += ` AND l.temperature = ?`;
      params.push(temperature);
    }

    query += ` ORDER BY l.created_at DESC`;
    const leads = db.prepare(query).all(...params);

    return sendJson(res, 200, leads);
  }

  // 2. POST /api/leads - Captura de contato público (formulário ou clique WhatsApp do site)
  if (pathname === '/api/leads' && req.method === 'POST') {
    const ip = clientIp(req, req.trustProxy);
    const limit = checkRateLimit(`lead_${ip}`, 10, 10 * 60 * 1000);
    if (!limit.allowed) {
      return sendJson(res, 429, { error: 'Muitos envios. Tente novamente em alguns minutos.', retryAfterSeconds: limit.retryAfterSeconds });
    }

    const { vehicle_id, name, phone, email, source, simulation_data, consent, message, marketing_source, marketing_campaign, marketing_medium } = body || {};
    const cleanName = String(name || '').trim();
    const digits = String(phone || '').replace(/\D/g, '');

    if (cleanName.length < 2 || cleanName.length > 120) {
      return sendJson(res, 400, { error: 'Informe seu nome.' });
    }
    if (digits.length < 10 || digits.length > 15) {
      return sendJson(res, 400, { error: 'Informe um telefone com DDD.' });
    }
    if (email && (String(email).length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)))) {
      return sendJson(res, 400, { error: 'E-mail inválido.' });
    }
    if (source && !LEAD_SOURCES.includes(source)) {
      return sendJson(res, 400, { error: `Origem inválida. Permitidas: ${LEAD_SOURCES.join(', ')}` });
    }
    // O consentimento precisa ser dado pelo visitante; o servidor não presume.
    if (consent !== true) {
      return sendJson(res, 400, { error: 'É necessário aceitar o aviso de privacidade para enviar o contato.' });
    }
    if (vehicle_id != null && !db.prepare('SELECT id FROM vehicles WHERE id = ?').get(vehicle_id)) {
      return sendJson(res, 400, { error: 'Veículo não encontrado.' });
    }
    if (simulation_data?.booking) {
      const booking = simulation_data.booking;
      if (!['visita', 'test_drive'].includes(booking.type) || typeof booking.starts_at !== 'string' || !Number.isFinite(Date.parse(booking.starts_at)) || Date.parse(booking.starts_at) <= Date.now()) {
        return sendJson(res, 400, { error: 'Informe um tipo de agendamento e um horário futuro válidos.' });
      }
    }
    const simulation = simulation_data ? JSON.stringify(simulation_data) : null;
    if (simulation && simulation.length > 5000) {
      return sendJson(res, 400, { error: 'Dados da simulação grandes demais.' });
    }

    const result = db.prepare(`
      INSERT INTO leads (vehicle_id, name, phone, email, source, temperature, status, simulation_data, message, consent_lgpd, consent_version, consent_at, marketing_source, marketing_campaign, marketing_medium)
      VALUES (?, ?, ?, ?, ?, 'morno', 'novo', ?, ?, 1, '1', ?, ?, ?, ?)
    `).run(vehicle_id ?? null, cleanName, String(phone).trim(), email ? String(email).trim() : null, source || 'site_formulario', simulation,
      message ? String(message).slice(0, 1000) : null, new Date().toISOString(),
      String(marketing_source || '').trim().slice(0, 120), String(marketing_campaign || '').trim().slice(0, 120), String(marketing_medium || '').trim().slice(0, 120));

    // Aviso por e-mail à loja. Não atrasa nem derruba o registro do contato; o resultado fica na trilha.
    notifyNewLead({
      id: Number(result.lastInsertRowid), name: cleanName, phone: String(phone).trim(), email: email ? String(email).trim() : null,
      source: source || 'site_formulario', message: message ? String(message).slice(0, 1000) : null, vehicleId: vehicle_id ?? null
    }).catch(() => {});

    return sendJson(res, 201, {
      id: result.lastInsertRowid,
      message: 'Contato registrado com sucesso no painel da concessionária!'
    });
  }

  // 3. PATCH /api/leads/:id/status - Atualizar situação (novo, em_atendimento, ganho, perdido)
  const leadStatusMatch = pathname.match(/^\/api\/leads\/(\d+)\/status$/);
  if (leadStatusMatch && req.method === 'PATCH') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const id = parseInt(leadStatusMatch[1], 10);
    const { status, temperature, note, next_action, next_action_at } = body || {};

    const validStatuses = ['novo', 'em_atendimento', 'ganho', 'perdido'];
    if (temperature && !LEAD_TEMPERATURES.includes(temperature)) {
      return sendJson(res, 400, { error: `Temperatura inválida. Permitidas: ${LEAD_TEMPERATURES.join(', ')}` });
    }
    if (status && !validStatuses.includes(status)) {
      return sendJson(res, 400, { error: `Situação inválida. Permitidos: ${validStatuses.join(', ')}` });
    }
    const hasAction = Object.hasOwn(body || {}, 'next_action');
    const hasDate = Object.hasOwn(body || {}, 'next_action_at');
    if (hasAction !== hasDate || (hasAction && (String(next_action || '').length > 200 || Boolean(String(next_action || '').trim()) !== Boolean(next_action_at) || (next_action_at && !Number.isFinite(Date.parse(next_action_at)))))) {
      return sendJson(res, 400, { error: 'Informe uma próxima ação e uma data válida, ou remova ambas.' });
    }
    if (!db.prepare('SELECT id FROM leads WHERE id = ?').get(id)) return sendJson(res, 404, { error: 'Contato não encontrado.' });

    db.prepare(`
      UPDATE leads SET
        status = COALESCE(?, status),
        temperature = COALESCE(?, temperature),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status || null, temperature || null, id);
    if (hasAction) db.prepare('UPDATE leads SET next_action = ?, next_action_at = ? WHERE id = ?').run(String(next_action || '').trim() || null, next_action_at ? new Date(next_action_at).toISOString() : null, id);

    // Registra no histórico (Nível 2+ se houver nota)
    if (note) {
      db.prepare(`
        INSERT INTO lead_history (lead_id, user_id, action, note)
        VALUES (?, ?, 'status_change', ?)
      `).run(id, auth.user.id, note);
    }

    return sendJson(res, 200, { message: 'Situação do contato atualizada com sucesso.' });
  }

  return false;
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
  return true;
}

