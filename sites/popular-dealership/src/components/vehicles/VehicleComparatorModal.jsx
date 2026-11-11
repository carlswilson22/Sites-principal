import React, { useEffect, useId, useRef, useState } from 'react';
import { Scale, X, Plus, Search, Check, ArrowUpRight, ChevronDown, Sparkles, DollarSign, Gauge, ShieldCheck, FileCheck, Car } from 'lucide-react';
import { VehicleImage } from '../../../../../packages/merchant-core/src/components/common/VehicleImage';
import { useDialog } from '../../../../../packages/merchant-core/src/components/common/useDialog';
import { isPublishedVehicle } from '../../../../../packages/merchant-core/src/utils/vehicles.js';
import { comparisonNumber, comparisonSelection, comparisonSummary } from '../../utils/comparison.js';
import { getDossierSummary } from '../../utils/dossier.js';
import { formatCurrency, formatKm, calculateFipeDiff } from '../../utils/formatters';

const name = vehicle => `${vehicle.nome || vehicle.title || 'Veículo'} ${vehicle.versao || vehicle.version || ''}`.trim();
const value = data => data == null || data === '' ? 'Não informado' : data;
const money = data => comparisonNumber(data) === null ? 'Não informado' : formatCurrency(Number(data));
const km = data => comparisonNumber(data, true) === null ? 'Não informado' : formatKm(Number(data));
const dossier = (vehicle, index) => getDossierSummary(vehicle.dossieOficial || {})[index].text;

const sections = [
  { id: 'prices', title: 'Preço e referência FIPE', Icon: DollarSign, rows: [
    ['Preço anunciado', vehicle => money(vehicle.preco)],
    ['Referência FIPE do anúncio', vehicle => money(vehicle.fipeReferencia)],
    ['Diferença para a referência', vehicle => calculateFipeDiff(vehicle.preco, vehicle.fipeReferencia)?.label || 'Não informada'],
    ['Plano informado', vehicle => comparisonNumber(vehicle.parcela?.valor) !== null && comparisonNumber(vehicle.parcela?.vezes) !== null ? `${vehicle.parcela.vezes}x de ${formatCurrency(vehicle.parcela.valor)}` : 'Não informado'],
    ['Entrada do plano', vehicle => comparisonNumber(vehicle.parcela?.entrada, true) !== null ? formatCurrency(vehicle.parcela.entrada) : 'Não informada']
  ] },
  { id: 'mileage', title: 'Quilometragem e histórico de uso', Icon: Gauge, rows: [
    ['Quilometragem anunciada', vehicle => km(vehicle.km)],
    ['Verificação de quilometragem', vehicle => dossier(vehicle, 3)],
    ['Proprietários anteriores', vehicle => comparisonNumber(vehicle.dossieOficial?.proprietarios) ?? 'Não informado'],
    ['Última revisão informada', vehicle => value(vehicle.dossieOficial?.dataUltimaRevisao)]
  ] },
  { id: 'inspection', title: 'Laudo cautelar e integridade estrutural', Icon: ShieldCheck, rows: [
    ['Situação do laudo', vehicle => value(vehicle.laudoCautelar?.status)],
    ['Estrutura', vehicle => value(vehicle.laudoCautelar?.estrutura)],
    ['Pintura', vehicle => value(vehicle.laudoCautelar?.pintura)],
    ['Mecânica', vehicle => value(vehicle.laudoCautelar?.mecanica)],
    ['Sinistros informados', vehicle => dossier(vehicle, 1)]
  ] },
  { id: 'records', title: 'Procedência e documentação', Icon: FileCheck, rows: [
    ['Histórico de leilão', vehicle => dossier(vehicle, 0)],
    ['Recall pendente', vehicle => dossier(vehicle, 2)],
    ['Local de registro', vehicle => value(vehicle.dossieOficial?.cidadeRegistro)],
    ['Situação documental', vehicle => value(vehicle.dossieOficial?.documentacao)],
    ['Débitos informados', vehicle => comparisonNumber(vehicle.dossieOficial?.debitos, true) !== null ? formatCurrency(vehicle.dossieOficial.debitos) : 'Não informados']
  ] },
  { id: 'specs', title: 'Especificações e custo de uso', Icon: Car, rows: [
    ['Categoria', vehicle => value(vehicle.categoria)],
    ['Motor', vehicle => value(vehicle.motor)],
    ['Potência', vehicle => value(vehicle.potencia)],
    ['Câmbio', vehicle => value(vehicle.cambio)],
    ['Combustível', vehicle => value(vehicle.combustivel)],
    ['Consumo urbano informado', vehicle => value(vehicle.fichaTecnica?.consumoUrbano)],
    ['Consumo rodoviário informado', vehicle => value(vehicle.fichaTecnica?.consumoRodoviario)],
    ['Porta-malas', vehicle => value(vehicle.fichaTecnica?.portaMalas)],
    ['Airbags', vehicle => value(vehicle.fichaTecnica?.airbags)],
    ['Custo anual estimado no anúncio', vehicle => money(vehicle.tcoEstimadoAnual?.total)]
  ] }
];

