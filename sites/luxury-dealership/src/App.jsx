import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { InventoryPage } from './pages/InventoryPage';
import { FeaturedPage } from './pages/FeaturedPage';
import { FinancingPage } from './pages/FinancingPage';
import { TradeInPage } from './pages/TradeInPage';
import { ConciergePage } from './pages/ConciergePage';
import { AboutContactPage } from './pages/AboutContactPage';
import { VehicleDetailModal } from './components/vehicles/VehicleDetailModal';
import { vehiclesData } from './data/vehicles';
import { buildGeneralWhatsappLink } from './utils/whatsapp';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState(null);
  const [financingPreselectedVehicle, setFinancingPreselectedVehicle] = useState(null);

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

  return (
    <div className="min-h-screen bg-[#050508] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black relative">
      {/* Barra de Navegação no Topo (7 Abas) */}
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />

      {/* Conteúdo Dinâmico da Página Ativa */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            vehicles={vehiclesData}
            onNavigate={navigateTo}
            onSelectVehicle={(v) => setSelectedVehicleForModal(v)}
          />
        )}

        {currentPage === 'estoque' && (
          <InventoryPage
            vehicles={vehiclesData}
            onSelectVehicle={(v) => setSelectedVehicleForModal(v)}
          />
        )}

        {currentPage === 'destaques' && (
          <FeaturedPage
            vehicles={vehiclesData}
            onNavigate={navigateTo}
            onSelectVehicle={(v) => setSelectedVehicleForModal(v)}
          />
        )}

        {currentPage === 'simulador' && (
          <FinancingPage
            vehicles={vehiclesData}
            preselectedVehicle={financingPreselectedVehicle}
          />
        )}

        {currentPage === 'troca' && (
          <TradeInPage vehicles={vehiclesData} />
        )}

        {currentPage === 'concierge' && (
          <ConciergePage />
        )}

        {currentPage === 'sobre-contato' && (
          <AboutContactPage />
        )}
      </main>

      {/* Rodapé com Links entre Páginas */}
      <Footer onNavigate={navigateTo} />

      {/* Modal Global de Detalhes & Experiência 360° */}
      {selectedVehicleForModal && (
        <VehicleDetailModal
          vehicle={selectedVehicleForModal}
          onClose={() => setSelectedVehicleForModal(null)}
          onOpenFinancing={handleOpenFinancingFromModal}
        />
      )}

      {/* Botão Flutuante de Concierge WhatsApp VIP */}
      <a
        href={floatingWhatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold shadow-xl shadow-amber-950/80 hover:shadow-amber-500/30 border border-amber-300/50 transition-all duration-300 hover:scale-105 group"
        title="Falar com o Concierge VIP"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 fill-black" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-200"></span>
        </div>
        <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Concierge VIP</span>
      </a>
    </div>
  );
}
