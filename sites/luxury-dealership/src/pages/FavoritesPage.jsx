import React from 'react';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { Heart, ArrowRight } from 'lucide-react';

export function FavoritesPage({ favoriteVehicles = [], onNavigate, onSelectVehicle, isFavorite, onToggleFavorite }) {
  return (
    <div className="pb-20 space-y-10">
      <div className="border-b border-white/10 bg-gradient-to-b from-amber-500/10 via-[#050508] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <Heart className="w-3.5 h-3.5 fill-amber-400" />
            <span>Sua seleção</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Meus Veículos Salvos ({favoriteVehicles.length})
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Os veículos que você salvou, reunidos para olhar com calma e simular o financiamento.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {favoriteVehicles.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {favoriteVehicles.map(v => (
              <VehicleCard key={v.id} vehicle={v} onSelect={onSelectVehicle} layout="editorial" isFavorite={isFavorite ? isFavorite(v.id) : true} onToggleFavorite={onToggleFavorite} />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-[#0a0b12] border border-white/10 text-center space-y-4">
            <Heart className="w-12 h-12 text-amber-400/40 mx-auto" />
            <h3 className="text-xl font-bold text-white">Nenhum veículo salvo ainda</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">Clique no coração dos veículos do estoque para salvá-los aqui.</p>
            <button type="button" onClick={() => onNavigate('estoque')} className="min-h-11 px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs uppercase inline-flex items-center gap-2">
              Explorar o estoque <ArrowRight aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
