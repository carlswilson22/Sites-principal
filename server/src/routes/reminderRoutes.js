import { getDb } from '../database/db.js';
import { sendJson } from './util.js';

export async function handleReminderRoutes(req, res, pathname, body) {
  const match = pathname.match(/^\/api\/reminders\/(\d+)$/);
  if (pathname !== '/api/reminders' && !match) return false;
  const db = getDb();
  if (!match && req.method === 'GET') {
    return sendJson(res, 200, db.prepare('SELECT * FROM reminders ORDER BY due_at, id').all());
  }
  if (match && req.method === 'DELETE') {
    const result = db.prepare('DELETE FROM reminders WHERE id = ?').run(Number(match[1]));
    return sendJson(res, result.changes ? 200 : 404, result.changes ? { success: true } : { error: 'Lembrete não encontrado.' });
  }
  if ((!match && req.method === 'POST') || (match && req.method === 'PUT')) {
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const due = typeof body?.due_at === 'string' ? Date.parse(body.due_at) : NaN;
    if (!title || title.length > 200 || !Number.isFinite(due) || typeof body?.completed !== 'boolean') {
      return sendJson(res, 400, { error: 'Informe um lembrete e uma data válidos.' });
    }
    const dueAt = new Date(due).toISOString();
    let id;
    if (match) {
      id = Number(match[1]);
      const result = db.prepare('UPDATE reminders SET title = ?, due_at = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title, dueAt, Number(body.completed), id);
      if (!result.changes) return sendJson(res, 404, { error: 'Lembrete não encontrado.' });
    } else {
      id = db.prepare('INSERT INTO reminders (title, due_at, completed) VALUES (?, ?, ?)').run(title, dueAt, Number(body.completed)).lastInsertRowid;
    }
    return sendJson(res, match ? 200 : 201, db.prepare('SELECT * FROM reminders WHERE id = ?').get(id));
  }
  return false;
}
