import { siteAnalytics } from '../../../../../packages/merchant-core/src/services/siteAnalytics.js';
import React, { useRef, useState } from 'react';
import { ArrowLeftRight, Shield, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { buildTradeInWhatsappLink } from '../../utils/whatsapp';
import { submitTradeInLead } from '../../../../../packages/merchant-core/src/services/tradeInLead';
import { validateStoreRequest } from '../../../../../packages/merchant-core/src/utils/concierge';
import { isRemote } from '../../../../../packages/merchant-core/src/services/remote';

export function TradeInEvaluation({ vehicles = [] }) {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    marca: '',
    modelo: '',
    ano: '2022',
    km: '',
    blindado: false,
    interesse: '',
    observacoes: '', consent: false
  });
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const lock = useRef(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lock.current || sent) return;
    try {
      validateStoreRequest({ name: formData.nome, phone: formData.telefone });
      if (!formData.consent || !formData.marca.trim() || !formData.modelo.trim()) throw new Error('Preencha o veículo e autorize o contato da loja.');
    } catch (failure) { setError(failure.message); return; }
    const url = buildTradeInWhatsappLink(formData);
    setWhatsappUrl(url); setError(''); setBusy(true); lock.current = true;
    try {
      const saving = submitTradeInLead('drivenow', formData);
      try { window.open(url, '_blank', 'noopener,noreferrer'); siteAnalytics.track('drivenow', { type: 'whatsapp_click', page: 'troca' }); } catch { /* O link abaixo continua disponível. */ }
      await saving;
      setSent(true);
    } catch (failure) { setError(failure.message || 'Não foi possível registrar o contato. Tente novamente.'); }
    finally { lock.current = false; setBusy(false); }
  };

  return (
    <section className="p-6 sm:p-10 rounded-3xl bg-[#0a0b12] border border-white/10 shadow-xl relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-6 text-center sm:text-left">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Avaliação de Alto Padrão</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Avalie seu Superesportivo ou Blindado na Troca
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Receba a melhor proposta do mercado com valorização acima da FIPE para modelos premium com laudo aprovado.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <label className="text-xs text-slate-300">
            Nome completo *
            <input name="nome" required minLength={2} autoComplete="name" value={formData.nome} onChange={handleChange} className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-300">
            Telefone / WhatsApp *
            <input name="telefone" required type="tel" autoComplete="tel" pattern="[+0-9\(\) .\-]{10,20}" value={formData.telefone} onChange={handleChange} className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white" />
          </label>
          <div>
            <label className="text-xs text-slate-300 block mb-1">Marca do Veículo *</label>
            <input
              type="text"
              name="marca"
              required
              placeholder="Ex: Porsche, BMW, Mercedes..."
              value={formData.marca}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Modelo & Versão *</label>
            <input
              type="text"
              name="modelo"
              required
              placeholder="Ex: 911 Carrera S, M3 Competition..."
              value={formData.modelo}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Ano de Fabricação</label>
            <input
              type="text"
              name="ano"
              placeholder="Ex: 2022/2023"
              value={formData.ano}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Quilometragem Aproximada</label>
            <input
              type="text"
              name="km"
              placeholder="Ex: 15.000 km"
              value={formData.km}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-slate-300 block mb-1">Veículo de Interesse em Nosso Showroom</label>
            <input
              type="text"
              name="interesse"
              placeholder="Ex: Ferrari F8, Porsche GT3 RS..."
              value={formData.interesse}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <label className="sm:col-span-2 text-xs text-slate-300">
            Observações
            <textarea name="observacoes" rows={3} value={formData.observacoes} onChange={handleChange} className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white" />
          </label>
          <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
            <input
              type="checkbox"
              id="blindado-check"
              name="blindado"
              checked={formData.blindado}
              onChange={handleChange}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
            <label htmlFor="blindado-check" className="text-xs text-slate-300 cursor-pointer flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>O veículo possui blindagem balística certificada (Nível III-A)</span>
            </label>
          </div>

          <label className="sm:col-span-2 flex items-start gap-2 text-sm text-slate-300"><input type="checkbox" name="consent" required checked={formData.consent} onChange={handleChange} className="mt-1" />Autorizo a loja a entrar em contato sobre a avaliação.</label>
          {error && <p role="alert" className="sm:col-span-2 text-sm text-rose-300">{error}</p>}
          {sent && <p role="status" className="sm:col-span-2 text-sm text-emerald-300">{isRemote ? 'Solicitação registrada para a loja.' : 'Solicitação registrada no painel deste navegador.'}</p>}
          {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="sm:col-span-2 text-sm underline">Abrir conversa no WhatsApp</a>}
          <div className="sm:col-span-2 pt-2">
            <Button
              type="submit"
              variant="gold"
              size="lg"
              icon={Send}
              disabled={busy || sent}
              className="w-full py-3.5"
            >
              {busy ? 'Registrando…' : sent ? 'Solicitação registrada' : 'Tenho interesse'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
