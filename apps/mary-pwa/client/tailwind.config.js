/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        romantic: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#e60067',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843'
        },
        cyber: {
          purple: '#9333EA',
          lilac: '#C084FC',
          gold: '#F59E0B'
        },
        starry: {
          cyan: '#38BDF8',
          indigo: '#818CF8',
          midnight: '#070B19'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Space Grotesk', 'Fredoka', 'sans-serif'],
        fredoka: ['Fredoka', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        playfair: ['Playfair Display', 'serif'],
        verse: ['Cormorant Garamond', 'serif']
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.15)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.2)' },
          '70%': { transform: 'scale(1)' }
        }
      }
    }
  },
  plugins: []
};

