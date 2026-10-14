/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        navy: {
          50: '#f2f5fa',
          100: '#e3e9f3',
          200: '#c6d2e6',
          300: '#9cb0d0',
          400: '#6c86b3',
          500: '#4a6497',
          600: '#364c7c',
          700: '#2b3d65',
          800: '#1d2b4a',
          900: '#121d35',
          950: '#0b1325',
        },
        accent: {
          50: '#ecfdf8',
          100: '#d1faec',
          500: '#0d9f7a',
          600: '#0a8467',
          700: '#086a53',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(18,29,53,0.04), 0 2px 8px rgba(18,29,53,0.05)',
      },
    },
  },
  plugins: [],
};
