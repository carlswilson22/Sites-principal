import React, { useState } from 'react';
import { ArrowLeftRight, Shield, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { buildTradeInWhatsappLink } from '../../utils/whatsapp';

export function TradeInEvaluation({ vehicles = [] }) {
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: '2022',
    km: '',
    blindado: false,
    interesse: '',
    observacoes: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = buildTradeInWhatsappLink(formData);
    window.open(url, '_blank', 'noopener,noreferrer');
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

          <div className="sm:col-span-2 pt-2">
            <Button
              type="submit"
              variant="gold"
              size="lg"
              icon={Send}
              className="w-full py-3.5"
            >
              Solicitar Avaliação Expressa no WhatsApp
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
