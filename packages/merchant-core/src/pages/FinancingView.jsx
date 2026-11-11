import React from 'react';
import { FinancingCalculator } from '../components/common/FinancingCalculator';

export function FinancingView({ vehicles = [], dealership = {}, storeKey }) {
  return <section className="w-full min-w-0 max-w-4xl space-y-6">
    <div className="min-w-0"><h1 className="text-2xl leading-tight font-bold text-white">Simulador de financiamento</h1><p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-400">Prepare uma estimativa de entrada e parcelas durante o atendimento.</p></div>
    <div className="min-w-0 p-4 sm:p-6 rounded-2xl border border-slate-700 bg-slate-900"><FinancingCalculator vehicles={vehicles} dealership={dealership} storeKey={storeKey} showContact={false} /></div>
  </section>;
}
