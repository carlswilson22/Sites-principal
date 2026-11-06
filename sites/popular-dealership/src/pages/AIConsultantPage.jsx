import React from 'react';
import { AIChatBox } from '../components/ai/AIChatBox';
import { Bot, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export function AIConsultantPage({ vehicles, onSelectVehicle }) {
  return (
    <div className="pt-24 pb-20 space-y-12">
      <div className="border-b border-slate-800 bg-gradient-to-b from-violet-950/20 via-[#070a12] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-2">
            <Bot className="w-3.5 h-3.5" />
            <span>Consultoria Especializada por IA</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Consultor Automotivo Inteligente
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Tire dúvidas em tempo real, descubra quais carros cabem na sua parcela mensal e compare custos de combustível e manutenção.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <AIChatBox vehicles={vehicles} onSelectVehicle={onSelectVehicle} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" /> Comparação de TCO
            </span>
            <p className="text-slate-400">Analisa despesas anuais com IPVA, seguro e manutenção.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Laudo Pericial
            </span>
            <p className="text-slate-400">Recomenda apenas veículos 100% aprovados sem sinistros.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-violet-400" /> Perfil Customizado
            </span>
            <p className="text-slate-400">Indicações para trabalho, família, viagens ou economia.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
