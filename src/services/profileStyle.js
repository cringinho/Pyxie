/**
 * Opções de personalização do card de perfil (py!perfil).
 * Temas são cosméticos pagos em Feijões Mágicos (economy.THEMES_CATALOG);
 * layout, moldura, destaques e sticker são gratuitos e salvos em account.profileStyle.
 */

// Direção de arte de cada tema: cores, modo (claro/escuro) e padrão do banner
const THEME_DESIGNS = {
  default: { mode: 'dark', pattern: 'petals', bg: ['#14051c', '#2a0a2e', '#0b0410'], accent: '#ff3d8b', accent2: '#a855f7', glow: '#ff3d8b' },
  ouro: { mode: 'dark', pattern: 'rays', bg: ['#120d02', '#2b1f05', '#0a0701'], accent: '#facc15', accent2: '#f59e0b', glow: '#fbbf24' },
  esmeralda: { mode: 'dark', pattern: 'leaves', bg: ['#02130c', '#063a26', '#010906'], accent: '#34d399', accent2: '#a3e635', glow: '#10b981' },
  galaxia: { mode: 'dark', pattern: 'stars', bg: ['#07051a', '#1b1146', '#03020c'], accent: '#a78bfa', accent2: '#38bdf8', glow: '#8b5cf6' },
  cyberpunk: { mode: 'dark', pattern: 'grid', bg: ['#0a0414', '#1f0632', '#05020a'], accent: '#ff2bd6', accent2: '#22d3ee', glow: '#ff2bd6' },
  chama: { mode: 'dark', pattern: 'embers', bg: ['#160403', '#3d0b06', '#0a0201'], accent: '#f97316', accent2: '#ef4444', glow: '#f97316' },
  diamante: { mode: 'dark', pattern: 'crystals', bg: ['#021318', '#06343f', '#01080a'], accent: '#5eead4', accent2: '#93c5fd', glow: '#2dd4bf' },
  aurora: { mode: 'dark', pattern: 'aurora', bg: ['#030b14', '#0a2233', '#02060c'], accent: '#4ade80', accent2: '#c084fc', glow: '#22d3ee' },
  sakura: { mode: 'light', pattern: 'petals', bg: ['#fff1f5', '#ffe4ec', '#fdf2f8'], accent: '#ec4899', accent2: '#f472b6', glow: '#f9a8d4' },
  vaporwave: { mode: 'dark', pattern: 'sunset', bg: ['#1a0533', '#3b0a4f', '#0d0221'], accent: '#ff71ce', accent2: '#fbbf24', glow: '#ff71ce' },
  matcha: { mode: 'light', pattern: 'dots', bg: ['#f7f5ec', '#eef0dc', '#f9f8f1'], accent: '#4d7c0f', accent2: '#84cc16', glow: '#bef264' },
  noir: { mode: 'dark', pattern: 'lines', bg: ['#0a0a0a', '#1c1c1c', '#050505'], accent: '#f5f5f5', accent2: '#a3a3a3', glow: '#ffffff' },
  arcade: { mode: 'dark', pattern: 'pixels', bg: ['#0b1026', '#1b2350', '#060914'], accent: '#facc15', accent2: '#f472b6', glow: '#60a5fa' },
};

const LAYOUTS = ['glass', 'neon', 'minimal'];
const FRAMES = ['circle', 'squircle', 'halo'];
const SHOWCASE_STATS = ['coins', 'beans', 'rank', 'level', 'tarot', 'works', 'streak', 'museum', 'love'];
const STICKERS = ['none', '🌸', '✨', '🔮', '👑', '🐉', '🦋', '🍄', '🌙', '⭐', '🎮', '🎧', '🍓', '🐱', '🦊', '💜', '🔥', '🌈', '☕', '🎨', '🧸', '🐸', '🌊', '🍀'];

const DEFAULT_PROFILE_STYLE = Object.freeze({
  layout: 'glass',
  frame: 'circle',
  showcase: ['coins', 'beans', 'rank', 'level'],
  sticker: 'none',
});

function normalizeProfileStyle(style) {
  const s = style && typeof style === 'object' ? style : {};
  const showcase = Array.isArray(s.showcase)
    ? [...new Set(s.showcase.filter((k) => SHOWCASE_STATS.includes(k)))].slice(0, 4)
    : [];
  return {
    layout: LAYOUTS.includes(s.layout) ? s.layout : DEFAULT_PROFILE_STYLE.layout,
    frame: FRAMES.includes(s.frame) ? s.frame : DEFAULT_PROFILE_STYLE.frame,
    showcase: showcase.length ? showcase : [...DEFAULT_PROFILE_STYLE.showcase],
    sticker: STICKERS.includes(s.sticker) ? s.sticker : DEFAULT_PROFILE_STYLE.sticker,
  };
}

function getThemeDesign(themeId) {
  return THEME_DESIGNS[themeId] || THEME_DESIGNS.default;
}

module.exports = {
  THEME_DESIGNS,
  LAYOUTS,
  FRAMES,
  SHOWCASE_STATS,
  STICKERS,
  DEFAULT_PROFILE_STYLE,
  normalizeProfileStyle,
  getThemeDesign,
};
