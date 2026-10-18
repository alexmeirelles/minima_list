'use client';

import React, { useState } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { XIcon } from './Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncNow?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSyncNow }) => {
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut } = useSupabaseAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        await signInWithEmail(email, password);
        onClose();
      } else {
        await signUpWithEmail(email, password);
        setSuccessMsg('Conta criada com sucesso! Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar autenticação.');
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
          'O login com Google precisa ser ativado no Supabase (Authentication → Providers → Google com as chaves do Google Cloud). Por enquanto, use E-mail e Senha!'
        );
      } else {
        setErrorMsg(err.message || 'Erro ao conectar com Google.');
      }
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao sair.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card max-w-sm w-full" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--todo-border-color)]">
          <h3 className="modal-title font-bold text-base m-0 text-[var(--todo-text-color)]">
            {user ? 'Minha Conta' : 'Acessar Conta'}
          </h3>
          <button
            type="button"
            className="modal-close text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)] transition-colors p-1"
            onClick={onClose}
          >
            <XIcon size={16} />
          </button>
        </div>

        {user ? (
          /* User is logged in */
          <div className="flex flex-col gap-4 py-4 text-sm text-[var(--todo-text-color)]">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--someday-list-background)] border border-[var(--todo-border-color)]">
              <div className="w-10 h-10 rounded-full bg-[var(--custom-color)] text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-xs truncate">{user.email}</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Sincronizado na Nuvem
                </span>
              </div>
            </div>

            {onSyncNow && (
              <button
                type="button"
                onClick={onSyncNow}
                className="w-full py-2 px-3 text-xs font-semibold rounded bg-[var(--timer-bg)] hover:bg-[var(--custom-color)] hover:text-white transition-colors"
              >
                Sincronizar tarefas locais agora
              </button>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={handleSignOut}
              className="w-full py-2 px-3 text-xs font-semibold rounded text-red-500 hover:bg-red-500/10 border border-red-500/20 transition-colors"
            >
              {loading ? 'Saindo...' : 'Sair da conta'}
            </button>
          </div>
        ) : (
          /* User is logged out */
          <div className="flex flex-col gap-4 py-3">
            {/* Tab switch */}
            <div className="flex border-b border-[var(--todo-border-color)]">
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 -mb-[1px] ${
                  tab === 'login'
                    ? 'border-[var(--custom-color)] text-[var(--custom-color)]'
                    : 'border-transparent text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)]'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 -mb-[1px] ${
                  tab === 'signup'
                    ? 'border-[var(--custom-color)] text-[var(--custom-color)]'
                    : 'border-transparent text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)]'
                }`}
              >
                Criar Conta
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs leading-relaxed">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs leading-relaxed">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--todo-past-text-color)]">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="modal-input w-full text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--todo-past-text-color)]">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="modal-input w-full text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="modal-btn modal-btn--primary w-full py-2 text-xs font-bold mt-1"
              >
                {loading ? 'Aguarde...' : tab === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[var(--todo-border-color)]" />
              <span className="flex-shrink mx-2 text-[10px] text-[var(--todo-past-text-color)] uppercase font-semibold">
                ou
              </span>
              <div className="flex-grow border-t border-[var(--todo-border-color)]" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded border border-[var(--todo-border-color)] hover:bg-[var(--timer-bg)] text-[var(--todo-text-color)] transition-colors"
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
              Continuar com Google
            </button>

            <p className="text-[11px] text-[var(--todo-past-text-color)] text-center mt-1">
              Sincronize suas tarefas em qualquer computador ou celular.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
