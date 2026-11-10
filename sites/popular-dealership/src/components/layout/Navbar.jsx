import React from 'react';
import { SiteHeader } from '../../../../../packages/merchant-core/src/components/layout/SiteHeader';
import AutomatchLogo from '../ui/AutomatchLogo';
import { dealershipInfo } from '../../data/dealershipInfo';
import { buildGeneralWhatsappLink } from '../../utils/whatsapp';

export function Navbar({ currentPage = 'home', onNavigate, favoritesCount = 0, comparedCount = 0 }) {
  const navLinks = [
    { id: 'home', label: 'Início' },
    { id: 'estoque', label: 'Estoque' },
    { id: 'destaques', label: 'Destaques' },
    { id: 'consultor-ia', label: 'Consultor IA', badge: 'Novo' },
    { id: 'simulador', label: 'Simulador' },
    { id: 'troca', label: 'Troca Fácil' },
    { id: 'comparador', label: 'Comparador', count: comparedCount },
    { id: 'favoritos', label: 'Favoritos', count: favoritesCount },
    { id: 'sobre-contato', label: 'Sobre & Contato' }
  ];
  return <SiteHeader currentPage={currentPage} onNavigate={onNavigate} links={navLinks} name={dealershipInfo.nome} whatsappUrl={buildGeneralWhatsappLink()} Logo={AutomatchLogo} />;
}
