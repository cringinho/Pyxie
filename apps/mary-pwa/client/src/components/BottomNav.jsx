import React from 'react';
import { motion } from 'framer-motion';
import { House, Images, ShareNetwork, Sparkle, Gear } from '@phosphor-icons/react';

export const NAV_TABS = [
  { id: 'feed', label: 'Início & Feed', icon: House },
  { id: 'gallery', label: 'Galeria', icon: Images },
  { id: 'graph', label: 'Grafo & Palavras', icon: ShareNetwork },
  { id: 'recap', label: 'Recap Mensal', icon: Sparkle },
  { id: 'settings', label: 'Ajustes', icon: Gear }
];

export default function BottomNav({ activeTab, onChangeTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-safe pt-2 bg-[#09070f]/90 backdrop-blur-2xl border-t border-pink-500/20 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all group"
            >
              {/* Indicador animado de aba ativa via Framer Motion */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavActiveTab"
                  className="absolute inset-0 bg-gradient-to-tr from-pink-500/25 to-purple-600/25 rounded-2xl border border-pink-500/35 shadow-inner"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}

              <Icon
                weight={isActive ? 'fill' : 'duotone'}
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive
                    ? 'text-pink-400 scale-110 drop-shadow-[0_0_8px_rgba(230,0,103,0.5)]'
                    : 'text-gray-400 group-hover:text-pink-300'
                }`}
              />

              <span
                className={`text-[10px] font-display font-medium mt-1 tracking-tight transition-colors duration-200 ${
                  isActive ? 'text-pink-300 font-semibold' : 'text-gray-400 group-hover:text-gray-200'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
