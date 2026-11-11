import { VehicleAdTools } from '../../../../../packages/merchant-core/src/components/common/VehicleAdTools';
import { VehicleExpandedGallery } from '../../../../../packages/merchant-core/src/components/common/VehicleExpandedGallery';
import { VehicleThumbnails } from '../../../../../packages/merchant-core/src/components/common/VehicleThumbnails';
import { VehicleAdServices } from '../../../../../packages/merchant-core/src/components/common/VehicleAdServices';
import { hasVehicle360 } from '../../../../../packages/merchant-core/src/utils/storeExperience';
import { dealershipInfo } from '../../data/dealershipInfo';
import { getVehicleGallery, getVehicle360Images, galleryIndex } from '../../../../../packages/merchant-core/src/utils/vehicleGallery';
import { VehiclePhotoCredit } from '../../../../../packages/merchant-core/src/components/common/VehiclePhotoCredit';
import { useDialog } from '../../../../../packages/merchant-core/src/components/common/useDialog';
import { isTopDialog } from '../../../../../packages/merchant-core/src/utils/dialogActivity';
import { VehicleImage } from '../../../../../packages/merchant-core/src/components/common/VehicleImage.jsx';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X, ShieldCheck, CheckCircle2, MessageCircle,
  Award, ChevronLeft, ChevronRight, RotateCw,
  Calculator, Bell, Heart, Camera
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Vehicle360Viewer } from './Vehicle360Viewer';
import { TcoCalculatorCard } from './TcoCalculatorCard';
import { formatCurrency, calculateFipeDiff } from '../../utils/formatters';
import { buildVehicleWhatsappLink } from '../../utils/whatsapp';

export function VehicleDetailModal({ 
  vehicle, 
  onClose, 
  initialFinancing = false,
  onOpenDossier, 
  onOpenPriceAlert,
  isFavorite,
  onToggleFavorite 
}) {
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
  const fipe = calculateFipeDiff(vehicle.preco, vehicle.fipeReferencia);

  return (
    <div data-vehicle-id={vehicle.id} ref={dialogRef} role="dialog" aria-modal="true" aria-label={vehicle.nome} tabIndex={-1} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 ">
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

          {/* Galeria principal */}
          <div data-vehicle-gallery className="space-y-3">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
              <VehicleImage
                src={currentImage}
              fetchPriority="high"
                alt={images.length ? `${vehicle.nome} - Foto ${imageIndex + 1}` : `Foto de ${vehicle.nome} indisponível`}
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
                </>
              )}
              <div role="status" aria-live="polite" className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/80 border border-white/10 text-xs font-semibold text-white">
                {images.length ? `Foto ${imageIndex + 1} de ${images.length}` : 'Sem fotos cadastradas'}
              </div>

            </div>

            <VehiclePhotoCredit src={currentImage} />
            <VehicleThumbnails images={images} imageIndex={imageIndex} onSelect={setCurrentIndex} vehicleName={vehicle.nome} />
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
          <VehicleAdServices ref={servicesRef} key={vehicle.id} vehicle={vehicle} dealership={dealershipInfo} storeKey="apexluxury" initialFinancing={initialFinancing} />
          <VehicleAdTools key={`tools-${vehicle.id}`} theme="cyan" tools={[
            { id: 'tco', label: 'Calculadora TCO', icon: Calculator, keepMounted: true, content: <TcoCalculatorCard vehicle={vehicle} /> },
            ...(hasVehicle360(dealershipInfo) ? [{ id: '360', label: 'Giro 360°', icon: RotateCw, feature: 'vehicle-360', content: orbitalImages.length ? <Vehicle360Viewer images={orbitalImages} autoRotate={true} /> : <p role="status" className="p-5 rounded-2xl border border-slate-700 text-sm text-slate-300">Visualização 360° indisponível para este veículo. Consulte as fotos cadastradas na galeria.</p> }] : []),
            { id: 'galeria', label: `Galeria Expandida (${images.length})`, icon: Camera, content: <VehicleExpandedGallery images={images} vehicleName={vehicle.nome} /> },
            { id: 'laudo', label: 'Laudo Cautelar Digital', icon: ShieldCheck, content: (
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
                    Abrir dossiê do veículo
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
            ) }
          ]} />
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

            <Button variant="outline" size="md" icon={MessageCircle} onClick={() => servicesRef.current?.openChat()} className="flex-1 sm:flex-none">Tirar dúvidas</Button>

            <Button
              variant="primary"
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
