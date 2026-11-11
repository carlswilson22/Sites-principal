/**
 * packages/merchant-core/src/components/layout/MerchantShell.jsx
 * Shell principal do Painel do Lojista unificando Navbar, Sidebar e Área de Conteúdo.
 */
import React, { useState } from 'react';
import { MerchantNavbar } from './MerchantNavbar';
import { MerchantSidebar } from './MerchantSidebar';

export function MerchantShell({
  storeName,
  activeTab,
  onSelectTab,
  onExitToSite,
  children
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Barra de Navegação Superior */}
      <MerchantNavbar
        storeName={storeName}
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        onExitToSite={onExitToSite}
      />

      {/* 2. Corpo com Sidebar Lateral e Área de Trabalho */}
      <div className="flex-1 flex flex-row relative">
        <MerchantSidebar
          storeName={storeName}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

