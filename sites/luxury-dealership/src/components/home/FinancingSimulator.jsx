import React, { useState } from 'react';
import { useFinancingSimulation } from '../../../../../packages/merchant-core/src/hooks/useFinancingSimulation';
import { Calculator, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { buildFinancingWhatsappLink } from '../../utils/whatsapp';
import { storeSync } from '../../../../../packages/merchant-core/src';

export function FinancingSimulator({ vehicles = [], preselectedVehicle = null }) {
  const {
    selectedVehicle, price: vehicleValue, downPayment, term, setTerm, setPrice,
    setDownPayment, selectVehicle, bounds, minimumDownPayment, maximumDownPayment,
    financedAmount, monthlyPayment
  } = useFinancingSimulation({
    vehicles, preselectedVehicle, fallbackPrice: 2500000, downPaymentRatio: 0.3, minimumDownPaymentRatio: 0.2, monthlyRate: 0.0125
  });

  const [contact, setContact] = useState({ name: '', phone: '' });

  const handleRequest = (event) => {
    event.preventDefault();
    const lead = {
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      vehicle_id: selectedVehicle?.id,
      vehicle_title: selectedVehicle?.nome,
      vehicle_price: vehicleValue,
      source: 'simulador_financiamento',
      simulation_data: { valorVeiculo: vehicleValue, entrada: downPayment, parcelas: term, valorParcela: monthlyPayment }
    };
    storeSync.addLead('drivenow', lead);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const whatsappUrl = buildFinancingWhatsappLink({
    vehicle: selectedVehicle,
    vehicleName: selectedVehicle?.nome || 'Superesportivo Apex',
    valor: vehicleValue,
    entrada: downPayment,
    parcelas: term,
    valorParcela: monthlyPayment
  });

  return (
    <section className="relative p-6 sm:p-10 rounded-3xl bg-[#0a0b12] border border-amber-500/30 shadow-2xl overflow-hidden">
      {/* Glow de Fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Painel Esquerdo: Controles */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Private Banking & Financiamento Premium</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              Simulador de Aquisição VIP
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Condições sob medida com as menores taxas do mercado private para pessoas físicas e frotas corporativas.
            </p>
          </div>

          {vehicles.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wider">
                Selecione o Veículo do Acervo
              </label>
              <select
                aria-label="Veículo para simulação"
                value={selectedVehicle?.id ?? ''}
                onChange={event => selectVehicle(event.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                    {v.nome} - {formatCurrency(v.preco)} ({v.ano})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sliders de Valor e Entrada */}
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-2 font-medium">
                <span className="text-slate-400">Valor do Veículo:</span>
                <span className="font-bold text-amber-300 font-mono">{formatCurrency(vehicleValue)}</span>
              </div>
              <input
                type="range"
                aria-label="Valor do veículo"
                min={bounds.minimum}
                max={bounds.maximum}
                step="0.01"
                value={vehicleValue}
                onChange={event => setPrice(event.target.value)}
                className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-2 font-medium">
                <span className="text-slate-400">Entrada Sugerida (Min. 20%):</span>
                <span className="font-bold text-white font-mono">{formatCurrency(downPayment)}</span>
              </div>
              <input
                type="range"
                aria-label="Valor da entrada"
                min={minimumDownPayment}
                max={maximumDownPayment}
                step="0.01"
                value={downPayment}
                onChange={event => setDownPayment(event.target.value)}
                className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Prazos */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2 uppercase tracking-wider">
              Prazo de Financiamento
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[12, 24, 36, 48].map((meses) => (
                <button
                  key={meses}
                  onClick={() => setTerm(meses)}
                  className={`py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                    term === meses
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20 font-bold'
                      : 'bg-black/50 text-slate-300 border-white/10 hover:border-amber-500/40'
                  }`}
                >
                  {meses}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Painel Direito: Resumo e Pré-Aprovação */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-black/80 border border-amber-500/30 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block">
              Parcela Estimada ({term} meses)
            </span>
            <div className="font-heading text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
              {formatCurrency(monthlyPayment)}
              <span className="text-xs sm:text-sm text-slate-400 font-normal"> /mês</span>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/10 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Saldo a Financiar:</span>
                <span className="font-mono text-white">{formatCurrency(financedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Taxa Estimada:</span>
                <span className="text-amber-400 font-semibold">1,25% a.m. (Private)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Aprovação:</span>
                <span className="text-emerald-400 font-semibold">Em até 2 horas</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleRequest} className="space-y-3">
            <label className="block text-xs text-slate-300">
              Nome completo
              <input required minLength={2} autoComplete="name" value={contact.name} onChange={event => setContact({ ...contact, name: event.target.value })} className="mt-1 w-full p-3 rounded-xl bg-black border border-white/20 text-white" />
            </label>
            <label className="block text-xs text-slate-300">
              Telefone / WhatsApp
              <input required type="tel" autoComplete="tel" pattern="[+0-9\(\) .\-]{10,20}" value={contact.phone} onChange={event => setContact({ ...contact, phone: event.target.value })} className="mt-1 w-full p-3 rounded-xl bg-black border border-white/20 text-white" />
            </label>
            <Button
              variant="gold"
              size="lg"
              icon={ArrowRight}
              type="submit"
              className="w-full py-4 text-center justify-center"
            >
              Solicitar Pré-Aprovação VIP
            </Button>
            <p className="text-[10px] text-slate-500 text-center leading-tight mt-2.5">
              * Simulação preliminar com juros compostos (Tabela Price), sujeita à análise de crédito pelas instituições bancárias parceiras.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
