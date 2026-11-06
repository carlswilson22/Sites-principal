import React from 'react';
import { ShieldCheck, Bot, Zap, ArrowLeftRight } from 'lucide-react';

export function WhyUsSection() {
  const pillars = [
    {
      icon: Bot,
      title: "Inteligência Artificial de Estoque",
      desc: "Algoritmo exclusivo que compara consumo, TCO anual e desvalorização para garantir a compra mais inteligente."
    },
    {
      icon: ShieldCheck,
      title: "Laudo Cautelar Digital Certificado",
      desc: "100% dos carros com laudo pericial liberado para consulta pública, sem leilão, sem sinistro e com km real."
    },
    {
      icon: Zap,
      title: "Aprovação Imediata sem Burocracia",
      desc: "Trabalhamos com os 10 maiores bancos do país com condições facilitadas, inclusive para autônomos."
    },
    {
      icon: ArrowLeftRight,
      title: "Troca com Troco no Pix",
      desc: "Avaliamos seu veículo usado de forma transparente e pagamos a diferença à vista direto na sua conta."
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold block mb-2">Diferenciais DriveNow</span>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
          A Maneira Mais Segura e Inteligente de Comprar
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Tecnologia a favor da transparência automotiva. Saiba exatamente o que está comprando.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-6 rounded-3xl bg-[#090d16] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
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
