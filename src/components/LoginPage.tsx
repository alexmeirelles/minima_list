'use client';

import React, { useState } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useTodoStore } from '@/store/useTodoStore';
import { DarkModeIcon, LightModeIcon } from './Icons';

interface LoginPageProps {
  onContinueAsGuest: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onContinueAsGuest }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useSupabaseAuth();
  const { darkMode, setDarkMode } = useTodoStore();

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Demo interactive item on the landing preview
  const [demoDone1, setDemoDone1] = useState(true);
  const [demoDone2, setDemoDone2] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
        setSuccessMsg(
          'Conta criada com sucesso! Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada.'
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await signInWithGoogle();
    } catch (err: any) {
      if (
        err.message?.includes('provider is not enabled') ||
        err.msg?.includes('provider is not enabled') ||
        JSON.stringify(err).includes('provider is not enabled')
      ) {
        setErrorMsg(
          'O login com Google precisa ser ativado no Supabase (Authentication → Providers → Google com as chaves do Google Cloud Console). Enquanto isso, use a opção de E-mail e Senha acima!'
        );
      } else {
        setErrorMsg(err.message || 'Erro ao conectar com Google.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--app-background)] text-[var(--todo-text-color)] flex flex-col justify-between selection:bg-[var(--custom-color)] selection:text-white transition-colors duration-200">
      {/* Top Navigation */}
      <header className="w-full max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-1.5 select-none">
          <span className="font-['Barlow_Condensed',sans-serif] font-extrabold text-2xl tracking-wider text-[var(--custom-color)]">
            NEXXXT
          </span>
          <span className="w-2 h-2 rounded-full bg-[var(--custom-color)] self-start mt-1.5" />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-[var(--timer-bg)] text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)] transition-colors"
            title="Alternar modo escuro / claro"
          >
            {darkMode ? <LightModeIcon size={18} /> : <DarkModeIcon size={18} />}
          </button>

          <button
            type="button"
            onClick={onContinueAsGuest}
            className="text-xs font-semibold px-3 py-1.5 rounded text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)] hover:bg-[var(--timer-bg)] transition-colors"
          >
            Explorar sem conta →
          </button>
        </div>
      </header>

      {/* Main Hero & Login Split */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Visual & Value Proposition */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--custom-color-day-label)] text-[var(--custom-color)] text-xs font-bold tracking-wide w-fit">
            <span>✨</span>
            <span>SIMPLICIDADE RADICAL</span>
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] font-['Barlow_Condensed',sans-serif] uppercase">
              Uma folha de papel <br className="hidden sm:inline" />
              <span className="text-[var(--custom-color)]">para a sua semana.</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--todo-past-text-color)] font-normal max-w-lg leading-relaxed">
              O gerenciador minimalista inspirado no TeuxDeux. Planeje os 7 dias visualmente,
              esvazie a mente em listas GTD e sincronize em qualquer dispositivo.
            </p>
          </div>

          {/* Interactive Lined Stationery Mockup Card */}
          <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--someday-list-background)] border border-[var(--todo-border-color)] shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--todo-border-color)]">
              <span className="font-['Barlow_Condensed',sans-serif] font-bold text-lg tracking-wider text-[var(--custom-color)] uppercase">
                HOJE • FOCO TOTAL
              </span>
              <span className="text-[11px] font-semibold text-[var(--todo-past-text-color)] uppercase tracking-wider">
                Interativo
              </span>
            </div>

            <ul className="flex flex-col divide-y divide-[var(--todo-border-color)]">
              <li
                onClick={() => setDemoDone1(!demoDone1)}
                className="py-2.5 flex items-center gap-3 cursor-pointer group/item select-none"
              >
                <input
                  type="checkbox"
                  checked={demoDone1}
                  readOnly
                  className="w-4 h-4 rounded accent-[var(--custom-color)] cursor-pointer"
                />
                <span
                  className={`text-sm transition-all ${
                    demoDone1
                      ? 'line-through opacity-50 text-[var(--todo-past-text-color)]'
                      : 'text-[var(--todo-text-color)] font-medium'
                  }`}
                >
                  Finalizar apresentação do projeto
                </span>
              </li>

              <li
                onClick={() => setDemoDone2(!demoDone2)}
                className="py-2.5 flex items-center gap-3 cursor-pointer group/item select-none"
              >
                <input
                  type="checkbox"
                  checked={demoDone2}
                  readOnly
                  className="w-4 h-4 rounded accent-[var(--custom-color)] cursor-pointer"
                />
                <span
                  className={`text-sm transition-all ${
                    demoDone2
                      ? 'line-through opacity-50 text-[var(--todo-past-text-color)]'
                      : 'text-[var(--todo-text-color)] font-medium'
                  }`}
                >
                  Revisar prioridades da semana
                </span>
              </li>

              <li className="py-2.5 flex items-center gap-3 text-[var(--todo-past-text-color)] opacity-70">
                <span className="text-base font-bold leading-none text-[var(--custom-color)]">+</span>
                <span className="text-sm">Clique em qualquer lugar para planejar...</span>
              </li>
            </ul>

            {/* Subtle notebook ruled lines accent in background */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 pointer-events-none opacity-5 bg-[repeating-linear-gradient(transparent,transparent_33px,var(--todo-border-color)_34px)]" />
          </div>

          {/* Value Badges */}
          <div className="flex items-center gap-6 text-xs text-[var(--todo-past-text-color)] font-medium pt-2">
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span> Sincronização em Nuvem
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span> Modo Escuro & Claro
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span> Drag & Drop Fluido
            </span>
          </div>
        </div>

        {/* Right Column: Premium Auth Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="p-8 sm:p-10 rounded-2xl bg-[var(--app-background)] border border-[var(--todo-border-color)] shadow-xl shadow-black/5 dark:shadow-none flex flex-col gap-6">
            {/* Tab Switcher */}
            <div className="flex border-b border-[var(--todo-border-color)]">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg(null);
                }}
                className={`flex-1 pb-3 text-sm font-bold tracking-wide transition-colors border-b-2 -mb-[1px] ${
                  tab === 'login'
                    ? 'border-[var(--custom-color)] text-[var(--custom-color)]'
                    : 'border-transparent text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)]'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setErrorMsg(null);
                }}
                className={`flex-1 pb-3 text-sm font-bold tracking-wide transition-colors border-b-2 -mb-[1px] ${
                  tab === 'signup'
                    ? 'border-[var(--custom-color)] text-[var(--custom-color)]'
                    : 'border-transparent text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)]'
                }`}
              >
                Criar Conta
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs leading-relaxed">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs leading-relaxed">
                {successMsg}
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--todo-past-text-color)] uppercase tracking-wider">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--someday-list-background)] border border-[var(--todo-border-color)] text-sm text-[var(--todo-text-color)] outline-none focus:border-[var(--custom-color)] focus:ring-1 focus:ring-[var(--custom-color)] transition-all placeholder-[var(--todo-past-text-color)]/60"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--todo-past-text-color)] uppercase tracking-wider">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--someday-list-background)] border border-[var(--todo-border-color)] text-sm text-[var(--todo-text-color)] outline-none focus:border-[var(--custom-color)] focus:ring-1 focus:ring-[var(--custom-color)] transition-all placeholder-[var(--todo-past-text-color)]/60"
                />
              </div>

              {/* Remember Session checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-[var(--custom-color)] cursor-pointer"
                  />
                  <span>Lembrar da minha sessão</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-[var(--custom-color)] hover:opacity-90 active:scale-[0.99] text-white text-sm font-bold tracking-wide transition-all shadow-md shadow-[var(--custom-color)]/20 mt-2 disabled:opacity-50"
              >
                {loading
                  ? 'Conectando...'
                  : tab === 'login'
                  ? 'Entrar no Nexxxt'
                  : 'Criar Minha Conta'}
              </button>
            </form>

            <div className="relative flex items-center justify-center my-1">
              <div className="w-full border-t border-[var(--todo-border-color)]" />
              <span className="absolute bg-[var(--app-background)] px-3 text-[10px] uppercase font-bold text-[var(--todo-past-text-color)] tracking-widest">
                ou
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg border border-[var(--todo-border-color)] hover:bg-[var(--timer-bg)] text-xs font-semibold text-[var(--todo-text-color)] flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com Google</span>
            </button>

            {/* Offline fallback trigger */}
            <div className="text-center pt-1 border-t border-[var(--todo-border-color)]">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-xs text-[var(--todo-past-text-color)] hover:text-[var(--custom-color)] font-medium transition-colors"
              >
                Prefere testar primeiro? <span className="underline">Continuar offline neste aparelho →</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-[var(--todo-border-color)] text-center text-xs text-[var(--todo-past-text-color)]">
        <span>NEXXXT • Simplicidade radical para organizar o seu dia a dia.</span>
      </footer>
    </div>
  );
};
