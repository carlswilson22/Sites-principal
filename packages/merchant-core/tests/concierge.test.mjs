import test from 'node:test';
import assert from 'node:assert/strict';
import { conciergeReply, validateStoreRequest } from '../src/utils/concierge.js';

const vehicles = [
  { id: 1, nome: 'Toyota Corolla Cross', categoria: 'SUV', cambio: 'Automático CVT', preco: 130000 },
  { id: 2, nome: 'Hyundai HB20', categoria: 'Hatch', cambio: 'Manual', preco: 65000 },
  { id: 3, nome: 'BMW X1', categoria: 'SUV', cambio: 'Automático', preco: 240000 },
  { id: 4, nome: 'SUV oculto', categoria: 'SUV', preco: 80000, is_published: 0 },
  { id: 5, nome: 'SUV vendido', categoria: 'SUV', preco: 85000, status: 'vendido' },
  { id: 6, nome: 'Toyota Hilux', categoria: 'pickup', cambio: 'Automático', preco: 250000 },
];
test('concierge combina categoria, câmbio e orçamento e omite veículos indisponíveis', () => {
  assert.deepEqual(conciergeReply('SUV automático até 150 mil', vehicles).vehicleIds, [1]);
  assert.deepEqual(conciergeReply('Quero HB20', vehicles).vehicleIds, [2]);
  assert.deepEqual(conciergeReply('SUV até R$ 150.000', vehicles).vehicleIds, [1]);
  assert.equal(conciergeReply('SUV até 50 mil', vehicles).action, 'request');
  assert.deepEqual(conciergeReply('Picape até 300 mil', vehicles).vehicleIds, [6]);
});
test('visita, financiamento e transferência humana são opções explícitas', () => {
  const visit = conciergeReply('Agendar test drive', vehicles);
  assert.equal(visit.action, 'visit');
  assert.match(visit.text, /diretamente com o lojista pelo WhatsApp/);
  assert.equal(conciergeReply('Quero financiar', vehicles).action, 'inventory');
  assert.equal(conciergeReply('Falar com funcionário', vehicles).action, 'human');
  const address = conciergeReply('Endereço e horários', vehicles, { nome: 'Loja Teste', endereco: { cidade: 'Brasília' }, horarios: { semana: 'Segunda a sexta' } });
  assert.match(address.text, /Loja Teste.*Brasília.*Segunda a sexta/);
});

test('atendimento no anúncio responde sobre o próprio veículo e mantém financiamento e visita no contexto', () => {
  const vehicle = { ...vehicles[1], motor: '1.0', km: 22000 };
  assert.match(conciergeReply('Quero detalhes do motor', vehicles, {}, vehicle).text, /Hyundai HB20.*\n[\s\S]*22\.000 km[\s\S]*Motor: 1.0/);
  assert.match(conciergeReply('Qual o preço?', vehicles, {}, vehicle).text, /Hyundai HB20.*65\.000/);
  assert.equal(conciergeReply('Simular financiamento', vehicles, {}, vehicle).action, 'financing');
  assert.equal(conciergeReply('Agendar visita', vehicles, {}, vehicle).action, 'visit');
  assert.match(conciergeReply('Ver laudo', vehicles, {}, vehicle).text, /não tem um status de laudo informado/);
});
test('registro de preferência valida nome e telefone do contato', () => {
  const request = { name: ' Cliente ', phone: '(61) 99999-8888' };
  assert.deepEqual(validateStoreRequest(request), { name: 'Cliente', phone: '(61) 99999-8888' });
  for (const updates of [{ name: 'A' }, { name: '  ' }, { phone: '123' }, { phone: '1234567890123456' }]) assert.throws(() => validateStoreRequest({ ...request, ...updates }));
});
