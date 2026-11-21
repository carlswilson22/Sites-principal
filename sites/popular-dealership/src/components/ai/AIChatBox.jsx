import React from 'react';
import { dealershipInfo } from '../../data/dealershipInfo';

const StoreConciergePage = React.lazy(() => import('../../../../../packages/merchant-core/src/pages/StoreConciergePage').then(module => ({ default: module.StoreConciergePage })));

export function AIChatBox({ vehicles = [], onSelectVehicle, onNavigate }) {
  return <React.Suspense fallback={<p role="status" className="p-6 text-slate-300">Carregando atendimento…</p>}><StoreConciergePage dealership={dealershipInfo} storeKey="apexluxury" vehicles={vehicles} onSelectVehicle={onSelectVehicle} onNavigate={onNavigate} title={`Atendimento ${dealershipInfo.nome}`} /></React.Suspense>;
}
