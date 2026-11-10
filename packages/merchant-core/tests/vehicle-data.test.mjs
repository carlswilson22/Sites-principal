import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { normalizeVehicle, isPublishedVehicle } from '../src/utils/vehicles.js';
import { resolveAssetUrl } from '../src/utils/assets.js';

test('imagens locais respeitam a subpasta sem duplicar a base e preservam URLs externas', () => {
  const base = '/Sites-principal/luxury-dealership/';
  for (const input of ['/images/a.jpg', 'images/a.jpg', `${base}images/a.jpg`, '/Sites-principal/auto-dealership/images/a.jpg']) {
    assert.equal(resolveAssetUrl(input, base), `${base}images/a.jpg`);
  }
  assert.equal(resolveAssetUrl('https://example.com/a.jpg', base), 'https://example.com/a.jpg');
  assert.equal(resolveAssetUrl('data:image/png;base64,x', base), 'data:image/png;base64,x');
});

test('todos os veículos iniciais funcionam no painel e suas fotos locais existem', async () => {
  for (const site of ['auto-dealership', 'luxury-dealership', 'popular-dealership']) {
    const { vehiclesData } = await import(`../../../sites/${site}/src/data/vehicles.js`);
    for (const raw of vehiclesData) {
      const vehicle = normalizeVehicle(raw);
      assert.doesNotThrow(() => [vehicle.title, vehicle.version, vehicle.color].map(value => value.toLowerCase()));
      assert.equal(vehicle.title, vehicle.nome);
      const edited = normalizeVehicle({ ...vehicle, title: 'Editado no painel', price: 45000, photos: ['/images/placeholder-carro.jpg'], cover_photo: '/images/placeholder-carro.jpg' });
      assert.equal(edited.nome, 'Editado no painel');
      assert.equal(edited.preco, 45000);
      assert.deepEqual(edited.imagens, ['/images/placeholder-carro.jpg']);
      for (const image of [vehicle.imagemPrincipal, ...vehicle.imagens, ...(vehicle.imagens360 || [])]) {
        if (!image || /^https?:/.test(image)) continue;
        const relative = image.replace(/^.*?(?=images\/)/, '');
        assert(existsSync(new URL(`../../../sites/${site}/public/${relative}`, import.meta.url)), `${site}: ${image}`);
      }
    }
  }
});

test('vitrine omite anúncios ocultos ou vendidos', () => {
  assert.equal(isPublishedVehicle({ is_published: 0 }), false);
  assert.equal(isPublishedVehicle({ is_published: '0' }), false);
  assert.equal(isPublishedVehicle({ status: 'vendido' }), false);
  assert.equal(isPublishedVehicle({}), true);
});
