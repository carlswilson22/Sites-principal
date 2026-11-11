import { canAccessMerchantRoute } from '../../utils/merchantAccess';
/**
 * packages/merchant-core/src/components/layout/MerchantSidebar.jsx
 * Menu lateral de navegação com filtragem estrita de Nível Cumulativo (Tier Gate) e Perfil (RBAC).
 */
import React from 'react';
import {
  LayoutDashboard,
  Car,
  Users,
  MessageSquare,
  Calculator,
  Tag,
  FileText,
  DollarSign,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  X
} from 'lucide-react';
import { useTier } from '../../context/TierContext';
import { useAuth } from '../../context/AuthContext';

export function MerchantSidebar({ activeTab, onSelectTab, isOpen, onClose, storeName }) {
  const { tier } = useTier();
  const { role } = useAuth();

  // Definição dos itens de menu com restrição de tier mínimo e papéis permitidos
  const menuSections = [
    {
      title: 'Operação Diária',
      items: [
        {
          id: 'dashboard',
          label: 'Início & Indicadores',
          icon: LayoutDashboard,
        },
        {
          id: 'inventory',
          label: 'Estoque de Veículos',
          icon: Car,
        },
        {
          id: 'financing',
          label: 'Simulador de financiamento',
          icon: Calculator,
        },
        {
          id: 'leads',
          label: 'Contatos & WhatsApp',
          icon: MessageSquare,
        },
        {
          id: 'contracts',
          label: 'Contratos & Termos',
          icon: FileText,
        }
      ]
    },
    {
      title: 'Gestão',
      minTier: 2,
      items: [
        {
          id: 'clients',
          label: 'Clientes (CRM)',
          icon: Users,
        },
        {
          id: 'fipe',
          label: 'Precificador FIPE',
          icon: Tag,
        },
        {
          id: 'financial',
          label: 'Financeiro & Margens',
          icon: DollarSign,
        },
        {
          id: 'analytics',
          label: 'Métricas do Site',
          icon: TrendingUp,
        }
      ]
    },
    {
      title: 'Ferramentas',
      minTier: 3,
      items: [
        {
          id: 'consignments',
          label: 'Consignação Completa',
          icon: FileText,
        },
        {
          id: 'contracts_adv',
          label: 'Contratos Avançados & Troca',
          icon: FileText,
        },
        {
          id: 'financial_full',
          label: 'DRE & Comissões Vendedores',
          icon: DollarSign,
        },
        {
          id: 'market_pricing',
          label: 'Precificador Mercado & Leilão',
          icon: Tag,
        },
        {
          id: 'funnel',
          label: 'Funil de Vendas & Giro',
          icon: TrendingUp,
        },
        {
          id: 'stories',
          label: 'Estúdio de Stories 1080p',
          icon: Sparkles,
        },
        {
          id: 'audit_lgpd',
          label: 'Auditoria & LGPD',
          icon: ShieldAlert,
        }
      ]
    }
  ];

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 h-screen lg:h-[calc(100vh-4rem)] w-64 shrink-0 bg-[#080d1a] border-r border-slate-800 flex flex-col z-50 lg:z-20 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header mobile com botão de fechar */}
        <div className="lg:hidden h-16 border-b border-slate-800 px-4 flex items-center justify-between">
          <span className="font-bold text-white text-sm">Menu do Painel</span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav aria-label="Navegação do painel" className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuSections.map((section, idx) => {
            // Oculta a seção inteira se o tier da loja for menor que o mínimo exigido
            if (section.minTier && tier < section.minTier) return null;

            // Filtra os itens da seção por tier e por role
            const visibleItems = section.items.filter(
              item => canAccessMerchantRoute(item.id, tier, role)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => {
                        onSelectTab(item.id);
                        if (onClose) onClose();
                      }}
                      className={`w-full min-h-11 flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm leading-5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon aria-hidden="true" className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="min-w-0 flex-1 whitespace-normal">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Rodapé do Menu com versão e tier */}
        <div className="p-4 border-t border-slate-800/60 text-[11px] text-slate-500 text-center">
          {storeName} · Painel do lojista
        </div>
      </aside>
    </>
  );
}

