import React, { useEffect, useId, useState } from 'react';
import { Calculator, ChevronDown } from 'lucide-react';
import { FinancingCalculator } from './FinancingCalculator';

export function VehicleFinancingSection({ vehicle, dealership, storeKey, initialOpen = false, openRequest = 0 }) {
  const [open, setOpen] = useState(initialOpen);
  const [mounted, setMounted] = useState(initialOpen);
  const id = useId();
  useEffect(() => { if (openRequest > 0) { setMounted(true); setOpen(true); } }, [openRequest]);
  return <section className="rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden">
    <button type="button" aria-expanded={open} aria-controls={id} onClick={() => { setMounted(true); setOpen(value => !value); }} className="w-full min-h-12 flex items-center gap-3 p-4 text-left font-semibold text-white hover:bg-slate-800">
      <Calculator aria-hidden="true" className="w-5 h-5 text-blue-300 shrink-0" />
      <span className="flex-1">Simular financiamento deste veículo</span>
      <ChevronDown aria-hidden="true" className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    <div id={id} hidden={!open} className="p-4 sm:p-5 border-t border-slate-700">
      {mounted && <FinancingCalculator vehicles={[vehicle]} preselectedVehicle={vehicle} lockedVehicle dealership={dealership} storeKey={storeKey} />}
    </div>
  </section>;
}
