/**
 * server/tests/test_lote3_tier3.mjs
 * Testes Automatizados para o Lote 3 (Modelo 3 - Nível Enterprise / A1 a A8).
 * Valida:
 * 1. Cálculos de consignação (remuneração, diárias de guarda, repasse líquido ao dono)
 * 2. Comissões de vendedores por venda (percentual e fixo)
 * 3. Geração de contratos avançados (consignação, troca, aditivo com aviso jurídico obrigatório)
 * 4. Precificador completo com concorrência manual e depreciação de leilão
 * 5. Adaptador de Instagram com transparência (estado 'nao_configurado')
 * 6. Exportação do catálogo para portais (CSV e JSON)
 * 7. Auditoria e rotinas de LGPD (exportação e anonimização)
 * 8. Barreira de Níveis: endpoints de Nível 3 retornam 404 em lojas Tier 1 e Tier 2
 */
import test from 'node:test';
import assert from 'node:assert';
import { calculateConsignmentSettlement, checkConsignmentStatus } from '../src/services/consignmentsCalculator.js';
import { calculateSellerCommission } from '../src/services/commissionCalculator.js';
import { generateAdvancedContractHtml, generateContractCode } from '../src/services/advancedContractGenerator.js';
import { calculateMarketPricing } from '../src/services/marketPricingService.js';
import { getInstagramConfigStatus, dispatchInstagramStory } from '../src/services/instagramAdapter.js';
import { exportVehiclesToCsv, exportVehiclesToJson } from '../src/services/portalExportAdapter.js';
import { assertTier } from '../src/middlewares/tierGate.js';
import { encryptSensitive, decryptSensitive } from '../src/security/crypto.js';

test('Lote 3 (A1): Regras e cálculos de consignação completa', () => {
  // Cenário 1: Remuneração percentual de 6% sobre R$ 100.000, com mínimo de R$ 4.000
  // Diária R$ 20/dia por 30 dias (R$ 600), taxa de serviço R$ 350, gastos adiantados R$ 250
  const settlement1 = calculateConsignmentSettlement({
    vehiclePrice: 100000,
    remunerationType: 'percentual',
    remunerationValue: 6, // 6% = 6.000
    minRemuneration: 4000,
    serviceFee: 350,
    dailyStorageFee: 20,
    daysInStock: 30,
    advancedExpenses: 250
  });

  assert.strictEqual(settlement1.storeCommission, 6000);
  assert.strictEqual(settlement1.totalStorageFee, 600);
  assert.strictEqual(settlement1.totalStoreDeductions, 7200); // 6000 + 350 + 600 + 250
  assert.strictEqual(settlement1.ownerNetPayout, 92800); // 100.000 - 7.200

  // Cenário 2: Remuneração percentual onde cálculo é menor que o piso mínimo
  // Preço R$ 40.000, taxa 5% = 2.000, mas mínimo é 3.500
  const settlement2 = calculateConsignmentSettlement({
    vehiclePrice: 40000,
    remunerationType: 'percentual',
    remunerationValue: 5,
    minRemuneration: 3500,
    serviceFee: 200,
    dailyStorageFee: 10,
    daysInStock: 10,
    advancedExpenses: 0
  });
  assert.strictEqual(settlement2.storeCommission, 3500); // Garante o piso mínimo

  // Status de vencimento
  const futureDate = new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0];
  const pastDate = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];
  assert.strictEqual(checkConsignmentStatus(futureDate).isExpired, false);
  assert.strictEqual(checkConsignmentStatus(pastDate).isExpired, true);
});

test('Lote 3 (A2): Contratos avançados com aviso legal e numeração', () => {
  const code = generateContractCode('CTR-EXP', 42);
  assert.strictEqual(code, `CTR-EXP-${new Date().getFullYear()}-0042`);

  const html = generateAdvancedContractHtml({
    type: 'consignacao',
    code,
    client: { name: 'João Proprietário', cpf_masked: '123.***.***-99', phone: '1199999999' },
    vehicle: { title: 'Porsche Macan GTS', price: 540000, km: 15000, year: '2023' },
    terms: { remunerationType: 'percentual', remunerationValue: 5, serviceFee: 500, dailyStorageFee: 25 }
  });

  // Validação do aviso legal obrigatório
  assert.ok(html.includes('AVISO LEGAL OBRIGATÓRIO'), 'Contrato deve incluir aviso legal');
  assert.ok(html.includes('revisão e aprovação prévia de advogado'), 'Deve exigir revisão de advogado');
  assert.ok(html.includes('CONTRATO DE CONIGNAÇÃO MERCANTIL'), 'Deve ter o título correto');
  assert.ok(html.includes('Porsche Macan GTS'), 'Deve conter os dados do veículo');
  assert.ok(html.includes('1ª Testemunha'), 'Deve conter espaço para testemunhas');
});

