import React from 'react';
import { Award, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

export function StatsSection() {
  const stats = [
    { valor: "+1.200", rotulo: "Veículos Entregues", icone: CheckCircle2 },
    { valor: "15 Min", rotulo: "Tempo Médio de Aprovação", icone: Zap },
    { valor: "100%", rotulo: "Laudos Cautelares Aprovados", icone: ShieldCheck },
    { valor: "10 Bancos", rotulo: "Parceiros Oficiais com Melhores Taxas", icone: Award }
  ];

  return (
    <section className="border-y border-slate-800 bg-[#070a12] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, idx) => {
            const Icon = s.icone;
            return (
              <div key={idx} className="space-y-1.5 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/20 mb-2">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-heading text-2xl sm:text-3xl font-black text-white">
                  {s.valor}
                </div>
                <p className="text-xs text-slate-400 font-medium">{s.rotulo}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
