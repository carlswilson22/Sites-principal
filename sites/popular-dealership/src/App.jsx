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
import { AIConsultantPage } from './pages/AIConsultantPage';
import { AboutContactPage } from './pages/AboutContactPage';
import { VehicleDetailModal } from './components/vehicles/VehicleDetailModal';
import { OfficialDossierModal } from './components/vehicles/OfficialDossierModal';
import { PriceAlertModal } from './components/vehicles/PriceAlertModal';
import { vehiclesData } from './data/vehicles';
import { useFavorites } from './hooks/useFavorites';
import { useComparator } from './hooks/useComparator';
import { storeSync } from '../../../packages/merchant-core/src/services/storeSync';
import { MerchantEntry } from '../../../packages/merchant-core/src/components/layout/MerchantEntry';
import { isPublishedVehicle } from '../../../packages/merchant-core/src/utils/vehicles';
import { StoreServicesPage } from '../../../packages/merchant-core/src/components/layout/StoreServicesPage';


import { StoreAccessProvider, useStoreAccess } from '../../../packages/merchant-core/src/context/StoreAccessContext';
import { canAccessSitePage } from '../../../packages/merchant-core/src/utils/siteAccess';

const StoreConciergePage = React.lazy(() => import('../../../packages/merchant-core/src/pages/StoreConciergePage').then(module => ({ default: module.StoreConciergePage })));
const VehicleComparatorModal = React.lazy(() => import('./components/vehicles/VehicleComparatorModal').then(module => ({ default: module.VehicleComparatorModal })));


export default function App() {
  return <StoreAccessProvider storeKey="apexluxury" storeName={dealershipInfo.nome}><StoreApp /></StoreAccessProvider>;
}

