import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Car, FilterX } from 'lucide-react';
import { VehicleCard } from '../vehicles/VehicleCard';

export function InventorySection({ vehicles, onSelectVehicle, searchFilter, onClearFilter, hideHeader = false }) {
  const [selectedCategory, setSelectedCategory] = useState(searchFilter?.category || 'todos');
  const [searchQuery, setSearchQuery] = useState(searchFilter?.term || '');
  const [sortBy, setSortBy] = useState('destaque'); // 'destaque' | 'preco-asc' | 'preco-desc' | 'ano-desc' | 'km-asc'

  // Categorias disponíveis com contagem dinâmica
  const categories = useMemo(() => {
    const list = [
      { id: 'todos', label: 'Todos' },
      { id: 'suv', label: 'SUVs' },
      { id: 'sedan', label: 'Sedans' },
      { id: 'hatch', label: 'Hatches' },
      { id: 'pickup', label: 'Picapes' },
      { id: 'esportivo', label: 'Esportivos' }
    ];

    return list.map(cat => ({
      ...cat,
      count: cat.id === 'todos' 
        ? vehicles.length 
        : vehicles.filter(v => v.categoria === cat.id).length
    }));
  }, [vehicles]);

  // Filtragem e ordenação reativa
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter(v => {
        // Filtro por Categoria
        if (selectedCategory !== 'todos' && v.categoria !== selectedCategory) {
          return false;
        }
        // Filtro por Texto (Nome, versão, motor)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = v.nome.toLowerCase().includes(q);
          const matchesVersao = v.versao.toLowerCase().includes(q);
          const matchesCategoria = v.categoria.toLowerCase().includes(q);
          if (!matchesName && !matchesVersao && !matchesCategoria) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'preco-asc') return a.preco - b.preco;
        if (sortBy === 'preco-desc') return b.preco - a.preco;
        if (sortBy === 'ano-desc') return b.ano.localeCompare(a.ano);
        if (sortBy === 'km-asc') return a.km - b.km;
        // Padrão: Destaques primeiro
        if (a.destaque && !b.destaque) return -1;
        if (!a.destaque && b.destaque) return 1;
        return 0;
      });
  }, [vehicles, selectedCategory, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('todos');
    setSearchQuery('');
    setSortBy('destaque');
    if (onClearFilter) onClearFilter();
  };

  return (
    <section id="estoque" className={hideHeader ? "py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" : "py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16"}>
      {/* Cabeçalho da Seção */}
      {!hideHeader ? (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">Showroom Completo</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              Nosso Estoque de Seminovos
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Veículos inspecionados, revisados e com procedência comprovada.
            </p>
          </div>

          {/* Contador */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Mostrando</span>
            <span className="font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              {filteredVehicles.length} {filteredVehicles.length === 1 ? 'veículo' : 'veículos'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex justify-end mb-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span>Total de ofertas encontradas:</span>
            <span className="font-bold text-white bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              {filteredVehicles.length} {filteredVehicles.length === 1 ? 'veículo' : 'veículos'}
            </span>
          </div>
        </div>
      )}

      {/* Barra de Controles: Filtros de Pílula & Busca */}
      <div className="space-y-4 mb-8">
        {/* Pílulas de Categoria */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all duration-200 flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedCategory === cat.id ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Busca e Ordenação */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          {/* Campo de Busca Rápida */}
          <div className="w-full sm:w-80 flex items-center px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Filtrar por nome ou versão..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white text-xs">
                Limpar
              </button>
            )}
          </div>

          {/* Ordenação */}
          <div className="w-full sm:w-auto flex items-center gap-2 justify-end">
            <span className="text-xs text-slate-400 hidden sm:inline">Ordenar por:</span>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="destaque" className="bg-slate-900 text-white">Destaques</option>
                <option value="preco-asc" className="bg-slate-900 text-white">Menor Preço</option>
                <option value="preco-desc" className="bg-slate-900 text-white">Maior Preço</option>
                <option value="ano-desc" className="bg-slate-900 text-white">Mais Novos (Ano)</option>
                <option value="km-asc" className="bg-slate-900 text-white">Menor Quilometragem</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Veículos */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onSelect={onSelectVehicle}
            />
          ))}
        </div>
      ) : (
        /* Estado Vazio */
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/30 border border-slate-800 max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <FilterX className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-white">Nenhum veículo encontrado</h3>
          <p className="text-xs text-slate-400">
            Não encontramos nenhum veículo correspondente aos filtros selecionados.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </section>
  );
}
