import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLeadStatusUpdates } from '../src/utils/leadHistory.js';

test('mudança de situação preserva histórico anterior e registra observação, origem e data', () => {
  const prior = { previous: 'novo', status: 'em_atendimento', note: 'Primeiro retorno', date: '2026-11-09T10:00:00.000Z' };
  const lead = { status: 'em_atendimento', history: [prior] };
  const updates = buildLeadStatusUpdates(lead, 'ganho', '  Cliente confirmou a compra.  ', new Date('2026-11-10T12:00:00Z'));
  assert.equal(updates.status, 'ganho');
  assert.equal(updates.statusNote, 'Cliente confirmou a compra.');
  assert.deepEqual(updates.history, [prior, { previous: 'em_atendimento', status: 'ganho', note: 'Cliente confirmou a compra.', date: '2026-11-10T12:00:00.000Z' }]);
  assert.equal(lead.history.length, 1);
});

test('anotação registra retorno mesmo sem alterar situação, mas não cria evento vazio', () => {
  assert.throws(() => buildLeadStatusUpdates({ status: 'novo' }, 'novo', '   '));
  const updates = buildLeadStatusUpdates({ status: 'novo' }, 'novo', 'Retornar amanhã');
  assert.equal(updates.history[0].previous, 'novo');
  assert.equal(updates.history[0].status, 'novo');
  assert.equal(updates.history[0].note, 'Retornar amanhã');
});

test('histórico legado não impede registrar e valores inválidos são rejeitados', () => {
  assert.throws(() => buildLeadStatusUpdates({ status: 'novo' }, 'inexistente', 'Teste'));
  assert.throws(() => buildLeadStatusUpdates({ status: 'novo' }, 'ganho', 'a'.repeat(1001)));
  const updates = buildLeadStatusUpdates({ status: 'novo', history: [null] }, 'em_atendimento');
  assert.equal(updates.history.length, 1);
  assert.equal(updates.history[0].note, '');
  assert(!Object.hasOwn(updates, 'statusNote'));
});
