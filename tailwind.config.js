/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        'beemora-yellow': '#fbbf24',
        'beemora-amber': '#f59e0b',
        'token-bg':      'var(--color-bg)',
        'token-surface': 'var(--color-surface)',
        'token-surface-raised': 'var(--color-surface-raised)',
        'token-border':  'var(--color-border)',
        'token-ink':     'var(--color-ink)',
        'token-ink-muted': 'var(--color-ink-muted)',
        'token-accent':  'var(--color-accent)',
        brand: {
          DEFAULT: '#f59e0b',
          dim:     '#d97706',
          glow:    'rgba(245,158,11,0.15)',
          subtle:  'rgba(245,158,11,0.08)',
        },
        surface: {
          base:   '#030712',
          card:   '#111827',
          raised: '#1f2937',
        },
        status: {
          critical: '#ef4444',
          warning:  '#f59e0b',
          ok:       '#10b981',
          offline:  '#6b7280',
        },
      },
      boxShadow: {
        'glow-amber':    '0 0 20px rgba(245,158,11,0.30), 0 0 40px rgba(245,158,11,0.10)',
        'glow-amber-sm': '0 0 10px rgba(245,158,11,0.25)',
        'glow-red':      '0 0 16px rgba(239,68,68,0.30)',
        'glow-emerald':  '0 0 16px rgba(16,185,129,0.28)',
        'card':          '0 1px 3px rgba(0,0,0,0.40), 0 4px 12px rgba(0,0,0,0.25)',
        'card-hover':    '0 4px 24px rgba(0,0,0,0.50), 0 8px 32px rgba(0,0,0,0.30)',
        'popover':       '0 8px 32px rgba(0,0,0,0.50), 0 2px 8px rgba(0,0,0,0.30)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-amber-glow': 'radial-gradient(ellipse at top, rgba(245,158,11,0.08) 0%, transparent 70%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 100%)',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
        'spin-reverse': 'spin-reverse 0.7s linear infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'slide-up': {
          '0%': { transform: 'translate(-50%, 100px)', opacity: '0' },
          '100%': { transform: 'translate(-50%, 0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to:   { transform: 'rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
}
