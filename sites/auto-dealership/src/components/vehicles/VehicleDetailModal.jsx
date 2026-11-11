import { VehicleAdTools } from '../../../../../packages/merchant-core/src/components/common/VehicleAdTools';
import { VehicleExpandedGallery } from '../../../../../packages/merchant-core/src/components/common/VehicleExpandedGallery';
import { VehicleThumbnails } from '../../../../../packages/merchant-core/src/components/common/VehicleThumbnails';
import { VehicleAdServices } from '../../../../../packages/merchant-core/src/components/common/VehicleAdServices';
import { hasVehicle360 } from '../../../../../packages/merchant-core/src/utils/storeExperience';
import { dealershipInfo } from '../../data/dealershipInfo';
import { VehiclePhotoCredit } from '../../../../../packages/merchant-core/src/components/common/VehiclePhotoCredit';
import { getVehicleGallery, getVehicle360Images, galleryIndex } from '../../../../../packages/merchant-core/src/utils/vehicleGallery';
import { useDialog } from '../../../../../packages/merchant-core/src/components/common/useDialog';
import { isTopDialog } from '../../../../../packages/merchant-core/src/utils/dialogActivity';
import { VehicleImage } from '../../../../../packages/merchant-core/src/components/common/VehicleImage.jsx';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X, ShieldCheck, CheckCircle2, MessageCircle, Calendar,
  Gauge, Cog, Fuel, ChevronLeft, ChevronRight,
  RotateCw, Camera
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { InspectionBadge } from './InspectionBadge';
import { Vehicle360Viewer } from './Vehicle360Viewer';
import { formatCurrency, formatKm } from '../../utils/formatters';
import { buildVehicleWhatsappLink } from '../../utils/whatsapp';

export function VehicleDetailModal({ vehicle, onClose, initialFinancing = false }) {
  const dialogRef = useDialog(onClose);
  const servicesRef = useRef(null);
  const images = useMemo(() => getVehicleGallery(vehicle), [vehicle]);
  const orbitalImages = useMemo(() => hasVehicle360(dealershipInfo) ? getVehicle360Images(vehicle) : [], [vehicle]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageIndex = galleryIndex(currentIndex, images.length);

  useEffect(() => {
    setCurrentIndex(previous => galleryIndex(previous, images.length));
  }, [images.length]);

  useEffect(() => {
    if (vehicle) {
      setCurrentIndex(0);
    }
  }, [vehicle]);

  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isTopDialog(dialogRef.current)) return;
      if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable], [data-vehicle-tools]')) return;
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'ArrowLeft') handlePrevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, currentIndex, images.length]);

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
    <div data-vehicle-id={vehicle.id} ref={dialogRef} role="dialog" aria-modal="true" aria-label={vehicle.nome} tabIndex={-1} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 animate-fade-in font-sans">
      {/* Container do Modal */}
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-5 sm:px-8 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20 ">
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

          {/* Galeria principal */}
          <div data-vehicle-gallery className="space-y-3">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
              <VehicleImage
                src={currentImage}
                fetchPriority="high"
                alt={images.length ? `${vehicle.nome} - Foto ${imageIndex + 1}` : `Foto de ${vehicle.nome} indisponível`}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Controles de Navegação Anterior / Próxima */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white flex items-center justify-center border border-slate-700/60 shadow-lg opacity-80 group-hover:opacity-100 transition-all hover:scale-110"
                    title="Foto anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white flex items-center justify-center border border-slate-700/60 shadow-lg opacity-80 group-hover:opacity-100 transition-all hover:scale-110"
                    title="Próxima foto"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
                <div role="status" aria-live="polite" className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white">
                  {images.length ? `Foto ${imageIndex + 1} de ${images.length}` : 'Sem fotos cadastradas'}
                </div>

            </div>

            <VehiclePhotoCredit src={currentImage} />

            {/* Fila de Miniaturas (Thumbnails) */}
            <VehicleThumbnails images={images} imageIndex={imageIndex} onSelect={setCurrentIndex} vehicleName={vehicle.nome} />
          </div>

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

          <VehicleAdServices ref={servicesRef} key={vehicle.id} vehicle={vehicle} dealership={dealershipInfo} storeKey="autoelite" initialFinancing={initialFinancing} />
          <VehicleAdTools key={`tools-${vehicle.id}`} theme="blue" tools={[
            { id: 'galeria', label: `Fotos em Alta Definição (${images.length})`, icon: Camera, content: <VehicleExpandedGallery images={images} vehicleName={vehicle.nome} /> },
            ...(hasVehicle360(dealershipInfo) ? [{ id: '360', label: 'Giro 360°', icon: RotateCw, feature: 'vehicle-360', content: orbitalImages.length ? <Vehicle360Viewer images={orbitalImages} autoRotate={true} /> : <p role="status" className="p-5 rounded-2xl border border-slate-700 text-sm text-slate-300">Visualização 360° indisponível para este veículo. Consulte as fotos cadastradas na galeria.</p> }] : []),
            { id: 'laudo', label: 'Laudo Pericial Cautelar', icon: ShieldCheck, content: (
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
            ) },
            { id: 'opcionais', label: 'Itens de Série & Opcionais', icon: CheckCircle2, content: (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {vehicle.opcionais && vehicle.opcionais.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-slate-200">{opt}</span>
                    </div>
                  ))}
                </div>
            ) },
            { id: 'ficha', label: 'Ficha Técnica Completa', icon: Cog, content: (
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
            ) }
          ]} />
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
