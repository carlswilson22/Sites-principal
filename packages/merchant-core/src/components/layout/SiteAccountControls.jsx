import React, { useEffect, useRef, useState } from 'react';
import { Heart, UserRound } from 'lucide-react';
import { useStoreAccess } from '../../context/StoreAccessContext';

export function SiteAccountControls({ onNavigate, editorial, favoritesEnabled = false, favoritesCount = 0, favoritesActive = false }) {
  const { user, isStaff, requestLogin, logout, loading } = useStoreAccess();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = event => { if (event.type === 'keydown' ? event.key === 'Escape' : !ref.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
  }, [open]);
  const button = `min-h-11 rounded-xl px-3 py-2 text-sm font-semibold whitespace-nowrap ${editorial ? 'text-amber-200 hover:bg-white/5' : 'bg-slate-800 text-white hover:bg-slate-700'}`;
  return <div ref={ref} className="relative flex items-center gap-2">
    {favoritesEnabled && <button type="button" aria-label="Ver carros favoritos" aria-current={favoritesActive ? 'page' : undefined} title={user ? 'Ver carros favoritos' : 'Entre para ver seus carros favoritos'} data-favorites-count={user ? favoritesCount : 0} disabled={loading} onClick={() => { setOpen(false); onNavigate('favoritos'); }} className={`relative min-w-11 min-h-11 rounded-xl inline-flex items-center justify-center text-cyan-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200 ${favoritesActive ? 'bg-slate-800' : ''}`}><Heart aria-hidden="true" className="w-5 h-5" />{user && <span aria-hidden="true" className="absolute -top-1 -right-1 min-w-4 px-1 rounded-full bg-cyan-300 text-slate-950 text-[10px] leading-4 font-bold">{favoritesCount}</span>}</button>}
    {isStaff && <button type="button" aria-label="Painel do lojista" onClick={() => onNavigate('painel-lojista')} className={button}>Painel <span className="hidden sm:inline">do lojista</span></button>}
    {user ? <button type="button" aria-label="Minha conta" aria-expanded={open} aria-haspopup="menu" onClick={() => { setOpen(value => !value); setError(''); }} className={`${button} inline-flex items-center gap-2`}><UserRound aria-hidden="true" className="w-4 h-4" /><span className={isStaff ? 'hidden lg:inline' : ''}>Minha conta</span></button> : <button type="button" disabled={loading} onClick={() => requestLogin()} className={button}>Entrar</button>}
    {open && user && <div role="menu" aria-label="Sua conta" className="absolute top-full right-0 mt-3 w-64 max-w-[85vw] z-50 rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200 shadow-2xl">
      <p className="font-semibold text-white">{user.name}</p><p className="mt-1 text-xs text-slate-400 break-all">{user.email}</p>
      <button type="button" role="menuitem" onClick={async () => { try { await logout(); setOpen(false); } catch (failure) { setError(failure.message); } }} className="mt-2 min-h-11 w-full text-left text-rose-200 hover:text-white">Sair da conta</button>
      {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
    </div>}
  </div>;
}
