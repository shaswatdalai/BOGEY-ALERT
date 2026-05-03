/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        luxury: {
          dark: '#030305',
          card: 'rgba(10, 10, 15, 0.65)',
          border: 'rgba(255, 255, 255, 0.1)',
          blue: '#00d4ff',
        }
      },
      backgroundImage: {
        'hero-pattern': "url('/bg-statue.png')",
      }
    },
  },
  plugins: [],
}