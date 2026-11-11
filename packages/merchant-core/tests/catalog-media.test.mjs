import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { applyCatalogMedia, reconcileCatalogMedia } from '../src/utils/catalogMedia.js';
import { normalizeVehicle } from '../src/utils/vehicles.js';
import { storeSync } from '../src/services/storeSync.js';

const legacyHB20 = {
  id: 4, nome: 'Hyundai HB20', cor: 'Cinza', preco: 65000,
  imagemPrincipal: '/images/FotoHyundaiHB20.jpg',
  imagens: ['/images/FotoHyundaiHB20.jpg', 'https://images.unsplash.com/legacy.jpg'],
};

test('HB20 usa nove imagens locais distintas e o conjunto orbital correto', async () => {
  const { vehiclesData } = await import('../../../sites/auto-dealership/src/data/vehicles.js');
  const vehicle = vehiclesData.find(item => item.nome === 'Hyundai HB20');
  assert.equal(vehicle.imagens.length, 9);
  assert.equal(vehicle.imagens360.length, 8);
  assert(vehicle.imagens360.every(image => image.includes('/sc-003/')));
  const hashes = vehicle.imagens.map(image => createHash('sha256').update(readFileSync(new URL(`../../../sites/auto-dealership/public${image}`, import.meta.url))).digest('hex'));
  assert.equal(new Set(hashes).size, 9);
  assert.equal(vehicle.cor, 'Prata');
});

test('migração atualiza aliases de mídia normalizados e preserva campos comerciais', () => {
  const seed = applyCatalogMedia(legacyHB20);
  const stored = normalizeVehicle({ ...legacyHB20, price: 72000, status: 'reservado', is_published: 0 });
  const [updated] = reconcileCatalogMedia([stored], [seed]);
  assert.deepEqual(updated.photos, seed.photos);
  assert.deepEqual(updated.imagens, seed.imagens);
  assert.deepEqual(updated.imagens360, seed.imagens360);
  assert.equal(updated.price, 72000);
  assert.equal(updated.status, 'reservado');
  assert.equal(updated.is_published, 0);
  assert.equal(updated.cor, 'Prata');
  assert.deepEqual(reconcileCatalogMedia([updated], [seed]), [updated]);
});

test('fotos personalizadas, reordenação e capa escolhida permanecem intactas', () => {
  const seed = applyCatalogMedia(legacyHB20);
  const normalized = normalizeVehicle(legacyHB20);
  for (const vehicle of [
    { ...normalized, photos: ['data:image/jpeg;base64,customer'], imagens: ['data:image/jpeg;base64,customer'] },
    { ...normalized, photos: [...normalized.photos].reverse(), imagens: [...normalized.imagens].reverse() },
    { ...normalized, cover_photo: normalized.photos[1], imagemPrincipal: normalized.photos[1] },
    { ...normalized, imagens: ['data:image/png;base64,changed-alias'] },
  ]) {
    assert.equal(reconcileCatalogMedia([vehicle], [seed])[0], vehicle);
  }
  const customColor = { ...normalized, cor: 'Preto', color: 'Preto' };
  const [updated] = reconcileCatalogMedia([customColor], [seed]);
  assert.equal(updated.cor, 'Preto');
  assert.deepEqual(updated.photos, seed.photos);
});

test('migração exige ID e nome e não ressuscita anúncios excluídos', () => {
  const seed = applyCatalogMedia(legacyHB20);
  const otherId = normalizeVehicle({ ...legacyHB20, id: 9 });
  const renamed = normalizeVehicle({ ...legacyHB20, nome: 'Outro veículo' });
  assert.equal(reconcileCatalogMedia([otherId], [seed])[0], otherId);
  assert.equal(reconcileCatalogMedia([renamed], [seed])[0], renamed);
  assert.deepEqual(reconcileCatalogMedia([], [seed]), []);
});

test('mídia intacta de revisão anterior pode evoluir sem substituir edições', () => {
  const seed = applyCatalogMedia(legacyHB20);
  const oldPhotos = ['/images/old-front.jpg', '/images/old-rear.jpg'];
  const previous = { revision: 0, name: 'hyundai hb20', photos: oldPhotos, cover: oldPhotos[0], orbital: [], color: 'Cinza' };
  const stored = normalizeVehicle({ ...legacyHB20, imagens: oldPhotos, imagemPrincipal: oldPhotos[0], catalogMedia: previous });
  assert.deepEqual(reconcileCatalogMedia([stored], [seed])[0].photos, seed.photos);
});

test('não inventa galerias 360 para veículos sem conjunto próprio', () => {
  const tracker = applyCatalogMedia({ id: 1, nome: 'Chevrolet Tracker', imagens: ['legacy'], imagens360: ['/images/cars/sc-001/0.jpg'] });
  assert.deepEqual(tracker.imagens, ['/images/catalog/chevrolet-tracker-front.png', '/images/catalog/chevrolet-tracker-rear.png']);
  assert.deepEqual(tracker.imagens360, []);
  const luxury = applyCatalogMedia({ id: 1, nome: 'Modelo sem conjunto cadastrado', imagemPrincipal: 'https://example.com/porsche.jpg', imagens: ['https://example.com/porsche.jpg'], imagens360: ['/images/cars/sc-001/0.jpg'] });
  assert.deepEqual(luxury.imagens, ['https://example.com/porsche.jpg']);
  assert.deepEqual(luxury.imagens360, []);
  assert.equal(reconcileCatalogMedia([{ ...legacyHB20, imagens: ['custom'] }], [luxury])[0].imagens[0], 'custom');
});

test('estoque já salvo recebe a galeria corrigida sem apagar anúncios e fotos pessoais', () => {
  const seed = applyCatalogMedia(legacyHB20);
  const custom = normalizeVehicle({ id: 'customer', nome: 'Meu veículo', imagens: ['data:image/jpeg;base64,upload'] });
  const raw = JSON.stringify([normalizeVehicle({ ...legacyHB20, price: 71000 }), custom]);
  globalThis.window = {};
  globalThis.localStorage = { getItem: () => raw, setItem: () => { throw new Error('Leitura não deve sobrescrever o estoque'); } };
  try {
    const updated = storeSync.getVehicles('autoelite', [seed]);
    assert.equal(updated.length, 2);
    assert.equal(updated[0].photos.length, 9);
    assert.equal(updated[0].price, 71000);
    assert.deepEqual(updated[1].photos, custom.photos);
  } finally {
    delete globalThis.window;
    delete globalThis.localStorage;
  }
});
