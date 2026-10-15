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
        // Green, red and amber are reserved for status (settled, blocked, pending).
        // Brand neutrals, anchored on the logo's #111111
        ink: {
          50: '#f6f6f6',
          100: '#ececec',
          200: '#dcdcdc',
          300: '#bdbdbd',
          400: '#8f8f8f',
          500: '#6b6b6b',
          600: '#545454',
          700: '#3d3d3d',
          800: '#262626',
          900: '#111111',
          950: '#0a0a0a',
        },
        // Supporting colour: muted brass, used sparingly (key CTAs, progress, highlights).
        // brass-600 and darker pass AA with white text; brass-300 and lighter are for use on black.
        brass: {
          50: '#faf6ee',
          100: '#f2e8d3',
          200: '#e5d0a6',
          300: '#d4b47a',
          400: '#c49d5c',
          500: '#b08544',
          600: '#8f6a33',
          700: '#6b4f26',
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
        card: '0 1px 2px rgba(17,17,17,0.04), 0 2px 8px rgba(17,17,17,0.05)',
      },
    },
  },
  plugins: [],
};
