/**
 * packages/merchant-core/src/utils/pricing.js
 * Utilitário de precificação e cálculo de compra/venda para uso no navegador.
 */

export function calculatePricing({ fipePrice, prepCost = 2000, targetMarginPct = 12 }) {
  const fipe = Number(fipePrice);
  const prep = Number(prepCost);
  const percentage = Number(targetMarginPct);
  if (![fipe, prep, percentage].every(Number.isFinite) || fipe <= 0 || prep < 0 || percentage < 0 || percentage > 100) {
    throw new Error('Informe uma referência maior que zero, custos não negativos e margem entre 0% e 100%.');
  }
  const marginPct = percentage / 100;

  const suggestedSalePrice = Math.round(fipe * 1.0);
  const targetProfit = Math.round(suggestedSalePrice * marginPct);
  const maxPurchasePrice = Math.max(0, suggestedSalePrice - prep - targetProfit);

  return {
    fipePrice: fipe,
    prepCost: prep,
    targetMarginPct: percentage,
    maxPurchasePrice,
    suggestedSalePrice,
    expectedProfit: targetProfit,
    purchaseToFipePct: fipe > 0 ? Math.round((maxPurchasePrice / fipe) * 1000) / 10 : 0
  };
}

