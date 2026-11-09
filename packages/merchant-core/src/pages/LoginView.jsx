import { isDemoMode } from '../services/demoConfig';
/**
 * packages/merchant-core/src/pages/LoginView.jsx
 * Tela de Autenticação Segura e Recuperação de Senha (E1 - Nível 1)
 */
import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTier } from '../context/TierContext';

export function LoginView({ onLoginSuccess, onCancel }) {
  const { login } = useAuth();
  const { tierName } = useTier();
  const [email, setEmail] = useState(isDemoMode ? 'proprietario@demo.invalid' : '');
  const [password, setPassword] = useState(isDemoMode ? 'Demonstracao@2026' : '');
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverSent, setRecoverSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = (e) => {
    e.preventDefault();
    if (!recoverEmail) return;
    setRecoverSent(true);
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0b1324] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Painel do Lojista
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isDemoMode ? 'Demonstração do painel' : 'Área de Gestão Restrita'} • <span className="text-blue-400 font-semibold">{tierName}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isRecovering ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail Profissional</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@concessionaria.com.br"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Senha</label>
                <button
                  type="button"
                  onClick={() => setIsRecovering(true)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all mt-2"
            >
              <span>{loading ? 'Entrando...' : 'Acessar Painel'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Acesso Rápido de Demonstração */}
            {isDemoMode && <div className="pt-4 border-t border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block text-center mb-2">
                Acesso de Teste / Demonstração:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('proprietario@demo.invalid');
                    setPassword('Demonstracao@2026');
                    try {
                      setLoading(true);
                      await login('proprietario@demo.invalid', 'Demonstracao@2026');
                      if (onLoginSuccess) onLoginSuccess();
                    } catch (e) {
                      setError(e.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-amber-400 text-center transition-colors"
                >
                  Proprietário
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('gerente@demo.invalid');
                    setPassword('Demonstracao@2026');
                    try {
                      setLoading(true);
                      await login('gerente@demo.invalid', 'Demonstracao@2026');
                      if (onLoginSuccess) onLoginSuccess();
                    } catch (e) {
                      setError(e.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-blue-400 text-center transition-colors"
                >
                  Gerente
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('atendente@demo.invalid');
                    setPassword('Demonstracao@2026');
                    try {
                      setLoading(true);
                      await login('atendente@demo.invalid', 'Demonstracao@2026');
                      if (onLoginSuccess) onLoginSuccess();
                    } catch (e) {
                      setError(e.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-emerald-400 text-center transition-colors"
                >
                  Atendente
                </button>
              </div>
            </div>}
          </form>
        ) : (
          <form onSubmit={handleRecover} className="space-y-4">
            {recoverSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Recuperação não configurada</h3>
                <p className="text-xs text-slate-300">
                  Nenhum e-mail foi enviado. Na demonstração, retorne e escolha um dos perfis de teste. O envio real exige configuração de serviço.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsRecovering(false);
                    setRecoverSent(false);
                  }}
                  className="text-xs text-blue-400 font-semibold pt-2 block mx-auto hover:underline"
                >
                  Retornar ao Login
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-300">
                  Informe o seu e-mail cadastrado para receber o link seguro de redefinição de acesso.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail Cadastrado</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={recoverEmail}
                      onChange={(e) => setRecoverEmail(e.target.value)}
                      placeholder="usuario@concessionaria.com.br"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRecovering(false)}
                    className="flex-1 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30"
                  >
                    Enviar Link
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {onCancel && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              ← Voltar para o Site da Concessionária
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

