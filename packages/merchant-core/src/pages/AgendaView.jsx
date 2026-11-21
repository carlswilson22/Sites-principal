import React, { useEffect, useRef, useState } from 'react';
import { storeSync } from '../services/storeSync';
import { reminders } from '../services/reminders';
import { leadBooking, leadDueGroup, leadUnanswered } from '../utils/leadAgenda';
import { LeadActionForm } from './LeadsView';

const emptyForm = () => ({ title: '', due_at: '', completed: false });
const localDateTime = value => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
};
const dueGroup = (reminder, now) => leadDueGroup({ next_action_at: reminder.due_at }, now);

export function AgendaView({ storeKey }) {
  const [leads, setLeads] = useState(() => storeSync.getLeads(storeKey));
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState('');
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [now, setNow] = useState(() => new Date());

  const refresh = async () => {
    try { setItems(await reminders.list(storeKey)); setError(''); }
    catch (failure) { setError(failure.message || 'Não foi possível carregar os lembretes.'); }
  };
  useEffect(() => {
    setLeads(storeSync.getLeads(storeKey));
    refresh();
    const unsubscribe = storeSync.subscribe(storeKey, detail => {
      if (detail.type === 'LEADS_UPDATED') setLeads(detail.leads);
      if (detail.type === 'REMINDERS_UPDATED') setItems(detail.reminders);
    });
    const onStorage = event => { if (event.key === `store_reminders_${storeKey}`) refresh(); };
    window.addEventListener('storage', onStorage);
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => { unsubscribe(); window.removeEventListener('storage', onStorage); clearInterval(timer); };
  }, [storeKey]);

  const save = async event => {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true; setBusy(true); setError(''); setFeedback('');
    try {
      await reminders.save(storeKey, form);
      await refresh();
      setForm(emptyForm()); setShowForm(false); setFeedback('Lembrete salvo na agenda.');
    } catch (failure) { setError(failure.message || 'Não foi possível salvar o lembrete.'); }
    finally { saving.current = false; setBusy(false); }
  };
  const changeReminder = async (item, remove = false) => {
    if (saving.current) return;
    saving.current = true; setBusy(true); setError(''); setFeedback('');
    try {
      if (remove) await reminders.remove(storeKey, item.id);
      else await reminders.save(storeKey, { ...item, completed: !item.completed });
      await refresh(); setFeedback(remove ? 'Lembrete removido.' : item.completed ? 'Lembrete reaberto.' : 'Lembrete concluído.');
      if (remove && String(form.id) === String(item.id)) { setForm(emptyForm()); setShowForm(false); }
    } catch (failure) { setError(failure.message || 'Não foi possível atualizar o lembrete.'); }
    finally { saving.current = false; setBusy(false); }
  };
  const groups = [['atrasados', 'Atrasados'], ['hoje', 'Hoje'], ['proximos', 'Próximos dias']];
  const bookings = leads.filter(lead => leadBooking(lead)).sort((a, b) => String(leadBooking(a).starts_at).localeCompare(String(leadBooking(b).starts_at)));
  const alertAfter = storeSync.getSettings?.()?.leadAlertMinutes || 60;
  const overdue = leads.filter(lead => leadUnanswered(lead, now.getTime(), alertAfter));
  const completed = items.filter(item => Boolean(item.completed));

  return <div className="space-y-6" data-merchant-agenda>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Agenda e próximas ações</h1><p className="mt-1 text-sm text-slate-600">Organize lembretes da loja, próximos contatos e pedidos de visita.</p></div>
      <button type="button" onClick={() => { setForm(emptyForm()); setShowForm(true); setError(''); }} className="min-h-11 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Novo lembrete</button></div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {feedback && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{feedback}</p>}
    {showForm && <form onSubmit={save} aria-label="Lembrete da agenda" className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
      <h2 className="font-bold text-slate-900 sm:col-span-2">{form.id ? 'Editar lembrete' : 'Novo lembrete'}</h2>
      <label className="text-sm text-slate-700">O que precisa ser feito?<input name="title" required maxLength={200} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="Ex.: revisar documentação" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900" /></label>
      <label className="text-sm text-slate-700">Data e hora<input name="due_at" type="datetime-local" required value={form.due_at} onChange={event => setForm({ ...form, due_at: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900" /></label>
      <div className="flex flex-wrap gap-2 sm:col-span-2"><button disabled={busy} type="submit" className="min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Salvar lembrete</button><button type="button" onClick={() => { setShowForm(false); setForm(emptyForm()); }} className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700">Cancelar</button></div>
    </form>}
    <section className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="font-bold text-slate-900">Próxima ação de um contato</h2><p className="mt-1 text-sm text-slate-600">Selecione um contato para criar ou alterar sua próxima ação sem sair da agenda.</p>
      <label className="mt-3 block max-w-lg text-sm text-slate-700">Contato<select aria-label="Contato para próxima ação" value={selectedLead} onChange={event => setSelectedLead(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"><option value="">Selecione um contato</option>{leads.filter(lead => !['ganho', 'perdido'].includes(lead.status)).map(lead => <option key={lead.id} value={lead.id}>{lead.name} · {lead.phone}</option>)}</select></label>
      {leads.filter(lead => String(lead.id) === selectedLead).map(lead => <LeadActionForm key={`${lead.id}-${lead.next_action_at || ''}`} lead={lead} storeKey={storeKey} onSaved={setLeads} />)}
    </section>
    {overdue.length > 0 && <p className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800">{overdue.length} contato(s) novo(s) sem resposta há pelo menos {alertAfter} minutos.</p>}
    <div className="grid gap-4 lg:grid-cols-3">{groups.map(([group, label]) => {
      const actions = leads.filter(lead => leadDueGroup(lead, now) === group).sort((a, b) => String(a.next_action_at).localeCompare(String(b.next_action_at)));
      const groupReminders = items.filter(item => !item.completed && dueGroup(item, now) === group).sort((a, b) => String(a.due_at).localeCompare(String(b.due_at)));
      return <section key={group} className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="font-bold text-slate-900">{label} <span className="text-slate-500">({actions.length + groupReminders.length})</span></h2>
        {!actions.length && !groupReminders.length && <p className="mt-3 text-sm text-slate-500">Nenhum compromisso.</p>}
        <ul className="mt-3 space-y-3">{groupReminders.map(item => <li key={`reminder-${item.id}`} className="border-t border-slate-100 pt-3 text-sm text-slate-800"><strong>{item.title}</strong><p className="text-slate-500">{new Date(item.due_at).toLocaleString('pt-BR')}</p><div className="mt-2 flex flex-wrap gap-3"><button disabled={busy} type="button" onClick={() => changeReminder(item)} className="font-semibold text-blue-700">Concluir</button><button type="button" onClick={() => { setForm({ ...item, due_at: localDateTime(item.due_at) }); setShowForm(true); setError(''); }} className="font-semibold text-blue-700">Editar</button><button disabled={busy} type="button" onClick={() => changeReminder(item, true)} className="font-semibold text-rose-700">Excluir</button></div></li>)}
          {actions.map(lead => <li key={`lead-${lead.id}`} className="border-t border-slate-100 pt-3 text-sm text-slate-800"><strong>{lead.name}</strong><p>{lead.next_action}</p><p className="text-slate-500">{new Date(lead.next_action_at).toLocaleString('pt-BR')}</p><LeadActionForm key={`${lead.id}-${lead.next_action_at}`} lead={lead} storeKey={storeKey} onSaved={setLeads} /></li>)}
        </ul></section>;
    })}</div>
    {completed.length > 0 && <details className="rounded-2xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer font-bold text-slate-900">Lembretes concluídos ({completed.length})</summary><ul className="mt-3 space-y-3">{completed.map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm text-slate-700"><span>{item.title} · {new Date(item.due_at).toLocaleString('pt-BR')}</span><span className="flex gap-3"><button disabled={busy} type="button" onClick={() => changeReminder(item)} className="font-semibold text-blue-700">Reabrir</button><button disabled={busy} type="button" onClick={() => changeReminder(item, true)} className="font-semibold text-rose-700">Excluir</button></span></li>)}</ul></details>}
    <section className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="font-bold text-slate-900">Solicitações de visita e test drive</h2><p className="mt-1 text-xs text-slate-500">Confirme os horários com os clientes; os pedidos não reservam horários automaticamente.</p>{bookings.length ? <ul className="mt-4 divide-y divide-slate-100">{bookings.map(lead => { const booking = leadBooking(lead); return <li key={lead.id} className="py-3 text-sm text-slate-700"><strong>{booking.type === 'visita' ? 'Visita' : 'Test drive'} · {lead.name}</strong><p>{new Date(booking.starts_at).toLocaleString('pt-BR')} · {lead.vehicle_title || 'Veículo a definir'} · {lead.phone}</p></li>; })}</ul> : <p className="mt-3 text-sm text-slate-500">Nenhuma solicitação recebida.</p>}</section>
  </div>;
}
