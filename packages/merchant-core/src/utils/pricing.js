/**
 * packages/merchant-core/src/utils/pricing.js
 * Utilitário de precificação e cálculo de compra/venda para uso no navegador.
 */

export function calculatePricing({ fipePrice, prepCost = 2000, targetMarginPct = 12 }) {
  const fipe = parseFloat(fipePrice) || 0;
  const prep = parseFloat(prepCost) || 0;
  const marginPct = (parseFloat(targetMarginPct) || 12) / 100;

  const suggestedSalePrice = Math.round(fipe * 1.0);
  const targetProfit = Math.round(suggestedSalePrice * marginPct);
  const maxPurchasePrice = Math.max(0, suggestedSalePrice - prep - targetProfit);

  return {
    fipePrice: fipe,
    prepCost: prep,
    targetMarginPct: Math.round(marginPct * 100),
    maxPurchasePrice,
    suggestedSalePrice,
    expectedProfit: targetProfit,
    purchaseToFipePct: fipe > 0 ? Math.round((maxPurchasePrice / fipe) * 1000) / 10 : 0
  };
}

