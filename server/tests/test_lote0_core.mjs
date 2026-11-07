/**
 * server/tests/test_lote0_core.mjs
 * Bateria de testes automatizados do Lote 0:
 * - Criptografia AES-256-GCM e hash scrypt
 * - Mascaramento de dados para LGPD
 * - Barreira de níveis (TierGate)
 * - RBAC (proprietário, gerente, atendente)
 * - Banco SQLite e seed demonstrativo
 */
import assert from 'node:assert';
import test from 'node:test';
import { hashPassword, verifyPassword, encryptSensitive, decryptSensitive, maskCPF, maskBankData } from '../src/security/crypto.js';
import { assertTier } from '../src/middlewares/tierGate.js';
import { checkRole } from '../src/middlewares/rbacMiddleware.js';
import { getDb, closeDb } from '../src/database/db.js';
import { runSeed } from '../src/database/seed.js';

test('Lote 0 - Segurança: Hash de senha scrypt deve ser forte e timing-safe', async () => {
  const plainPassword = 'TesteSenhaSegura@2026';
  const hashed = await hashPassword(plainPassword);

  assert.ok(hashed.includes(':'), 'Hash deve conter salt e chave derivados');
  const isValid = await verifyPassword(plainPassword, hashed);
  assert.strictEqual(isValid, true, 'Senha correta deve ser validada');

  const isInvalid = await verifyPassword('SenhaErrada123', hashed);
  assert.strictEqual(isInvalid, false, 'Senha incorreta deve ser rejeitada');
});

test('Lote 0 - Segurança LGPD: Criptografia AES-256-GCM em repouso e mascaramento', () => {
  const cpfOriginal = '123.456.789-01';
  const encrypted = encryptSensitive(cpfOriginal);

  assert.notStrictEqual(encrypted, cpfOriginal, 'Texto criptografado deve diferir do original');
  assert.ok(encrypted.includes(':'), 'Formato deve conter IV, AuthTag e Ciphertext');

  const decrypted = decryptSensitive(encrypted);
  assert.strictEqual(decrypted, cpfOriginal, 'Decriptografia deve recuperar o valor exato');

  // Teste de mascaramento em tela
  const maskedCPF = maskCPF(cpfOriginal);
  assert.strictEqual(maskedCPF, '***.456.789-**', 'CPF deve ser mascarado ocultando os 3 primeiros e 2 últimos dígitos');

  const maskedBank = maskBankData('12345-6');
  assert.strictEqual(maskedBank, '****-5-6', 'Dados bancários devem preservar apenas sufixo final');
});

test('Lote 0 - Barreira de Níveis (TierGate): Nível inferior deve receber 404 em recursos superiores', () => {
  // Loja configurada no Tier 1 tentando acessar recurso de Tier 1: PERMITIDO
  const checkT1onT1 = assertTier(1, 1);
  assert.strictEqual(checkT1onT1.allowed, true);

  // Loja configurada no Tier 1 tentando acessar recurso de Tier 2: BLOQUEADO COM 404
  const checkT2onT1 = assertTier(2, 1);
  assert.strictEqual(checkT2onT1.allowed, false);
  assert.strictEqual(checkT2onT1.status, 404, 'Endpoint de Tier 2 não deve existir no Tier 1 (404)');

  // Loja configurada no Tier 2 tentando acessar recurso de Tier 3: BLOQUEADO COM 404
  const checkT3onT2 = assertTier(3, 2);
  assert.strictEqual(checkT3onT2.allowed, false);
  assert.strictEqual(checkT3onT2.status, 404, 'Endpoint de Tier 3 não deve existir no Tier 2 (404)');

  // Loja configurada no Tier 3 acessando recursos de Tier 1, 2 e 3: PERMITIDO (Cumulativo)
  assert.strictEqual(assertTier(1, 3).allowed, true);
  assert.strictEqual(assertTier(2, 3).allowed, true);
  assert.strictEqual(assertTier(3, 3).allowed, true);
});

test('Lote 0 - RBAC: Atendente não acessa áreas restritas do Proprietário', () => {
  const atendenteUser = { id: 3, name: 'Lucas', role: 'atendente' };
  const gerenteUser = { id: 2, name: 'Renata', role: 'gerente' };
  const proprietarioUser = { id: 1, name: 'Carlos', role: 'proprietario' };

  // Recurso exclusivo do proprietário (ex: DRE Financeiro / Exclusão de loja)
  const financialCheckAtendente = checkRole(atendenteUser, ['proprietario']);
  assert.strictEqual(financialCheckAtendente.allowed, false);
  assert.strictEqual(financialCheckAtendente.status, 403);

  const financialCheckGerente = checkRole(gerenteUser, ['proprietario']);
  assert.strictEqual(financialCheckGerente.allowed, false);

  const financialCheckProprietario = checkRole(proprietarioUser, ['proprietario']);
  assert.strictEqual(financialCheckProprietario.allowed, true);

  // Recurso compartilhado (estoque / leads)
  const stockCheckAtendente = checkRole(atendenteUser, ['proprietario', 'gerente', 'atendente']);
  assert.strictEqual(stockCheckAtendente.allowed, true);
});

test('Lote 0 - Banco de Dados: SQLite inicializa tabelas e carrega seed demonstrativo', async () => {
  const db = getDb();
  const seedResult = await runSeed(1);
  assert.ok(seedResult.message, 'Seed executado com retorno');

  const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
  assert.ok(users.count >= 3, 'Deve haver pelo menos 3 usuários semeados (proprietário, gerente, atendente)');

  const vehicles = db.prepare('SELECT COUNT(*) as count FROM vehicles').get();
  assert.ok(vehicles.count >= 4, 'Deve haver veículos de demonstração');

  const leads = db.prepare('SELECT COUNT(*) as count FROM leads').get();
  assert.ok(leads.count >= 2, 'Deve haver contatos de teste');
});

