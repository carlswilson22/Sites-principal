import { StoreConciergePage } from '../../../packages/merchant-core/src/pages/StoreConciergePage';
import { StoreVisitPage } from '../../../packages/merchant-core/src/pages/StoreVisitPage';
import { useSiteAnalytics } from '../../../packages/merchant-core/src/hooks/useSiteAnalytics';
import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { InventoryPage } from './pages/InventoryPage';
import { FeaturedPage } from './pages/FeaturedPage';
import { FinancingPage } from './pages/FinancingPage';
import { TradeInPage } from './pages/TradeInPage';
import { AboutContactPage } from './pages/AboutContactPage';
import { VehicleDetailModal } from './components/vehicles/VehicleDetailModal';
import { vehiclesData } from './data/vehicles';
import { dealershipInfo } from './data/dealershipInfo';
import { AuthProvider, TierProvider, storeSync } from '../../../packages/merchant-core/src';
import { MerchantPanel } from '../../../packages/merchant-core/src/components/layout/MerchantPanel';
import { isPublishedVehicle } from '../../../packages/merchant-core/src/utils/vehicles';
import { StoreServicesPage } from '../../../packages/merchant-core/src/components/layout/StoreServicesPage';


export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState(null);
  const [financingPreselectedVehicle, setFinancingPreselectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState(() => storeSync.getVehicles('drivenow', vehiclesData));
  const publishedVehicles = vehicles.filter(isPublishedVehicle);

  React.useEffect(() => {
    const unsub = storeSync.subscribe('drivenow', (detail) => {
      if (detail.type === 'VEHICLES_UPDATED') {
        setVehicles(detail.vehicles);
      }
    });
    return unsub;
  }, []);

  const navigateTo = (page, params = {}) => {
    setCurrentPage(page);

    if (params.vehicle) {
      setFinancingPreselectedVehicle(params.vehicle);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  useSiteAnalytics('drivenow', currentPage, selectedVehicleForModal);

  // Renderização Dedicada da Área Restrita do Lojista (Tier 2 Pro)
  if (currentPage === 'painel-lojista') {
    return (
      <AuthProvider>
        <TierProvider tier={2}>
          <MerchantPanel storeKey="drivenow" dealership={dealershipInfo} defaultVehicles={vehiclesData} onExitToSite={() => navigateTo('home')} />
        </TierProvider>
      </AuthProvider>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black relative">
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

        {currentPage === 'servicos' && <StoreServicesPage premium onNavigate={navigateTo} />}

        {currentPage === 'simulador' && (
          <FinancingPage
            vehicles={publishedVehicles}
            preselectedVehicle={financingPreselectedVehicle}
          />
        )}

        {currentPage === 'troca' && (
          <TradeInPage vehicles={publishedVehicles} />
        )}

        {currentPage === 'sobre-contato' && (
          <AboutContactPage />
        )}
        {currentPage === 'concierge' && <StoreConciergePage dealership={dealershipInfo} storeKey="drivenow" vehicles={publishedVehicles} onSelectVehicle={setSelectedVehicleForModal} onNavigate={navigateTo} title="Concierge VIP" />}
        {currentPage === 'visitas' && <StoreVisitPage dealership={dealershipInfo} storeKey="drivenow" onNavigate={navigateTo} />}
      </main>

      {/* Rodapé com Links entre Páginas */}
      <Footer onNavigate={navigateTo} />

      {/* Modal Global de Detalhes & Experiência 360° */}
      {selectedVehicleForModal && (
        <VehicleDetailModal
          vehicle={selectedVehicleForModal}
          onClose={() => setSelectedVehicleForModal(null)}
        />
      )}

    </div>
  );
}
