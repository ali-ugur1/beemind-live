/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'beemind-yellow': '#fbbf24',
        'beemind-amber': '#f59e0b',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'slide-up': {
          '0%': {
            transform: 'translate(-50%, 100px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translate(-50%, 0)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
}
