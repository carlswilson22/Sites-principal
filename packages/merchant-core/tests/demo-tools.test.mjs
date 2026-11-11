import test from 'node:test';
import assert from 'node:assert/strict';
import { demoTools } from '../src/services/demoTools.js';
import { calculateMarketPricing } from '../src/utils/marketPricing.js';
import { createStoryPng, storyPrice } from '../src/utils/storyArt.js';
import { exportVehiclesToCsv } from '../src/utils/catalogExport.js';

const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};
const vehicles = [{ id: 7, nome: 'Veículo de teste', ano: '2024/2025', preco: 100000, imagens: ['/images/test.jpg'] }];
const story = () => ({ storeName: 'Loja teste', vehicle: { id: 7, title: 'Veículo de teste', year: '2024/2025', km: 1000, price: 100000 }, photos: ['/images/test.jpg'], template: 'apex_minimal', priceMode: 'preco_cheio', framing: 'cover' });

test('publicação guarda arte e legenda imutáveis, histórico limitado e lojas isoladas', () => {
  const db = storage();
  const payload = { story: story(), caption: 'Seleção da semana' };
  const result = demoTools.publish('loja-a', payload, db);
  assert.equal(result.demo, true);
  assert.equal(result.publication.status, 'sample_published');
  assert.equal(demoTools.instagramStatus('loja-a').configured, false);
  payload.story.vehicle.title = 'Outro título';
  assert.equal(demoTools.history('loja-a', db)[0].story.vehicle.title, 'Veículo de teste');
  assert.equal(demoTools.history('loja-a', db)[0].caption, 'Seleção da semana');
  assert.deepEqual(demoTools.history('loja-b', db), []);
  for (let index = 0; index < 22; index++) demoTools.publish('loja-a', { story: story(), caption: String(index) }, db);
  assert.equal(demoTools.history('loja-a', db).length, 20);
  assert.equal(demoTools.history('loja-a', db)[0].caption, '21');
  assert(demoTools.audit('loja-a', db).some(item => item.action === 'STORY_PUBLICADO_NA_PREVIA'));
});

test('consignação persiste o veículo e calcula comissão e repasse, sem duplicá-lo', () => {
  const db = storage();
  const form = { vehicle_id: 7, owner_name: 'Consignante teste', remuneration_type: 'percentual', remuneration_value: 6, min_remuneration: 3500, service_fee: 350, daily_storage_fee: 0, contract_start: '2026-01-01', contract_end: '2027-01-01' };
  demoTools.saveConsignment('loja-a', form, vehicles, db);
  demoTools.saveConsignment('loja-a', { ...form, remuneration_value: 8 }, vehicles, db);
  const rows = demoTools.consignments('loja-a', vehicles, db);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].owner_name, form.owner_name);
  assert.equal(rows[0].vehicle_title, 'Veículo de teste');
  assert.equal(rows[0].settlement.storeCommission, 8000);
  assert.equal(rows[0].settlement.ownerNetPayout, 91650);
  assert.throws(() => demoTools.saveConsignment('loja-a', { ...form, remuneration_value: -1 }, vehicles, db));
  assert.throws(() => demoTools.saveConsignment('loja-a', { ...form, contract_end: '2025-01-01' }, vehicles, db));
  assert.throws(() => demoTools.saveConsignment('loja-a', { ...form, vehicle_id: 999 }, vehicles, db));
});

test('minutas completas têm numeração, veículo, vínculo do aditivo e escape de HTML', () => {
  const db = storage();
  const payload = { type: 'consignacao', vehicle_id: 7, client_id: 1, terms: { witness1_name: '<script>alert(1)</script>' } };
  const first = demoTools.createContract('loja-a', payload, vehicles, { nome: 'Loja teste' }, db);
  assert(first.html.includes('Veículo de teste') && first.html.includes('CLÁUSULA 2ª'));
  assert(!first.html.includes('<script>'));
  assert(first.html.includes('&lt;script&gt;'));
  assert.throws(() => demoTools.createContract('loja-a', { ...payload, type: 'termo_aditivo', parent_contract_id: 'inexistente' }, vehicles, {}, db));
  const second = demoTools.createContract('loja-a', { ...payload, type: 'termo_aditivo', parent_contract_id: first.id, terms: { amendmentReason: 'Novo prazo de 30 dias' } }, vehicles, {}, db);
  assert(second.html.includes(first.code) && second.html.includes('Novo prazo de 30 dias'));
  assert.notEqual(first.code, second.code);
  assert.equal(demoTools.contracts('loja-a', db).length, 2);
  assert.equal(demoTools.contracts('loja-b', db).length, 0);
});

