import React from 'react';
import { SiteAccountControls } from './SiteAccountControls';

export function SiteHeader({ currentPage, onNavigate, links, name, Logo, variant = 'classic' }) {
  const editorial = variant === 'editorial';
  const workspace = variant === 'workspace';
  const brand = <button type="button" aria-label={`${name}: início`} onClick={() => onNavigate('home')} className="text-left min-w-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">{Logo ? <Logo size="sm" theme="dark" name={name} showIcon={false} /> : <span className="text-lg font-bold text-white">{name}</span>}</button>;
  const models = <a href="../" className="shrink-0 text-xs sm:text-sm text-slate-300 hover:text-white underline underline-offset-4 min-h-11 inline-flex items-center">Modelos</a>;
  const account = <SiteAccountControls onNavigate={onNavigate} editorial={editorial} />;
  const nav = <nav aria-label="Navegação principal" className={`flex items-center gap-1 sm:gap-2 overflow-x-auto ${editorial ? 'justify-start md:justify-center py-2' : 'py-2'}`}>
    {links.map(link => <button key={link.id} type="button" aria-current={currentPage === link.id ? 'page' : undefined} onClick={() => onNavigate(link.id)} className={`shrink-0 min-h-11 px-3 sm:px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${editorial ? `border-b-2 ${currentPage === link.id ? 'border-amber-200 text-amber-200' : 'border-transparent text-slate-300 hover:text-white'}` : workspace ? `rounded-lg ${currentPage === link.id ? 'bg-cyan-300 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}` : `rounded-xl ${currentPage === link.id ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-slate-800'}`}`}>{link.label}{link.count > 0 && <span className="ml-2 text-xs">{link.count}</span>}</button>)}
  </nav>;
  return <header className={`sticky top-0 z-40 ${editorial ? 'bg-[#050508]/95' : 'bg-slate-950/95'} backdrop-blur-xl ${currentPage === 'sobre-contato' ? '' : 'shadow-lg'}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {editorial ? <>
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 min-h-20 py-3">{models}<div className="flex justify-center min-w-0">{brand}</div>{account}</div>
        {nav}
      </> : workspace ? <>
        <div className="flex items-center justify-between gap-4 min-h-20 py-3"><div className="flex items-center gap-4 min-w-0">{models}{brand}</div><div className="shrink-0">{account}</div></div>
        <div className="rounded-t-xl bg-slate-900/80 px-1">{nav}</div>
      </> : <div className="flex flex-wrap xl:flex-nowrap items-center justify-between gap-x-5 py-2">
        <div className="flex items-center gap-4 min-w-0 min-h-16">{models}{brand}</div>
        <div className="order-3 xl:order-none w-full xl:w-auto">{nav}</div>
        <div className="shrink-0">{account}</div>
      </div>}
    </div>
  </header>;
}
