process.env.DATABASE_PATH = ':memory:';
process.env.MERCHANT_TIER = '3';
import test from 'node:test';
import assert from 'node:assert/strict';
import { getDb } from '../src/database/db.js';
import { setEmailSender } from '../src/services/emailAdapter.js';
import { processLeadReports, reportPeriod } from '../src/services/leadReports.js';

test('alertas e relatório semanal são enviados uma vez por proprietário e falhas são tentadas novamente', async () => {
  const db = getDb();
  db.prepare("INSERT INTO users (name,email,password_hash,role,active) VALUES ('Dono','owner@example.test','hash','proprietario',1)").run();
  db.prepare("INSERT INTO leads (name,phone,status,created_at) VALUES ('Contato','61999990000','novo','2026-11-16 09:00:00')").run();
  const now = new Date('2026-11-16T12:00:00Z');
  const sent = [];
  let fail = true;
  setEmailSender(async message => { sent.push(message); return fail ? { sent: false } : { sent: true }; });
  try {
    await processLeadReports(now);
    assert.equal(sent.length, 2, 'alerta e resumo tentados');
    fail = false;
    await processLeadReports(now);
    assert.equal(sent.length, 4, 'falhas são repetidas');
    await processLeadReports(now);
    assert.equal(sent.length, 4, 'sucessos não são repetidos');
    assert.match(sent[3].text, /Novos contatos:|Contatos atualmente sem resposta:/);
  } finally { setEmailSender(); }
});

test('relatório usa calendário brasileiro e aguarda segunda às oito', () => {
  assert.equal(reportPeriod(new Date('2026-11-16T10:59:00Z')).ready, false);
  const period = reportPeriod(new Date('2026-11-16T11:00:00Z'));
  assert.equal(period.ready, true);
  assert.equal(period.key, '2026-11-16');
  assert.equal(period.start, '2026-11-09T03:00:00.000Z');
});
