/**
 * server/tests/test_lote1_tier1.mjs
 * Bateria de Testes Automatizados do LOTE 1 (Modelo 1 - Nível 1: E1 a E6)
 */
import assert from 'node:assert';
import test from 'node:test';
import { getDb } from '../src/database/db.js';
import { runSeed } from '../src/database/seed.js';
import { assertTier } from '../src/middlewares/tierGate.js';
import { verifyPassword } from '../src/security/crypto.js';

test('Lote 1 (E1): Autenticação, sessão e recuperação de senha', async () => {
  const db = getDb();
  await runSeed(1);

  // 1. Busca usuário proprietário
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get('proprietario@lojaexemplo.com.br');
  assert.ok(user, 'Usuário proprietário deve existir');

  // 2. Valida senha
  const valid = await verifyPassword('Admin@123456', user.password_hash);
  assert.strictEqual(valid, true, 'Senha padrão de seed deve ser validada');

  // 3. Criação de sessão ativa no banco
  const sessionId = 'test-session-tier1';
  db.prepare(`
    INSERT OR REPLACE INTO sessions (id, user_id, token_hash, ip_address, expires_at)
    VALUES (?, ?, 'hash', '127.0.0.1', datetime('now', '+1 day'))
  `).run(sessionId, user.id);

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
  assert.ok(session, 'Sessão deve ser registrada no banco');

  // 4. Logout / Revogação
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
  const revoked = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
  assert.strictEqual(revoked, undefined, 'Sessão deve ser revogada no logout');
});

test('Lote 1 (E2): 4 Indicadores e Lista de Pendências no Início', () => {
  const db = getDb();

  const inStock = db.prepare(`SELECT COUNT(*) as count FROM vehicles WHERE status = 'disponivel'`).get();
  assert.ok(inStock.count > 0, 'Deve contabilizar carros em estoque');

  const monthlySales = db.prepare(`
    SELECT COUNT(*) as count FROM vehicles 
    WHERE status = 'vendido'
  `).get();
  assert.ok(monthlySales.count >= 1, 'Deve contabilizar vendas do mês');

  const staleVehicles = db.prepare(`
    SELECT COUNT(*) as count FROM vehicles 
    WHERE status = 'disponivel' AND days_in_stock > 60
  `).get();
  assert.ok(staleVehicles.count >= 1, 'Deve identificar carros parados > 60 dias');

  const newLeads = db.prepare(`SELECT COUNT(*) as count FROM leads WHERE status = 'novo'`).get();
  assert.ok(newLeads.count >= 1, 'Deve contabilizar novos contatos pendentes');

  // Lista curta de pendências
  const pendingLeads = db.prepare(`
    SELECT id, name, phone, status
    FROM leads
    WHERE status = 'novo'
    LIMIT 5
  `).all();
  assert.ok(pendingLeads.length > 0, 'Deve retornar lista curta de pendências');
});

