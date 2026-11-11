import React, { useMemo, useState } from 'react';
import { Search, RotateCcw, SlidersHorizontal, Scale, Heart } from 'lucide-react';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { isPublishedVehicle } from '../../../../packages/merchant-core/src/utils/vehicles';

export function InventoryPage({ vehicles = [], onSelectVehicle, isFavorite, onToggleFavorite, isComparing, onToggleCompare, onOpenPriceAlert, embedded = false, onNavigate, favoritesCount = 0, comparedCount = 0 }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [brand, setBrand] = useState('todas');
  const [category, setCategory] = useState('todos');
  const [sort, setSort] = useState('destaque');
  const available = useMemo(() => vehicles.filter(isPublishedVehicle), [vehicles]);
  const brands = [...new Set(available.map(vehicle => vehicle.marca).filter(Boolean))];
  const categories = [...new Set(available.map(vehicle => vehicle.categoria).filter(Boolean))];
  const filtered = useMemo(() => available.filter(vehicle => {
    const text = `${vehicle.nome} ${vehicle.versao} ${vehicle.marca}`.toLocaleLowerCase('pt-BR');
    return text.includes(searchTerm.trim().toLocaleLowerCase('pt-BR')) && (brand === 'todas' || vehicle.marca === brand) && (category === 'todos' || vehicle.categoria === category);
  }).sort((a, b) => sort === 'preco-asc' ? a.preco - b.preco : sort === 'preco-desc' ? b.preco - a.preco : sort === 'km-asc' ? a.km - b.km : Number(Boolean(b.destaque)) - Number(Boolean(a.destaque))), [available, searchTerm, brand, category, sort]);
  const visible = embedded ? filtered.slice(0, 6) : filtered;
  const clear = () => { setSearchTerm(''); setBrand('todas'); setCategory('todos'); setSort('destaque'); };
  const field = 'mt-2 w-full min-h-12 rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300';
  const Heading = embedded ? 'h2' : 'h1';
  return <section aria-label="Explorar veículos" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${embedded ? 'pt-10' : 'py-10 sm:py-14'}`}>
    <div className="grid lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
      <aside className="lg:sticky lg:top-40 rounded-2xl bg-slate-900/70 p-5 space-y-6" aria-label="Filtros do estoque">
        <div className="flex items-center gap-2 text-white font-semibold"><SlidersHorizontal aria-hidden="true" className="w-4 h-4 text-cyan-300" />Sua busca</div>
        <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-4">
          <label className="block text-sm text-slate-300">Modelo ou marca<span className="relative block"><Search aria-hidden="true" className="absolute left-3 top-6 w-4 h-4 text-slate-400" /><input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Ex.: Corolla" className={`${field} pl-9`} /></span></label>
          <label className="block text-sm text-slate-300">Marca<select value={brand} onChange={event => setBrand(event.target.value)} className={field}><option value="todas">Todas as marcas</option>{brands.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          <label className="block text-sm text-slate-300">Categoria<select value={category} onChange={event => setCategory(event.target.value)} className={field}><option value="todos">Todas as categorias</option>{categories.map(value => <option key={value} value={value}>{value.toUpperCase()}</option>)}</select></label>
        </div>
        <button type="button" onClick={clear} className="min-h-11 text-sm text-cyan-300 inline-flex items-center gap-2"><RotateCcw aria-hidden="true" className="w-4 h-4" />Limpar filtros</button>
        {onNavigate && <div className="space-y-2 pt-2">
          <p className="text-xs text-slate-400 mb-3">Continue de onde parou</p>
          <button type="button" onClick={() => onNavigate('comparador')} className="w-full min-h-12 rounded-xl bg-cyan-300 text-slate-950 p-3 flex items-center gap-3 font-semibold text-sm"><Scale aria-hidden="true" className="w-4 h-4" />Comparar escolhas<span className="ml-auto">{comparedCount}</span></button>
          <button type="button" onClick={() => onNavigate('favoritos')} className="w-full min-h-12 rounded-xl bg-slate-800 text-white p-3 flex items-center gap-3 text-sm"><Heart aria-hidden="true" className="w-4 h-4" />Meus favoritos<span className="ml-auto">{favoritesCount}</span></button>
        </div>}
      </aside>
      <div className="min-w-0 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div><p className="text-xs uppercase tracking-widest text-cyan-300 mb-2">Encontre seu próximo carro</p><Heading className="font-heading text-2xl sm:text-3xl font-bold text-white">Explore as possibilidades</Heading><p role="status" aria-live="polite" className="mt-2 text-sm text-slate-400">{filtered.length ? `${visible.length} opções para explorar${filtered.length > visible.length ? ` entre ${filtered.length} resultados` : ''}` : 'Nenhum resultado para esta busca'}</p></div>
          <label className="text-xs text-slate-400 shrink-0">Ordenar por<select value={sort} onChange={event => setSort(event.target.value)} className="block mt-1 rounded-lg bg-slate-900 text-slate-200 min-h-11 p-2 text-sm"><option value="destaque">Recomendados</option><option value="preco-asc">Menor preço</option><option value="preco-desc">Maior preço</option><option value="km-asc">Menor quilometragem</option></select></label>
        </div>
        {visible.length ? <div className="grid sm:grid-cols-2 gap-5">{visible.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={onSelectVehicle} isFavorite={isFavorite?.(vehicle.id) || false} onToggleFavorite={onToggleFavorite} isComparing={isComparing?.(vehicle.id) || false} onToggleCompare={onToggleCompare} onOpenPriceAlert={onOpenPriceAlert} />)}</div> : <div className="rounded-2xl bg-slate-900 p-8 space-y-4"><p className="text-slate-300">Altere a marca, a categoria ou o modelo para encontrar outras opções.</p><button type="button" onClick={clear} className="min-h-11 px-4 bg-cyan-300 text-slate-950 rounded-xl font-semibold">Limpar busca</button></div>}
        {embedded && onNavigate && <button type="button" onClick={() => onNavigate('estoque')} className="w-full min-h-12 rounded-xl border border-slate-700 text-white hover:bg-slate-800 font-semibold text-sm">Explorar estoque completo</button>}
      </div>
    </div>
  </section>;
}
