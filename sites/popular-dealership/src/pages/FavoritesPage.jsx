import React from 'react';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { Heart, ArrowRight, Car } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function FavoritesPage({ 
  favoriteVehicles = [], 
  onNavigate, 
  onSelectVehicle,
  isFavorite,
  onToggleFavorite,
  isComparing,
  onToggleCompare,
  onOpenPriceAlert
}) {
  return (
    <div className="pt-24 pb-20 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-rose-950/20 via-[#070a12] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-400" />
            <span>Garagem Virtual</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Meus Veículos Salvos ({favoriteVehicles.length})
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Seus modelos favoritos salvos para você comparar com calma, monitorar preços ou simular financiamento.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {favoriteVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteVehicles.map(v => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onSelect={onSelectVehicle}
                isFavorite={isFavorite ? isFavorite(v.id) : true}
                onToggleFavorite={onToggleFavorite}
                isComparing={isComparing ? isComparing(v.id) : false}
                onToggleCompare={onToggleCompare}
                onOpenPriceAlert={onOpenPriceAlert}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-[#090d16] border border-slate-800 text-center space-y-4">
            <Heart className="w-12 h-12 text-rose-500/40 mx-auto" />
            <h3 className="font-heading text-xl font-bold text-white">Nenhum veículo salvo nos favoritos ainda</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Clique no ícone de coração nos cards de veículos do estoque para salvá-los e acompanhar aqui.
            </p>
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              onClick={() => onNavigate('estoque')}
            >
              Explorar Estoque Completo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
