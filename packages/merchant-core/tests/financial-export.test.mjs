import test from 'node:test';
import assert from 'node:assert/strict';
import { exportFinancialSummaryCsv } from '../src/utils/financialExport.js';

const report = {
  storeName: 'Loja original',
  generatedAt: '2026-10-10T12:00:00Z',
  activeInventoryCount: 12,
  activeInventoryValue: 1210000.50,
  ownStockInvestedCapital: '645000.25',
  last12MonthsGrossRevenue: 580000,
  last12MonthsNetProfit: -78500.5,
};

test('resumo de 12 meses exporta valores agregados em CSV para planilhas', () => {
  const csv = exportFinancialSummaryCsv(report, 'Minha loja', { demo: true });
  assert.ok(csv.startsWith('\uFEFF"Seção";"Indicador";"Valor";"Unidade"\r\n'));
  assert.match(csv, /"Loja";"Minha loja"/);
  assert.match(csv, /"Data de emissão";"10\/10\/2026"/);
  assert.match(csv, /"Natureza dos dados";"Demonstração — valores de exemplo"/);
  assert.match(csv, /"Veículos em pátio";12;"veículos"/);
  assert.match(csv, /"Valor total a preço de varejo";1210000,5;"BRL"/);
  assert.match(csv, /"Capital próprio imobilizado";645000,25;"BRL"/);
  assert.match(csv, /"Resultado apurado \(vendas menos custos lançados\)";-78500,5;"BRL"/);
  assert.match(csv, /Não é balanço, parecer contábil nem auditoria/);
  assert.doesNotMatch(csv, /janeiro|fevereiro|março/i);
});

test('protege campos de texto contra fórmulas e escapa caracteres de CSV', () => {
  for (const name of ['=CMD()', '+x', '-1', '@x', '\t=2+2']) {
    assert.ok(exportFinancialSummaryCsv(report, name).includes(`"'${name}"`));
  }
  assert.ok(exportFinancialSummaryCsv(report, 'Loja "A"; Norte').includes('"Loja ""A""; Norte"'));
});

test('não inventa valores ausentes nem sinaliza como demonstração dados reais', () => {
  const csv = exportFinancialSummaryCsv({ ...report, generatedAt: null, activeInventoryCount: null, last12MonthsGrossRevenue: '=1+1' });
  assert.match(csv, /"Data de emissão";"Não informada"/);
  assert.match(csv, /"Veículos em pátio";;"veículos"/);
  assert.match(csv, /"Receita da loja nas vendas registradas";;"BRL"/);
  assert.doesNotMatch(csv, /Natureza dos dados/);
});
