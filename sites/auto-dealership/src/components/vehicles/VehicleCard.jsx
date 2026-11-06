import React, { useState } from 'react';
import { Calendar, Gauge, Fuel, Cog, MessageCircle, Eye, Sparkles } from 'lucide-react';
import { InspectionBadge } from './InspectionBadge';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatKm } from '../../utils/formatters';
import { buildVehicleWhatsappLink } from '../../utils/whatsapp';

export function VehicleCard({ vehicle, onSelect }) {
  const [imgSrc, setImgSrc] = useState(vehicle.imagemPrincipal);

  const whatsappUrl = buildVehicleWhatsappLink(vehicle);

  return (
    <div className="group rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-blue-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-950/20 flex flex-col overflow-hidden backdrop-blur-md">
      {/* Container de Imagem */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img
          src={imgSrc}
          alt={`${vehicle.nome} ${vehicle.versao}`}
          onError={() => setImgSrc('/images/placeholder-carro.jpg')}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Gradiente de sobreposição sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

        {/* Badge de Perícia Cautelar */}
        <div className="absolute top-3 left-3 z-10">
          <InspectionBadge text="Perícia Cautelar" compact={true} />
        </div>

        {/* Badge de Categoria ou Destaque */}
        <div className="absolute top-3 right-3 z-10 flex gap-1.5">
          {vehicle.destaque && (
            <Badge variant="amber" size="xs" icon={Sparkles}>
              Destaque
            </Badge>
          )}
          <Badge variant="default" size="xs" className="uppercase">
            {vehicle.categoria}
          </Badge>
        </div>

        {/* Ano e Km na base da imagem */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
          <span className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 font-medium">
            {vehicle.ano}
          </span>
          <span className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 font-medium">
            {formatKm(vehicle.km)}
          </span>
        </div>
      </div>

      {/* Corpo do Card */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Título & Versão */}
          <div className="mb-3">
            <h3 className="font-heading font-bold text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-1">
              {vehicle.nome}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1">
              {vehicle.versao}
            </p>
          </div>

          {/* Grid de Specs Rápidas */}
          <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 truncate">
              <Cog className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{vehicle.cambio}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Fuel className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{vehicle.combustivel}</span>
            </div>
          </div>
        </div>

        {/* Bloco de Preços & Ações */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block">
                Valor à Vista
              </span>
              <span className="font-heading text-xl font-extrabold text-white">
                {formatCurrency(vehicle.preco)}
              </span>
            </div>

            {vehicle.parcela && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">
                  Ou entrada +
                </span>
                <span className="text-xs font-semibold text-blue-400">
                  {vehicle.parcela.vezes}x de {formatCurrency(vehicle.parcela.valor)}
                </span>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              onClick={() => onSelect(vehicle)}
              className="w-full"
            >
              Ficha & Laudo
            </Button>
            <Button
              variant="whatsapp"
              size="sm"
              icon={MessageCircle}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
