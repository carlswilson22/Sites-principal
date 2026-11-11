export const CATALOG_MEDIA_REVISION = 3;
const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
// Additional reviewed galleries can provide photos/cover/orbital explicitly here.
export const CATALOG_MEDIA = {
  'chevrolet tracker': { cover: '/images/catalog/chevrolet-tracker-front.png', photos: ['/images/catalog/chevrolet-tracker-front.png', '/images/catalog/chevrolet-tracker-rear.png'], color: 'Azul' },
  'toyota corolla cross': { cover: '/images/FotoCorollaCross.jpg', color: 'Branco', folder: 'sc-001' },
  'volkswagen polo': { cover: '/images/FotoPoloTSI.jpg', color: 'Vermelho', folder: 'sc-002' },
  'hyundai hb20': { cover: '/images/FotoHyundaiHB20.jpg', color: 'Prata', folder: 'sc-003' },
  'fiat pulse': { cover: '/images/catalog/fiat-pulse-front.png', photos: ['/images/catalog/fiat-pulse-front.png', '/images/catalog/fiat-pulse-rear.png'], color: 'Azul' },
  'honda civic g10': { cover: '/images/catalog/civic-front.jpg', photos: ['/images/catalog/civic-front.jpg', '/images/catalog/civic-rear.jpg'], color: 'Prata' },
  'toyota hilux': { cover: '/images/catalog/hilux-front.jpg', photos: ['/images/catalog/hilux-front.jpg', '/images/catalog/hilux-rear.jpg'], color: 'Preto' },
  'bmw 320i': { cover: '/images/catalog/bmw320i-front.jpg', photos: ['/images/catalog/bmw320i-front.jpg', '/images/catalog/bmw320i-rear.jpg'], color: 'Preto' },
  'jeep compass': { cover: '/images/catalog/compass-front.jpg', photos: ['/images/catalog/compass-front.jpg', '/images/catalog/compass-rear.jpg'], color: 'Prata' },
  'porsche 911 gt3 rs': { cover: '/images/catalog/porsche-911-gt3-rs-front.jpg', photos: ['/images/catalog/porsche-911-gt3-rs-front.jpg', '/images/catalog/porsche-911-gt3-rs-rear.jpg'], color: 'Cinza' },
  'ferrari f8 tributo': { cover: '/images/catalog/ferrari-f8-tributo-front.jpg', photos: ['/images/catalog/ferrari-f8-tributo-front.jpg', '/images/catalog/ferrari-f8-tributo-rear.jpg'], color: 'Vermelho' },
  'lamborghini huracán evo': { cover: '/images/catalog/lamborghini-huracan-evo-front.jpg', photos: ['/images/catalog/lamborghini-huracan-evo-front.jpg', '/images/catalog/lamborghini-huracan-evo-rear.jpg'], color: 'Laranja' },
  'mercedes-amg g 63 magno': { cover: '/images/catalog/mercedes-amg-g63-front.jpg', photos: ['/images/catalog/mercedes-amg-g63-front.jpg', '/images/catalog/mercedes-amg-g63-rear.jpg'], color: 'Vermelho' },
  'mclaren 720s spider': { cover: '/images/catalog/mclaren-720s-spider-front.jpg', photos: ['/images/catalog/mclaren-720s-spider-front.jpg', '/images/catalog/mclaren-720s-spider-rear.jpg'], color: 'Vermelho' },
  'bmw m4 competition': { cover: '/images/catalog/bmw-m4-competition-front.jpg', photos: ['/images/catalog/bmw-m4-competition-front.jpg', '/images/catalog/bmw-m4-competition-rear.jpg'], color: 'Verde' },
};

const nameOf = vehicle => String(vehicle.title ?? vehicle.nome ?? '').trim().toLowerCase();
const photosOf = vehicle => Array.isArray(vehicle.photos ?? vehicle.imagens) ? [...(vehicle.photos ?? vehicle.imagens)] : [];
const orbitalOf = vehicle => Array.isArray(vehicle.imagens360) ? [...vehicle.imagens360] : [];
const coverOf = vehicle => vehicle.cover_photo ?? vehicle.imagemPrincipal ?? '';
const colorOf = vehicle => vehicle.color ?? vehicle.cor ?? '';
const sameArray = (first, second) => Array.isArray(first) && Array.isArray(second) && first.length === second.length && first.every((item, index) => item === second[index]);

export function applyCatalogMedia(rawVehicle) {
  const name = nameOf(rawVehicle);
  const reviewed = CATALOG_MEDIA[name];
  const legacyPhotos = photosOf(rawVehicle);
  const legacyCover = coverOf(rawVehicle);
  const legacy360 = orbitalOf(rawVehicle);
  const legacyColor = colorOf(rawVehicle);
  const cover = reviewed?.cover ?? legacyCover;
  const orbital = reviewed?.orbital ? [...reviewed.orbital] : reviewed?.folder ? ANGLES.map(angle => `/images/cars/${reviewed.folder}/${angle}.jpg`) : [];
  const photos = reviewed ? [...new Set(reviewed.photos || [cover, ...orbital])] : legacyPhotos;
  const color = reviewed?.color ?? legacyColor;
  return {
    ...rawVehicle,
    photos: [...photos], imagens: [...photos],
    cover_photo: cover, imagemPrincipal: cover,
    imagens360: [...orbital], color, cor: color,
    catalogMedia: {
      revision: CATALOG_MEDIA_REVISION, name, legacyPhotos, legacyCover, legacy360, legacyColor,
      photos: [...photos], cover, orbital: [...orbital], color,
    },
  };
}

function matchesMedia(vehicle, baseline) {
  const lists = ['photos', 'imagens'].filter(key => vehicle[key] !== undefined).map(key => vehicle[key]);
  const covers = ['cover_photo', 'imagemPrincipal'].filter(key => vehicle[key] !== undefined).map(key => vehicle[key]);
  return lists.length > 0 && covers.length > 0
    && lists.every(list => sameArray(list, baseline.photos))
    && covers.every(cover => cover === baseline.cover)
    && sameArray(orbitalOf(vehicle), baseline.orbital);
}

export function reconcileCatalogMedia(stored, fallbackData = []) {
  return stored.map(vehicle => {
    const seed = fallbackData.find(candidate => String(candidate.id) === String(vehicle.id) && nameOf(candidate) === nameOf(vehicle));
    const media = seed?.catalogMedia;
    if (!media || media.name !== nameOf(vehicle)) return vehicle;
    const legacy = { photos: media.legacyPhotos, cover: media.legacyCover, orbital: media.legacy360, color: media.legacyColor };
    const previous = vehicle.catalogMedia;
    const olderRevision = previous?.name === media.name && Number.isInteger(previous.revision) && previous.revision < media.revision;
    const baseline = matchesMedia(vehicle, legacy) ? legacy : olderRevision && matchesMedia(vehicle, previous) ? previous : null;
    if (!baseline) return vehicle;
    const colors = ['color', 'cor'].filter(key => vehicle[key] !== undefined).map(key => vehicle[key]);
    const updateColor = colors.length === 0 || colors.every(color => color === baseline.color);
    return {
      ...vehicle,
      photos: [...seed.photos], imagens: [...seed.imagens],
      cover_photo: seed.cover_photo, imagemPrincipal: seed.imagemPrincipal,
      imagens360: [...seed.imagens360],
      ...(updateColor ? { color: seed.color, cor: seed.cor } : {}),
      catalogMedia: media,
    };
  });
}
