import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { dealershipInfo } from '../../data/dealershipInfo';
import { AnimatedStoreHero } from '../../../../../packages/merchant-core/src/components/layout/AnimatedStoreHero';

export function HeroSection({ onNavigate }) {
  return (
    <AnimatedStoreHero tone="blue">
      <div className="relative max-w-4xl mx-auto text-center space-y-6">
        <p className="text-sm font-semibold text-blue-300">Seu próximo veículo começa aqui</p>
        <h1 className="font-heading text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight text-balance">{dealershipInfo.nome}</h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">Encontre o veículo que combina com você e conte com nossa equipe para conhecer cada detalhe.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Button variant="primary" size="lg" icon={ArrowRight} onClick={() => onNavigate('estoque')}>Encontrar meu veículo</Button>
          <Button variant="outline" size="lg" icon={MessageCircle} onClick={() => onNavigate('sobre-contato')}>Falar com a loja</Button>
        </div>
      </div>
    </AnimatedStoreHero>
  );
}

export default HeroSection;
