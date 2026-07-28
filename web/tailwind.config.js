import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        stone: {
          50:  '#F5F8FF',  // App Background
          100: '#EDF4FF',  // Gradient Accent / Hover Surface
          150: '#E2E8F0',  // Border
          200: '#E2E8F0',  // Border
          250: '#CBD5E1',  // slate-300
          300: '#CBD5E1',  // slate-300
          400: '#94A3B8',  // Placeholder / slate-400
          500: '#64748B',  // Secondary Text / slate-500
          600: '#475569',
          700: '#334155',
          755: '#1E293B',
          800: '#1E293B',
          850: '#131C2E',
          900: '#0F172A',  // Primary Text
          950: '#020617',
        },
        amber: colors.amber,
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      maxWidth: {
        feed: '720px',   // balanced readable layout for feed/detail/profile pages
        app:  '1200px',
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        modal: '0 20px 60px -10px rgba(0,0,0,0.15)',
      },
    },
  },
}