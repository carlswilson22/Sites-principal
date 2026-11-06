import React from 'react';
import { TradeInEvaluation } from '../components/home/TradeInEvaluation';
import { ArrowLeftRight, CheckCircle2, Shield } from 'lucide-react';

export function TradeInPage({ vehicles }) {
  return (
    <div className="pt-24 pb-20 space-y-12">
      <div className="border-b border-slate-800 bg-gradient-to-b from-cyan-950/20 via-[#070a12] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Troca com Troco Imediata</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Avaliação de Usado & Troca com Troco
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Avaliação justa com base na Tabela FIPE e pagamento da diferença no Pix na hora.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TradeInEvaluation vehicles={vehicles} />
      </div>
    </div>
  );
}
