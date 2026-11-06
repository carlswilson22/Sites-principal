import React, { useState, useEffect } from 'react';
import { 
  Car, ShieldCheck, MessageCircle, Menu, X, 
  Home, Grid, Sparkles, Building2, ArrowLeft
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
    { id: 'home', label: 'Início', icon: Home },
    { id: 'estoque', label: 'Estoque', icon: Grid },
    { id: 'destaques', label: 'Destaques', icon: Sparkles },
    { id: 'sobre-contato', label: 'Sobre & Contato', icon: Building2 }
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
        ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/40 py-3' 
        : 'bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/40 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Voltar ao Hub & Logotipo */}
          <div className="flex items-center gap-3">
            <a 
              href="/sites-modelos/"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors mr-1 sm:mr-3 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20"
              title="Voltar ao Showcase de Modelos"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hub</span>
            </a>

            <button 
              onClick={() => handleNavClick('home')} 
              className="flex items-center gap-3 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-xl text-white tracking-tight">
                    AutoElite
                  </span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    BÁSICO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Seminovos Selecionados
                </p>
              </div>
            </button>
          </div>

          {/* Links Desktop (Abas) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Ações / WhatsApp Direto */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right hidden xl:block">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Plantão de Vendas</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {dealershipInfo.whatsappFormatado}
              </span>
            </div>

            <Button
              variant="whatsapp"
              size="sm"
              icon={MessageCircle}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Fale Conosco
            </Button>
          </div>

          {/* Botão Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-5 py-6 space-y-4 backdrop-blur-xl animate-fade-in">
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
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-900">
            <Button
              variant="whatsapp"
              size="md"
              icon={MessageCircle}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              WhatsApp do Plantão ({dealershipInfo.whatsappFormatado})
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
