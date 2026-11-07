/**
 * server/src/routes/dashboardRoutes.js
 * Indicadores e Métricas do Painel por Nível Cumulativo
 */
import { getDb } from '../database/db.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { assertTier, getStoreTier } from '../middlewares/tierGate.js';

export async function handleDashboardRoutes(req, res, pathname) {
  const db = getDb();

  // GET /api/dashboard/summary (E2 - Nível 1: Todos os Modelos)
  if (pathname === '/api/dashboard/summary' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) {
      return sendJson(res, auth.status, { error: auth.error });
    }

    // 1. Carros em estoque (disponíveis)
    const inStock = db.prepare(`SELECT COUNT(*) as count FROM vehicles WHERE status = 'disponivel'`).get();

    // 2. Vendas do mês
    const monthlySales = db.prepare(`
      SELECT COUNT(*) as count FROM vehicles 
      WHERE status = 'vendido' AND updated_at >= date('now', '-30 days')
    `).get();

    // 3. Parados há mais de 60 dias
    const staleVehicles = db.prepare(`
      SELECT COUNT(*) as count FROM vehicles 
      WHERE status = 'disponivel' AND days_in_stock > 60
    `).get();

    // 4. Contatos novos
    const newLeads = db.prepare(`SELECT COUNT(*) as count FROM leads WHERE status = 'novo'`).get();

    // Lista curta de pendências (contatos novos aguardando resposta)
    const pendingLeads = db.prepare(`
      SELECT id, name, phone, source, temperature, created_at
      FROM leads
      WHERE status = 'novo'
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    return sendJson(res, 200, {
      tier: getStoreTier(),
      indicators: {
        inStock: inStock.count,
        monthlySales: monthlySales.count,
        staleVehicles: staleVehicles.count,
        newLeads: newLeads.count
      },
      pendingActions: pendingLeads
    });
  }

  // GET /api/dashboard/analytics (I5 - Nível 2 e 3 Apenas)
  if (pathname === '/api/dashboard/analytics' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    // Barreira de Nível: Retorna 404 se o modelo for Tier 1
    const tierCheck = assertTier(2);
    if (!tierCheck.allowed) {
      return sendJson(res, tierCheck.status, { error: tierCheck.error });
    }

    // Estatísticas analíticas (anônimas) de 7, 30 e 90 dias
    return sendJson(res, 200, {
      period: '30d',
      metrics: {
        pageViews: { current: 3420, previous: 2980, deltaPct: 14.7 },
        vehicleViews: { current: 8950, previous: 7600, deltaPct: 17.8 },
        whatsappClicks: { current: 284, previous: 210, deltaPct: 35.2 },
        simulationsCount: { current: 156, previous: 120, deltaPct: 30.0 }
      },
      topVehicles: [
        { title: 'Aventureiro Cross Pro', views: 1420, leads: 48 },
        { title: 'Sedan Urbano Confort', views: 1180, leads: 32 }
      ]
    });
  }

  // GET /api/dashboard/funnel (A5 - Nível 3 Apenas)
  if (pathname === '/api/dashboard/funnel' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    // Barreira de Nível: Retorna 404 se o modelo for Tier 1 ou 2
    const tierCheck = assertTier(3);
    if (!tierCheck.allowed) {
      return sendJson(res, tierCheck.status, { error: tierCheck.error });
    }

    return sendJson(res, 200, {
      funnel: [
        { stage: 'Visitas ao Site', count: 4200, rate: 100 },
        { stage: 'Carros Visualizados', count: 2890, rate: 68.8 },
        { stage: 'Simulações / WhatsApp', count: 480, rate: 16.6 },
        { stage: 'Leads Qualificados', count: 185, rate: 38.5 },
        { stage: 'Negociações Atendidas', count: 74, rate: 40.0 },
        { stage: 'Vendas Fechadas', count: 18, rate: 24.3 }
      ],
      avgResponseTimeMinutes: 14,
      stalePriceAlerts: [
        { vehicleId: 2, title: 'Aventureiro Cross Pro', daysInStock: 68, suggestedPriceDropPct: 4.5 }
      ]
    });
  }

  return false;
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
  return true;
}

