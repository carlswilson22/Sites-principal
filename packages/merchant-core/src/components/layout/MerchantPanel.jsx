import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTier } from '../../context/TierContext';
import { storeSync } from '../../services/storeSync';
import { MerchantShell } from './MerchantShell';
import { LoginView } from '../../pages/LoginView';
import { DashboardView } from '../../pages/DashboardView';
import { InventoryView } from '../../pages/InventoryView';
import { LeadsView } from '../../pages/LeadsView';
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

export const merchantRoutes = {
  dashboard: { component: DashboardView, tier: 1 },
  inventory: { component: InventoryView, tier: 1 },
  leads: { component: LeadsView, tier: 1 },
  clients: { component: ClientsView, tier: 2 },
  financing: { tier: 2, roles: ['gerente'] },
  fipe: { component: FipePricingView, tier: 2 },
  contracts: { component: ContractsView, tier: 2, roles: ['gerente'] },
  financial: { component: FinancialView, tier: 2, roles: [] },
  analytics: { component: DashboardView, tier: 2, roles: ['gerente'] },
  consignments: { component: ConsignmentsView, tier: 3, roles: ['gerente'] },
  contracts_adv: { component: AdvancedContractsView, tier: 3, roles: ['gerente'] },
  financial_full: { component: FullFinancialView, tier: 3, roles: [] },
  market_pricing: { component: MarketPricingView, tier: 3 },
  funnel: { component: SalesFunnelView, tier: 3, roles: ['gerente'] },
  stories: { component: StoryStudioView, tier: 3 },
  audit_lgpd: { component: AuditLgpdView, tier: 3, roles: [] },
};

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

export function MerchantPanel({ storeKey, dealership, defaultVehicles, FinancingComponent, onExitToSite }) {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const { tier } = useTier();
  const [tab, setTab] = useState('dashboard');
  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState(() => storeSync.getVehicles(storeKey, defaultVehicles));
  useEffect(() => storeSync.subscribe(storeKey, detail => {
    if (detail.type === 'VEHICLES_UPDATED') setVehicles(detail.vehicles);
  }), [storeKey]);
  if (loading) return <p role="status" className="p-8 text-white bg-slate-950 min-h-screen">Carregando acesso ao painel…</p>;
  if (!isAuthenticated) return <LoginView onLoginSuccess={() => setTab('dashboard')} onCancel={onExitToSite} />;
  const route = merchantRoutes[tab];
  const allowed = route && tier >= route.tier && (!route.roles || hasRole(route.roles));
  const active = allowed ? tab : 'dashboard';
  const View = active === 'financing' ? FinancingComponent : merchantRoutes[active].component;
  return <MerchantShell storeName={dealership.nome} activeTab={active} onSelectTab={setTab} onExitToSite={onExitToSite}>
    <PanelErrorBoundary key={`${active}-${storeKey}`} onRecover={() => setTab('dashboard')}>
      {View ? <View storeKey={storeKey} defaultVehicles={defaultVehicles} vehicles={vehicles}
        dealership={{ ...dealership, ...dealership.endereco }} selectedClient={client}
        onNavigateTo={setTab} onOpenContractWithClient={selected => { setClient(selected); setTab('contracts'); }} />
        : <p role="status">Selecione uma funcionalidade no menu.</p>}
    </PanelErrorBoundary>
  </MerchantShell>;
}
