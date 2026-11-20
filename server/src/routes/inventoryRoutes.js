/**
 * server/src/routes/inventoryRoutes.js
 * Estoque e fotos. A consulta pública devolve só o que o site pode mostrar:
 * nunca notas internas, preço FIPE, dias parados nem tipo de propriedade.
 */
import { getDb } from '../database/db.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/rbacMiddleware.js';
import { audit, effectiveDaysInStock, parseJson, sendJson, slugify } from './util.js';
import { clientIp } from '../security/http.js';
import { enabledModules } from '../modules.js';
import { JSON_FIELDS, insertVehicle, normalizeVehicleInput } from '../services/vehicleInput.js';
import { parseStockFile } from '../services/stockImport.js';
import { vehicleUsage } from '../services/vehicleLimit.js';

const PUBLIC_COLUMNS = ['id', 'slug', 'title', 'version', 'brand', 'category', 'year', 'km', 'transmission', 'fuel', 'color', 'doors',
  'engine', 'power', 'price', 'original_price', 'highlight', 'status', 'tags', 'features', 'spec_sheet', 'report_data', 'dossier'];

function hydrate(row, { internal }) {
  if (!row) return row;
  const out = {};
  const columns = internal ? Object.keys(row) : PUBLIC_COLUMNS;
  for (const key of columns) out[key] = JSON_FIELDS.includes(key) ? parseJson(row[key], key === 'tags' || key === 'features' ? [] : null) : row[key];
  // O que o pacote não inclui não sai pela API pública, mesmo que esteja gravado no banco.
  if (!internal && !enabledModules().includes('dossier')) delete out.dossier;
  if (internal && 'days_in_stock' in row && row.created_at) out.days_in_stock = effectiveDaysInStock(row);
  // Laudo e dossiê são informados pela loja: o site não pode apresentá-los como consulta oficial.
  if (out.report_data) out.report_data = { ...out.report_data, source: 'informado_pela_loja' };
  if (out.dossier) out.dossier = { ...out.dossier, source: 'informado_pela_loja' };
  return out;
}

function mediaFor(db, vehicleId) {
  const rows = db.prepare('SELECT id, url, is_cover, order_index, kind FROM vehicle_photos WHERE vehicle_id = ? ORDER BY order_index, id').all(vehicleId);
  return { photos: rows.filter(row => row.kind === 'photo'), frames360: rows.filter(row => row.kind === 'frame360') };
}

