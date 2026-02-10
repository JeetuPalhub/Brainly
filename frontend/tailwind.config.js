/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'beam-pulse': {
          '0%, 100%': { opacity: '0.2', transform: 'scaleY(0.9)' },
          '50%': { opacity: '1', transform: 'scaleY(1.1)' },
        },
        'aurora-drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(24px,-16px,0) scale(1.08)' },
        },
      },
      animation: {
        'beam-pulse': 'beam-pulse 2.8s ease-in-out infinite',
        'aurora-drift': 'aurora-drift 14s ease-in-out infinite',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,211,238,.35), 0 20px 45px rgba(56,189,248,.2)',
      },
    },
  },
  plugins: [],
}
