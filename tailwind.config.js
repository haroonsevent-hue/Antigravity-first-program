/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#C5A059',
        deepGreen: '#0f392b',
        darkBg: '#081c15', 
        softWhite: '#fdfdfd',
      },
      fontFamily: {
        serif: ['"Cinzel"', 'serif'],
        sans: ['"Montserrat"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}