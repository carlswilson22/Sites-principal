/**
 * packages/merchant-core/src/components/layout/MerchantNavbar.jsx
 * Barra superior do Painel do Lojista.
 */
import React from 'react';
import { ShieldCheck, LogOut, ExternalLink, Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTier } from '../../context/TierContext';

export function MerchantNavbar({ onToggleMobileMenu, storeName = 'Auto-Dealership', onExitToSite }) {
  const { user, logout } = useAuth();
  const { tier, tierName } = useTier();

  const getTierColor = () => {
    if (tier === 3) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (tier === 2) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  };

  const getRoleLabel = (role) => {
    if (role === 'proprietario') return 'Proprietário';
    if (role === 'gerente') return 'Gerente';
    return 'Atendente';
  };

  return (
    <header className="h-16 bg-[#0b1324] border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm sm:text-base tracking-tight">{storeName}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getTierColor()}`}>
                {tierName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Painel de Gestão da Concessionária</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notificações (Apenas Tier 2 e 3) */}
        {tier >= 2 && (
          <button
            type="button"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 relative transition-colors"
            title="Avisos e Notificações"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </button>
        )}

        {/* Perfil do Usuário */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-200">{user?.name || 'Lojista'}</span>
          <span className="text-[10px] text-slate-400 capitalize">{getRoleLabel(user?.role)}</span>
        </div>

        {/* Botão de Retornar ao Site Público */}
        {onExitToSite && (
          <button
            type="button"
            onClick={onExitToSite}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Visualizar Site da Loja"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ver Vitrine</span>
          </button>
        )}

        {/* Botão de Sair */}
        <button
          type="button"
          onClick={logout}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Encerrar Sessão"
          aria-label="Encerrar Sessão"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
