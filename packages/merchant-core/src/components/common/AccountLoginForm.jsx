import React, { useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { accountFocus, getAccountTheme } from './accountThemes';

export function AccountLoginForm({ audience = 'customer', onSuccess, theme = getAccountTheme() }) {
  const { login, isDemoMode } = useAuth();
  const id = useId();
  const busy = useRef(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const staff = audience === 'staff';
  const changeMode = next => { setMode(next); setError(''); setShowPassword(false); };
  const authenticate = async (accountEmail, accountPassword) => {
    if (busy.current) return;
    busy.current = true; setLoading(true); setError('');
    try { const user = await login(accountEmail, accountPassword, audience); onSuccess?.(user); }
    catch (failure) { setError(failure.message || 'Não foi possível entrar.'); }
    finally { busy.current = false; setLoading(false); }
  };
  const submit = event => { event.preventDefault(); authenticate(email, password); };
  const fillDemo = () => { setEmail('cliente@demo.invalid'); setPassword('Cliente@2026'); changeMode('login'); };
  const link = `min-h-11 inline-flex items-center justify-center text-xs font-semibold ${theme.accent} ${accountFocus} ${theme.focus}`;
  const primary = `min-h-12 w-full px-5 py-3 inline-flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-wait ${theme.primary} ${accountFocus} ${theme.focus}`;
  const field = `flex items-center gap-3 border px-3 transition-colors ${theme.field}`;
  const input = `min-w-0 w-full min-h-12 bg-transparent py-3 text-sm text-white placeholder:text-slate-500 ${accountFocus} ${theme.focus}`;
  return <div className="space-y-6">
    {!staff && <div role="group" aria-label="Acesso à conta" className={`grid grid-cols-2 gap-1 border p-1 ${theme.tabs}`}>
      {[['login', 'Fazer login'], ['create', 'Criar conta']].map(([value, label]) => <button key={value} type="button" disabled={loading} aria-pressed={mode === value || (mode === 'recover' && value === 'login')} onClick={() => changeMode(value)} className={`min-h-11 px-3 text-sm font-semibold transition-colors ${mode === value || (mode === 'recover' && value === 'login') ? theme.active : theme.inactive} ${accountFocus} ${theme.focus}`}>{label}</button>)}
    </div>}
    {mode === 'login' ? <>
      <form aria-label={staff ? 'Login da equipe' : 'Login de cliente'} onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor={`${id}-email`} className="block text-xs font-semibold uppercase tracking-widest text-slate-300">E-mail</label>
          <div className={field}><Mail aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-500" /><input id={`${id}-email`} type="email" name="email" autoComplete="username" required maxLength={254} placeholder="exemplo@email.com" value={email} onChange={event => setEmail(event.target.value)} className={input} /></div>
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-x-3"><label htmlFor={`${id}-password`} className="text-xs font-semibold uppercase tracking-widest text-slate-300">Senha</label><button type="button" disabled={loading} onClick={() => changeMode('recover')} className={`${link} uppercase`}>Esqueceu a senha?</button></div>
          <div className={field}><LockKeyhole aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-500" /><input id={`${id}-password`} type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" required maxLength={128} placeholder="Sua senha" value={password} onChange={event => setPassword(event.target.value)} className={input} /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} aria-controls={`${id}-password`} onClick={() => setShowPassword(value => !value)} className={`shrink-0 min-w-11 min-h-11 flex items-center justify-center rounded text-slate-400 hover:text-white ${accountFocus} ${theme.focus}`}>{showPassword ? <EyeOff aria-hidden="true" className="w-4 h-4" /> : <Eye aria-hidden="true" className="w-4 h-4" />}</button></div>
        </div>
        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        <button type="submit" disabled={loading} className={primary}>{loading ? 'Entrando…' : staff ? 'Acessar painel da loja' : 'Acessar plataforma'}<ArrowRight aria-hidden="true" className="w-4 h-4 shrink-0" /></button>
      </form>
      {isDemoMode && !staff && <div className={`border p-3 text-xs text-slate-400 ${theme.note}`}><p>Conheça as ferramentas com uma conta fictícia.</p><button type="button" disabled={loading} onClick={fillDemo} className={link}>Preencher acesso de teste</button></div>}
      {staff ? <p className="text-xs leading-relaxed text-slate-400">Use as credenciais fornecidas pela loja. Este acesso é reservado à equipe.</p> : <div className={`flex flex-wrap items-center justify-center gap-x-2 border-t pt-4 text-sm text-slate-400 ${theme.divider}`}><span>Ainda não tem conta?</span><button type="button" disabled={loading} onClick={() => changeMode('create')} className={`${link} uppercase`}>Cadastre-se</button></div>}
    </> : mode === 'create' && !staff ? <section aria-label="Criar conta de cliente" className="space-y-5">
      <div className={`border p-4 space-y-3 ${theme.note}`}><UserRound aria-hidden="true" className={`w-6 h-6 ${theme.accent}`} /><h3 className="font-semibold text-white">Sua conta de cliente</h3><p className="text-sm leading-relaxed text-slate-300">Acesse as ferramentas pessoais e continue explorando os veículos da loja.</p><p className="text-xs leading-relaxed text-slate-400">{isDemoMode ? 'Nesta demonstração, você usará uma conta fictícia já preparada. O cadastro com seus dados estará disponível no site da loja.' : 'O cadastro de clientes estará disponível após a integração com a loja.'}</p></div>
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      {isDemoMode && <button type="button" disabled={loading} onClick={() => authenticate('cliente@demo.invalid', 'Cliente@2026')} className={primary}>{loading ? 'Entrando…' : 'Experimentar conta de cliente'}<ArrowRight aria-hidden="true" className="w-4 h-4 shrink-0" /></button>}
      <button type="button" disabled={loading} onClick={() => changeMode('login')} className={link}>Já tenho conta · Fazer login</button>
    </section> : <section aria-label="Recuperar acesso" className="space-y-5">
      <div className={`border p-4 space-y-3 ${theme.note}`}><LockKeyhole aria-hidden="true" className={`w-6 h-6 ${theme.accent}`} /><h3 className="font-semibold text-white">Recupere seu acesso</h3><p className="text-sm leading-relaxed text-slate-300">{staff ? 'Peça ao administrador da loja a recuperação do seu acesso à equipe.' : isDemoMode ? 'A conta de teste usa as credenciais abaixo. No site da loja, a recuperação será feita pelo e-mail cadastrado.' : 'Para recuperar sua senha, entre em contato com a loja.'}</p>{isDemoMode && !staff && <dl className="space-y-2 text-sm"><div><dt className="text-xs text-slate-400">E-mail de teste</dt><dd className="break-all text-white">cliente@demo.invalid</dd></div><div><dt className="text-xs text-slate-400">Senha de teste</dt><dd className="text-white">Cliente@2026</dd></div></dl>}</div>
      {isDemoMode && !staff && <button type="button" onClick={fillDemo} className={primary}>Preencher acesso de teste<ArrowRight aria-hidden="true" className="w-4 h-4 shrink-0" /></button>}
      <button type="button" onClick={() => changeMode('login')} className={`${link} gap-2`}><ArrowLeft aria-hidden="true" className="w-4 h-4" />Voltar ao login</button>
    </section>}
  </div>;
}
