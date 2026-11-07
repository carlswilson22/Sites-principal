/**
 * server/src/routes/inventoryRoutes.js
 * Endpoints do Módulo de Estoque e Fotos (E3, E4, E5 - Nível 1)
 */
import { getDb } from '../database/db.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/rbacMiddleware.js';

export async function handleInventoryRoutes(req, res, pathname, body) {
  const db = getDb();

  // 1. GET /api/vehicles - Listar veículos com busca e filtros
  if (pathname === '/api/vehicles' && req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost');
    const search = url.searchParams.get('q') || '';
    const status = url.searchParams.get('status') || '';
    const ownership = url.searchParams.get('ownership') || '';
    const published = url.searchParams.get('published');

    let query = `
      SELECT v.*, 
        (SELECT url FROM vehicle_photos WHERE vehicle_id = v.id AND is_cover = 1 LIMIT 1) as cover_photo,
        (SELECT COUNT(*) FROM vehicle_photos WHERE vehicle_id = v.id) as photos_count
      FROM vehicles v
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (v.title LIKE ? OR v.version LIKE ? OR v.color LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ` AND v.status = ?`;
      params.push(status);
    }
    if (ownership) {
      query += ` AND v.ownership_type = ?`;
      params.push(ownership);
    }
    if (published !== null && published !== undefined && published !== '') {
      query += ` AND v.is_published = ?`;
      params.push(parseInt(published, 10));
    }

    query += ` ORDER BY v.created_at DESC`;
    const vehicles = db.prepare(query).all(...params);

    return sendJson(res, 200, vehicles);
  }

  // 2. GET /api/vehicles/:id - Obter detalhes completos do veículo e fotos
  const vehicleIdMatch = pathname.match(/^\/api\/vehicles\/(\d+)$/);
  if (vehicleIdMatch && req.method === 'GET') {
    const id = parseInt(vehicleIdMatch[1], 10);
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);
    if (!vehicle) {
      return sendJson(res, 404, { error: 'Veículo não encontrado.' });
    }

    const photos = db.prepare(`
      SELECT id, url, is_cover, order_index
      FROM vehicle_photos
      WHERE vehicle_id = ?
      ORDER BY order_index ASC
    `).all(id);

    return sendJson(res, 200, { ...vehicle, photos });
  }

  // 3. POST /api/vehicles - Cadastrar novo veículo (E3, E5)
  if (pathname === '/api/vehicles' && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const roleCheck = checkRole(auth.user, ['proprietario', 'gerente', 'atendente']);
    if (!roleCheck.allowed) return sendJson(res, roleCheck.status, { error: roleCheck.error });

    const {
      title, version, category, year, km, transmission, fuel, color,
      doors, engine, power, price, status, ownership_type, is_published,
      days_in_stock, notes
    } = body || {};

    if (!title || !price || !year) {
      return sendJson(res, 400, { error: 'Título, ano e preço são campos obrigatórios.' });
    }

    const insert = db.prepare(`
      INSERT INTO vehicles (
        title, version, category, year, km, transmission, fuel, color,
        doors, engine, power, price, status, ownership_type, is_published,
        days_in_stock, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      title,
      version || '',
      category || 'sedan',
      year,
      parseInt(km || 0, 10),
      transmission || 'Automático',
      fuel || 'Flex',
      color || 'Não especificada',
      parseInt(doors || 4, 10),
      engine || '',
      power || '',
      parseFloat(price),
      status || 'disponivel',
      ownership_type || 'proprio',
      is_published !== undefined ? (is_published ? 1 : 0) : 1,
      parseInt(days_in_stock || 0, 10),
      notes || ''
    );

    // Registra na auditoria
    db.prepare(`
      INSERT INTO audit_logs (user_id, user_name, user_role, action, entity, entity_id, details, ip_address)
      VALUES (?, ?, ?, 'create_vehicle', 'vehicles', ?, ?, ?)
    `).run(auth.user.id, auth.user.name, auth.user.role, String(result.lastInsertRowid), `Criado veículo: ${title}`, req.socket.remoteAddress);

    return sendJson(res, 201, { id: result.lastInsertRowid, message: 'Veículo cadastrado com sucesso!' });
  }

  // 4. PUT /api/vehicles/:id - Atualizar veículo (E3, E5)
  if (vehicleIdMatch && req.method === 'PUT') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const id = parseInt(vehicleIdMatch[1], 10);
    const existing = db.prepare('SELECT id FROM vehicles WHERE id = ?').get(id);
    if (!existing) {
      return sendJson(res, 404, { error: 'Veículo não encontrado.' });
    }

    const {
      title, version, category, year, km, transmission, fuel, color,
      doors, engine, power, price, status, ownership_type, is_published,
      days_in_stock, notes
    } = body || {};

    db.prepare(`
      UPDATE vehicles SET
        title = COALESCE(?, title),
        version = COALESCE(?, version),
        category = COALESCE(?, category),
        year = COALESCE(?, year),
        km = COALESCE(?, km),
        transmission = COALESCE(?, transmission),
        fuel = COALESCE(?, fuel),
        color = COALESCE(?, color),
        doors = COALESCE(?, doors),
        engine = COALESCE(?, engine),
        power = COALESCE(?, power),
        price = COALESCE(?, price),
        status = COALESCE(?, status),
        ownership_type = COALESCE(?, ownership_type),
        is_published = COALESCE(?, is_published),
        days_in_stock = COALESCE(?, days_in_stock),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title, version, category, year, km, transmission, fuel, color,
      doors, engine, power, price, status, ownership_type,
      is_published !== undefined ? (is_published ? 1 : 0) : null,
      days_in_stock, notes, id
    );

    return sendJson(res, 200, { message: 'Veículo atualizado com sucesso!' });
  }

  // 5. DELETE /api/vehicles/:id - Excluir veículo (E3)
  if (vehicleIdMatch && req.method === 'DELETE') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const roleCheck = checkRole(auth.user, ['proprietario', 'gerente']);
    if (!roleCheck.allowed) return sendJson(res, roleCheck.status, { error: roleCheck.error });

    const id = parseInt(vehicleIdMatch[1], 10);
    const deleted = db.prepare('DELETE FROM vehicles WHERE id = ?').run(id);
    if (deleted.changes === 0) {
      return sendJson(res, 404, { error: 'Veículo não encontrado.' });
    }

    return sendJson(res, 200, { message: 'Veículo removido com sucesso.' });
  }

  // 6. POST /api/vehicles/:id/photos - Gerenciar fotos (E4: até 20 fotos, capa, ordem, remover)
  const photosMatch = pathname.match(/^\/api\/vehicles\/(\d+)\/photos$/);
  if (photosMatch && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const vehicleId = parseInt(photosMatch[1], 10);
    const { photos } = body || {}; // Array de { url, is_cover, order_index }

    if (!Array.isArray(photos)) {
      return sendJson(res, 400, { error: 'Formato inválido. Esperado array de fotos.' });
    }

    // Regra E4: Máximo de 20 fotos por carro
    if (photos.length > 20) {
      return sendJson(res, 400, { error: 'Limite excedido: Máximo de 20 fotos permitidas por veículo.' });
    }

    // Substitui a lista de fotos atomicamente
    db.prepare('DELETE FROM vehicle_photos WHERE vehicle_id = ?').run(vehicleId);

    const insertPhoto = db.prepare(`
      INSERT INTO vehicle_photos (vehicle_id, url, is_cover, order_index)
      VALUES (?, ?, ?, ?)
    `);

    photos.forEach((photo, idx) => {
      insertPhoto.run(vehicleId, photo.url, photo.is_cover ? 1 : 0, photo.order_index ?? idx);
    });

    return sendJson(res, 200, { message: 'Fotos atualizadas com sucesso!', total: photos.length });
  }

  return false;
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
  return true;
}

