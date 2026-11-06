import React, { useState, useEffect } from 'react';
import { 
  Zap, Heart, Scale, Bot, Calculator, ArrowLeftRight, 
  Sparkles, Building2, Grid, Menu, X, ArrowLeft, MessageCircle 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { dealershipInfo } from '../../data/dealershipInfo';
import { buildGeneralWhatsappLink } from '../../utils/whatsapp';

export function Navbar({ 
  currentPage = 'home', 
  onNavigate, 
  favoritesCount = 0, 
  comparedCount = 0 
}) {
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
    { id: 'home', label: 'Início' },
    { id: 'estoque', label: 'Estoque' },
    { id: 'destaques', label: 'Destaques' },
    { id: 'consultor-ia', label: 'Consultor IA', badge: 'Novo' },
    { id: 'simulador', label: 'Simulador' },
    { id: 'troca', label: 'Troca Fácil' },
    { id: 'comparador', label: 'Comparador', count: comparedCount },
    { id: 'favoritos', label: 'Favoritos', count: favoritesCount },
    { id: 'sobre-contato', label: 'Sobre & Contato' }
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
        ? 'bg-[#070a12]/95 backdrop-blur-md border-b border-cyan-500/20 shadow-xl shadow-black/60 py-3' 
        : 'bg-[#070a12]/80 backdrop-blur-sm border-b border-slate-800 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Voltar ao Hub & Logotipo */}
          <div className="flex items-center gap-3">
            <a 
              href="/sites-modelos/"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors mr-1 sm:mr-2 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
              title="Voltar ao Showcase de Modelos"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hub</span>
            </a>

            <button 
              onClick={() => handleNavClick('home')} 
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 flex items-center justify-center text-black shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 fill-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-xl text-white tracking-tight">
                    DRIVENOW
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    COMPLETO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                  <Bot className="w-3 h-3 text-cyan-400" />
                  Inteligência Automotiva & Financiamento
                </p>
              </div>
            </button>
          </div>

          {/* Links Desktop (Abas) */}
          <nav className="hidden xl:flex items-center gap-1 p-1 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 relative ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold">
                      {link.badge}
                    </span>
                  )}
                  {link.count !== undefined && link.count > 0 && (
                    <span className="w-4 h-4 rounded-full bg-cyan-400 text-black text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {link.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Ações / WhatsApp Direto */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="whatsapp"
              size="sm"
              icon={MessageCircle}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Fale no WhatsApp
            </Button>
          </div>

          {/* Botão Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#070a12]/95 border-b border-slate-800 px-5 py-6 space-y-4 backdrop-blur-2xl animate-fade-in">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  {link.count !== undefined && link.count > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-black text-xs font-bold">
                      {link.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-800">
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
