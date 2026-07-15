import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        stone: {
          50:  '#fafaf9',  // page background
          100: '#f5f5f4',  // card background
          // warm neutrals, not cold grey
        },
        amber: colors.amber,
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
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