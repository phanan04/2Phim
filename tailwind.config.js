/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0E0E10',
          dark: '#141418',
          card: '#18181C',
          surface: '#222228',
          border: 'rgba(255, 255, 255, 0.08)',
          green: '#00F076',
          'green-hover': '#18E074',
          cyan: '#00C2FF',
          yellow: '#FFD166',
          text: '#F5F5F7',
          muted: '#8E8E93',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      aspectRatio: {
        'poster': '2 / 3',
        'backdrop': '16 / 9',
      },
      boxShadow: {
        'neon': '0 0 25px rgba(0, 240, 118, 0.45)',
        'neon-sm': '0 0 12px rgba(0, 240, 118, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
