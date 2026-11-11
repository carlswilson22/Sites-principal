import { VehicleAdServices } from '../../../../../packages/merchant-core/src/components/common/VehicleAdServices';
import { hasVehicle360 } from '../../../../../packages/merchant-core/src/utils/storeExperience';
import { dealershipInfo } from '../../data/dealershipInfo';
import { VehiclePhotoCredit } from '../../../../../packages/merchant-core/src/components/common/VehiclePhotoCredit';
import { getVehicleGallery, getVehicle360Images, galleryIndex } from '../../../../../packages/merchant-core/src/utils/vehicleGallery';
import { useDialog } from '../../../../../packages/merchant-core/src/components/common/useDialog';
import { VehicleImage } from '../../../../../packages/merchant-core/src/components/common/VehicleImage.jsx';
import React, { useState, useEffect, useRef } from 'react';
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

export function VehicleDetailModal({ vehicle, onClose, initialFinancing = false }) {
  const dialogRef = useDialog();
  const servicesRef = useRef(null);
  const images = getVehicleGallery(vehicle);
  const orbitalImages = hasVehicle360(dealershipInfo) ? getVehicle360Images(vehicle) : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageIndex = galleryIndex(currentIndex, images.length);

  useEffect(() => {
    setCurrentIndex(previous => galleryIndex(previous, images.length));
  }, [images.length]);
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
      if (e.key === 'Escape') { onClose(); return; }
      if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowRight' && mediaMode === 'photos') handleNextImage();
      if (e.key === 'ArrowLeft' && mediaMode === 'photos') handlePrevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, currentIndex, images.length, mediaMode]);

  if (!vehicle) return null;

  const handleNextImage = () => {
    setCurrentIndex(previous => images.length ? (galleryIndex(previous, images.length) + 1) % images.length : 0);
  };

  const handlePrevImage = () => {
    setCurrentIndex(previous => images.length ? (galleryIndex(previous, images.length) - 1 + images.length) % images.length : 0);
  };

  const whatsappUrl = buildVehicleWhatsappLink(vehicle);
  const currentImage = images[imageIndex] || '/images/placeholder-carro.jpg';


  return (
    <div data-vehicle-id={vehicle.id} ref={dialogRef} role="dialog" aria-modal="true" aria-label={vehicle.nome} tabIndex={-1} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
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
            {orbitalImages.length > 0 && <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <RotateCw className="w-3 h-3 text-blue-400" />
              Visão 360° Inclusa
            </span>}
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

          <div className="flex flex-wrap items-center gap-2">
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

            {hasVehicle360(dealershipInfo) && (<button
              data-feature="vehicle-360"
                onClick={() => setMediaMode('360')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                mediaMode === '360'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Visualizador 360° Orbital Interativo</span>
            </button>)}
          </div>

          {/* Exibição da Mídia */}
          {hasVehicle360(dealershipInfo) && mediaMode === '360' ? (
            <div className="space-y-2">
              {orbitalImages.length ? <Vehicle360Viewer images={orbitalImages} autoRotate={true} /> : <p role="status" className="p-8 rounded-2xl bg-slate-950/60 border border-slate-700 text-sm text-slate-300">Visualização 360° indisponível para este veículo. Consulte as fotos cadastradas na galeria.</p>}
              {orbitalImages.length > 0 && <p className="text-xs text-slate-400 text-center">
                Use o mouse ou o touch para arrastar e inspecionar o veículo em 360 graus.
              </p>}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
                <VehicleImage
                  src={currentImage}
                  alt={images.length ? `${vehicle.nome} - Foto ${imageIndex + 1}` : `Foto de ${vehicle.nome} indisponível`}
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
                  </>
                )}
                  <div role="status" aria-live="polite" className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs font-semibold text-white">
                    {images.length ? `Foto ${imageIndex + 1} de ${images.length}` : 'Sem fotos cadastradas'}
                  </div>

              </div>

              <VehiclePhotoCredit src={currentImage} />

              {/* Fila de Miniaturas (Thumbnails) */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5">
                  {images.map((img, idx) => (
                    <button
                      key={img}
                      aria-label={`Ver foto ${idx + 1} de ${images.length} de ${vehicle.nome}`}
                      aria-pressed={imageIndex === idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative w-20 sm:w-24 h-14 sm:h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        imageIndex === idx
                          ? 'border-blue-500 ring-2 ring-blue-500/30 scale-105 shadow-md shadow-blue-500/20' 
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <VehicleImage src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
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
          <VehicleAdServices ref={servicesRef} key={vehicle.id} vehicle={vehicle} dealership={dealershipInfo} storeKey="autoelite" initialFinancing={initialFinancing} />
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
            <Button variant="outline" size="md" icon={MessageCircle} onClick={() => servicesRef.current?.openChat()} className="flex-1 sm:flex-none">Tirar dúvidas</Button>

            <Button
              variant="whatsapp"
              size="md"
              icon={MessageCircle}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none"
            >
              Tenho interesse
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleDetailModal;