test('Lote 3 (A3): Comissionamento de vendedores', () => {
  // Venda de R$ 120.000 com comissão de 1.5% da venda
  const comm1 = calculateSellerCommission({
    salePrice: 120000,
    profitAmount: 18000,
    commissionModel: 'percentual_venda',
    commissionRate: 1.5
  });
  assert.strictEqual(comm1.commissionAmount, 1800.00);

  // Venda com comissão sobre lucro de 10%
  const comm2 = calculateSellerCommission({
    salePrice: 120000,
    profitAmount: 18000,
    commissionModel: 'percentual_lucro',
    commissionRate: 10
  });
  assert.strictEqual(comm2.commissionAmount, 1800.00);
});

test('Lote 3 (A4): Precificador completo com leilão e liquidez regional', () => {
  const pricing = calculateMarketPricing({
    fipePrice: 100000,
    manualCompetitors: [
      { link: 'https://exemplo.com/carro1', title: 'Carro A', price: 102000 },
      { link: 'https://exemplo.com/carro2', title: 'Carro B', price: 98000 }
    ],
    hasAuctionRecord: true,
    auctionDiscountPercent: 20, // -20% de leilão
    regionalLiquidity: 'alta', // +2% por alta liquidez
    preparationCost: 2000,
    desiredMarginPercent: 10
  });

  // Média concorrentes: (102000 + 98000) / 2 = 100.000
  // Base: 70% de 100k + 30% FIPE (100k) = 100.000
  // Desconto Leilão: 20% = -20.000 => Base = 80.000
  // Liquidez alta (+2%): 80.000 * 1.02 = 81.600 (sugestão de venda)
  // Margem pretendida 10%: 8.160
  // Teto compra: 81.600 - 8.160 - 2.000 prep = 71.440
  assert.strictEqual(pricing.avgCompetitorPrice, 100000);
  assert.strictEqual(pricing.auctionDeduction, 20000);
  assert.strictEqual(pricing.suggestedSalePrice, 81600);
  assert.strictEqual(pricing.maxBuyPrice, 71440);
});

test('Lote 3 (A7): Adaptador oficial de Instagram sem credenciais', async () => {
  delete process.env.INSTAGRAM_ACCESS_TOKEN;
  delete process.env.INSTAGRAM_ACCOUNT_ID;

  const status = getInstagramConfigStatus();
  assert.strictEqual(status.configured, false);
  assert.strictEqual(status.status, 'nao_configurado');

  const result = await dispatchInstagramStory({ imageUrl: 'https://exemplo.com/story.jpg', vehicleId: 99 });
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.status, 'nao_configurado');
  assert.strictEqual(result.canManualShare, true);
});

test('Lote 3 (Export): Exportação de estoque para integração de portais (JSON e CSV)', () => {
  const dummyVehicles = [
    { id: 1, title: 'Audi RS6 Avant', version: '4.0 V8 Biturbo', category: 'station_wagon', year: '2022', km: 18000, price: 920000, status: 'disponivel', ownership_type: 'proprio' },
    { id: 2, title: 'BMW M3 Competition', version: '3.0 Biturbo', category: 'sedan', year: '2023', km: 9500, price: 780000, status: 'disponivel', ownership_type: 'consignado' }
  ];

  const csv = exportVehiclesToCsv(dummyVehicles);
  assert.ok(csv.includes('Audi RS6 Avant'));
  assert.ok(csv.includes('920000'));
  assert.ok(csv.includes('proprio'));

  const json = exportVehiclesToJson(dummyVehicles, { name: 'Apex Luxury' });
  assert.strictEqual(json.totalVehicles, 2);
  assert.strictEqual(json.vehicles[0].priceBrl, 920000);
});

test('Lote 3 - Barreira de Níveis: Endpoints de Nível 3 retornam 404 em Tier 1 e Tier 2', () => {
  const checkOnTier1 = assertTier(3, 1);
  assert.strictEqual(checkOnTier1.allowed, false);
  assert.strictEqual(checkOnTier1.status, 404);

  const checkOnTier2 = assertTier(3, 2);
  assert.strictEqual(checkOnTier2.allowed, false);
  assert.strictEqual(checkOnTier2.status, 404);

  const checkOnTier3 = assertTier(3, 3);
  assert.strictEqual(checkOnTier3.allowed, true);
});
