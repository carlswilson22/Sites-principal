import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, CheckCircle2, MessageCircle, Calendar, 
  Gauge, Cog, Fuel, Award, ChevronLeft, ChevronRight, Share2, Mail,
  RotateCw, Camera
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { InspectionBadge } from './InspectionBadge';
import { Vehicle360Viewer } from './Vehicle360Viewer';
import { formatCurrency, formatKm } from '../../utils/formatters';
import { buildVehicleWhatsappLink } from '../../utils/whatsapp';

export function VehicleDetailModal({ vehicle, onClose, onContact }) {
  const images = vehicle?.imagens && vehicle.imagens.length > 0 ? vehicle.imagens : [vehicle?.imagemPrincipal || ''];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('laudo'); // 'laudo' | 'ficha' | 'opcionais'
  const [mediaMode, setMediaMode] = useState('photos'); // 'photos' | '360'

  useEffect(() => {
    if (vehicle) {
      setCurrentIndex(0);
      setActiveTab('laudo');
      setMediaMode('photos');
    }
  }, [vehicle]);

  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && mediaMode === 'photos') handleNextImage();
      if (e.key === 'ArrowLeft' && mediaMode === 'photos') handlePrevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, currentIndex, images.length, mediaMode]);

  if (!vehicle) return null;

  const handleNextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const whatsappUrl = buildVehicleWhatsappLink(vehicle);
  const currentImage = images[currentIndex] || vehicle.imagemPrincipal;

  // Imagens orbitais para o 360°
  const orbitalFolderCode = `sc-00${vehicle.id <= 5 ? vehicle.id : 1}`;
  const orbitalImages = [0, 45, 90, 135, 180, 225, 270, 315].map(deg => `images/cars/${orbitalFolderCode}/${deg}.jpg`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
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
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <RotateCw className="w-3 h-3 text-blue-400" />
              Visão 360° Inclusa
            </span>
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

          {/* Seletor de Modo: Fotos HD ou 360° Orbital */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMediaMode('photos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                mediaMode === 'photos'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Fotos em Alta Definição ({images.length})</span>
            </button>

            <button
              onClick={() => setMediaMode('360')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                mediaMode === '360'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Visualizador 360° Orbital Interativo</span>
            </button>
          </div>

          {/* Exibição da Mídia */}
          {mediaMode === '360' ? (
            <div className="space-y-2">
              <Vehicle360Viewer images={orbitalImages} autoRotate={true} />
              <p className="text-xs text-slate-400 text-center">
                Use o mouse ou o touch para arrastar e inspecionar o veículo em 360 graus.
              </p>
            </div>
          ) : (
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
          )}

          {/* Grid de Especificações Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Ano/Modelo</span>
                <span className="text-xs font-semibold text-white">{vehicle.ano}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Gauge className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Quilometragem</span>
                <span className="text-xs font-semibold text-white">{formatKm(vehicle.km)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Cog className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Transmissão</span>
                <span className="text-xs font-semibold text-white">{vehicle.cambio}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Fuel className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Combustível</span>
                <span className="text-xs font-semibold text-white">{vehicle.combustivel}</span>
              </div>
            </div>
          </div>

          {/* Abas de Detalhamento: Laudo / Opcionais / Ficha Técnica */}
          <div className="space-y-4">
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setActiveTab('laudo')}
                className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                  activeTab === 'laudo'
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Laudo Pericial Cautelar
                {activeTab === 'laudo' && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('opcionais')}
                className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                  activeTab === 'opcionais'
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Itens de Série & Opcionais
                {activeTab === 'opcionais' && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('ficha')}
                className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                  activeTab === 'ficha'
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Ficha Técnica Completa
                {activeTab === 'ficha' && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            </div>

            {/* Conteúdo da Aba Ativa */}
            <div className="pt-2">
              {/* Aba: Laudo Cautelar */}
              {activeTab === 'laudo' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-emerald-400">Status da Perícia: {vehicle.laudoCautelar?.status}</p>
                      <p className="text-slate-300 mt-1 leading-relaxed">
                        Veículo submetido a inspeção técnica veicular minuciosa com verificação estrutural, análise micrométrica de espessura de pintura, histórico documental e consulta completa em bases de leilão e sinistro.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 block text-[10px]">Estrutura & Chassi</span>
                        <span className="text-white font-medium">{vehicle.laudoCautelar?.estrutura}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 block text-[10px]">Pintura & Funilaria</span>
                        <span className="text-white font-medium">{vehicle.laudoCautelar?.pintura}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 block text-[10px]">Mecânica & Transmissão</span>
                        <span className="text-white font-medium">{vehicle.laudoCautelar?.mecanica}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 block text-[10px]">Histórico de Sinistro / Leilão</span>
                        <span className="text-white font-medium">{vehicle.laudoCautelar?.sinistroLeilao}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba: Opcionais */}
              {activeTab === 'opcionais' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {vehicle.opcionais && vehicle.opcionais.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-slate-200">{opt}</span>
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

export default VehicleDetailModal;
