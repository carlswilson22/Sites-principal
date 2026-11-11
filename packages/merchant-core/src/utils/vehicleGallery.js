import { resolveAssetUrl } from './assets.js';

const photoSource = value => typeof value === 'string' ? value.trim() : '';

export function getVehicleGallery(vehicle) {
  if (!vehicle || typeof vehicle !== 'object') return [];
  const photos = Array.isArray(vehicle.photos) ? vehicle.photos : Array.isArray(vehicle.imagens) ? vehicle.imagens : [];
  const cover = photoSource(vehicle.cover_photo) || photoSource(vehicle.imagemPrincipal);
  const seen = new Set();
  return [cover, ...photos].map(photoSource).filter(source => {
    if (!source) return false;
    const key = resolveAssetUrl(source, '/');
    if (key === '/images/placeholder-carro.jpg' || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getVehicle360Images(vehicle) {
  return Array.isArray(vehicle?.imagens360) ? vehicle.imagens360.map(photoSource).filter(Boolean) : [];
}

export function galleryIndex(index, length) {
  return Math.min(Math.max(Number.isInteger(index) ? index : 0, 0), Math.max(length - 1, 0));
}
