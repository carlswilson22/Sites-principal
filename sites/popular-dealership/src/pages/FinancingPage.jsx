import React from 'react';
import { FinancingCalculator } from '../../../../packages/merchant-core/src/components/common/FinancingCalculator';
import { dealershipInfo } from '../data/dealershipInfo';
export function FinancingPage({ vehicles = [], preselectedVehicle }) {
 return <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6"><h1 className="text-3xl font-bold text-white">Simulador de financiamento</h1><div className="p-5 sm:p-8 rounded-2xl bg-slate-900 border border-slate-700"><FinancingCalculator vehicles={vehicles} preselectedVehicle={preselectedVehicle} dealership={dealershipInfo} storeKey="apexluxury" /></div></section>;
}
