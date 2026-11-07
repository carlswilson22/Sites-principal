/**
 * server/src/routes/leadRoutes.js
 * Endpoints do Módulo de Contatos e Leads (E6 - Nível 1)
 */
import { getDb } from '../database/db.js';
import { authenticate } from '../middlewares/authMiddleware.js';

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

  // 2. POST /api/leads - Captura de contato público (Formulário ou clique WhatsApp do site)
  if (pathname === '/api/leads' && req.method === 'POST') {
    const { vehicle_id, name, phone, email, source, simulation_data } = body || {};

    if (!name || !phone) {
      return sendJson(res, 400, { error: 'Nome e telefone são obrigatórios para registrar o contato.' });
    }

    const insert = db.prepare(`
      INSERT INTO leads (vehicle_id, name, phone, email, source, temperature, status, simulation_data, consent_lgpd)
      VALUES (?, ?, ?, ?, ?, 'morno', 'novo', ?, 1)
    `);

    const result = insert.run(
      vehicle_id || null,
      name,
      phone,
      email || null,
      source || 'site_formulario',
      simulation_data ? JSON.stringify(simulation_data) : null
    );

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
    const { status, temperature, note } = body || {};

    const validStatuses = ['novo', 'em_atendimento', 'ganho', 'perdido'];
    if (status && !validStatuses.includes(status)) {
      return sendJson(res, 400, { error: `Situação inválida. Permitidos: ${validStatuses.join(', ')}` });
    }

    db.prepare(`
      UPDATE leads SET
        status = COALESCE(?, status),
        temperature = COALESCE(?, temperature),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, temperature, id);

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