function ComparisonAnalysis({ vehicles }) {
  const summary = comparisonSummary(vehicles);
  const winners = result => result ? result.vehicles.map(name).join(' e ') : 'Dados incompletos';
  return <div className="space-y-5">
    <section aria-label="Resumo das escolhas" className="rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-3"><Sparkles aria-hidden="true" className="w-5 h-5 text-cyan-300 shrink-0" /><div><h3 className="text-sm font-bold text-white">Resumo das escolhas</h3><p className="mt-1 text-xs text-slate-400">Análise com as informações cadastradas nos anúncios.</p></div></div>
      <p className="rounded-xl bg-slate-950/80 p-4 text-sm text-slate-200 leading-relaxed">{summary.priceRange === null ? 'Alguns preços não foram informados. Confira os dados disponíveis antes de escolher.' : summary.priceRange === 0 ? 'As opções têm o mesmo preço anunciado. Compare quilometragem, equipamentos e histórico para escolher.' : `A menor oferta é de ${winners(summary.price)}, com diferença de ${formatCurrency(summary.priceRange)} em relação à opção de maior preço.`} {summary.mileage && `A menor quilometragem anunciada é de ${km(summary.mileage.value)}${summary.mileage.tied ? ', com empate entre as opções indicadas abaixo.' : `, em ${winners(summary.mileage)}.`}`}</p>
      <div className="grid sm:grid-cols-3 gap-2">{[['Menor preço', summary.price], ['Menor quilometragem', summary.mileage], ['Ano mais recente', summary.year]].map(([label, result]) => <div key={label} className="rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-3"><p className="text-xs text-cyan-200">{label}{result?.tied ? ' · Empate' : ''}</p><p className="mt-1 text-sm font-semibold text-white">{winners(result)}{label === 'Ano mais recente' && result ? ` (${result.value})` : ''}</p></div>)}</div>
    </section>
    <p className="text-xs text-slate-400">Dados dos anúncios. Confirme laudos, documentos e condições com a loja. <span className="sm:hidden">Deslize as tabelas para ver todas as colunas.</span></p>
    {sections.map(({ id, title, Icon, rows }, index) => <details key={id} open={index === 0} className="group rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden">
      <summary className="list-none cursor-pointer min-h-14 p-4 flex items-center gap-3 text-sm font-semibold text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"><Icon aria-hidden="true" className="w-4 h-4 shrink-0" /><span>{index + 1}. {title}</span><ChevronDown aria-hidden="true" className="ml-auto w-5 h-5 shrink-0 transition-transform group-open:rotate-180" /></summary>
      <div className="overflow-x-auto px-4 pb-4"><table className="w-full text-left text-xs sm:text-sm table-fixed" style={{ minWidth: vehicles.length === 3 ? 800 : 600 }}><caption className="sr-only">{title}</caption><thead><tr><th scope="col" className="w-36 p-3 text-slate-400 font-medium">Informação</th>{vehicles.map(vehicle => <th scope="col" key={vehicle.id} className="p-3 font-semibold text-white break-words">{vehicle.nome || vehicle.title}</th>)}</tr></thead><tbody>{rows.map(([label, getValue]) => <tr key={label} className="border-t border-slate-800"><th scope="row" className="p-3 text-slate-400 font-medium align-top">{label}</th>{vehicles.map(vehicle => <td key={vehicle.id} className="p-3 text-slate-200 align-top break-words">{getValue(vehicle)}</td>)}</tr>)}</tbody></table></div>
    </details>)}
  </div>;
}

