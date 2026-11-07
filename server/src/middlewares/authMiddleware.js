/**
 * server/src/middlewares/authMiddleware.js
 * Validação de sessão segura via Cookie HttpOnly ou Bearer Token.
 */
import { getDb } from '../database/db.js';

export function authenticate(req) {
  const db = getDb();

  // 1. Extrai token de Authorization Header ou Cookie
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.headers['cookie']) {
    const cookies = Object.fromEntries(
      req.headers['cookie'].split(';').map(c => c.trim().split('='))
    );
    token = cookies['merchant_session'];
  }

  if (!token) {
    return { authenticated: false, error: 'Sessão não fornecida ou expirada.', status: 401 };
  }

  // 2. Busca sessão ativa no banco
  const session = db.prepare(`
    SELECT s.id, s.user_id, s.expires_at, u.name, u.email, u.role, u.tier, u.active
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `).get(token);

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
      tier: session.tier
    },
    sessionId: session.id
  };
}
