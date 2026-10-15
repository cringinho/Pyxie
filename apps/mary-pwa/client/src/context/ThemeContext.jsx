import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const THEMES = [
  {
    id: 'dark-romantic',
    name: 'Dark Romantic',
    subtitle: 'Rosa Carmesim & Romance Noir',
    primary: '#E60067',
    secondary: '#F43F5E',
    bg: '#0B090E',
    icon: 'Heart'
  },
  {
    id: 'neon-rose',
    name: 'Neon Rose',
    subtitle: 'Rosa Néon Vibrante & Glow',
    primary: '#FF2A85',
    secondary: '#FF75B5',
    bg: '#120714',
    icon: 'Lightning'
  },
  {
    id: 'cyber-goth',
    name: 'Cyber Goth',
    subtitle: 'Estética Kuromi, Roxo & Dourado',
    primary: '#9333EA',
    secondary: '#C084FC',
    bg: '#09070F',
    icon: 'Skull'
  },
  {
    id: 'starry-night',
    name: 'Starry Night',
    subtitle: 'Estética Cinnamoroll & Azul Astral',
    primary: '#38BDF8',
    secondary: '#818CF8',
    bg: '#070B19',
    icon: 'MoonStars'
  }
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { user, updateProfile } = useAuth();
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('mary_theme') || 'dark-romantic';
  });

  // Sincroniza com tema do usuário logado se disponível
  useEffect(() => {
    if (user?.theme && user.theme !== theme) {
      setThemeState(user.theme);
      applyThemeToDOM(user.theme);
    }
  }, [user?.theme]);

  // Aplica tema ao DOM e localStorage
  function applyThemeToDOM(themeId) {
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('mary_theme', themeId);
  }

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  async function setTheme(themeId, syncWithBackend = true) {
    setThemeState(themeId);
    applyThemeToDOM(themeId);
    if (syncWithBackend && user && updateProfile) {
      try {
        await updateProfile({ theme: themeId });
      } catch (err) {
        console.warn('Erro ao sincronizar tema no perfil:', err);
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme deve ser utilizado dentro de ThemeProvider');
  }
  return ctx;
}
