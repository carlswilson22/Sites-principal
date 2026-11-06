import React from 'react';
import { InventorySection } from '../components/home/InventorySection';
import { ShieldCheck, Car } from 'lucide-react';

export function InventoryPage({ vehicles, searchFilter, onClearFilter, onSelectVehicle }) {
  return (
    <div className="pt-24 pb-16 space-y-8">
      {/* Page Header Compacto */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-blue-950/20 via-slate-950 to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">Showroom Completo</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Estoque de Seminovos
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Encontre o veículo ideal entre nossas opções inspecionadas, 100% periciadas com laudo cautelar digital e com 1 ano de garantia total.
          </p>
        </div>
      </div>

      {/* Seção de Estoque com Filtros */}
      <InventorySection
        vehicles={vehicles}
        searchFilter={searchFilter}
        onClearFilter={onClearFilter}
        onSelectVehicle={onSelectVehicle}
        hideHeader={true}
      />
    </div>
  );
}
