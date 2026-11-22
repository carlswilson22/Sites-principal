// CSV com separador e decimal usados pelo Excel em configurações pt-BR.
const textCell = value => {
  const text = String(value ?? '');
  // Impede que dados da loja sejam interpretados como fórmulas na planilha.
  const safe = /^[\s\u0000-\u001f]*[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

const numberCell = value => {
  if (typeof value !== 'number' && !(typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value.trim()))) return '';
  const number = Number(value);
  return Number.isFinite(number) ? String(number).replace('.', ',') : '';
};

/** Exporta os indicadores agregados disponíveis, sem estimar dados mensais. */
export function exportFinancialSummaryCsv(report, storeName, { demo = false } = {}) {
  const date = new Date(report.generatedAt || NaN);
  const generatedAt = Number.isNaN(date.getTime()) ? 'Não informada' : date.toLocaleDateString('pt-BR');
  const rows = [
    ['Informações', 'Loja', storeName || report.storeName || 'Loja', ''],
    ['Informações', 'Data de emissão', generatedAt, ''],
    ...(demo ? [['Informações', 'Natureza dos dados', 'Demonstração — valores de exemplo', '']] : []),
    ['Estoque', 'Veículos em pátio', report.activeInventoryCount, 'veículos', true],
    ['Estoque', 'Valor total a preço de varejo', report.activeInventoryValue, 'BRL', true],
    ['Estoque', 'Capital próprio imobilizado', report.ownStockInvestedCapital, 'BRL', true],
    ['Últimos 12 meses', 'Receita da loja nas vendas registradas', report.last12MonthsGrossRevenue, 'BRL', true],
    ['Últimos 12 meses', 'Resultado apurado (vendas menos custos lançados)', report.last12MonthsNetProfit, 'BRL', true],
    ['Observações', 'Origem', 'Calculado apenas com as vendas e despesas registradas no sistema.', ''],
    ['Observações', 'Limitação', 'Não é balanço, parecer contábil nem auditoria.', ''],
  ];
  const headers = ['Seção', 'Indicador', 'Valor', 'Unidade'].map(textCell).join(';');
  const body = rows.map(row => row.slice(0, 4).map((value, index) => (
    index === 2 && row[4] ? numberCell(value) : textCell(value)
  )).join(';'));
  return '\uFEFF' + [headers, ...body].join('\r\n');
}
