/**
 * server/src/services/commissionCalculator.js
 * Cálculo de comissionamento por venda e por atendente (Nível 3 - A3).
 */

export function calculateSellerCommission({
  salePrice,
  profitAmount = 0,
  commissionModel = 'percentual_venda', // 'percentual_venda' | 'percentual_lucro' | 'fixo'
  commissionRate = 1.5, // ex: 1.5% da venda ou 10% do lucro
  fixedAmount = 0
}) {
  const price = Number(salePrice) || 0;
  const profit = Number(profitAmount) || 0;
  const rate = Number(commissionRate) || 0;
  const fixed = Number(fixedAmount) || 0;

  let commission = 0;

  switch (commissionModel) {
    case 'percentual_venda':
      commission = (price * rate) / 100;
      break;
    case 'percentual_lucro':
      commission = Math.max(0, (profit * rate) / 100);
      break;
    case 'fixo':
      commission = fixed;
      break;
    default:
      commission = (price * rate) / 100;
  }

  return {
    salePrice: Number(price.toFixed(2)),
    profitAmount: Number(profit.toFixed(2)),
    commissionModel,
    commissionRate: rate,
    commissionAmount: Number(commission.toFixed(2))
  };
}
