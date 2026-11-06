import React, { useState } from 'react';
import { X, Bell, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { buildPriceAlertWhatsappLink } from '../../utils/whatsapp';

export function PriceAlertModal({ vehicle, onClose }) {
  if (!vehicle) return null;

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [targetPrice, setTargetPrice] = useState(Math.round(vehicle.preco * 0.95));
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = buildPriceAlertWhatsappLink({ vehicle, targetPrice, nome, telefone });
    window.open(url, '_blank', 'noopener,noreferrer');
    setSent(true);
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-base font-bold text-white">Criar Alerta de Preço</h3>
          </div>
          <button
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
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs text-center flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span>Alerta registrado com sucesso! Você será avisado no WhatsApp.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Seu Nome</label>
              <input
                type="text"
                required
                placeholder="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">WhatsApp para Notificação</label>
              <input
                type="tel"
                required
                placeholder="(61) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Preço Alvo Desejado</label>
              <input
                type="number"
                required
                step="500"
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
              Ativar Alerta via WhatsApp
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
