import React, { useEffect, useState } from 'react';
import { LayoutDashboard, CalendarDays, Car, MessageSquare, Calculator, Tags, FileSignature,
  CircleDollarSign, ChartColumn, Sparkles, ShieldAlert, X, ChevronDown, Handshake, Coins,
  Scale, ChartSpline } from 'lucide-react';
import { useTier } from '../../context/TierContext';
import { useAuth } from '../../context/AuthContext';
import { canAccessMerchantRoute } from '../../utils/merchantAccess';

export function MerchantSidebar({ activeTab, onSelectTab, isOpen, onClose }) {
  const { tier } = useTier();
  const { role } = useAuth();
  const [expanded, setExpanded] = useState({ 'Operação diária': true, 'Financeiro e gestão': true });
  const sections = [
    { title: 'Operação diária', items: [
      { id: 'dashboard', label: 'Início & Indicadores', icon: LayoutDashboard },
      { id: 'inventory', label: 'Estoque de Veículos', icon: Car },
      { id: 'leads', label: 'Contatos & WhatsApp', icon: MessageSquare },
      { id: 'agenda', label: 'Agenda e próximas ações', icon: CalendarDays },
      { id: 'contracts', label: 'Contratos & Termos', icon: FileSignature },
      { id: 'consignments', label: 'Consignação', icon: Handshake },
    ] },
    { title: 'Financeiro e gestão', items: [
      { id: 'financing', label: 'Simulador de financiamento', icon: Calculator },
      { id: 'fipe', label: 'Precificador FIPE', icon: Tags },
      { id: 'financial', label: 'Financeiro & Margens', icon: CircleDollarSign },
      { id: 'financial_full', label: 'DRE & Comissões Vendedores', icon: Coins },
      { id: 'market_pricing', label: 'Precificador Mercado & Leilão', icon: Scale },
      { id: 'analytics', label: 'Métricas do Site', icon: ChartColumn },
      { id: 'funnel', label: 'Funil de Vendas & Giro', icon: ChartSpline },
      { id: 'stories', label: 'Estúdio de Stories 1080p', icon: Sparkles },
      { id: 'audit_lgpd', label: 'Auditoria & LGPD', icon: ShieldAlert },
    ] },
  ].map(section => ({ ...section, items: section.items.filter(item => canAccessMerchantRoute(item.id, tier, role)) }));
  // Se um perfil tiver apenas uma ferramenta na segunda seção, ela fica na primeira.
  if (sections[1].items.length === 1) sections[0].items.push(...sections[1].items.splice(0));
  const visibleSections = sections.filter(section => section.items.length);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = event => { if (event.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    const section = visibleSections.find(group => group.items.some(item => item.id === activeTab));
    if (section) setExpanded(current => current[section.title] ? current : { ...current, [section.title]: true });
  }, [activeTab, tier, role]);

  return <>
    {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" aria-hidden="true" />}
    <aside id="merchant-navigation" className={`fixed lg:sticky top-0 lg:top-16 left-0 h-[100dvh] lg:h-[calc(100vh-4rem)] w-64 max-w-[85vw] shrink-0 bg-white border-r border-slate-200 flex-col z-50 lg:z-20 ${isOpen ? 'flex' : 'hidden lg:flex'}`}>
      <div className="lg:hidden h-16 border-b border-slate-800 px-4 flex items-center justify-between"><span className="font-bold text-white text-sm">Menu do Painel</span><button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-white" aria-label="Fechar menu"><X className="w-5 h-5" /></button></div>
      <nav aria-label="Navegação do painel" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-8 space-y-5">
        {visibleSections.map(section => <details key={section.title} open={Boolean(expanded[section.title])} onToggle={event => {
          const open = event.currentTarget.open;
          setExpanded(current => current[section.title] === open ? current : { ...current, [section.title]: open });
        }} className="group space-y-1">
          <summary className="min-h-10 px-3 flex cursor-pointer items-center justify-between gap-2 rounded-lg text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">{section.title}<ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
          <div className="space-y-1">{section.items.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return <button key={id} type="button" aria-current={active ? 'page' : undefined} onClick={() => { onSelectTab(id); onClose?.(); }} className={`w-full min-h-11 flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm leading-5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}><Icon aria-hidden="true" className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} /><span className="min-w-0 flex-1 whitespace-normal">{label}</span></button>;
          })}</div>
        </details>)}
      </nav>
    </aside>
  </>;
}
