/**
 * server/src/routes/userRoutes.js
 * Equipe da loja (PN-17): criar, desativar e trocar cargo. Só o proprietário.
 */
import { getDb } from '../database/db.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { getStoreTier } from '../middlewares/tierGate.js';
import { hashPassword } from '../security/crypto.js';
import { clientIp } from '../security/http.js';
import { audit, isEmail, sendJson, validatePassword } from './util.js';

const ROLES = ['proprietario', 'gerente', 'atendente'];
const PUBLIC_FIELDS = 'id, name, email, role, active, created_at';

export async function handleUserRoutes(req, res, pathname, body) {
  const db = getDb();

  if (pathname === '/api/users' && req.method === 'GET') {
    return sendJson(res, 200, db.prepare(`SELECT ${PUBLIC_FIELDS} FROM users ORDER BY name`).all());
  }

  if (pathname === '/api/users' && req.method === 'POST') {
    const auth = authenticate(req);
    const { name, email, password, role } = body || {};
    if (!String(name || '').trim() || String(name).length > 120) return sendJson(res, 400, { error: 'Informe o nome.' });
    if (!isEmail(email)) return sendJson(res, 400, { error: 'E-mail inválido.' });
    if (!ROLES.includes(role)) return sendJson(res, 400, { error: `Cargo inválido. Permitidos: ${ROLES.join(', ')}` });
    const weak = validatePassword(password, 10);
    if (weak) return sendJson(res, 400, { error: weak });
    const normalized = email.trim().toLowerCase();
    if (db.prepare('SELECT id FROM users WHERE email = ?').get(normalized)) return sendJson(res, 409, { error: 'Já existe um usuário com este e-mail.' });

    const result = // Senha definida pelo proprietário é provisória: a pessoa troca no primeiro acesso.
    db.prepare('INSERT INTO users (name, email, password_hash, role, tier, active, must_change_password) VALUES (?, ?, ?, ?, ?, 1, 1)')
      .run(String(name).trim(), normalized, await hashPassword(password), role, getStoreTier());
    audit(auth.user, 'USUARIO_CRIADO', 'users', result.lastInsertRowid, { email: normalized, role }, clientIp(req, req.trustProxy));
    return sendJson(res, 201, { id: result.lastInsertRowid, message: 'Usuário criado.' });
  }

  const match = pathname.match(/^\/api\/users\/(\d+)$/);
  if (match && req.method === 'PATCH') {
    const auth = authenticate(req);
    const id = Number(match[1]);
    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!target) return sendJson(res, 404, { error: 'Usuário não encontrado.' });

    const { name, role, active, password } = body || {};
    if (role !== undefined && !ROLES.includes(role)) return sendJson(res, 400, { error: 'Cargo inválido.' });
    if (name !== undefined && (!String(name).trim() || String(name).length > 120)) return sendJson(res, 400, { error: 'Nome inválido.' });

    const becomesInactive = active !== undefined && !active;
    const losesOwner = target.role === 'proprietario' && target.active && ((role && role !== 'proprietario') || becomesInactive);
    if (id === auth.user.id && (becomesInactive || (role && role !== target.role))) {
      return sendJson(res, 400, { error: 'Você não pode desativar nem mudar o cargo da própria conta.' });
    }
    if (losesOwner && db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'proprietario' AND active = 1").get().n <= 1) {
      return sendJson(res, 400, { error: 'A loja precisa de pelo menos um proprietário ativo.' });
    }
    let passwordHash = null;
    if (password !== undefined) {
      const weak = validatePassword(password, 10);
      if (weak) return sendJson(res, 400, { error: weak });
      passwordHash = await hashPassword(password);
    }

    db.prepare(`UPDATE users SET name = COALESCE(?, name), role = COALESCE(?, role), active = COALESCE(?, active),
      password_hash = COALESCE(?, password_hash), must_change_password = CASE WHEN ? IS NULL THEN must_change_password ELSE 1 END, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(name !== undefined ? String(name).trim() : null, role ?? null, active !== undefined ? (active ? 1 : 0) : null, passwordHash, passwordHash, id);
    // Desativação, troca de cargo ou de senha revogam as sessões abertas.
    if (becomesInactive || (role && role !== target.role) || passwordHash) db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
    audit(auth.user, 'USUARIO_ALTERADO', 'users', id, { role, active, senhaTrocada: Boolean(passwordHash) }, clientIp(req, req.trustProxy));
    return sendJson(res, 200, { message: 'Usuário atualizado.' });
  }
  return false;
}
