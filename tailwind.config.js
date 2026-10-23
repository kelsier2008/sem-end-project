/** @type {import('tailwindcss').Config} */

// Semantic colours read CSS variables (see index.css) so they switch with dark mode automatically.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#7B39FC',
          50: '#F5F0FF',
          100: '#EBE1FF',
          200: '#D7C4FF',
          300: '#BA98FE',
          400: '#9C69FD',
          500: '#7B39FC',
          600: '#6825E8',
          700: '#561CC4',
          800: '#45189B',
          900: '#2E1068',
        },
        deep: '#2B2344',
        canvas: token('canvas'),
        surface: token('surface'),
        raised: token('raised'),
        line: { DEFAULT: token('line'), strong: token('line-strong') },
        ink: { DEFAULT: token('ink'), soft: token('ink-soft'), muted: token('ink-muted') },
        accent: { soft: token('accent-soft'), text: token('accent-text') },
      },
      boxShadow: {
        card: '0 1px 2px rgb(43 35 68 / 0.04), 0 1px 1px rgb(43 35 68 / 0.02)',
        lift: '0 12px 28px -14px rgb(43 35 68 / 0.22), 0 2px 6px -2px rgb(43 35 68 / 0.06)',
        brand: '0 6px 16px -6px rgb(123 57 252 / 0.55)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-in': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'scale-in': 'scale-in 200ms ease-out',
        'slide-in': 'slide-in 200ms ease-out',
      },
    },
  },
  plugins: [],
};
