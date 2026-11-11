import React from 'react';
import { VehicleImage } from '../common/VehicleImage';
import { VehiclePhotoCredit } from '../common/VehiclePhotoCredit';

export function StoreVehiclePhoto({ vehicle, storeName }) {
  if (!vehicle) return null;
  return <figure className="space-y-3" data-store-photo={vehicle.id}>
    <VehicleImage src={vehicle.imagemPrincipal} alt={`${vehicle.nome} · ${storeName}`} loading="lazy" width={1200} height={800} className="w-full aspect-[3/2] object-cover rounded-2xl border border-slate-700" />
    <figcaption className="text-xs text-slate-400">{vehicle.nome} · Foto ilustrativa do catálogo da {storeName}.</figcaption>
    <VehiclePhotoCredit src={vehicle.imagemPrincipal} />
  </figure>;
}
