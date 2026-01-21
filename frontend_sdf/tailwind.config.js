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
        // Colores principales del proyecto
        primary: '#4551f7',    // azul principal
        secondary: '#3741b7',  // azul oscuro
        accent: '#1a202c',     // texto y elementos oscuros

        // Twilight Indigo
        'twilight-indigo': {
          50: '#eaf1fb',
          100: '#d4e2f7',
          200: '#aac5ee',
          300: '#7fa8e6',
          400: '#558bdd',
          500: '#2a6ed5',
          600: '#2258aa',
          700: '#194280',
          800: '#112c55',
          900: '#08162b',
          950: '#060f1e',
        },

        // Silver
        silver: {
          50: '#f2f2f3',
          100: '#e5e5e6',
          200: '#cacbce',
          300: '#b0b1b5',
          400: '#96979c',
          500: '#7c7e83',
          600: '#636469',
          700: '#4a4b4f',
          800: '#313235',
          900: '#19191a',
          950: '#111212',
        },

        // Grey-Olive
        'grey-olive': {
          50: '#f2f2f3',
          100: '#e5e5e6',
          200: '#cbcccd',
          300: '#b1b2b4',
          400: '#97999b',
          500: '#7d7f82',
          600: '#646668',
          700: '#4b4c4e',
          800: '#323334',
          900: '#19191a',
          950: '#111212',
        },

        // Steel-Azure
        'steel-azure': {
          50: '#e8f2fd',
          100: '#d1e5fa',
          200: '#a2ccf6',
          300: '#74b2f1',
          400: '#4599ed',
          500: '#177fe8',
          600: '#1266ba',
          700: '#0e4c8b',
          800: '#09335d',
          900: '#05192e',
          950: '#031220',
        },

        // Pacific Blue
        'pacific-blue': {
          50: '#e7fafd',
          100: '#d0f5fb',
          200: '#a1ecf7',
          300: '#71e2f4',
          400: '#42d9f0',
          500: '#13cfec',
          600: '#0fa6bd',
          700: '#0b7c8e',
          800: '#08535e',
          900: '#04292f',
          950: '#031d21',
        },
      },
    },
  },
  plugins: [],
}
