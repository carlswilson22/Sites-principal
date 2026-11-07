/**
 * server/tests/test_lote2_tier2.mjs
 * Bateria de Testes Automatizados do LOTE 2 (Modelo 2 - Nível 2: I1 a I8)
 */
import assert from 'node:assert';
import test from 'node:test';
import { getDb } from '../src/database/db.js';
import { assertTier } from '../src/middlewares/tierGate.js';
import { checkRole } from '../src/middlewares/rbacMiddleware.js';
import { calculatePriceFinancing } from '../src/services/financeCalculator.js';
import { generateVehicleDescription, estimateVehicleCosts } from '../src/services/aiDescriptionAdapter.js';
import { lookupFipe, calculatePricing } from '../src/services/fipeAdapter.js';
import { generateContractDocument } from '../src/services/contractGenerator.js';
import { encryptSensitive, decryptSensitive, maskCPF } from '../src/security/crypto.js';

test('Lote 2 (I1): Descrição por IA a partir de dados estruturados e estimativa de custos', async () => {
  const vehicle = {
    title: 'Corolla Cross',
    version: '2.0 XRE',
    year: '2023/2023',
    km: 25000,
    transmission: 'Automático',
    fuel: 'Flex',
    color: 'Prata',
    category: 'suv',
    price: 139900,
    engine: '2.0 16V',
    power: '177 cv',
    features: ['Câmera de ré', 'Ar digital', 'Piloto adaptativo'],
    tags: ['Único Dono', 'Laudo Aprovado']
  };

  // 1. Gera descrição (sempre editável)
  const desc = await generateVehicleDescription(vehicle);
  assert.ok(desc.includes('Corolla Cross'), 'Descrição deve mencionar o veículo');
  assert.ok(desc.includes('25.000') || desc.includes('25000') || desc.includes('baixa'), 'Deve referenciar quilometragem');
  assert.ok(desc.length > 100, 'Descrição deve ser rica e contextualizada');

  // 2. Estimativa de custos operacionais (consumo, tanque, revisão, seguro)
  const costs = estimateVehicleCosts(vehicle);
  assert.ok(costs.cityConsumption > 0, 'Consumo urbano deve ser estimado');
  assert.ok(costs.roadConsumption > 0, 'Consumo rodoviário deve ser estimado');
  assert.ok(costs.tankCapacity > 0, 'Capacidade do tanque deve ser estimada');
  assert.ok(costs.annualInsurance > 0, 'Seguro anual deve ser estimado');
});

test('Lote 2 (I2): CRM de Clientes com Criptografia LGPD e Histórico de Contato', () => {
  const db = getDb();

  // 1. Cadastro com criptografia de CPF e endereço
  const rawCpf = '333.444.555-66';
  const cpfEnc = encryptSensitive(rawCpf);
  const clientRes = db.prepare(`
    INSERT INTO clients (name, cpf_encrypted, phone, email, notes)
    VALUES (?, ?, '(11) 98888-7777', 'cliente.teste@exemplo.com', 'Cliente VIP')
  `).run('Cliente Teste I2', cpfEnc);

  const clientId = clientRes.lastInsertRowid;
  assert.ok(clientId > 0);

  // 2. Consulta com decriptografia e mascaramento
  const saved = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
  assert.notStrictEqual(saved.cpf_encrypted, rawCpf, 'CPF deve estar cifrado no banco');
  const decrypted = decryptSensitive(saved.cpf_encrypted);
  assert.strictEqual(decrypted, rawCpf, 'CPF deve ser decriptografado');
  assert.strictEqual(maskCPF(decrypted), '***.444.555-**', 'CPF deve ser mascarado na tela');

  // 3. Histórico de contato (timeline)
  const leadRes = db.prepare(`
    INSERT INTO leads (name, phone, status, temperature)
    VALUES ('Lead CRM Teste', '(11) 91111-2222', 'novo', 'quente')
  `).run();
  const leadId = leadRes.lastInsertRowid;

  db.prepare(`
    INSERT INTO lead_history (lead_id, user_id, action, note)
    VALUES (?, 1, 'ligacao', 'Cliente solicitou simulação com entrada de 30%')
  `).run(leadId);

  const history = db.prepare('SELECT * FROM lead_history WHERE lead_id = ?').all(leadId);
  assert.strictEqual(history.length, 1);
  assert.strictEqual(history[0].action, 'ligacao');
});

test('Lote 2 (I4): Simulador de Financiamento (Tabela Price) com valores conhecidos', () => {
  // Teste de valor conhecido:
  // Preço: R$ 100.000 | Entrada: R$ 20.000 | Financiado (PV): R$ 80.000
  // Prazo: 48 meses | Taxa: 1.49% a.m. (0.0149)
  // Fórmula Price: PMT = 80000 * [ 0.0149 * (1.0149^48) ] / [ (1.0149^48) - 1 ]
  // Valor esperado aproximado da parcela: R$ 2.348,65
  const result = calculatePriceFinancing({
    vehiclePrice: 100000,
    downPayment: 20000,
    months: 48,
    monthlyInterestRate: 1.49
  });

  assert.strictEqual(result.principal, 80000, 'Saldo a financiar deve ser R$ 80.000');
  assert.strictEqual(result.months, 48);
  // Valor exato da Tabela Price: 80000 * (0.0149 * (1.0149^48)) / ((1.0149^48) - 1) = 2344.99
  assert.strictEqual(result.installmentValue, 2344.99, 'Parcela deve ser exatamente R$ 2.344,99');
  assert.ok(result.totalInterest > 0, 'Juros totais devem ser maiores que zero');
  assert.ok(result.disclaimer.includes('Tabela Price'), 'Deve conter aviso legal de simulação');
});

