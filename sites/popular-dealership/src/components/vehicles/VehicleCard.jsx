import React from 'react';
import { Heart, Scale, ShieldCheck, Zap, ArrowRight, MessageCircle, RotateCw, Bell } from 'lucide-react';
import { formatCurrency, formatKm, calculateFipeDiff } from '../../utils/formatters';
import { buildVehicleWhatsappLink } from '../../utils/whatsapp';

export function VehicleCard({ 
  vehicle, 
  onSelect, 
  isFavorite, 
  onToggleFavorite, 
  isComparing, 
  onToggleCompare,
  onOpenPriceAlert
}) {
  const whatsappUrl = buildVehicleWhatsappLink(vehicle);
  const fipe = calculateFipeDiff(vehicle.preco, vehicle.fipeReferencia);

  return (
    <div className="group rounded-3xl bg-[#090d16] border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-cyan-950/20 relative">
      {/* Imagem com Overlay */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950 cursor-pointer" onClick={() => onSelect(vehicle)}>
        <img
          src={vehicle.imagemPrincipal}
          alt={vehicle.nome}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-black/30 pointer-events-none" />

        {/* Badges Superiores */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {fipe && fipe.isBelow ? (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/90 text-black shadow-md">
                {fipe.label}
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-cyan-400 border border-cyan-500/30">
                {vehicle.tag || vehicle.categoria}
              </span>
            )}
          </div>

          {/* Botões de Ação Rápida no Card: Favorito e Comparar */}
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onToggleCompare && onToggleCompare(vehicle.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                isComparing
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                  : 'bg-black/60 text-slate-300 hover:text-white border border-white/10'
              }`}
              title={isComparing ? 'Remover da comparação' : 'Comparar este veículo'}
            >
              <Scale className="w-4 h-4" />
            </button>

            <button
              onClick={() => onToggleFavorite && onToggleFavorite(vehicle.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                isFavorite
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'bg-black/60 text-slate-300 hover:text-rose-400 border border-white/10'
              }`}
              title={isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Rodapé da Foto com Ano e KM */}
        <div className="absolute bottom-3 inset-x-4 flex justify-between items-center text-xs text-slate-300">
          <span className="font-mono bg-black/70 px-2 py-0.5 rounded border border-slate-800">{vehicle.ano}</span>
          <span className="bg-black/70 px-2 py-0.5 rounded border border-slate-800">{formatKm(vehicle.km)}</span>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-cyan-400 uppercase tracking-wider font-semibold">{vehicle.marca}</span>
            <span className="text-slate-500 text-[11px]">{vehicle.cambio}</span>
          </div>

          <h3 
            onClick={() => onSelect(vehicle)}
            className="font-heading text-lg font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer line-clamp-1"
          >
            {vehicle.nome}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{vehicle.versao}</p>

          {/* Destaques Rápidos: Consumo e TCO */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{vehicle.potencia}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>1 Ano Garantia</span>
            </div>
          </div>
        </div>

        {/* Preço e Botões */}
        <div className="pt-3 border-t border-slate-800 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <div>
              {vehicle.precoOriginal && (
                <span className="text-[11px] text-slate-500 line-through mr-1.5">
                  {formatCurrency(vehicle.precoOriginal)}
                </span>
              )}
              <span className="font-heading text-2xl font-black text-white">
                {formatCurrency(vehicle.preco)}
              </span>
            </div>
            {vehicle.parcela && (
              <span className="text-xs text-emerald-400 font-bold">
                48x {formatCurrency(vehicle.parcela.valor)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelect(vehicle)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 hover:border-cyan-500/40"
            >
              <span>Detalhes & TCO</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-black" />
              <span>Negociar</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
