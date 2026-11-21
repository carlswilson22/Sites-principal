import React, { useEffect, useId, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SiteAccountControls } from './SiteAccountControls';

export function SiteHeader({ currentPage, onNavigate, links, name, Logo, variant = 'classic', favoritesEnabled = false, favoritesCount = 0, favoritesActive = false }) {
  const [open, setOpen] = useState(false);
  const navigationId = useId();
  const editorial = variant === 'editorial';
  const workspace = variant === 'workspace';

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = event => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const navigate = page => { setOpen(false); onNavigate(page); };
  return <header style={{ backgroundColor: 'var(--store-header)', borderBottom: '1px solid var(--store-border)' }} className={`sticky top-0 z-40 ${editorial ? 'bg-[#050508]/95' : 'bg-slate-950/95'} backdrop-blur-xl ${currentPage === 'sobre-contato' ? '' : 'shadow-lg'}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-h-16 py-2">
        <a href="../" className="shrink-0 text-xs sm:text-sm text-slate-300 hover:text-white underline underline-offset-4 min-h-11 inline-flex items-center">Modelos</a>
        <button type="button" aria-label={`${name}: início`} onClick={() => navigate('home')} className={`min-w-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${editorial ? 'md:mx-auto' : ''}`}>
          {Logo ? <Logo size="sm" theme="dark" name={name} showIcon={false} /> : <span className="text-lg font-bold text-white">{name}</span>}
        </button>
        <div className="ml-auto shrink-0"><SiteAccountControls onNavigate={navigate} editorial={editorial} favoritesEnabled={favoritesEnabled} favoritesCount={favoritesCount} favoritesActive={favoritesActive} /></div>
        <button type="button" aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} aria-controls={navigationId} onClick={() => setOpen(value => !value)} className="md:hidden min-w-11 min-h-11 inline-flex items-center justify-center rounded-xl text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
          {open ? <X aria-hidden="true" className="w-5 h-5" /> : <Menu aria-hidden="true" className="w-5 h-5" />}
        </button>
      </div>
      <nav id={navigationId} aria-label="Navegação principal" className={`${open ? 'flex' : 'hidden'} md:flex flex-col md:flex-row md:items-center ${editorial ? 'md:justify-center' : ''} gap-1 pb-3 md:pb-2 max-h-[calc(100dvh-8rem)] overflow-y-auto overscroll-contain md:max-h-none md:overflow-visible`}>
        {links.map(link => <button key={link.id} type="button" aria-current={currentPage === link.id ? 'page' : undefined} style={currentPage === link.id ? { backgroundColor: 'var(--store-action)', color: '#fff', borderColor: 'var(--store-action)' } : undefined} onClick={() => navigate(link.id)} className={`min-h-11 px-3 sm:px-4 py-2 text-left text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${editorial ? `border-l-2 md:border-l-0 md:border-b-2 ${currentPage === link.id ? 'border-amber-200 text-amber-200' : 'border-transparent text-slate-300 hover:text-white'}` : workspace ? `rounded-lg ${currentPage === link.id ? 'bg-cyan-300 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}` : `rounded-xl ${currentPage === link.id ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-slate-800'}`}`}>
          {link.label}{link.count > 0 && <span className="ml-2 text-xs">{link.count}</span>}
        </button>)}
      </nav>
    </div>
  </header>;
}
