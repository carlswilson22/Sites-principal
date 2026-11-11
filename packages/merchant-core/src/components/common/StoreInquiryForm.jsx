import React, { useId, useRef, useState } from 'react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { storeSync } from '../../services/storeSync';
import { siteAnalytics } from '../../services/siteAnalytics';
import { validateStoreRequest } from '../../utils/concierge';

export function StoreInquiryForm({ dealership, storeKey, presentation = 'service' }) {
  const editorial = presentation === 'editorial';
  const classic = presentation === 'classic';
  const id = useId();
  const submitted = useRef(false);
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', assunto: 'Dúvidas sobre veículos', mensagem: '' });
  const [error, setError] = useState('');
  const [prepared, setPrepared] = useState(false);
  const update = event => { setForm(current => ({ ...current, [event.target.name]: event.target.value })); submitted.current = false; setError(''); setPrepared(false); };
  const field = editorial
    ? 'mt-2 w-full min-h-12 bg-transparent border-b border-slate-600 py-3 text-white placeholder:text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200'
    : `mt-2 w-full min-h-12 rounded-xl bg-slate-950 border border-slate-700 p-3 text-white placeholder:text-slate-500 focus-visible:outline focus-visible:outline-2 ${classic ? 'focus-visible:outline-blue-300' : 'focus-visible:outline-cyan-300'}`;
  const submit = event => {
    event.preventDefault();
    if (submitted.current) return;
    try {
      const contact = validateStoreRequest({ name: form.nome, phone: form.telefone });
      if (!form.mensagem.trim()) throw new Error('Conte como podemos ajudar.');
      submitted.current = true;
      const message = `Assunto: ${form.assunto}\n${form.mensagem.trim()}`;
      try {
        storeSync.addLead(storeKey, { ...contact, email: form.email.trim(), source: 'formulario_site', message });
      } catch { /* A conversa com a loja pode continuar mesmo sem armazenamento local. */ }
      const text = `Olá, equipe da ${dealership.nome}!\nNome: ${contact.name}\nTelefone: ${contact.phone}${form.email.trim() ? `\nE-mail: ${form.email.trim()}` : ''}\n${message}`;
      siteAnalytics.track(storeKey, { type: 'whatsapp_click', page: 'sobre-contato' });
      window.open(`https://wa.me/${String(dealership.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
      setPrepared(true);
    } catch (failure) { submitted.current = false; setError(failure.message || 'Confira seus dados e tente novamente.'); }
  };
  const contactFields = <fieldset className="min-w-0 space-y-4">
    <legend className={`mb-3 text-sm font-semibold ${editorial ? 'text-amber-200' : 'text-slate-200'}`}>{editorial ? 'Seu contato' : 'Como podemos falar com você?'}</legend>
    <div className={editorial ? 'space-y-4' : 'grid sm:grid-cols-2 gap-4'}>
      <label htmlFor={`${id}-nome`} className="block text-sm text-slate-300">Nome<input id={`${id}-nome`} name="nome" autoComplete="name" required minLength={2} maxLength={100} value={form.nome} onChange={update} placeholder="Como você se chama?" className={field} /></label>
      <label htmlFor={`${id}-telefone`} className="block text-sm text-slate-300">Telefone com DDD<input id={`${id}-telefone`} name="telefone" type="tel" autoComplete="tel" required maxLength={24} value={form.telefone} onChange={update} placeholder="(61) 90000-0000" className={field} /></label>
    </div>
    <label htmlFor={`${id}-email`} className="block text-sm text-slate-300">E-mail <span className="text-slate-500">(opcional)</span><input id={`${id}-email`} name="email" type="email" autoComplete="email" maxLength={254} value={form.email} onChange={update} placeholder="Seu e-mail" className={field} /></label>
  </fieldset>;
  const messageFields = <fieldset className="min-w-0 space-y-4">
    <legend className={`mb-3 text-sm font-semibold ${editorial ? 'text-amber-200' : 'text-slate-200'}`}>{editorial ? 'Sua próxima escolha' : 'O que você precisa?'}</legend>
    <label htmlFor={`${id}-assunto`} className="block text-sm text-slate-300">Assunto<select id={`${id}-assunto`} name="assunto" value={form.assunto} onChange={update} className={`${field} [&>option]:bg-slate-950`}><option>Dúvidas sobre veículos</option><option>Financiamento</option><option>Avaliação do usado na troca</option><option>Outros assuntos</option></select></label>
    <label htmlFor={`${id}-mensagem`} className="block text-sm text-slate-300">Mensagem<textarea id={`${id}-mensagem`} name="mensagem" required maxLength={2000} rows={editorial ? 6 : 4} value={form.mensagem} onChange={update} placeholder="Conte qual veículo chamou sua atenção ou como a equipe pode ajudar." className={`${field} resize-y`} /></label>
  </fieldset>;
  return <form aria-label={`Mensagem para ${dealership.nome}`} data-store-inquiry={storeKey} onSubmit={submit} className="space-y-6">
    {editorial ? <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-8 lg:gap-14">{contactFields}{messageFields}</div> : classic ? <>{contactFields}{messageFields}</> : <>{messageFields}{contactFields}</>}
    {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
    {prepared && <p role="status" className="text-sm text-emerald-300">Sua mensagem está pronta. Continue no WhatsApp da loja para enviá-la.</p>}
    <div className={`flex flex-col gap-4 ${editorial ? 'sm:flex-row sm:items-center sm:justify-end' : ''}`}>
      <p className="text-xs text-slate-400 max-w-xs">Ao continuar, você abre uma conversa com a equipe da loja no WhatsApp.</p>
      <button type="submit" className={`min-h-12 px-5 py-3 font-semibold inline-flex items-center justify-center gap-3 ${editorial ? 'bg-amber-200 text-slate-950 hover:bg-amber-100' : classic ? 'rounded-xl bg-blue-600 text-white hover:bg-blue-500' : 'rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200'}`}>{editorial ? <ArrowUpRight aria-hidden="true" className="w-4 h-4" /> : <MessageCircle aria-hidden="true" className="w-4 h-4" />}Falar com a equipe</button>
    </div>
  </form>;
}
