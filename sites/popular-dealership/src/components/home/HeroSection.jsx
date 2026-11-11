import React from 'react';
import { dealershipInfo } from '../../data/dealershipInfo';
import { AnimatedStoreHero } from '../../../../../packages/merchant-core/src/components/layout/AnimatedStoreHero';

export function HeroSection({ onNavigate }) {
  return <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
    <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem] gap-6 items-center rounded-3xl bg-slate-900/40 overflow-hidden">
      <div className="p-6 sm:p-8 lg:p-10 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{dealershipInfo.nome}</p>
        <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-white">Encontre. Compare.<br /><span className="text-cyan-300">Escolha com confiança.</span></h1>
        <p className="max-w-xl text-slate-300 leading-relaxed">Explore as opções, salve seus favoritos e coloque os veículos lado a lado. Os detalhes fazem a diferença.</p>
        <button type="button" onClick={() => onNavigate('sobre-contato')} className="min-h-11 text-sm text-slate-300 underline underline-offset-4">Conheça a loja e nossa equipe</button>
      </div>
      <AnimatedStoreHero tone="cyan" layout="panel"><p className="min-h-56 flex items-end text-lg text-white font-semibold">Novos caminhos.<br />Uma escolha sua.</p></AnimatedStoreHero>
    </div>
  </section>;
}
