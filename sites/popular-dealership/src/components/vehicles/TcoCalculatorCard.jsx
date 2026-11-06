import React, { useState, useMemo } from 'react';
import { Calculator, Fuel, ShieldCheck, Wrench, Building2, Gauge } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function TcoCalculatorCard({ vehicle }) {
  const [monthlyKm, setMonthlyKm] = useState(1200);
  const [fuelPrice, setFuelPrice] = useState(5.89);

  const price = vehicle?.preco || 90000;
  const ipvaRate = 0.035; // 3,5% DF
  const ipvaAnual = Math.round(price * ipvaRate);
  const seguroAnual = Math.round(price * 0.038); // 3,8% valor médio de seguro
  const revisoesAnual = 1100;

  // Consumo médio estimado
  const consumoKmL = 11.5;
  const kmAnual = monthlyKm * 12;
  const litrosAnual = kmAnual / consumoKmL;
  const combustivelAnual = Math.round(litrosAnual * fuelPrice);

  const tcoAnual = ipvaAnual + seguroAnual + revisoesAnual + combustivelAnual;
  const tcoMensal = Math.round(tcoAnual / 12);

  return (
    <div className="p-6 rounded-3xl bg-[#090d16] border border-cyan-500/30 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-1">
            <Calculator className="w-3.5 h-3.5" />
            <span>TCO • Custo Total de Posse</span>
          </div>
          <h3 className="font-heading text-lg font-bold text-white">Previsão Real de Despesas Anuais</h3>
          <p className="text-xs text-slate-400">Quanto este carro custará por ano considerando IPVA, seguro, combustível e revisões.</p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Custo Médio Mensal</span>
          <span className="font-heading text-2xl font-black text-cyan-400">{formatCurrency(tcoMensal)}<span className="text-xs text-slate-400 font-normal">/mês</span></span>
        </div>
      </div>

      {/* Controles de Simulação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-xs mb-1.5 text-slate-300">
            <span>Uso Mensal Estimado:</span>
            <span className="font-bold text-white font-mono">{monthlyKm} km/mês</span>
          </div>
          <input
            type="range"
            min="500"
            max="3000"
            step="100"
            value={monthlyKm}
            onChange={(e) => setMonthlyKm(Number(e.target.value))}
            className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5 text-slate-300">
            <span>Preço do Combustível (R$/L):</span>
            <span className="font-bold text-white font-mono">R$ {fuelPrice.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="3.50"
            max="7.50"
            step="0.10"
            value={fuelPrice}
            onChange={(e) => setFuelPrice(Number(e.target.value))}
            className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Grid de 4 Pilares do Custo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Building2 className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-300">IPVA (3,5%)</span>
          </div>
          <p className="font-heading text-base font-bold text-white">{formatCurrency(ipvaAnual)}</p>
          <span className="text-[10px] text-slate-500 block">Base DF anual</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-300">Seguro Anual</span>
          </div>
          <p className="font-heading text-base font-bold text-white">{formatCurrency(seguroAnual)}</p>
          <span className="text-[10px] text-slate-500 block">Perfil médio</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Fuel className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-300">Combustível</span>
          </div>
          <p className="font-heading text-base font-bold text-white">{formatCurrency(combustivelAnual)}</p>
          <span className="text-[10px] text-slate-500 block">{kmAnual.toLocaleString('pt-BR')} km/ano</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Wrench className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-300">Revisões</span>
          </div>
          <p className="font-heading text-base font-bold text-white">{formatCurrency(revisoesAnual)}</p>
          <span className="text-[10px] text-slate-500 block">Troca de óleo e filtros</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-between">
        <span className="text-xs text-slate-300">Total Anual Estimado de Manutenção e Custos:</span>
        <span className="font-heading text-lg font-black text-cyan-300">{formatCurrency(tcoAnual)} /ano</span>
      </div>
    </div>
  );
}
