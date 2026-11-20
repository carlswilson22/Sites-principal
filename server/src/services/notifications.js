/**
 * server/src/services/notifications.js
 * Avisos por e-mail: novo contato (para a loja) e franquia de IA (para o proprietário e a empresa).
 * O resultado de cada envio fica na trilha de auditoria, sem dado pessoal do cliente.
 * Sem e-mail configurado, o aviso não é enviado e o painel continua sendo a fonte dos contatos.
 */
import { getDb } from '../database/db.js';
import { config } from '../config.js';
import { readSetting, writeSetting } from '../modules.js';
import { sendEmail } from './emailAdapter.js';
import { usageSummary } from './usage.js';
import { audit } from '../routes/util.js';

const SOURCE_LABEL = { site_formulario: 'Formulário do site', site_whatsapp: 'Botão de WhatsApp', simulador_financiamento: 'Simulador de financiamento', avaliacao_troca: 'Avaliação de troca' };

function storeInfo() {
  const saved = readSetting('store', {}) || {};
  return { name: saved.name || config.store.name, email: saved.email || process.env.LEADS_EMAIL || '' };
}
const panelUrl = () => (process.env.SITE_URL || '').replace(/\/$/, '');

export async function notifyNewLead(lead) {
  const store = storeInfo();
  if (!store.email) {
    audit(null, 'LEAD_AVISO', 'leads', lead.id, { status: 'sem_destinatario' }, null);
    return { sent: false, status: 'sem_destinatario' };
  }
  let vehicle = '';
  if (lead.vehicleId) vehicle = getDb().prepare('SELECT title, version, year FROM vehicles WHERE id = ?').get(lead.vehicleId);
  const lines = [
    `Novo contato recebido pelo site de ${store.name}.`,
    '',
    `Nome: ${lead.name}`,
    `Telefone: ${lead.phone}`,
    ...(lead.email ? [`E-mail: ${lead.email}`] : []),
    `Origem: ${SOURCE_LABEL[lead.source] || lead.source}`,
    ...(vehicle ? [`Veículo de interesse: ${[vehicle.title, vehicle.version, vehicle.year].filter(Boolean).join(' ')}`] : []),
    ...(lead.message ? ['', 'Mensagem:', lead.message] : []),
    '',
    'Responda o quanto antes: contatos atendidos em poucos minutos têm muito mais chance de virar venda.',
    ...(panelUrl() ? [`Painel: ${panelUrl()}`] : [])
  ];
  const result = await sendEmail({ to: store.email, subject: `Novo contato: ${lead.name}`, text: lines.join('\n') });
  audit(null, 'LEAD_AVISO', 'leads', lead.id, { status: result.status }, null);
  return result;
}

/** Avisa uma vez por mês em cada nível (atenção a 80%, excedido a 100%). */
export async function notifyQuota(kind, now = new Date()) {
  const item = usageSummary(now).find(entry => entry.kind === kind);
  if (!item || item.level === 'normal') return { skipped: true };
  const month = now.toISOString().slice(0, 7);
  const key = `quota_notice:${kind}:${month}`;
  const done = readSetting(key, []) || [];
  if (done.includes(item.level)) return { skipped: true };

  const db = getDb();
  const owners = db.prepare("SELECT email FROM users WHERE role = 'proprietario' AND active = 1").all().map(row => row.email);
  const recipients = [...new Set([...owners, ...(process.env.PROVIDER_EMAIL ? [process.env.PROVIDER_EMAIL] : [])])];
  if (!recipients.length) return { skipped: true };

  const store = storeInfo();
  const label = kind === 'ai' ? 'inteligência artificial' : kind;
  const subject = item.level === 'excedido' ? `Franquia de ${label} esgotada` : `Franquia de ${label} em 80%`;
  const text = item.level === 'excedido'
    ? `A franquia mensal de ${label} de ${store.name} foi esgotada (${item.used} de ${item.quota}). O recurso continua funcionando e o consumo excedente é cobrado pelo custo do provedor, conforme o contrato (item 3.4). Para definir um teto mensal de consumo, responda este e-mail.`
    : `${store.name} usou ${item.used} de ${item.quota} da franquia mensal de ${label} (80% ou mais). O recurso segue funcionando. Acima da franquia, o consumo é cobrado pelo custo do provedor (contrato, item 3.4). Para definir um teto mensal, responda este e-mail.`;
  const results = [];
  for (const to of recipients) results.push(await sendEmail({ to, subject, text }));
  writeSetting(key, [...done, item.level]);
  audit(null, 'FRANQUIA_AVISO', 'usage_events', kind, { nivel: item.level, enviados: results.filter(r => r.sent).length }, null);
  return { level: item.level, results };
}
