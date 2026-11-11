import React, { useId, useState } from 'react';
import { ArrowLeft, Home, X } from 'lucide-react';
import { useDialog } from './useDialog';
import { AccountLoginForm } from './AccountLoginForm';
import { accountFocus, getAccountTheme } from './accountThemes';

export function AccountLoginDialog({ audience, reason, storeKey, storeName, onClose, onSuccess }) {
  const dialogRef = useDialog(onClose);
  const id = useId();
  const [selected, setSelected] = useState(audience);
  const theme = getAccountTheme(storeKey);
  return <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={id} aria-describedby={`${id}-description`} tabIndex={-1} data-account-theme={theme.variant} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-[80] bg-slate-950/90 p-4 sm:p-6 flex items-center justify-center overflow-y-auto">
    <div className="w-full max-w-[480px] max-h-[calc(100dvh-2rem)] overflow-y-auto text-white">
      <div className={`relative border p-5 sm:p-8 shadow-2xl space-y-6 ${theme.card}`}>
        <button type="button" aria-label="Fechar login" onClick={onClose} className={`absolute right-2 top-2 min-w-11 min-h-11 rounded-lg text-slate-400 hover:text-white flex items-center justify-center ${accountFocus} ${theme.focus}`}><X aria-hidden="true" className="w-5 h-5" /></button>
        <div className={theme.variant === 'workspace' ? 'pr-8 space-y-3' : 'px-5 text-center space-y-3'}><p className={`text-xs font-semibold uppercase tracking-widest break-words ${theme.accent}`}>{storeName}</p><h2 id={id} className={`text-2xl ${theme.heading}`}>{selected === 'staff' ? 'Acesso da equipe' : 'Acesse sua conta'}</h2><p id={`${id}-description`} className="text-sm leading-relaxed text-slate-400">{selected === 'staff' ? 'O painel de gestão é exclusivo dos funcionários da loja.' : reason || 'Entre para acessar suas ferramentas e encontrar seu próximo veículo.'}</p></div>
        <AccountLoginForm key={selected} audience={selected} theme={theme} onSuccess={onSuccess} />
        <div className={`border-t pt-3 text-center ${theme.divider}`}><button type="button" onClick={() => setSelected(selected === 'staff' ? 'customer' : 'staff')} className={`min-h-11 inline-flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white ${accountFocus} ${theme.focus}`}>{selected === 'staff' && <ArrowLeft aria-hidden="true" className="w-4 h-4" />}{selected === 'staff' ? 'Voltar ao acesso de cliente' : 'Equipe da loja'}</button></div>
      </div>
      <button type="button" onClick={onClose} className={`min-h-11 mt-3 w-full inline-flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white ${accountFocus} ${theme.focus}`}><Home aria-hidden="true" className="w-4 h-4" />Continuar navegando</button>
    </div>
  </div>;
}
