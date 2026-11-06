import React from 'react';
import { Shield, Sparkles, KeyRound, Zap, RotateCw, ArrowRight, MessageCircle } from 'lucide-react';
import { formatCurrency, formatKm } from '../../utils/formatters';
import { buildVehicleWhatsappLink } from '../../utils/whatsapp';

export function VehicleCard({ vehicle, onSelect }) {
  const whatsappUrl = buildVehicleWhatsappLink(vehicle);

  return (
    <div className="group rounded-3xl bg-[#0c0d14]/90 border border-white/10 hover:border-amber-500/40 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-950/20">
      {/* Imagem com Overlay */}
      <div className="relative aspect-[16/10] overflow-hidden bg-black cursor-pointer" onClick={() => onSelect(vehicle)}>
        <img
          src={vehicle.imagemPrincipal}
          alt={vehicle.nome}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradiente Inferior para Contraste */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d14] via-transparent to-black/30 pointer-events-none" />

        {/* Badges Flutuantes */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-amber-400 border border-amber-500/30 shadow-md">
            {vehicle.tag || vehicle.categoria}
          </span>

          <div className="flex items-center gap-1.5">
            {vehicle.blindado && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                Nível III-A
              </span>
            )}
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-black/70 backdrop-blur-md text-slate-300 border border-white/10 flex items-center gap-1" title="Disponível em 360°">
              <RotateCw className="w-3 h-3 text-amber-400" />
              360°
            </span>
          </div>
        </div>

        {/* Ano / KM na base da foto */}
        <div className="absolute bottom-3 inset-x-4 flex justify-between items-center text-xs text-slate-300">
          <span className="font-mono bg-black/70 px-2 py-0.5 rounded border border-white/10">{vehicle.ano}</span>
          <span className="bg-black/70 px-2 py-0.5 rounded border border-white/10">{formatKm(vehicle.km)}</span>
        </div>
      </div>

      {/* Detalhes do Veículo */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-amber-400/90 uppercase tracking-widest font-semibold mb-1">
            <span>{vehicle.marca}</span>
            <span className="text-slate-600">•</span>
            <span>{vehicle.categoria}</span>
          </div>

          <h3 
            onClick={() => onSelect(vehicle)}
            className="font-heading text-xl font-bold text-white group-hover:text-amber-300 transition-colors cursor-pointer line-clamp-1"
          >
            {vehicle.nome}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{vehicle.versao}</p>

          {/* Specs Técnicas Rápidas */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{vehicle.potencia}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{vehicle.aceleracao || vehicle.cambio}</span>
            </div>
          </div>
        </div>

        {/* Preço e Botões */}
        <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Valor Especial</span>
            <span className="font-heading text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
              {formatCurrency(vehicle.preco)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelect(vehicle)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 hover:border-amber-500/40"
            >
              <span>Ver 360° & Laudo</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-black" />
              <span>Atendimento VIP</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
