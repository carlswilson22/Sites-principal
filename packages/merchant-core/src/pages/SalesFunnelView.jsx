/**
 * packages/merchant-core/src/pages/SalesFunnelView.jsx
 * Funil de Vendas, Tempo de Resposta e Alertas de Giro de Estoque (Nível 3 - A5).
 */
import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, AlertTriangle, ArrowRight, CheckCircle2, DollarSign } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export function SalesFunnelView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFunnel();
  }, []);

  const loadFunnel = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getSalesFunnel();
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  const formatBrl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Carregando funil de conversão...</div>;
  }

  const { funnelSteps: rawSteps = [], averageResponseTimeMinutes = null, staleVehiclesAlert = {} } = data || {};
  // A taxa de cada etapa é calculada sobre a primeira (o servidor envia só as contagens).
  const firstCount = rawSteps[0]?.count || 0;
  const funnelSteps = rawSteps.map(step => ({ ...step, rate: step.rate ?? (firstCount > 0 ? Math.round((step.count / firstCount) * 1000) / 10 : 0) }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Funil de Vendas & Giro</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Conversão dos contatos recebidos até as vendas fechadas e alerta de veículos parados há mais de 60 dias, com base nos contatos e nas situações registradas.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-400">Tempo médio de resposta:</span>
          <strong className="text-xs text-slate-100 tabular-nums">{averageResponseTimeMinutes == null ? 'ainda não medido' : `${averageResponseTimeMinutes} minutos`}</strong>
        </div>
      </div>

      {/* Visualização em Escada do Funil */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Etapas de Conversão Comercial</h3>
        
        {data?.hasData === false && <p className="text-xs text-slate-400">Ainda não há contatos registrados. O funil aparece quando os primeiros contatos chegarem.</p>}
        <div className="space-y-3">
          {funnelSteps.map((step, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>{step.step}</span>
                <span className="tabular-nums text-emerald-400">{step.count.toLocaleString('pt-BR')} ({step.rate}%)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, step.rate)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerta de Carros Parados com Sugestão de Revisão de Preço */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Alertas de Giro: Carros Parados há mais de 60 Dias</h3>
        </div>
        <p className="text-xs text-slate-400">
          Veículos com longo tempo de permanência no pátio geram custo financeiro e desvalorização. {staleVehiclesAlert.rule || 'Sugestão por regra fixa, como ponto de partida; não é avaliação de mercado.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staleVehiclesAlert.vehicles?.map(v => (
            <div key={v.id} className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">{v.title}</h4>
                  <div className="text-xs text-amber-400 tabular-nums mt-0.5">{v.days_in_stock} dias em estoque</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Desconto sugerido: -{v.suggestedDiscountPercent}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/60 tabular-nums">
                <div>
                  <span className="text-slate-400 block text-[10px]">Preço Atual:</span>
                  <span className="text-slate-200 line-through">{formatBrl(v.price)}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-emerald-400 block text-[10px]">Preço com o desconto sugerido:</span>
                  <span className="text-emerald-400 font-bold">{formatBrl(v.suggestedNewPrice)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

