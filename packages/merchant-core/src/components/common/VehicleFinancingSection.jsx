import React, { useEffect, useId, useState } from 'react';
import { Calculator, ChevronDown } from 'lucide-react';
import { PublicFinancingCalculator } from './PublicFinancingCalculator';
import { useVehicleAdSection } from './VehicleAdSections';
import { useDisclosurePresence } from './useDisclosurePresence';
import { AnimatedDisclosure } from './AnimatedDisclosure';

export function VehicleFinancingSection({ vehicle, dealership, storeKey, initialOpen = false, openRequest = 0 }) {
  const [activeService, setActiveService] = useVehicleAdSection('service');
  const open = activeService === 'financing';
  const present = useDisclosurePresence(open);
  const [mounted, setMounted] = useState(initialOpen);
  const id = useId();
  const setOpen = value => setActiveService(current => value ? 'financing' : current === 'financing' ? null : current);
  const expand = () => { setMounted(true); setOpen(true); };
  useEffect(() => { if (initialOpen) { setMounted(true); setActiveService('financing'); } }, [initialOpen, setActiveService]);
  useEffect(() => { if (openRequest > 0) expand(); }, [openRequest]);
  return <section className="rounded-xl border border-slate-700 bg-slate-950/40 overflow-hidden">
    <button type="button" data-ad-service="financing" aria-expanded={open} aria-controls={id} onClick={() => { if (open) setOpen(false); else expand(); }} className="w-full min-h-11 flex items-center gap-3 px-3 py-2.5 text-left text-sm font-semibold text-white hover:bg-slate-800">
      <Calculator aria-hidden="true" className="w-4 h-4 text-blue-300 shrink-0" />
      <span className="flex-1">Simular financiamento deste veículo</span>
      <ChevronDown aria-hidden="true" className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
    </button>
    <AnimatedDisclosure id={id} open={open} present={present}><div className="p-4 sm:p-5 border-t border-slate-700">
      {mounted && <PublicFinancingCalculator vehicles={[vehicle]} preselectedVehicle={vehicle} lockedVehicle dealership={dealership} storeKey={storeKey} />}
    </div></AnimatedDisclosure>
  </section>;
}
