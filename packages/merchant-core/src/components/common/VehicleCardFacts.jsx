import React from 'react';
import { vehicleCardFacts } from '../../utils/storeExperience';

export function VehicleCardFacts({ vehicle }) {
  return <dl className="grid grid-cols-3 gap-3 mt-3 py-3 border-t border-slate-700/60 text-xs">
    {vehicleCardFacts(vehicle).map(fact => <div key={fact.label} className="min-w-0 space-y-1"><dt className="text-slate-400">{fact.label}</dt><dd className="font-semibold text-slate-100 break-words">{fact.value}</dd></div>)}
  </dl>;
}
