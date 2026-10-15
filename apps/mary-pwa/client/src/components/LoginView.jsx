import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkle, Heart, Lightning, LockKey, ArrowRight } from '@phosphor-icons/react';

export default function LoginView() {
  const { login, error } = useAuth();
  const [username, setUsername] = useState('mary');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0d0b16]">
      {/* Luzes de fundo atmosféricas */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-pink-500/20">
          {/* Header do Card */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-400 mb-2 shadow-inner">
              <Sparkle weight="duotone" className="w-8 h-8 animate-pulse text-pink-400" />
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-white flex items-center justify-center gap-2">
              <span>Nosso Universo</span>
              <Heart weight="fill" className="w-5 h-5 text-pink-500 animate-bounce" />
            </h1>
            <p className="text-xs text-pink-200/60 font-sans font-medium">
              Diário • Mary & Leh
            </p>
          </div>

          {/* Seleção rápida de Usuário */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setUsername('mary')}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5 ${
                username === 'mary'
                  ? 'bg-sky-500/20 border-sky-400 text-white shadow-lg shadow-sky-500/15'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Heart weight="duotone" className="w-6 h-6 text-sky-400" />
              <span className="text-xs font-semibold font-display">Mary (Maricota)</span>
            </button>

            <button
              type="button"
              onClick={() => setUsername('leh')}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5 ${
                username === 'leh'
                  ? 'bg-purple-500/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Lightning weight="duotone" className="w-6 h-6 text-purple-400" />
              <span className="text-xs font-semibold font-display">Leh (Cringinho)</span>
            </button>
          </div>

          {/* Formulário de Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 pl-1 font-sans">
                Senha de Acesso
              </label>
              <div className="relative">
                <LockKey weight="duotone" className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha..."
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-sans"
                />
              </div>
            </div>

            {(formError || error) && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center font-medium font-sans">
                {formError || error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 font-display"
            >
              {isSubmitting ? (
                <span>Desbloqueando Universo...</span>
              ) : (
                <>
                  <span>Entrar no Universo</span>
                  <ArrowRight weight="bold" className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-[11px] text-gray-500 font-sans">
            Acesso estritamente privado • Subdomínio mary.pyxie.com.br
          </div>
        </div>
      </div>
    </div>
  );
}

