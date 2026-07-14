/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm ink base — a cartographer's desk at night, not a SaaS dashboard.
        ink: {
          950: '#0b0d12',
          900: '#101319',
          850: '#151922',
          800: '#1a1f2b',
          700: '#232a38',
          600: '#323b4d',
        },
        parchment: {
          50: '#f7f4ec',
          100: '#efe9db',
          200: '#ded4bd',
          300: '#c4b490',
        },
        // Insight — the light you're navigating toward.
        amber: {
          DEFAULT: '#e8b04b',
          soft: '#f0c874',
          deep: '#c98a2c',
        },
        // Trait hues — each of the five gets its own light.
        trait: {
          analytical: '#5aa9e6',
          creative: '#b98ce6',
          risk: '#f08a6a',
          people: '#4fc4a1',
          structure: '#8a92c9',
        },
        signal: {
          confirm: '#4fc4a1',
          reconsider: '#e8b04b',
          exclude: '#6b7385',
          alert: '#f08a6a',
        },
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Fraunces', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(232,176,75,0.25), 0 0 24px -4px rgba(232,176,75,0.35)',
        node: '0 6px 24px -8px rgba(0,0,0,0.6)',
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 48px -24px rgba(0,0,0,0.7)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.16,1,0.3,1) infinite',
      },
    },
  },
  plugins: [],
}
