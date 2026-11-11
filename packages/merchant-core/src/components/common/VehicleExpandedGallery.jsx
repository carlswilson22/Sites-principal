import React from 'react';
import { VehicleImage } from './VehicleImage';
import { VehiclePhotoCredit } from './VehiclePhotoCredit';

export function VehicleExpandedGallery({ images, vehicleName }) {
  if (!images.length) return <p className="text-sm text-slate-400">Sem fotos cadastradas para este veículo.</p>;
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {images.map((source, index) => <figure key={source} className="min-w-0 space-y-2">
      <VehicleImage src={source} alt={`${vehicleName} - Foto ${index + 1} de ${images.length}`} width={640} height={360} loading="lazy" fetchPriority="low" className="aspect-video w-full rounded-xl bg-slate-950 object-cover" />
      <figcaption className="space-y-1 text-xs text-slate-400">
        <span>Foto {index + 1} de {images.length}</span>
        <VehiclePhotoCredit src={source} />
      </figcaption>
    </figure>)}
  </div>;
}
