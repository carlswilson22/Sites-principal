import test from 'node:test';
import assert from 'node:assert/strict';
import { getVehicleGallery, getVehicle360Images, galleryIndex } from '../src/utils/vehicleGallery.js';

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
  assert.deepEqual(getVehicleGallery(null), []);
});

test('não confunde galeria com quadros 360 e não escolhe outro veículo como fallback', () => {
  assert.deepEqual(getVehicleGallery({ imagens360: ['/images/360.jpg'] }), []);
  assert.deepEqual(getVehicle360Images({ id: 4 }), []);
  assert.deepEqual(getVehicle360Images({ imagens360: ['', '/images/quadro1.jpg', '/images/quadro1.jpg'] }), ['/images/quadro1.jpg', '/images/quadro1.jpg']);
});

test('seleção permanece dentro da galeria após remoção de fotos', () => {
  assert.equal(galleryIndex(5, 2), 1);
  assert.equal(galleryIndex(1, 0), 0);
  assert.equal(galleryIndex(-1, 3), 0);
  assert.equal(galleryIndex(NaN, 3), 0);
});
