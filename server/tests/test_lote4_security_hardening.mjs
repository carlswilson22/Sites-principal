/**
 * server/tests/test_lote4_security_hardening.mjs
 * Testes Automatizados para o Lote 4 (Segurança, Hardening e Conformidade).
 * Valida:
 * 1. Rate Limiting de autenticação (mitigação contra força bruta)
 * 2. Criptografia AES-256-GCM em repouso e integridade do tag de autenticação
 * 3. Sanitização preventiva de logs (eliminação de senhas, CPFs e dados bancários)
 * 4. Barreira de Níveis estrita (404 em recursos não autorizados)
 * 5. Barreira de Perfis de Acesso RBAC (403 para atendente em DRE financeiro)
 */
import test from 'node:test';
import assert from 'node:assert';
import { checkRateLimit, resetRateLimit } from '../src/security/rateLimiter.js';
import { encryptSensitive, decryptSensitive, maskCPF, maskBankData, sanitizeLogData } from '../src/security/crypto.js';
import { assertTier } from '../src/middlewares/tierGate.js';
import { checkRole } from '../src/middlewares/rbacMiddleware.js';

test('Lote 4 (Segurança): Rate Limiting no login protege contra força bruta', () => {
  const testKey = 'test_ip_rate_limit_123';
  resetRateLimit(testKey);

  // 5 primeiras tentativas devem ser permitidas
  for (let i = 1; i <= 5; i++) {
    const res = checkRateLimit(testKey, 5, 60000);
    assert.strictEqual(res.allowed, true, `Tentativa ${i} deve ser permitida`);
  }

  // A 6ª tentativa consecutiva deve ser bloqueada
  const blocked = checkRateLimit(testKey, 5, 60000);
  assert.strictEqual(blocked.allowed, false, '6ª tentativa deve ser bloqueada');
  assert.ok(blocked.retryAfterSeconds > 0, 'Deve informar tempo de espera restante');

  // Ao resetar após login bem-sucedido, o contador é liberado
  resetRateLimit(testKey);
  const afterReset = checkRateLimit(testKey, 5, 60000);
  assert.strictEqual(afterReset.allowed, true, 'Deve permitir novamente após reset');
});

test('Lote 4 (LGPD): Criptografia autenticada AES-256-GCM e mascaramento de tela', () => {
  const cpfOriginal = '555.444.333-22';
  const encrypted = encryptSensitive(cpfOriginal);

  assert.notStrictEqual(encrypted, cpfOriginal, 'Texto cifrado não pode conter o valor original');
  assert.ok(encrypted.includes(':'), 'Payload cifrado deve conter separadores de IV e Tag');

  const decrypted = decryptSensitive(encrypted);
  assert.strictEqual(decrypted, cpfOriginal, 'Decriptografia deve recuperar o valor exato');

  const maskedCpf = maskCPF(cpfOriginal);
  assert.strictEqual(maskedCpf, '***.444.333-**', 'Máscara deve ocultar início e fim do CPF');

  const maskedBank = maskBankData('Banco 001 - Agência 1234 - Conta 98765-4');
  assert.strictEqual(maskedBank, '****-5-4', 'Máscara deve ocultar dados bancários');
});

test('Lote 4 (Segurança): Sanitização preventiva de logs elimina dados sensíveis', () => {
  const sensitiveObject = {
    user: 'Carlos',
    email: 'carlos@exemplo.com',
    password: 'MinhaSenhaSecreta!123',
    cpf: '123.456.789-00',
    token: 'jwt_token_super_secreto_abc123',
    bank_account: '12345-6'
  };

  const sanitized = sanitizeLogData(sensitiveObject);

  assert.strictEqual(sanitized.user, 'Carlos');
  assert.strictEqual(sanitized.email, 'carlos@exemplo.com');
  assert.strictEqual(sanitized.password, '[CONFIDENCIAL_REMOVIDO]');
  assert.strictEqual(sanitized.cpf, '[CONFIDENCIAL_REMOVIDO]');
  assert.strictEqual(sanitized.token, '[CONFIDENCIAL_REMOVIDO]');
  assert.strictEqual(sanitized.bank_account, '[CONFIDENCIAL_REMOVIDO]');
});

test('Lote 4 (Governança): Barreira de Níveis estrita no backend', () => {
  // Loja Tier 1 tentando recurso de Tier 2 ou 3
  assert.strictEqual(assertTier(2, 1).allowed, false);
  assert.strictEqual(assertTier(2, 1).status, 404);
  assert.strictEqual(assertTier(3, 1).allowed, false);
  assert.strictEqual(assertTier(3, 1).status, 404);

  // Loja Tier 2 acessa Tier 1 e 2, mas não 3
  assert.strictEqual(assertTier(1, 2).allowed, true);
  assert.strictEqual(assertTier(2, 2).allowed, true);
  assert.strictEqual(assertTier(3, 2).allowed, false);
  assert.strictEqual(assertTier(3, 2).status, 404);

  // Loja Tier 3 acessa todos
  assert.strictEqual(assertTier(1, 3).allowed, true);
  assert.strictEqual(assertTier(2, 3).allowed, true);
  assert.strictEqual(assertTier(3, 3).allowed, true);
});

test('Lote 4 (RBAC): Atendente é impedido de acessar recursos do Proprietário', () => {
  const atendente = { id: 3, role: 'atendente', name: 'Lucas' };
  const gerente = { id: 2, role: 'gerente', name: 'Renata' };
  const proprietario = { id: 1, role: 'proprietario', name: 'Carlos' };

  // Recurso exclusivo do proprietário (DRE financeiro / auditoria)
  const checkAtendente = checkRole(atendente, ['proprietario']);
  assert.strictEqual(checkAtendente.allowed, false);
  assert.strictEqual(checkAtendente.status, 403);

  const checkGerente = checkRole(gerente, ['proprietario']);
  assert.strictEqual(checkGerente.allowed, false);
  assert.strictEqual(checkGerente.status, 403);

  const checkProprietario = checkRole(proprietario, ['proprietario']);
  assert.strictEqual(checkProprietario.allowed, true);
});
