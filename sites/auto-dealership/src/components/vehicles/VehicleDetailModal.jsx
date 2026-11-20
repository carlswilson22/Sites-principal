import { VehicleAdSections } from '../../../../../packages/merchant-core/src/components/common/VehicleAdSections';
import { VehicleAdFacts, VehicleTechnicalSheet, VehicleEquipmentList, VehicleInspectionDetails } from '../../../../../packages/merchant-core/src/components/common/VehicleAdInformation';
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
import React, { useState, useEffect, useMemo } from 'react';
import { X, ClipboardList, ShieldCheck, CheckCircle2, MessageCircle, ChevronLeft, ChevronRight, RotateCw, Camera } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { InspectionBadge } from './InspectionBadge';
import { Vehicle360Viewer } from './Vehicle360Viewer';
import { formatCurrency, formatKm } from '../../utils/formatters';
import { buildVehicleWhatsappLink } from '../../utils/whatsapp';

export function VehicleDetailModal({ vehicle, onClose, initialFinancing = false }) {
  const dialogRef = useDialog(onClose);
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
    <div data-vehicle-id={vehicle.id} ref={dialogRef} role="dialog" aria-modal="true" aria-label={vehicle.nome} tabIndex={-1} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 animate-fade-in font-sans">
      {/* Container do Modal */}
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh_-_1.5rem)] sm:max-h-[calc(100vh_-_3rem)] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-3 py-2 sm:px-4 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20 ">
          <div className="flex items-center gap-3">
            <InspectionBadge text="Laudo informado pela loja" compact={true} />
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
        <div data-vehicle-ad-scroll className="min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3">
          {/* Topo: Nome, Ano e Preço */}
          <div className="flex flex-col gap-2 pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-white">
                {vehicle.nome}
              </h2>
              <p className="text-sm text-slate-400">{vehicle.versao}</p>
            </div>

            <div className="text-left">
              <span className="text-xs text-slate-400 block">Preço à vista</span>
              <span className="font-heading text-xl sm:text-2xl font-black text-white">
                {formatCurrency(vehicle.preco)}
              </span>
              <p className="text-xs text-emerald-400 mt-0.5 font-medium">
                Pronta entrega no Showroom
              </p>
            </div>
          </div>

          {/* Galeria principal */}
          <div data-vehicle-gallery className="space-y-1.5">
            <div className="relative h-[clamp(11rem,34vh,22rem)] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
              {currentImage && <VehicleImage src={currentImage} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40" />}
              <VehicleImage
                src={currentImage}
                fetchPriority="high"
                alt={images.length ? `${vehicle.nome} - Foto ${imageIndex + 1}` : `Foto de ${vehicle.nome} indisponível`}
                className="relative w-full h-full object-contain"
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
            <VehicleThumbnails images={images} imageIndex={imageIndex} onSelect={setCurrentIndex} vehicleName={vehicle.nome} compact />
          </div>

          <VehicleAdFacts items={[
            ['Ano/modelo', vehicle.ano], ['Quilometragem', formatKm(vehicle.km)],
            ['Transmissão', vehicle.cambio], ['Combustível', vehicle.combustivel],
          ]} />

          <VehicleAdSections key={vehicle.id}>
            <VehicleAdServices key={vehicle.id} vehicle={vehicle} dealership={dealershipInfo} storeKey="autoelite" initialFinancing={initialFinancing} />
            <VehicleAdTools key={`tools-${vehicle.id}`} theme="blue" tools={[
              { id: 'ficha', label: 'Ficha Técnica Completa', icon: ClipboardList, content: <VehicleTechnicalSheet vehicle={vehicle} /> },
              { id: 'opcionais', label: 'Itens de Série & Opcionais', icon: CheckCircle2, content: <VehicleEquipmentList vehicle={vehicle} /> },
              { id: 'laudo', label: 'Laudo Pericial Cautelar', icon: ShieldCheck, content: <VehicleInspectionDetails vehicle={vehicle} /> },

              { id: 'galeria', label: `Fotos em Alta Definição (${images.length})`, icon: Camera, content: <VehicleExpandedGallery images={images} vehicleName={vehicle.nome} /> },
              ...(hasVehicle360(dealershipInfo) ? [{ id: '360', label: 'Giro 360°', icon: RotateCw, feature: 'vehicle-360', content: orbitalImages.length ? <Vehicle360Viewer images={orbitalImages} autoRotate={true} /> : <p role="status" className="p-3 text-sm text-slate-300">Visualização 360° indisponível para este veículo. Consulte as fotos cadastradas na galeria.</p> }] : []),
            ]} />

          </VehicleAdSections>
        </div>

        {/* Preço e contato sempre acessíveis */}
        <div data-ad-contact className="shrink-0 border-t border-slate-700 bg-slate-950 px-3 py-2 sm:px-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-base font-bold tabular-nums text-white">{formatCurrency(vehicle.preco)}</span>
            <Button
              variant="whatsapp"
              size="md"
              icon={MessageCircle}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              Tenho interesse
            </Button>
        </div>
      </div>
    </div>
  );
}

export default VehicleDetailModal;
