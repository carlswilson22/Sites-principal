import React, { lazy, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TierProvider } from '../../context/TierContext';

const MerchantPanel = lazy(() => import('./MerchantPanel').then(module => ({ default: module.MerchantPanel })));

export function MerchantEntry({ tier, ...props }) {
  const { isStaff, role } = useAuth();
  if (!isStaff) return <div role="alert" className="min-h-screen bg-slate-950 text-white p-8 space-y-4"><p>O painel é exclusivo da equipe da loja.</p><button type="button" onClick={props.onExitToSite} className="min-h-11 underline">Voltar para a vitrine</button></div>;
  return <TierProvider tier={tier}>
    <Suspense fallback={<p role="status" className="p-8 text-white bg-slate-950 min-h-screen">Carregando painel do lojista…</p>}>
      <MerchantPanel key={`${props.storeKey}-${role}`} {...props} />
    </Suspense>
  </TierProvider>;
}
