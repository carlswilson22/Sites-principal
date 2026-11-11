import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { dealershipInfo } from '../../data/dealershipInfo';
import { AnimatedStoreHero } from '../../../../../packages/merchant-core/src/components/layout/AnimatedStoreHero';

export function HeroSection({ onNavigate }) {
  return (
    <AnimatedStoreHero tone="cyan">
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        <p className="text-sm font-semibold text-cyan-300">Sua loja de veículos em {dealershipInfo.endereco.cidade}/{dealershipInfo.endereco.uf}</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-white tracking-tight leading-tight">{dealershipInfo.nome}</h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">Encontre seu próximo carro e conte com nossa equipe para conhecer os detalhes e escolher com tranquilidade.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Button variant="primary" size="lg" icon={ArrowRight} onClick={() => onNavigate('estoque')} className="w-full sm:w-auto">Explorar veículos</Button>
          <Button variant="outline" size="lg" icon={MessageCircle} onClick={() => onNavigate('sobre-contato')} className="w-full sm:w-auto">Falar com a loja</Button>
        </div>
      </div>
    </AnimatedStoreHero>
  );
}
