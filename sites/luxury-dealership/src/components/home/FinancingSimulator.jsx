import React, { useState } from 'react';
import { Calculator, ArrowRight, ShieldCheck, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { buildFinancingWhatsappLink } from '../../utils/whatsapp';

export function FinancingSimulator({ vehicles = [], preselectedVehicle = null }) {
  const defaultPrice = preselectedVehicle ? preselectedVehicle.preco : (vehicles[0]?.preco || 2500000);
  const defaultVehicle = preselectedVehicle || vehicles[0] || null;

  const [selectedVehicle, setSelectedVehicle] = useState(defaultVehicle);
  const [vehicleValue, setVehicleValue] = useState(defaultPrice);
  const [downPayment, setDownPayment] = useState(Math.round(defaultPrice * 0.3));
  const [term, setTerm] = useState(48);

  const handleVehicleSelect = (e) => {
    const vId = Number(e.target.value);
    const found = vehicles.find(v => v.id === vId);
    if (found) {
      setSelectedVehicle(found);
      setVehicleValue(found.preco);
      setDownPayment(Math.round(found.preco * 0.3));
    }
  };

  const financedAmount = Math.max(vehicleValue - downPayment, 0);
  const monthlyRate = 0.0125; // 1,25% ao mês taxa VIP Private
  const monthlyPayment = financedAmount > 0 
    ? Math.round((financedAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term)))
    : 0;

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
                value={selectedVehicle?.id || ''}
                onChange={handleVehicleSelect}
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
                min="500000"
                max="5000000"
                step="50000"
                value={vehicleValue}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setVehicleValue(val);
                  if (downPayment > val) setDownPayment(Math.round(val * 0.3));
                }}
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
                min={Math.round(vehicleValue * 0.2)}
                max={Math.round(vehicleValue * 0.8)}
                step="25000"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
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

          <Button
            variant="gold"
            size="lg"
            icon={ArrowRight}
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 text-center justify-center"
          >
            Solicitar Pré-Aprovação VIP
          </Button>
        </div>
      </div>
    </section>
  );
}
