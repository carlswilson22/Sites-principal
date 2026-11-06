import React, { useState, useMemo } from 'react';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { Search, RotateCcw, Filter, Car } from 'lucide-react';

export function InventoryPage({ 
  vehicles, 
  onSelectVehicle, 
  isFavorite, 
  onToggleFavorite, 
  isComparing, 
  onToggleCompare,
  onOpenPriceAlert
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('todas');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('destaque');

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
      const matchCat = selectedCategory === 'todos' || v.categoria === selectedCategory;

      return matchText && matchBrand && matchCat;
    }).sort((a, b) => {
      if (sortBy === 'preco-desc') return b.preco - a.preco;
      if (sortBy === 'preco-asc') return a.preco - b.preco;
      if (sortBy === 'km-asc') return a.km - b.km;
      return (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0);
    });
  }, [vehicles, searchTerm, selectedBrand, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('todas');
    setSelectedCategory('todos');
    setSortBy('destaque');
  };

  return (
    <div className="pt-24 pb-20 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-cyan-950/20 via-[#070a12] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">Showroom Inteligente</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Estoque de Seminovos Periciados
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Modelos com laudo cautelar liberado, cálculo de TCO anual, visualização 360° e garantia de procedência.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Barra de Filtros */}
        <div className="p-6 rounded-3xl bg-[#090d16] border border-slate-800 space-y-4 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por modelo, versão ou marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 placeholder-slate-500"
              />
            </div>

            <div className="lg:col-span-3">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="todas">Todas as Marcas</option>
                {brands.filter(b => b !== 'todas').map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="todos">Todas Categorias</option>
                <option value="suv">SUVs</option>
                <option value="hatch">Hatches</option>
                <option value="sedan">Sedans</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="destaque">Destaques</option>
                <option value="preco-asc">Menor Preço</option>
                <option value="preco-desc">Maior Preço</option>
                <option value="km-asc">Menor KM</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Mostrando <strong className="text-cyan-400">{filteredVehicles.length}</strong> veículos disponíveis</span>
            {(searchTerm || selectedBrand !== 'todas' || selectedCategory !== 'todos') && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
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
              <VehicleCard
                key={v.id}
                vehicle={v}
                onSelect={onSelectVehicle}
                isFavorite={isFavorite ? isFavorite(v.id) : false}
                onToggleFavorite={onToggleFavorite}
                isComparing={isComparing ? isComparing(v.id) : false}
                onToggleCompare={onToggleCompare}
                onOpenPriceAlert={onOpenPriceAlert}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-[#090d16] border border-slate-800 text-center space-y-4">
            <Car className="w-10 h-10 text-cyan-400 mx-auto opacity-40" />
            <h3 className="text-xl font-bold text-white">Nenhum veículo encontrado</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Tente redefinir os parâmetros de pesquisa ou fale com nosso consultor IA.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs"
            >
              Ver Todo o Estoque
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
