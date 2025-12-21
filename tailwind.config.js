/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- O SEGREDO ESTÁ AQUI
  theme: {
    extend: {
      colors: {
        // Definimos nossas cores de marca para facilitar o dark mode
        brand: {
          DEFAULT: '#0047AB', // Azul Original
          dark: '#3b82f6',    // Azul mais claro para fundo preto (Blue 500)
        }
      }
    },
  },
  plugins: [],
}