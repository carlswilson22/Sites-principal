import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { InventoryPage } from './pages/InventoryPage';
import { FeaturedPage } from './pages/FeaturedPage';
import { AboutContactPage } from './pages/AboutContactPage';
import { VehicleDetailModal } from './components/vehicles/VehicleDetailModal';
import { vehiclesData } from './data/vehicles';
import { buildGeneralWhatsappLink } from './utils/whatsapp';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState(null);
  const [searchFilter, setSearchFilter] = useState({ term: '', category: 'todos' });

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

  const handleOpenContactFromModal = (vehicle) => {
    setSelectedVehicleForModal(null);
    navigateTo('sobre-contato');
  };

  const floatingWhatsappUrl = buildGeneralWhatsappLink();

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Barra de Navegação no Topo com 4 Abas (Modelo Básico) */}
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
            searchFilter={searchFilter}
            onClearFilter={() => setSearchFilter({ term: '', category: 'todos' })}
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

        {currentPage === 'sobre-contato' && (
          <AboutContactPage />
        )}
      </main>

      {/* Rodapé com Links entre Páginas */}
      <Footer onNavigate={navigateTo} />

      {/* Modal Global de Detalhes & Galeria Expandida */}
      {selectedVehicleForModal && (
        <VehicleDetailModal
          vehicle={selectedVehicleForModal}
          onClose={() => setSelectedVehicleForModal(null)}
          onContact={handleOpenContactFromModal}
        />
      )}

      {/* Botão Flutuante de WhatsApp (Canto Inferior Direito) */}
      <a
        href={floatingWhatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/60 hover:shadow-emerald-500/40 border border-emerald-400/40 transition-all duration-300 hover:scale-105 group"
        title="Falar com consultor no WhatsApp"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300"></span>
        </div>
        <span className="text-xs font-bold hidden sm:inline">Plantão Online</span>
      </a>
    </div>
  );
}
