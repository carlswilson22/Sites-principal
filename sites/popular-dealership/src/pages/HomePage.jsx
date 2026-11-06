import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { StatsSection } from '../components/home/StatsSection';
import { WhyUsSection } from '../components/home/WhyUsSection';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { Button } from '../components/ui/Button';
import { 
  Sparkles, ArrowRight, Calculator, ArrowLeftRight, 
  Bot, ShieldCheck, Heart, Scale, Flame 
} from 'lucide-react';

export function HomePage({ 
  vehicles, 
  onNavigate, 
  onSelectVehicle,
  isFavorite,
  onToggleFavorite,
  isComparing,
  onToggleCompare,
  onOpenPriceAlert
}) {
  const topVehicles = vehicles.filter(v => v.destaque).slice(0, 3);

  const handleHeroSearch = ({ term, category }) => {
    onNavigate('estoque', { term, category });
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero com Busca Rápida e Callout */}
      <HeroSection onSearch={handleHeroSearch} onNavigate={onNavigate} />

      {/* Régua de Estatísticas */}
      <StatsSection />

      {/* Vitrine de Destaques Rápidos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              <span>Seleção da Semana • Abaixo da FIPE</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              Oportunidades em Destaque
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Veículos com valorização de mercado, laudo cautelar aprovado e garantia total de 1 ano.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              icon={Sparkles}
              onClick={() => onNavigate('destaques')}
            >
              Ver Todas Ofertas
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              onClick={() => onNavigate('estoque')}
            >
              Ver Estoque Completo ({vehicles.length})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topVehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onSelect={onSelectVehicle}
              isFavorite={isFavorite ? isFavorite(vehicle.id) : false}
              onToggleFavorite={onToggleFavorite}
              isComparing={isComparing ? isComparing(vehicle.id) : false}
              onToggleCompare={onToggleCompare}
              onOpenPriceAlert={onOpenPriceAlert}
            />
          ))}
        </div>
      </section>

      {/* Banner de Destaque: Consultor com IA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-[#090d16] border border-violet-500/30 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <Bot className="w-4 h-4 text-violet-400" />
              <span>Inteligência Artificial Exclusiva</span>
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              Em Dúvida de Qual Carro Escolher? Pergunte à nossa IA
            </h3>
            <p className="text-sm text-slate-300 font-light leading-relaxed">
              Nosso consultor virtual compara o custo de manutenção (TCO), consumo na estrada e valor do seguro para te indicar o modelo ideal com base no seu orçamento.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              variant="ai"
              size="lg"
              icon={Bot}
              onClick={() => onNavigate('consultor-ia')}
              className="w-full sm:w-auto py-4"
            >
              Abrir Consultor de IA
            </Button>
          </div>
        </div>
      </section>

      {/* Banners Duplos de Ação Rápida (Financiamento & Troca com Troco) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/30 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white">
                Simulador de Financiamento
              </h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Calcule o valor das parcelas em tempo real com taxas especiais dos 10 principais bancos parceiros e receba aprovação em até 15 minutos.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              onClick={() => onNavigate('simulador')}
              className="w-full sm:w-auto self-start"
            >
              Simular Parcelas Agora
            </Button>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white">
                Troca com Troco no Pix
              </h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Quer dar seu carro atual como entrada? Avaliamos seu seminovo com valor justo e fazemos troca com troco caso sobre valor.
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

      {/* Por que escolher a DriveNow */}
      <WhyUsSection />
    </div>
  );
}
