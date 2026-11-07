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
  Share2,
  Sparkles,
  ShieldAlert,
  X
} from 'lucide-react';
import { useTier } from '../../context/TierContext';
import { useAuth } from '../../context/AuthContext';

export function MerchantSidebar({ activeTab, onSelectTab, isOpen, onClose }) {
  const { tier } = useTier();
  const { hasRole } = useAuth();

  // Definição dos itens de menu com restrição de tier mínimo e papéis permitidos
  const menuSections = [
    {
      title: 'Operação Diária',
      items: [
        {
          id: 'dashboard',
          label: 'Início & Indicadores',
          icon: LayoutDashboard,
          minTier: 1,
          roles: ['proprietario', 'gerente', 'atendente']
        },
        {
          id: 'inventory',
          label: 'Estoque de Veículos',
          icon: Car,
          minTier: 1,
          roles: ['proprietario', 'gerente', 'atendente']
        },
        {
          id: 'leads',
          label: 'Contatos & WhatsApp',
          icon: MessageSquare,
          minTier: 1,
          roles: ['proprietario', 'gerente', 'atendente']
        }
      ]
    },
    {
      title: 'Gestão & Negócios (Tier 2+)',
      minTier: 2,
      items: [
        {
          id: 'clients',
          label: 'Clientes (CRM)',
          icon: Users,
          minTier: 2,
          roles: ['proprietario', 'gerente', 'atendente']
        },
        {
          id: 'financing',
          label: 'Simulador Financiamento',
          icon: Calculator,
          minTier: 2,
          roles: ['proprietario', 'gerente']
        },
        {
          id: 'fipe',
          label: 'Precificador FIPE',
          icon: Tag,
          minTier: 2,
          roles: ['proprietario', 'gerente', 'atendente']
        },
        {
          id: 'contracts',
          label: 'Contratos & Termos',
          icon: FileText,
          minTier: 2,
          roles: ['proprietario', 'gerente']
        },
        {
          id: 'financial',
          label: 'Financeiro & Margens',
          icon: DollarSign,
          minTier: 2,
          roles: ['proprietario'] // Visível apenas para o proprietário (I8)
        },
        {
          id: 'analytics',
          label: 'Métricas do Site',
          icon: TrendingUp,
          minTier: 2,
          roles: ['proprietario', 'gerente']
        }
      ]
    },
    {
      title: 'Inteligência & Expansão (Tier 3)',
      minTier: 3,
      items: [
        {
          id: 'consignments',
          label: 'Consignação Completa',
          icon: FileText,
          minTier: 3,
          roles: ['proprietario', 'gerente']
        },
        {
          id: 'contracts_adv',
          label: 'Contratos Avançados & Troca',
          icon: FileText,
          minTier: 3,
          roles: ['proprietario', 'gerente']
        },
        {
          id: 'financial_full',
          label: 'DRE & Comissões Vendedores',
          icon: DollarSign,
          minTier: 3,
          roles: ['proprietario', 'gerente']
        },
        {
          id: 'market_pricing',
          label: 'Precificador Mercado & Leilão',
          icon: Tag,
          minTier: 3,
          roles: ['proprietario', 'gerente', 'atendente']
        },
        {
          id: 'funnel',
          label: 'Funil de Vendas & Giro',
          icon: TrendingUp,
          minTier: 3,
          roles: ['proprietario', 'gerente']
        },
        {
          id: 'stories',
          label: 'Estúdio de Stories 1080p',
          icon: Sparkles,
          minTier: 3,
          roles: ['proprietario', 'gerente', 'atendente']
        },
        {
          id: 'audit_lgpd',
          label: 'Auditoria & LGPD',
          icon: ShieldAlert,
          minTier: 3,
          roles: ['proprietario']
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
        className={`fixed lg:sticky top-0 lg:top-16 left-0 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-[#080d1a] border-r border-slate-800 flex flex-col z-50 lg:z-20 transition-transform duration-300 ease-in-out ${
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

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuSections.map((section, idx) => {
            // Oculta a seção inteira se o tier da loja for menor que o mínimo exigido
            if (section.minTier && tier < section.minTier) return null;

            // Filtra os itens da seção por tier e por role
            const visibleItems = section.items.filter(
              item => tier >= item.minTier && hasRole(item.roles)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                  {section.title}
                </p>
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        if (onClose) onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Rodapé do Menu com versão e tier */}
        <div className="p-4 border-t border-slate-800/60 text-[11px] text-slate-500 text-center">
          Auto-Dealership OS v1.0 • Tier {tier}
        </div>
      </aside>
    </>
  );
}

