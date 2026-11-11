import { StoreConciergePage } from '../../../packages/merchant-core/src/pages/StoreConciergePage';
import { StoreVisitPage } from '../../../packages/merchant-core/src/pages/StoreVisitPage';
import { useSiteAnalytics } from '../../../packages/merchant-core/src/hooks/useSiteAnalytics';
import { dealershipInfo } from './data/dealershipInfo';
import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ComparisonFloatingBar } from './components/layout/ComparisonFloatingBar';
import { HomePage } from './pages/HomePage';
import { InventoryPage } from './pages/InventoryPage';
import { FeaturedPage } from './pages/FeaturedPage';
import { FinancingPage } from './pages/FinancingPage';
import { TradeInPage } from './pages/TradeInPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ComparatorPage } from './pages/ComparatorPage';
import { AIConsultantPage } from './pages/AIConsultantPage';
import { AboutContactPage } from './pages/AboutContactPage';
import { VehicleDetailModal } from './components/vehicles/VehicleDetailModal';
import { OfficialDossierModal } from './components/vehicles/OfficialDossierModal';
import { PriceAlertModal } from './components/vehicles/PriceAlertModal';
import { vehiclesData } from './data/vehicles';
import { useFavorites } from './hooks/useFavorites';
import { useComparator } from './hooks/useComparator';
import { AuthProvider, TierProvider, storeSync } from '../../../packages/merchant-core/src';
import { MerchantPanel } from '../../../packages/merchant-core/src/components/layout/MerchantPanel';
import { isPublishedVehicle } from '../../../packages/merchant-core/src/utils/vehicles';
import { StoreServicesPage } from '../../../packages/merchant-core/src/components/layout/StoreServicesPage';


