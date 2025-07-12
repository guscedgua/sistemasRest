/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Asegúrate de incluir todos tus archivos de componentes
  ],
  theme: {
    extend: {
      colors: {
        restaurant: {
          primary: "#FF6B35",  // Color naranja para botones principales
          secondary: "#004E89", // Color azul para encabezados
        },
      },
    },
  },
  plugins: [],
};