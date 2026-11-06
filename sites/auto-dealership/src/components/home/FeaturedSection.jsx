import React from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, MessageCircle, ArrowRight, Gauge, Cog, Fuel } from 'lucide-react';
import { Button } from '../ui/Button';
import { InspectionBadge } from '../vehicles/InspectionBadge';
import { formatCurrency, formatKm } from '../../utils/formatters';
import { buildVehicleWhatsappLink } from '../../utils/whatsapp';

export function FeaturedSection({ vehicle, onSelect }) {
  if (!vehicle) return null;

  const whatsappUrl = buildVehicleWhatsappLink(vehicle);

  return (
    <section id="destaques" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-700/80 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Coluna Visual (Imagem do Carro) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Destaque da Semana
              </span>
              <InspectionBadge text="Perícia Cautelar Aprovada" compact={true} />
            </div>

            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group cursor-pointer" onClick={() => onSelect(vehicle)}>
              <img
                src={vehicle.imagemPrincipal}
                alt={vehicle.nome}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs text-white">
                <span className="bg-slate-900/80 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10 font-semibold">
                  {vehicle.ano} • {formatKm(vehicle.km)}
                </span>
                <span className="bg-blue-600/90 px-3 py-1.5 rounded-lg backdrop-blur-md font-semibold">
                  Clique para ver ficha completa
                </span>
              </div>
            </div>
          </div>

          {/* Coluna de Informações e Chamadas */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Categoria {vehicle.categoria}
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mt-1">
                {vehicle.nome}
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">{vehicle.versao}</p>
            </div>

            {/* Checklist de Laudo Rápido */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Laudo Cautelar Digital: {vehicle.laudoCautelar?.status}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {vehicle.laudoCautelar?.estrutura}. {vehicle.laudoCautelar?.mecanica}.
              </p>
            </div>

            {/* Preço e Parcelas */}
            <div className="pt-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Preço Especial</span>
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-3xl sm:text-4xl font-black text-white">
                  {formatCurrency(vehicle.preco)}
                </span>
                {vehicle.parcela && (
                  <span className="text-xs text-blue-400 font-semibold">
                    ou entrada + 48x de {formatCurrency(vehicle.parcela.valor)}
                  </span>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="whatsapp"
                size="md"
                icon={MessageCircle}
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                Negociar no WhatsApp
              </Button>
              <Button
                variant="outline"
                size="md"
                icon={ArrowRight}
                onClick={() => onSelect(vehicle)}
                className="flex-1"
              >
                Ver Laudo Completo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
