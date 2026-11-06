import React, { useState, useEffect } from 'react';
import { 
  Car, Shield, Sparkles, Calculator, ArrowLeftRight, 
  Crown, Building2, Menu, X, ArrowLeft, MessageCircle 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { dealershipInfo } from '../../data/dealershipInfo';
import { buildGeneralWhatsappLink } from '../../utils/whatsapp';

export function Navbar({ currentPage = 'home', onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Início', icon: Car },
    { id: 'estoque', label: 'Showroom VIP', icon: Crown },
    { id: 'destaques', label: 'Destaques', icon: Sparkles },
    { id: 'simulador', label: 'Simulador Private', icon: Calculator },
    { id: 'troca', label: 'Avaliação de Troca', icon: ArrowLeftRight },
    { id: 'concierge', label: 'Concierge', icon: Shield },
    { id: 'sobre-contato', label: 'Showroom & Contato', icon: Building2 }
  ];

  const handleNavClick = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    }
    setMobileMenuOpen(false);
  };

  const whatsappUrl = buildGeneralWhatsappLink();

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#050508]/95 backdrop-blur-md border-b border-amber-500/20 shadow-xl shadow-black/60 py-3' 
        : 'bg-[#050508]/80 backdrop-blur-sm border-b border-white/10 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Voltar ao Hub & Logotipo */}
          <div className="flex items-center gap-3">
            <a 
              href="/sites-modelos/"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors mr-2 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20"
              title="Voltar ao Showcase de Modelos"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hub</span>
            </a>

            <button 
              onClick={() => handleNavClick('home')} 
              className="flex items-center gap-3 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center text-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Crown className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
                    APEX MOTORS
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    INTERMEDIÁRIO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                  <Shield className="w-3 h-3 text-amber-400" />
                  Luxury & Exotic Supercars
                </p>
              </div>
            </button>
          </div>

          {/* Links Desktop (Abas) */}
          <nav className="hidden xl:flex items-center gap-1 p-1 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Ações / Atendimento VIP */}
          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="gold"
              size="sm"
              icon={MessageCircle}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Atendimento VIP
            </Button>
          </div>

          {/* Botão Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 rounded-xl bg-black/60 border border-white/10 text-slate-300 hover:text-white"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#050508]/95 border-b border-white/10 px-5 py-6 space-y-4 backdrop-blur-2xl animate-fade-in">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-white/10">
            <Button
              variant="gold"
              size="md"
              icon={MessageCircle}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              Concierge WhatsApp ({dealershipInfo.whatsappFormatado})
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
