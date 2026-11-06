import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, CheckCircle2, MessageCircle, Calendar, 
  Gauge, Cog, Fuel, Award, ChevronLeft, ChevronRight, RotateCw, 
  Calculator, FileText, Bell, Heart, Scale 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Vehicle360Viewer } from './Vehicle360Viewer';
import { TcoCalculatorCard } from './TcoCalculatorCard';
import { formatCurrency, formatKm, calculateFipeDiff } from '../../utils/formatters';
import { buildVehicleWhatsappLink } from '../../utils/whatsapp';

export function VehicleDetailModal({ 
  vehicle, 
  onClose, 
  onOpenFinancing, 
  onOpenDossier, 
  onOpenPriceAlert,
  isFavorite,
  onToggleFavorite 
}) {
  const images = vehicle?.imagens && vehicle.imagens.length > 0 ? vehicle.imagens : [vehicle?.imagemPrincipal || ''];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('tco'); // 'tco' | '360' | 'galeria' | 'laudo' | 'ficha'

  useEffect(() => {
    if (vehicle) {
      setCurrentIndex(0);
      setActiveTab('tco');
    }
  }, [vehicle]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && activeTab === 'galeria') handleNextImage();
      if (e.key === 'ArrowLeft' && activeTab === 'galeria') handlePrevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, currentIndex, images.length, activeTab]);

  if (!vehicle) return null;

  const handleNextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const whatsappUrl = buildVehicleWhatsappLink(vehicle);
  const currentImage = images[currentIndex] || vehicle.imagemPrincipal;
  const fipe = calculateFipeDiff(vehicle.preco, vehicle.fipeReferencia);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30">
              Estoque Certificado
            </span>
            {fipe && fipe.isBelow && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {fipe.label}
              </span>
            )}
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">Cód. {vehicle.laudoCautelar?.codigoLaudo}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite && onToggleFavorite(vehicle.id)}
              className={`p-2 rounded-full border transition-colors ${
                isFavorite 
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-rose-400'
              }`}
              title="Favoritar veículo"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              title="Fechar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Topo: Nome, Ano e Preço */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">{vehicle.marca}</span>
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
              {vehicle.parcela && (
                <p className="text-xs text-emerald-400 mt-0.5 font-semibold">
                  ou entrada + 48x de {formatCurrency(vehicle.parcela.valor)}
                </p>
              )}
            </div>
          </div>

          {/* Abas de Mídia e Inteligência */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('tco')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'tco'
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calculadora TCO</span>
              </button>

              <button
                onClick={() => setActiveTab('360')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === '360'
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Giro 360°</span>
              </button>

              <button
                onClick={() => setActiveTab('galeria')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'galeria'
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>Galeria Expandida ({images.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('laudo')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'laudo'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Laudo Cautelar Digital</span>
              </button>
            </div>

            {/* Conteúdo da Aba Ativa */}
            {activeTab === 'tco' && (
              <TcoCalculatorCard vehicle={vehicle} />
            )}

            {activeTab === '360' && (
              <Vehicle360Viewer images={vehicle.imagens360} autoRotate={true} />
            )}

            {activeTab === 'galeria' && (
              <div className="space-y-3">
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
                  <img
                    src={currentImage}
                    alt={`${vehicle.nome} - Foto ${currentIndex + 1}`}
                    className="w-full h-full object-cover transition-all duration-300"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-xl opacity-80 group-hover:opacity-100 transition-all hover:scale-110"
                        title="Foto anterior"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-xl opacity-80 group-hover:opacity-100 transition-all hover:scale-110"
                        title="Próxima foto"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
                        Foto {currentIndex + 1} de {images.length}
                      </div>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative w-20 sm:w-24 h-14 sm:h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                          currentIndex === idx 
                            ? 'border-cyan-400 ring-2 ring-cyan-400/30 scale-105' 
                            : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'laudo' && (
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Inspeção Cautelar 100% Aprovada</h4>
                      <p className="text-xs text-emerald-400">{vehicle.laudoCautelar?.codigoLaudo} • Sem Sinistro/Leilão</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenDossier && onOpenDossier(vehicle)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/40"
                  >
                    Abrir Dossiê Oficial
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block">Estrutura & Longarinas</span>
                      <p className="text-slate-400">{vehicle.laudoCautelar?.estrutura}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block">Pintura & Monobloco</span>
                      <p className="text-slate-400">{vehicle.laudoCautelar?.pintura}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Opcionais e Ficha Técnica */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Principais Itens de Série</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {vehicle.opcionais?.map((op, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{op}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé Fixo do Modal */}
        <div className="p-4 sm:px-6 border-t border-slate-800 bg-slate-950/95 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onOpenPriceAlert && onOpenPriceAlert(vehicle)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Avise-me se o preço cair"
            >
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              <span>Alerta de Preço</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              icon={Calculator}
              onClick={() => {
                onClose();
                if (onOpenFinancing) onOpenFinancing(vehicle);
              }}
              className="flex-1 sm:flex-none"
            >
              Simulador
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={MessageCircle}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none"
            >
              Negociar no WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
