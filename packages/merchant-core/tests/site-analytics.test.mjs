import test from 'node:test';
import assert from 'node:assert/strict';
import { siteAnalytics, summarizeAnalytics } from '../src/services/siteAnalytics.js';

test('métricas respeitam período, separam veículos e não contam eventos futuros', () => {
  const now = Date.parse('2026-11-10T12:00:00Z');
  const recent = '2026-11-09T12:00:00Z';
  const events = [
    { type: 'page_view', created_at: recent },
    { type: 'vehicle_view', vehicle_id: '7', created_at: recent },
    { type: 'vehicle_view', vehicle_id: 7, created_at: recent },
    { type: 'whatsapp_click', vehicle_id: 7, created_at: recent },
    { type: 'whatsapp_click', created_at: recent },
    { type: 'vehicle_view', vehicle_id: 8, created_at: '2026-10-15T12:00:00Z' },
    { type: 'page_view', created_at: '2026-11-11T12:00:00Z' },
  ];
  const summary = summarizeAnalytics(events, [{ id: 7, nome: 'Veículo de teste' }], 7, now);
  assert.equal(summary.pageViews, 1);
  assert.equal(summary.vehicleViews, 2);
  assert.equal(summary.whatsappClicks, 2);
  assert.deepEqual(summary.ranking, [{ id: '7', title: 'Veículo de teste', views: 2, whatsapp: 1 }]);
  assert.equal(summarizeAnalytics(events, [], 30, now).vehicleViews, 3);
});

test('registro é isolado por loja e descarta campos pessoais não permitidos', () => {
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  globalThis.window = { dispatchEvent() {} };
  globalThis.CustomEvent = class { constructor(type, options) { this.detail = options.detail; } };
  assert(siteAnalytics.track('drivenow', { type: 'whatsapp_click', vehicleId: 2, phone: '11999999999', name: 'Privado', message: 'Privada' }));
  const [event] = siteAnalytics.getEvents('drivenow');
  assert.equal(event.vehicle_id, '2');
  assert.equal(event.phone, undefined);
  assert.equal(event.name, undefined);
  assert.equal(event.message, undefined);
  assert.deepEqual(siteAnalytics.getEvents('apexluxury'), []);
  const previous = values.get('store_analytics_drivenow');
  localStorage.setItem = () => { throw new Error('Quota'); };
  assert.equal(siteAnalytics.track('drivenow', { type: 'page_view' }), false);
  assert.equal(values.get('store_analytics_drivenow'), previous);
});
