import React from 'react';
import { Search, Scale, MessageCircle } from 'lucide-react';

const steps = [
  { title: 'Explore os veículos', Icon: Search, text: 'Use a busca e os filtros. No anúncio, consulte fotos, informações e a visualização 360° quando disponível.' },
  { title: 'Organize suas escolhas', Icon: Scale, text: 'Salve favoritos, compare veículos e consulte estimativas de parcelas e custo total.' },
  { title: 'Converse com a loja', Icon: MessageCircle, text: 'Comece pelo atendimento do anúncio. Para negociar ou combinar uma visita, continue com a equipe pelo WhatsApp.' },
];

export function WhyUsSection() {
  return <section id="como-ajudamos-enterprise" aria-labelledby="enterprise-steps" className="scroll-mt-44 space-y-6">
    <div className="space-y-2"><p className="text-xs uppercase tracking-widest text-cyan-300">Como ajudamos</p><h2 id="enterprise-steps" className="font-heading text-3xl font-bold text-white">Da pesquisa à conversa.</h2></div>
    <ol className="grid md:grid-cols-3 gap-4">{steps.map(({ title, Icon, text }, index) => <li key={title} className="rounded-2xl bg-slate-900/70 p-5 space-y-4"><div className="flex items-center justify-between"><Icon aria-hidden="true" className="w-5 h-5 text-cyan-300" /><span aria-hidden="true" className="text-xs text-slate-500">PASSO {index + 1}</span></div><h3 className="text-lg font-semibold text-white leading-snug">{title}</h3><p className="text-sm text-slate-400 leading-relaxed">{text}</p></li>)}</ol>
  </section>;
}
