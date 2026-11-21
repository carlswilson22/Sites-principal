import test from 'node:test';
import assert from 'node:assert/strict';
import { leadBooking, leadDueGroup, leadUnanswered } from '../src/utils/leadAgenda.js';

test('ações e alertas respeitam prazos, data local e situações encerradas', () => {
  const now = new Date(2026, 10, 16, 12);
  assert.equal(leadDueGroup({ status: 'novo', next_action_at: new Date(2026, 10, 15, 9).toISOString() }, now), 'atrasados');
  assert.equal(leadDueGroup({ status: 'novo', next_action_at: new Date(2026, 10, 16, 9).toISOString() }, now), 'atrasados');
  assert.equal(leadDueGroup({ status: 'novo', next_action_at: new Date(2026, 10, 16, 15).toISOString() }, now), 'hoje');
  assert.equal(leadDueGroup({ status: 'ganho', next_action_at: now.toISOString() }, now), null);
  assert.equal(leadUnanswered({ status: 'novo', created_at: new Date(now - 60 * 60000).toISOString() }, now.getTime()), true);
  assert.equal(leadUnanswered({ status: 'em_atendimento', created_at: new Date(now - 61 * 60000).toISOString() }, now.getTime()), false);
  assert.equal(leadBooking({ simulation_data: JSON.stringify({ booking: { type: 'visita' } }) }).type, 'visita');
});
