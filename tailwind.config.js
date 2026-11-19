/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px rgba(76, 29, 149, 0.04), 0 8px 24px -12px rgba(76, 29, 149, 0.12)' },
    },
  },
  plugins: [],
};
