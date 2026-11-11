import React from 'react';
import { AccountLoginForm } from '../components/common/AccountLoginForm';

export function LoginView({ onLoginSuccess, onCancel, storeName = 'Loja' }) {
  return <div className="min-h-screen bg-slate-950 p-5 text-white flex items-center justify-center"><section className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-6">
    <div><p className="text-sm text-blue-200">{storeName}</p><h1 className="mt-2 text-2xl font-bold">Acesso da equipe</h1></div>
    <AccountLoginForm audience="staff" onSuccess={onLoginSuccess} />
    {onCancel && <button type="button" onClick={onCancel} className="min-h-11 text-sm underline">Voltar para a vitrine</button>}
  </section></div>;
}
