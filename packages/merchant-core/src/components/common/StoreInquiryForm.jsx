import React, { useId, useRef, useState } from 'react';
import { storeSync } from '../../services/storeSync';
import { validateStoreRequest } from '../../utils/concierge';

export function StoreInquiryForm({ dealership, storeKey, presentation = 'service' }) {
  const id = useId();
  const lock = useRef(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const submit = async event => {
    event.preventDefault();
    if (lock.current) return;
    try {
      const contact = validateStoreRequest({ name, phone });
      if (!consent) throw new Error('Autorize o contato da loja para continuar.');
      lock.current = true; setBusy(true); setError('');
      await storeSync.addLead(storeKey, { ...contact, source: 'formulario_site', consent: true, message: 'Solicitou contato pelo site.' });
      setFeedback(storeSync.isRemote ? 'Contato registrado. A equipe da loja poderá falar com você.' : 'Contato registrado no painel deste navegador, para demonstração.');
      setName(''); setPhone(''); setConsent(false);
    } catch (failure) { setError(failure.message || 'Não foi possível registrar o contato.'); }
    finally { lock.current = false; setBusy(false); }
  };
  const field = 'mt-2 w-full min-h-12 rounded-xl border border-slate-400 bg-white px-3 text-slate-900';
  return <form aria-label={`Mensagem para ${dealership.nome}`} data-store-inquiry={storeKey} onSubmit={submit} className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2"><label htmlFor={`${id}-nome`} className="text-sm text-slate-600">Nome<input id={`${id}-nome`} name="nome" required minLength={2} maxLength={100} autoComplete="name" className={field} value={name} onChange={event => setName(event.target.value)} /></label><label htmlFor={`${id}-telefone`} className="text-sm text-slate-600">WhatsApp com DDD<input id={`${id}-telefone`} name="telefone" required type="tel" maxLength={24} autoComplete="tel" className={field} value={phone} onChange={event => setPhone(event.target.value)} /></label></div>
    <label className="flex gap-2 text-sm text-slate-600"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} />Autorizo a loja a entrar em contato comigo.</label>
    {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}{feedback && <p role="status" className="text-sm text-emerald-700">{feedback}</p>}
    <button type="submit" disabled={busy} className={`min-h-12 rounded-xl px-5 py-3 font-semibold disabled:opacity-50 ${presentation === 'editorial' ? 'bg-amber-200 text-slate-950' : presentation === 'classic' ? 'bg-blue-600 text-white' : 'bg-cyan-300 text-slate-950'}`}>{busy ? 'Enviando…' : 'Tenho interesse'}</button>
  </form>;
}
