/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          600: '#2563eb',  // main CTA
          700: '#1d4ed8',
          // ... full scale
        },
        stone: {
          50:  '#fafaf9',  // page background
          100: '#f5f5f4',  // card background
          // warm neutrals, not cold grey
        },
        amber: {
          // used ONLY for business/local features
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      maxWidth: {
        feed: '680px',   // single-column feed (Notion-like)
        app:  '1200px',
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        modal: '0 20px 60px -10px rgba(0,0,0,0.15)',
      },
    },
  },
}