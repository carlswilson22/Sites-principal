import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTier } from '../context/TierContext';
import { canAccessMerchantRoute } from '../utils/merchantAccess';
import { ContractsView } from './ContractsView';
import { AdvancedContractsView } from './AdvancedContractsView';

export function ContractsCenter(props) {
  const { role } = useAuth();
  const { tier } = useTier();
  const [section, setSection] = useState('basic');
  const canUseAdvanced = canAccessMerchantRoute('contracts_adv', tier, role);
  const advanced = canUseAdvanced && section === 'advanced';
  return <div className="space-y-5">
    {canUseAdvanced && <nav aria-label="Tipos de contratos" className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2">
      <button type="button" aria-current={!advanced ? 'page' : undefined} onClick={() => setSection('basic')} className={`min-h-11 rounded-lg px-4 text-sm font-semibold ${!advanced ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>Contratos e termos</button>
      <button type="button" aria-current={advanced ? 'page' : undefined} onClick={() => setSection('advanced')} className={`min-h-11 rounded-lg px-4 text-sm font-semibold ${advanced ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>Contratos avançados e aditivos</button>
    </nav>}
    {advanced ? <AdvancedContractsView {...props} /> : <ContractsView {...props} />}
  </div>;
}