export function VehicleComparatorModal({ vehicles = [], comparedVehicles = [], onConfirm, onClose, onSelectVehicle }) {
  const ref = useDialog(onClose);
  const titleId = useId();
  const titleRef = useRef(null);
  const [stage, setStage] = useState('selection');
  const [draft, setDraft] = useState(() => comparisonSelection(comparedVehicles.map(vehicle => vehicle.id), vehicles));
  const [search, setSearch] = useState('');
  const available = vehicles.filter(isPublishedVehicle);
  const ids = comparisonSelection(draft, available);
  const selected = ids.map(id => available.find(vehicle => String(vehicle.id) === id));
  const results = comparedVehicles.filter(vehicle => available.some(item => String(item.id) === String(vehicle.id)));
  const showingResults = stage === 'results' && results.length >= 2;
  const filtered = available.filter(vehicle => name(vehicle).toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR')));
  useEffect(() => { titleRef.current?.focus({ preventScroll: true }); }, [stage]);
  const toggle = id => setDraft(previous => {
    const current = comparisonSelection(previous, available);
    const key = String(id);
    return current.includes(key) ? current.filter(value => value !== key) : current.length < 3 ? [...current, key] : current;
  });
  const edit = () => { setDraft(results.map(vehicle => String(vehicle.id))); setSearch(''); setStage('selection'); };
  const compare = () => { if (ids.length >= 2) { onConfirm(ids); setStage('results'); } };
  return <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} data-comparison-stage={showingResults ? 'results' : 'selection'} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center">
    <div className={`w-full ${showingResults ? 'max-w-6xl' : 'max-w-3xl'} max-h-[92dvh] flex flex-col overflow-hidden rounded-3xl border border-slate-700 bg-[#0f1728] shadow-2xl`}>
      <header className="shrink-0 p-4 sm:p-6 border-b border-slate-800 flex items-start gap-3 bg-slate-950/80"><Scale aria-hidden="true" className="mt-1 w-6 h-6 text-cyan-300 shrink-0" /><div className="min-w-0 flex-1"><h2 id={titleId} ref={titleRef} tabIndex={-1} className="text-lg sm:text-xl font-bold text-white focus:outline-none">{showingResults ? 'Comparador multidimensional' : 'Escolha os veículos para comparar'}</h2><p className="mt-1 text-xs sm:text-sm text-slate-400">{showingResults ? 'Suas escolhas lado a lado: preço, histórico e especificações.' : 'Selecione de 2 a 3 veículos do estoque.'}</p></div><button type="button" aria-label="Fechar comparação" onClick={onClose} className="min-w-11 min-h-11 inline-flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:text-white"><X aria-hidden="true" className="w-5 h-5" /></button></header>
      <div className="overflow-y-auto min-h-0 p-4 sm:p-6 space-y-5">
        {showingResults ? <>
          <div className="flex justify-between items-center gap-3"><p className="text-sm text-slate-400">{results.length} veículos na comparação</p><button type="button" onClick={edit} className="min-h-11 text-sm font-semibold text-cyan-200">Alterar seleção</button></div>
          <div className={`grid md:grid-cols-2 ${results.length === 3 ? 'xl:grid-cols-3' : ''} gap-4`}>{results.map((vehicle, index) => <article key={vehicle.id} data-comparison-vehicle={vehicle.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex flex-col gap-3"><div className="aspect-[16/10] relative overflow-hidden rounded-xl"><VehicleImage src={vehicle.imagemPrincipal} alt={name(vehicle)} loading="lazy" className="w-full h-full object-cover" /><span className="absolute top-2 right-2 rounded-full px-3 py-1 bg-slate-950/90 text-xs text-white">Carro {index + 1}</span></div><div className="flex-1"><h3 className="font-semibold text-white">{name(vehicle)}</h3><p className="mt-1 text-xs text-slate-400">{value(vehicle.ano)} · {km(vehicle.km)}</p><p className="mt-3 font-bold text-xl text-cyan-300">{money(vehicle.preco)}</p></div><button type="button" onClick={() => onSelectVehicle(vehicle)} className="min-h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 text-slate-950 font-semibold text-sm">Ver anúncio<ArrowUpRight aria-hidden="true" className="w-4 h-4" /></button></article>)}{results.length < 3 && <button type="button" onClick={edit} className="min-h-48 rounded-2xl border-2 border-dashed border-cyan-400/30 hover:border-cyan-300 p-6 flex flex-col items-center justify-center gap-3 text-center text-cyan-200"><Plus aria-hidden="true" className="w-7 h-7" /><span className="font-semibold text-sm">Adicionar 3º veículo</span><span className="text-xs text-slate-400">Escolha mais uma opção do estoque</span></button>}</div>
          <ComparisonAnalysis vehicles={results} />
        </> : <>
          <div aria-label="Seleção atual" className="grid grid-cols-3 gap-2">{[0, 1, 2].map(index => <div key={index} className={`min-w-0 rounded-xl border p-2 ${selected[index] ? 'border-cyan-400/40 bg-cyan-300/5' : 'border-dashed border-slate-700'}`}>{selected[index] ? <><VehicleImage src={selected[index].imagemPrincipal} alt="" className="w-full h-14 sm:h-20 rounded-lg object-cover" /><p className="mt-2 truncate text-xs text-white">{selected[index].nome || selected[index].title}</p><button type="button" onClick={() => setDraft(previous => previous.filter(id => id !== String(selected[index].id)))} aria-label={`Remover ${name(selected[index])} da seleção`} className="min-h-11 text-xs text-cyan-200">Remover</button></> : <div className="h-full min-h-28 flex flex-col items-center justify-center gap-2 text-slate-500"><Plus aria-hidden="true" className="w-5 h-5" /><span className="text-xs">Carro {index + 1}{index === 2 ? ' · opcional' : ''}</span></div>}</div>)}</div>
          <label className="block text-sm text-slate-300"><span>Buscar no estoque</span><span className="relative mt-2 block"><Search aria-hidden="true" className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Digite o modelo ou a versão" className="w-full min-h-12 rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200" /></span></label>
          <div className="grid sm:grid-cols-2 gap-2" aria-label="Veículos disponíveis para comparar">{filtered.map(vehicle => { const checked = ids.includes(String(vehicle.id)); const disabled = !checked && ids.length >= 3; return <label key={vehicle.id} className={`min-w-0 flex items-center gap-3 p-3 rounded-xl border ${checked ? 'border-cyan-300 bg-cyan-300/10' : 'border-slate-700 bg-slate-950/60'} ${disabled ? 'opacity-50' : 'cursor-pointer'}`}><input type="checkbox" aria-label={`Selecionar ${name(vehicle)} para comparar`} checked={checked} disabled={disabled} onChange={() => toggle(vehicle.id)} className="w-5 h-5 shrink-0 accent-cyan-300" /><VehicleImage src={vehicle.imagemPrincipal} alt="" loading="lazy" className="w-16 h-14 shrink-0 rounded-lg object-cover" /><span className="min-w-0"><span className="block text-sm font-semibold text-white break-words">{vehicle.nome || vehicle.title}</span><span className="block text-[11px] text-slate-400">{vehicle.versao} · {vehicle.ano}</span><span className="block mt-1 text-xs text-cyan-200">{money(vehicle.preco)} · {km(vehicle.km)}</span></span>{checked && <Check aria-hidden="true" className="hidden sm:block w-4 h-4 ml-auto shrink-0 text-cyan-200" />}</label>; })}</div>
          {!filtered.length && <div className="rounded-xl border border-slate-800 p-6 text-center text-sm text-slate-400"><p>{available.length ? 'Nenhum veículo encontrado para esta busca.' : 'Ainda não há veículos disponíveis para comparar.'}</p>{search && <button type="button" onClick={() => setSearch('')} className="min-h-11 mt-2 text-cyan-200">Limpar busca da comparação</button>}</div>}
        </>}
      </div>
      {!showingResults && <footer className="shrink-0 border-t border-slate-800 bg-slate-950 p-4 sm:px-6 flex flex-wrap items-center gap-3"><p role="status" aria-live="polite" className="text-xs text-slate-400 flex-1 min-w-36">{ids.length} de 3 selecionados. {ids.length < 2 ? 'Escolha pelo menos dois.' : ids.length === 3 ? 'Remova uma escolha para adicionar outra.' : 'Você pode adicionar mais um.'}</p><button type="button" onClick={onClose} className="min-h-11 px-3 text-sm text-slate-300">Cancelar</button><button type="button" disabled={ids.length < 2} onClick={compare} className="min-h-11 rounded-xl bg-cyan-400 text-slate-950 font-semibold text-sm px-5 disabled:opacity-40 inline-flex gap-2 items-center"><Scale aria-hidden="true" className="w-4 h-4" />Comparar veículos ({ids.length})</button></footer>}
    </div>
  </div>;
}
