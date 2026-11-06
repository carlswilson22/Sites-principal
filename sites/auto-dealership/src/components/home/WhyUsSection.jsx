import React from 'react';
import { ShieldCheck, Award, Zap, Wrench, FileCheck, ThumbsUp } from 'lucide-react';

export function WhyUsSection() {
  const differentials = [
    {
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/60 border-emerald-500/30',
      title: 'Perícia Cautelar 100% Aprovada',
      description: 'Todos os veículos passam por varredura pericial de estrutura, lataria, histórico de sinistro, leilão e integridade de chassi.'
    },
    {
      icon: Award,
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/60 border-blue-500/30',
      title: '1 Ano de Garantia Completa',
      description: 'Cobertura mecânica para motor e transmissão com assistência 24h e guincho em todo o território nacional.'
    },
    {
      icon: Wrench,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/60 border-amber-500/30',
      title: 'Revisão Preventiva de 120 Itens',
      description: 'Troca preventiva de óleo, filtros, higienização de ar-condicionado, polimento e cristalização antes de cada entrega.'
    },
    {
      icon: Zap,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/60 border-purple-500/30',
      title: 'Aprovação de Crédito em 15 Minutos',
      description: 'Parceria com os principais bancos e financeiras garantindo taxas competitivas e até 60 dias para a primeira parcela.'
    }
  ];

  return (
    <section id="sobre" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16">
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
          Transparência & Confiabilidade
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
          Por que comprar na AutoElite Motors?
        </h2>
        <p className="text-slate-400 text-sm">
          Aliamos o padrão dos melhores showrooms do país à tecnologia de perícia automotiva digital para garantir uma compra 100% segura.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {differentials.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between space-y-4 hover:translate-y-[-2px]"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${item.bgColor}`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="font-heading font-bold text-lg text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
