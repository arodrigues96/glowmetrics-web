/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#FFF5F3',
          100: '#FFE8E3',
          200: '#FFD4C7',
          300: '#FFB5A0',
          400: '#FF8A6B',
          500: '#D4A5A5',
          600: '#C48B8B',
          700: '#A86B6B',
        },
        gold: {
          50: '#FDF8F6',
          100: '#F5E1DE',
          200: '#E8DCD5',
          300: '#C9A962',
          400: '#B8944F',
        },
      },
    },
  },
  plugins: [],
}

