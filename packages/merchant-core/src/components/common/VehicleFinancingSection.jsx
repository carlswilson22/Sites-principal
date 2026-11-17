import React, { useEffect, useId, useState } from 'react';
import { Calculator, ChevronDown } from 'lucide-react';
import { FinancingCalculator } from './FinancingCalculator';
import { useStoreAccess } from '../../context/StoreAccessContext';
import { useVehicleAdSection } from './VehicleAdSections';

export function VehicleFinancingSection({ vehicle, dealership, storeKey, initialOpen = false, openRequest = 0 }) {
  const { user, requireLogin } = useStoreAccess();
  const [activeService, setActiveService] = useVehicleAdSection('service');
  const open = activeService === 'financing';
  const [mounted, setMounted] = useState(initialOpen && !!user);
  const id = useId();
  const setOpen = value => setActiveService(current => value ? 'financing' : current === 'financing' ? null : current);
  const expand = () => requireLogin(() => { setMounted(true); setOpen(true); }, 'Entre para simular o financiamento deste veículo sem sair do anúncio.');
  useEffect(() => { if (initialOpen && user) { setMounted(true); setActiveService('financing'); } }, [initialOpen, !!user, setActiveService]);
  useEffect(() => { if (openRequest > 0) expand(); }, [openRequest]);
  useEffect(() => { if (!user) { setOpen(false); setMounted(false); } }, [user]);
  return <section className="rounded-xl border border-slate-700 bg-slate-950/40 overflow-hidden">
    <button type="button" data-ad-service="financing" aria-expanded={open && !!user} aria-controls={id} onClick={() => { if (open && user) setOpen(false); else expand(); }} className="w-full min-h-11 flex items-center gap-3 px-3 py-2.5 text-left text-sm font-semibold text-white hover:bg-slate-800">
      <Calculator aria-hidden="true" className="w-4 h-4 text-blue-300 shrink-0" />
      <span className="flex-1">Simular financiamento deste veículo</span>
      <ChevronDown aria-hidden="true" className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    <div id={id} hidden={!open || !user} className="p-4 sm:p-5 border-t border-slate-700">
      {mounted && user && <FinancingCalculator vehicles={[vehicle]} preselectedVehicle={vehicle} lockedVehicle showContact={false} dealership={dealership} storeKey={storeKey} />}
    </div>
  </section>;
}
