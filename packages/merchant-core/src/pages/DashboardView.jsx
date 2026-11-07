/**
 * packages/merchant-core/src/pages/DashboardView.jsx
 * Tela inicial do Painel do Lojista:
 * - Nível 1 (E2): 4 indicadores + lista curta de pendências
 * - Nível 2 (I5): Métricas de tráfego, buscas e ranking
 * - Nível 3 (A5): Funil de conversão completo e alertas de desvalorização
 */
import React, { useState, useEffect } from 'react';
import {
  Car,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { TierGate } from '../components/common/TierGate';
import { apiClient } from '../services/apiClient';
import { useTier } from '../context/TierContext';

export function DashboardView({ onNavigateTo }) {
  const { tier } = useTier();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await apiClient.getSummary(tier);
        setData(res);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, [tier]);

  const indicators = data?.indicators || {
    inStock: 12,
    monthlySales: 4,
    staleVehicles: 2,
    newLeads: 5
  };

  const pendingActions = data?.pendingActions || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Cabeçalho de Boas-Vindas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Painel de Controle
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visão consolidada da operação, estoque e atendimento em tempo real.
          </p>
        </div>
      </div>

      {/* 2. E2: Os 4 Indicadores Principais (Nível 1 - Todos os Modelos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Carros em Estoque"
          value={indicators.inStock}
          icon={Car}
          description="Veículos anunciados na vitrine"
          color="blue"
        />
        <MetricCard
          title="Vendas do Mês"
          value={indicators.monthlySales}
          icon={CheckCircle2}
          description="Fechamentos nos últimos 30 dias"
          color="emerald"
        />
        <MetricCard
          title="Parados > 60 Dias"
          value={indicators.staleVehicles}
          icon={Clock}
          description="Atenção para revisão de preço"
          color="amber"
        />
        <MetricCard
          title="Contatos Novos"
          value={indicators.newLeads}
          icon={MessageSquare}
          description="Aguardando primeiro contato"
          color="rose"
        />
      </div>

      {/* 3. E2: Lista Curta de Pendências (Contatos sem resposta) */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Pendências Operacionais</h2>
              <p className="text-xs text-slate-400">Contatos recebidos aguardando atendimento imediato</p>
            </div>
          </div>
          {onNavigateTo && (
            <button
              type="button"
              onClick={() => onNavigateTo('leads')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-800/60">
          {pendingActions.map(lead => (
            <div key={lead.id} className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold text-xs">
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-200">{lead.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold uppercase">
                      Novo
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{lead.phone} • Origem: {lead.source.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(lead.name)},%20sou%20da%20concession%C3%A1ria%20e%20recebi%20seu%20contato!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Abrir WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. I5: Métricas do Site (Exclusivo Nível 2 e 3) */}
      <TierGate requiredTier={2}>
        <div className="rounded-2xl bg-slate-900/60 border border-amber-500/20 p-5 sm:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-white">Métricas de Engajamento do Site</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                    Tier 2+ Pro
                  </span>
                </div>
                <p className="text-xs text-slate-400">Tráfego anônimo e intenções de compra nos últimos 30 dias</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-xs text-slate-400">Visitas Totais</span>
              <div className="text-lg sm:text-xl font-bold text-white mt-1">3.420</div>
              <span className="text-[11px] text-emerald-400 font-semibold">+14.7% vs anterior</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-xs text-slate-400">Carros Vistos</span>
              <div className="text-lg sm:text-xl font-bold text-white mt-1">8.950</div>
              <span className="text-[11px] text-emerald-400 font-semibold">+17.8% vs anterior</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-xs text-slate-400">Cliques WhatsApp</span>
              <div className="text-lg sm:text-xl font-bold text-white mt-1">284</div>
              <span className="text-[11px] text-emerald-400 font-semibold">+35.2% vs anterior</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-xs text-slate-400">Simulações de Crédito</span>
              <div className="text-lg sm:text-xl font-bold text-white mt-1">156</div>
              <span className="text-[11px] text-emerald-400 font-semibold">+30.0% vs anterior</span>
            </div>
          </div>
        </div>
      </TierGate>

      {/* 5. A5: Funil de Conversão e Alertas de Preço (Exclusivo Nível 3) */}
      <TierGate requiredTier={3}>
        <div className="rounded-2xl bg-slate-900/60 border border-emerald-500/20 p-5 sm:p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">Funil de Vendas & Análise de Giro</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Tier 3 Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400">Eficiência de conversão etapa por etapa e tempo médio de resposta (14 min)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center mt-4">
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/40">
              <span className="text-[11px] text-slate-400">Visitas</span>
              <div className="text-base font-bold text-white mt-0.5">4.200</div>
              <span className="text-[10px] text-slate-500">100%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/40">
              <span className="text-[11px] text-slate-400">Showroom</span>
              <div className="text-base font-bold text-white mt-0.5">2.890</div>
              <span className="text-[10px] text-emerald-400">68.8%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/40">
              <span className="text-[11px] text-slate-400">Interação</span>
              <div className="text-base font-bold text-white mt-0.5">480</div>
              <span className="text-[10px] text-emerald-400">16.6%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/40">
              <span className="text-[11px] text-slate-400">Leads</span>
              <div className="text-base font-bold text-white mt-0.5">185</div>
              <span className="text-[10px] text-emerald-400">38.5%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/40">
              <span className="text-[11px] text-slate-400">Atendidos</span>
              <div className="text-base font-bold text-white mt-0.5">74</div>
              <span className="text-[10px] text-emerald-400">40.0%</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
              <span className="text-[11px] text-emerald-400 font-semibold">Vendas</span>
              <div className="text-base font-extrabold text-emerald-300 mt-0.5">18</div>
              <span className="text-[10px] text-emerald-400">24.3%</span>
            </div>
          </div>
        </div>
      </TierGate>
    </div>
  );
}

