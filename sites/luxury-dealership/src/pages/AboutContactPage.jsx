import React from 'react';
import { ArrowDown } from 'lucide-react';
import { StoreContactDetails } from '../../../../packages/merchant-core/src/components/layout/StoreContactDetails';
import { StoreVehiclePhoto } from '../../../../packages/merchant-core/src/components/layout/StoreVehiclePhoto';
import { StoreInquiryForm } from '../../../../packages/merchant-core/src/components/common/StoreInquiryForm';
import { WhyUsSection } from '../components/home/WhyUsSection';
import { dealershipInfo } from '../data/dealershipInfo';
import { vehiclesData } from '../data/vehicles';

export function AboutContactPage() {
  return <div data-about-layout="editorial" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 sm:pb-24 space-y-12 sm:space-y-20">
    <header className="grid md:grid-cols-[minmax(0,1fr)_18rem] gap-6 items-end">
      <div className="space-y-4"><p className="text-xs text-amber-200 uppercase tracking-[0.2em]">O universo {dealershipInfo.nome}</p><h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight leading-tight">Sobre Nós<br />{' '}<span className="italic text-amber-200">e Contato</span></h1></div>
      <div className="space-y-4 text-sm leading-relaxed text-slate-300"><p>Uma boa escolha começa por conhecer quem está do outro lado. Esta é a nossa maneira de receber você.</p><a href="#conversa-drivenow" className="inline-flex items-center gap-3 min-h-11 text-amber-200">Vamos conversar<ArrowDown aria-hidden="true" className="w-4 h-4" /></a></div>
    </header>

    <StoreVehiclePhoto vehicle={vehiclesData[0]} storeName={dealershipInfo.nome} imageClassName="w-full aspect-[4/3] sm:aspect-[16/7] max-h-[34rem] object-cover rounded-sm" />

    <section aria-labelledby="drivenow-story" className="grid md:grid-cols-[10rem_minmax(0,1fr)] gap-6 md:gap-12">
      <p className="text-xs tracking-[0.2em] uppercase text-amber-200 md:pt-2">01 / Nossa filosofia</p>
      <div className="max-w-3xl space-y-6"><h2 id="drivenow-story" className="font-heading text-3xl sm:text-4xl font-light text-white leading-tight">A escolha do carro.<br />O cuidado em cada conversa.</h2><div className="grid sm:grid-cols-2 gap-6 text-slate-300 leading-relaxed text-sm sm:text-base"><p>A {dealershipInfo.nome} reúne veículos e pessoas com diferentes histórias. Nossa proposta é apresentar cada opção com espaço para olhar, perguntar e entender os detalhes.</p><p>A experiência continua na conversa com a equipe: do interesse no anúncio às condições de negociação. Queremos que você tenha as informações necessárias para decidir no seu tempo.</p></div></div>
    </section>

    <WhyUsSection />

    <section id="conversa-drivenow" aria-labelledby="drivenow-contact" className="scroll-mt-44 space-y-10 sm:space-y-12">
      <div className="grid md:grid-cols-[10rem_minmax(0,1fr)] gap-6 md:gap-12"><p className="text-xs tracking-[0.2em] uppercase text-amber-200 md:pt-2">03 / Perto de você</p><div className="space-y-4"><h2 id="drivenow-contact" className="font-heading text-3xl sm:text-4xl font-light text-white">Um bom negócio começa<br />com uma boa conversa.</h2><p className="max-w-xl text-slate-400 leading-relaxed">Encontre nossos canais ou escreva uma mensagem abaixo. Para conhecer um veículo pessoalmente, combine a visita diretamente com a equipe.</p></div></div>
      <StoreContactDetails dealership={dealershipInfo} tone="amber" presentation="editorial" />
      <div className="bg-white/[0.025] p-5 sm:p-8 lg:p-10 space-y-8"><div><h3 className="text-2xl font-heading font-light text-white">Conte o que você procura.</h3><p className="mt-2 text-sm text-slate-400">Deixe sua próxima escolha começar aqui.</p></div><StoreInquiryForm dealership={dealershipInfo} storeKey="drivenow" presentation="editorial" /></div>
    </section>
  </div>;
}
