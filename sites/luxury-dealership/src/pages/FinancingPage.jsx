import React from 'react';
import { FinancingSimulator } from '../components/home/FinancingSimulator';
import { Calculator, ShieldCheck, Award, Building2 } from 'lucide-react';

export function FinancingPage({ vehicles, preselectedVehicle }) {
  return (
    <div className="pt-24 pb-20 space-y-12">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-amber-500/10 via-[#050508] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Condições Estruturadas Private</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Simulador de Financiamento VIP
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Planos de amortização customizados com os maiores bancos de private banking do Brasil, taxas especiais e aprovação com sigilo total.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <FinancingSimulator vehicles={vehicles} preselectedVehicle={preselectedVehicle} />

        {/* Pilares do Financiamento Private */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0a0b12] border border-white/10 space-y-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h4 className="font-bold text-white text-sm">Taxas Exclusivas Private</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Condições negociadas diretamente com as mesas private de grandes instituições financeiras.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#0a0b12] border border-white/10 space-y-2">
            <Award className="w-6 h-6 text-amber-400" />
            <h4 className="font-bold text-white text-sm">Aprovação em até 2 Horas</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Processamento rápido com documentação simplificada para clientes pessoa física e jurídica.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#0a0b12] border border-white/10 space-y-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            <h4 className="font-bold text-white text-sm">Faturamento em Holding / PJ</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Estruturação patrimonial e suporte para faturamento direto em holding ou empresa patrimonial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
