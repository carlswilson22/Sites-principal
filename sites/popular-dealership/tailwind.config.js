/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0f172a',
          blue: '#2563eb',
          'blue-hover': '#1d4ed8',
          'blue-subtle': '#eff6ff',
          emerald: '#10b981',
          amber: '#f59e0b',
        },
        prime: {
          500: '#10b981',
          600: '#059669',
        }
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible Next"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['"Atkinson Hyperlegible Next"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
