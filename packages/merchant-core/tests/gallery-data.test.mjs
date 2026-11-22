import test from 'node:test';
import assert from 'node:assert/strict';
import { getVehicleGallery, getVehicle360Images, validateVehicle360Images, galleryIndex } from '../src/utils/vehicleGallery.js';
import { storeSync } from '../src/services/storeSync.js';

test('galeria preserva capa, ordem e apenas fotos distintas válidas', () => {
  const vehicle = {
    cover_photo: ' /images/capa.jpg ',
    photos: ['', null, '/images/lateral.jpg', 'images/capa.jpg', '/images/lateral.jpg', '  ', '/images/traseira.jpg'],
    imagens: ['/images/legado.jpg'],
  };
  assert.deepEqual(getVehicleGallery(vehicle), ['/images/capa.jpg', '/images/lateral.jpg', '/images/traseira.jpg']);
  assert.equal(vehicle.photos.length, 7);
});

test('galeria aceita dados do site, uma única foto e imagens enviadas pelo lojista', () => {
  assert.deepEqual(getVehicleGallery({ imagemPrincipal: '/images/hb20.jpg', imagens: ['/images/hb20.jpg'] }), ['/images/hb20.jpg']);
  const upload = 'data:image/jpeg;base64,example';
  assert.deepEqual(getVehicleGallery({ cover_photo: upload, photos: [upload, '/images/segunda.jpg'] }), [upload, '/images/segunda.jpg']);
  assert.deepEqual(getVehicleGallery({ imagemPrincipal: '/images/placeholder-carro.jpg' }), []);
  assert.deepEqual(getVehicleGallery({ cover_photo: 'https://example.com/Sites-principal/images/placeholder-carro.jpg?x=1', photos: [] }), []);
  assert.deepEqual(getVehicleGallery(null), []);
});

test('não confunde galeria com quadros 360 e não escolhe outro veículo como fallback', () => {
  assert.deepEqual(getVehicleGallery({ imagens360: ['/images/360.jpg'] }), []);
  assert.deepEqual(getVehicle360Images({ id: 4 }), []);
  assert.deepEqual(getVehicle360Images({ imagens360: ['', '/images/quadro1.jpg', '/images/quadro1.jpg'] }), ['/images/quadro1.jpg', '/images/quadro1.jpg']);
});

test('exige oito quadros diferentes ou permite remover toda a sequência', () => {
  const frames = Array.from({ length: 8 }, (_, i) => `data:image/jpeg;base64,frame-${i}`);
  assert.equal(validateVehicle360Images([]), '');
  assert.equal(validateVehicle360Images(frames), '');
  assert.match(validateVehicle360Images(frames.slice(0, 7)), /8 imagens diferentes/);
  assert.match(validateVehicle360Images([...frames, frames[0]]), /8 imagens diferentes/);
});

test('quadros 360 cadastrados sobrevivem ao recarregamento sem alterar a galeria do anúncio', () => {
  const memory = new Map();
  const storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
  const previous = { window: globalThis.window, localStorage: globalThis.localStorage, CustomEvent: globalThis.CustomEvent };
  globalThis.localStorage = storage;
  globalThis.window = { localStorage: storage, dispatchEvent() {} };
  globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options?.detail; } };
  try {
    const seed = [{ id: 1, nome: 'Meu veículo', imagens: ['/images/frente.jpg', '/images/traseira.jpg'], imagemPrincipal: '/images/frente.jpg' }];
    const vehicle = storeSync.getVehicles('test-360', seed)[0];
    const frames = Array.from({ length: 8 }, (_, i) => `data:image/jpeg;base64,frame-${i}`);
    storeSync.saveVehicle('test-360', { ...vehicle, imagens360: frames }, seed);
    const reloaded = storeSync.getVehicles('test-360', seed)[0];
    assert.deepEqual(getVehicle360Images(reloaded), frames);
    assert.deepEqual(getVehicleGallery(reloaded), ['/images/frente.jpg', '/images/traseira.jpg']);
    assert.equal(reloaded.imagemPrincipal, '/images/frente.jpg');
    const newGallery = ['/images/nova-capa.jpg', '/images/nova-lateral.jpg'];
    storeSync.saveVehicle('test-360', { ...reloaded, photos: newGallery, cover_photo: newGallery[0] }, seed);
    const afterGalleryEdit = storeSync.getVehicles('test-360', seed)[0];
    assert.deepEqual(getVehicle360Images(afterGalleryEdit), frames);
    assert.deepEqual(getVehicleGallery(afterGalleryEdit), newGallery);

    const beforeFailure = memory.get('store_vehicles_test-360');
    storage.setItem = () => { throw new Error('Quota exceeded'); };
    assert.throws(() => storeSync.saveVehicle('test-360', { ...afterGalleryEdit, imagens360: [] }, seed), /Não foi possível salvar o estoque/);
    assert.equal(memory.get('store_vehicles_test-360'), beforeFailure);
    assert.deepEqual(getVehicle360Images(storeSync.getVehicles('test-360', seed)[0]), frames);
    storage.setItem = (key, value) => memory.set(key, value);
    storeSync.saveVehicle('test-360', { ...afterGalleryEdit, imagens360: [] }, seed);
    assert.deepEqual(getVehicle360Images(storeSync.getVehicles('test-360', seed)[0]), []);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
});

test('seleção permanece dentro da galeria após remoção de fotos', () => {
  assert.equal(galleryIndex(5, 2), 1);
  assert.equal(galleryIndex(1, 0), 0);
  assert.equal(galleryIndex(-1, 3), 0);
  assert.equal(galleryIndex(NaN, 3), 0);
});
