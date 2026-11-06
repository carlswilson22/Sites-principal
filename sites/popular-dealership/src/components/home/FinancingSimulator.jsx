import React, { useState } from 'react';
import { Calculator, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { buildFinancingWhatsappLink } from '../../utils/whatsapp';

export function FinancingSimulator({ vehicles = [], preselectedVehicle = null }) {
  const defaultPrice = preselectedVehicle ? preselectedVehicle.preco : (vehicles[0]?.preco || 95000);
  const defaultVehicle = preselectedVehicle || vehicles[0] || null;

  const [selectedVehicle, setSelectedVehicle] = useState(defaultVehicle);
  const [carPrice, setCarPrice] = useState(defaultPrice);
  const [downPayment, setDownPayment] = useState(Math.round(defaultPrice * 0.25));
  const [term, setTerm] = useState(48);

  const handleVehicleSelect = (e) => {
    const vId = Number(e.target.value);
    const found = vehicles.find(v => v.id === vId);
    if (found) {
      setSelectedVehicle(found);
      setCarPrice(found.preco);
      setDownPayment(Math.round(found.preco * 0.25));
    }
  };

  const financed = Math.max(carPrice - downPayment, 0);
  const monthlyRate = 0.0145; // 1,45% a.m.
  const monthlyPayment = financed > 0
    ? Math.round((financed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term)))
    : 0;

  const whatsappUrl = buildFinancingWhatsappLink({
    vehicle: selectedVehicle,
    vehicleName: selectedVehicle?.nome || 'Veículo DriveNow',
    valor: carPrice,
    entrada: downPayment,
    parcelas: term,
    valorParcela: monthlyPayment
  });

  return (
    <section className="relative p-6 sm:p-10 rounded-3xl bg-[#090d16] border border-cyan-500/30 shadow-2xl overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Painel Esquerdo: Controles */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador Financeiro Instantâneo</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              Calcule sua Parcela em Tempo Real
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Ajuste o valor do veículo e a entrada para encontrar a parcela ideal para o seu bolso.
            </p>
          </div>

          {vehicles.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wider">
                Selecione o Modelo para Simulação
              </label>
              <select
                value={selectedVehicle?.id || ''}
                onChange={handleVehicleSelect}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                    {v.nome} - {formatCurrency(v.preco)} ({v.ano})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sliders */}
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-2 font-medium">
                <span className="text-slate-400">Valor do Veículo:</span>
                <span className="font-bold text-cyan-300 font-mono">{formatCurrency(carPrice)}</span>
              </div>
              <input
                type="range"
                min="40000"
                max="250000"
                step="5000"
                value={carPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCarPrice(val);
                  if (downPayment > val) setDownPayment(Math.round(val * 0.25));
                }}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-2 font-medium">
                <span className="text-slate-400">Valor da Entrada:</span>
                <span className="font-bold text-white font-mono">{formatCurrency(downPayment)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.round(carPrice * 0.8)}
                step="2000"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Prazos */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2 uppercase tracking-wider">
              Número de Parcelas
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[24, 36, 48, 60].map((meses) => (
                <button
                  key={meses}
                  onClick={() => setTerm(meses)}
                  className={`py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                    term === meses
                      ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-500/40'
                  }`}
                >
                  {meses}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Painel Direito: Resumo */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-slate-950 border border-cyan-500/30 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block">
              Mensalidade Estimada ({term}x)
            </span>
            <div className="font-heading text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              {formatCurrency(monthlyPayment)}
              <span className="text-xs sm:text-sm text-slate-400 font-normal"> /mês</span>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Valor Financiado:</span>
                <span className="font-mono text-white">{formatCurrency(financed)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">1ª Parcela para:</span>
                <span className="text-emerald-400 font-semibold">Até 60 dias</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Análise de Crédito:</span>
                <span className="text-cyan-400 font-semibold">15 Minutos</span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 text-center justify-center font-bold"
          >
            Aprovar Meu Crédito no WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
