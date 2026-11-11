/**
 * Calculos compartilhados de consignacao
 * Lógica financeira e regras de consignação completa (Nível 3 - A1).
 * Suporta remuneração percentual (com valor piso) ou valor líquido acordado com o consignante.
 * Considera diárias de guarda, taxa de serviço e despesas adiantadas.
 */

export function calculateConsignmentSettlement({
  vehiclePrice,
  remunerationType, // 'percentual' | 'valor_liquido'
  remunerationValue,
  minRemuneration = 0,
  serviceFee = 0,
  dailyStorageFee = 0,
  daysInStock = 0,
  advancedExpenses = 0
}) {
  const price = Number(vehiclePrice) || 0;
  const remValue = Number(remunerationValue) || 0;
  const minRem = Number(minRemuneration) || 0;
  const sFee = Number(serviceFee) || 0;
  const dailyFee = Number(dailyStorageFee) || 0;
  const days = Math.max(0, Number(daysInStock) || 0);
  const advExp = Number(advancedExpenses) || 0;

  // 1. Cálculo da remuneração / comissão da loja
  let storeCommission = 0;
  if (remunerationType === 'percentual') {
    const rawComm = (price * remValue) / 100;
    storeCommission = Math.max(rawComm, minRem);
  } else if (remunerationType === 'valor_liquido') {
    // No valor líquido, o dono acordou receber remValue; o que passar de remValue é da loja
    storeCommission = Math.max(0, price - remValue);
  }

  // 2. Diárias de guarda acumuladas
  const totalStorageFee = Number((days * dailyFee).toFixed(2));

  // 3. Total de retenções da loja (comissão + taxa serviço + diárias + gastos adiantados)
  const totalStoreDeductions = Number((storeCommission + sFee + totalStorageFee + advExp).toFixed(2));

  // 4. Valor líquido repassado ao consignante proprietário
  let ownerNetPayout = 0;
  if (remunerationType === 'valor_liquido') {
    // Se for valor líquido, desconta taxas de serviço e despesas acordadas
    ownerNetPayout = Math.max(0, Number((remValue - sFee - totalStorageFee - advExp).toFixed(2)));
  } else {
    ownerNetPayout = Math.max(0, Number((price - totalStoreDeductions).toFixed(2)));
  }

  return {
    vehiclePrice: Number(price.toFixed(2)),
    storeCommission: Number(storeCommission.toFixed(2)),
    serviceFee: Number(sFee.toFixed(2)),
    dailyStorageFee: Number(dailyFee.toFixed(2)),
    daysInStock: days,
    totalStorageFee,
    advancedExpenses: Number(advExp.toFixed(2)),
    totalStoreDeductions,
    ownerNetPayout,
    storeTotalRevenue: Number((storeCommission + sFee + totalStorageFee).toFixed(2))
  };
}

/**
 * Verifica se um contrato de consignação está vencido ou próximo do vencimento
 */
export function checkConsignmentStatus(contractEndDate) {
  if (!contractEndDate) return { isExpired: false, daysRemaining: 0 };
  const end = new Date(contractEndDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return {
    isExpired: daysRemaining < 0,
    daysRemaining,
    warning: daysRemaining <= 7 && daysRemaining >= 0 ? 'Vencendo nos próximos 7 dias' : null
  };
}
