import React, { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { dealershipInfo } from '../../data/dealershipInfo';
import { AnimatedStoreHero } from '../../../../../packages/merchant-core/src/components/layout/AnimatedStoreHero';

export function HeroSection({ onNavigate }) {
  const [term, setTerm] = useState('');
  return <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
    <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-8 lg:gap-10 items-stretch">
      <div className="order-2 lg:order-1 space-y-6 py-3 self-center">
        <p className="text-sm font-semibold text-blue-300">{dealershipInfo.nome}</p>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">Seu próximo carro.<br /><span className="text-blue-300">Do seu jeito.</span></h1>
        <p className="max-w-lg text-slate-300 leading-relaxed">Escolha, conheça os detalhes e converse com a loja. Uma busca simples para encontrar o veículo que combina com você.</p>
        <form role="search" aria-label="Buscar no estoque" onSubmit={event => { event.preventDefault(); onNavigate('estoque', { term: term.trim() }); }} className="flex flex-col sm:flex-row gap-2 rounded-2xl bg-slate-900 border border-slate-700 p-2">
          <label className="flex items-center flex-1 min-w-0 gap-3 px-3"><Search aria-hidden="true" className="w-5 h-5 text-slate-400 shrink-0" /><span className="sr-only">Modelo ou marca</span><input value={term} onChange={event => setTerm(event.target.value)} placeholder="Qual carro você procura?" className="w-full min-w-0 min-h-12 bg-transparent text-white outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg" /></label>
          <button type="submit" className="min-h-12 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold inline-flex items-center justify-center gap-2">Buscar veículos<ArrowRight aria-hidden="true" className="w-4 h-4" /></button>
        </form>
        <button type="button" onClick={() => onNavigate('sobre-contato')} className="text-sm text-slate-300 underline underline-offset-4 min-h-11">Conheça nossa loja</button>
      </div>
      <div className="order-1 lg:order-2 min-w-0"><AnimatedStoreHero tone="blue" layout="panel"><div className="flex items-end min-h-64 sm:min-h-96 lg:min-h-[26rem]"><p className="text-sm font-medium text-white drop-shadow-md">O próximo caminho começa aqui.</p></div></AnimatedStoreHero></div>
    </div>
  </section>;
}

export default HeroSection;
