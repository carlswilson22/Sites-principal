import React from 'react';

export function SiteHeader({ currentPage, onNavigate, links, name, whatsappUrl, Logo }) {
  const activePage = currentPage === 'sobre-contato' ? 'visitas' : currentPage;
  return <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-700 shadow-lg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="min-h-20 flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <a href="../" className="shrink-0 text-sm text-slate-200 hover:text-white underline underline-offset-4">Modelos</a>
          <button type="button" aria-label={`${name}: início`} onClick={() => onNavigate('home')} className="text-left min-w-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
            {Logo ? <Logo size="sm" theme="dark" name={name} showIcon={false} /> : <span className="block text-sm font-bold text-white">{name}</span>}
          </button>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => onNavigate('painel-lojista')} className="min-h-11 px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm font-semibold hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">Painel <span className="hidden sm:inline">do lojista</span></button>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center min-h-11 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold hover:bg-emerald-400">Equipe no WhatsApp</a>
        </div>
      </div>
      <nav aria-label="Navegação principal" className="flex flex-wrap items-center gap-2 pb-3 pt-1">
        {links.map(link => <button key={link.id} type="button" aria-current={activePage === link.id ? 'page' : undefined}
          onClick={() => onNavigate(link.id)}
          className={`shrink-0 min-h-11 px-4 py-2.5 rounded-xl border text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${activePage === link.id ? 'bg-white text-slate-950 border-white shadow-sm' : 'bg-slate-900 text-slate-100 border-slate-600 hover:bg-slate-700 hover:border-slate-400'}`}>
          {link.label}{link.count > 0 && <span className="ml-2 px-1.5 rounded bg-slate-600 text-white text-xs">{link.count}</span>}
        </button>)}
      </nav>
    </div>
  </header>;
}
