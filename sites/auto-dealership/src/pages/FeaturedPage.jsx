import React from 'react';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { Sparkles, Award, ShieldCheck, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { buildGeneralWhatsappLink } from '../utils/whatsapp';

export function FeaturedPage({ vehicles, onSelectVehicle, onNavigate }) {
  const featuredVehicles = vehicles.filter(v => v.destaque);
  const mainFeatured = featuredVehicles[0] || vehicles[0];
  const secondaryFeatured = featuredVehicles.slice(1);

  return (
    <div className="pt-24 pb-20 space-y-12">
      {/* Page Header */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-amber-950/20 via-slate-950 to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seleção VIP da Semana</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Veículos em Destaque
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Modelos de alta procura, com histórico de único dono, menor quilometragem e laudo cautelar 100% aprovado sem qualquer apontamento.
          </p>
        </div>
      </div>

      {/* Veículo Principal em Destaque */}
      <FeaturedSection vehicle={mainFeatured} onSelect={onSelectVehicle} />

      {/* Outros Destaques da Seleção */}
      {secondaryFeatured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">
                Mais Opções da Seleção Especial
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Veículos revisados e prontos para entrega imediata.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('estoque')}
            >
              Ver Todo o Estoque
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {secondaryFeatured.map(vehicle => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onSelect={onSelectVehicle}
              />
            ))}
          </div>
        </section>
      )}

      {/* Banner de Atendimento VIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-center md:justify-start text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantia de Satisfação e Procedência</span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
              Não encontrou o modelo específico que procura?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Nossa equipe de compras localiza o veículo dos seus sonhos com laudo pericial completo em até 48 horas.
            </p>
          </div>

          <Button
            variant="whatsapp"
            size="md"
            icon={MessageCircle}
            href={buildGeneralWhatsappLink('Olá! Procuro um modelo específico de carro e gostaria do suporte dos consultores da AutoElite.')}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            Falar com Consultor VIP
          </Button>
        </div>
      </section>
    </div>
  );
}
