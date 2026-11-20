/**
 * server/src/routes/tier3Routes.js
 * Módulos do Premium: consignação, contratos avançados, financeiro completo, mercado,
 * funil e giro, Stories/Instagram, auditoria e LGPD, exportação do estoque.
 * Acesso e cargo são verificados na política central (policy.js); aqui ficam as regras de negócio.
 */
import { getDb } from '../database/db.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { assertTier } from '../middlewares/tierGate.js';
import { config } from '../config.js';
import { readSetting } from '../modules.js';
import { clientIp } from '../security/http.js';
import { encryptSensitive, decryptSensitive, maskCPF, maskBankData } from '../security/crypto.js';
import { calculateConsignmentSettlement, checkConsignmentStatus } from '../services/consignmentsCalculator.js';
import { calculateSellerCommission } from '../services/commissionCalculator.js';
import { generateAdvancedContractHtml, generateContractCode } from '../services/advancedContractGenerator.js';
import { calculateMarketPricing } from '../services/marketPricingService.js';
import { getInstagramConfigStatus, dispatchInstagramStory } from '../services/instagramAdapter.js';
import { getPortalAdaptersManifest, exportVehiclesToCsv, exportVehiclesToJson } from '../services/portalExportAdapter.js';
import { audit, daysInStockSql, sendJson } from './util.js';

const DAY = 86400000;
const CONTRACT_TYPES = ['consignacao', 'compra_venda_troca', 'termo_aditivo'];
const CONSIGNMENT_STATUSES = ['ativo', 'liquidado', 'cancelado'];

const toId = value => (typeof value === 'string' && /^\d{1,9}$/.test(value) ? Number(value) : value);
const isId = value => Number.isInteger(value) && value > 0;
const isMoney = (value, max = 100000000) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max;
const isoDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const today = () => new Date().toISOString().slice(0, 10);

function validCpf(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return null;
  for (const length of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < length; i += 1) sum += Number(digits[i]) * (length + 1 - i);
    if (((sum * 10) % 11) % 10 !== Number(digits[length])) return null;
  }
  return digits;
}

/** Dados da loja para documentos: configuração do servidor, sobrescrita pelo cadastro feito no painel. */
function storeIdentity() {
  const saved = readSetting('store', {}) || {};
  const merged = { ...config.store, ...saved };
  const place = [merged.city, merged.uf].filter(Boolean).join('/');
  return { name: merged.name, cnpj: merged.cnpj || '', address: merged.address || place || '' };
}

function elapsedDays(fromIso, toDate = new Date()) {
  const from = Date.parse(fromIso);
  return Number.isFinite(from) ? Math.max(0, Math.floor((toDate.getTime() - from) / DAY)) : 0;
}

