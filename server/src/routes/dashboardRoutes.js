/**
 * server/src/routes/dashboardRoutes.js
 * Indicadores e Métricas do Painel por Nível Cumulativo
 */
import { daysInStockSql } from './util.js';
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
      WHERE status = 'vendido' AND COALESCE(sold_at, updated_at) >= date('now', '-30 days')
    `).get();

    // 3. Parados há mais de 60 dias
    const staleVehicles = db.prepare(`
      SELECT COUNT(*) as count FROM vehicles 
      WHERE status = 'disponivel' AND ${daysInStockSql()} > 60
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
    if (!tierCheck.allowed && !req.moduleApproved) {
      return sendJson(res, tierCheck.status, { error: tierCheck.error });
    }

    const url = new URL(req.url, 'http://localhost');
    const days = [7, 30, 90].includes(Number(url.searchParams.get('days'))) ? Number(url.searchParams.get('days')) : 30;
    const now = Date.now();
    const since = new Date(now - days * 86400000).toISOString();
    const before = new Date(now - 2 * days * 86400000).toISOString();
    const count = (type, from, to) => db.prepare('SELECT COUNT(*) AS n FROM access_events WHERE type = ? AND created_at >= ? AND created_at < ?').get(type, from, to).n;
    const nowIso = new Date(now + 1000).toISOString();
    const metric = type => {
      const current = count(type, since, nowIso);
      const previous = count(type, before, since);
      return { current, previous, deltaPct: previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : null };
    };
    const metrics = { pageViews: metric('page_view'), vehicleViews: metric('vehicle_view'), whatsappClicks: metric('whatsapp_click') };
    const total = Object.values(metrics).reduce((sum, item) => sum + item.current + item.previous, 0);
    const topVehicles = db.prepare(`
      SELECT v.id, v.title,
        SUM(CASE WHEN e.type = 'vehicle_view' THEN 1 ELSE 0 END) AS views,
        SUM(CASE WHEN e.type = 'whatsapp_click' THEN 1 ELSE 0 END) AS whatsapp
      FROM access_events e JOIN vehicles v ON v.id = e.vehicle_id
      WHERE e.created_at >= ? GROUP BY v.id ORDER BY views DESC, whatsapp DESC LIMIT 5
    `).all(since);
    return sendJson(res, 200, { hasData: total > 0, period: `${days}d`, metrics, topVehicles });
  }

  // GET /api/dashboard/funnel (A5 - Nível 3 Apenas)
  if (pathname === '/api/dashboard/funnel' && req.method === 'GET') {
    const auth = authenticate(req);
    if (!auth.authenticated) return sendJson(res, auth.status, { error: auth.error });

    // Barreira de Nível: Retorna 404 se o modelo for Tier 1 ou 2
    const tierCheck = assertTier(3);
    if (!tierCheck.allowed && !req.moduleApproved) {
      return sendJson(res, tierCheck.status, { error: tierCheck.error });
    }

    const count = sql => db.prepare(sql).get().count || 0;
    const totalLeads = count('SELECT COUNT(*) as count FROM leads');
    return sendJson(res, 200, {
      hasData: totalLeads > 0,
      funnel: [
        { stage: 'Contatos recebidos', count: totalLeads },
        { stage: 'Em atendimento ou ganhos', count: count("SELECT COUNT(*) as count FROM leads WHERE status IN ('em_atendimento','ganho')") },
        { stage: 'Vendas fechadas', count: count("SELECT COUNT(*) as count FROM leads WHERE status = 'ganho'") }
      ],
      avgResponseTimeMinutes: null
    });
  }

  return false;
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
  return true;
}