test('Lote 2 (I6): Precificador Simples FIPE e cálculo de compra/venda', async () => {
  // 1. Consulta FIPE
  const fipeData = await lookupFipe({ brand: 'toyota', model: 'corolla-cross', year: '2023' });
  assert.strictEqual(fipeData.fipePrice, 138000, 'Deve retornar preço de referência da FIPE');

  // 2. Cálculo de compra e venda
  const pricing = calculatePricing({
    fipePrice: 138000,
    prepCost: 2500,
    targetMarginPct: 12
  });

  assert.strictEqual(pricing.fipePrice, 138000);
  assert.strictEqual(pricing.suggestedSalePrice, 138000);
  // Lucro esperado: 12% de 138.000 = 16.560
  assert.strictEqual(pricing.expectedProfit, 16560);
  // Compra máxima: 138.000 - 2.500 - 16.560 = 118.940
  assert.strictEqual(pricing.maxPurchasePrice, 118940);
  assert.strictEqual(pricing.purchaseToFipePct, 86.2); // ~86.2% da FIPE
});

test('Lote 2 (I7): Contratos Básicos (Compra e Venda, Recibo e Vistoria) com aviso legal', () => {
  const dealership = { nome: 'Auto-Dealership Pro', cnpj: '42.880.192/0001-90', cidade: 'Brasília', uf: 'DF' };
  const client = { name: 'Comprador Teste', cpfMasked: '***.123.456-**' };
  const vehicle = { title: 'Corolla Cross', year: '2023', price: 138000, km: 20000, color: 'Prata', transmission: 'AT', fuel: 'Flex' };

  // 1. Compra e venda
  const cvDoc = generateContractDocument({ type: 'compra_venda', dealership, client, vehicle });
  assert.ok(cvDoc.html.includes('COMPRA E VENDA'), 'Deve conter título');
  assert.ok(cvDoc.disclaimer.includes('AVISO LEGAL'), 'Deve conter aviso legal explícito');
  assert.ok(cvDoc.html.includes('138.000,00'), 'Deve conter valor formatado em BRL');

  // 2. Recibo de sinal
  const sinalDoc = generateContractDocument({ type: 'recibo_sinal', dealership, client, vehicle, terms: { signalValue: 10000 } });
  assert.ok(sinalDoc.html.includes('RECIBO DE SINAL'));
  assert.ok(sinalDoc.html.includes('10.000,00'));

  // 3. Vistoria simples (checklist)
  const vistoriaDoc = generateContractDocument({ type: 'vistoria_simples', dealership, client, vehicle });
  assert.ok(vistoriaDoc.html.includes('TERMO DE VISTORIA'));
  assert.ok(vistoriaDoc.html.includes('CRLV-e') && vistoriaDoc.html.includes('Chave Principal'));
});

test('Lote 2 (I8): Financeiro Básico e Segurança RBAC para o Proprietário', () => {
  const db = getDb();

  // Seleciona veículo
  const vehicle = db.prepare('SELECT id, price FROM vehicles LIMIT 1').get();
  assert.ok(vehicle);

  // Lança despesas categorizadas
  const insertExp = db.prepare(`
    INSERT INTO vehicle_expenses (vehicle_id, category, description, amount, expense_date, created_by)
    VALUES (?, ?, ?, ?, '2026-11-01', 1)
  `);

  insertExp.run(vehicle.id, 'mecanica', 'Troca de amortecedores e velas', 1200.00);
  insertExp.run(vehicle.id, 'estetica', 'Higienização e vitrificação', 600.00);

  const expenses = db.prepare('SELECT * FROM vehicle_expenses WHERE vehicle_id = ?').all(vehicle.id);
  assert.ok(expenses.length >= 2);

  // Validação RBAC estrita: Apenas 'proprietario' pode ver resultado financeiro
  const atendente = { role: 'atendente' };
  const gerente = { role: 'gerente' };
  const proprietario = { role: 'proprietario' };

  assert.strictEqual(checkRole(atendente, ['proprietario']).allowed, false);
  assert.strictEqual(checkRole(gerente, ['proprietario']).allowed, false);
  assert.strictEqual(checkRole(proprietario, ['proprietario']).allowed, true);
});

test('Lote 2 - Barreira de Níveis: Tier 2 acessa Nível 1 e 2, mas Tier 3 retorna 404', () => {
  // No Tier 2, acessar Tier 1 e 2 é permitido
  assert.strictEqual(assertTier(1, 2).allowed, true);
  assert.strictEqual(assertTier(2, 2).allowed, true);

  // No Tier 2, tentar acessar Tier 3 é BLOQUEADO COM 404
  const t3Check = assertTier(3, 2);
  assert.strictEqual(t3Check.allowed, false);
  assert.strictEqual(t3Check.status, 404, 'Endpoint de Nível 3 não deve existir no Nível 2 (404)');
});
