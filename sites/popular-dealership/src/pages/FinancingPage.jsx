import React from 'react';
import { FinancingSimulator } from '../components/home/FinancingSimulator';
import { Calculator, ShieldCheck, Zap, Building2 } from 'lucide-react';

export function FinancingPage({ vehicles, preselectedVehicle }) {
  return (
    <div className="pt-24 pb-20 space-y-12">
      <div className="border-b border-slate-800 bg-gradient-to-b from-cyan-950/20 via-[#070a12] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Crédito Inteligente & Rápido</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Simulador de Financiamento
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Trabalhamos com os 10 maiores bancos com aprovação facilitada e primeira parcela para até 60 dias.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <FinancingSimulator vehicles={vehicles} preselectedVehicle={preselectedVehicle} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#090d16] border border-slate-800 space-y-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            <h4 className="font-bold text-white text-sm">Aprovação em até 15 Minutos</h4>
            <p className="text-xs text-slate-400">Resposta rápida diretamente no seu WhatsApp sem burocracia.</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#090d16] border border-slate-800 space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h4 className="font-bold text-white text-sm">Sem Comprovante de Renda</h4>
            <p className="text-xs text-slate-400">Opções com análise de crédito simplificada para autônomos e MEI.</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#090d16] border border-slate-800 space-y-2">
            <Building2 className="w-6 h-6 text-cyan-400" />
            <h4 className="font-bold text-white text-sm">Entrada Facilitada no Cartão</h4>
            <p className="text-xs text-slate-400">Parcele sua entrada em até 18x ou use seu carro usado como entrada.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