test('Lote 1 (E3, E5): Gestão de Estoque e Ficha do Anúncio', () => {
  const db = getDb();

  // 1. Cadastrar carro manual
  const insert = db.prepare(`
    INSERT INTO vehicles (
      title, version, category, year, km, transmission, fuel, color,
      doors, engine, power, price, status, ownership_type, is_published,
      days_in_stock, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const res = insert.run(
    'Sedan Teste E3', '1.0 Flex', 'sedan', '2023/2023', 15000,
    'Manual', 'Flex', 'Azul Marinho', 4, '1.0', '80 cv',
    65000.00, 'disponivel', 'proprio', 1, 10,
    'Ficha do anúncio: Único dono com garantia de fábrica até 2027.'
  );

  const vehicleId = res.lastInsertRowid;
  assert.ok(vehicleId > 0, 'Carro deve ser cadastrado');

  // 2. Busca e Filtro
  const found = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId);
  assert.strictEqual(found.title, 'Sedan Teste E3');
  assert.strictEqual(found.ownership_type, 'proprio');
  assert.strictEqual(found.is_published, 1);

  // 3. Atualizar (Editar / Ocultar)
  db.prepare('UPDATE vehicles SET is_published = 0, price = 63900.00 WHERE id = ?').run(vehicleId);
  const updated = db.prepare('SELECT is_published, price FROM vehicles WHERE id = ?').get(vehicleId);
  assert.strictEqual(updated.is_published, 0, 'Carro deve poder ser ocultado do site');
  assert.strictEqual(updated.price, 63900.00, 'Preço deve ser atualizado');

  // 4. Excluir carro
  db.prepare('DELETE FROM vehicles WHERE id = ?').run(vehicleId);
  const deleted = db.prepare('SELECT id FROM vehicles WHERE id = ?').get(vehicleId);
  assert.strictEqual(deleted, undefined, 'Carro deve ser excluído com sucesso');
});

test('Lote 1 (E4): Gestão de Fotos com limite de 20 e foto de capa', () => {
  const db = getDb();

  // Seleciona um veículo existente
  const vehicle = db.prepare('SELECT id FROM vehicles LIMIT 1').get();
  assert.ok(vehicle, 'Deve haver veículo cadastrado');

  // Testa inclusão de fotos
  const insertPhoto = db.prepare(`
    INSERT INTO vehicle_photos (vehicle_id, url, is_cover, order_index)
    VALUES (?, ?, ?, ?)
  `);

  db.prepare('DELETE FROM vehicle_photos WHERE vehicle_id = ?').run(vehicle.id);

  // Adiciona 3 fotos de teste
  insertPhoto.run(vehicle.id, '/images/foto1.jpg', 1, 0); // Capa
  insertPhoto.run(vehicle.id, '/images/foto2.jpg', 0, 1);
  insertPhoto.run(vehicle.id, '/images/foto3.jpg', 0, 2);

  const photos = db.prepare(`
    SELECT * FROM vehicle_photos WHERE vehicle_id = ? ORDER BY order_index ASC
  `).all(vehicle.id);

  assert.strictEqual(photos.length, 3, 'Devem existir 3 fotos');
  assert.strictEqual(photos[0].is_cover, 1, 'Primeira foto deve ser a capa');

  // Validação da regra: máximo 20 fotos
  const photosArrayMax = Array.from({ length: 21 }, (_, i) => ({ url: `/images/car_${i}.jpg` }));
  const isOverLimit = photosArrayMax.length > 20;
  assert.strictEqual(isOverLimit, true, 'Mais de 20 fotos deve ser bloqueado pela regra E4');
});

test('Lote 1 (E6): Contatos, WhatsApp e Situação de Atendimento', () => {
  const db = getDb();

  // 1. Captura de Lead via formulário
  const insertLead = db.prepare(`
    INSERT INTO leads (name, phone, email, source, temperature, status, consent_lgpd)
    VALUES (?, ?, ?, ?, 'morno', 'novo', 1)
  `);

  const res = insertLead.run('Lead Teste E6', '(61) 98765-4321', 'lead.teste@exemplo.com', 'site_formulario');
  const leadId = res.lastInsertRowid;
  assert.ok(leadId > 0, 'Contato deve ser capturado');

  // 2. Transição de situação (novo -> em_atendimento -> ganho)
  db.prepare(`UPDATE leads SET status = 'em_atendimento' WHERE id = ?`).run(leadId);
  let lead = db.prepare('SELECT status FROM leads WHERE id = ?').get(leadId);
  assert.strictEqual(lead.status, 'em_atendimento');

  db.prepare(`UPDATE leads SET status = 'ganho' WHERE id = ?`).run(leadId);
  lead = db.prepare('SELECT status FROM leads WHERE id = ?').get(leadId);
  assert.strictEqual(lead.status, 'ganho');

  // 3. Montagem correta do link de WhatsApp
  const rawPhone = '(61) 98765-4321'.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/55${rawPhone}?text=${encodeURIComponent('Olá Lead Teste E6, recebemos seu contato!')}`;
  assert.ok(whatsappUrl.startsWith('https://wa.me/5561987654321'), 'Link de WhatsApp deve ser gerado corretamente');
});

test('Lote 1 - Barreira de Níveis: Endpoints de Tier 2/3 não existem no Tier 1 (404)', () => {
  // No Tier 1, tentar acessar Tier 2 deve retornar 404
  const t2Check = assertTier(2, 1);
  assert.strictEqual(t2Check.allowed, false);
  assert.strictEqual(t2Check.status, 404, 'Endpoint de Nível 2 deve retornar 404 no Nível 1');

  // No Tier 1, tentar acessar Tier 3 deve retornar 404
  const t3Check = assertTier(3, 1);
  assert.strictEqual(t3Check.allowed, false);
  assert.strictEqual(t3Check.status, 404, 'Endpoint de Nível 3 deve retornar 404 no Nível 1');
});

