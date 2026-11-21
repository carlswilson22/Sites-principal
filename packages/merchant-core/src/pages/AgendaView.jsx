import React, { useEffect, useState } from 'react';
import { storeSync } from '../services/storeSync';
import { leadBooking, leadDueGroup, leadUnanswered } from '../utils/leadAgenda';

export function AgendaView({ storeKey, onNavigateTo }) {
  const [leads, setLeads] = useState(() => storeSync.getLeads(storeKey));
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    setLeads(storeSync.getLeads(storeKey));
    const unsubscribe = storeSync.subscribe(storeKey, detail => { if (detail.type === 'LEADS_UPDATED') setLeads(detail.leads); });
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => { unsubscribe(); clearInterval(timer); };
  }, [storeKey]);
  const groups = [['atrasados', 'Atrasados'], ['hoje', 'Hoje'], ['proximos', 'Próximos dias']];
  const bookings = leads.filter(lead => leadBooking(lead)).sort((a, b) => String(leadBooking(b).starts_at).localeCompare(String(leadBooking(a).starts_at)));
  const alertAfter = storeSync.getSettings?.()?.leadAlertMinutes || 60;
  const overdue = leads.filter(lead => leadUnanswered(lead, now.getTime(), alertAfter));
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-slate-900">Agenda e acompanhamento</h1><p className="mt-1 text-sm text-slate-600">Acompanhe pedidos e programe o próximo contato com cada cliente.</p></div>
    {overdue.length > 0 && <button onClick={() => onNavigateTo('leads')} className="w-full rounded-xl border border-red-300 bg-red-50 p-4 text-left text-sm font-semibold text-red-800">{overdue.length} contato(s) novo(s) sem resposta há pelo menos {alertAfter} minutos. Abrir contatos →</button>}
    <div className="grid gap-4 lg:grid-cols-3">{groups.map(([group, label]) => { const items = leads.filter(lead => leadDueGroup(lead, now) === group).sort((a, b) => String(a.next_action_at).localeCompare(String(b.next_action_at))); return <section key={group} className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="font-bold text-slate-900">{label} <span className="text-slate-500">({items.length})</span></h2>{items.length ? <ul className="mt-3 space-y-3">{items.map(lead => <li key={lead.id} className="border-t border-slate-100 pt-3 text-sm"><strong>{lead.name}</strong><p>{lead.next_action}</p><p className="text-slate-500">{new Date(lead.next_action_at).toLocaleString('pt-BR')}</p></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">Nenhuma ação.</p>}</section>; })}</div>
    <section className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="font-bold text-slate-900">Solicitações de visita e test drive</h2><p className="mt-1 text-xs text-slate-500">Confirme os horários com os clientes; os pedidos não reservam horários automaticamente.</p>{bookings.length ? <ul className="mt-4 divide-y divide-slate-100">{bookings.map(lead => { const booking = leadBooking(lead); return <li key={lead.id} className="py-3 text-sm text-slate-700"><strong>{booking.type === 'visita' ? 'Visita' : 'Test drive'} · {lead.name}</strong><p>{new Date(booking.starts_at).toLocaleString('pt-BR')} · {lead.vehicle_title || 'Veículo a definir'} · {lead.phone}</p></li>; })}</ul> : <p className="mt-3 text-sm text-slate-500">Nenhuma solicitação recebida.</p>}</section>
    <button onClick={() => onNavigateTo('leads')} className="min-h-11 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Gerenciar contatos e próximas ações</button>
  </div>;
}
