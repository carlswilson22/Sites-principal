/**
 * server/src/routes/tier2Routes.js
 * Endpoints Exclusivos do Nível 2 (I1 a I8 - Tier Pro e Enterprise)
 * Bloqueados com 404 Not Found se a loja estiver configurada no Nível 1.
 */
import { getDb } from '../database/db.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/rbacMiddleware.js';
import { assertTier } from '../middlewares/tierGate.js';
import { encryptSensitive, decryptSensitive, maskCPF } from '../security/crypto.js';
import { calculatePriceFinancing } from '../services/financeCalculator.js';
import { generateVehicleDescription, estimateVehicleCosts } from '../services/aiDescriptionAdapter.js';
import { lookupFipe, calculatePricing } from '../services/fipeAdapter.js';
import { generateContractDocument } from '../services/contractGenerator.js';

export async function handleTier2Routes(req, res, pathname, body) {
  // Barreira de Nível Rígida: se a loja for Tier 1, retorna 404 (endpoint não existe neste modelo)
  const tierCheck = assertTier(2);
  if (!tierCheck.allowed) {
    // Retorna false para cair no 404 geral ou envia 404 explícito
    return false;
  }

  const db = getDb();

  // 1. I1: POST /api/ai/description - Gerar descrição por IA
  if (pathname === '/api/ai/description' && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const vehicleData = body || {};
    const description = await generateVehicleDescription(vehicleData);
    const costsEstimate = estimateVehicleCosts(vehicleData);

    return sendJson(res, 200, {
      description,
      costsEstimate,
      disclaimer: 'Descrição gerada por IA como rascunho. Revise antes de publicar.'
    });
  }

  // 2. I1: GET/POST /api/vehicles/:id/costs - Custos do carro
  const costsMatch = pathname.match(/^\/api\/vehicles\/(\d+)\/costs$/);
  if (costsMatch) {
    const vehicleId = parseInt(costsMatch[1], 10);

    if (req.method === 'GET') {
      const costs = db.prepare('SELECT * FROM vehicle_costs WHERE vehicle_id = ?').get(vehicleId);
      return sendJson(res, 200, costs || {});
    }

    if (req.method === 'POST') {
      const auth = authenticate(req);
      if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

      const { city_consumption, road_consumption, tank_capacity, avg_maintenance, annual_insurance } = body || {};

      db.prepare(`
        INSERT INTO vehicle_costs (vehicle_id, city_consumption, road_consumption, tank_capacity, avg_maintenance, annual_insurance)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(vehicle_id) DO UPDATE SET
          city_consumption = excluded.city_consumption,
          road_consumption = excluded.road_consumption,
          tank_capacity = excluded.tank_capacity,
          avg_maintenance = excluded.avg_maintenance,
          annual_insurance = excluded.annual_insurance,
          updated_at = CURRENT_TIMESTAMP
      `).run(vehicleId, city_consumption, road_consumption, tank_capacity, avg_maintenance, annual_insurance);

      return sendJson(res, 200, { message: 'Custos operacionais salvos com sucesso!' });
    }
  }

  // 3. I2: GET/POST /api/clients - CRM e Cadastro de Clientes (com criptografia LGPD)
  if (pathname === '/api/clients' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const clients = db.prepare('SELECT id, name, cpf_encrypted, phone, email, notes, created_at FROM clients ORDER BY created_at DESC').all();
    const formatted = clients.map(c => {
      const rawCpf = decryptSensitive(c.cpf_encrypted);
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        notes: c.notes,
        cpfMasked: maskCPF(rawCpf),
        created_at: c.created_at
      };
    });

    return sendJson(res, 200, formatted);
  }

  if (pathname === '/api/clients' && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const { name, cpf, phone, email, address, notes } = body || {};
    if (!name || !cpf || !phone) {
      return sendJson(res, 400, { error: 'Nome, CPF e telefone são obrigatórios.' });
    }

    const cpfEncrypted = encryptSensitive(cpf);
    const addressEncrypted = encryptSensitive(address || '');

    const result = db.prepare(`
      INSERT INTO clients (name, cpf_encrypted, phone, email, address_encrypted, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, cpfEncrypted, phone, email || '', addressEncrypted, notes || '');

    return sendJson(res, 201, { id: result.lastInsertRowid, message: 'Cliente cadastrado com segurança.' });
  }

  // 4. I2: POST /api/leads/:id/timeline - Histórico por contato
  const leadTimelineMatch = pathname.match(/^\/api\/leads\/(\d+)\/timeline$/);
  if (leadTimelineMatch && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const leadId = parseInt(leadTimelineMatch[1], 10);
    const { action, note } = body || {};

    db.prepare(`
      INSERT INTO lead_history (lead_id, user_id, action, note)
      VALUES (?, ?, ?, ?)
    `).run(leadId, auth.user.id, action || 'anotacao', note || '');

    return sendJson(res, 201, { message: 'Histórico registrado com sucesso.' });
  }

  // 5. I4: POST /api/financing/calculate - Cálculo de Financiamento (Tabela Price)
  if (pathname === '/api/financing/calculate' && req.method === 'POST') {
    const simulation = calculatePriceFinancing(body || {});
    return sendJson(res, 200, simulation);
  }

  // 6. I6: GET /api/fipe/lookup & POST /api/fipe/calculate-margin - Precificador
  if (pathname === '/api/fipe/lookup' && req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost');
    const brand = url.searchParams.get('brand') || '';
    const model = url.searchParams.get('model') || '';
    const year = url.searchParams.get('year') || '2023';

    const fipeData = await lookupFipe({ brand, model, year });
    return sendJson(res, 200, fipeData);
  }

  if (pathname === '/api/fipe/calculate-margin' && req.method === 'POST') {
    const pricing = calculatePricing(body || {});
    return sendJson(res, 200, pricing);
  }

  // 7. I7: GET/POST /api/contracts - Emissão e Histórico de Contratos
  if (pathname === '/api/contracts' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const contracts = db.prepare(`
      SELECT c.*, cl.name as client_name, v.title as vehicle_title, v.price as vehicle_price
      FROM contracts c
      JOIN clients cl ON cl.id = c.client_id
      JOIN vehicles v ON v.id = c.vehicle_id
      ORDER BY c.created_at DESC
    `).all();

    return sendJson(res, 200, contracts);
  }

  if (pathname === '/api/contracts/generate' && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const { type, clientId, vehicleId, terms } = body || {};

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId);

    if (!client || !vehicle) {
      return sendJson(res, 400, { error: 'Cliente e Veículo válidos são obrigatórios.' });
    }

    const rawCpf = decryptSensitive(client.cpf_encrypted);
    const clientFormatted = { ...client, cpfMasked: maskCPF(rawCpf) };

    const dealership = {
      nome: 'Auto-Dealership Pro',
      cnpj: '42.880.192/0001-90',
      cidade: 'Brasília',
      uf: 'DF'
    };

    const doc = generateContractDocument({
      type: type || 'compra_venda',
      dealership,
      client: clientFormatted,
      vehicle,
      terms
    });

    const resDb = db.prepare(`
      INSERT INTO contracts (code, type, vehicle_id, client_id, terms_data, status, created_by)
      VALUES (?, ?, ?, ?, ?, 'emitido', ?)
    `).run(doc.code, doc.type, vehicleId, clientId, JSON.stringify(terms || {}), auth.user.id);

    return sendJson(res, 201, {
      id: resDb.lastInsertRowid,
      document: doc
    });
  }

  // 8. I8: GET/POST /api/financial/vehicles/:id - Despesas e Margem (Apenas PROPRIETÁRIO)
  const finVehicleMatch = pathname.match(/^\/api\/financial\/vehicles\/(\d+)$/);
  if (finVehicleMatch) {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    // Regra I8: Resultado financeiro visível apenas para o proprietário
    const roleCheck = checkRole(auth.user, ['proprietario']);
    if (!roleCheck.allowed) return sendJson(res, roleCheck.status, { error: 'Resultado financeiro restrito ao perfil de Proprietário.' });

    const vehicleId = parseInt(finVehicleMatch[1], 10);
    const vehicle = db.prepare('SELECT id, title, price, status FROM vehicles WHERE id = ?').get(vehicleId);
    if (!vehicle) return sendJson(res, 404, { error: 'Veículo não encontrado.' });

    const expenses = db.prepare(`
      SELECT * FROM vehicle_expenses WHERE vehicle_id = ? ORDER BY expense_date DESC
    `).all(vehicleId);

    const totalCost = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const expectedProfit = Math.round((vehicle.price - totalCost) * 100) / 100;

    return sendJson(res, 200, {
      vehicle,
      expenses,
      summary: {
        salePrice: vehicle.price,
        totalExpenses: totalCost,
        netMargin: expectedProfit,
        marginPct: vehicle.price > 0 ? Math.round((expectedProfit / vehicle.price) * 1000) / 10 : 0
      }
    });
  }

  if (pathname === '/api/financial/expenses' && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const roleCheck = checkRole(auth.user, ['proprietario']);
    if (!roleCheck.allowed) return sendJson(res, roleCheck.status, { error: 'Lançamento financeiro restrito ao Proprietário.' });

    const { vehicle_id, category, description, amount, expense_date } = body || {};
    if (!vehicle_id || !category || !amount) {
      return sendJson(res, 400, { error: 'Veículo, categoria e valor são obrigatórios.' });
    }

    const resExp = db.prepare(`
      INSERT INTO vehicle_expenses (vehicle_id, category, description, amount, expense_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(vehicle_id, category, description || '', parseFloat(amount), expense_date || new Date().toISOString().split('T')[0], auth.user.id);

    return sendJson(res, 201, { id: resExp.lastInsertRowid, message: 'Despesa lançada com sucesso!' });
  }

  return false;
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
  return true;
}