export default function App() {
  const [vehicles, setVehicles] = useState(() => storeSync.getVehicles('apexluxury', vehiclesData));
  React.useEffect(() => storeSync.subscribe('apexluxury', detail => { if (detail.type === 'VEHICLES_UPDATED') setVehicles(detail.vehicles); }), []);
  const publishedVehicles = vehicles.filter(isPublishedVehicle);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState(null);
  const [adFinancingOpen, setAdFinancingOpen] = useState(false);
  const [financingPreselectedVehicle, setFinancingPreselectedVehicle] = useState(null);
  const [dossierVehicle, setDossierVehicle] = useState(null);
  const [priceAlertVehicle, setPriceAlertVehicle] = useState(null);

  const { 
    favoriteIds, 
    toggleFavorite, 
    isFavorite, 
    favoritesCount, 
    favoriteVehicles 
  } = useFavorites(publishedVehicles);

  const { 
    comparedIds, 
    toggleCompare, 
    isComparing, 
    clearCompared, 
    comparedCount, 
    comparedVehicles 
  } = useComparator(publishedVehicles);

  const navigateTo = (page, params = {}) => {
    setCurrentPage(page);

    if (params.vehicle) {
      setFinancingPreselectedVehicle(params.vehicle);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenFinancingFromModal = vehicle => {
    setAdFinancingOpen(true);
    setSelectedVehicleForModal(vehicle);
  };
  const openVehicle = vehicle => { setAdFinancingOpen(false); setSelectedVehicleForModal(vehicle); };

  useSiteAnalytics('apexluxury', currentPage, selectedVehicleForModal);

  // Renderização Dedicada da Área Restrita do Lojista (Tier 3 Enterprise)
  if (currentPage === 'painel-lojista') {
    return (
      <AuthProvider>
        <TierProvider tier={3}>
          <MerchantPanel storeKey="apexluxury" dealership={dealershipInfo} defaultVehicles={vehiclesData} onExitToSite={() => navigateTo('home')} />
        </TierProvider>
      </AuthProvider>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative">
      {/* Navegacao principal e atendimento da loja */}
      <Navbar 
        currentPage={currentPage} 
        onNavigate={navigateTo} 
        favoritesCount={favoritesCount}
        comparedCount={comparedCount}
      />

      {/* Conteúdo Dinâmico da Página Ativa */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            vehicles={publishedVehicles}
            onNavigate={navigateTo}
            onSelectVehicle={openVehicle}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            isComparing={isComparing}
            onToggleCompare={toggleCompare}
            onOpenPriceAlert={(v) => { setSelectedVehicleForModal(null); setPriceAlertVehicle(v); }}
          />
        )}

        {currentPage === 'estoque' && (
          <InventoryPage
            vehicles={publishedVehicles}
            onSelectVehicle={openVehicle}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            isComparing={isComparing}
            onToggleCompare={toggleCompare}
            onOpenPriceAlert={(v) => setPriceAlertVehicle(v)}
          />
        )}

        {currentPage === 'destaques' && (
          <FeaturedPage
            vehicles={publishedVehicles}
            onNavigate={navigateTo}
            onSelectVehicle={openVehicle}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            isComparing={isComparing}
            onToggleCompare={toggleCompare}
            onOpenPriceAlert={(v) => setPriceAlertVehicle(v)}
          />
        )}

        {currentPage === 'consultor-ia' && (
          <AIConsultantPage
            vehicles={publishedVehicles}
            onSelectVehicle={openVehicle}
          />
        )}

        {currentPage === 'servicos' && <StoreServicesPage onNavigate={navigateTo} favoritesCount={favoriteVehicles.length} comparedCount={comparedVehicles.length} />}

        {currentPage === 'simulador' && (
          <FinancingPage
            vehicles={publishedVehicles}
            preselectedVehicle={financingPreselectedVehicle}
          />
        )}

        {currentPage === 'troca' && (
          <TradeInPage vehicles={publishedVehicles} />
        )}

        {currentPage === 'comparador' && (
          <ComparatorPage
            comparedVehicles={comparedVehicles}
            onRemoveFromCompare={toggleCompare}
            onNavigate={navigateTo}
            onOpenFinancing={handleOpenFinancingFromModal}
          />
        )}

        {currentPage === 'favoritos' && (
          <FavoritesPage
            favoriteVehicles={favoriteVehicles}
            onNavigate={navigateTo}
            onSelectVehicle={openVehicle}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            isComparing={isComparing}
            onToggleCompare={toggleCompare}
            onOpenPriceAlert={(v) => setPriceAlertVehicle(v)}
          />
        )}

        {currentPage === 'sobre-contato' && (
          <AboutContactPage />
        )}
        {currentPage === 'concierge' && <StoreConciergePage dealership={dealershipInfo} storeKey="apexluxury" vehicles={publishedVehicles} onSelectVehicle={openVehicle} onNavigate={navigateTo} title="Atendimento no site" />}
        {currentPage === 'visitas' && <StoreVisitPage dealership={dealershipInfo} storeKey="apexluxury" onNavigate={navigateTo} />}
      </main>

      {/* Rodapé Completo */}
      <Footer onNavigate={navigateTo} />

      {/* Barra Flutuante de Comparação Ativa */}
      {['estoque', 'destaques', 'favoritos'].includes(currentPage) && (
        <ComparisonFloatingBar
          comparedVehicles={comparedVehicles}
          onOpenComparator={() => navigateTo('comparador')}
          onClear={clearCompared}
        />
      )}

      {/* Modal Global de Detalhes com TCO, 360° e Galeria Expandida */}
      {selectedVehicleForModal && (
        <VehicleDetailModal
          vehicle={selectedVehicleForModal}
          onClose={() => setSelectedVehicleForModal(null)}
          initialFinancing={adFinancingOpen}
          onOpenDossier={(v) => { setSelectedVehicleForModal(null); setDossierVehicle(v); }}
          onOpenPriceAlert={(v) => setPriceAlertVehicle(v)}
          isFavorite={isFavorite(selectedVehicleForModal.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Modal de Comparação Lado a Lado */}


      {/* Modal de Dossiê Oficial de Procedência */}
      {dossierVehicle && (
        <OfficialDossierModal
          vehicle={dossierVehicle}
          onClose={() => setDossierVehicle(null)}
        />
      )}

      {/* Modal de Alerta de Preço */}
      {priceAlertVehicle && (
        <PriceAlertModal
          vehicle={priceAlertVehicle}
          onClose={() => setPriceAlertVehicle(null)}
        />
      )}

    </div>
  );
}
