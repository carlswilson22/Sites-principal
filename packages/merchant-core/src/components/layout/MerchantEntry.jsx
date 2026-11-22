import React, { lazy, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TierProvider } from '../../context/TierContext';
import { LoginView } from '../../pages/LoginView';

const MerchantPanel = lazy(() => import('./MerchantPanel').then(module => ({ default: module.MerchantPanel })));

export function MerchantEntry({ tier, ...props }) {
  const { isStaff, role, loading } = useAuth();
  if (loading) return <p role="status" className="p-8 text-white bg-slate-950 min-h-screen">Carregando acesso ao painel…</p>;
  if (!isStaff) return <LoginView storeKey={props.storeKey} storeName={props.dealership.nome} onCancel={props.onExitToSite} />;
  return <TierProvider tier={tier}>
    <Suspense fallback={<p role="status" className="p-8 text-white bg-slate-950 min-h-screen">Carregando painel do lojista…</p>}>
      <MerchantPanel key={`${props.storeKey}-${role}`} {...props} />
    </Suspense>
  </TierProvider>;
}
