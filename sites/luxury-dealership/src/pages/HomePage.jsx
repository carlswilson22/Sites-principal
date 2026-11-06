import React from 'react';
import { HeroVideoScrub } from '../components/home/HeroVideoScrub';
import { StatsSection } from '../components/home/StatsSection';
import { WhyUsSection } from '../components/home/WhyUsSection';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { Button } from '../components/ui/Button';
import { 
  Sparkles, ArrowRight, Calculator, ArrowLeftRight, 
  Crown, Shield, ChevronDown, RotateCw 
} from 'lucide-react';

export function HomePage({ vehicles, onNavigate, onSelectVehicle }) {
  const topVehicles = vehicles.filter(v => v.destaque).slice(0, 3);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Cinematográfica com GSAP ScrollTrigger */}
      <HeroVideoScrub>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs tracking-widest uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Modelo 02 — Concessionária de Luxo & Exóticos</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading text-white tracking-tight leading-none">
            A Máxima Expressão da <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
              Engenharia Automotiva
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Acervo seleto de superesportivos, modelos exóticos e veículos blindados com procedência rastreada internacionalmente, laudo cautelar e entrega em todo o Brasil.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              variant="gold"
              size="lg"
              icon={ArrowRight}
              onClick={() => onNavigate('estoque')}
            >
              Explorar Showroom VIP
            </Button>

            <Button
              variant="outline"
              size="lg"
              icon={RotateCw}
              onClick={() => onNavigate('destaques')}
            >
              Ver Modelos em 360°
            </Button>
          </div>

          <div className="pt-8 flex flex-col items-center text-xs text-slate-400">
            <span className="uppercase tracking-widest text-[10px] text-amber-400/80 mb-1">Role para explorar o showroom</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-amber-400" />
          </div>
        </div>
      </HeroVideoScrub>

      {/* Régua de Estatísticas */}
      <StatsSection />

      {/* Vitrine de Destaques VIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-2">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Acervo Selecionado</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              Superesportivos em Destaque
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Modelos com laudo pericial 100% aprovado, disponíveis para entrega imediata em todo o país.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              icon={Sparkles}
              onClick={() => onNavigate('destaques')}
            >
              Ver Destaques VIP
            </Button>
            <Button
              variant="gold"
              size="md"
              icon={ArrowRight}
              onClick={() => onNavigate('estoque')}
            >
              Showroom Completo ({vehicles.length})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topVehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onSelect={onSelectVehicle}
            />
          ))}
        </div>
      </section>

      {/* Banners Duplos VIP (Financiamento Private & Troca) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Simulador */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#121008] via-[#090a10] to-[#090a10] border border-amber-500/30 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white">
                Simulador Private Banking
              </h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Simule planos de aquisição estruturada com as menores taxas do mercado, prazos de até 48 meses e aprovação ágil para pessoa física ou jurídica.
              </p>
            </div>
            <Button
              variant="gold"
              size="md"
              icon={ArrowRight}
              onClick={() => onNavigate('simulador')}
              className="w-full sm:w-auto self-start"
            >
              Simular Financiamento VIP
            </Button>
          </div>

          {/* Card Avaliação de Usado */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0c1410] via-[#090a10] to-[#090a10] border border-emerald-500/30 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white">
                Avaliação & Troca de Superesportivos
              </h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Deseja utilizar seu modelo premium como parte do pagamento? Avaliamos seu veículo com critérios justos e máxima valorização do seu patrimônio.
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              icon={ArrowRight}
              onClick={() => onNavigate('troca')}
              className="w-full sm:w-auto self-start border-emerald-500/40 text-emerald-300 hover:text-white"
            >
              Solicitar Avaliação Expressa
            </Button>
          </div>
        </div>
      </section>

      {/* Por que escolher a Apex */}
      <WhyUsSection />
    </div>
  );
}
