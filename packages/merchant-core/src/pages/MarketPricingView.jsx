/**
 * packages/merchant-core/src/pages/MarketPricingView.jsx
 * Precificador Completo com Comparativo Manual de Concorrentes (Nível 3 - A4).
 * Pondera passagem por leilão, liquidez regional e teto máximo de compra.
 * Não faz raspagem (scraping) de portais: lojista insere os links e valores observados.
 */
import React, { useState } from 'react';
import { Tag, Plus, Trash2, ShieldAlert, TrendingUp, AlertTriangle, Calculator, ExternalLink } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export function MarketPricingView() {
  const [fipePrice, setFipePrice] = useState(138000);
  const [hasAuctionRecord, setHasAuctionRecord] = useState(false);
  const [auctionDiscountPercent, setAuctionDiscountPercent] = useState(18);
  const [regionalLiquidity, setRegionalLiquidity] = useState('media');
  const [preparationCost, setPreparationCost] = useState(2500);
  const [desiredMarginPercent, setDesiredMarginPercent] = useState(12);

  const [competitors, setCompetitors] = useState([
    { title: 'Concorrente A (Mesmo Modelo/Ano)', link: 'https://exemplo.com.br/anuncio-1', price: 142000, km: 32000 },
    { title: 'Concorrente B (Concessionária local)', link: 'https://exemplo.com.br/anuncio-2', price: 139500, km: 28000 }
  ]);

  const [calcResult, setCalcResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddCompetitor = () => {
    setCompetitors([
      ...competitors,
      { title: `Referência ${competitors.length + 1}`, link: '', price: fipePrice, km: 30000 }
    ]);
  };

  const handleRemoveCompetitor = (idx) => {
    setCompetitors(competitors.filter((_, i) => i !== idx));
  };

  const handleUpdateCompetitor = (idx, field, value) => {
    const updated = [...competitors];
    updated[idx][field] = value;
    setCompetitors(updated);
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await apiClient.calculateMarketPricing({
        fipePrice: Number(fipePrice),
        manualCompetitors: competitors.map(c => ({ ...c, price: Number(c.price) })),
        hasAuctionRecord,
        auctionDiscountPercent: Number(auctionDiscountPercent),
        regionalLiquidity,
        preparationCost: Number(preparationCost),
        desiredMarginPercent: Number(desiredMarginPercent)
      });
      setCalcResult(res);
    } finally {
      setLoading(false);
    }
  };

  const formatBrl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Precificador de Mercado & Leilão</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Tier 3 Enterprise
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Avaliação comparativa com anúncios manuais, depreciação de histórico de leilão e teto máximo de compra.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Esquerdo: Parâmetros */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">1. Referência Base & Condições</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Valor Base FIPE (R$)</label>
                <input
                  type="number"
                  value={fipePrice}
                  onChange={e => setFipePrice(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Liquidez / Giro Regional</label>
                <select
                  value={regionalLiquidity}
                  onChange={e => setRegionalLiquidity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="alta">Alta Demanda (+2% valorização local)</option>
                  <option value="media">Média Procura (Sem variação)</option>
                  <option value="baixa">Baixo Giro (-4% para acelerar venda)</option>
                </select>
              </div>
            </div>

            {/* Toggle de Leilão */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">Veículo possui passagem por Leilão?</div>
                  <div className="text-[11px] text-slate-400">Aplica fator de depreciação de mercado sobre a avaliação.</div>
                </div>
                <input
                  type="checkbox"
                  checked={hasAuctionRecord}
                  onChange={e => setHasAuctionRecord(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
                />
              </div>

              {hasAuctionRecord && (
                <div className="pt-2 border-t border-slate-700/60 flex items-center gap-3">
                  <label className="text-xs text-amber-300 font-semibold">Depreciação de Leilão (%):</label>
                  <input
                    type="number"
                    value={auctionDiscountPercent}
                    onChange={e => setAuctionDiscountPercent(e.target.value)}
                    className="w-24 bg-slate-900 border border-amber-500/40 rounded-lg px-2.5 py-1 text-xs text-amber-200"
                  />
                  <span className="text-[11px] text-slate-400">Média de mercado: 15% a 25%</span>
                </div>
              )}
            </div>

            {/* Custos e Margem */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Custo de Preparação & Estética (R$)</label>
                <input
                  type="number"
                  value={preparationCost}
                  onChange={e => setPreparationCost(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Margem Bruta Desejada (%)</label>
                <input
                  type="number"
                  value={desiredMarginPercent}
                  onChange={e => setDesiredMarginPercent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Lista de Concorrentes Manuais */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">2. Anúncios Concorrentes (Entrada Manual)</h3>
                <p className="text-xs text-slate-400">Insira valores observados no mercado regional. Não realizamos scraping de terceiros.</p>
              </div>
              <button
                type="button"
                onClick={handleAddCompetitor}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                Adicionar Concorrente
              </button>
            </div>

            <div className="space-y-3">
              {competitors.map((c, idx) => (
                <div key={idx} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={c.title}
                      onChange={e => handleUpdateCompetitor(idx, 'title', e.target.value)}
                      placeholder="Identificação do concorrente"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={c.link}
                      onChange={e => handleUpdateCompetitor(idx, 'link', e.target.value)}
                      placeholder="https://anuncio-concorrente.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-400"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      value={c.price}
                      onChange={e => handleUpdateCompetitor(idx, 'price', e.target.value)}
                      placeholder="Preço (R$)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetitor(idx)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCalculate}
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20"
            >
              {loading ? 'Calculando Precificação...' : 'Ponderar e Calcular Teto de Compra'}
            </button>
          </div>
        </div>

        {/* Painel Direito: Resultado da Ponderação */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Resultado da Avaliação
            </h3>

            {calcResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                  <span className="text-[11px] text-emerald-400 uppercase font-semibold">Teto Máximo de Compra Sugerido</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    {formatBrl(calcResult.maxBuyPrice)}
                  </div>
                  <span className="text-[10px] text-slate-400">Garante a margem de {calcResult.desiredMarginPercent}%</span>
                </div>

                <div className="p-4 bg-slate-800/40 rounded-xl space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Preço Sugerido de Venda:</span>
                    <strong className="font-mono text-slate-100">{formatBrl(calcResult.suggestedSalePrice)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Média dos Concorrentes:</span>
                    <span className="font-mono text-slate-400">{formatBrl(calcResult.avgCompetitorPrice)}</span>
                  </div>
                  {calcResult.hasAuctionRecord && (
                    <div className="flex justify-between text-amber-400 font-semibold">
                      <span>Depreciação de Leilão ({calcResult.auctionDiscountPercent}%):</span>
                      <span className="font-mono">-{formatBrl(calcResult.auctionDeduction)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <span>Custo de Preparação:</span>
                    <span className="font-mono text-slate-400">{formatBrl(calcResult.preparationCost)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold pt-2 border-t border-slate-700">
                    <span>Lucro Bruto Projetado:</span>
                    <span className="font-mono">{formatBrl(calcResult.targetProfit)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs">
                Clique no botão ao lado para processar a ponderação com base nos concorrentes e histórico.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
