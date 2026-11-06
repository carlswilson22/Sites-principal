import React from 'react';
import { Shield, Award, Eye, Truck } from 'lucide-react';

export function WhyUsSection() {
  const pillars = [
    {
      icon: Shield,
      title: "Blindagem Balística Nível III-A",
      desc: "Veículos com proteção certificada pelo Exército Brasileiro, com laudo de vidros sem delaminação e garantia estrutural."
    },
    {
      icon: Award,
      title: "Curadoria Internacional & Rastreio",
      desc: "Histórico completo com todas as revisões em concessionárias oficiais, manual carimbado e chave cópia original."
    },
    {
      icon: Eye,
      title: "Showroom Privativo VIP",
      desc: "Visitas individuais agendadas com total sigilo, consultoria especializada e atendimento com horário exclusivo."
    },
    {
      icon: Truck,
      title: "Entrega em Plataforma Fechada",
      desc: "Logística especializada com caminhão fechado e rastreamento em tempo real direto na sua residência ou empresa."
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block mb-2">Padrão de Excelência</span>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
          Por Que Escolher a Apex Motors
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Mais do que comercializar veículos, proporcionamos segurança patrimonial, procedência absoluta e discrição para clientes exigentes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-6 rounded-3xl bg-[#0a0b12] border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
