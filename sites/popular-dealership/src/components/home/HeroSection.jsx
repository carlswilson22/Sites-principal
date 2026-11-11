import React from 'react';
import { dealershipInfo } from '../../data/dealershipInfo';
import { AnimatedStoreHero } from '../../../../../packages/merchant-core/src/components/layout/AnimatedStoreHero';

export function HeroSection({ onNavigate }) {
  return <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
    <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-4 items-stretch rounded-3xl bg-slate-900/40 overflow-hidden">
      <div className="order-2 lg:order-1 self-center p-6 sm:p-8 lg:p-10 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{dealershipInfo.nome}</p>
        <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-white">Encontre. Compare.<br /><span className="text-cyan-300">Escolha com confiança.</span></h1>
        <p className="max-w-xl text-slate-300 leading-relaxed">Explore as opções, salve seus favoritos e coloque os veículos lado a lado. Os detalhes fazem a diferença.</p>
        <button type="button" onClick={() => onNavigate('sobre-contato')} className="min-h-11 text-sm text-slate-300 underline underline-offset-4">Conheça a loja e nossa equipe</button>
      </div>
      <div className="order-1 lg:order-2 min-w-0"><AnimatedStoreHero tone="cyan" layout="panel"><div className="min-h-64 sm:min-h-96 lg:min-h-[26rem] flex items-end"><p className="text-sm text-white font-medium drop-shadow-md">Novos caminhos. Uma escolha sua.</p></div></AnimatedStoreHero></div>
    </div>
  </section>;
}
