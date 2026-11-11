import React, { useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { accountFocus, getAccountTheme } from './accountThemes';

export function AccountLoginForm({ staffOnly = false, onSuccess, theme = getAccountTheme() }) {
  const { login } = useAuth();
  const id = useId();
  const busy = useRef(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const changeMode = next => { setMode(next); setError(''); setShowPassword(false); };
  const authenticate = async (accountEmail, accountPassword) => {
    if (busy.current) return;
    busy.current = true; setLoading(true); setError('');
    try { const user = await login(accountEmail, accountPassword, { staffOnly }); onSuccess?.(user); }
    catch (failure) { setError(failure.message || 'Não foi possível entrar.'); }
    finally { busy.current = false; setLoading(false); }
  };
  const submit = event => { event.preventDefault(); authenticate(email, password); };
  const link = `min-h-11 inline-flex items-center justify-center text-xs font-semibold ${theme.accent} ${accountFocus} ${theme.focus}`;
  const primary = `min-h-12 w-full px-5 py-3 inline-flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-wait ${theme.primary} ${accountFocus} ${theme.focus}`;
  const field = `flex items-center gap-3 border px-3 transition-colors ${theme.field}`;
  const input = 'min-w-0 w-full min-h-12 bg-transparent py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none';
  return <div className="space-y-6">
    {!staffOnly && <div role="group" aria-label="Acesso à conta" className={`grid grid-cols-2 gap-1 border p-1 ${theme.tabs}`}>
      {[['login', 'Fazer login'], ['create', 'Criar conta']].map(([value, label]) => <button key={value} type="button" disabled={loading} aria-pressed={mode === value || (mode === 'recover' && value === 'login')} onClick={() => changeMode(value)} className={`min-h-11 px-3 text-sm font-semibold transition-colors ${mode === value || (mode === 'recover' && value === 'login') ? theme.active : theme.inactive} ${accountFocus} ${theme.focus}`}>{label}</button>)}
    </div>}
    {mode === 'login' ? <>
      <form aria-label="Login da loja" onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor={`${id}-email`} className="block text-xs font-semibold uppercase tracking-widest text-slate-300">E-mail</label>
          <div className={field}><Mail aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-500" /><input id={`${id}-email`} type="email" name="email" autoComplete="username" required maxLength={254} placeholder="exemplo@email.com" value={email} onChange={event => setEmail(event.target.value)} className={input} /></div>
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-x-3"><label htmlFor={`${id}-password`} className="text-xs font-semibold uppercase tracking-widest text-slate-300">Senha</label><button type="button" disabled={loading} onClick={() => changeMode('recover')} className={`${link} uppercase`}>Esqueceu a senha?</button></div>
          <div className={field}><LockKeyhole aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-500" /><input id={`${id}-password`} type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" required maxLength={128} placeholder="Sua senha" value={password} onChange={event => setPassword(event.target.value)} className={input} /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} aria-controls={`${id}-password`} onClick={() => setShowPassword(value => !value)} className={`shrink-0 min-w-11 min-h-11 flex items-center justify-center rounded text-slate-400 hover:text-white ${accountFocus} ${theme.focus}`}>{showPassword ? <EyeOff aria-hidden="true" className="w-4 h-4" /> : <Eye aria-hidden="true" className="w-4 h-4" />}</button></div>
        </div>
        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        <button type="submit" disabled={loading} className={primary}>{loading ? 'Entrando…' : staffOnly ? 'Acessar painel da loja' : 'Acessar plataforma'}<ArrowRight aria-hidden="true" className="w-4 h-4 shrink-0" /></button>
      </form>
      {staffOnly ? <p className="text-xs leading-relaxed text-slate-400">Use as credenciais fornecidas pela loja. Este acesso é reservado à equipe.</p> : <div className={`flex flex-wrap items-center justify-center gap-x-2 border-t pt-4 text-sm text-slate-400 ${theme.divider}`}><span>Ainda não tem conta?</span><button type="button" disabled={loading} onClick={() => changeMode('create')} className={`${link} uppercase`}>Cadastre-se</button></div>}
    </> : mode === 'create' && !staffOnly ? <section aria-label="Criar conta de cliente" className="space-y-5">
      <div className={`border p-4 space-y-3 ${theme.note}`}><UserRound aria-hidden="true" className={`w-6 h-6 ${theme.accent}`} /><h3 className="font-semibold text-white">Sua conta de cliente</h3><p className="text-sm leading-relaxed text-slate-300">O cadastro de clientes estará disponível no site da loja. Se você já tem uma conta, entre com seu e-mail e senha.</p></div>
      <button type="button" disabled={loading} onClick={() => changeMode('login')} className={link}>Já tenho conta · Fazer login</button>
    </section> : <section aria-label="Recuperar acesso" className="space-y-5">
      <div className={`border p-4 space-y-3 ${theme.note}`}><LockKeyhole aria-hidden="true" className={`w-6 h-6 ${theme.accent}`} /><h3 className="font-semibold text-white">Recupere seu acesso</h3><p className="text-sm leading-relaxed text-slate-300">{staffOnly ? 'Peça ao administrador da loja a recuperação do seu acesso à equipe.' : 'Para recuperar sua senha, entre em contato com a loja. Funcionários devem solicitar a recuperação ao administrador da loja.'}</p></div>
      <button type="button" onClick={() => changeMode('login')} className={`${link} gap-2`}><ArrowLeft aria-hidden="true" className="w-4 h-4" />Voltar ao login</button>
    </section>}
  </div>;
}