function StoreApp() {
  const { user, isAuthenticated, authorizeNavigation, requireLogin } = useStoreAccess();
  const [vehicles, setVehicles] = useState(() => storeSync.getVehicles('apexluxury', vehiclesData));
  React.useEffect(() => storeSync.subscribe('apexluxury', detail => { if (detail.type === 'VEHICLES_UPDATED') setVehicles(detail.vehicles); }), []);
  const publishedVehicles = vehicles.filter(isPublishedVehicle);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState(null);
  const [financingPreselectedVehicle, setFinancingPreselectedVehicle] = useState(null);
  const [dossierVehicle, setDossierVehicle] = useState(null);
  const [priceAlertVehicle, setPriceAlertVehicle] = useState(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  const { 
    toggleFavorite, 
    isFavorite, 
    favoritesCount, 
    favoriteVehicles 
  } = useFavorites(publishedVehicles);

  const { 
    toggleCompare, 
    replaceCompared,
    isComparing, 
    clearCompared, 
    comparisonNotice,
    comparedCount, 
    comparedVehicles 
  } = useComparator(publishedVehicles);

  const navigateTo = (page, params = {}) => authorizeNavigation(page, () => {
    if (page === 'comparador') { setComparisonOpen(true); return; }
    setCurrentPage(page === 'visitas' ? 'sobre-contato' : page);

    if (params.vehicle) {
      setFinancingPreselectedVehicle(params.vehicle);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const openPriceAlert = vehicle => requireLogin(() => setPriceAlertVehicle(vehicle), 'Entre para solicitar um aviso de condição de preço.');

  const openVehicle = vehicle => setSelectedVehicleForModal(vehicle);

  React.useEffect(() => {
    if (!canAccessSitePage(currentPage, user)) setCurrentPage('home');
  }, [currentPage, user]);

  useSiteAnalytics('apexluxury', currentPage, selectedVehicleForModal);

  // Renderização Dedicada da Área Restrita do Lojista (Tier 3 Enterprise)
  if (currentPage === 'painel-lojista') {
    return (
      <MerchantEntry tier={3} storeKey="apexluxury" dealership={dealershipInfo} defaultVehicles={vehiclesData} onExitToSite={() => navigateTo('home')} />
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
      {comparisonNotice && <p role="status" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-cyan-200">{comparisonNotice}</p>}
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
            onOpenPriceAlert={openPriceAlert}
            favoritesCount={favoritesCount}
            comparedCount={comparedCount}
          />
        )}

        {currentPage === 'estoque' && (
          <InventoryPage
            vehicles={publishedVehicles}
            onNavigate={navigateTo}
            favoritesCount={favoritesCount}
            comparedCount={comparedCount}
            onSelectVehicle={openVehicle}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            isComparing={isComparing}
            onToggleCompare={toggleCompare}
            onOpenPriceAlert={openPriceAlert}
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
            onOpenPriceAlert={openPriceAlert}
          />
        )}

        {currentPage === 'consultor-ia' && (
          <AIConsultantPage
            vehicles={publishedVehicles}
            onSelectVehicle={openVehicle}
          />
        )}

        {currentPage === 'servicos' && <StoreServicesPage onNavigate={navigateTo} />}

        {currentPage === 'simulador' && isAuthenticated && (
          <FinancingPage
            vehicles={publishedVehicles}
            preselectedVehicle={financingPreselectedVehicle}
          />
        )}

        {currentPage === 'troca' && isAuthenticated && (
          <TradeInPage vehicles={publishedVehicles} />
        )}

        {currentPage === 'favoritos' && isAuthenticated && (
          <FavoritesPage
            favoriteVehicles={favoriteVehicles}
            onNavigate={navigateTo}
            onSelectVehicle={openVehicle}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            isComparing={isComparing}
            onToggleCompare={toggleCompare}
            onOpenPriceAlert={openPriceAlert}
          />
        )}

        {currentPage === 'sobre-contato' && (
          <AboutContactPage />
        )}
        {currentPage === 'concierge' && <React.Suspense fallback={<p role="status" className="p-6 text-slate-300">Carregando atendimento…</p>}><StoreConciergePage dealership={dealershipInfo} storeKey="apexluxury" vehicles={publishedVehicles} onSelectVehicle={openVehicle} onNavigate={navigateTo} title="Atendimento no site" /></React.Suspense>}
      </main>

      {/* Rodapé Completo */}
      <Footer compact={currentPage === 'sobre-contato'} />

      {/* Barra Flutuante de Comparação Ativa */}
      {['destaques', 'favoritos'].includes(currentPage) && (
        <ComparisonFloatingBar
          comparedVehicles={comparedVehicles}
          onOpenComparator={() => navigateTo('comparador')}
          onClear={clearCompared}
        />
      )}

      {/* Modal Global de Detalhes com TCO, 360° e Galeria Expandida */}
      {comparisonOpen && <React.Suspense fallback={<p role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-slate-900 p-4 text-cyan-200">Abrindo comparação…</p>}><VehicleComparatorModal key={user ? `${user.role}:${user.id}` : 'guest'} vehicles={publishedVehicles} comparedVehicles={comparedVehicles} onConfirm={replaceCompared} onClose={() => setComparisonOpen(false)} onSelectVehicle={vehicle => { setComparisonOpen(false); openVehicle(vehicle); }} /></React.Suspense>}
      {selectedVehicleForModal && (
        <VehicleDetailModal
          vehicle={selectedVehicleForModal}
          onClose={() => setSelectedVehicleForModal(null)}
          onOpenDossier={(v) => { setSelectedVehicleForModal(null); setDossierVehicle(v); }}
          onOpenPriceAlert={openPriceAlert}
          isFavorite={isFavorite(selectedVehicleForModal.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Modal de Dossiê Oficial de Procedência */}
      {dossierVehicle && (
        <OfficialDossierModal
          vehicle={dossierVehicle}
          onClose={() => setDossierVehicle(null)}
        />
      )}

      {/* Modal de Alerta de Preço */}
      {priceAlertVehicle && isAuthenticated && (
        <PriceAlertModal
          vehicle={priceAlertVehicle}
          onClose={() => setPriceAlertVehicle(null)}
        />
      )}

    </div>
  );
}
