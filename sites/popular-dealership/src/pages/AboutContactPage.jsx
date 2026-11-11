import React from 'react';
import { ArrowDown, BookOpen, ListChecks, MessageCircle } from 'lucide-react';
import { StoreContactDetails } from '../../../../packages/merchant-core/src/components/layout/StoreContactDetails';
import { StoreVehiclePhoto } from '../../../../packages/merchant-core/src/components/layout/StoreVehiclePhoto';
import { StoreInquiryForm } from '../../../../packages/merchant-core/src/components/common/StoreInquiryForm';
import { WhyUsSection } from '../components/home/WhyUsSection';
import { dealershipInfo } from '../data/dealershipInfo';
import { vehiclesData } from '../data/vehicles';

const sections = [
  { href: '#historia-enterprise', label: 'Nossa história', Icon: BookOpen },
  { href: '#como-ajudamos-enterprise', label: 'Como ajudamos', Icon: ListChecks },
  { href: '#contato-enterprise', label: 'Fale com a equipe', Icon: MessageCircle },
];

export function AboutContactPage() {
  return <div data-about-layout="directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 space-y-8 sm:space-y-10">
    <header className="space-y-3"><p className="text-xs text-cyan-300 font-semibold uppercase tracking-widest">{dealershipInfo.nome} · Pessoas e atendimento</p><h1 className="font-heading text-3xl sm:text-5xl font-bold text-white tracking-tight">Sobre Nós e Contato</h1><p className="text-slate-400 max-w-2xl leading-relaxed">Conheça a loja, entenda como podemos ajudar e encontre o melhor caminho para falar com nossa equipe.</p></header>
    <div className="grid xl:grid-cols-[12rem_minmax(0,1fr)] gap-8 xl:gap-12 items-start">
      <aside className="xl:sticky xl:top-44"><nav aria-label="Nesta página" className="flex xl:flex-col gap-2 overflow-x-auto pb-2">{sections.map(({ href, label, Icon }) => <a key={href} href={href} className="shrink-0 min-h-12 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-200 px-4 py-3 flex items-center gap-3 text-sm"><Icon aria-hidden="true" className="w-4 h-4 text-cyan-300 shrink-0" />{label}</a>)}</nav></aside>
      <div className="min-w-0 space-y-12 sm:space-y-16">
        <section id="historia-enterprise" aria-labelledby="enterprise-story" className="scroll-mt-44 grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-6 lg:gap-8 items-center">
          <div className="space-y-5"><p className="text-xs uppercase tracking-widest text-cyan-300">Nossa história</p><h2 id="enterprise-story" className="text-3xl font-heading font-bold text-white leading-tight">Tecnologia para explorar.<br />Pessoas para ajudar.</h2><p className="text-slate-300 leading-relaxed">A {dealershipInfo.nome} aproxima a pesquisa online da conversa com a loja. Aqui, você pode conhecer os veículos, organizar suas opções e chegar ao atendimento com uma ideia mais clara do que procura.</p><p className="text-sm text-slate-400 leading-relaxed">As ferramentas ajudam na pesquisa. Nossa equipe está disponível para esclarecer informações, conversar sobre condições e acompanhar os próximos passos.</p><a href="#contato-enterprise" className="inline-flex min-h-11 items-center gap-2 text-sm text-cyan-300 font-semibold">Encontre nossa equipe<ArrowDown aria-hidden="true" className="w-4 h-4" /></a></div>
          <StoreVehiclePhoto vehicle={vehiclesData[0]} storeName={dealershipInfo.nome} imageClassName="w-full aspect-[4/3] object-contain bg-slate-900/60 rounded-3xl" />
        </section>

        <WhyUsSection />

        <section id="contato-enterprise" aria-labelledby="enterprise-contact" className="scroll-mt-44 space-y-6">
          <div className="space-y-2"><p className="text-xs uppercase tracking-widest text-cyan-300">Central de contato</p><h2 id="enterprise-contact" className="text-3xl font-heading font-bold text-white">Como podemos ajudar?</h2><p className="text-sm text-slate-400 max-w-2xl leading-relaxed">Prepare sua mensagem ou consulte os canais, horários e localização. Visitas são combinadas com o lojista pelo WhatsApp.</p></div>
          <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem] gap-6 items-start">
            <div className="min-w-0 rounded-3xl bg-slate-900/50 p-5 sm:p-7"><StoreInquiryForm dealership={dealershipInfo} storeKey="apexluxury" /></div>
            <div className="min-w-0 space-y-4"><p className="text-sm text-slate-300 font-semibold">Informações da loja</p><StoreContactDetails dealership={dealershipInfo} tone="cyan" presentation="directory" /></div>
          </div>
        </section>
      </div>
    </div>
  </div>;
}
