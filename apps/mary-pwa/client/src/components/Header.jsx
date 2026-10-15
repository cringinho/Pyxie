import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, LogOut, Settings, Sparkles } from 'lucide-react';

export default function Header({ onOpenProfile }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-pink-500/20 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-inner">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-1.5 leading-tight">
              Nosso Universo
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-bounce" />
            </h1>
            <p className="text-[10px] text-pink-300/70 font-medium">
              Mary & Leh • 30/01/2026
            </p>
          </div>
        </div>

        {/* User Badge & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group"
            title="Editar Perfil"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-900/60 border border-pink-500/50 flex items-center justify-center shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm">{user.username === 'mary' ? '🌸' : '⚡'}</span>
              )}
            </div>

            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-white group-hover:text-pink-300 transition-colors flex items-center gap-1">
                <span>{user.nickname || user.displayName}</span>
                <Settings className="w-3 h-3 text-gray-400 group-hover:text-pink-300" />
              </div>
              {user.moodStatus && (
                <div className="text-[10px] text-gray-400 truncate max-w-[140px]">
                  {user.moodStatus}
                </div>
              )}
            </div>
          </button>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 border border-white/10 transition-all"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
