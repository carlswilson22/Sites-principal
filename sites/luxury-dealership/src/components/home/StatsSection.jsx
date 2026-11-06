import React from 'react';
import { Award, Shield, CheckCircle2, DollarSign } from 'lucide-react';

export function StatsSection() {
  const stats = [
    { valor: "R$ 180M+", rotulo: "Negociados em Superesportivos", icone: DollarSign },
    { valor: "100%", rotulo: "Laudos Cautelares Aprovados", icone: Shield },
    { valor: "12 Anos", rotulo: "De Liderança no Mercado Private", icone: Award },
    { valor: "27 Estados", rotulo: "Atendidos com Entrega Plataforma", icone: CheckCircle2 }
  ];

  return (
    <section className="border-y border-white/10 bg-[#07080e]/90 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, idx) => {
            const Icon = s.icone;
            return (
              <div key={idx} className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20 mb-2">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-heading text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
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
