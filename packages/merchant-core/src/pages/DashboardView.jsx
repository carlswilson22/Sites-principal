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
  PhoneCall,
  Wallet,
  Receipt,
  Banknote
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { TierGate } from '../components/common/TierGate';
import { apiClient } from '../services/apiClient';
import { storeSync } from '../services/storeSync';
import { useTier } from '../context/TierContext';
import { useAuth } from '../context/AuthContext';
import { isRemote } from '../services/remote';
import { demoSales } from '../data/demoShowcase';

const DAY = 24 * 60 * 60 * 1000;
const money = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const agoLabel = days => (days <= 0 ? 'hoje' : days === 1 ? 'ontem' : `há ${days} dias`);

// Vendas dos últimos 30 dias: as reais (veículos vendidos) e, só na demonstração, o histórico de exemplo.
function collectSales(vehicles, storeKey) {
  const now = Date.now();
  const real = vehicles
    .filter(v => v.status === 'vendido' && Date.parse(v.soldAt || v.sold_at || v.updatedAt) >= now - 30 * DAY)
    .map(v => ({ model: v.nome || v.title, value: Number(v.sale_price || v.preco || v.price) || 0, soldAt: v.soldAt || v.sold_at || v.updatedAt }));
  const sample = isRemote ? [] : demoSales(storeKey, now);
  return [...real, ...sample].sort((a, b) => Date.parse(b.soldAt) - Date.parse(a.soldAt)).map(sale => ({ ...sale, daysAgo: Math.max(0, Math.floor((now - Date.parse(sale.soldAt)) / DAY)) }));
}

export function DashboardView({ onNavigateTo, storeKey = 'autoelite' }) {
  const { tier } = useTier();
  const { hasRole } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncKey, setSyncKey] = useState(0);

  useEffect(() => {
    async function loadSummary() {
      try {
        const vehicles = storeSync.getVehicles(storeKey);
        const leads = storeSync.getLeads(storeKey);

        const inStock = vehicles.filter(v => v.status !== 'vendido').length;
        const sales = collectSales(vehicles, storeKey);
        const monthlySales = sales.length;
        const revenue = sales.reduce((sum, sale) => sum + sale.value, 0);
        const stockValue = vehicles.filter(v => v.status !== 'vendido').reduce((sum, v) => sum + (Number(v.preco ?? v.price) || 0), 0);
        const weeks = [0, 1, 2, 3].map(week => sales.filter(sale => sale.daysAgo >= week * 7 && sale.daysAgo < (week + 1) * 7).length).reverse();
        const staleVehicles = vehicles.filter(v => v.status !== 'vendido' && (v.days_in_stock || 0) > 60).length;
        const newLeads = leads.filter(l => l.status === 'novo').length;

        const pending = leads
          .filter(l => l.status === 'novo' || l.status === 'em_atendimento')
          .slice(0, 4)
          .map(l => ({
            id: l.id,
            name: l.name,
            phone: l.phone,
            source: l.source,
            status: l.status,
            temperature: l.temperature || 'quente',
            created_at: l.created_at
          }));

        setData({
          tier,
          indicators: {
            inStock,
            monthlySales,
            staleVehicles,
            newLeads,
            revenue,
            stockValue,
            averageTicket: monthlySales ? revenue / monthlySales : 0
          },
          weeks,
          recentSales: sales.slice(0, 4),
          pendingActions: pending
        });
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSummary();

    const unsub = storeSync.subscribe(storeKey, () => {
      setSyncKey(k => k + 1);
    });
    return unsub;
  }, [tier, storeKey, syncKey]);

  const indicators = data?.indicators || {
    inStock: 0,
    monthlySales: 0,
    staleVehicles: 0,
    newLeads: 0
  };

  const pendingActions = data?.pendingActions || [];
  const weeks = data?.weeks || [0, 0, 0, 0];
  const recentSales = data?.recentSales || [];
  const peak = Math.max(1, ...weeks);

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
          description="Veículos ainda não vendidos"
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

      {/* Resultado do mês: faturamento, ticket médio e valor parado em estoque */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <MetricCard title="Faturamento do Mês" value={money(indicators.revenue)} icon={Banknote} description="Soma das vendas dos últimos 30 dias" color="emerald" />
        <MetricCard title="Ticket Médio" value={money(indicators.averageTicket)} icon={Receipt} description="Valor médio por veículo vendido" color="blue" />
        <MetricCard title="Valor em Estoque" value={money(indicators.stockValue)} icon={Wallet} description="Soma dos preços dos veículos à venda" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-sm">
          <h2 className="text-sm sm:text-base font-bold text-white">Vendas por semana</h2>
          <p className="text-xs text-slate-400 mb-5">Veículos vendidos nas últimas quatro semanas</p>
          <div className="flex items-end gap-4 h-36" role="img" aria-label={`Vendas por semana: ${weeks.join(', ')}`}>
            {weeks.map((count, index) => (
              <div key={index} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                <span className="text-xs font-semibold text-slate-200">{count}</span>
                <div className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600/70 to-emerald-400/80" style={{ height: `${Math.max(6, (count / peak) * 100)}%` }} />
                <span className="text-[11px] text-slate-500">{index === 3 ? 'Esta semana' : `Há ${3 - index} sem.`}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-sm">
          <h2 className="text-sm sm:text-base font-bold text-white">Últimas vendas</h2>
          <p className="text-xs text-slate-400 mb-3">Veículos que já saíram do estoque</p>
          {recentSales.length === 0
            ? <p className="text-sm text-slate-400 py-6">Nenhuma venda nos últimos 30 dias. Quando você marcar um veículo como vendido, ele aparece aqui.</p>
            : <ul className="divide-y divide-slate-800/60">
              {recentSales.map((sale, index) => (
                <li key={`${sale.model}-${index}`} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-200 truncate">{sale.model}</span>
                    <span className="text-xs text-slate-500">{agoLabel(sale.daysAgo)}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-300 whitespace-nowrap">{money(sale.value)}</span>
                </li>
              ))}
            </ul>}
        </div>
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
                      {lead.status === 'novo' ? 'Novo' : 'Em atendimento'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{lead.phone} • Origem: {String(lead.source || 'site').replaceAll('_', ' ')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${String(lead.phone || '').replace(/\D/g, '').replace(/^(\d{10,11})$/, '55$1')}?text=Ol%C3%A1%20${encodeURIComponent(lead.name)},%20sou%20da%20concession%C3%A1ria%20e%20recebi%20seu%20contato!`}
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

      <TierGate requiredTier={2}>
        {hasRole(['gerente']) && <button type="button" onClick={() => onNavigateTo('analytics')} className="w-full p-5 rounded-2xl bg-slate-900 border border-amber-500/30 text-left hover:bg-slate-800">
          <span className="font-bold text-white block">Métricas do site</span>
          <span className="text-sm text-slate-400">Veja as interações registradas na vitrine por período e por veículo.</span>
        </button>}
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

