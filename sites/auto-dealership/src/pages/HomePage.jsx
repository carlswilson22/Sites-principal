import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { Button } from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';

export function HomePage({ vehicles = [], onNavigate, onSelectVehicle }) {
  const featuredVehicles = vehicles.filter(vehicle => vehicle.destaque);
  const selection = (featuredVehicles.length ? featuredVehicles : vehicles).slice(0, 3);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      <HeroSection onNavigate={onNavigate} />
      <section aria-labelledby="home-vehicles-title" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <h2 id="home-vehicles-title" className="font-heading text-2xl sm:text-3xl font-extrabold text-white">Uma seleção para você</h2>
            <p className="mt-2 text-sm text-slate-400">Conheça alguns veículos da loja. O catálogo completo está no estoque.</p>
          </div>
          <Button variant="outline" size="md" icon={ArrowRight} onClick={() => onNavigate('estoque')} className="self-start sm:self-auto">Ver estoque completo</Button>
        </div>
        {selection.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selection.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={onSelectVehicle} show360Badge={false} />)}
          </div>
        ) : (
          <p className="p-6 rounded-2xl border border-slate-800 bg-slate-900 text-slate-300">Novos veículos serão apresentados aqui em breve.</p>
        )}
      </section>
    </div>
  );
}
