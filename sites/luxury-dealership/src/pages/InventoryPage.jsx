import React, { useState, useMemo } from 'react';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { Search, Filter, Shield, RotateCcw, Crown } from 'lucide-react';

export function InventoryPage({ vehicles, onSelectVehicle }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('todas');
  const [selectedBlindado, setSelectedBlindado] = useState('todos'); // 'todos' | 'sim' | 'nao'
  const [sortBy, setSortBy] = useState('preco-desc');

  const brands = useMemo(() => {
    const list = new Set(vehicles.map(v => v.marca).filter(Boolean));
    return ['todas', ...Array.from(list)];
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchText = 
        v.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.versao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.marca.toLowerCase().includes(searchTerm.toLowerCase());

      const matchBrand = selectedBrand === 'todas' || v.marca === selectedBrand;
      const matchBlindado = 
        selectedBlindado === 'todos' ||
        (selectedBlindado === 'sim' && v.blindado) ||
        (selectedBlindado === 'nao' && !v.blindado);

      return matchText && matchBrand && matchBlindado;
    }).sort((a, b) => {
      if (sortBy === 'preco-desc') return b.preco - a.preco;
      if (sortBy === 'preco-asc') return a.preco - b.preco;
      if (sortBy === 'ano-desc') return b.ano.localeCompare(a.ano);
      return 0;
    });
  }, [vehicles, searchTerm, selectedBrand, selectedBlindado, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('todas');
    setSelectedBlindado('todos');
    setSortBy('preco-desc');
  };

  return (
    <div className="pt-24 pb-20 space-y-10">
      {/* Page Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-amber-500/10 via-[#050508] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <Crown className="w-3.5 h-3.5" />
            <span>Showroom Privativo & Exclusivo</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Acervo de Superesportivos & Exóticos
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Conheça nossa seleção de modelos raros, inspecionados em concessionárias oficiais, com laudo cautelar liberado e visualização 360°.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Barra de Filtros Avançados */}
        <div className="p-6 rounded-3xl bg-[#0a0b12] border border-white/10 space-y-4 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* Campo de Busca */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por modelo, versão ou marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
            </div>

            {/* Filtro Marca */}
            <div className="lg:col-span-3">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="todas">Todas as Marcas</option>
                {brands.filter(b => b !== 'todas').map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Filtro Blindagem */}
            <div className="lg:col-span-3">
              <select
                value={selectedBlindado}
                onChange={(e) => setSelectedBlindado(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="todos">Blindagem (Todos)</option>
                <option value="sim">Apenas Blindados Nível III-A</option>
                <option value="nao">Sem Blindagem</option>
              </select>
            </div>

            {/* Ordenação */}
            <div className="lg:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="preco-desc">Maior Preço</option>
                <option value="preco-asc">Menor Preço</option>
                <option value="ano-desc">Mais Recentes</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
            <span>Exibindo <strong className="text-amber-400">{filteredVehicles.length}</strong> veículos disponíveis</span>
            {(searchTerm || selectedBrand !== 'todas' || selectedBlindado !== 'todos') && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* Grade de Veículos */}
        {filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map(v => (
              <VehicleCard key={v.id} vehicle={v} onSelect={onSelectVehicle} />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-[#0a0b12] border border-white/10 text-center space-y-4">
            <Crown className="w-10 h-10 text-amber-400 mx-auto opacity-40" />
            <h3 className="text-xl font-bold text-white">Nenhum veículo encontrado com os filtros atuais</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Tente redefinir os parâmetros de busca ou entre em contato com nosso Concierge VIP para encomendar um modelo específico.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs uppercase"
            >
              Ver Todo o Acervo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
