import { StoreConciergePage } from '../../../packages/merchant-core/src/pages/StoreConciergePage';
import { StoreVisitPage } from '../../../packages/merchant-core/src/pages/StoreVisitPage';
import { useSiteAnalytics } from '../../../packages/merchant-core/src/hooks/useSiteAnalytics';
import { dealershipInfo } from './data/dealershipInfo';
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { InventoryPage } from './pages/InventoryPage';
import { FeaturedPage } from './pages/FeaturedPage';
import { AboutContactPage } from './pages/AboutContactPage';
import { VehicleDetailModal } from './components/vehicles/VehicleDetailModal';
import { vehiclesData } from './data/vehicles';
import { AuthProvider, TierProvider, storeSync } from '../../../packages/merchant-core/src';
import { MerchantPanel } from '../../../packages/merchant-core/src/components/layout/MerchantPanel';
import { isPublishedVehicle } from '../../../packages/merchant-core/src/utils/vehicles';


export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState(null);
  const [searchFilter, setSearchFilter] = useState({ term: '', category: 'todos' });
  const [vehicles, setVehicles] = useState(() => storeSync.getVehicles('autoelite', vehiclesData));

  const publishedVehicles = vehicles.filter(isPublishedVehicle);

  useEffect(() => {
    const unsub = storeSync.subscribe('autoelite', (detail) => {
      if (detail.type === 'VEHICLES_UPDATED') {
        setVehicles(detail.vehicles);
      }
    });
    return unsub;
  }, []);

  const navigateTo = (page, params = {}) => {
    setCurrentPage(page);

    if (params.term !== undefined || params.category !== undefined) {
      setSearchFilter({
        term: params.term || '',
        category: params.category || 'todos'
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  useSiteAnalytics('autoelite', currentPage, selectedVehicleForModal);

  // Renderização Dedicada da Área Restrita do Lojista (Tier 1 Essential)
  if (currentPage === 'painel-lojista') {
    return (
      <AuthProvider>
        <TierProvider tier={1}>
          <MerchantPanel storeKey="autoelite" dealership={dealershipInfo} defaultVehicles={vehiclesData} onExitToSite={() => navigateTo('home')} />
        </TierProvider>
      </AuthProvider>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Navegacao principal e atendimento da loja */}
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />

      {/* Conteúdo Dinâmico da Página Ativa */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            vehicles={publishedVehicles}
            onNavigate={navigateTo}
            onSelectVehicle={(v) => setSelectedVehicleForModal(v)}
          />
        )}

        {currentPage === 'estoque' && (
          <InventoryPage
            vehicles={publishedVehicles}
            searchFilter={searchFilter}
            onClearFilter={() => setSearchFilter({ term: '', category: 'todos' })}
            onSelectVehicle={(v) => setSelectedVehicleForModal(v)}
          />
        )}

        {currentPage === 'destaques' && (
          <FeaturedPage
            vehicles={publishedVehicles}
            onNavigate={navigateTo}
            onSelectVehicle={(v) => setSelectedVehicleForModal(v)}
          />
        )}

        {currentPage === 'sobre-contato' && (
          <AboutContactPage />
        )}
        {currentPage === 'concierge' && <StoreConciergePage dealership={dealershipInfo} storeKey="autoelite" vehicles={publishedVehicles} onSelectVehicle={setSelectedVehicleForModal} onNavigate={navigateTo} title="Atendimento no site" />}
        {currentPage === 'visitas' && <StoreVisitPage dealership={dealershipInfo} storeKey="autoelite" onNavigate={navigateTo} />}
      </main>

      {/* Rodapé com Links entre Páginas */}
      <Footer onNavigate={navigateTo} />

      {/* Modal Global de Detalhes & Galeria Expandida */}
      {selectedVehicleForModal && (
        <VehicleDetailModal
          vehicle={selectedVehicleForModal}
          onClose={() => setSelectedVehicleForModal(null)}
        />
      )}

    </div>
  );
}
