import React from 'react';
import { ArrowDown, ArrowUpRight, Heart, Scale } from 'lucide-react';
import { dealershipInfo } from '../../data/dealershipInfo';
import { AnimatedStoreHero } from '../../../../../packages/merchant-core/src/components/layout/AnimatedStoreHero';

export function HeroSection({ onNavigate, favoritesCount = 0, comparedCount = 0 }) {
  return <section aria-labelledby="enterprise-hero-title" className="pt-5 sm:pt-7">
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{dealershipInfo.nome}</p>
        <button type="button" onClick={() => onNavigate('sobre-contato')} className="min-h-11 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">Conheça a loja e nossa equipe<ArrowUpRight aria-hidden="true" className="w-4 h-4" /></button>
      </div>
      <AnimatedStoreHero tone="cyan" layout="panorama">
        <div className="min-h-64 sm:min-h-[24rem] xl:min-h-[28rem] flex items-end">
          <p className="text-sm text-white font-medium drop-shadow-md">Novos caminhos. Uma escolha sua.</p>
        </div>
      </AnimatedStoreHero>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] items-center gap-7 lg:gap-12 rounded-b-3xl bg-[#10292e] p-6 sm:p-8 lg:px-10">
        <div className="space-y-3">
          <h1 id="enterprise-hero-title" className="text-3xl sm:text-4xl lg:text-5xl font-heading font-medium tracking-tight leading-tight text-white">Sua escolha.<br /><span className="text-cyan-200">Por uma nova perspectiva.</span></h1>
          <p className="max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed">Descubra os veículos, reúna seus favoritos e compare os detalhes antes de decidir.</p>
        </div>
        <nav aria-label="Suas escolhas na vitrine" className="grid grid-cols-2 gap-3">
          <a href="#explorar-enterprise" className="col-span-2 min-h-12 rounded-xl bg-cyan-200 text-slate-950 hover:bg-cyan-100 px-5 py-3 font-semibold flex items-center justify-between gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Explorar veículos<ArrowDown aria-hidden="true" className="w-4 h-4 shrink-0" /></a>
          <button type="button" onClick={() => onNavigate('comparador')} className="min-h-14 min-w-0 rounded-xl border border-cyan-100/20 hover:bg-white/5 px-3 py-3 text-sm text-white flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><Scale aria-hidden="true" className="w-4 h-4 shrink-0" /><span className="flex-1 text-left leading-snug">Comparar escolhas</span><span className="text-cyan-200 tabular-nums">{comparedCount}</span></button>
          <button type="button" onClick={() => onNavigate('favoritos')} className="min-h-14 min-w-0 rounded-xl border border-cyan-100/20 hover:bg-white/5 px-3 py-3 text-sm text-white flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><Heart aria-hidden="true" className="w-4 h-4 shrink-0" /><span className="flex-1 text-left leading-snug">Meus favoritos</span><span className="text-cyan-200 tabular-nums">{favoritesCount}</span></button>
        </nav>
      </div>
    </div>
  </section>;
}
