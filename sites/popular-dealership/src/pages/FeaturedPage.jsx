import React from 'react';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { Flame, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function FeaturedPage({ 
  vehicles, 
  onNavigate, 
  onSelectVehicle,
  isFavorite,
  onToggleFavorite,
  isComparing,
  onToggleCompare,
  onOpenPriceAlert
}) {
  const featured = vehicles.filter(v => v.destaque);

  return (
    <div className="pt-24 pb-20 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-cyan-950/20 via-[#070a12] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>Oportunidades Especiais do Mês</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Veículos em Destaque & Abaixo da FIPE
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Seleção criteriosa de modelos com os melhores preços do mercado, baixa quilometragem e laudo cautelar liberado.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(v => (
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
      </div>
    </div>
  );
}
