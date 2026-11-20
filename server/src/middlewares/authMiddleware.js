/**
 * server/src/middlewares/authMiddleware.js
 * Validação de sessão via cookie HttpOnly ou Bearer Token.
 * O banco guarda apenas o HASH do token; o token em si só existe no cliente.
 */
import { getDb } from '../database/db.js';
import { hashToken } from '../security/http.js';

function readCookie(header, name) {
  for (const part of String(header || '').split(';')) {
    const index = part.indexOf('=');
    if (index > 0 && part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return null;
}

export function authenticate(req) {
  const db = getDb();

  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    token = readCookie(req.headers['cookie'], 'merchant_session');
  }

  if (!token) {
    return { authenticated: false, error: 'Sessão não fornecida ou expirada.', status: 401 };
  }

  // expires_at é gravado em ISO 8601; comparar com ISO (datetime('now') usa outro formato).
  const session = db.prepare(`
    SELECT s.id, s.user_id, s.expires_at, u.name, u.email, u.role, u.tier, u.active, u.must_change_password
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `).get(hashToken(token), new Date().toISOString());

  if (!session || !session.active) {
    return { authenticated: false, error: 'Sessão inválida, inativa ou revogada.', status: 401 };
  }

  return {
    authenticated: true,
    user: {
      id: session.user_id,
      name: session.name,
      email: session.email,
      role: session.role,
      tier: session.tier,
      mustChangePassword: Boolean(session.must_change_password)
    },
    sessionId: session.id
  };
}
