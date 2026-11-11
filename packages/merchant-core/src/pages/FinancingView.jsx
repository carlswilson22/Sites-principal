import React from 'react';
import { FinancingCalculator } from '../components/common/FinancingCalculator';

export function FinancingView({ vehicles = [], dealership = {}, storeKey }) {
  return <section className="max-w-4xl space-y-6">
    <div><h1 className="text-2xl font-bold text-white">Simulador de financiamento</h1><p className="mt-2 text-slate-400">Prepare uma estimativa de entrada e parcelas durante o atendimento.</p></div>
    <div className="p-5 sm:p-7 rounded-2xl border border-slate-700 bg-slate-900"><FinancingCalculator vehicles={vehicles} dealership={dealership} storeKey={storeKey} showContact={false} /></div>
  </section>;
}
