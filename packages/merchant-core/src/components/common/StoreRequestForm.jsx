import React, { useId, useState } from 'react';
import { storeSync } from '../../services/storeSync';
import { validateStoreRequest } from '../../utils/concierge';

export function StoreRequestForm({ storeKey, context = '', vehicle = null }) {
  const id = useId();
  const [form, setForm] = useState({ name: '', phone: '', notes: '' });
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const field = 'mt-1 w-full min-h-11 p-3 rounded-xl bg-slate-950 border border-slate-600 text-white';
  const update = (key, value) => { setForm(current => ({ ...current, [key]: value })); setError(''); };
  const submit = event => {
    event.preventDefault();
    if (saved) return;
    try {
      const contact = validateStoreRequest(form);
      storeSync.addLead(storeKey, { ...contact, source: 'concierge_site', vehicle_id: vehicle?.id, vehicle_title: vehicle?.nome || vehicle?.title, message: [vehicle && `Veículo: ${vehicle.nome || vehicle.title}`, form.notes.trim(), context].filter(Boolean).join('\n') });
      setSaved(true);
      setError('');
    } catch (failure) { setError(failure.message || 'Não foi possível registrar. Tente novamente.'); }
  };
  if (saved) return <div role="status" className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-slate-200 space-y-2"><p className="font-semibold">Preferência registrada.</p><p className="text-sm">O registro está disponível no painel deste navegador. Converse com a equipe pelo WhatsApp da loja para combinar os próximos passos.</p><button type="button" onClick={() => { setSaved(false); setForm({ name: '', phone: '', notes: '' }); }} className="underline text-sm">Registrar outro pedido</button></div>;
  return <form onSubmit={submit} className="space-y-4">
    <p className="text-sm text-slate-300">Deixe sua preferência registrada no painel de atendimento.</p>
    {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
    <div className="grid sm:grid-cols-2 gap-4">
      <label htmlFor={`${id}-name`} className="text-sm text-slate-300">Nome<input id={`${id}-name`} required minLength={2} maxLength={100} autoComplete="name" value={form.name} onChange={event => update('name', event.target.value)} className={field} /></label>
      <label htmlFor={`${id}-phone`} className="text-sm text-slate-300">Telefone com DDD<input id={`${id}-phone`} required type="tel" autoComplete="tel" maxLength={24} value={form.phone} onChange={event => update('phone', event.target.value)} className={field} /></label>
    </div>
    <label htmlFor={`${id}-notes`} className="block text-sm text-slate-300">O que você procura?<textarea id={`${id}-notes`} required maxLength={1500} rows={3} value={form.notes} onChange={event => update('notes', event.target.value)} className={field} /></label>
    <button type="submit" className="min-h-11 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold">Registrar preferência</button>
  </form>;
}
