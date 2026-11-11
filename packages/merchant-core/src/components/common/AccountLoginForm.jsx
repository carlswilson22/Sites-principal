import React, { useId, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function AccountLoginForm({ audience = 'customer', onSuccess }) {
  const { login, isDemoMode } = useAuth();
  const id = useId();
  const busy = useRef(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async event => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true; setLoading(true); setError('');
    try { const user = await login(email, password, audience); onSuccess?.(user); }
    catch (failure) { setError(failure.message || 'Não foi possível entrar.'); }
    finally { busy.current = false; setLoading(false); }
  };
  const field = 'mt-2 w-full min-h-12 rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300';
  return <form aria-label={audience === 'staff' ? 'Login da equipe' : 'Login de cliente'} onSubmit={submit} className="space-y-5">
    <label htmlFor={`${id}-email`} className="block text-sm text-slate-300">E-mail<input id={`${id}-email`} type="email" name="email" autoComplete="username" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} className={field} /></label>
    <label htmlFor={`${id}-password`} className="block text-sm text-slate-300">Senha<input id={`${id}-password`} type="password" name="password" autoComplete="current-password" required maxLength={128} value={password} onChange={event => setPassword(event.target.value)} className={field} /></label>
    {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
    <button type="submit" disabled={loading} className="min-h-12 w-full rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 font-semibold text-white disabled:opacity-50">{loading ? 'Entrando…' : audience === 'staff' ? 'Entrar como equipe' : 'Entrar como cliente'}</button>
    {isDemoMode && audience === 'customer' && <div className="rounded-xl bg-slate-800/70 p-4 text-xs text-slate-300 space-y-3">
      <p>Teste com uma conta fictícia. E-mail: <span className="break-all">cliente@demo.invalid</span> · Senha: Cliente@2026.</p>
      <button type="button" onClick={() => { setEmail('cliente@demo.invalid'); setPassword('Cliente@2026'); setError(''); }} className="min-h-11 text-blue-200 underline underline-offset-4">Preencher acesso de teste</button>
    </div>}
    {audience === 'staff' && <p className="text-xs text-slate-400">Use as credenciais fornecidas pela loja. Este acesso é reservado à equipe.</p>}
  </form>;
}
