import React, { useState, useEffect } from 'react';
import { 
  X, Shield, CheckCircle2, MessageCircle, Calendar, 
  Gauge, Zap, Fuel, Award, ChevronLeft, ChevronRight, RotateCw, Calculator, KeyRound 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Vehicle360Viewer } from './Vehicle360Viewer';
import { formatCurrency, formatKm } from '../../utils/formatters';
import { buildVehicleWhatsappLink } from '../../utils/whatsapp';

export function VehicleDetailModal({ vehicle, onClose, onOpenFinancing }) {
  const images = vehicle?.imagens && vehicle.imagens.length > 0 ? vehicle.imagens : [vehicle?.imagemPrincipal || ''];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('360'); // '360' | 'galeria' | 'laudo' | 'ficha'

  useEffect(() => {
    if (vehicle) {
      setCurrentIndex(0);
      setActiveTab('360');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-[#090a10] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-5 sm:px-8 border-b border-white/10 bg-black/60 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Badge variant="gold" size="sm">
              Acervo Apex Exotics
            </Badge>
            {vehicle.blindado && (
              <Badge variant="emerald" size="xs">Blindado Nível III-A</Badge>
            )}
            <span className="text-xs text-slate-400 font-mono">Cód. {vehicle.laudoCautelar?.codigoLaudo || 'APX-VIP'}</span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/10"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* Topo: Nome, Ano e Preço */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">{vehicle.marca}</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">{vehicle.ano}</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">
                {vehicle.nome}
              </h2>
              <p className="text-sm text-slate-400">{vehicle.versao}</p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-slate-400 block uppercase tracking-wider">Valor do Investimento</span>
              <span className="font-heading text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
                {formatCurrency(vehicle.preco)}
              </span>
              {vehicle.parcela && (
                <p className="text-xs text-amber-300/80 mt-0.5">
                  ou entrada VIP + 48x de {formatCurrency(vehicle.parcela.valor)}
                </p>
              )}
            </div>
          </div>

          {/* Abas Superiores de Mídia: 360° vs. Galeria Expandida */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('360')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === '360'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <RotateCw className="w-4 h-4" />
                <span>Experiência 360° Interativa</span>
              </button>

              <button
                onClick={() => setActiveTab('galeria')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'galeria'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <span>Galeria Expandida ({images.length})</span>
              </button>
            </div>

            {/* Visualizador 360° */}
            {activeTab === '360' && (
              <Vehicle360Viewer images={vehicle.imagens360} autoRotate={true} />
            )}

            {/* Galeria Expandida com Miniaturas */}
            {activeTab === 'galeria' && (
              <div className="space-y-3">
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-black border border-white/10 group">
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
                  <div className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative w-20 sm:w-24 h-14 sm:h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                          currentIndex === idx 
                            ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105 shadow-md shadow-amber-500/20' 
                            : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grid de Especificações Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Potência</span>
                <p className="text-xs font-bold text-white">{vehicle.potencia}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Quilometragem</span>
                <p className="text-xs font-bold text-white">{formatKm(vehicle.km)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">0 a 100 km/h</span>
                <p className="text-xs font-bold text-white">{vehicle.aceleracao}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Proteção</span>
                <p className="text-xs font-bold text-white">{vehicle.blindado ? 'Blindado III-A' : 'Original Íntegro'}</p>
              </div>
            </div>
          </div>

          {/* Abas Secundárias: Laudo & Itens Exclusivos */}
          <div className="space-y-4 pt-2">
            <div className="p-5 rounded-2xl bg-amber-500/[0.03] border border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Certificação de Procedência & Laudo Cautelar</h4>
                    <p className="text-xs text-amber-400">{vehicle.laudoCautelar?.perito} • {vehicle.laudoCautelar?.status}</p>
                  </div>
                </div>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full font-bold border border-amber-500/30">
                  Aprovado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Estrutura e Chassi</span>
                    <p className="text-slate-400">{vehicle.laudoCautelar?.estrutura}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Acabamento & Pintura</span>
                    <p className="text-slate-400">{vehicle.laudoCautelar?.pintura}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Opcionais de Fábrica */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Equipamentos & Opcionais Exclusivos</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {vehicle.opcionais?.map((op, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{op}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Fixo do Modal com CTAs */}
        <div className="p-4 sm:px-8 border-t border-white/10 bg-black/90 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
          <div className="hidden sm:block">
            <p className="text-xs text-slate-400">Atendimento privativo sob demanda</p>
            <p className="text-xs font-semibold text-amber-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Consultor Concierge VIP disponível
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onOpenFinancing && (
              <Button
                variant="outline"
                size="md"
                icon={Calculator}
                onClick={() => {
                  onClose();
                  onOpenFinancing(vehicle);
                }}
                className="flex-1 sm:flex-none"
              >
                Simular Financiamento
              </Button>
            )}

            <Button
              variant="gold"
              size="md"
              icon={MessageCircle}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none"
            >
              Agendar Atendimento VIP
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
