/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#07040D',
          900: '#0D0D11',
          800: '#141416',
          700: '#1A1822',
        },
        pyxie: {
          pink: '#E60067',
          neon: '#F43F5E',
          bright: '#EC4899',
          glow: '#F472B6',
        },
        mystic: {
          violet: '#8B5CF6',
          purple: '#9333EA',
          neon: '#A855F7',
          glow: '#C084FC',
          deep: '#581C87',
        },
        amber: {
          magic: '#F59E0B',
          gold: '#FBBF24',
        },
        cyber: {
          cyan: '#38BDF8',
          emerald: '#10B981',
        },
      },
      fontFamily: {
        title: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mystic: ['Cinzel', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-pink': '0 0 25px rgba(230, 0, 103, 0.45)',
        'neon-violet': '0 0 30px rgba(139, 92, 246, 0.4)',
        'glass-card': '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
