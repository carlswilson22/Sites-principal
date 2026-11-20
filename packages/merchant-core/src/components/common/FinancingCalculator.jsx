import React, { useId, useState } from 'react';
import { useFinancingSimulation } from '../../hooks/useFinancingSimulation';
import { financingBanks } from '../../data/financingBanks';

const money = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function FinancingCalculator({ vehicles = [], preselectedVehicle = null, dealership = {}, lockedVehicle = false, showContact = true, storeKey, showBanks = lockedVehicle }) {
  const id = useId();
  const [manualRate, setRate] = useState(storeKey === 'drivenow' ? 1.25 : 1.45);
  const [bankId, setBankId] = useState(financingBanks[0].id);
  const selectedBank = showBanks ? financingBanks.find(bank => bank.id === bankId) || financingBanks[0] : null;
  const rate = selectedBank ? selectedBank.monthlyRatePercent : manualRate;
  const simulation = useFinancingSimulation({ vehicles, preselectedVehicle, fallbackPrice: 95000, downPaymentRatio: 0.3, minimumDownPaymentRatio: 0, monthlyRate: rate / 100 });
  const { selectedVehicle, price, downPayment, term, monthlyPayment, financedAmount } = simulation;
  const totalInstallments = rate === 0 ? financedAmount : Math.round(monthlyPayment * term * 100) / 100;
  const field = 'mt-2 block w-full min-w-0 max-w-full min-h-12 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-600 text-base leading-6 text-white focus:outline-none focus:border-blue-400';
  const label = 'block min-w-0 text-sm font-medium leading-5 text-slate-300';
  const summary = `Olá, gostaria de falar com um funcionário da ${dealership.nome || 'loja'} sobre financiamento. Veículo: ${selectedVehicle?.nome || selectedVehicle?.title || 'a definir'}. Valor: ${money(price)}; entrada: ${money(downPayment)}; ${term} parcelas estimadas de ${money(monthlyPayment)}; ${selectedBank ? `banco selecionado na simulação: ${selectedBank.name}; ` : ''}taxa ilustrativa: ${rate}% a.m.`;
  const whatsapp = String(dealership.whatsapp || '').replace(/\D/g, '');
  const costRows = [['Saldo financiado', financedAmount], ['Juros estimados no período', Math.max(0, totalInstallments - financedAmount)], ['Total com a entrada', totalInstallments + downPayment]];
  const costs = <dl className="space-y-2 text-slate-300">
    {costRows.filter((_, index) => !showBanks || index > 0).map(([label, value]) => <div key={label} className="flex flex-wrap justify-between items-baseline gap-x-4 gap-y-1"><dt className="min-w-0">{label}</dt><dd className="ml-auto font-medium tabular-nums whitespace-nowrap text-white text-right">{money(value)}</dd></div>)}
  </dl>;
  return <div className={`w-full min-w-0 max-w-full ${showBanks ? 'space-y-4' : 'space-y-6'} text-sm leading-relaxed`} data-financing-vehicle={selectedVehicle?.id ?? ''} data-financing-bank={selectedBank?.id}>
    {!lockedVehicle && vehicles.length > 0 && <label htmlFor={`${id}-vehicle`} className={label}>Veículo
      <select id={`${id}-vehicle`} value={selectedVehicle?.id ?? ''} onChange={event => simulation.selectVehicle(event.target.value)} className={`${field} truncate pr-8`}>
        {vehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{vehicle.nome || vehicle.title} · {money(vehicle.preco ?? vehicle.price)}</option>)}
      </select>
    </label>}
    {lockedVehicle && <p className="min-w-0 break-words font-semibold text-white">{selectedVehicle?.nome || selectedVehicle?.title} · {money(price)}</p>}
    {showBanks && <fieldset className="min-w-0 space-y-2" aria-describedby={`${id}-bank-note`}>
      <legend className="text-sm font-semibold text-slate-200">Selecione a condição para simular</legend>
      <p id={`${id}-bank-note`} className="text-xs text-slate-400">Três condições com taxas ilustrativas para comparação. A loja define as taxas reais.</p>
      {financingBanks.map(bank => <label key={bank.id} className={`flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-400 ${bankId === bank.id ? 'border-blue-400 bg-blue-500/15' : 'border-slate-700 bg-slate-950 hover:border-slate-500'}`}>
        <input type="radio" name={`${id}-bank`} value={bank.id} checked={bankId === bank.id} onChange={() => setBankId(bank.id)} className="h-4 w-4 shrink-0 accent-blue-500" />
        <span className="min-w-0 flex-1 font-semibold text-white">{bank.name}</span>
        <span className="shrink-0 text-right font-semibold tabular-nums text-cyan-300">{bank.monthlyRatePercent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% a.m.</span>
      </label>)}
    </fieldset>}
    <div className="grid gap-x-5 gap-y-5 min-w-0" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))' }}>
      {!lockedVehicle && <label htmlFor={`${id}-price`} className={label}>Valor do veículo (R$)
        <input id={`${id}-price`} type="number" min={simulation.bounds.minimum} max={simulation.bounds.maximum} step="0.01" value={price} onChange={event => simulation.setPrice(event.target.value)} className={field} />
      </label>}
      <label htmlFor={`${id}-entry`} className={label}>Entrada (R$)
        {showBanks && <span className="float-right text-xs text-slate-400">{Math.round(downPayment / price * 100)}% do valor</span>}
        <input id={`${id}-entry`} type="number" min={simulation.minimumDownPayment} max={simulation.maximumDownPayment} step="0.01" value={downPayment} onChange={event => simulation.setDownPayment(event.target.value)} className={field} />
        {!showBanks && <span className="block mt-1 text-xs text-slate-400">Até {money(simulation.maximumDownPayment)} (80% do valor).</span>}
      </label>
      {!showBanks && <label htmlFor={`${id}-term`} className={label}>Prazo
        <select id={`${id}-term`} value={term} onChange={event => simulation.setTerm(Number(event.target.value))} className={field}>
          {[12, 24, 36, 48, 60].map(months => <option key={months} value={months}>{months} meses</option>)}
        </select>
      </label>}
      {!showBanks && <label htmlFor={`${id}-rate`} className={label}>Taxa ilustrativa (% ao mês)
        <input id={`${id}-rate`} type="number" min="0" max="10" step="0.01" value={rate} onChange={event => { const value = Number(event.target.value); if (Number.isFinite(value)) setRate(Math.min(10, Math.max(0, value))); }} className={field} />
      </label>}
    </div>
    {showBanks && <>
      <div className="min-w-0 space-y-3">
        <label htmlFor={`${id}-entry-range`} className="sr-only">Ajuste a entrada</label>
        <input id={`${id}-entry-range`} type="range" min={simulation.minimumDownPayment} max={simulation.maximumDownPayment} step="0.01" value={downPayment} onChange={event => simulation.setDownPayment(event.target.value)} aria-valuetext={money(downPayment)} className="block min-h-8 w-full cursor-pointer accent-blue-500" />
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>{money(simulation.minimumDownPayment)} (0%)</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Atalhos de entrada">
            {[0.2, 0.3, 0.5].map(ratio => <button key={ratio} type="button" data-entry-ratio={ratio} aria-pressed={Math.abs(downPayment - Math.round(price * ratio * 100) / 100) < 0.005} onClick={() => simulation.setDownPayment(price * ratio)} className="min-h-11 min-w-11 rounded-lg border border-slate-600 bg-slate-800 px-3 font-semibold text-slate-200 hover:border-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 aria-pressed:border-blue-400 aria-pressed:bg-blue-500/20">{Math.round(ratio * 100)}%</button>)}
          </div>
          <span>{money(simulation.maximumDownPayment)} (80%)</span>
        </div>
      </div>
      <fieldset className="min-w-0 space-y-3">
        <legend className="text-sm font-semibold text-slate-300">Prazo de pagamento (meses)</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {[12, 24, 36, 48, 60].map(months => <button key={months} type="button" aria-label={`Prazo de ${months} meses`} aria-pressed={term === months} onClick={() => simulation.setTerm(months)} className={`min-h-12 rounded-xl border px-3 py-2 font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${term === months ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'}`}>{months}x</button>)}
        </div>
      </fieldset>
    </>}
    <div aria-live="polite" className="min-w-0 rounded-2xl bg-blue-500/10 border border-blue-400/30 p-4 sm:p-5 space-y-4">
      <p className="text-slate-300">{showBanks ? `${term} parcelas estimadas · ${selectedBank.name}` : 'Parcela estimada'} <strong data-monthly-payment={monthlyPayment} className="block mt-1 text-2xl sm:text-3xl leading-tight tabular-nums break-words text-white">{money(monthlyPayment)} <span className="inline-block text-sm font-normal text-slate-400">/ mês</span></strong></p>
      {showBanks ? <>
        <p className="flex flex-wrap justify-between gap-2 text-slate-300">Saldo financiado <span className="font-semibold tabular-nums text-white">{money(financedAmount)}</span></p>
        <details data-financing-costs className="text-sm">
          <summary className="min-h-11 cursor-pointer py-3 text-slate-300">Ver juros e custo total</summary>
          {costs}
        </details>
      </> : costs}
    </div>
    <p className="text-xs leading-relaxed text-slate-400">Estimativa pela Tabela Price. Taxa ilustrativa, sem IOF, tarifas ou seguros. A proposta e o CET dependem da instituição e da análise de crédito.</p>
    {showContact && whatsapp && <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(summary)}`} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full min-h-11 items-center px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold">Tenho interesse</a>}
  </div>;
}
