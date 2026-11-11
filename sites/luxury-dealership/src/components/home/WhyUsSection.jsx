import React from 'react';

const values = [
  { title: 'Espaço para descobrir', text: 'Fotos e informações organizadas para você conhecer cada veículo antes da conversa.' },
  { title: 'Atenção à sua escolha', text: 'O atendimento começa no anúncio, com o contexto do veículo que despertou seu interesse.' },
  { title: 'Clareza para negociar', text: 'Consulte estimativas de financiamento e converse sobre a avaliação do seu usado na troca.' },
];

export function WhyUsSection() {
  return <section aria-labelledby="drivenow-values" className="grid md:grid-cols-[10rem_minmax(0,1fr)] gap-6 md:gap-12">
    <p className="text-xs tracking-[0.2em] uppercase text-amber-200 md:pt-2">02 / Nosso cuidado</p>
    <div className="space-y-8"><h2 id="drivenow-values" className="font-heading text-3xl sm:text-4xl font-light text-white">Os detalhes importam.</h2><ol className="space-y-8">{values.map((value, index) => <li key={value.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] sm:grid-cols-[2.5rem_12rem_minmax(0,1fr)] gap-x-4 gap-y-2 items-start"><span aria-hidden="true" className="text-2xl text-amber-200/60 font-light">{String(index + 1).padStart(2, '0')}</span><h3 className="text-lg text-white font-medium">{value.title}</h3><p className="col-start-2 sm:col-start-auto text-sm text-slate-400 leading-relaxed">{value.text}</p></li>)}</ol></div>
  </section>;
}
