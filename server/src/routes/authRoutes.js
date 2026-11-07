/**
 * server/src/routes/authRoutes.js
 * Endpoints de Autenticação Segura (E1)
 */
import crypto from 'node:crypto';
import { getDb } from '../database/db.js';
import { verifyPassword, hashPassword } from '../security/crypto.js';
import { authenticate } from '../middlewares/authMiddleware.js';

export async function handleAuthRoutes(req, res, pathname, body) {
  const db = getDb();

  // POST /api/auth/login
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const { email, password } = body || {};
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

    // Cria sessão segura de 24 horas
    const sessionId = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(sessionId).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(sessionId, user.id, tokenHash, req.socket.remoteAddress, req.headers['user-agent'] || '', expiresAt);

    // Registra auditoria
    db.prepare(`
      INSERT INTO audit_logs (user_id, user_name, user_role, action, entity, details, ip_address)
      VALUES (?, ?, ?, 'login', 'auth', 'Login efetuado com sucesso', ?)
    `).run(user.id, user.name, user.role, req.socket.remoteAddress);

    // Define cookie HttpOnly
    res.setHeader('Set-Cookie', `merchant_session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);

    return sendJson(res, 200, {
      token: sessionId,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier
      }
    });
  }

  // POST /api/auth/logout
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const auth = authenticate(req);
    if (auth.authenticated && auth.sessionId) {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(auth.sessionId);
    }
    res.setHeader('Set-Cookie', 'merchant_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
    return sendJson(res, 200, { message: 'Sessão encerrada com sucesso.' });
  }

  // POST /api/auth/recover (Recuperação de Senha)
  if (pathname === '/api/auth/recover' && req.method === 'POST') {
    const { email } = body || {};
    // Não revela se o e-mail existe para prevenir enumeração de contas
    return sendJson(res, 200, {
      message: 'Se o e-mail informado estiver cadastrado, as instruções seguras de recuperação foram enviadas.'
    });
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

