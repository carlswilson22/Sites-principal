import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { getDb, closeDb } from '../src/database/db.js';
import { runSeed } from '../src/database/seed.js';
import { handleTier2Routes } from '../src/routes/tier2Routes.js';
import { calculatePriceFinancing } from '../src/services/financeCalculator.js';

before(async () => {
  await runSeed(1);
  const db = getDb();
  const user = db.prepare("SELECT id FROM users WHERE role = 'atendente'").get();
  db.prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES ('attendance-test', ?, 'test', datetime('now', '+1 day'))").run(user.id);
});
after(() => closeDb());

test('API libera documentos básicos ao atendente em todos os modelos e preserva os bloqueios', async () => {
  const previousTier = process.env.MERCHANT_TIER;
  const db = getDb();
  const client = db.prepare('SELECT id FROM clients LIMIT 1').get();
  const vehicle = db.prepare('SELECT id FROM vehicles LIMIT 1').get();
  const request = async (path, method, body, authenticated = true) => {
    const response = { status: null, data: null, writeHead(status) { this.status = status; }, end(payload) { this.data = JSON.parse(payload); } };
    const handled = await handleTier2Routes({ url: path, method, headers: authenticated ? { authorization: 'Bearer attendance-test' } : {} }, response, path, body);
    return { ...response, handled };
  };
  try {
    for (const tier of [1, 2, 3]) {
      process.env.MERCHANT_TIER = String(tier);
      for (const type of ['compra_venda', 'recibo_sinal', 'vistoria_simples']) {
        const result = await request('/api/contracts/generate', 'POST', { type, clientId: client.id, vehicleId: vehicle.id });
        assert.equal(result.status, 201);
        assert.equal(result.data.document.type, type);
      }
      assert.equal((await request('/api/contracts', 'GET', null, false)).status, 401);
      assert.equal((await request('/api/contracts/generate', 'POST', { type: 'consignacao', clientId: client.id, vehicleId: vehicle.id })).status, 400);
      if (tier > 1) assert.equal((await request(`/api/financial/vehicles/${vehicle.id}`, 'GET')).status, 403);
      else assert.equal((await request('/api/clients', 'GET')).handled, false);
    }
    assert.equal(db.prepare('SELECT COUNT(DISTINCT code) as count FROM contracts WHERE created_by = (SELECT id FROM users WHERE role = ?)').get('atendente').count, 9);
  } finally {
    if (previousTier === undefined) delete process.env.MERCHANT_TIER;
    else process.env.MERCHANT_TIER = previousTier;
  }
});

test('API respeita financiamento com taxa zero explícita', () => {
  const result = calculatePriceFinancing({ vehiclePrice: 60000, downPayment: 12000, months: 24, monthlyInterestRate: 0 });
  assert.equal(result.installmentValue, 2000);
  assert.equal(result.totalInterest, 0);
  assert.equal(result.totalPaid, 60000);
});
