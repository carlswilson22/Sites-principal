import React from 'react';
import { storeHighlights } from '../../utils/storeExperience';

export function StoreHighlights({ dealership, vehicles }) {
  return <section aria-label="Informações principais da loja" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {storeHighlights(dealership, vehicles).map(item => <div key={item.id} data-store-highlight={item.id} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 sm:p-6 text-center space-y-2"><dd className="text-xl sm:text-2xl font-bold text-white">{item.value}</dd><dt className="text-xs sm:text-sm text-slate-300">{item.label}</dt></div>)}
    </dl>
  </section>;
}
