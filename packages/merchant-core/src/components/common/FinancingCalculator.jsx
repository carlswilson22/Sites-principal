import React, { useId, useState } from 'react';
import { useFinancingSimulation } from '../../hooks/useFinancingSimulation';

const money = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function FinancingCalculator({ vehicles = [], preselectedVehicle = null, dealership = {}, lockedVehicle = false, showContact = true, storeKey }) {
  const id = useId();
  const [rate, setRate] = useState(storeKey === 'drivenow' ? 1.25 : 1.45);
  const simulation = useFinancingSimulation({ vehicles, preselectedVehicle, fallbackPrice: 95000, downPaymentRatio: 0.3, minimumDownPaymentRatio: 0, monthlyRate: rate / 100 });
  const { selectedVehicle, price, downPayment, term, monthlyPayment, financedAmount } = simulation;
  const totalInstallments = Math.round(monthlyPayment * term * 100) / 100;
  const field = 'mt-1 w-full min-h-11 px-3 py-2 rounded-xl bg-slate-950 border border-slate-600 text-white focus:outline-none focus:border-blue-400';
  const summary = `Olá, gostaria de falar com um funcionário da ${dealership.nome || 'loja'} sobre financiamento. Veículo: ${selectedVehicle?.nome || selectedVehicle?.title || 'a definir'}. Valor: ${money(price)}; entrada: ${money(downPayment)}; ${term} parcelas estimadas de ${money(monthlyPayment)}; taxa ilustrativa: ${rate}% a.m.`;
  const whatsapp = String(dealership.whatsapp || '').replace(/\D/g, '');
  return <div className="space-y-5 text-sm" data-financing-vehicle={selectedVehicle?.id ?? ''}>
    {!lockedVehicle && vehicles.length > 0 && <label htmlFor={`${id}-vehicle`} className="block text-slate-300">Veículo
      <select id={`${id}-vehicle`} value={selectedVehicle?.id ?? ''} onChange={event => simulation.selectVehicle(event.target.value)} className={field}>
        {vehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{vehicle.nome || vehicle.title} · {money(vehicle.preco ?? vehicle.price)}</option>)}
      </select>
    </label>}
    {lockedVehicle && <p className="font-semibold text-white">{selectedVehicle?.nome || selectedVehicle?.title} · {money(price)}</p>}
    <div className="grid sm:grid-cols-2 gap-4">
      {!lockedVehicle && <label htmlFor={`${id}-price`} className="text-slate-300">Valor do veículo (R$)
        <input id={`${id}-price`} type="number" min={simulation.bounds.minimum} max={simulation.bounds.maximum} step="0.01" value={price} onChange={event => simulation.setPrice(event.target.value)} className={field} />
      </label>}
      <label htmlFor={`${id}-entry`} className="text-slate-300">Entrada (R$)
        <input id={`${id}-entry`} type="number" min={simulation.minimumDownPayment} max={simulation.maximumDownPayment} step="0.01" value={downPayment} onChange={event => simulation.setDownPayment(event.target.value)} className={field} />
        <span className="block mt-1 text-xs text-slate-400">Até {money(simulation.maximumDownPayment)} (80% do valor).</span>
      </label>
      <label htmlFor={`${id}-term`} className="text-slate-300">Prazo
        <select id={`${id}-term`} value={term} onChange={event => simulation.setTerm(Number(event.target.value))} className={field}>
          {[12, 24, 36, 48, 60].map(months => <option key={months} value={months}>{months} meses</option>)}
        </select>
      </label>
      <label htmlFor={`${id}-rate`} className="text-slate-300">Taxa ilustrativa (% ao mês)
        <input id={`${id}-rate`} type="number" min="0" max="10" step="0.01" value={rate} onChange={event => { const value = Number(event.target.value); if (Number.isFinite(value)) setRate(Math.min(10, Math.max(0, value))); }} className={field} />
      </label>
    </div>
    <div aria-live="polite" className="rounded-2xl bg-blue-500/10 border border-blue-400/30 p-5 space-y-3">
      <p className="text-slate-300">Parcela estimada <strong className="block text-3xl text-white">{money(monthlyPayment)} <span className="text-sm font-normal text-slate-400">/ mês</span></strong></p>
      <dl className="space-y-2 text-slate-300">
        {[['Saldo financiado', financedAmount], ['Juros estimados no período', Math.max(0, totalInstallments - financedAmount)], ['Total com a entrada', totalInstallments + downPayment]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd className="text-white text-right">{money(value)}</dd></div>)}
      </dl>
    </div>
    <p className="text-xs leading-relaxed text-slate-400">Estimativa pela Tabela Price. Taxa ilustrativa, sem IOF, tarifas ou seguros. A proposta e o CET dependem da instituição e da análise de crédito.</p>
    {showContact && whatsapp && <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(summary)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold">Falar com um funcionário sobre esta simulação</a>}
  </div>;
}
