/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#ccff00', // Lando's signature color
        'dark-bg': '#0a0a0a',
      },
      fontFamily: {
        'mono': ['Space Mono', 'monospace'], // Techy font
      }
    },
  },
  plugins: [],
}