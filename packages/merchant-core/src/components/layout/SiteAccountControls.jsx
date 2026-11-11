import React, { useEffect, useRef, useState } from 'react';
import { UserRound } from 'lucide-react';
import { useStoreAccess } from '../../context/StoreAccessContext';

export function SiteAccountControls({ onNavigate, editorial }) {
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
  if (!user) return <button type="button" disabled={loading} onClick={() => requestLogin()} className={button}>Entrar</button>;
  return <div ref={ref} className="relative flex items-center gap-2">
    {isStaff && <button type="button" aria-label="Painel do lojista" onClick={() => onNavigate('painel-lojista')} className={button}>Painel <span className="hidden sm:inline">do lojista</span></button>}
    <button type="button" aria-label="Minha conta" aria-expanded={open} aria-haspopup="menu" onClick={() => { setOpen(value => !value); setError(''); }} className={`${button} inline-flex items-center gap-2`}><UserRound aria-hidden="true" className="w-4 h-4" /><span className={isStaff ? 'hidden lg:inline' : ''}>Minha conta</span></button>
    {open && <div role="menu" aria-label="Sua conta" className="absolute top-full right-0 mt-3 w-64 max-w-[85vw] z-50 rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200 shadow-2xl">
      <p className="font-semibold text-white">{user.name}</p><p className="mt-1 text-xs text-slate-400 break-all">{user.email}</p>
      <button type="button" role="menuitem" onClick={async () => { try { await logout(); setOpen(false); } catch (failure) { setError(failure.message); } }} className="mt-2 min-h-11 w-full text-left text-rose-200 hover:text-white">Sair da conta</button>
      {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
    </div>}
  </div>;
}
