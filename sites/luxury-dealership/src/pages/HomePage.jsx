import React from 'react';
import { ArrowRight } from 'lucide-react';
import { HeroVideoScrub } from '../components/home/HeroVideoScrub';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { Button } from '../components/ui/Button';
import { dealershipInfo } from '../data/dealershipInfo';

export function HomePage({ vehicles = [], onNavigate, onSelectVehicle }) {
  const featuredVehicles = vehicles.filter(vehicle => vehicle.destaque);
  const topVehicles = (featuredVehicles.length ? featuredVehicles : vehicles).slice(0, 3);

  return (
    <div className="space-y-14 sm:space-y-20 pb-16 sm:pb-20">
      <HeroVideoScrub>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="text-sm font-semibold tracking-widest uppercase text-amber-300">Seleção de veículos e atendimento exclusivo</p>
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight">
            {dealershipInfo.nome}
          </h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Conheça os veículos disponíveis e encontre o próximo capítulo da sua história ao volante.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
            <Button variant="gold" size="lg" icon={ArrowRight} onClick={() => onNavigate('estoque')}>
              Explorar estoque
            </Button>
            <Button variant="outline" size="lg" onClick={() => onNavigate('sobre-contato')}>
              Conhecer a loja
            </Button>
          </div>
        </div>
      </HeroVideoScrub>

      <section aria-labelledby="home-selection-title" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <h2 id="home-selection-title" className="font-heading text-2xl sm:text-3xl font-extrabold text-white">Uma seleção para você</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">Veja alguns veículos da loja. O catálogo completo está no estoque.</p>
          </div>
          <Button variant="outline" size="md" icon={ArrowRight} onClick={() => onNavigate('estoque')} className="self-start sm:shrink-0">
            Ver todo o estoque
          </Button>
        </div>
        {topVehicles.length ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topVehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={onSelectVehicle} />)}
        </div> : <p className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-slate-300">Estamos preparando novas opções para você. Fale com a loja para consultar disponibilidade.</p>}
      </section>
    </div>
  );
}
