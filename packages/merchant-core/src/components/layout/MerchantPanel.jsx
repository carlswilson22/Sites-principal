import { merchantPermissions, canAccessMerchantRoute } from '../../utils/merchantAccess';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTier } from '../../context/TierContext';
import { storeSync } from '../../services/storeSync';
import { MerchantShell } from './MerchantShell';
import { LoginView } from '../../pages/LoginView';
import { DashboardView } from '../../pages/DashboardView';
import { InventoryView } from '../../pages/InventoryView';
import { LeadsView } from '../../pages/LeadsView';
import { AgendaView } from '../../pages/AgendaView';
import { ClientsView } from '../../pages/ClientsView';
import { ContractsView } from '../../pages/ContractsView';
import { FipePricingView } from '../../pages/FipePricingView';
import { FinancialView } from '../../pages/FinancialView';
import { ConsignmentsView } from '../../pages/ConsignmentsView';
import { AdvancedContractsView } from '../../pages/AdvancedContractsView';
import { FullFinancialView } from '../../pages/FullFinancialView';
import { MarketPricingView } from '../../pages/MarketPricingView';
import { SalesFunnelView } from '../../pages/SalesFunnelView';
import { StoryStudioView } from '../../pages/StoryStudioView';
import { AuditLgpdView } from '../../pages/AuditLgpdView';
import { AnalyticsView } from '../../pages/AnalyticsView';
import { FinancingView } from '../../pages/FinancingView';

const merchantViews = { dashboard: DashboardView, inventory: InventoryView, leads: LeadsView, agenda: AgendaView, clients: ClientsView,
  financing: FinancingView, fipe: FipePricingView, contracts: ContractsView, financial: FinancialView, analytics: AnalyticsView,
  consignments: ConsignmentsView, contracts_adv: AdvancedContractsView, financial_full: FullFinancialView,
  market_pricing: MarketPricingView, funnel: SalesFunnelView, stories: StoryStudioView, audit_lgpd: AuditLgpdView };
export const merchantRoutes = Object.fromEntries(Object.entries(merchantViews).map(([id, component]) => [id, { component, ...merchantPermissions[id] }]));

class PanelErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    return this.state.error ? <div role="alert" className="p-6 rounded-2xl border border-rose-700 bg-slate-900 space-y-4">
      <h2 className="text-xl font-bold">Não foi possível abrir esta seção</h2>
      <p>Os dados foram preservados. Volte ao início do painel para continuar.</p>
      <button className="px-4 py-3 rounded-xl bg-blue-600 text-white" onClick={this.props.onRecover}>Voltar ao início</button>
    </div> : this.props.children;
  }
}

export function MerchantPanel({ storeKey, dealership, defaultVehicles, onExitToSite }) {
  const { isStaff, loading, role } = useAuth();
  const { tier } = useTier();
  const [tab, setTab] = useState('dashboard');
  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState(() => storeSync.getVehicles(storeKey, defaultVehicles));
  const [leads, setLeads] = useState(() => storeSync.getLeads(storeKey));
  useEffect(() => storeSync.subscribe(storeKey, detail => {
    if (detail.type === 'VEHICLES_UPDATED') setVehicles(detail.vehicles);
    if (detail.type === 'LEADS_UPDATED') setLeads(detail.leads);
  }), [storeKey]);
  if (loading) return <p role="status" className="p-8 text-white bg-slate-950 min-h-screen">Carregando acesso ao painel…</p>;
  if (!isStaff) return <LoginView storeKey={storeKey} storeName={dealership.nome} onLoginSuccess={() => setTab('dashboard')} onCancel={onExitToSite} />;
  const allowed = canAccessMerchantRoute(tab, tier, role);
  const active = allowed ? tab : 'dashboard';
  const View = merchantRoutes[active].component;
  const newSimulations = leads.filter(lead => lead.source === 'simulador_financiamento' && lead.status === 'novo');
  return <MerchantShell storeName={dealership.nome} activeTab={active} onSelectTab={setTab} onExitToSite={onExitToSite}>
    {active !== 'leads' && newSimulations.length > 0 && <button type="button" onClick={() => setTab('leads')} className="mb-6 w-full rounded-2xl border border-blue-400/40 bg-blue-500/10 p-4 text-left text-sm text-blue-100 hover:bg-blue-500/20" aria-label={`${newSimulations.length} novas simulações de financiamento. Abrir contatos`}>
      <strong className="block text-white">{newSimulations.length === 1 ? 'Nova simulação de financiamento' : `${newSimulations.length} novas simulações de financiamento`}</strong>
      <span>Veja os dados do veículo e do contato em Contatos &amp; WhatsApp.</span>
    </button>}
    <PanelErrorBoundary key={`${active}-${storeKey}`} onRecover={() => setTab('dashboard')}>
      {View ? <View storeKey={storeKey} defaultVehicles={defaultVehicles} vehicles={vehicles}
        dealership={{ ...dealership, ...dealership.endereco }} selectedClient={client}
        onNavigateTo={setTab} onOpenContractWithClient={selected => { setClient(selected); setTab('contracts'); }} />
        : <p role="status">Selecione uma funcionalidade no menu.</p>}
    </PanelErrorBoundary>
  </MerchantShell>;
}
