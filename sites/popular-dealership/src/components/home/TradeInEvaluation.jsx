import { siteAnalytics } from '../../../../../packages/merchant-core/src/services/siteAnalytics.js';
import { useRef } from 'react';
﻿import React, { useState } from 'react';
import { ArrowLeftRight, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { dealershipInfo } from '../../data/dealershipInfo';
import { submitTradeInLead } from '../../../../../packages/merchant-core/src/services/tradeInLead';
import { validateStoreRequest } from '../../../../../packages/merchant-core/src/utils/concierge';
import { isRemote } from '../../../../../packages/merchant-core/src/services/remote';

export function TradeInEvaluation({ vehicles = [] }) {
  const [formData, setFormData] = useState({
    nome: '', telefone: '', consent: false,
    marca: '',
    modelo: '',
    ano: '2020',
    km: '',
    interesse: '',
    observacoes: ''
  });
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const lock = useRef(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lock.current || sent) return;
    try {
      validateStoreRequest({ name: formData.nome, phone: formData.telefone });
      if (!formData.consent || !formData.marca.trim() || !formData.modelo.trim()) throw new Error('Preencha o veículo e autorize o contato da loja.');
    } catch (failure) { setError(failure.message); return; }
    const text = 
      `🔄 *Avaliação de Usado - ${dealershipInfo.nome}*\n\n` +
      `• *Cliente:* ${formData.nome}\n` +
      `• *Telefone:* ${formData.telefone}\n` +
      `• *Meu Carro:* ${formData.marca} ${formData.modelo} (${formData.ano})\n` +
      `• *Quilometragem:* ${formData.km} km\n` +
      `• *Interesse em:* ${formData.interesse || 'Veículos do estoque'}\n` +
      `• *Observações:* ${formData.observacoes || 'Nenhuma'}\n\n` +
      `Gostaria de uma pré-avaliação para troca com troco!`;
    const url = `https://wa.me/${dealershipInfo.whatsapp}?text=${encodeURIComponent(text)}`;
    setWhatsappUrl(url); setError(''); setBusy(true); lock.current = true;
    try {
      const saving = submitTradeInLead('apexluxury', formData);
      try { window.open(url, '_blank', 'noopener,noreferrer'); siteAnalytics.track('apexluxury', { type: 'whatsapp_click', page: 'troca' }); } catch { /* O link abaixo continua disponível. */ }
      await saving;
      setSent(true);
    } catch (failure) { setError(failure.message || 'Não foi possível registrar o contato. Tente novamente.'); }
    finally { lock.current = false; setBusy(false); }
  };

  return (
    <section className="p-6 sm:p-10 rounded-3xl bg-[#090d16] border border-slate-800 shadow-xl relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-6 text-center sm:text-left">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Avaliação com Troca com Troco</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Avalie seu Usado e Saia de Carro Novo
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Garantimos avaliação justa baseada na FIPE. Se sobrar valor, pagamos a diferença na hora via Pix!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <label className="text-xs text-slate-300">Nome completo *<input name="nome" required minLength={2} autoComplete="name" value={formData.nome} onChange={handleChange} className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white" /></label>
          <label className="text-xs text-slate-300">Telefone / WhatsApp *<input name="telefone" required type="tel" autoComplete="tel" maxLength={24} value={formData.telefone} onChange={handleChange} className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white" /></label>
          <div>
            <label className="text-xs text-slate-300 block mb-1">Marca *</label>
            <input
              type="text"
              name="marca"
              required
              placeholder="Ex: Chevrolet, Fiat, VW..."
              value={formData.marca}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Modelo & Versão *</label>
            <input
              type="text"
              name="modelo"
              required
              placeholder="Ex: Onix 1.0, HB20, Gol..."
              value={formData.modelo}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Ano de Fabricação</label>
            <input
              type="text"
              name="ano"
              placeholder="Ex: 2020/2021"
              value={formData.ano}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Quilometragem Aproximada</label>
            <input
              type="text"
              name="km"
              placeholder="Ex: 45.000 km"
              value={formData.km}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-slate-300 block mb-1">Carro de Interesse</label>
            <input
              type="text"
              name="interesse"
              placeholder="Ex: Tracker Premier, Pulse, Corolla Cross..."
              value={formData.interesse}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <label className="sm:col-span-2 text-xs text-slate-300">Observações<textarea name="observacoes" rows={3} value={formData.observacoes} onChange={handleChange} className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white" /></label>
          <label className="sm:col-span-2 flex items-start gap-2 text-sm text-slate-300"><input type="checkbox" name="consent" required checked={formData.consent} onChange={handleChange} className="mt-1" />Autorizo a loja a entrar em contato sobre a avaliação.</label>
          {error && <p role="alert" className="sm:col-span-2 text-sm text-rose-300">{error}</p>}
          {sent && <p role="status" className="sm:col-span-2 text-sm text-emerald-300">{isRemote ? 'Solicitação registrada para a loja.' : 'Solicitação registrada no painel deste navegador.'}</p>}
          {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="sm:col-span-2 text-sm underline">Abrir conversa no WhatsApp</a>}
          <div className="sm:col-span-2 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={Send}
              disabled={busy || sent}
              className="w-full py-3.5 font-bold"
            >
              {busy ? 'Registrando…' : sent ? 'Solicitação registrada' : 'Tenho interesse'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
