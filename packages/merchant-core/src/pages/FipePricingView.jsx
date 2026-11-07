/**
 * packages/merchant-core/src/pages/FipePricingView.jsx
 * Precificador Simples FIPE e Cálculo de Margens de Compra/Venda (I6 - Nível 2)
 */
import React, { useState } from 'react';
import { Tag, Search, Calculator, DollarSign, TrendingUp, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { calculatePricing } from '../../../../server/src/services/fipeAdapter';

export function FipePricingView() {
  const [fipeForm, setFipeForm] = useState({
    brand: 'Toyota',
    model: 'Corolla Cross',
    year: '2023',
    fipePrice: 138000,
    prepCost: 2500,
    targetMarginPct: 12
  });

  const [pricingResult, setPricingResult] = useState(() => {
    return calculatePricing({
      fipePrice: 138000,
      prepCost: 2500,
      targetMarginPct: 12
    });
  });

  const [history, setHistory] = useState([
    {
      id: 1,
      model: 'Toyota Corolla Cross 2023',
      fipePrice: 138000,
      maxPurchase: 118940,
      suggestedSale: 138000,
      expectedProfit: 16560,
      date: 'Hoje'
    },
    {
      id: 2,
      model: 'Chevrolet Tracker 2023',
      fipePrice: 118500,
      maxPurchase: 102280,
      suggestedSale: 118500,
      expectedProfit: 14220,
      date: 'Ontem'
    }
  ]);

  const handleCalculate = (e) => {
    e.preventDefault();
    const result = calculatePricing({
      fipePrice: fipeForm.fipePrice,
      prepCost: fipeForm.prepCost,
      targetMarginPct: fipeForm.targetMarginPct
    });
    setPricingResult(result);

    // Adiciona ao histórico
    const newEntry = {
      id: Date.now(),
      model: `${fipeForm.brand} ${fipeForm.model} ${fipeForm.year}`,
      fipePrice: fipeForm.fipePrice,
      maxPurchase: result.maxPurchasePrice,
      suggestedSale: result.suggestedSalePrice,
      expectedProfit: result.expectedProfit,
      date: 'Agora'
    };
    setHistory(prev => [newEntry, ...prev.slice(0, 9)]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Tag className="w-6 h-6 text-amber-400" />
              Precificador Inteligente FIPE
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
              Tier 2+ Pro
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Consulte a Tabela FIPE oficial com cache local e calcule proposta máxima de compra e margem de venda.
          </p>
        </div>
      </div>

      {/* 2. Formulário e Simulador de Margem */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário de Consulta */}
        <div className="lg:col-span-5 bg-slate-900/80 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-400" />
            Parâmetros do Veículo e Custos
          </h2>

          <form onSubmit={handleCalculate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Marca / Fabricante</label>
              <input
                type="text"
                value={fipeForm.brand}
                onChange={(e) => setFipeForm({ ...fipeForm, brand: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Modelo</label>
                <input
                  type="text"
                  value={fipeForm.model}
                  onChange={(e) => setFipeForm({ ...fipeForm, model: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ano Referência</label>
                <input
                  type="text"
                  value={fipeForm.year}
                  onChange={(e) => setFipeForm({ ...fipeForm, year: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Valor Tabela FIPE (R$)</label>
                <span className="text-[10px] text-emerald-400">Cache Ativo</span>
              </div>
              <input
                type="number"
                value={fipeForm.fipePrice}
                onChange={(e) => setFipeForm({ ...fipeForm, fipePrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Custos Preparação (R$)</label>
                <input
                  type="number"
                  value={fipeForm.prepCost}
                  onChange={(e) => setFipeForm({ ...fipeForm, prepCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  placeholder="2000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Margem Alvo (%)</label>
                <input
                  type="number"
                  value={fipeForm.targetMarginPct}
                  onChange={(e) => setFipeForm({ ...fipeForm, targetMarginPct: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  placeholder="12"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all mt-2"
            >
              <Calculator className="w-4 h-4" />
              Recalcular Proposta de Compra
            </button>
          </form>
        </div>

        {/* Painel de Resultados do Precificador */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              Proposta Recomendada de Negociação
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 shadow-lg">
                <span className="text-xs text-amber-300 font-semibold block">Preço Máximo de Compra / Troca</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  R$ {pricingResult.maxPurchasePrice?.toLocaleString('pt-BR')}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  ({pricingResult.purchaseToFipePct}% da FIPE)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 shadow-lg">
                <span className="text-xs text-slate-300 font-semibold block">Preço Sugerido de Venda</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  R$ {pricingResult.suggestedSalePrice?.toLocaleString('pt-BR')}
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                  100% da Tabela FIPE (Giro Rápido)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Lucro Bruto Previsto:</span>
                <strong className="text-emerald-400 font-bold text-sm">
                  R$ {pricingResult.expectedProfit?.toLocaleString('pt-BR')} ({pricingResult.targetMarginPct}%)
                </strong>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Custos de Preparação e Revisão:</span>
                <span>R$ {pricingResult.prepCost?.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Referência FIPE Oficial:</span>
                <span>R$ {pricingResult.fipePrice?.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* Histórico Recente de Consultas FIPE */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Histórico de Avaliações Recentes
            </h3>

            <div className="divide-y divide-slate-800/80">
              {history.map(item => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-200 block">{item.model}</span>
                    <span className="text-[11px] text-slate-400">FIPE: R$ {item.fipePrice?.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-400 block">Pagar até R$ {item.maxPurchase?.toLocaleString('pt-BR')}</span>
                    <span className="text-[10px] text-slate-500">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