export async function handleTier3Routes(req, res, pathname, body) {
  // Barreira de nível: lojas de nível menor só chegam aqui se o módulo foi liberado (avulso).
  if (!assertTier(3).allowed && !req.moduleApproved) return false;

  const db = getDb();
  const ip = () => clientIp(req, req.trustProxy);

  // ---------- Consignação ----------
  if (pathname === '/api/tier3/consignments' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const rows = db.prepare(`
      SELECT c.id, c.vehicle_id, c.owner_name, c.owner_cpf_encrypted, c.owner_bank_data_encrypted, c.remuneration_type,
             c.remuneration_value, c.min_remuneration, c.service_fee, c.daily_storage_fee, c.contract_start, c.contract_end,
             c.payout_deadline_days, c.advanced_expenses, c.status, c.created_at,
             v.title AS vehicle_title, v.price AS vehicle_price, v.sale_price, v.status AS vehicle_status, v.sold_at
      FROM consignments c JOIN vehicles v ON v.id = c.vehicle_id
      ORDER BY c.created_at DESC
    `).all();

    return sendJson(res, 200, rows.map(({ owner_cpf_encrypted, owner_bank_data_encrypted, ...row }) => {
      // Diárias contam desde o início do contrato e até a venda (ou até hoje, se ainda em estoque).
      const end = row.sold_at ? new Date(row.sold_at) : new Date();
      const storedDays = elapsedDays(`${row.contract_start}T00:00:00Z`, end);
      const settlement = calculateConsignmentSettlement({
        vehiclePrice: row.sale_price ?? row.vehicle_price,
        remunerationType: row.remuneration_type,
        remunerationValue: row.remuneration_value,
        minRemuneration: row.min_remuneration,
        serviceFee: row.service_fee,
        dailyStorageFee: row.daily_storage_fee,
        daysInStock: storedDays,
        advancedExpenses: row.advanced_expenses
      });
      return {
        ...row,
        owner_cpf_masked: maskCPF(decryptSensitive(owner_cpf_encrypted)),
        owner_bank_masked: maskBankData(decryptSensitive(owner_bank_data_encrypted)),
        settlement,
        settlementBasis: row.sale_price ? 'valor_da_venda' : 'preco_anunciado_projecao',
        expiry: checkConsignmentStatus(row.contract_end)
      };
    }));
  }

  if (pathname === '/api/tier3/consignments' && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    const b = { ...(body || {}) };
    b.vehicle_id = toId(b.vehicle_id);

    const cpf = validCpf(b.owner_cpf);
    const type = b.remuneration_type;
    const start = b.contract_start || today();
    const end = b.contract_end || new Date(Date.now() + 30 * DAY).toISOString().slice(0, 10);
    const numbers = {
      remuneration_value: Number(b.remuneration_value), min_remuneration: Number(b.min_remuneration ?? 0), service_fee: Number(b.service_fee ?? 0),
      daily_storage_fee: Number(b.daily_storage_fee ?? 0), advanced_expenses: Number(b.advanced_expenses ?? 0)
    };
    const payoutDays = b.payout_deadline_days === undefined ? 5 : Number(b.payout_deadline_days);

    if (!isId(b.vehicle_id)) return sendJson(res, 400, { error: 'Informe o veículo da consignação.' });
    if (typeof b.owner_name !== 'string' || b.owner_name.trim().length < 3 || b.owner_name.length > 120) return sendJson(res, 400, { error: 'Informe o nome completo do proprietário (3 a 120 caracteres).' });
    if (!cpf) return sendJson(res, 400, { error: 'CPF do proprietário inválido.' });
    if (!['percentual', 'valor_liquido'].includes(type)) return sendJson(res, 400, { error: 'Tipo de remuneração inválido (percentual ou valor_liquido).' });
    if (!(numbers.remuneration_value > 0) || (type === 'percentual' && numbers.remuneration_value > 100)) return sendJson(res, 400, { error: 'Remuneração inválida: percentual de 0 a 100, ou valor líquido maior que zero.' });
    if (!Object.values(numbers).every(value => isMoney(value))) return sendJson(res, 400, { error: 'Valores monetários devem ser números maiores ou iguais a zero.' });
    if (!isoDate(start) || !isoDate(end) || end < start) return sendJson(res, 400, { error: 'Datas inválidas: use AAAA-MM-DD e o fim não pode ser anterior ao início.' });
    if (!Number.isInteger(payoutDays) || payoutDays < 0 || payoutDays > 90) return sendJson(res, 400, { error: 'Prazo de repasse deve ser de 0 a 90 dias.' });
    if (b.owner_bank_data !== undefined && (typeof b.owner_bank_data !== 'string' || b.owner_bank_data.length > 300)) return sendJson(res, 400, { error: 'Dados bancários inválidos (até 300 caracteres).' });

    const vehicle = db.prepare('SELECT id FROM vehicles WHERE id = ?').get(b.vehicle_id);
    if (!vehicle) return sendJson(res, 404, { error: 'Veículo não encontrado.' });

    db.prepare(`
      INSERT INTO consignments (vehicle_id, owner_name, owner_cpf_encrypted, owner_bank_data_encrypted, remuneration_type, remuneration_value,
        min_remuneration, service_fee, daily_storage_fee, contract_start, contract_end, payout_deadline_days, advanced_expenses, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativo')
      ON CONFLICT(vehicle_id) DO UPDATE SET owner_name = excluded.owner_name, owner_cpf_encrypted = excluded.owner_cpf_encrypted,
        owner_bank_data_encrypted = excluded.owner_bank_data_encrypted, remuneration_type = excluded.remuneration_type,
        remuneration_value = excluded.remuneration_value, min_remuneration = excluded.min_remuneration, service_fee = excluded.service_fee,
        daily_storage_fee = excluded.daily_storage_fee, contract_start = excluded.contract_start, contract_end = excluded.contract_end,
        payout_deadline_days = excluded.payout_deadline_days, advanced_expenses = excluded.advanced_expenses, status = 'ativo'
    `).run(b.vehicle_id, b.owner_name.trim(), encryptSensitive(cpf), encryptSensitive(b.owner_bank_data || ''), type, numbers.remuneration_value,
      numbers.min_remuneration, numbers.service_fee, numbers.daily_storage_fee, start, end, payoutDays, numbers.advanced_expenses);

    db.prepare("UPDATE vehicles SET ownership_type = 'consignado', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(b.vehicle_id);
    audit(auth.user, 'CRIAR_CONSIGNACAO', 'consignments', b.vehicle_id, { owner_name: b.owner_name.trim() }, ip());
    return sendJson(res, 201, { message: 'Contrato de consignação registrado com sucesso.' });
  }

  // Encerramento: liquidado (repasse feito) ou cancelado (veículo devolvido)
  if (pathname === '/api/tier3/consignments/status' && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    const { status } = body || {};
    const vehicleId = toId(body?.vehicle_id);
    if (!isId(vehicleId) || !CONSIGNMENT_STATUSES.includes(status)) return sendJson(res, 400, { error: 'Informe o veículo e o status (ativo, liquidado ou cancelado).' });
    const result = db.prepare('UPDATE consignments SET status = ? WHERE vehicle_id = ?').run(status, vehicleId);
    if (!result.changes) return sendJson(res, 404, { error: 'Consignação não encontrada.' });
    audit(auth.user, 'STATUS_CONSIGNACAO', 'consignments', vehicleId, { status }, ip());
    return sendJson(res, 200, { message: 'Status da consignação atualizado.' });
  }

  if (pathname === '/api/tier3/consignments/alerts' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const uncontracted = db.prepare(`
      SELECT v.id, v.title, v.price FROM vehicles v LEFT JOIN consignments c ON c.vehicle_id = v.id
      WHERE v.ownership_type = 'consignado' AND c.id IS NULL AND v.status = 'disponivel'
    `).all();
    const expiring = db.prepare(`
      SELECT c.id, c.vehicle_id, c.owner_name, c.contract_end, v.title AS vehicle_title, v.price AS vehicle_price
      FROM consignments c JOIN vehicles v ON v.id = c.vehicle_id
      WHERE c.status = 'ativo' AND v.status = 'disponivel'
    `).all().filter(row => {
      const expiry = checkConsignmentStatus(row.contract_end);
      return expiry.isExpired || expiry.daysRemaining <= 7;
    });
    return sendJson(res, 200, { uncontractedVehicles: uncontracted, expiringConsignments: expiring });
  }

  // ---------- Contratos avançados ----------
  if (pathname === '/api/tier3/contracts/advanced' && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    const { type, tradeVehicle, terms } = body || {};
    const vehicleId = toId(body?.vehicle_id), clientId = toId(body?.client_id), parentId = toId(body?.parent_contract_id);

    if (!CONTRACT_TYPES.includes(type)) return sendJson(res, 400, { error: `Tipo inválido. Use: ${CONTRACT_TYPES.join(', ')}.` });
    if (!isId(vehicleId) || !isId(clientId)) return sendJson(res, 400, { error: 'Informe o veículo e o cliente.' });
    if (terms !== undefined && (typeof terms !== 'object' || terms === null || Array.isArray(terms) || JSON.stringify(terms).length > 20000)) return sendJson(res, 400, { error: 'Termos inválidos.' });
    if (tradeVehicle !== undefined && (typeof tradeVehicle !== 'object' || tradeVehicle === null || JSON.stringify(tradeVehicle).length > 4000)) return sendJson(res, 400, { error: 'Veículo da troca inválido.' });

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId);
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
    if (!vehicle || !client) return sendJson(res, 404, { error: 'Veículo ou cliente não localizado.' });

    let parent = null;
    if (type === 'termo_aditivo') {
      if (typeof terms?.amendmentReason !== 'string' || terms.amendmentReason.trim().length < 5) return sendJson(res, 400, { error: 'Descreva a alteração acordada no termo aditivo (terms.amendmentReason).' });
      if (!isId(parentId)) return sendJson(res, 400, { error: 'O termo aditivo precisa do contrato original (parent_contract_id).' });
      parent = db.prepare('SELECT id, code, client_id FROM contracts WHERE id = ?').get(parentId);
      if (!parent || parent.client_id !== clientId) return sendJson(res, 400, { error: 'Contrato original não encontrado para este cliente.' });
    }

    const store = storeIdentity();
    if (!store.cnpj) return sendJson(res, 409, { error: 'Cadastre o CNPJ e o endereço da loja em Configurações antes de emitir contratos.' });

    let saved = null;
    for (let attempt = 0; attempt < 3 && !saved; attempt += 1) {
      const next = (db.prepare('SELECT COALESCE(MAX(id), 0) AS last FROM contracts').get().last || 0) + 1 + attempt;
      const code = generateContractCode('CTR-EXP', next);
      const html = generateAdvancedContractHtml({
        type, code, parentCode: parent?.code || null, vehicle, tradeVehicle, terms: terms || {}, store,
        client: { ...client, cpf_masked: maskCPF(decryptSensitive(client.cpf_encrypted)), address: decryptSensitive(client.address_encrypted) }
      });
      try {
        const result = db.prepare(`INSERT INTO contracts (code, type, vehicle_id, client_id, parent_contract_id, terms_data, status, created_by)
          VALUES (?, ?, ?, ?, ?, ?, 'emitido', ?)`).run(code, type, vehicleId, clientId, parent?.id || null, JSON.stringify(terms || {}), auth.user.id);
        saved = { id: Number(result.lastInsertRowid), code, html };
      } catch (error) {
        if (!/UNIQUE/i.test(error.message)) throw error;
      }
    }
    if (!saved) return sendJson(res, 409, { error: 'Não foi possível gerar um número único. Tente novamente.' });
    audit(auth.user, 'EMISSAO_CONTRATO_AVANCADO', 'contracts', saved.id, { code: saved.code, type }, ip());
    return sendJson(res, 201, saved);
  }

  // ---------- Financeiro completo ----------
  if (pathname === '/api/tier3/financial/full' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const ownStock = db.prepare(`
      SELECT COUNT(*) AS count, COALESCE(SUM(v.price), 0) AS total_retail_value,
        COALESCE((SELECT SUM(e.amount) FROM vehicle_expenses e JOIN vehicles v2 ON v2.id = e.vehicle_id
                  WHERE v2.ownership_type != 'consignado' AND v2.status = 'disponivel'), 0) AS total_invested
      FROM vehicles v WHERE v.ownership_type != 'consignado' AND v.status = 'disponivel'
    `).get();
    const consignedStock = db.prepare(`
      SELECT COUNT(*) AS count, COALESCE(SUM(v.price), 0) AS total_retail_value
      FROM vehicles v WHERE v.ownership_type = 'consignado' AND v.status = 'disponivel'
    `).get();

    // Vendas dos últimos 12 meses, pelo preço efetivamente vendido
    const sold = db.prepare(`
      SELECT v.id, v.title, v.ownership_type, v.sold_at, COALESCE(v.sale_price, v.price) AS sale_price,
        COALESCE((SELECT SUM(e.amount) FROM vehicle_expenses e WHERE e.vehicle_id = v.id), 0) AS total_cost,
        (SELECT COUNT(*) FROM vehicle_expenses e WHERE e.vehicle_id = v.id AND e.category = 'compra') AS has_purchase_cost
      FROM vehicles v
      WHERE v.status = 'vendido' AND COALESCE(v.sold_at, v.updated_at) >= date('now', '-12 months')
    `).all();

    let grossSales = 0, storeRevenue = 0, result = 0, missingCost = 0, consignedWithoutContract = 0;
    for (const sale of sold) {
      grossSales += sale.sale_price;
      if (sale.ownership_type === 'consignado') {
        const contract = db.prepare('SELECT * FROM consignments WHERE vehicle_id = ?').get(sale.id);
        if (!contract) { consignedWithoutContract += 1; continue; }
        const settlement = calculateConsignmentSettlement({
          vehiclePrice: sale.sale_price, remunerationType: contract.remuneration_type, remunerationValue: contract.remuneration_value,
          minRemuneration: contract.min_remuneration, serviceFee: contract.service_fee, dailyStorageFee: contract.daily_storage_fee,
          daysInStock: elapsedDays(`${contract.contract_start}T00:00:00Z`, new Date(sale.sold_at || Date.now())), advancedExpenses: contract.advanced_expenses
        });
        // Para a loja, a receita da consignação é a sua remuneração e as taxas, não o valor do carro
        storeRevenue += settlement.storeTotalRevenue;
        result += settlement.storeTotalRevenue - sale.total_cost;
      } else {
        storeRevenue += sale.sale_price;
        result += sale.sale_price - sale.total_cost;
        if (!sale.has_purchase_cost) missingCost += 1;
      }
    }

    // Comissões: percentual definido pela loja em Configurações; sem ele, não se calcula nada
    const commissionSetting = readSetting('commission', null);
    const rate = commissionSetting && Number.isFinite(commissionSetting.ratePercent) ? commissionSetting.ratePercent : null;
    const sellerRows = db.prepare(`
      SELECT u.id AS seller_id, u.name, u.email, COUNT(*) AS sales_count, COALESCE(SUM(COALESCE(v.sale_price, v.price)), 0) AS total_sold
      FROM leads l
      JOIN vehicles v ON v.id = l.vehicle_id
      JOIN users u ON u.id = l.assigned_to
      WHERE l.status = 'ganho' AND v.status = 'vendido' AND COALESCE(v.sold_at, v.updated_at) >= date('now', '-12 months')
        AND l.id = (SELECT MAX(l2.id) FROM leads l2 WHERE l2.vehicle_id = v.id AND l2.status = 'ganho')
      GROUP BY u.id ORDER BY total_sold DESC
    `).all();
    const sellersCommissions = sellerRows.map(row => ({
      sellerId: row.seller_id, name: row.name, email: row.email, salesCount: row.sales_count, totalSold: row.total_sold,
      commissionAmount: rate === null ? null : calculateSellerCommission({ salePrice: row.total_sold, commissionModel: 'percentual_venda', commissionRate: rate }).commissionAmount
    }));

    const round = value => Number(value.toFixed(2));
    return sendJson(res, 200, {
      period: 'ultimos_12_meses',
      ownStock, consignedStock,
      salesMetrics: { totalSoldCars: sold.length, totalSalesRevenue: round(grossSales), totalRealizedProfit: round(result) },
      commissionRatePercent: rate,
      commissionConfigured: rate !== null,
      sellersCommissions,
      warnings: [
        ...(missingCost ? [`${missingCost} venda(s) de estoque próprio sem custo de compra lançado: o resultado dessas vendas está superestimado.`] : []),
        ...(consignedWithoutContract ? [`${consignedWithoutContract} venda(s) de veículo consignado sem contrato de consignação cadastrado: ficaram fora do resultado.`] : []),
        ...(rate === null ? ['Percentual de comissão não configurado: comissões não calculadas.'] : [])
      ],
      bankReport: {
        storeName: storeIdentity().name,
        generatedAt: new Date().toISOString(),
        period: 'ultimos_12_meses',
        activeInventoryCount: (ownStock.count || 0) + (consignedStock.count || 0),
        activeInventoryValue: (ownStock.total_retail_value || 0) + (consignedStock.total_retail_value || 0),
        ownStockInvestedCapital: ownStock.total_invested,
        last12MonthsGrossRevenue: round(storeRevenue),
        last12MonthsNetProfit: round(result),
        note: 'Calculado apenas com as vendas, preços de venda e despesas registrados no sistema. Não é balanço, parecer contábil nem auditoria.'
      }
    });
  }

  // ---------- Mercado e leilão (entradas manuais) ----------
  if (pathname === '/api/tier3/market-pricing' && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    try {
      return sendJson(res, 200, calculateMarketPricing(body || {}));
    } catch (error) {
      return sendJson(res, 400, { error: error.message });
    }
  }

  // ---------- Funil e giro ----------
  if (pathname === '/api/tier3/funnel' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    const count = (sql) => db.prepare(sql).get().count || 0;
    const totalLeads = count('SELECT COUNT(*) AS count FROM leads');
    const attendedLeads = count("SELECT COUNT(*) AS count FROM leads WHERE status IN ('em_atendimento', 'ganho')");
    const wonLeads = count("SELECT COUNT(*) AS count FROM leads WHERE status = 'ganho'");
    const simLeads = count("SELECT COUNT(*) AS count FROM leads WHERE source = 'simulador_financiamento'");

    const staleVehicles = db.prepare(`
      SELECT v.id, v.title, v.version, v.price, ${daysInStockSql('v')} AS days_in_stock, v.fipe_reference_price
      FROM vehicles v WHERE v.status = 'disponivel' AND ${daysInStockSql('v')} > 60 ORDER BY days_in_stock DESC
    `).all().map(vehicle => {
      const percent = vehicle.days_in_stock > 90 ? 7 : 4;
      return { ...vehicle, suggestedDiscountPercent: percent, suggestedNewPrice: Math.round(vehicle.price * (1 - percent / 100)) };
    });

    return sendJson(res, 200, {
      hasData: totalLeads > 0,
      funnelSteps: [
        { step: 'Contatos recebidos', count: totalLeads },
        { step: 'Simulações de financiamento', count: simLeads },
        { step: 'Em atendimento ou ganhos', count: attendedLeads },
        { step: 'Vendas fechadas', count: wonLeads }
      ],
      averageResponseTimeMinutes: null,
      staleVehiclesAlert: {
        totalStale: staleVehicles.length,
        rule: 'Sugestão por regra fixa: mais de 60 dias em estoque, desconto de 4%; mais de 90 dias, 7%. É um ponto de partida, não uma avaliação de mercado.',
        vehicles: staleVehicles
      }
    });
  }

  // ---------- Stories e Instagram ----------
  if (pathname === '/api/tier3/stories/templates' && req.method === 'GET') {
    return sendJson(res, 200, {
      format: '1080x1920 (Vertical 9:16)',
      templates: [
        { id: 'apex_minimal', name: 'Apex Luxury Clean', description: 'Design minimalista e sofisticado com tipografia serifada e moldura dourada.' },
        { id: 'bold_impact', name: 'Dark Bold Impact', description: 'Alto contraste em tons grafite e destaque luminoso no valor e km.' },
        { id: 'showcase_trio', name: 'Editorial Showcase 3 Fotos', description: 'Grade harmoniosa de 3 fotos destacando frente, interior e traseira.' }
      ],
      priceOptions: ['preco_cheio', 'entrada_parcelas', 'sem_preco']
    });
  }

  if (pathname === '/api/tier3/instagram/status' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    return sendJson(res, 200, getInstagramConfigStatus());
  }

  if (pathname === '/api/tier3/instagram/queue' && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    const { imageUrl, caption } = body || {};
    const vehicleId = toId(body?.vehicle_id);
    if (!isId(vehicleId) || !db.prepare('SELECT id FROM vehicles WHERE id = ?').get(vehicleId)) return sendJson(res, 400, { error: 'Informe um veículo válido.' });
    if (typeof imageUrl !== 'string' || !/^https:\/\/[^\s]{4,500}$/.test(imageUrl)) return sendJson(res, 400, { error: 'A imagem precisa de um endereço público https.' });
    if (caption !== undefined && (typeof caption !== 'string' || caption.length > 2200)) return sendJson(res, 400, { error: 'Legenda inválida (até 2200 caracteres).' });

    const result = await dispatchInstagramStory({ imageUrl, vehicleId, caption });
    db.prepare(`INSERT INTO social_publications (vehicle_id, platform, status, external_media_id, response_log, published_at)
      VALUES (?, 'instagram_story', ?, ?, ?, ?)`).run(vehicleId, result.status, result.externalMediaId || null, result.message || result.error || 'Ação registrada', result.publishedAt || null);
    audit(auth.user, 'PUBLICACAO_INSTAGRAM', 'social_publications', vehicleId, { status: result.status }, ip());
    return sendJson(res, 200, result);
  }

  if (pathname === '/api/tier3/instagram/history' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    return sendJson(res, 200, db.prepare(`
      SELECT sp.*, v.title AS vehicle_title FROM social_publications sp JOIN vehicles v ON v.id = sp.vehicle_id
      ORDER BY sp.created_at DESC LIMIT 200
    `).all());
  }

  // ---------- Auditoria e LGPD ----------
  if (pathname === '/api/tier3/audit' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    const url = new URL(req.url, 'http://localhost');
    const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '100', 10) || 100));
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10) || 0);
    const action = url.searchParams.get('action');
    const rows = action
      ? db.prepare('SELECT * FROM audit_logs WHERE action = ? ORDER BY id DESC LIMIT ? OFFSET ?').all(action, limit, offset)
      : db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT ? OFFSET ?').all(limit, offset);
    return sendJson(res, 200, rows);
  }

  const lgpdExportMatch = pathname.match(/^\/api\/tier3\/lgpd\/export\/(\d+)$/);
  if (lgpdExportMatch && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    const clientId = parseInt(lgpdExportMatch[1], 10);
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
    if (!client) return sendJson(res, 404, { error: 'Cliente não encontrado.' });

    // Tudo que o sistema guarda sobre a pessoa, localizado pelo telefone ou e-mail cadastrados
    const contacts = db.prepare('SELECT id, name, phone, email, source, status, message, created_at FROM leads WHERE phone = ? OR (email IS NOT NULL AND email != \'\' AND email = ?)').all(client.phone, client.email || '');
    const account = client.email ? db.prepare('SELECT id, name, email, phone, created_at FROM customers WHERE email = ?').get(client.email) : null;
    const contracts = db.prepare('SELECT id, code, type, status, created_at FROM contracts WHERE client_id = ?').all(clientId);
    audit(auth.user, 'LGPD_EXPORTACAO_TITULAR', 'clients', clientId, { clientName: client.name }, ip());
    return sendJson(res, 200, {
      titular: {
        id: client.id, nome: client.name, cpf_completo: decryptSensitive(client.cpf_encrypted), telefone: client.phone,
        email: client.email, endereco: decryptSensitive(client.address_encrypted), observacoes: client.notes, cadastrado_em: client.created_at
      },
      contatos_comerciais: contacts,
      conta_no_site: account,
      contratos_vinculados: contracts,
      observacao: 'Exportação para atendimento de solicitação do titular (art. 18 da LGPD). A base legal de cada tratamento é definida pela loja, como controladora. Esta exportação não inclui dados de consignação, onde o titular figura como proprietário do veículo; consulte a loja.'
    });
  }

  const lgpdAnonMatch = pathname.match(/^\/api\/tier3\/lgpd\/anonymize\/(\d+)$/);
  if (lgpdAnonMatch && req.method === 'POST') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    const clientId = parseInt(lgpdAnonMatch[1], 10);
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
    if (!client) return sendJson(res, 404, { error: 'Cliente não encontrado.' });

    const scrubbed = { contatos: 0, conta_no_site: 0, solicitacoes_de_troca: 0 };
    db.exec('BEGIN');
    try {
      const leadRows = db.prepare('SELECT id FROM leads WHERE phone = ? OR (email IS NOT NULL AND email != \'\' AND email = ?)').all(client.phone, client.email || '');
      for (const lead of leadRows) {
        db.prepare("UPDATE leads SET name = 'Titular anonimizado', phone = '00000000000', email = NULL, message = NULL, simulation_data = NULL WHERE id = ?").run(lead.id);
        db.prepare('DELETE FROM lead_history WHERE lead_id = ?').run(lead.id);
        scrubbed.solicitacoes_de_troca += db.prepare("UPDATE trade_in_requests SET notes = NULL, vehicle_data = '{}' WHERE lead_id = ?").run(lead.id).changes;
        scrubbed.contatos += 1;
      }
      if (client.email) {
        const account = db.prepare('SELECT id FROM customers WHERE email = ?').get(client.email);
        if (account) {
          db.prepare('DELETE FROM customer_sessions WHERE customer_id = ?').run(account.id);
          db.prepare('DELETE FROM customer_favorites WHERE customer_id = ?').run(account.id);
          db.prepare('DELETE FROM price_alerts WHERE customer_id = ?').run(account.id);
          db.prepare("UPDATE customers SET name = 'Titular anonimizado', email = ?, phone = NULL, password_hash = 'x', active = 0 WHERE id = ?").run(`anonimizado-${account.id}@invalido.local`, account.id);
          scrubbed.conta_no_site = 1;
        }
      }
      db.prepare(`UPDATE clients SET name = 'Titular anonimizado', cpf_encrypted = ?, phone = '00000000000', email = NULL,
        address_encrypted = ?, notes = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(encryptSensitive('00000000000'), encryptSensitive(''), clientId);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
    audit(auth.user, 'LGPD_ANONIMIZACAO_TITULAR', 'clients', clientId, scrubbed, ip());
    return sendJson(res, 200, {
      message: 'Dados do titular anonimizados.',
      anonimizados: { cadastro_de_cliente: 1, ...scrubbed },
      mantidos: 'Contratos já emitidos e registros de auditoria são mantidos pelo prazo de guarda legal (art. 16 da LGPD); os documentos emitidos podem conter o nome do titular e devem ser tratados pela loja conforme sua política de retenção.'
    });
  }

  // ---------- Exportação do estoque (arquivo genérico) ----------
  if (pathname === '/api/tier3/portals/export' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });
    const url = new URL(req.url, 'http://localhost');
    const format = url.searchParams.get('format') || 'json';

    const vehicles = db.prepare(`
      SELECT v.*, ${daysInStockSql('v')} AS days_in_stock, (SELECT COUNT(*) FROM vehicle_photos p WHERE p.vehicle_id = v.id AND p.kind = 'photo') AS photos_count
      FROM vehicles v WHERE v.status = 'disponivel' AND v.is_published = 1
    `).all();

    if (format === 'csv') {
      res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="estoque.csv"' });
      return res.end('﻿' + exportVehiclesToCsv(vehicles));
    }
    for (const vehicle of vehicles) {
      vehicle.photos = db.prepare("SELECT url FROM vehicle_photos WHERE vehicle_id = ? AND kind = 'photo' ORDER BY is_cover DESC, order_index, id").all(vehicle.id).map(photo => photo.url);
    }
    const store = storeIdentity();
    return sendJson(res, 200, { manifest: getPortalAdaptersManifest(), data: exportVehiclesToJson(vehicles, { name: store.name, cnpj: store.cnpj }) });
  }

  return false;
}
