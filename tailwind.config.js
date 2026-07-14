/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Semantic, theme-aware tokens (see index.css for light/dark values) ──
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface2)',
        surface3: 'var(--surface3)',
        sunken: 'var(--sunken)',
        fg: 'var(--fg)',
        fg2: 'var(--fg2)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        line: 'var(--line)',
        line2: 'var(--line2)',
        overlay: 'var(--overlay)',
        overlay2: 'var(--overlay2)',
        oncolor: 'var(--oncolor)',
        // Insight — the light you're navigating toward. Darkens in light theme for contrast.
        amber: {
          DEFAULT: 'rgb(var(--amber) / <alpha-value>)',
          soft: 'var(--amber-soft)',
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
