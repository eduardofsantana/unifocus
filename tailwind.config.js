/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- IMPORTANTE: Habilita o controle manual
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0047AB',
          dark: '#3b82f6',
        }
      }
    },
  },
  plugins: [],
}