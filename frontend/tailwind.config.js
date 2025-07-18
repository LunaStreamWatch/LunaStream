// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#fef7ff',
          100: '#fdf2ff',
          200: '#fbc9ff',
          300: '#f9a8ff',
          400: '#f569ff',
          500: '#e935ea',
          600: '#d318d6',
          700: '#b012b5',
          800: '#901494',
          900: '#751677',
        },
        dark: {
          900: '#0d0d0d',
          800: '#1a1a1a',
          700: '#2e2e2e',
        },
        light: {
          100: '#f5f5f5',
        },
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
