import React from 'react';
import { Shield, Truck, KeyRound, Award, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { buildGeneralWhatsappLink } from '../utils/whatsapp';

export function ConciergePage() {
  const whatsappUrl = buildGeneralWhatsappLink("Olá, gostaria de falar com o Concierge VIP sobre encomenda e busca personalizada de veículo.");

  const services = [
    {
      icon: KeyRound,
      title: "Busca e Importação sob Encomenda",
      desc: "Localizamos a configuração exata do veículo desejado no Brasil ou no exterior, com todo o trâmite aduaneiro, homologação e transporte segurado."
    },
    {
      icon: Shield,
      title: "Consultoria em Blindagem III-A",
      desc: "Análise pericial de blindagens existentes ou direcionamento para blindadoras homologadas com as melhores tecnologias balísticas leves."
    },
    {
      icon: Truck,
      title: "Logística em Caminhão Prancha Fechado",
      desc: "Transporte porta a porta com sigilo absoluto, sem exposição do veículo em carretas abertas e com seguro de 100% da FIPE/valor venal."
    },
    {
      icon: Award,
      title: "Certificação e Vistoria Prévia VIP",
      desc: "Envio de perito técnico exclusivo para inspecionar veículos antes de fechar a negociação em qualquer estado do país."
    }
  ];

  return (
    <div className="pt-24 pb-20 space-y-16">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-amber-500/10 via-[#050508] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Serviços Sob Medida</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Apex Concierge VIP
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Assessoria automotiva personalizada para aquisição, blindagem, logística e gestão patrimonial de superesportivos.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="p-8 rounded-3xl bg-[#0a0b12] border border-white/10 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-500/20 via-[#0a0b12] to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-heading text-2xl font-bold text-white">Deseja falar diretamente com nosso Concierge-Chefe?</h3>
            <p className="text-xs sm:text-sm text-slate-300 font-light">
              Atendimento exclusivo para novos clientes, colecionadores e investidores automotivos.
            </p>
          </div>
          <Button
            variant="gold"
            size="lg"
            icon={MessageCircle}
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            Iniciar Conversa Sigilosa
          </Button>
        </div>
      </div>
    </div>
  );
}
