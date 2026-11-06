import React from 'react';
import { dealershipInfo } from '../../data/dealershipInfo';
import { Award, ShieldCheck, Clock, CheckCircle } from 'lucide-react';

export function StatsSection() {
  const icons = [Award, ShieldCheck, Clock, CheckCircle];

  return (
    <section className="py-12 bg-slate-950/60 border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {dealershipInfo.metricas.map((item, idx) => {
            const IconComponent = icons[idx % icons.length];
            return (
              <div 
                key={idx}
                className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-blue-500/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
                  {item.valor}
                </span>
                <span className="text-xs sm:text-sm text-slate-400 mt-1">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
