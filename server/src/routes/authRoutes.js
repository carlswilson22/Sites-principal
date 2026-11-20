/**
 * server/src/routes/authRoutes.js
 * Endpoints de Autenticação Segura (E1)
 */
import crypto from 'node:crypto';
import { getDb } from '../database/db.js';
import { verifyPassword, hashPassword } from '../security/crypto.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkRateLimit, resetRateLimit } from '../security/rateLimiter.js';
import { clientIp, hashToken, newToken } from '../security/http.js';
import { sendEmail } from '../services/emailAdapter.js';
import { isEmail, validatePassword } from './util.js';

// Cookie de sessão: HttpOnly, SameSite=Lax (front e API no mesmo domínio raiz) e Secure em produção.
function sessionCookie(value, maxAge, secure) {
  return `merchant_session=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

export async function handleAuthRoutes(req, res, pathname, body) {
  const db = getDb();

  // POST /api/auth/login
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const ip = clientIp(req, req.trustProxy);
    const { email, password } = body || {};

    // Rate Limiting (Máx 5 tentativas por janela de 15 minutos)
    const rateCheck = checkRateLimit(`login_${ip}_${email || ''}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return sendJson(res, 429, {
        error: `Muitas tentativas de login consecutivas. Por segurança, tente novamente em ${rateCheck.retryAfterSeconds} segundos.`,
        retryAfterSeconds: rateCheck.retryAfterSeconds
      });
    }

    if (!email || !password) {
      return sendJson(res, 400, { error: 'E-mail e senha são obrigatórios.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(email);
    if (!user) {
      return sendJson(res, 401, { error: 'Credenciais inválidas.' });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return sendJson(res, 401, { error: 'Credenciais inválidas.' });
    }

    // Login bem-sucedido: reseta o contador de taxa
    resetRateLimit(`login_${ip}_${email || ''}`);

    // Sessão de 24 horas. O token vai ao cliente; o banco guarda só o hash.
    const token = newToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), user.id, tokenHash, ip, req.headers['user-agent'] || '', expiresAt);

    // Registra auditoria
    db.prepare(`
      INSERT INTO audit_logs (user_id, user_name, user_role, action, entity, details, ip_address)
      VALUES (?, ?, ?, 'login', 'auth', 'Login efetuado com sucesso', ?)
    `).run(user.id, user.name, user.role, ip);

    res.setHeader('Set-Cookie', sessionCookie(token, 86400, req.settings?.isProduction));

    return sendJson(res, 200, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        mustChangePassword: Boolean(user.must_change_password)
      }
    });
  }

  // POST /api/auth/logout
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const auth = authenticate(req);
    if (auth.authenticated && auth.sessionId) {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(auth.sessionId);
    }
    res.setHeader('Set-Cookie', sessionCookie('', 0, req.settings?.isProduction));
    return sendJson(res, 200, { message: 'Sessão encerrada com sucesso.' });
  }

  // POST /api/auth/change-password
  if (pathname === '/api/auth/change-password' && req.method === 'POST') {
    const auth = authenticate(req);
    const { current_password: current, new_password: next } = body || {};
    const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(auth.user.id);
    if (!(await verifyPassword(String(current || ''), row.password_hash))) return sendJson(res, 400, { error: 'Senha atual incorreta.' });
    const weak = validatePassword(next, 10);
    if (weak) return sendJson(res, 400, { error: weak });
    if (next === current) return sendJson(res, 400, { error: 'A nova senha deve ser diferente da atual.' });
    db.prepare('UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(await hashPassword(next), auth.user.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ? AND id != ?').run(auth.user.id, auth.sessionId);
    return sendJson(res, 200, { message: 'Senha alterada.' });
  }

  // POST /api/auth/recover (Recuperação de Senha)
  if (pathname === '/api/auth/recover' && req.method === 'POST') {
    const ip = clientIp(req, req.trustProxy);
    const limit = checkRateLimit(`recover_${ip}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      return sendJson(res, 429, { error: 'Muitas solicitações. Tente novamente mais tarde.', retryAfterSeconds: limit.retryAfterSeconds });
    }
    const GENERIC = { message: 'Se o e-mail informado estiver cadastrado, as instruções seguras de recuperação foram enviadas.' };
    const email = String(body?.email || '').trim().toLowerCase();
    if (!isEmail(email)) return sendJson(res, 200, GENERIC);

    const staff = db.prepare('SELECT id FROM users WHERE email = ? AND active = 1').get(email);
    const customer = staff ? null : db.prepare('SELECT id FROM customers WHERE email = ? AND active = 1').get(email);
    const account = staff ? { kind: 'staff', id: staff.id } : customer ? { kind: 'customer', id: customer.id } : null;
    const siteUrl = (process.env.SITE_URL || req.settings?.corsOrigins?.[0] || '').replace(/\/$/, '');
    if (account && siteUrl) {
      const token = newToken();
      db.prepare('INSERT INTO password_resets (account_kind, account_id, token_hash, expires_at) VALUES (?, ?, ?, ?)')
        .run(account.kind, account.id, hashToken(token), new Date(Date.now() + 60 * 60 * 1000).toISOString());
      await sendEmail({
        to: email,
        subject: 'Redefinição de senha',
        text: `Recebemos um pedido para redefinir sua senha.\n\nAcesse: ${siteUrl}/redefinir-senha?token=${token}\n\nO link vale por 1 hora e só pode ser usado uma vez. Se você não pediu, ignore este e-mail.`
      });
    }
    // Resposta idêntica exista ou não a conta: evita enumeração de e-mails.
    return sendJson(res, 200, GENERIC);
  }

  // POST /api/auth/reset (link de uso único, 1 hora)
  if (pathname === '/api/auth/reset' && req.method === 'POST') {
    const ip = clientIp(req, req.trustProxy);
    const limit = checkRateLimit(`reset_${ip}`, 10, 15 * 60 * 1000);
    if (!limit.allowed) return sendJson(res, 429, { error: 'Muitas tentativas. Tente novamente mais tarde.' });
    const { token, password } = body || {};
    const row = token ? db.prepare('SELECT * FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?')
      .get(hashToken(token), new Date().toISOString()) : null;
    if (!row) return sendJson(res, 400, { error: 'Link inválido ou expirado. Peça uma nova recuperação.' });
    const weak = validatePassword(password, row.account_kind === 'staff' ? 10 : 8);
    if (weak) return sendJson(res, 400, { error: weak });

    const passwordHash = await hashPassword(password);
    if (row.account_kind === 'staff') {
      db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(passwordHash, row.account_id);
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(row.account_id);
    } else {
      db.prepare('UPDATE customers SET password_hash = ? WHERE id = ?').run(passwordHash, row.account_id);
      db.prepare('DELETE FROM customer_sessions WHERE customer_id = ?').run(row.account_id);
    }
    db.prepare('UPDATE password_resets SET used_at = ? WHERE id = ?').run(new Date().toISOString(), row.id);
    db.prepare("INSERT INTO audit_logs (user_name, user_role, action, entity, entity_id, ip_address) VALUES ('Sistema', 'sistema', 'SENHA_REDEFINIDA', ?, ?, ?)")
      .run(row.account_kind, String(row.account_id), ip);
    return sendJson(res, 200, { message: 'Senha redefinida. Entre com a nova senha.' });
  }

  // GET /api/auth/me
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) {
      return sendJson(res, auth.status, { error: auth.error });
    }
    return sendJson(res, 200, { user: auth.user });
  }

  return false;
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
  return true;
}

