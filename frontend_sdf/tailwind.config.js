/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#4551f7',    // azul principal
        secondary: '#3741b7',  // azul oscuro
        accent: '#1a202c',     // texto y elementos oscuros
      },
    },
  },
  plugins: [],
}