test('anonimização altera a próxima exportação e registra a auditoria da loja', () => {
  const db = storage();
  assert.equal(demoTools.exportClient('loja-a', 1, db).anonimizado, false);
  demoTools.anonymize('loja-a', 1, db);
  const exported = demoTools.exportClient('loja-a', 1, db);
  assert.equal(exported.anonimizado, true);
  assert.equal(exported.titular.phone, null);
  assert.equal(exported.titular.email, null);
  assert.equal(demoTools.exportClient('loja-b', 1, db).anonimizado, false);
  assert(demoTools.audit('loja-a', db).some(item => item.action === 'TITULAR_ANONIMIZADO'));
});

test('erros de armazenamento não produzem sucesso nem sobrescrevem dados inválidos', () => {
  const db = storage();
  db.setItem('store_tool_samples_loja-a', '{invalid');
  assert.throws(() => demoTools.publish('loja-a', { story: story() }, db), /preservados/);
  assert.equal(db.getItem('store_tool_samples_loja-a'), '{invalid');
  const full = { getItem: () => null, setItem: () => { throw Error('quota'); } };
  assert.throws(() => demoTools.publish('loja-a', { story: story() }, full), /salvar/);
  assert.throws(() => demoTools.publish('loja-a', { story: { ...story(), photos: [] } }, db), /foto/);
});

test('precificação usa concorrentes, liquidez, leilão, preparação e margem explícita zero', () => {
  const payload = { fipePrice: 100000, manualCompetitors: [{ price: 110000 }, { price: 130000 }], regionalLiquidity: 'baixa', hasAuctionRecord: true, auctionDiscountPercent: 20, preparationCost: 2500, desiredMarginPercent: 12 };
  const result = calculateMarketPricing(payload);
  assert.equal(result.avgCompetitorPrice, 120000);
  assert.equal(result.auctionDeduction, 22800);
  assert.equal(result.suggestedSalePrice, 87552);
  assert.equal(result.maxBuyPrice, 74546);
  const zero = calculateMarketPricing({ ...payload, desiredMarginPercent: 0, auctionDiscountPercent: 0 });
  assert.equal(zero.targetProfit, 0);
  assert.equal(zero.auctionDeduction, 0);
  assert.throws(() => calculateMarketPricing({ ...payload, desiredMarginPercent: 101 }));
});

test('PNG exporta a tela 1080x1920 com o layout e as condições selecionadas', async () => {
  const previous = globalThis.Image;
  globalThis.Image = class { width = 1600; height = 900; set src(value) { queueMicrotask(() => this.onload()); } };
  try {
    for (const template of ['apex_minimal', 'bold_impact', 'showcase_trio']) {
      const drawCalls = []; const texts = [];
      const context = { save() {}, beginPath() {}, rect() {}, clip() {}, restore() {}, fillRect() {}, drawImage(...args) { drawCalls.push(args); }, fillText(text) { texts.push(text); }, measureText: text => ({ width: text.length * 20 }) };
      const canvas = { getContext: () => context, toBlob: callback => callback(new Blob(['png'], { type: 'image/png' })) };
      const blob = await createStoryPng({ ...story(), template, photos: ['/images/a.jpg', '/images/b.jpg', '/images/c.jpg'] }, canvas);
      assert.equal(canvas.width, 1080); assert.equal(canvas.height, 1920);
      assert.equal(blob.type, 'image/png');
      assert.equal(drawCalls.length, template === 'showcase_trio' ? 3 : 1);
      assert(texts.includes('Veículo de teste'));
      assert(texts.some(text => text.includes('100.000')));
    }
    assert.equal(storyPrice({ ...story(), priceMode: 'sem_preco' }), 'Consulte condições');
  } finally { globalThis.Image = previous; }
});

test('CSV exporta o estoque com aspas e separadores preservados e texto seguro para planilhas', () => {
  const csv = exportVehiclesToCsv([{ id: 1, title: 'Carro; versão "Especial"', color: '=1+1', price: 100000, photos_count: 3 }]);
  assert(csv.startsWith('ID;Titulo;Versao;'));
  assert(csv.includes('"Carro; versão ""Especial"""'));
  assert(csv.includes('"\'=1+1"'));
  assert(csv.includes('"100000"'));
  assert(csv.endsWith(';"3"'));
});
