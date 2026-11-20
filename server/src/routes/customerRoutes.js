/**
 * server/src/routes/customerRoutes.js
 * Contas de clientes do site (SP-09, SP-15, SP-20): cadastro, login, favoritos e alerta de preço.
 * Separadas da equipe: um cliente nunca acessa o painel.
 */
import crypto from 'node:crypto';
import { getDb } from '../database/db.js';
import { hashPassword, verifyPassword } from '../security/crypto.js';
import { checkRateLimit, resetRateLimit } from '../security/rateLimiter.js';
import { clientIp, hashToken, newToken } from '../security/http.js';
import { isEmail, sendJson, validatePassword } from './util.js';

const COOKIE = 'customer_session';
const CONSENT_VERSION = '1';

function readCookie(header, name) {
  for (const part of String(header || '').split(';')) {
    const index = part.indexOf('=');
    if (index > 0 && part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return null;
}

const cookie = (value, maxAge, secure) => `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;

export function authenticateCustomer(req) {
  const token = readCookie(req.headers['cookie'], COOKIE);
  if (!token) return null;
  const row = getDb().prepare(`
    SELECT c.id, c.name, c.email, c.phone FROM customer_sessions s
    JOIN customers c ON c.id = s.customer_id
    WHERE s.token_hash = ? AND s.expires_at > ? AND c.active = 1
  `).get(hashToken(token), new Date().toISOString());
  return row || null;
}

function openSession(db, res, req, customerId) {
  const token = newToken();
  db.prepare('INSERT INTO customer_sessions (id, customer_id, token_hash, expires_at) VALUES (?, ?, ?, ?)')
    .run(crypto.randomUUID(), customerId, hashToken(token), new Date(Date.now() + 7 * 86400000).toISOString());
  res.setHeader('Set-Cookie', cookie(token, 7 * 86400, req.settings?.isProduction));
}

export async function handleCustomerRoutes(req, res, pathname, body) {
  const db = getDb();
  const ip = clientIp(req, req.trustProxy);

  if (pathname === '/api/customers/register' && req.method === 'POST') {
    const limit = checkRateLimit(`register_${ip}`, 5, 60 * 60 * 1000);
    if (!limit.allowed) return sendJson(res, 429, { error: 'Muitos cadastros. Tente mais tarde.', retryAfterSeconds: limit.retryAfterSeconds });
    const { name, email, password, phone, consent } = body || {};
    if (String(name || '').trim().length < 2 || String(name).length > 120) return sendJson(res, 400, { error: 'Informe seu nome.' });
    if (!isEmail(email)) return sendJson(res, 400, { error: 'E-mail inválido.' });
    const weak = validatePassword(password, 8);
    if (weak) return sendJson(res, 400, { error: weak });
    if (consent !== true) return sendJson(res, 400, { error: 'É necessário aceitar o aviso de privacidade para criar a conta.' });
    const normalized = email.trim().toLowerCase();
    // Mesma resposta para e-mail já usado pela equipe ou por cliente: não revela quem tem conta.
    if (db.prepare('SELECT id FROM customers WHERE email = ?').get(normalized) || db.prepare('SELECT id FROM users WHERE email = ?').get(normalized)) {
      return sendJson(res, 409, { error: 'Não foi possível criar a conta com este e-mail.' });
    }
    const result = db.prepare('INSERT INTO customers (name, email, password_hash, phone, consent_version, consent_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(String(name).trim(), normalized, await hashPassword(password), phone ? String(phone).slice(0, 30) : null, CONSENT_VERSION, new Date().toISOString());
    openSession(db, res, req, result.lastInsertRowid);
    return sendJson(res, 201, { customer: { id: result.lastInsertRowid, name: String(name).trim(), email: normalized } });
  }

  if (pathname === '/api/customers/login' && req.method === 'POST') {
    const { email, password } = body || {};
    const key = `customer_login_${ip}_${String(email || '').toLowerCase()}`;
    const limit = checkRateLimit(key, 5, 15 * 60 * 1000);
    if (!limit.allowed) return sendJson(res, 429, { error: 'Muitas tentativas. Tente novamente mais tarde.', retryAfterSeconds: limit.retryAfterSeconds });
    const customer = isEmail(email) ? db.prepare('SELECT * FROM customers WHERE email = ? AND active = 1').get(email.trim().toLowerCase()) : null;
    // Sempre calcula o hash para o tempo de resposta não revelar se o e-mail existe.
    const valid = await verifyPassword(String(password || ''), customer?.password_hash || '0:0');
    if (!customer || !valid) return sendJson(res, 401, { error: 'E-mail ou senha inválidos.' });
    resetRateLimit(key);
    openSession(db, res, req, customer.id);
    return sendJson(res, 200, { customer: { id: customer.id, name: customer.name, email: customer.email } });
  }

  if (pathname === '/api/customers/logout' && req.method === 'POST') {
    const token = readCookie(req.headers['cookie'], COOKIE);
    if (token) db.prepare('DELETE FROM customer_sessions WHERE token_hash = ?').run(hashToken(token));
    res.setHeader('Set-Cookie', cookie('', 0, req.settings?.isProduction));
    return sendJson(res, 200, { message: 'Sessão encerrada.' });
  }

  if (pathname === '/api/customers/me' && req.method === 'GET') {
    return sendJson(res, 200, { customer: authenticateCustomer(req) });
  }

  if (pathname === '/api/customers/favorites' && req.method === 'GET') {
    const customer = authenticateCustomer(req);
    const rows = db.prepare(`SELECT v.id, v.slug, v.title, v.price FROM customer_favorites f JOIN vehicles v ON v.id = f.vehicle_id
      WHERE f.customer_id = ? AND v.is_published = 1 AND v.status != 'vendido' ORDER BY f.created_at DESC`).all(customer.id);
    return sendJson(res, 200, rows);
  }

  const favorite = pathname.match(/^\/api\/customers\/favorites\/(\d+)$/);
  if (favorite) {
    const customer = authenticateCustomer(req);
    const vehicleId = Number(favorite[1]);
    if (req.method === 'PUT') {
      if (!db.prepare('SELECT id FROM vehicles WHERE id = ? AND is_published = 1').get(vehicleId)) return sendJson(res, 404, { error: 'Veículo não encontrado.' });
      db.prepare('INSERT OR IGNORE INTO customer_favorites (customer_id, vehicle_id) VALUES (?, ?)').run(customer.id, vehicleId);
      return sendJson(res, 200, { message: 'Veículo salvo nos favoritos.' });
    }
    if (req.method === 'DELETE') {
      db.prepare('DELETE FROM customer_favorites WHERE customer_id = ? AND vehicle_id = ?').run(customer.id, vehicleId);
      return sendJson(res, 200, { message: 'Veículo removido dos favoritos.' });
    }
  }

  if (pathname === '/api/price-alerts' && req.method === 'POST') {
    const customer = authenticateCustomer(req);
    const { vehicle_id: vehicleId, desired_price: desiredPrice, consent } = body || {};
    const vehicle = db.prepare('SELECT id, title FROM vehicles WHERE id = ? AND is_published = 1').get(vehicleId);
    if (!vehicle) return sendJson(res, 404, { error: 'Veículo não encontrado.' });
    if (!(Number(desiredPrice) > 0)) return sendJson(res, 400, { error: 'Informe um valor desejado válido.' });
    if (consent !== true) return sendJson(res, 400, { error: 'É necessário aceitar o aviso de privacidade.' });
    // Não monitora preço: registra um contato para a loja negociar (conforme o escopo do pacote).
    const lead = db.prepare(`INSERT INTO leads (vehicle_id, name, phone, email, source, temperature, status, message, consent_lgpd, consent_version, consent_at)
      VALUES (?, ?, ?, ?, 'site_formulario', 'morno', 'novo', ?, 1, ?, ?)`)
      .run(vehicle.id, customer.name, customer.phone || 'não informado', customer.email, `Interesse em condição de preço: R$ ${Number(desiredPrice)} em ${vehicle.title}`, CONSENT_VERSION, new Date().toISOString());
    db.prepare('INSERT INTO price_alerts (customer_id, vehicle_id, desired_price, lead_id) VALUES (?, ?, ?, ?)').run(customer.id, vehicle.id, Number(desiredPrice), lead.lastInsertRowid);
    return sendJson(res, 201, { message: 'Pedido registrado. A loja entrará em contato.' });
  }
  return false;
}
