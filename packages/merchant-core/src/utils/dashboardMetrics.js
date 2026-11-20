import { demoSales } from '../data/demoShowcase.js';

const DAY = 24 * 60 * 60 * 1000;

/** Indicadores da mesma janela de 30 dias; exemplos são exclusivos da demonstração. */
export function dashboardMetrics(vehicles = [], leads = [], storeKey, { demo = false, now = Date.now() } = {}) {
  const stock = vehicles.filter(vehicle => vehicle.status !== 'vendido');
  const sales = vehicles.filter(vehicle => vehicle.status === 'vendido').map(vehicle => ({
    model: vehicle.nome || vehicle.title,
    value: Number(vehicle.sale_price ?? vehicle.preco ?? vehicle.price) || 0,
    soldAt: vehicle.soldAt || vehicle.sold_at || vehicle.updatedAt,
  }));
  if (demo) sales.push(...demoSales(storeKey, now));
  const recent = sales.map(sale => ({ ...sale, timestamp: Date.parse(sale.soldAt) }))
    .filter(sale => Number.isFinite(sale.timestamp) && sale.timestamp <= now && sale.timestamp > now - 30 * DAY)
    .map(sale => ({ ...sale, daysAgo: Math.floor((now - sale.timestamp) / DAY) }))
    .sort((a, b) => b.timestamp - a.timestamp);
  const revenue = recent.reduce((sum, sale) => sum + sale.value, 0);
  const weeks = [
    recent.filter(sale => sale.daysAgo >= 21).length,
    recent.filter(sale => sale.daysAgo >= 14 && sale.daysAgo < 21).length,
    recent.filter(sale => sale.daysAgo >= 7 && sale.daysAgo < 14).length,
    recent.filter(sale => sale.daysAgo < 7).length,
  ];
  return {
    indicators: {
      inStock: stock.length,
      monthlySales: recent.length,
      staleVehicles: stock.filter(vehicle => Number(vehicle.days_in_stock) > 60).length,
      newLeads: leads.filter(lead => lead.status === 'novo').length,
      revenue,
      stockValue: stock.reduce((sum, vehicle) => sum + (Number(vehicle.preco ?? vehicle.price) || 0), 0),
      averageTicket: recent.length ? revenue / recent.length : 0,
      averageStockDays: stock.length ? Math.round(stock.reduce((sum, vehicle) => sum + (Number(vehicle.days_in_stock) || 0), 0) / stock.length) : 0,
    },
    weeks,
    recentSales: recent.slice(0, 4),
    funnel: [
      { label: 'Contatos recebidos', count: leads.length },
      { label: 'Em atendimento', count: leads.filter(lead => lead.status === 'em_atendimento').length },
      { label: 'Contatos ganhos', count: leads.filter(lead => lead.status === 'ganho').length },
    ],
  };
}

/** Dados do funil de demonstração são derivados dos contatos e do estoque da loja. */
export function demoSalesFunnel(vehicles = [], leads = []) {
  const stale = vehicles.filter(vehicle => vehicle.status === 'disponivel' && Number(vehicle.days_in_stock) > 60)
    .map(vehicle => {
      const days = Number(vehicle.days_in_stock);
      const price = Number(vehicle.price ?? vehicle.preco) || 0;
      const discount = days > 90 ? 7 : 4;
      return { id: vehicle.id, title: vehicle.title || vehicle.nome, price, days_in_stock: days,
        suggestedDiscountPercent: discount, suggestedNewPrice: Math.round(price * (1 - discount / 100)) };
    });
  return {
    hasData: leads.length > 0,
    funnelSteps: [
      { step: 'Contatos recebidos', count: leads.length },
      { step: 'Simulações de financiamento', count: leads.filter(lead => lead.source === 'simulador_financiamento').length },
      { step: 'Em atendimento ou ganhos', count: leads.filter(lead => ['em_atendimento', 'ganho'].includes(lead.status)).length },
      { step: 'Contatos ganhos', count: leads.filter(lead => lead.status === 'ganho').length },
    ],
    averageResponseTimeMinutes: null,
    staleVehiclesAlert: { totalStale: stale.length, vehicles: stale,
      rule: 'Sugestão por regra fixa: acima de 60 dias, 4%; acima de 90 dias, 7%. Não é uma avaliação de mercado.' },
  };
}