export async function handleInventoryRoutes(req, res, pathname, body) {
  const db = getDb();

  // GET /api/vehicles - lista (pública filtrada; equipe vê tudo)
  if (pathname === '/api/vehicles' && req.method === 'GET') {
    const staff = authenticate(req).authenticated;
    const url = new URL(req.url, 'http://localhost');
    const search = url.searchParams.get('q') || '';
    const params = [];
    let query = `SELECT v.*,
      (SELECT url FROM vehicle_photos WHERE vehicle_id = v.id AND kind = 'photo' AND is_cover = 1 LIMIT 1) AS cover_photo,
      (SELECT COUNT(*) FROM vehicle_photos WHERE vehicle_id = v.id AND kind = 'photo') AS photos_count
      FROM vehicles v WHERE 1=1`;
    if (!staff) query += " AND v.is_published = 1 AND v.status != 'vendido'";
    if (search) { query += ' AND (v.title LIKE ? OR v.version LIKE ? OR v.color LIKE ? OR v.brand LIKE ?)'; params.push(...Array(4).fill(`%${search}%`)); }
    for (const [name, column] of [['status', 'status'], ['category', 'category'], ['brand', 'brand']]) {
      const value = url.searchParams.get(name);
      if (value) { query += ` AND v.${column} = ?`; params.push(value); }
    }
    if (staff) {
      const ownership = url.searchParams.get('ownership');
      if (ownership) { query += ' AND v.ownership_type = ?'; params.push(ownership); }
      const published = url.searchParams.get('published');
      if (published !== null && published !== '') { query += ' AND v.is_published = ?'; params.push(published === '1' || published === 'true' ? 1 : 0); }
    }
    const sort = { price_asc: 'v.price ASC', price_desc: 'v.price DESC', year_desc: 'v.year DESC', km_asc: 'v.km ASC' }[url.searchParams.get('sort')] || 'v.highlight DESC, v.created_at DESC';
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '100', 10) || 100, 1), 200);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);
    const rows = db.prepare(`${query} ORDER BY ${sort} LIMIT ? OFFSET ?`).all(...params, limit, offset);
    // Fotos de todos os veículos da página em uma única consulta (o front monta a galeria sem uma chamada por carro)
    const media = new Map();
    if (rows.length) {
      const enabled = enabledModules();
      const wanted = staff || enabled.includes('viewer360') ? "('photo', 'frame360')" : "('photo')";
      const found = db.prepare(`SELECT id, vehicle_id, url, is_cover, order_index, kind FROM vehicle_photos
        WHERE kind IN ${wanted} AND vehicle_id IN (${rows.map(() => '?').join(',')}) ORDER BY order_index, id`).all(...rows.map(row => row.id));
      for (const item of found) {
        const entry = media.get(item.vehicle_id) || { photos: [], frames360: [] };
        entry[item.kind === 'photo' ? 'photos' : 'frames360'].push({ id: item.id, url: item.url, is_cover: item.is_cover, order_index: item.order_index });
        media.set(item.vehicle_id, entry);
      }
    }
    return sendJson(res, 200, rows.map(row => ({
      ...hydrate(row, { internal: staff }), cover_photo: row.cover_photo, photos_count: row.photos_count,
      photos: media.get(row.id)?.photos || [], frames360: media.get(row.id)?.frames360 || []
    })));
  }

  // GET /api/vehicles/:idOuSlug
  const detail = pathname.match(/^\/api\/vehicles\/([\w-]+)$/);
  if (detail && req.method === 'GET') {
    const staff = authenticate(req).authenticated;
    const key = detail[1];
    const row = /^\d+$/.test(key)
      ? db.prepare('SELECT * FROM vehicles WHERE id = ?').get(Number(key))
      : db.prepare('SELECT * FROM vehicles WHERE slug = ?').get(key);
    // Não publicado ou vendido: para o público é como se não existisse.
    if (!row || (!staff && (!row.is_published || row.status === 'vendido'))) return sendJson(res, 404, { error: 'Veículo não encontrado.' });
    const detailOut = { ...hydrate(row, { internal: staff }), ...mediaFor(db, row.id) };
    if (!staff) {
      const enabled = enabledModules();
      if (!enabled.includes('viewer360')) detailOut.frames360 = [];
      if (enabled.includes('tco')) {
        const costs = db.prepare('SELECT city_consumption, road_consumption, tank_capacity, avg_maintenance, annual_insurance FROM vehicle_costs WHERE vehicle_id = ?').get(row.id);
        if (costs) detailOut.costs = costs;
      }
    }
    return sendJson(res, 200, detailOut);
  }

  // POST /api/vehicles
  if (pathname === '/api/vehicles' && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    const { error, values } = normalizeVehicleInput(body, { partial: false });
    if (error) return sendJson(res, 400, { error });

    const { id, slug } = insertVehicle(db, values);
    const row = { title: values.title };
    audit(auth.user, 'create_vehicle', 'vehicles', id, `Criado veículo: ${row.title}`, clientIp(req, req.trustProxy));
    return sendJson(res, 201, { id, slug, message: 'Veículo cadastrado com sucesso!' });
  }

  // POST /api/vehicles/import - importação de planilha (CSV em texto). dry_run=true só confere.
  if (pathname === '/api/vehicles/import' && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    if (typeof body?.csv !== 'string' || !body.csv.trim()) return sendJson(res, 400, { error: 'Envie o conteúdo da planilha em CSV (campo csv).' });
    const parsed = parseStockFile(body.csv);
    if (parsed.fatal) return sendJson(res, 400, { error: parsed.fatal });
    const dryRun = body.dry_run === true;
    const created = [];
    if (!dryRun && parsed.errors.length) {
      return sendJson(res, 422, { error: 'Nada foi importado. Corrija as linhas com erro e envie a planilha de novo.', total_lines: parsed.total, valid: parsed.valid.length, imported: 0, rejected: parsed.errors.length, errors: parsed.errors.slice(0, 100) });
    }
    if (!dryRun && parsed.valid.length) {
      db.exec('BEGIN');
      try {
        for (const item of parsed.valid) created.push({ line: item.line, ...insertVehicle(db, item.values) });
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
      audit(auth.user, 'import_stock', 'vehicles', '', { importados: created.length, rejeitados: parsed.errors.length }, clientIp(req, req.trustProxy));
    }
    return sendJson(res, dryRun ? 200 : 201, {
      dry_run: dryRun,
      total_lines: parsed.total,
      valid: parsed.valid.length,
      imported: created.length,
      rejected: parsed.errors.length,
      errors: parsed.errors.slice(0, 100),
      vehicles: vehicleUsage(db)
    });
  }

  const idMatch = pathname.match(/^\/api\/vehicles\/(\d+)$/);

  // PUT /api/vehicles/:id
  if (idMatch && req.method === 'PUT') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    const id = parseInt(idMatch[1], 10);
    const existing = db.prepare('SELECT id, title, version, year FROM vehicles WHERE id = ?').get(id);
    if (!existing) return sendJson(res, 404, { error: 'Veículo não encontrado.' });
    const { error, values } = normalizeVehicleInput(body, { partial: true });
    if (error) return sendJson(res, 400, { error });
    if (values.title || values.version || values.year) {
      const next = { ...existing, ...values };
      values.slug = `${slugify(`${next.title} ${next.version} ${String(next.year).slice(0, 4)}`)}-${id}`;
    }
    // Venda: guarda o preço efetivamente vendido e a data (usados no financeiro, comissões e consignação)
    const previous = db.prepare('SELECT status, price, created_at, days_in_stock FROM vehicles WHERE id = ?').get(id);
    // A loja informa o total atual de dias em estoque; guardamos só o que veio antes do cadastro.
    if (values.days_in_stock !== undefined) values.days_in_stock = Math.max(0, Number(values.days_in_stock) - (effectiveDaysInStock({ ...previous, days_in_stock: 0 })));
    if (values.status === 'vendido' && previous.status !== 'vendido') {
      const informed = body && body.sale_price !== undefined && body.sale_price !== '' ? Number(body.sale_price) : null;
      if (informed !== null && (!Number.isFinite(informed) || informed <= 0)) return sendJson(res, 400, { error: 'Informe um preço de venda maior que zero.' });
      values.sale_price = informed ?? Number(values.price ?? previous.price);
      values.sold_at = new Date().toISOString();
    } else if (values.status && values.status !== 'vendido' && previous.status === 'vendido') {
      values.sale_price = null;
      values.sold_at = null;
    }
    const columns = Object.keys(values);
    if (columns.length) {
      db.prepare(`UPDATE vehicles SET ${columns.map(column => `${column} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...columns.map(column => values[column]), id);
    }
    audit(auth.user, 'update_vehicle', 'vehicles', id, { campos: columns }, clientIp(req, req.trustProxy));
    return sendJson(res, 200, { message: 'Veículo atualizado com sucesso!' });
  }

  // DELETE /api/vehicles/:id
  if (idMatch && req.method === 'DELETE') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    const roleCheck = checkRole(auth.user, ['proprietario', 'gerente']);
    if (!roleCheck.allowed) return sendJson(res, roleCheck.status, { error: roleCheck.error });
    const id = parseInt(idMatch[1], 10);
    const files = db.prepare('SELECT storage_key FROM vehicle_photos WHERE vehicle_id = ? AND storage_key IS NOT NULL').all(id);
    const deleted = db.prepare('DELETE FROM vehicles WHERE id = ?').run(id);
    if (deleted.changes === 0) return sendJson(res, 404, { error: 'Veículo não encontrado.' });
    const { storage } = await import('../services/storage.js');
    for (const file of files) storage.delete(file.storage_key);
    audit(auth.user, 'delete_vehicle', 'vehicles', id, '', clientIp(req, req.trustProxy));
    return sendJson(res, 200, { message: 'Veículo removido com sucesso.' });
  }

  // POST /api/vehicles/:id/photos - lista por URL (legado). Não apaga arquivos enviados pelo upload.
  const photosMatch = pathname.match(/^\/api\/vehicles\/(\d+)\/photos$/);
  if (photosMatch && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    const vehicleId = parseInt(photosMatch[1], 10);
    if (!db.prepare('SELECT id FROM vehicles WHERE id = ?').get(vehicleId)) return sendJson(res, 404, { error: 'Veículo não encontrado.' });
    const { photos } = body || {};
    if (!Array.isArray(photos)) return sendJson(res, 400, { error: 'Formato inválido. Esperado array de fotos.' });
    const uploaded = db.prepare("SELECT COUNT(*) AS n FROM vehicle_photos WHERE vehicle_id = ? AND kind = 'photo' AND storage_key IS NOT NULL").get(vehicleId).n;
    if (photos.length + uploaded > 20) return sendJson(res, 400, { error: 'Limite excedido: Máximo de 20 fotos permitidas por veículo.' });
    if (photos.some(photo => typeof photo?.url !== 'string' || !/^(https:\/\/|\/)/.test(photo.url) || photo.url.length > 500)) {
      return sendJson(res, 400, { error: 'Cada foto precisa de uma url https ou caminho local válido.' });
    }
    db.prepare("DELETE FROM vehicle_photos WHERE vehicle_id = ? AND kind = 'photo' AND storage_key IS NULL").run(vehicleId);
    const insert = db.prepare('INSERT INTO vehicle_photos (vehicle_id, url, is_cover, order_index) VALUES (?, ?, ?, ?)');
    photos.forEach((photo, index) => insert.run(vehicleId, photo.url, photo.is_cover ? 1 : 0, photo.order_index ?? index));
    return sendJson(res, 200, { message: 'Fotos atualizadas com sucesso!', total: photos.length });
  }

  return false;
}
