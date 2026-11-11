import React from 'react';
import { AccountLoginForm } from '../components/common/AccountLoginForm';
import { accountFocus, getAccountTheme } from '../components/common/accountThemes';

export function LoginView({ onLoginSuccess, onCancel, storeKey, storeName = 'Loja' }) {
  const theme = getAccountTheme(storeKey);
  return <div data-account-theme={theme.variant} className="min-h-screen bg-slate-950 p-5 text-white flex items-center justify-center"><section className={`w-full max-w-[480px] border p-6 sm:p-8 space-y-6 ${theme.card}`}>
    <div><p className={`text-xs uppercase tracking-widest ${theme.accent}`}>{storeName}</p><h1 className={`mt-3 text-2xl ${theme.heading}`}>Acesso da equipe</h1></div>
    <AccountLoginForm staffOnly theme={theme} onSuccess={onLoginSuccess} />
    {onCancel && <button type="button" onClick={onCancel} className={`min-h-11 text-sm underline ${theme.accent} ${accountFocus} ${theme.focus}`}>Voltar para a vitrine</button>}
  </section></div>;
}
