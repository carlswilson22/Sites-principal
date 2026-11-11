import React, { useEffect, useId, useState } from 'react';
import { Calculator, ChevronDown } from 'lucide-react';
import { FinancingCalculator } from './FinancingCalculator';
import { useStoreAccess } from '../../context/StoreAccessContext';

export function VehicleFinancingSection({ vehicle, dealership, storeKey, initialOpen = false, openRequest = 0 }) {
  const { user, requireLogin } = useStoreAccess();
  const [open, setOpen] = useState(initialOpen && !!user);
  const [mounted, setMounted] = useState(initialOpen && !!user);
  const id = useId();
  const expand = () => requireLogin(() => { setMounted(true); setOpen(true); }, 'Entre para simular o financiamento deste veículo sem sair do anúncio.');
  useEffect(() => { if (openRequest > 0) expand(); }, [openRequest]);
  useEffect(() => { if (!user) { setOpen(false); setMounted(false); } }, [user]);
  return <section className="rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden">
    <button type="button" aria-expanded={open && !!user} aria-controls={id} onClick={() => { if (open && user) setOpen(false); else expand(); }} className="w-full min-h-12 flex items-center gap-3 p-4 text-left font-semibold text-white hover:bg-slate-800">
      <Calculator aria-hidden="true" className="w-5 h-5 text-blue-300 shrink-0" />
      <span className="flex-1">Simular financiamento deste veículo</span>
      <ChevronDown aria-hidden="true" className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    <div id={id} hidden={!open || !user} className="p-4 sm:p-5 border-t border-slate-700">
      {mounted && user && <FinancingCalculator vehicles={[vehicle]} preselectedVehicle={vehicle} lockedVehicle dealership={dealership} storeKey={storeKey} />}
    </div>
  </section>;
}
