import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardMetrics, demoSalesFunnel } from '../src/utils/dashboardMetrics.js';

test('indicadores e gráfico incluem as mesmas vendas dos últimos 30 dias', () => {
  const now = Date.parse('2026-11-20T12:00:00Z');
  const day = 86400000;
  const vehicles = [
    { status: 'disponivel', days_in_stock: 0, price: 50000 },
    { status: 'disponivel', days_in_stock: 80, price: 70000 },
    ...[0, 7, 14, 21, 29, 30, -1].map(days => ({ status: 'vendido', title: `Venda ${days}`, sale_price: 10000, sold_at: new Date(now - days * day).toISOString() })),
  ];
  const result = dashboardMetrics(vehicles, [{ status: 'novo' }, { status: 'em_atendimento' }, { status: 'ganho' }], 'autoelite', { now });
  assert.equal(result.indicators.monthlySales, 5);
  assert.deepEqual(result.weeks, [2, 1, 1, 1]);
  assert.equal(result.weeks.reduce((sum, value) => sum + value, 0), result.indicators.monthlySales);
  assert.equal(result.indicators.revenue, 50000);
  assert.equal(result.indicators.averageStockDays, 40);
  assert.equal(result.indicators.staleVehicles, 1);
  assert.deepEqual(result.funnel.map(item => item.count), [3, 1, 1]);
});

test('funil de exemplo acompanha contatos e carros parados da loja', () => {
  const vehicles = [{ id: 9, title: 'Carro em estoque', status: 'disponivel', days_in_stock: 95, price: 100000 }];
  const leads = [{ status: 'ganho', source: 'simulador_financiamento' }, { status: 'novo', source: 'formulario_site' }];
  const result = demoSalesFunnel(vehicles, leads);
  assert.deepEqual(result.funnelSteps.map(step => step.count), [2, 1, 1, 1]);
  assert.equal(result.staleVehiclesAlert.vehicles[0].suggestedNewPrice, 93000);
  assert.equal(result.averageResponseTimeMinutes, null);
});

test('dados de venda fictícios entram somente na demonstração e por loja', () => {
  const now = Date.parse('2026-11-20T12:00:00Z');
  assert.equal(dashboardMetrics([], [], 'autoelite', { now }).indicators.monthlySales, 0);
  const sample = dashboardMetrics([], [], 'autoelite', { demo: true, now });
  assert.equal(sample.indicators.monthlySales, 7);
  assert.equal(sample.weeks.reduce((sum, value) => sum + value, 0), 7);
  assert.equal(dashboardMetrics([], [], 'unknown', { demo: true, now }).indicators.monthlySales, 0);
});
