/**
 * packages/merchant-core/src/index.js
 * Ponto de exportação do núcleo compartilhado do Painel do Lojista.
 */
export { TierProvider, useTier } from './context/TierContext';
export { AuthProvider, useAuth } from './context/AuthContext';
export { TierGate } from './components/common/TierGate';
export { MetricCard } from './components/common/MetricCard';
export { MerchantShell } from './components/layout/MerchantShell';
export { MerchantNavbar } from './components/layout/MerchantNavbar';
export { MerchantSidebar } from './components/layout/MerchantSidebar';
export { DashboardView } from './pages/DashboardView';
export { InventoryView } from './pages/InventoryView';
export { LeadsView } from './pages/LeadsView';
export { LoginView } from './pages/LoginView';
export { apiClient } from './services/apiClient';
