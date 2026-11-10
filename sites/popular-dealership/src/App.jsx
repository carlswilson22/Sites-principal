import { dealershipInfo } from './data/dealershipInfo';
import React, { useState } from 'react';
import { MessageCircle, Bot } from 'lucide-react';
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
import { buildGeneralWhatsappLink } from './utils/whatsapp';
import { AuthProvider, TierProvider, storeSync } from '../../../packages/merchant-core/src';
import { MerchantPanel } from '../../../packages/merchant-core/src/components/layout/MerchantPanel';
import { isPublishedVehicle } from '../../../packages/merchant-core/src/utils/vehicles';


export default function App() {
  const [vehicles, setVehicles] = useState(() => storeSync.getVehicles('apexluxury', vehiclesData));
  React.useEffect(() => storeSync.subscribe('apexluxury', detail => { if (detail.type === 'VEHICLES_UPDATED') setVehicles(detail.vehicles); }), []);
  const publishedVehicles = vehicles.filter(isPublishedVehicle);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState(null);
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

  const handleOpenFinancingFromModal = (vehicle) => {
    setSelectedVehicleForModal(null);
    navigateTo('simulador', { vehicle });
  };

  const floatingWhatsappUrl = buildGeneralWhatsappLink();

  // Renderização Dedicada da Área Restrita do Lojista (Tier 3 Enterprise)
  if (currentPage === 'painel-lojista') {
    return (
      <AuthProvider>
        <TierProvider tier={3}>
          <MerchantPanel storeKey="apexluxury" dealership={dealershipInfo} defaultVehicles={vehiclesData} FinancingComponent={FinancingPage} onExitToSite={() => navigateTo('home')} />
        </TierProvider>
      </AuthProvider>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative">
      {/* Barra de Navegação no Topo (9 Abas + Badges de Favoritos e Comparação) */}
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
            onSelectVehicle={(v) => setSelectedVehicleForModal(v)}
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
            onSelectVehicle={(v) => setSelectedVehicleForModal(v)}
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
            onSelectVehicle={(v) => setSelectedVehicleForModal(v)}
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
            onSelectVehicle={(v) => setSelectedVehicleForModal(v)}
          />
        )}

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
            onSelectVehicle={(v) => setSelectedVehicleForModal(v)}
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
      </main>

      {/* Rodapé Completo */}
      <Footer onNavigate={navigateTo} />

      {/* Barra Flutuante de Comparação Ativa */}
      {currentPage !== 'comparador' && (
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
          onOpenFinancing={handleOpenFinancingFromModal}
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

      {/* Botão Flutuante de WhatsApp do Plantão */}
      <a
        href={floatingWhatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-xl shadow-emerald-950/80 hover:shadow-emerald-500/30 border border-emerald-300/50 transition-all duration-300 hover:scale-105 group"
        title="Plantão de Vendas no WhatsApp"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 fill-black" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-200"></span>
        </div>
        <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Plantão Online</span>
      </a>
    </div>
  );
}
