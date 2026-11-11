import React from 'react';
import { selectHomeVehicles } from '../../../../packages/merchant-core/src/utils/storeExperience';
import { ArrowRight } from 'lucide-react';
import { HeroSection } from '../components/home/HeroSection';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { Button } from '../components/ui/Button';

export function HomePage({
  vehicles = [], onNavigate, onSelectVehicle, isFavorite, onToggleFavorite,
  isComparing, onToggleCompare, onOpenPriceAlert
}) {
  const topVehicles = selectHomeVehicles(vehicles);

  return (
    <div className="space-y-14 sm:space-y-20 pb-16 sm:pb-20">
      <HeroSection onNavigate={onNavigate} />
      <section aria-labelledby="home-vehicles-title" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <h2 id="home-vehicles-title" className="font-heading text-2xl sm:text-3xl font-extrabold text-white">Uma seleção do nosso estoque</h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2">Conheça alguns veículos disponíveis e encontre o seu próximo carro.</p>
          </div>
          <Button variant="primary" size="md" icon={ArrowRight} onClick={() => onNavigate('estoque')} className="w-full sm:w-auto shrink-0">Ver estoque completo</Button>
        </div>
        {topVehicles.length ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topVehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={onSelectVehicle}
            isFavorite={isFavorite ? isFavorite(vehicle.id) : false} onToggleFavorite={onToggleFavorite}
            isComparing={isComparing ? isComparing(vehicle.id) : false} onToggleCompare={onToggleCompare}
            onOpenPriceAlert={onOpenPriceAlert} />)}
        </div> : <p className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300">Estamos atualizando nosso estoque. Fale com a loja para conhecer as próximas oportunidades.</p>}
      </section>
    </div>
  );
}
