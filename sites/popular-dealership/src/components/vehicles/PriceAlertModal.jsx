import { siteAnalytics } from '../../../../../packages/merchant-core/src/services/siteAnalytics.js';
import { useDialog } from '../../../../../packages/merchant-core/src/components/common/useDialog';
import { storeSync } from '../../../../../packages/merchant-core/src/services/storeSync';
import { validatePriceAlert } from '../../utils/priceAlert';
import { useId, useRef } from 'react';
﻿import React, { useState } from 'react';
import { X, Bell, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { buildPriceAlertWhatsappLink } from '../../utils/whatsapp';

export function PriceAlertModal({ vehicle, onClose }) {
  const dialogRef = useDialog(onClose);
  const id = useId();
  const submitting = useRef(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [targetPrice, setTargetPrice] = useState(Math.round(vehicle.preco * 0.95));
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (!vehicle) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting.current || sent) return;
    submitting.current = true;
    let url;
    try {
      const contact = validatePriceAlert({ name: nome, phone: telefone, targetPrice }, vehicle.preco);
      url = buildPriceAlertWhatsappLink({ vehicle, targetPrice: contact.targetPrice, nome: contact.name, telefone: contact.phone });
      storeSync.addLead('apexluxury', { name: contact.name, phone: contact.phone, source: 'alerta_preco', vehicle_id: vehicle.id, vehicle_title: vehicle.nome, message: `Interesse em condição de preço: ${formatCurrency(contact.targetPrice)} para ${vehicle.nome}.`, targetPrice: contact.targetPrice });
    } catch (failure) {
      submitting.current = false;
      setError(failure.message || 'Não foi possível registrar seu interesse.');
      return;
    }
    setError('');
    siteAnalytics.track('apexluxury', { type: 'whatsapp_click', page: 'alerta-preco', vehicleId: vehicle?.id });
    window.open(url, '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} tabIndex={-1} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 id={`${id}-title`} className="font-heading text-base font-bold text-white">Interesse em condição de preço</h3>
          </div>
          <button
            type="button"
            aria-label="Fechar alerta de preço"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <p className="text-xs text-slate-300">
            Deseja ser avisado se o valor do <strong className="text-white">{vehicle.nome}</strong> baixar? Defina seu valor desejado:
          </p>
          <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Preço Atual:</span>
            <span className="font-bold text-white">{formatCurrency(vehicle.preco)}</span>
          </div>
        </div>

        {sent ? (
          <div role="status" className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs text-center flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span>Interesse registrado neste navegador. Continue no WhatsApp para enviar a mensagem e combinar o retorno com a loja.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {error && <p role="alert" className="text-rose-300">{error}</p>}
            <div>
              <label htmlFor={`${id}-name`} className="text-slate-300 block mb-1">Seu Nome</label>
              <input
                id={`${id}-name`}
                type="text"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                placeholder="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label htmlFor={`${id}-phone`} className="text-slate-300 block mb-1">Seu WhatsApp</label>
              <input
                id={`${id}-phone`}
                type="tel"
                maxLength={24}
                autoComplete="tel"
                required
                placeholder="(61) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label htmlFor={`${id}-price`} className="text-slate-300 block mb-1">Preço Alvo Desejado</label>
              <input
                id={`${id}-price`}
                type="number"
                required
                min="0.01"
                max={vehicle.preco}
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono font-bold"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              className="w-full py-3"
            >
              Combinar aviso com a loja
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
