import { getDb } from '../database/db.js';
import { readSetting, writeSetting } from '../modules.js';
import { sendEmail } from './emailAdapter.js';
import { config } from '../config.js';

export function alertMinutes() {
  const value = Number(process.env.LEAD_ALERT_MINUTES || 60);
  return Number.isFinite(value) && value >= 1 && value <= 10080 ? Math.floor(value) : 60;
}

// The report follows the store's Brazilian calendar, independent of the server's timezone.
export function reportPeriod(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const part = name => Number(parts.find(item => item.type === name).value);
  const localDay = new Date(Date.UTC(part('year'), part('month') - 1, part('day')));
  const sinceMonday = (localDay.getUTCDay() + 6) % 7;
  localDay.setUTCDate(localDay.getUTCDate() - sinceMonday);
  const key = localDay.toISOString().slice(0, 10);
  const end = new Date(localDay.getTime() + 3 * 3600000);
  return { key, ready: sinceMonday > 0 || part('hour') >= 8, start: new Date(end.getTime() - 7 * 86400000).toISOString(), end: end.toISOString() };
}

let running = false;
export async function processLeadReports(now = new Date()) {
  if (running) return;
  running = true;
  try {
    const db = getDb();
    const owners = db.prepare("SELECT id, email FROM users WHERE role = 'proprietario' AND active = 1 AND email IS NOT NULL AND email != ''").all();
    if (!owners.length) return;
    const minutes = alertMinutes();
    const cutoff = new Date(now.getTime() - minutes * 60000).toISOString();
    const leads = db.prepare("SELECT id FROM leads WHERE status = 'novo' AND julianday(created_at) <= julianday(?)").all(cutoff);
    for (const lead of leads) for (const owner of owners) {
      const key = `lead_unanswered:${lead.id}:${owner.id}`;
      if (readSetting(key, false)) continue;
      const current = db.prepare('SELECT status FROM leads WHERE id = ?').get(lead.id);
      if (current?.status !== 'novo') break;
      const result = await sendEmail({ to: owner.email, subject: `Contato sem resposta há ${minutes} minutos`, text: `Há um contato novo aguardando atendimento em ${config.store.name}. Acesse o painel para consultar os detalhes.\n${process.env.SITE_URL || ''}` });
      if (result.sent) writeSetting(key, now.toISOString());
    }
    const period = reportPeriod(now);
    if (!period.ready) return;
    const newLeads = db.prepare('SELECT COUNT(*) AS n FROM leads WHERE julianday(created_at) >= julianday(?) AND julianday(created_at) < julianday(?)').get(period.start, period.end).n;
    const unanswered = db.prepare("SELECT COUNT(*) AS n FROM leads WHERE status = 'novo'").get().n;
    const sales = db.prepare("SELECT COUNT(*) AS n FROM vehicles WHERE status = 'vendido' AND julianday(sold_at) >= julianday(?) AND julianday(sold_at) < julianday(?)").get(period.start, period.end).n;
    const stale = db.prepare("SELECT title, days_in_stock + MAX(0, CAST(julianday(?) - julianday(created_at) AS INTEGER)) AS days FROM vehicles WHERE status != 'vendido' AND days_in_stock + MAX(0, CAST(julianday(?) - julianday(created_at) AS INTEGER)) >= 60 ORDER BY days DESC").all(now.toISOString(), now.toISOString());
    const text = [`Resumo semanal de ${config.store.name}.`, `Período: ${period.start.slice(0, 10)} a ${period.end.slice(0, 10)} (fim exclusivo).`, `Novos contatos: ${newLeads}`, `Contatos atualmente sem resposta: ${unanswered}`, `Veículos vendidos: ${sales}`, `Veículos há 60 dias ou mais em estoque: ${stale.length}`, ...stale.map(vehicle => `- ${vehicle.title}: ${vehicle.days} dias`), process.env.SITE_URL ? `Painel: ${process.env.SITE_URL}` : ''].join('\n');
    for (const owner of owners) {
      const key = `weekly_report:${period.key}:${owner.id}`;
      if (readSetting(key, false)) continue;
      const result = await sendEmail({ to: owner.email, subject: 'Resumo semanal da loja', text });
      if (result.sent) writeSetting(key, now.toISOString());
    }
  } finally { running = false; }
}

export function startLeadReports() {
  const run = () => processLeadReports().catch(error => console.error('[Lead reports]', error.message));
  run();
  const timer = setInterval(run, 60000);
  timer.unref?.();
  return () => clearInterval(timer);
}
