import React from 'react';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { Sparkles, Crown, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function FeaturedPage({ vehicles, onNavigate, onSelectVehicle }) {
  const featured = vehicles.filter(v => v.destaque);

  return (
    <div className="pt-24 pb-20 space-y-10">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-amber-500/10 via-[#050508] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seleção da Semana • Pronta Entrega</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Acervo em Destaque VIP
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Veículos com condições de negociação exclusivas, revisões rigorosamente em dia e documentação liberada para transferência imediata.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(v => (
            <VehicleCard key={v.id} vehicle={v} onSelect={onSelectVehicle} />
          ))}
        </div>

        <div className="p-8 rounded-3xl bg-[#0a0b12] border border-amber-500/20 text-center space-y-4">
          <Crown className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="font-heading text-xl font-bold text-white">Não encontrou a configuração desejada?</h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Nossos consultores possuem acesso a coleções privadas e leilões internacionais exclusivos para localizar o supercarro dos seus sonhos.
          </p>
          <Button
            variant="gold"
            size="md"
            onClick={() => onNavigate('concierge')}
          >
            Ativar Serviço de Concierge
          </Button>
        </div>
      </div>
    </div>
  );
}
