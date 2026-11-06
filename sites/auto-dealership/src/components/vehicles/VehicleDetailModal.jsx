import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, CheckCircle2, MessageCircle, Calendar, 
  Gauge, Cog, Fuel, Award, ChevronLeft, ChevronRight, Share2, Mail 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { InspectionBadge } from './InspectionBadge';
import { formatCurrency, formatKm } from '../../utils/formatters';
import { buildVehicleWhatsappLink } from '../../utils/whatsapp';

export function VehicleDetailModal({ vehicle, onClose, onContact }) {
  const images = vehicle?.imagens && vehicle.imagens.length > 0 ? vehicle.imagens : [vehicle?.imagemPrincipal || ''];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('laudo'); // 'laudo' | 'ficha' | 'opcionais'

  useEffect(() => {
    if (vehicle) {
      setCurrentIndex(0);
      setActiveTab('laudo');
    }
  }, [vehicle]);

  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'ArrowLeft') handlePrevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, currentIndex, images.length]);

  if (!vehicle) return null;

  const handleNextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const whatsappUrl = buildVehicleWhatsappLink(vehicle);
  const currentImage = images[currentIndex] || vehicle.imagemPrincipal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Container do Modal */}
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-5 sm:px-8 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <InspectionBadge text="Perícia Cautelar Certificada" compact={true} />
            <Badge variant="blue" size="xs">Cód. {vehicle.laudoCautelar?.codigoLaudo || 'AMT-AUTO'}</Badge>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* Topo: Nome, Ano e Preço */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">{vehicle.categoria}</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">{vehicle.ano}</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                {vehicle.nome}
              </h2>
              <p className="text-sm text-slate-400">{vehicle.versao}</p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-slate-400 block">Preço à vista</span>
              <span className="font-heading text-2xl sm:text-3xl font-black text-white">
                {formatCurrency(vehicle.preco)}
              </span>
              <p className="text-xs text-emerald-400 mt-0.5 font-medium">
                Pronta entrega no Showroom
              </p>
            </div>
          </div>

          {/* Galeria Expandida de Fotos */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
              <img
                src={currentImage}
                alt={`${vehicle.nome} - Foto ${currentIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Controles de Navegação Anterior / Próxima */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm border border-slate-700/60 shadow-lg opacity-80 group-hover:opacity-100 transition-all hover:scale-110"
                    title="Foto anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm border border-slate-700/60 shadow-lg opacity-80 group-hover:opacity-100 transition-all hover:scale-110"
                    title="Próxima foto"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Contador de Fotos */}
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs font-semibold text-white">
                    Foto {currentIndex + 1} de {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Fila de Miniaturas (Thumbnails) */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-20 sm:w-24 h-14 sm:h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      currentIndex === idx 
                        ? 'border-blue-500 ring-2 ring-blue-500/30 scale-105 shadow-md shadow-blue-500/20' 
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid de Especificações Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-950/80 flex items-center justify-center text-blue-400 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Ano</span>
                <p className="text-xs font-semibold text-white">{vehicle.ano}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-950/80 flex items-center justify-center text-blue-400 shrink-0">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Quilometragem</span>
                <p className="text-xs font-semibold text-white">{formatKm(vehicle.km)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-950/80 flex items-center justify-center text-blue-400 shrink-0">
                <Cog className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Câmbio</span>
                <p className="text-xs font-semibold text-white truncate">{vehicle.cambio}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-950/80 flex items-center justify-center text-blue-400 shrink-0">
                <Fuel className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Combustível</span>
                <p className="text-xs font-semibold text-white">{vehicle.combustivel}</p>
              </div>
            </div>
          </div>

          {/* Navegação por Abas */}
          <div>
            <div className="flex gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('laudo')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'laudo' 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Laudo Pericial Cautelar
              </button>

              <button
                onClick={() => setActiveTab('opcionais')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'opcionais' 
                    ? 'bg-blue-950 text-blue-300 border border-blue-500/40 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Opcionais & Itens
              </button>

              <button
                onClick={() => setActiveTab('ficha')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'ficha' 
                    ? 'bg-blue-950 text-blue-300 border border-blue-500/40 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Ficha Técnica
              </button>
            </div>

            {/* Conteúdo das Abas */}
            <div className="pt-4">
              {/* Aba: Laudo Pericial Cautelar */}
              {activeTab === 'laudo' && (
                <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Inspeção Cautelar Digital Certificada</h4>
                        <p className="text-xs text-emerald-400">Laudo {vehicle.laudoCautelar?.codigoLaudo} • {vehicle.laudoCautelar?.status}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-semibold border border-emerald-500/30">
                      100% Aprovado
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white block">Estrutura & Monobloco</span>
                        <p className="text-slate-400">{vehicle.laudoCautelar?.estrutura || 'Longarinas e painéis íntegros'}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white block">Pintura & Lataria</span>
                        <p className="text-slate-400">{vehicle.laudoCautelar?.pintura || 'Original com espessura padrão'}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white block">Mecânica & Transmissão</span>
                        <p className="text-slate-400">{vehicle.laudoCautelar?.mecanica || 'Sistemas revisados e aprovados'}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white block">Histórico & Procedência</span>
                        <p className="text-slate-400">{vehicle.laudoCautelar?.sinistroLeilao || 'Nada Consta de sinistro ou leilão'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba: Opcionais */}
              {activeTab === 'opcionais' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {vehicle.opcionais?.map((opcional, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{opcional}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Aba: Ficha Técnica */}
              {activeTab === 'ficha' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {vehicle.fichaTecnica && Object.entries(vehicle.fichaTecnica).map(([chave, valor], idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                      <span className="text-slate-400 capitalize">{chave.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-semibold text-white">{valor}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-slate-400">Motor</span>
                    <span className="font-semibold text-white">{vehicle.motor}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-slate-400">Potência</span>
                    <span className="font-semibold text-white">{vehicle.potencia}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé Fixo do Modal com CTAs */}
        <div className="p-4 sm:px-8 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
          <div className="hidden sm:block">
            <p className="text-xs text-slate-400">Atendimento imediato via WhatsApp da loja</p>
            <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Consultor de plantão online
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onContact && (
              <Button
                variant="outline"
                size="md"
                icon={Mail}
                onClick={() => {
                  onClose();
                  onContact(vehicle);
                }}
                className="flex-1 sm:flex-none"
              >
                Formulário de Contato
              </Button>
            )}

            <Button
              variant="whatsapp"
              size="md"
              icon={MessageCircle}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none"
            >
              Tenho Interesse no WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
