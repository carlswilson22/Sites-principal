/**
 * Precificacao compartilhada de mercado
 * Precificador completo com comparativo de mercado manual (Nível 3 - A4).
 *
 * Regra obrigatória: NÃO faz raspagem (scraping) de portais.
 * Processa links e valores fornecidos manualmente pelo lojista,
 * ponderando leilão, giro regional e margens pretendidas.
 */

export function calculateMarketPricing({
  fipePrice = 0,
  manualCompetitors = [], // [{ link, title, price, year, km }]
  hasAuctionRecord = false,
  auctionDiscountPercent = 18, // média de mercado: 15% a 25% de depreciação de leilão
  regionalLiquidity = 'media', // 'alta' | 'media' | 'baixa'
  preparationCost = 1500,
  desiredMarginPercent = 12
}) {
  const fipe = Number(fipePrice);
  const prep = Number(preparationCost);
  const marginPct = Number(desiredMarginPercent);
  const auctionPercent = Number(auctionDiscountPercent);
  if (![fipe, prep, marginPct, auctionPercent].every(Number.isFinite) || fipe <= 0 || prep < 0 || marginPct < 0 || marginPct > 100 || auctionPercent < 0 || auctionPercent > 100) throw new Error('Confira o valor de referência, os custos e os percentuais de 0 a 100.');

  // 1. Média dos anúncios concorrentes informados manualmente
  const validCompetitors = (manualCompetitors || [])
    .map(c => ({
      link: c.link || '',
      title: c.title || 'Anúncio Referência',
      price: Number(c.price) || 0,
      year: c.year || '',
      km: Number(c.km) || 0
    }))
    .filter(c => c.price > 0);

  let avgCompetitorPrice = fipe;
  if (validCompetitors.length > 0) {
    const sum = validCompetitors.reduce((acc, c) => acc + c.price, 0);
    avgCompetitorPrice = sum / validCompetitors.length;
  }

  // 2. Base de mercado ponderada (70% concorrentes locais + 30% FIPE se houver concorrentes, ou 100% FIPE)
  let baseMarketPrice = validCompetitors.length > 0
    ? (avgCompetitorPrice * 0.70) + (fipe * 0.30)
    : fipe;

  // 3. Ajuste por passagem de Leilão
  let auctionDeduction = 0;
  if (hasAuctionRecord) {
    auctionDeduction = (baseMarketPrice * auctionPercent) / 100;
    baseMarketPrice -= auctionDeduction;
  }

  // 4. Ajuste por Liquidez / Giro Regional
  let liquidityMultiplier = 1.0;
  if (regionalLiquidity === 'alta') {
    liquidityMultiplier = 1.02; // +2% valorização por alta procura
  } else if (regionalLiquidity === 'baixa') {
    liquidityMultiplier = 0.96; // -4% ajuste para acelerar giro
  }
  const suggestedSalePrice = Math.round(baseMarketPrice * liquidityMultiplier);

  // 5. Teto máximo de compra para atingir a margem desejada
  // Margem Bruta = Venda - Compra - Preparação
  // Compra = Venda * (1 - marginPct/100) - Preparação
  const targetProfit = (suggestedSalePrice * marginPct) / 100;
  const maxBuyPrice = Math.max(0, Math.round(suggestedSalePrice - targetProfit - prep));

  return {
    fipePrice: Number(fipe.toFixed(2)),
    competitorsCount: validCompetitors.length,
    avgCompetitorPrice: Math.round(avgCompetitorPrice),
    hasAuctionRecord,
    auctionDiscountPercent: hasAuctionRecord ? auctionDiscountPercent : 0,
    auctionDeduction: Math.round(auctionDeduction),
    regionalLiquidity,
    preparationCost: prep,
    desiredMarginPercent: marginPct,
    targetProfit: Math.round(targetProfit),
    suggestedSalePrice,
    maxBuyPrice,
    competitorsList: validCompetitors
  };
}
