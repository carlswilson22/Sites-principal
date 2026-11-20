/**
 * server/src/routes/mediaRoutes.js
 * Envio e entrega de fotos e quadros 360° (arquivo próprio, validado pelo conteúdo).
 */
import crypto from 'node:crypto';
import { getDb } from '../database/db.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { storage, detectImage } from '../services/storage.js';
import { audit, sendJson } from './util.js';
import { clientIp } from '../security/http.js';

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const LIMITS = { photo: 20, frame360: 72 };

export async function handleMediaRoutes(req, res, pathname, body) {
  const db = getDb();

  // Entrega pública dos arquivos
  const file = pathname.match(/^\/media\/vehicles\/(\d+)\/([a-f0-9-]{36}\.(?:jpg|png|webp))$/);
  if (file && ['GET', 'HEAD'].includes(req.method)) {
    const buffer = storage.get(`vehicles/${file[1]}/${file[2]}`);
    if (!buffer) return sendJson(res, 404, { error: 'Arquivo não encontrado.' });
    const type = detectImage(buffer)?.type || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': buffer.length, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : buffer);
    return true;
  }
  if (pathname.startsWith('/media/')) return sendJson(res, 404, { error: 'Arquivo não encontrado.' });

  const upload = pathname.match(/^\/api\/vehicles\/(\d+)\/media$/);
  if (upload && req.method === 'POST') {
    const auth = authenticate(req);
    const vehicleId = Number(upload[1]);
    if (!db.prepare('SELECT id FROM vehicles WHERE id = ?').get(vehicleId)) return sendJson(res, 404, { error: 'Veículo não encontrado.' });

    const kind = body?.kind || 'photo';
    if (!LIMITS[kind]) return sendJson(res, 400, { error: 'Tipo de mídia inválido. Use photo ou frame360.' });
    if (typeof body?.data !== 'string' || !body.data) return sendJson(res, 400, { error: 'Envie a imagem em base64 no campo data.' });
    const buffer = Buffer.from(body.data.replace(/^data:[^,]+,/, ''), 'base64');
    if (buffer.length > MAX_IMAGE_BYTES) return sendJson(res, 413, { error: 'Imagem acima de 8 MB.' });
    const image = detectImage(buffer);
    if (!image) return sendJson(res, 400, { error: 'Formato não aceito. Envie JPEG, PNG ou WebP.' });
    const count = db.prepare('SELECT COUNT(*) AS n FROM vehicle_photos WHERE vehicle_id = ? AND kind = ?').get(vehicleId, kind).n;
    if (count >= LIMITS[kind]) return sendJson(res, 400, { error: `Limite de ${LIMITS[kind]} arquivos por veículo atingido.` });

    const name = `${crypto.randomUUID()}.${image.ext}`;
    const key = `vehicles/${vehicleId}/${name}`;
    storage.put(key, buffer);
    const makeCover = kind === 'photo' && (body.is_cover === true || count === 0);
    if (makeCover) db.prepare("UPDATE vehicle_photos SET is_cover = 0 WHERE vehicle_id = ? AND kind = 'photo'").run(vehicleId);
    const result = db.prepare(`INSERT INTO vehicle_photos (vehicle_id, url, is_cover, order_index, file_size, kind, storage_key, content_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(vehicleId, `/media/${key}`, makeCover ? 1 : 0, count, buffer.length, kind, key, image.type);
    audit(auth.user, 'MIDIA_ENVIADA', 'vehicle_photos', result.lastInsertRowid, { vehicleId, kind }, clientIp(req, req.trustProxy));
    return sendJson(res, 201, { id: result.lastInsertRowid, url: `/media/${key}`, kind, is_cover: makeCover ? 1 : 0 });
  }

  const item = pathname.match(/^\/api\/vehicles\/(\d+)\/media\/(\d+)$/);
  if (item) {
    const auth = authenticate(req);
    const [vehicleId, mediaId] = [Number(item[1]), Number(item[2])];
    const row = db.prepare('SELECT * FROM vehicle_photos WHERE id = ? AND vehicle_id = ?').get(mediaId, vehicleId);
    if (!row) return sendJson(res, 404, { error: 'Mídia não encontrada.' });

    if (req.method === 'DELETE') {
      db.prepare('DELETE FROM vehicle_photos WHERE id = ?').run(mediaId);
      if (row.storage_key) storage.delete(row.storage_key);
      if (row.is_cover) {
        const next = db.prepare("SELECT id FROM vehicle_photos WHERE vehicle_id = ? AND kind = 'photo' ORDER BY order_index LIMIT 1").get(vehicleId);
        if (next) db.prepare('UPDATE vehicle_photos SET is_cover = 1 WHERE id = ?').run(next.id);
      }
      audit(auth.user, 'MIDIA_REMOVIDA', 'vehicle_photos', mediaId, { vehicleId }, clientIp(req, req.trustProxy));
      return sendJson(res, 200, { message: 'Mídia removida.' });
    }
    if (req.method === 'PATCH') {
      if (body?.order_index !== undefined && !(Number.isInteger(body.order_index) && body.order_index >= 0)) return sendJson(res, 400, { error: 'order_index inválido.' });
      if (body?.is_cover === true && row.kind === 'photo') {
        db.prepare("UPDATE vehicle_photos SET is_cover = 0 WHERE vehicle_id = ? AND kind = 'photo'").run(vehicleId);
        db.prepare('UPDATE vehicle_photos SET is_cover = 1 WHERE id = ?').run(mediaId);
      }
      if (body?.order_index !== undefined) db.prepare('UPDATE vehicle_photos SET order_index = ? WHERE id = ?').run(body.order_index, mediaId);
      return sendJson(res, 200, { message: 'Mídia atualizada.' });
    }
  }
  return false;
}
