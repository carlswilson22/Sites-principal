import React from 'react';
import { selectHomeVehicles } from '../../../../packages/merchant-core/src/utils/storeExperience';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { HeroVideoScrub } from '../components/home/HeroVideoScrub';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { dealershipInfo } from '../data/dealershipInfo';

export function HomePage({ vehicles = [], onNavigate, onSelectVehicle }) {
  const selection = selectHomeVehicles(vehicles);
  return <div data-store-layout="editorial" className="pb-16 sm:pb-24">
    <HeroVideoScrub>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_18rem] items-end gap-10">
        <div className="space-y-7">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-200">{dealershipInfo.nome}</p>
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.05] max-w-2xl drop-shadow-lg">Algumas escolhas<br />merecem <span className="italic text-amber-200">tempo.</span></h1>
          <a href="#colecao" className="inline-flex gap-3 items-center text-white min-h-12 border-b border-amber-300/60">Conheça nossa seleção<ArrowDown aria-hidden="true" className="w-4 h-4" /></a>
        </div>
        <div className="text-white text-sm leading-relaxed space-y-4 lg:pb-3 drop-shadow-md">
          <p>Explore cada detalhe e encontre sua próxima escolha, no seu tempo.</p>
          <button type="button" onClick={() => onNavigate('sobre-contato')} className="inline-flex items-center gap-2 min-h-11 text-sm text-amber-200">Conheça a DriveNow<ArrowUpRight aria-hidden="true" className="w-4 h-4" /></button>
        </div>
      </div>
    </HeroVideoScrub>
    <section id="colecao" aria-labelledby="collection-title" className="scroll-mt-44 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 grid lg:grid-cols-[12rem_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
      <div className="lg:sticky lg:top-44 space-y-5">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Em exposição</p>
        <h2 id="collection-title" className="font-heading text-3xl font-light text-white">Uma seleção.<br />Muitas histórias.</h2>
        <p className="text-sm text-slate-400 leading-relaxed">Fotografias, detalhes e o que você precisa saber para escolher seu próximo carro.</p>
        <button type="button" onClick={() => onNavigate('estoque')} className="inline-flex items-center gap-2 text-sm text-amber-200 min-h-11 underline underline-offset-4">Ver acervo completo<ArrowUpRight aria-hidden="true" className="w-4 h-4" /></button>
      </div>
      <div className="space-y-8 sm:space-y-12 min-w-0">{selection.length ? selection.map((vehicle, index) => <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={onSelectVehicle} layout="editorial" index={index + 1} />) : <p className="text-slate-300 py-8">Em breve, novas escolhas no nosso acervo. Converse com a loja para saber mais.</p>}</div>
    </section>
  </div>;
}
