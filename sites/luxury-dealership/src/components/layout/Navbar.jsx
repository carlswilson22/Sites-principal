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
    { id: 'servicos', label: 'Serviços' },
    { id: 'sobre-contato', label: 'Sobre Nós e Contato' }
  ];
  const activePage = ['simulador', 'troca'].includes(currentPage) ? 'servicos' : currentPage;
  return <SiteHeader currentPage={activePage} onNavigate={onNavigate} links={navLinks} name={dealershipInfo.nome} whatsappUrl={buildGeneralWhatsappLink()} Logo={AutomatchLogo} />;
}
