import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, Tags } from 'lucide-react';
import { calculatePricing } from '../utils/pricing';

const money = amount => Number(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const field = 'mt-1 w-full min-h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100';

export function FipePricingView({ vehicles = [] }) {
  const catalog = useMemo(() => vehicles.map(vehicle => ({
    brand: String(vehicle.marca || vehicle.brand || (vehicle.nome || vehicle.title || '').split(' ')[0]).trim(),
    model: String(vehicle.nome || vehicle.title || '').trim(),
    year: String(vehicle.ano || vehicle.year || '').trim(),
  })).filter(vehicle => vehicle.brand && vehicle.model), [vehicles]);
  const brands = [...new Set(catalog.map(vehicle => vehicle.brand))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [fipePrice, setFipePrice] = useState('');
  const [prepCost, setPrepCost] = useState('2500');
  const [margin, setMargin] = useState('12');
  const [history, setHistory] = useState([]);

  const models = [...new Set(catalog.filter(vehicle => vehicle.brand === brand).map(vehicle => vehicle.model))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const years = [...new Set(catalog.filter(vehicle => vehicle.brand === brand && vehicle.model === model).map(vehicle => vehicle.year).filter(Boolean))].sort().reverse();
  useEffect(() => { if (!brands.includes(brand)) setBrand(brands[0] || ''); }, [catalog, brand]);
  useEffect(() => { if (!models.includes(model)) setModel(models[0] || ''); }, [catalog, brand, model]);
  useEffect(() => { if (!years.includes(year)) setYear(years[0] || ''); }, [catalog, brand, model, year]);

  let result = null;
  let error = '';
  if (fipePrice !== '' || prepCost === '' || margin === '') {
    try {
      if (fipePrice === '' || prepCost === '' || margin === '') throw new Error('Preencha os valores e a margem para calcular.');
      result = calculatePricing({ fipePrice, prepCost, targetMarginPct: margin });
    } catch (failure) { error = failure.message; }
  }
  const save = () => {
    if (!result || !model) return;
    setHistory(current => [{ ...result, id: `${Date.now()}-${current.length}`, vehicle: `${model} ${year}`.trim() }, ...current].slice(0, 10));
  };

  return <div className="space-y-6 animate-fadeIn">
    <div className="border-b border-slate-800 pb-4"><h1 className="flex items-center gap-2 text-xl font-extrabold text-white sm:text-2xl"><Tags aria-hidden="true" className="h-6 w-6 text-amber-400" />Precificador Inteligente FIPE</h1><p className="mt-1 text-sm text-slate-400">Selecione um veículo do estoque e informe uma referência para calcular a proposta.</p></div>
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6">
        <h2 className="font-bold text-white">Veículo e custos</h2>
        {!catalog.length && <p role="status" className="text-sm text-slate-400">Cadastre veículos no estoque para selecionar marca e modelo.</p>}
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm text-slate-300">Marca<select aria-label="Marca / Fabricante" value={brand} onChange={event => setBrand(event.target.value)} disabled={!brands.length} className={field}>{!brands.length && <option value="">Sem marcas no estoque</option>}{brands.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="text-sm text-slate-300">Modelo<select aria-label="Modelo" value={model} onChange={event => setModel(event.target.value)} disabled={!models.length} className={field}>{!models.length && <option value="">Selecione uma marca</option>}{models.map(item => <option key={item} value={item}>{item}</option>)}</select></label></div>
        <label className="block text-sm text-slate-300">Ano referência<select aria-label="Ano referência" value={year} onChange={event => setYear(event.target.value)} disabled={!years.length} className={field}>{!years.length && <option value="">Ano não informado</option>}{years.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="block text-sm text-slate-300">Valor de referência informado (R$)<input aria-label="Valor de referência informado" type="number" min="0.01" step="0.01" value={fipePrice} onChange={event => setFipePrice(event.target.value)} className={field} /></label>
        <p className="text-xs text-slate-400">Confira o valor para o veículo e ano selecionados. Não há consulta automática à FIPE nesta tela.</p>
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm text-slate-300">Custos de preparação (R$)<input aria-label="Custos de preparação" type="number" min="0" step="0.01" value={prepCost} onChange={event => setPrepCost(event.target.value)} className={field} /></label><label className="text-sm text-slate-300">Margem alvo (%)<input aria-label="Margem alvo" type="number" min="0" max="100" step="0.01" value={margin} onChange={event => setMargin(event.target.value)} className={field} /></label></div>
      </section>
      <section aria-live="polite" className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6"><h2 className="flex items-center gap-2 font-bold text-white"><Calculator aria-hidden="true" className="h-5 w-5 text-amber-400" />Proposta de negociação</h2>
        {error ? <p role="alert" className="text-sm text-rose-400">{error}</p> : !result ? <p className="text-sm text-slate-400">Informe o valor de referência para ver o cálculo. Os resultados são atualizados ao alterar os valores.</p> : <>
          <dl className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-amber-500/40 bg-slate-900 p-4"><dt className="text-sm text-slate-300">Preço máximo de compra</dt><dd data-pricing-max className="mt-1 text-2xl font-bold text-white">{money(result.maxPurchasePrice)}</dd><span className="text-xs text-slate-400">{result.purchaseToFipePct}% da referência</span></div><div className="rounded-xl border border-slate-700 bg-slate-900 p-4"><dt className="text-sm text-slate-300">Preço sugerido de venda</dt><dd className="mt-1 text-2xl font-bold text-white">{money(result.suggestedSalePrice)}</dd></div></dl>
          <p className="text-sm text-slate-300">Lucro alvo: <strong>{money(result.expectedProfit)}</strong> · Preparação: {money(result.prepCost)}</p>
          {result.maxPurchasePrice === 0 && result.prepCost + result.expectedProfit > result.suggestedSalePrice && <p className="text-sm text-rose-400">Os custos e a margem excedem o valor de venda; o lucro alvo não é alcançável com esses valores.</p>}
          <button type="button" disabled={!model} onClick={save} className="min-h-11 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Registrar avaliação</button>
        </>}
        {history.length > 0 && <div className="border-t border-slate-700 pt-4"><h3 className="font-semibold text-white">Avaliações desta sessão</h3><ul className="mt-2 space-y-2 text-sm text-slate-300">{history.map(item => <li key={item.id} className="flex flex-wrap justify-between gap-2"><span>{item.vehicle}</span><strong>Compra até {money(item.maxPurchasePrice)}</strong></li>)}</ul></div>}
      </section>
    </div>
  </div>;
}
