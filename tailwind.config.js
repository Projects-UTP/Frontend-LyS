export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },
      fontSize: {
        display: ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.1' }],
        heading: ['clamp(2.25rem, 4vw, 3rem)', { lineHeight: '1.15' }],
      },
      colors: {
        'brand-red': { 50: '#FBEAEC', 500: '#C81018', 700: '#8F1015' },
        neutral: { 600: '#5E5E5E', 950: '#171717' },
      },
    },
  },
  plugins: [],
};
