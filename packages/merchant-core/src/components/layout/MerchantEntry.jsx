import React, { lazy, Suspense } from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { TierProvider } from '../../context/TierContext';

const MerchantPanel = lazy(() => import('./MerchantPanel').then(module => ({ default: module.MerchantPanel })));

export function MerchantEntry({ tier, ...props }) {
  return <AuthProvider><TierProvider tier={tier}>
    <Suspense fallback={<p role="status" className="p-8 text-white bg-slate-950 min-h-screen">Carregando painel do lojista…</p>}>
      <MerchantPanel {...props} />
    </Suspense>
  </TierProvider></AuthProvider>;
}
